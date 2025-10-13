import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// ============================================
// LEADERBOARDS API
// Competitive listening rankings
// ============================================

// GET /api/listening/leaderboards?period=daily|weekly|monthly|all-time
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all-time";

    // Calculate date range
    const startDate = getStartDate(period);

    // Get top listeners by total minutes
    const topByMinutes = await getTopListeners(
      "minutes",
      startDate,
      session.user.id
    );

    // Get top listeners by streaks
    const topByStreaks = await getTopStreaks(session.user.id);

    // Get top listeners by Dynasty Points
    const topByPoints = await getTopByPoints(session.user.id);

    // Get current user's rank
    const userRank = await getUserRank(session.user.id, period);

    return NextResponse.json({
      period,
      leaderboards: {
        byMinutes: topByMinutes,
        byStreaks: topByStreaks,
        byPoints: topByPoints,
      },
      userRank,
    });
  } catch (error) {
    console.error("[Leaderboards API] Error:", error);
    return NextResponse.json(
      { error: "Failed to load leaderboards" },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStartDate(period: string): Date {
  const now = new Date();

  switch (period) {
    case "daily":
      now.setHours(0, 0, 0, 0);
      return now;

    case "weekly":
      now.setDate(now.getDate() - 7);
      return now;

    case "monthly":
      now.setMonth(now.getMonth() - 1);
      return now;

    case "all-time":
    default:
      return new Date(0); // Unix epoch
  }
}

async function getTopListeners(
  metric: "minutes" | "streaks",
  startDate: Date,
  currentUserId: string
) {
  if (metric === "minutes") {
    // Get listening streaks data
    const streaks = await prisma.listeningStreak.findMany({
      where: {
        lastListenDate: { gte: startDate },
      },
      orderBy: { totalMinutes: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isPremium: true,
          },
        },
      },
    });

    return streaks.map((streak, index) => ({
      rank: index + 1,
      userId: streak.userId,
      name: streak.user.name || "Anonymous",
      image: streak.user.image,
      isPremium: streak.user.isPremium,
      totalMinutes: streak.totalMinutes,
      totalHours: Math.round(streak.totalMinutes / 60),
      isCurrentUser: streak.userId === currentUserId,
    }));
  }

  return [];
}

async function getTopStreaks(currentUserId: string) {
  const streaks = await prisma.listeningStreak.findMany({
    orderBy: { currentStreak: "desc" },
    take: 10,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          isPremium: true,
        },
      },
    },
  });

  return streaks.map((streak, index) => ({
    rank: index + 1,
    userId: streak.userId,
    name: streak.user.name || "Anonymous",
    image: streak.user.image,
    isPremium: streak.user.isPremium,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    isCurrentUser: streak.userId === currentUserId,
  }));
}

async function getTopByPoints(currentUserId: string) {
  const users = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
      isPremium: true,
    },
  });

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name || "Anonymous",
    image: user.image,
    isPremium: user.isPremium,
    dynastyPoints: user.xp,
    isCurrentUser: user.id === currentUserId,
  }));
}

async function getUserRank(userId: string, period: string) {
  const startDate = getStartDate(period);

  // Get all users' total minutes
  const allStreaks = await prisma.listeningStreak.findMany({
    where: {
      lastListenDate: { gte: startDate },
    },
    orderBy: { totalMinutes: "desc" },
    select: { userId: true, totalMinutes: true },
  });

  const userIndex = allStreaks.findIndex((s) => s.userId === userId);
  const userStreak = allStreaks[userIndex];

  return {
    rank: userIndex + 1,
    totalMinutes: userStreak?.totalMinutes || 0,
    totalHours: Math.round((userStreak?.totalMinutes || 0) / 60),
    percentile: Math.round(
      ((allStreaks.length - userIndex) / allStreaks.length) * 100
    ),
  };
}
