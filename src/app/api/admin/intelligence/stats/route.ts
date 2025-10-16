import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Calculate date filter
    let dateFilter: Date | undefined;
    const now = new Date();
    switch (range) {
      case "24h":
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = undefined; // All time
    }

    // Fetch total sessions
    const totalSessions = await prisma.readingBehavior.count({
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
    });

    // Fetch unique users
    const uniqueUsers = await prisma.readingBehavior.groupBy({
      by: ["userId"],
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
    });

    // Calculate average completion rate
    const completionData = await prisma.readingBehavior.aggregate({
      _avg: { completionPercentage: true },
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
    });

    // Calculate average engagement (based on various metrics)
    const engagementData = await prisma.readingBehavior.findMany({
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
      select: {
        pauseCount: true,
        rereadCount: true,
        scrollbackCount: true,
        playbackSpeedChanges: true,
        bookmarksCreated: true,
        sessionDuration: true,
      },
    });

    const avgEngagementScore =
      engagementData.length > 0
        ? engagementData.reduce((acc, session) => {
            // Engagement formula: weighted average of various signals
            const engagementScore =
              (session.rereadCount * 2 + // Rereads are strong signals
                session.bookmarksCreated * 3 + // Bookmarks show deep engagement
                (session.pauseCount < 10 ? 5 : 0) + // Low pauses = flow state
                (session.sessionDuration > 600 ? 5 : 0)) / // Long sessions = engagement
              10;
            return acc + Math.min(10, engagementScore);
          }, 0) / engagementData.length
        : 0;

    // Get behavior patterns count
    const totalBehaviorPatterns = await prisma.userBehaviorPattern.count();

    // Get complexity analyses count
    const totalComplexityAnalyses = await prisma.contentComplexity.count();

    // Peak reading hours
    const hourlyData = await prisma.readingBehavior.groupBy({
      by: ["timeOfDay"],
      _count: true,
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
    });

    const peakReadingHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count:
        hourlyData.find((d) => d.timeOfDay === getTimeOfDayCategory(hour))
          ?._count || 0,
    }));

    // Popular books
    const bookData = await prisma.readingBehavior.groupBy({
      by: ["bookId"],
      _count: true,
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
      orderBy: { _count: { bookId: "desc" } },
      take: 10,
    });

    const popularBooks = await Promise.all(
      bookData.map(async (book) => {
        const bookInfo = await prisma.book.findUnique({
          where: { id: book.bookId },
          select: { title: true },
        });
        return {
          bookId: book.bookId,
          bookTitle: bookInfo?.title || "Unknown Book",
          sessions: book._count,
        };
      })
    );

    // User retention (simplified calculation)
    const dailyReturnUsers = await prisma.readingBehavior.groupBy({
      by: ["userId"],
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const weeklyReturnUsers = await prisma.readingBehavior.groupBy({
      by: ["userId"],
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const monthlyReturnUsers = await prisma.readingBehavior.groupBy({
      by: ["userId"],
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Prediction accuracy (mock data for now - you'd calculate this from actual predictions vs outcomes)
    const predictionAccuracy = {
      engagement: 87.3, // Would compare predicted engagement vs actual
      completion: 82.5, // Would compare predicted completion vs actual
      speed: 91.2, // Would compare recommended speed vs user adoption
    };

    const stats = {
      totalSessions,
      totalUsers: uniqueUsers.length,
      avgCompletionRate: completionData._avg.completionPercentage || 0,
      avgEngagementScore,
      totalBehaviorPatterns,
      totalComplexityAnalyses,
      peakReadingHours,
      popularBooks,
      userRetention: {
        daily:
          (dailyReturnUsers.length / Math.max(uniqueUsers.length, 1)) * 100,
        weekly:
          (weeklyReturnUsers.length / Math.max(uniqueUsers.length, 1)) * 100,
        monthly:
          (monthlyReturnUsers.length / Math.max(uniqueUsers.length, 1)) * 100,
      },
      predictionAccuracy,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Intelligence stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch intelligence stats" },
      { status: 500 }
    );
  }
}

function getTimeOfDayCategory(hour: number): string {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
