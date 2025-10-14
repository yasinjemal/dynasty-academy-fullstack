import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { grantDynastyScore } from "@/lib/dynasty-score";
import { calculateHotScore } from "@/lib/hot-score";

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().url().optional().nullable(),
  tags: z.array(z.string().min(1).max(30)).max(5).default([]),
  published: z.boolean().default(false),
});

const listPostsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  authorId: z.string().optional(),
  tag: z.string().optional(),
  published: z.coerce.boolean().default(true),
  sortBy: z.enum(["hot", "latest", "popular"]).default("hot"),
});

type CreatePostInput = z.infer<typeof createPostSchema>;
type ListPostsInput = z.infer<typeof listPostsSchema>;

/**
 * POST /api/posts
 * Create a new post and award Dynasty Score
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to create posts" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createPostSchema.parse(body);

    // Generate unique slug from title
    const baseSlug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create excerpt if not provided
    const excerpt =
      validatedData.excerpt || validatedData.content.substring(0, 200) + "...";

    // Calculate initial hot score
    const publishedAt = validatedData.published ? new Date() : null;
    const hotScore = validatedData.published
      ? calculateHotScore({
          likes: 0,
          comments: 0,
          views: 0,
          publishedAt: publishedAt!,
        })
      : 0;

    // Create post, feed item, and award Dynasty Score in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the post
      const post = await tx.post.create({
        data: {
          authorId: session.user.id,
          title: validatedData.title,
          slug,
          content: validatedData.content,
          excerpt,
          coverImage: validatedData.coverImage,
          tags: validatedData.tags,
          published: validatedData.published,
          publishedAt: publishedAt || undefined,
          hotScore,
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

      // Create feed item if published
      if (validatedData.published) {
        await tx.feedItem.create({
          data: {
            type: "POST",
            postId: post.id,
            authorId: session.user.id,
            publishedAt: publishedAt!,
            hotScore,
            tags: validatedData.tags,
          },
        });

        // Award Dynasty Score for creating a post
        await grantDynastyScore({
          userId: session.user.id,
          action: "CREATE_POST",
          points: 10,
          entityType: "POST",
          entityId: post.id,
          metadata: {
            postTitle: post.title,
            postSlug: post.slug,
          },
        });
      }

      return post;
    });

    return NextResponse.json(
      {
        success: true,
        post: result,
        message: validatedData.published
          ? "Post published successfully! +10 Dynasty Score"
          : "Post saved as draft",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts
 * List posts with filtering, sorting, and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const { page, limit, authorId, tag, published, sortBy } =
      listPostsSchema.parse(params);

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      published,
    };

    if (authorId) {
      where.authorId = authorId;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "hot":
        orderBy = { hotScore: "desc" };
        break;
      case "latest":
        orderBy = { publishedAt: "desc" };
        break;
      case "popular":
        orderBy = [{ likeCount: "desc" }, { commentCount: "desc" }];
        break;
    }

    // Fetch posts and total count in parallel
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
