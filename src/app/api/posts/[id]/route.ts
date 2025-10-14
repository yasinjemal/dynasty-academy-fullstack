import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { calculateHotScore } from "@/lib/hot-score";

const updatePostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().url().optional().nullable(),
  tags: z.array(z.string().min(1).max(30)).max(5).optional(),
  published: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/posts/[id]
 * Get a single post by ID and increment view count
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Increment view count and fetch post in transaction
    const post = await prisma.$transaction(async (tx) => {
      // Increment view count
      await tx.post.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });

      // Fetch updated post with relations
      return tx.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              username: true,
              level: true,
              isMentor: true,
              dynastyScore: true,
            },
          },
          comments: {
            where: {
              parentId: null, // Only top-level comments
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5, // Initial load
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
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has liked this post (if authenticated)
    const session = await getServerSession(authOptions);
    let hasLiked = false;

    if (session?.user?.id) {
      const like = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: id,
          },
        },
      });
      hasLiked = !!like;
    }

    return NextResponse.json({
      success: true,
      post,
      hasLiked,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/posts/[id]
 * Update a post (author only)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const validatedData = updatePostSchema.parse(body);

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true, published: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only edit your own posts" },
        { status: 403 }
      );
    }

    // Handle slug update if title changed
    let slug: string | undefined;
    if (validatedData.title) {
      const baseSlug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Ensure slug uniqueness
      slug = baseSlug;
      let counter = 1;
      while (
        await prisma.post.findFirst({
          where: {
            slug,
            id: { not: id },
          },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Update post and handle publish state change
    const updatedPost = await prisma.$transaction(async (tx) => {
      const wasPublished = existingPost.published;
      const isPublishing = !wasPublished && validatedData.published === true;

      // Update the post
      const post = await tx.post.update({
        where: { id },
        data: {
          ...validatedData,
          ...(slug && { slug }),
          ...(isPublishing && { publishedAt: new Date() }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              username: true,
              level: true,
            },
          },
        },
      });

      // Create feed item if publishing for the first time
      if (isPublishing) {
        const hotScore = calculateHotScore({
          likes: post.likeCount,
          comments: post.commentCount,
          views: post.viewCount,
          publishedAt: post.publishedAt!,
        });

        await tx.feedItem.create({
          data: {
            type: "POST",
            postId: post.id,
            authorId: session.user.id,
            publishedAt: post.publishedAt!,
            hotScore,
            tags: post.tags,
          },
        });

        // Update hot score
        await tx.post.update({
          where: { id },
          data: { hotScore },
        });
      }

      return post;
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: "Post updated successfully",
    });
  } catch (error) {
    console.error("Error updating post:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete a post (author only)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if post exists and user is the author
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own posts" },
        { status: 403 }
      );
    }

    // Delete post (cascade will handle comments, likes, feed items)
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
