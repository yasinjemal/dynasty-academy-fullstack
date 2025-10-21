import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// XP required for each level (exponential growth)
function getXPForLevel(level: number): number {
  return Math.floor(1000 * Math.pow(1.5, level - 1));
}

// Get user title based on level
function getUserTitle(level: number): string {
  if (level >= 100) return "🔱 Dynasty Emperor";
  if (level >= 76) return "👑 Diamond Dynasty";
  if (level >= 51) return "💎 Platinum Dynasty";
  if (level >= 26) return "🥇 Gold Dynasty";
  if (level >= 11) return "🥈 Silver Dynasty";
  if (level >= 6) return "🥉 Bronze Dynasty";
  return "🌟 Rising Dynasty";
}

// Calculate rewards for leveling up
function getLevelRewards(level: number): string[] {
  const rewards: string[] = [];

  if (level % 10 === 0) {
    rewards.push(`Special badge: Level ${level} Master`);
    rewards.push(`+500 bonus Dynasty Points`);
  }

  if (level === 5) rewards.push("Unlocked: Profile customization");
  if (level === 10) rewards.push("Unlocked: Advanced features");
  if (level === 25) rewards.push("Unlocked: Premium content access");
  if (level === 50) rewards.push("Unlocked: Mentor status");
  if (level === 100) rewards.push("👑 Emperor Crown & Special Title");

  return rewards;
}

// POST /api/gamification/award-xp
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, reason } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid XP amount" }, { status: 400 });
    }

    // Get current user stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dynastyScore: true, level: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentXP = user.dynastyScore || 0;
    const currentLevel = user.level || 1;
    const newXP = currentXP + amount;

    // Calculate new level
    let newLevel = currentLevel;
    let nextLevelXP = getXPForLevel(currentLevel + 1);
    let leveledUp = false;
    const levelsGained: number[] = [];

    // Check if leveled up (possibly multiple times)
    while (newXP >= nextLevelXP) {
      newLevel++;
      levelsGained.push(newLevel);
      nextLevelXP = getXPForLevel(newLevel + 1);
      leveledUp = true;
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dynastyScore: newXP,
        level: newLevel,
      },
    });

    // Log the XP gain in Dynasty Activities
    await prisma.dynastyActivity.create({
      data: {
        userId: session.user.id,
        action: "xp_gained",
        points: amount,
        metadata: {
          reason,
          previousXP: currentXP,
          newXP,
          previousLevel: currentLevel,
          newLevel,
          leveledUp,
        },
      },
    });

    // If leveled up, create notifications and check for achievements
    if (leveledUp) {
      const rewards = getLevelRewards(newLevel);

      // Create notification
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "SYSTEM",
          title: `🎉 Level Up! You're now Level ${newLevel}!`,
          message: `You've reached ${getUserTitle(newLevel)}! ${
            rewards.length > 0 ? rewards[0] : ""
          }`,
        },
      });

      // Award bonus XP for milestone levels
      if (newLevel % 10 === 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            dynastyScore: { increment: 500 },
          },
        });
      }

      // Check for level-based achievements
      const levelAchievements = [
        { level: 5, key: "level_5_warrior" },
        { level: 10, key: "level_10_master" },
        { level: 25, key: "level_25_champion" },
        { level: 50, key: "level_50_legend" },
        { level: 100, key: "level_100_emperor" },
      ];

      for (const achievement of levelAchievements) {
        if (newLevel === achievement.level) {
          // Auto-unlock achievement
          const achiev = await prisma.achievement.findUnique({
            where: { key: achievement.key },
          });

          if (achiev) {
            const existing = await prisma.userAchievement.findUnique({
              where: {
                userId_achievementId: {
                  userId: session.user.id,
                  achievementId: achiev.id,
                },
              },
            });

            if (!existing) {
              await prisma.userAchievement.create({
                data: {
                  userId: session.user.id,
                  achievementId: achiev.id,
                },
              });
            }
          }
        }
      }
    }

    const newTitle = getUserTitle(newLevel);
    const xpForCurrentLevel = getXPForLevel(newLevel);
    const xpForNextLevel = getXPForLevel(newLevel + 1);

    return NextResponse.json({
      success: true,
      xpGained: amount,
      totalXP: newXP,
      level: newLevel,
      leveledUp,
      levelsGained,
      newLevel: leveledUp ? newLevel : undefined,
      previousLevel: leveledUp ? currentLevel : undefined,
      newTitle: leveledUp ? newTitle : undefined,
      xpToNextLevel: xpForNextLevel,
      xpCurrentLevel: xpForCurrentLevel,
      rewards: leveledUp ? getLevelRewards(newLevel) : [],
      reason,
    });
  } catch (error) {
    console.error("[Award XP] Error:", error);
    return NextResponse.json({ error: "Failed to award XP" }, { status: 500 });
  }
}
