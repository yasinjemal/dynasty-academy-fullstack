import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  awardXP,
  calculateLevel,
  calculateLevelProgress,
  getLeaderboard,
  getUserRank,
} from "@/lib/engagement/gamification";

/**
 * POST /api/engagement/xp
 * Award XP to user for completing an action
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, multiplier = 1 } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Award XP
    const result = await awardXP(session.user.id, action, multiplier);

    // Get updated progress
    const progress = calculateLevelProgress(result.newXP);

    return NextResponse.json({
      success: true,
      ...result,
      progress,
      message: result.leveledUp
        ? `🎉 Level up! You're now ${result.newLevel.title}!`
        : `+${result.newXP} XP earned!`,
    });
  } catch (error) {
    console.error("Error awarding XP:", error);
    return NextResponse.json(
      {
        error: "Failed to award XP",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/engagement/xp?userId=xxx
 * Get user's XP and level info
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Only allow viewing own XP or admin viewing any
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
      },
    });

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get streak data
    let streak = await (prisma as any).streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // Create initial streak
      streak = await (prisma as any).streak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date(),
          freezesAvailable: 0,
          milestones: [],
        },
      });
    }

    // Get recent XP activity from notifications
    const recentActivity = await prisma.notification.findMany({
      where: {
        userId,
        type: "SYSTEM",
        message: {
          contains: "XP",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        message: true,
        createdAt: true,
      },
    });

    await prisma.$disconnect();

    const currentXP = (user as any).xp || 0;
    const progress = calculateLevelProgress(currentXP);
    const rank = await getUserRank(userId);

    // Parse XP from notification messages
    const recentXP = recentActivity.map((activity: any) => {
      const xpMatch = activity.message.match(/\+(\d+)\s*XP/i);
      const actionMatch = activity.message.match(
        /earned.*?for\s+(.+?)(?:\.|!|$)/i
      );
      return {
        action: actionMatch ? actionMatch[1] : "activity",
        xp: xpMatch ? parseInt(xpMatch[1]) : 0,
        date: activity.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      xp: currentXP,
      level: progress.currentLevel.level,
      levelInfo: {
        ...progress.currentLevel,
        minXP: progress.currentLevel.xpRequired,
        maxXP: progress.nextLevel
          ? progress.nextLevel.xpRequired
          : progress.currentLevel.xpRequired,
      },
      progress: {
        current: progress.progressXP,
        needed: progress.requiredXP,
        percentage: progress.progressPercentage,
      },
      rank: {
        position: rank.rank,
        totalUsers: rank.totalUsers,
        percentile: rank.percentile,
      },
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActivityDate: streak.lastActivityDate.toISOString(),
        freezesAvailable: streak.freezesAvailable,
        milestones: streak.milestones,
      },
      recentXP,
    });
  } catch (error) {
    console.error("Error fetching XP:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch XP",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
