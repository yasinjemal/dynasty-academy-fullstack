import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/users/:username/overview
 *
 * Returns comprehensive profile overview data:
 * - User profile & stats (DS, level, streaks, books, reading time)
 * - Role & badges
 * - Current reading activity
 * - Follower/following counts
 * - Privacy settings
 * - Social links
 *
 * Optimized single query for maximum performance.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cleanUsername = username.replace("@", "");
    const session = await getServerSession(authOptions);

    // Find user by username or check for redirect
    let user = await prisma.user.findUnique({
      where: { username: cleanUsername },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bannerImage: true,
        bio: true,
        location: true,
        website: true,
        xHandle: true,
        instagram: true,
        youtube: true,
        role: true,
        dynastyScore: true,
        level: true,
        streakDays: true,
        readingMinutesLifetime: true,
        booksCompleted: true,
        followersCount: true,
        followingCount: true,
        thanksReceived: true,
        profileTheme: true,
        isPrivate: true,
        isBanned: true,
        isSuspended: true,
        dmOpen: true,
        createdAt: true,
        currentBookId: true,
        currentPage: true,
        isPremium: true,
        _count: {
          select: {
            posts: true,
            reflections: true,
            collections: true,
            books: true, // Books authored
          },
        },
      },
    });

    // If user not found, check for username redirect
    if (!user) {
      const redirect = await prisma.usernameRedirect.findUnique({
        where: { from: cleanUsername },
      });

      if (redirect && new Date() < redirect.expiresAt) {
        // Redirect found and still valid
        return NextResponse.json({
          redirect: true,
          to: redirect.to,
          message: "Username has been changed. Redirecting...",
        });
      }

      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is banned/suspended
    if (user.isBanned) {
      return NextResponse.json(
        { error: "This account has been banned" },
        { status: 403 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "This account is temporarily suspended" },
        { status: 403 }
      );
    }

    // Check privacy settings
    const isOwnProfile = session?.user?.id === user.id;
    const isFollowing = session?.user?.id
      ? await prisma.follow.findFirst({
          where: {
            followerId: session.user.id,
            followingId: user.id,
          },
        })
      : null;

    // If private and not own profile and not following, return limited data
    if (user.isPrivate && !isOwnProfile && !isFollowing) {
      return NextResponse.json({
        ...user,
        isPrivate: true,
        limitedProfile: true,
        // Hide sensitive data
        bio: null,
        location: null,
        website: null,
        xHandle: null,
        instagram: null,
        youtube: null,
        currentBookId: null,
        currentPage: null,
        _count: {
          posts: 0,
          reflections: 0,
          collections: 0,
          books: user._count.books, // Keep authored books visible
        },
      });
    }

    // Fetch current reading book if available
    let currentBook = null;
    if (user.currentBookId) {
      currentBook = await prisma.book.findUnique({
        where: { id: user.currentBookId },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          totalPages: true,
        },
      });
    }

    // Calculate reading progress percentage
    const readingProgress =
      currentBook?.totalPages && user.currentPage
        ? Math.round((user.currentPage / currentBook.totalPages) * 100)
        : null;

    // Return comprehensive profile overview
    return NextResponse.json({
      ...user,
      isOwnProfile,
      isFollowing: !!isFollowing,
      currentBook: currentBook
        ? {
            ...currentBook,
            currentPage: user.currentPage,
            progress: readingProgress,
          }
        : null,
      stats: {
        dynastyScore: user.dynastyScore,
        level: user.level,
        streakDays: user.streakDays,
        readingMinutes: user.readingMinutesLifetime,
        booksCompleted: user.booksCompleted,
        followers: user.followersCount,
        following: user.followingCount,
        thanksReceived: user.thanksReceived,
        posts: user._count.posts,
        reflections: user._count.reflections,
        collections: user._count.collections,
        booksAuthored: user._count.books,
      },
    });
  } catch (error) {
    console.error("Error fetching profile overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
