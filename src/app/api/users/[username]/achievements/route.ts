import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cleanUsername = username.replace("@", "");
    const session = await getServerSession(authOptions);

    // Find user
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
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
            key: true,
            name: true,
            description: true,
            icon: true,
            rarity: true,
            category: true,
            requirement: true,
            dynastyPoints: true,
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
          key: true,
          name: true,
          description: true,
          icon: true,
          rarity: true,
          category: true,
          requirement: true,
          dynastyPoints: true,
        },
        orderBy: {
          tier: "desc",
        },
      });

      lockedAchievements = allAchievements.map((achievement) => ({
        id: achievement.id,
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        locked: true,
        progressPercent: 0, // TODO: Calculate real progress based on category
      }));
    }

    const unlocked = userAchievements.map((ua) => ({
      id: ua.achievement.id,
      key: ua.achievement.key,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      rarity: ua.achievement.rarity,
      unlockedAt: ua.awardedAt.toISOString(),
    }));

    const locked = lockedAchievements;

    // Calculate rarity breakdown
    const rarityCount = unlocked.reduce((acc, a) => {
      acc[a.rarity.toLowerCase()] = (acc[a.rarity.toLowerCase()] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      achievements: { unlocked, locked },
      total: unlocked.length + locked.length,
      completionPercent: Math.round(
        (unlocked.length / (unlocked.length + locked.length)) * 100
      ),
      rarityBreakdown: rarityCount,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
