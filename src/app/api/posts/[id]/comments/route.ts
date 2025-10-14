import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { grantDynastyScore } from "@/lib/dynasty-score";
import { calculateHotScore } from "@/lib/hot-score";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  parentId: z.string().optional().nullable(),
});

const listCommentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  parentId: z.string().optional().nullable(),
});

/**
 * POST /api/posts/[id]/comments
 * Create a comment on a post
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to comment" },
        { status: 401 }
      );
    }

    const { id: postId } = await params;
    const body = await req.json();
    const { content, parentId } = createCommentSchema.parse(body);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        commentCount: true,
        likeCount: true,
        viewCount: true,
        publishedAt: true,
        title: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If parentId provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.postComment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true, authorId: true },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    // Determine if this is user's first comment (for FIRST_COMMENT bonus)
    const isFirstComment =
      !parentId &&
      (await prisma.postComment.count({
        where: {
          authorId: session.user.id,
          postId,
        },
      })) === 0;

    // Create comment, update counters, send notifications
    const result = await prisma.$transaction(
      async (tx) => {
        // Create the comment
        const comment = await tx.postComment.create({
          data: {
            authorId: session.user.id,
            postId,
            parentId,
            content,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
                level: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
        });

        // Increment comment count on post (only for top-level comments)
        if (!parentId) {
          const updatedPost = await tx.post.update({
            where: { id: postId },
            data: {
              commentCount: {
                increment: 1,
              },
            },
          });

          // Recalculate and update hot score
          if (post.publishedAt) {
            const newHotScore = calculateHotScore({
              likes: post.likeCount,
              comments: updatedPost.commentCount,
              views: post.viewCount,
              publishedAt: post.publishedAt,
            });

            await tx.post.update({
              where: { id: postId },
              data: { hotScore: newHotScore },
            });

            // Update feed item hot score
            await tx.feedItem.updateMany({
              where: { postId },
              data: { hotScore: newHotScore },
            });
          }
        }

        // Create notification for post author
        if (post.authorId !== session.user.id) {
          await tx.notification.create({
            data: {
              userId: post.authorId,
              actorId: session.user.id,
              type: "COMMENT",
              entityType: "POST",
              entityId: postId,
              title: "New Comment",
              message: `${session.user.name} commented on your post`,
              seen: false,
            },
          });
        }

        // If replying to a comment, notify the parent comment author
        if (parentId) {
          const parentComment = await tx.postComment.findUnique({
            where: { id: parentId },
            select: { authorId: true },
          });

          if (parentComment && parentComment.authorId !== session.user.id) {
            await tx.notification.create({
              data: {
                userId: parentComment.authorId,
                actorId: session.user.id,
                type: "REPLY",
                entityType: "POST_COMMENT",
                entityId: comment.id,
                title: "New Reply",
                message: `${session.user.name} replied to your comment`,
                seen: false,
              },
            });
          }
        }

        return comment;
      },
      {
        timeout: 10000, // 10 second timeout
      }
    );

    // Award Dynasty Score OUTSIDE transaction to avoid conflicts
    const dsAction = isFirstComment ? "FIRST_COMMENT" : "COMMENT";
    const dsPoints = isFirstComment ? 3 : 2;

    await grantDynastyScore({
      userId: session.user.id,
      action: dsAction,
      points: dsPoints,
      entityType: "POST_COMMENT",
      entityId: result.id,
      metadata: {
        postId,
        postTitle: post.title,
      },
    });

    // Award Dynasty Score to post author for receiving comment
    if (post.authorId !== session.user.id) {
      await grantDynastyScore({
        userId: post.authorId,
        action: "COMMENT_RECEIVED",
        points: 4,
        entityType: "POST_COMMENT",
        entityId: result.id,
        metadata: {
          commentedBy: session.user.id,
          commentedByName: session.user.name,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        comment: result,
        message: `Comment posted! +${dsPoints} Dynasty Score`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts/[id]/comments
 * List comments for a post
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const { page, limit, parentId } = listCommentsSchema.parse(queryParams);

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      postId,
      parentId: parentId || null, // null = top-level comments
    };

    // Fetch comments and total count
    const [comments, total] = await Promise.all([
      prisma.postComment.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
              level: true,
              isMentor: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      prisma.postComment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
