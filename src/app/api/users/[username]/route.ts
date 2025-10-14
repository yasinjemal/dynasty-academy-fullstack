import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const session = await getServerSession(authOptions);

    // Check for username redirect
    const redirect = await prisma.usernameRedirect.findUnique({
      where: { from: username },
    });

    if (redirect && redirect.expiresAt > new Date()) {
      return NextResponse.json({ redirect: redirect.to }, { status: 301 });
    }

    // Fetch user with profile data
    const user = await prisma.user.findUnique({
      where: { username },
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
        dmOpen: true,
        isBanned: true,
        isSuspended: true,
        createdAt: true,
        currentBookId: true,
        currentPage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is banned/suspended
    if (user.isBanned || user.isSuspended) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check privacy
    const isOwner = session?.user?.id === user.id;
    const isFollowing = session?.user?.id
      ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
        })
      : null;

    if (user.isPrivate && !isOwner && !isFollowing) {
      return NextResponse.json(
        {
          user: {
            username: user.username,
            name: user.name,
            image: user.image,
            bannerImage: user.bannerImage,
            bio: user.bio,
            isPrivate: true,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
          },
          isPrivate: true,
        },
        { status: 200 }
      );
    }

    // Fetch highlights (latest content)
    const [posts, reflections, collections, achievements] = await Promise.all([
      prisma.post.findMany({
        where: { userId: user.id, published: true },
        take: 3,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          likesCount: true,
          commentsCount: true,
        },
      }),
      prisma.reflection.findMany({
        where: { userId: user.id },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          bookId: true,
          page: true,
          createdAt: true,
          likesCount: true,
          commentsCount: true,
          book: {
            select: {
              title: true,
              coverImage: true,
              slug: true,
            },
          },
        },
      }),
      prisma.collection.findMany({
        where: { userId: user.id, isPublic: true },
        take: 3,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          itemCount: true,
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId: user.id },
        take: 6,
        orderBy: { awardedAt: "desc" },
        select: {
          id: true,
          awardedAt: true,
          achievement: {
            select: {
              slug: true,
              title: true,
              name: true,
              description: true,
              icon: true,
              tier: true,
              rarity: true,
            },
          },
        },
      }),
    ]);

    // Get current book if exists
    let currentBook = null;
    if (user.currentBookId) {
      currentBook = await prisma.book.findUnique({
        where: { id: user.currentBookId },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          total_pages: true,
        },
      });
    }

    // Check if viewer follows this user
    const viewerFollows = session?.user?.id
      ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
        })
      : null;

    const response = {
      user: {
        username: user.username,
        name: user.name,
        image: user.image,
        bannerImage: user.bannerImage,
        bio: user.bio,
        location: user.location,
        links: {
          website: user.website,
          x: user.xHandle,
          instagram: user.instagram,
          youtube: user.youtube,
        },
        role: user.role,
        gamification: {
          dynastyScore: user.dynastyScore,
          level: user.level,
          streakDays: user.streakDays,
        },
        reading: {
          minutesLifetime: user.readingMinutesLifetime,
          booksCompleted: user.booksCompleted,
          currentBook,
          currentPage: user.currentPage,
        },
        counts: {
          followers: user.followersCount,
          following: user.followingCount,
          thanks: user.thanksReceived,
        },
        preferences: {
          theme: user.profileTheme,
          dmOpen: user.dmOpen,
        },
        createdAt: user.createdAt,
      },
      highlights: {
        posts,
        reflections,
        collections,
        achievements: achievements.map((ua) => ({
          ...ua.achievement,
          awardedAt: ua.awardedAt,
        })),
      },
      viewerContext: {
        isOwner,
        isFollowing: !!viewerFollows,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
