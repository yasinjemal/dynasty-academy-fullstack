import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET: Fetch analytics for a book
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const days = parseInt(searchParams.get("days") || "7", 10);

    if (!bookId) {
      return NextResponse.json(
        { error: "Missing bookId parameter" },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics data
    const analytics = await prisma.coReadingAnalytics.findMany({
      where: {
        bookId,
        date: {
          gte: startDate,
        },
      },
      orderBy: [{ page: "asc" }, { date: "asc" }],
    });

    // Get page-level statistics
    const pageStats = await prisma.pageChat.groupBy({
      by: ["page"],
      where: {
        bookId,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 20,
    });

    // Get unique users per page
    const pageReaders = await prisma.readingPresence.groupBy({
      by: ["page"],
      where: {
        bookId,
        lastSeenAt: {
          gte: startDate,
        },
      },
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: "desc",
        },
      },
    });

    // Get reaction statistics
    const reactionStats = await prisma.pageReaction.findMany({
      where: {
        bookId,
      },
      select: {
        page: true,
        emote: true,
        count: true,
      },
    });

    // Aggregate reactions by page
    const reactionsByPage = reactionStats.reduce((acc, r) => {
      if (!acc[r.page]) acc[r.page] = 0;
      acc[r.page] += r.count;
      return acc;
    }, {} as Record<number, number>);

    // Calculate most popular pages (by messages + reactions + readers)
    const popularPages = pageStats.map((stat) => ({
      page: stat.page,
      messageCount: stat._count.id,
      reactionCount: reactionsByPage[stat.page] || 0,
      readerCount:
        pageReaders.find((pr) => pr.page === stat.page)?._count.userId || 0,
      totalEngagement:
        stat._count.id +
        (reactionsByPage[stat.page] || 0) +
        (pageReaders.find((pr) => pr.page === stat.page)?._count.userId || 0),
    }));

    // Sort by total engagement
    popularPages.sort((a, b) => b.totalEngagement - a.totalEngagement);

    // Calculate overall statistics
    const totalMessages = pageStats.reduce(
      (sum, stat) => sum + stat._count.id,
      0
    );
    const totalReactions = Object.values(reactionsByPage).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalUniqueReaders = await prisma.readingPresence.groupBy({
      by: ["userId"],
      where: {
        bookId,
        lastSeenAt: {
          gte: startDate,
        },
      },
      _count: {
        userId: true,
      },
    });

    // Calculate peak concurrent readers from analytics
    const peakConcurrent =
      analytics.length > 0
        ? Math.max(...analytics.map((a) => a.peakConcurrent))
        : 0;

    // Get time series data for charts
    const timeSeriesData = analytics.reduce((acc, item) => {
      const dateKey = item.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          messages: 0,
          reactions: 0,
          peakReaders: 0,
        };
      }
      acc[dateKey].messages += item.totalMessages;
      acc[dateKey].reactions += item.totalReactions;
      acc[dateKey].peakReaders = Math.max(
        acc[dateKey].peakReaders,
        item.peakConcurrent
      );
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      summary: {
        totalMessages,
        totalReactions,
        uniqueReaders: totalUniqueReaders.length,
        peakConcurrent,
        daysAnalyzed: days,
      },
      popularPages: popularPages.slice(0, 10),
      timeSeries: Object.values(timeSeriesData),
      pageStats: pageStats.map((stat) => ({
        page: stat.page,
        messageCount: stat._count.id,
        reactionCount: reactionsByPage[stat.page] || 0,
        readerCount:
          pageReaders.find((pr) => pr.page === stat.page)?._count.userId || 0,
      })),
      reactionStats,
    });
  } catch (error) {
    console.error("[GET /api/co-reading/analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// POST: Update analytics (called by background job or Socket.io)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      bookId,
      page,
      peakConcurrent,
      avgConcurrent,
      totalMessages,
      totalReactions,
      uniqueUsers,
    } = body;

    if (!bookId || page === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert analytics for today
    const analytics = await prisma.coReadingAnalytics.upsert({
      where: {
        bookId_page_date: {
          bookId,
          page,
          date: today,
        },
      },
      update: {
        peakConcurrent: Math.max(peakConcurrent || 0, 0),
        avgConcurrent: avgConcurrent || 0,
        totalMessages: {
          increment: totalMessages || 0,
        },
        totalReactions: {
          increment: totalReactions || 0,
        },
        uniqueUsers: uniqueUsers || 0,
      },
      create: {
        bookId,
        page,
        date: today,
        peakConcurrent: peakConcurrent || 0,
        avgConcurrent: avgConcurrent || 0,
        totalMessages: totalMessages || 0,
        totalReactions: totalReactions || 0,
        uniqueUsers: uniqueUsers || 0,
      },
    });

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("[POST /api/co-reading/analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to update analytics" },
      { status: 500 }
    );
  }
}
