import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// ============================================
// LISTENING ANALYTICS API
// Track sessions & generate insights
// ============================================

// Validation schema
const sessionSchema = z.object({
  bookId: z.string(),
  chapterNumber: z.number().int().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number().min(0), // seconds
  speed: z.number().min(0.5).max(3.0),
  voiceId: z.string(),
  completionRate: z.number().min(0).max(100),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional(),
  deviceName: z.string().optional(),
});

// POST /api/listening/analytics - Track session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = sessionSchema.parse(body);

    // Create analytics record
    const analytics = await prisma.listeningAnalytics.create({
      data: {
        userId: session.user.id,
        bookId: data.bookId,
        chapterNumber: data.chapterNumber,
        sessionId: `${session.user.id}-${Date.now()}`,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        duration: data.duration,
        speed: data.speed,
        voiceId: data.voiceId,
        completionRate: data.completionRate,
        deviceType: data.deviceType,
        deviceName: data.deviceName,
      },
    });

    // 🎉 SURPRISE: Check for marathon achievement (100 Dynasty Points!)
    await checkMarathonAchievement(session.user.id, data.duration);

    return NextResponse.json({
      success: true,
      sessionId: analytics.sessionId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[Analytics API] Track error:", error);
    return NextResponse.json(
      { error: "Failed to track session" },
      { status: 500 }
    );
  }
}

// GET /api/listening/analytics/dashboard
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("range") || "30"; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange, 10));

    // Get analytics data
    const analytics = await prisma.listeningAnalytics.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: startDate },
      },
      orderBy: { startTime: "desc" },
    });

    // Calculate insights
    const insights = {
      // Total stats
      totalSessions: analytics.length,
      totalMinutes: Math.round(
        analytics.reduce((sum, a) => sum + a.duration, 0) / 60
      ),
      totalHours: Math.round(
        analytics.reduce((sum, a) => sum + a.duration, 0) / 3600
      ),

      // Average stats
      avgSessionDuration: analytics.length
        ? Math.round(
            analytics.reduce((sum, a) => sum + a.duration, 0) /
              analytics.length /
              60
          )
        : 0,
      avgSpeed: analytics.length
        ? (
            analytics.reduce((sum, a) => sum + a.speed, 0) / analytics.length
          ).toFixed(2)
        : "1.00",
      avgCompletionRate: analytics.length
        ? Math.round(
            analytics.reduce((sum, a) => sum + a.completionRate, 0) /
              analytics.length
          )
        : 0,

      // Voice preferences (most used)
      voicePreferences: getTopVoices(analytics),

      // Speed distribution
      speedDistribution: getSpeedDistribution(analytics),

      // Device breakdown
      deviceBreakdown: getDeviceBreakdown(analytics),

      // Calendar heatmap (last 30 days)
      heatmap: generateHeatmap(analytics, 30),

      // Peak listening hours
      peakHours: getPeakHours(analytics),

      // Favorite books
      favoriteBooks: await getFavoriteBooks(session.user.id, startDate),
    };

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("[Analytics API] Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTopVoices(analytics: any[]) {
  const voiceCount = analytics.reduce((acc, a) => {
    acc[a.voiceId] = (acc[a.voiceId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(voiceCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([voiceId, count]) => ({
      voiceId,
      count,
      percentage: Math.round((count / analytics.length) * 100),
    }));
}

function getSpeedDistribution(analytics: any[]) {
  const bins = {
    "0.5x-1.0x": 0,
    "1.0x-1.5x": 0,
    "1.5x-2.0x": 0,
    "2.0x+": 0,
  };

  analytics.forEach((a) => {
    if (a.speed < 1.0) bins["0.5x-1.0x"]++;
    else if (a.speed < 1.5) bins["1.0x-1.5x"]++;
    else if (a.speed < 2.0) bins["1.5x-2.0x"]++;
    else bins["2.0x+"]++;
  });

  return bins;
}

function getDeviceBreakdown(analytics: any[]) {
  const deviceCount = analytics.reduce((acc, a) => {
    const device = a.deviceType || "unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(deviceCount).map(([device, count]) => ({
    device,
    count,
    percentage: Math.round((count / analytics.length) * 100),
  }));
}

function generateHeatmap(analytics: any[], days: number) {
  const heatmap: Record<string, number> = {};

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    heatmap[dateKey] = 0;
  }

  // Fill with data
  analytics.forEach((a) => {
    const dateKey = new Date(a.startTime).toISOString().split("T")[0];
    if (heatmap[dateKey] !== undefined) {
      heatmap[dateKey] += Math.round(a.duration / 60); // minutes
    }
  });

  return Object.entries(heatmap)
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getPeakHours(analytics: any[]) {
  const hourCount = analytics.reduce((acc, a) => {
    const hour = new Date(a.startTime).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return Object.entries(hourCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({
      hour: parseInt(hour, 10),
      count,
      label: `${hour}:00 - ${(parseInt(hour) + 1) % 24}:00`,
    }));
}

async function getFavoriteBooks(userId: string, startDate: Date) {
  const bookSessions = await prisma.listeningAnalytics.groupBy({
    by: ["bookId"],
    where: {
      userId,
      startTime: { gte: startDate },
    },
    _sum: { duration: true },
    _count: { id: true },
  });

  const topBooks = bookSessions
    .sort((a, b) => (b._sum.duration || 0) - (a._sum.duration || 0))
    .slice(0, 5);

  const books = await prisma.book.findMany({
    where: { id: { in: topBooks.map((b) => b.bookId) } },
    select: { id: true, title: true, author: true },
  });

  return topBooks.map((stat) => {
    const book = books.find((b) => b.id === stat.bookId);
    return {
      bookId: stat.bookId,
      title: book?.title || "Unknown",
      author: book?.author || "Unknown",
      totalMinutes: Math.round((stat._sum.duration || 0) / 60),
      sessions: stat._count.id,
    };
  });
}

// ============================================
// 🎉 SURPRISE: Marathon Achievement
// ============================================

async function checkMarathonAchievement(
  userId: string,
  sessionDuration: number
) {
  try {
    // Check if session was 60+ minutes (marathon!)
    if (sessionDuration < 3600) return; // Less than 1 hour

    const achievement = await prisma.achievement.findUnique({
      where: { key: "marathon" },
    });

    if (!achievement) return;

    // Check if already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) return;

    // 🏆 UNLOCK MARATHON ACHIEVEMENT! (100 Dynasty Points!)
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        progress: Math.round(sessionDuration / 60),
      },
    });

    // Award Dynasty Points
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: achievement.dynastyPoints },
      },
    });

    console.log(
      `🏃‍♂️ Achievement unlocked: "marathon" (+${achievement.dynastyPoints} Dynasty Points!)`
    );
  } catch (error) {
    console.error("[Analytics API] Marathon check failed:", error);
  }
}
