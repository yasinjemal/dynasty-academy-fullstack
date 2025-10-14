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

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        isPrivate: true,
        isBanned: true,
        isSuspended: true,
      },
    });

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
          { error: "This profile is private" },
          { status: 403 }
        );
      }
    }

    // Fetch user achievements
    const userAchievements = await prisma.userAchievement.findMany({
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
    });

    // If owner, also show locked achievements with progress
    let lockedAchievements: any[] = [];
    if (isOwner) {
      const earnedAchievementIds = userAchievements.map(
        (ua) => ua.achievementId
      );

      const allAchievements = await prisma.achievement.findMany({
        where: {
          id: {
            notIn: earnedAchievementIds,
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          tier: true,
          iconUrl: true,
        },
        orderBy: {
          tier: "desc",
        },
      });

      lockedAchievements = allAchievements.map((achievement) => ({
        id: achievement.id,
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description,
        tier: achievement.tier,
        iconUrl: achievement.iconUrl,
        locked: true,
        progress: Math.floor(Math.random() * 80), // TODO: Calculate real progress
      }));
    }

    const achievements = [
      ...userAchievements.map((ua) => ({
        id: ua.achievement.id,
        slug: ua.achievement.slug,
        title: ua.achievement.title,
        description: ua.achievement.description,
        tier: ua.achievement.tier,
        iconUrl: ua.achievement.iconUrl,
        awardedAt: ua.awardedAt.toISOString(),
        locked: false,
      })),
      ...lockedAchievements,
    ];

    return NextResponse.json({
      achievements,
      stats: {
        total: userAchievements.length,
        elite: userAchievements.filter((ua) => ua.achievement.tier === "ELITE")
          .length,
        gold: userAchievements.filter((ua) => ua.achievement.tier === "GOLD")
          .length,
        silver: userAchievements.filter(
          (ua) => ua.achievement.tier === "SILVER"
        ).length,
        bronze: userAchievements.filter(
          (ua) => ua.achievement.tier === "BRONZE"
        ).length,
      },
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
