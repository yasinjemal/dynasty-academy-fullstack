import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username.replace("@", "");
    const session = await getServerSession(authOptions);

    // Find user by username or redirect
    let user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        isPrivate: true,
        isBanned: true,
        isSuspended: true,
        readingMinutesLifetime: true,
        booksCompleted: true,
        currentStreak: true,
        currentBookId: true,
        currentPage: true,
      },
    });

    // Check for username redirect
    if (!user) {
      const redirect = await prisma.usernameRedirect.findFirst({
        where: {
          from: username,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              isPrivate: true,
              isBanned: true,
              isSuspended: true,
              readingMinutesLifetime: true,
              booksCompleted: true,
              currentStreak: true,
              currentBookId: true,
              currentPage: true,
            },
          },
        },
      });

      if (redirect?.user) {
        user = redirect.user;
      }
    }

    if (!user || user.isBanned || user.isSuspended) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isOwner = session?.user?.id === user.id;
    const viewerId = session?.user?.id;

    // Privacy check
    if (user.isPrivate && !isOwner) {
      const isFollowing = viewerId
        ? await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: user.id,
              },
            },
          })
        : null;

      if (!isFollowing) {
        return NextResponse.json(
          {
            readingStats: {
              booksCompleted: user.booksCompleted,
              readingMinutesLifetime: user.readingMinutesLifetime,
              currentStreak: user.currentStreak,
            },
            recentPosts: [],
            recentReflections: [],
            topAchievements: [],
          },
          { status: 200 }
        );
      }
    }

    // Fetch current book if exists
    let currentBook = null;
    if (user.currentBookId) {
      currentBook = await prisma.book.findUnique({
        where: { id: user.currentBookId },
        select: {
          id: true,
          title: true,
          coverImage: true,
          totalPages: true,
        },
      });
    }

    // Fetch recent posts
    const recentPosts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        likesCount: true,
        commentsCount: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Fetch recent reflections
    const recentReflections = await prisma.reflection.findMany({
      where: {
        userId: user.id,
        isPrivate: false,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Fetch top achievements
    const topAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: user.id,
      },
      include: {
        achievement: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            tier: true,
            iconUrl: true,
          },
        },
      },
      orderBy: [
        {
          achievement: {
            tier: "desc",
          },
        },
        { awardedAt: "desc" },
      ],
      take: 6,
    });

    return NextResponse.json({
      readingStats: {
        booksCompleted: user.booksCompleted,
        readingMinutesLifetime: user.readingMinutesLifetime,
        currentStreak: user.currentStreak,
        currentBook: currentBook
          ? {
              id: currentBook.id,
              title: currentBook.title,
              coverImage: currentBook.coverImage,
              currentPage: user.currentPage || 0,
              totalPages: currentBook.totalPages || 0,
            }
          : null,
      },
      recentPosts: recentPosts.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
      })),
      recentReflections: recentReflections.map((ref) => ({
        id: ref.id,
        content: ref.content,
        createdAt: ref.createdAt.toISOString(),
        book: ref.book,
      })),
      topAchievements: topAchievements.map((ua) => ({
        id: ua.achievement.id,
        slug: ua.achievement.slug,
        title: ua.achievement.title,
        description: ua.achievement.description,
        tier: ua.achievement.tier,
        iconUrl: ua.achievement.iconUrl,
      })),
    });
  } catch (error) {
    console.error("Error fetching profile overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 }
    );
  }
}
