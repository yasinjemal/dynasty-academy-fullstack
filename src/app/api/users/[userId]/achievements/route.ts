import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/users/:userId/achievements
 * 
 * Returns user's achievement progress:
 * - Unlocked achievements with unlock dates
 * - Locked achievements with progress %
 * - Total achievements available
 * - Completion percentage
 * - Rarity breakdown (common, rare, epic, legendary)
 * 
 * Privacy: Respects user's privacy settings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        isPrivate: true,
        booksCompleted: true,
        readingMinutesLifetime: true,
        streakDays: true,
        dynastyScore: true,
        followersCount: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Privacy check
    const isOwnProfile = session?.user?.id === userId;
    const isFollowing = session?.user?.id
      ? await prisma.follow.findFirst({
          where: {
            followerId: session.user.id,
            followingId: userId,
          },
        })
      : null;

    if (user.isPrivate && !isOwnProfile && !isFollowing) {
      return NextResponse.json(
        { error: "This profile is private" },
        { status: 403 }
      );
    }

    // Get all available achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [
        { rarity: "desc" },
        { dynastyPoints: "desc" },
      ],
    });

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: "desc" },
    });

    // Create a map of unlocked achievements
    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua])
    );

    // Calculate progress for each achievement based on current user stats
    const achievementsWithProgress = allAchievements.map(achievement => {
      const userAchievement = unlockedMap.get(achievement.id);
      const isUnlocked = !!userAchievement;

      // Calculate progress based on achievement category
      let currentProgress = 0;
      let progressPercent = 0;

      if (!isUnlocked) {
        switch (achievement.category) {
          case "reading":
            if (achievement.key.includes("books")) {
              currentProgress = user.booksCompleted;
            } else if (achievement.key.includes("minutes") || achievement.key.includes("time")) {
              currentProgress = user.readingMinutesLifetime;
            }
            break;
          case "streak":
            currentProgress = user.streakDays;
            break;
          case "social":
            if (achievement.key.includes("followers")) {
              currentProgress = user.followersCount;
            }
            break;
          case "score":
            currentProgress = user.dynastyScore;
            break;
        }

        progressPercent = Math.min(
          Math.round((currentProgress / achievement.requirement) * 100),
          100
        );
      } else {
        currentProgress = achievement.requirement;
        progressPercent = 100;
      }

      return {
        id: achievement.id,
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        category: achievement.category,
        requirement: achievement.requirement,
        dynastyPoints: achievement.dynastyPoints,
        isUnlocked,
        unlockedAt: userAchievement?.unlockedAt || null,
        progress: currentProgress,
        progressPercent,
      };
    });

    // Separate unlocked and locked
    const unlocked = achievementsWithProgress.filter(a => a.isUnlocked);
    const locked = achievementsWithProgress.filter(a => !a.isUnlocked);

    // Calculate rarity breakdown
    const rarityBreakdown = {
      common: unlocked.filter(a => a.rarity === "COMMON").length,
      rare: unlocked.filter(a => a.rarity === "RARE").length,
      epic: unlocked.filter(a => a.rarity === "EPIC").length,
      legendary: unlocked.filter(a => a.rarity === "LEGENDARY").length,
    };

    // Calculate completion percentage
    const completionPercent = Math.round(
      (unlocked.length / allAchievements.length) * 100
    );

    // Get next achievements to unlock (closest to completion)
    const nextToUnlock = locked
      .filter(a => a.progressPercent > 0)
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .slice(0, 3);

    return NextResponse.json({
      total: allAchievements.length,
      unlocked: unlocked.length,
      locked: locked.length,
      completionPercent,
      rarityBreakdown,
      achievements: {
        unlocked: unlocked.sort((a, b) => {
          // Sort by rarity first, then by unlock date
          const rarityOrder = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
          const rarityDiff = (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - 
                           (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
          if (rarityDiff !== 0) return rarityDiff;
          return new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime();
        }),
        locked: locked.sort((a, b) => b.progressPercent - a.progressPercent),
      },
      nextToUnlock,
    });

  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
