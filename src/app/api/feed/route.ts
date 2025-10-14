import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const feedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  tab: z.enum(["hot", "following", "topic"]).default("hot"),
  topic: z.string().optional(), // For topic tab
  type: z.enum(["all", "posts", "reflections"]).default("all"),
});

type FeedQuery = z.infer<typeof feedQuerySchema>;

/**
 * GET /api/feed
 * Get unified feed of posts and reflections
 * Tabs: Hot (default), Following (users you follow), Topic (specific tag/category)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const { page, limit, tab, topic, type } = feedQuerySchema.parse(params);

    const skip = (page - 1) * limit;
    const session = await getServerSession(authOptions);

    // Build where clause based on tab
    const where: any = {};

    switch (tab) {
      case "hot":
        // No additional filters - show all content ranked by hot score
        break;

      case "following":
        if (!session?.user?.id) {
          return NextResponse.json(
            {
              error: "Unauthorized - Please sign in to see your following feed",
            },
            { status: 401 }
          );
        }

        // Get list of users the current user is following
        const followedUsers = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            following: {
              select: {
                followingId: true,
              },
            },
          },
        });

        const followedUserIds =
          followedUsers?.following.map((f) => f.followingId) || [];

        if (followedUserIds.length === 0) {
          // User follows nobody - return empty feed
          return NextResponse.json({
            success: true,
            feedItems: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasMore: false,
            },
          });
        }

        where.authorId = {
          in: followedUserIds,
        };
        break;

      case "topic":
        if (!topic) {
          return NextResponse.json(
            { error: "Topic parameter is required for topic tab" },
            { status: 400 }
          );
        }

        where.tags = {
          has: topic,
        };
        break;
    }

    // Filter by content type if specified
    if (type !== "all") {
      where.type = type === "posts" ? "POST" : "REFLECTION";
    }

    // Fetch feed items
    const [feedItems, total] = await Promise.all([
      prisma.feedItem.findMany({
        where,
        orderBy: {
          hotScore: "desc", // Always rank by hot score
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
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              coverImage: true,
              tags: true,
              likeCount: true,
              commentCount: true,
              viewCount: true,
              publishedAt: true,
            },
          },
          reflection: {
            select: {
              id: true,
              bookId: true,
              bookTitle: true,
              pageNumber: true,
              excerpt: true,
              content: true,
              likeCount: true,
              commentCount: true,
              createdAt: true,
              book: {
                select: {
                  id: true,
                  title: true,
                  coverImage: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      prisma.feedItem.count({ where }),
    ]);

    // If user is authenticated, check which items they've liked
    let likedItems: Set<string> = new Set();

    if (session?.user?.id) {
      const postIds = feedItems
        .filter((item) => item.type === "POST" && item.postId)
        .map((item) => item.postId!);

      const reflectionIds = feedItems
        .filter((item) => item.type === "REFLECTION" && item.reflectionId)
        .map((item) => item.reflectionId!);

      const [postLikes, reflectionLikes] = await Promise.all([
        prisma.postLike.findMany({
          where: {
            userId: session.user.id,
            postId: { in: postIds },
          },
          select: { postId: true },
        }),
        prisma.reflectionLike.findMany({
          where: {
            userId: session.user.id,
            reflectionId: { in: reflectionIds },
          },
          select: { reflectionId: true },
        }),
      ]);

      postLikes.forEach((like) => likedItems.add(like.postId));
      reflectionLikes.forEach((like) => likedItems.add(like.reflectionId));
    }

    // Transform feed items to include hasLiked flag
    const enrichedFeedItems = feedItems.map((item) => {
      const itemId = item.type === "POST" ? item.postId : item.reflectionId;
      return {
        ...item,
        hasLiked: itemId ? likedItems.has(itemId) : false,
      };
    });

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      feedItems: enrichedFeedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching feed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
