import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { grantDynastyScore } from "@/lib/dynasty-score";
import { calculateHotScore } from "@/lib/hot-score";

// Validation schemas
const createReflectionSchema = z.object({
  bookId: z.string(),
  bookTitle: z.string().min(1).max(200),
  pageNumber: z.number().int().positive().optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z
    .string()
    .min(10, "Reflection must be at least 10 characters")
    .max(5000),
});

const listReflectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  bookId: z.string().optional(),
  authorId: z.string().optional(),
  sortBy: z.enum(["hot", "latest", "popular"]).default("hot"),
});

type CreateReflectionInput = z.infer<typeof createReflectionSchema>;
type ListReflectionsInput = z.infer<typeof listReflectionsSchema>;

/**
 * POST /api/reflections
 * Create a new reflection on a book
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to write reflections" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createReflectionSchema.parse(body);

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: validatedData.bookId },
      select: { id: true, title: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Calculate initial hot score
    const publishedAt = new Date();
    const hotScore = calculateHotScore({
      likes: 0,
      comments: 0,
      views: 0,
      publishedAt,
    });

    // Create reflection, feed item, and award Dynasty Score in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the reflection
      const reflection = await tx.reflection.create({
        data: {
          authorId: session.user.id,
          bookId: validatedData.bookId,
          bookTitle: validatedData.bookTitle,
          pageNumber: validatedData.pageNumber,
          excerpt: validatedData.excerpt,
          content: validatedData.content,
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
          book: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              slug: true,
            },
          },
        },
      });

      // Create feed item
      await tx.feedItem.create({
        data: {
          type: "REFLECTION",
          reflectionId: reflection.id,
          authorId: session.user.id,
          publishedAt,
          hotScore,
          tags: [], // Reflections inherit book tags if needed
        },
      });

      // Award Dynasty Score for writing a reflection (higher than post)
      await grantDynastyScore({
        userId: session.user.id,
        action: "WRITE_REFLECTION",
        points: 12,
        entityType: "REFLECTION",
        entityId: reflection.id,
        metadata: {
          bookId: reflection.bookId,
          bookTitle: reflection.bookTitle,
        },
      });

      return reflection;
    });

    return NextResponse.json(
      {
        success: true,
        reflection: result,
        message: "Reflection published successfully! +12 Dynasty Score",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reflection:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create reflection" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reflections
 * List reflections with filtering, sorting, and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const { page, limit, bookId, authorId, sortBy } =
      listReflectionsSchema.parse(params);

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (bookId) {
      where.bookId = bookId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "hot":
        orderBy = { hotScore: "desc" };
        break;
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "popular":
        orderBy = [{ likeCount: "desc" }, { commentCount: "desc" }];
        break;
    }

    // Fetch reflections and total count in parallel
    const [reflections, total] = await Promise.all([
      prisma.reflection.findMany({
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
          book: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              slug: true,
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
      prisma.reflection.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      reflections,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching reflections:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch reflections" },
      { status: 500 }
    );
  }
}
