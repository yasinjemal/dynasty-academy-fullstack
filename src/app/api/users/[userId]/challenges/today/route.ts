import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/users/:userId/challenges/today
 * 
 * Returns today's daily challenges with progress:
 * - Active challenges for today
 * - Progress towards completion
 * - Completed challenges
 * - Time remaining until reset
 * - XP and coin rewards
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    // Only allow users to see their own challenges
    if (session?.user?.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - You can only view your own challenges" },
        { status: 403 }
      );
    }

    // Get all active challenges
    const allChallenges = await prisma.dailyChallenge.findMany({
      where: { isActive: true },
      orderBy: { difficulty: "asc" },
    });

    // Get today's date (reset at midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user's progress for today
    const userProgress = await prisma.userChallengeProgress.findMany({
      where: {
        userId,
        date: today,
      },
      include: {
        challenge: true,
      },
    });

    // Create progress map
    const progressMap = new Map(
      userProgress.map(up => [up.challengeId, up])
    );

    // Combine challenges with progress
    const challengesWithProgress = allChallenges.map(challenge => {
      const progress = progressMap.get(challenge.id);

      return {
        id: challenge.id,
        key: challenge.key,
        name: challenge.name,
        description: challenge.description,
        type: challenge.type,
        target: challenge.target,
        difficulty: challenge.difficulty,
        xpReward: challenge.xpReward,
        coinReward: challenge.coinReward,
        icon: challenge.icon,
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
        claimed: !!progress?.claimedAt,
        claimedAt: progress?.claimedAt,
        progressPercent: progress
          ? Math.min(Math.round((progress.progress / challenge.target) * 100), 100)
          : 0,
      };
    });

    // Calculate time until reset (midnight)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const timeUntilReset = tomorrow.getTime() - Date.now();
    const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    // Calculate completion stats
    const completed = challengesWithProgress.filter(c => c.completed).length;
    const total = challengesWithProgress.length;
    const completionPercent = Math.round((completed / total) * 100);

    // Check for perfect day bonus (all challenges completed)
    const isPerfectDay = completed === total && total > 0;

    return NextResponse.json({
      challenges: challengesWithProgress,
      stats: {
        completed,
        total,
        completionPercent,
        isPerfectDay,
      },
      reset: {
        timeUntilReset,
        hoursUntilReset,
        minutesUntilReset,
        resetTime: tomorrow.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error fetching daily challenges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/:userId/challenges/:challengeId/claim
 * 
 * Claim rewards for a completed challenge
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { challengeId } = body;

    // Only allow users to claim their own rewards
    if (session?.user?.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get challenge progress
    const progress = await prisma.userChallengeProgress.findUnique({
      where: {
        userId_challengeId_date: {
          userId,
          challengeId,
          date: today,
        },
      },
      include: {
        challenge: true,
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Challenge progress not found" },
        { status: 404 }
      );
    }

    if (!progress.completed) {
      return NextResponse.json(
        { error: "Challenge not completed yet" },
        { status: 400 }
      );
    }

    if (progress.claimedAt) {
      return NextResponse.json(
        { error: "Rewards already claimed" },
        { status: 400 }
      );
    }

    // Claim rewards in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark as claimed
      const updatedProgress = await tx.userChallengeProgress.update({
        where: {
          userId_challengeId_date: {
            userId,
            challengeId,
            date: today,
          },
        },
        data: {
          claimedAt: new Date(),
        },
      });

      // Award Dynasty Score (XP)
      await tx.user.update({
        where: { id: userId },
        data: {
          dynastyScore: {
            increment: progress.challenge.xpReward,
          },
        },
      });

      // Award coins if any
      if (progress.challenge.coinReward > 0) {
        await tx.userCoins.upsert({
          where: { userId },
          create: {
            userId,
            balance: progress.challenge.coinReward,
            earned: progress.challenge.coinReward,
          },
          update: {
            balance: {
              increment: progress.challenge.coinReward,
            },
            earned: {
              increment: progress.challenge.coinReward,
            },
          },
        });
      }

      return updatedProgress;
    });

    return NextResponse.json({
      success: true,
      message: "Rewards claimed successfully!",
      rewards: {
        xp: progress.challenge.xpReward,
        coins: progress.challenge.coinReward,
      },
      claimedAt: result.claimedAt,
    });

  } catch (error) {
    console.error("Error claiming challenge rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
