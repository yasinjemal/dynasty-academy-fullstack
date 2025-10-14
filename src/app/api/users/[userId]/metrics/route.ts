import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/users/:userId/metrics?window=7d
 * 
 * Returns profile metrics and analytics:
 * - Total views (all-time)
 * - Unique visitors
 * - Views today, this week, this month
 * - Daily view breakdown (for charts)
 * - Trending percentage
 * 
 * Query params:
 * - window: 7d, 30d, 90d, all (default: 30d)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const window = searchParams.get("window") || "30d";

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        isPrivate: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Privacy check - only owner can see metrics
    const isOwnProfile = session?.user?.id === userId;
    if (!isOwnProfile) {
      return NextResponse.json(
        { error: "Unauthorized - You can only view your own metrics" },
        { status: 403 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 6); // Last 7 days
    
    const thisMonthStart = new Date(today);
    thisMonthStart.setDate(today.getDate() - 29); // Last 30 days

    let windowStart = thisMonthStart;
    if (window === "7d") windowStart = thisWeekStart;
    else if (window === "90d") {
      windowStart = new Date(today);
      windowStart.setDate(today.getDate() - 89);
    }

    // Get total all-time views
    const totalViews = await prisma.profileVisit.count({
      where: { profileId: userId },
    });

    // Get unique visitors (count distinct visitorIds, excluding nulls)
    const uniqueVisitors = await prisma.profileVisit.groupBy({
      by: ["visitorId"],
      where: {
        profileId: userId,
        visitorId: { not: null },
      },
      _count: true,
    });

    // Get views today
    const viewsToday = await prisma.profileVisit.count({
      where: {
        profileId: userId,
        createdAt: { gte: today },
      },
    });

    // Get views this week
    const viewsThisWeek = await prisma.profileVisit.count({
      where: {
        profileId: userId,
        createdAt: { gte: thisWeekStart },
      },
    });

    // Get views this month
    const viewsThisMonth = await prisma.profileVisit.count({
      where: {
        profileId: userId,
        createdAt: { gte: thisMonthStart },
      },
    });

    // Get new unique visitors today
    const newVisitorsToday = await prisma.profileVisit.count({
      where: {
        profileId: userId,
        createdAt: { gte: today },
        isUnique: true,
      },
    });

    // Get daily breakdown for selected window
    const dailyViews = await prisma.profileVisit.groupBy({
      by: ["createdAt"],
      where: {
        profileId: userId,
        createdAt: { gte: windowStart },
      },
      _count: true,
    });

    // Process daily views into chart-friendly format
    const dailyData: { date: string; views: number; unique: number }[] = [];
    const daysCount = window === "7d" ? 7 : window === "90d" ? 90 : 30;
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const viewsCount = await prisma.profileVisit.count({
        where: {
          profileId: userId,
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      const uniqueCount = await prisma.profileVisit.count({
        where: {
          profileId: userId,
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
          isUnique: true,
        },
      });

      dailyData.push({
        date: dateStr,
        views: viewsCount,
        unique: uniqueCount,
      });
    }

    // Calculate trending percentage (compare last 7 days vs previous 7 days)
    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(today.getDate() - 6);
    
    const previous7DaysStart = new Date(today);
    previous7DaysStart.setDate(today.getDate() - 13);
    const previous7DaysEnd = new Date(today);
    previous7DaysEnd.setDate(today.getDate() - 7);

    const last7DaysViews = await prisma.profileVisit.count({
      where: {
        profileId: userId,
        createdAt: { gte: last7DaysStart },
      },
    });

    const previous7DaysViews = await prisma.profileVisit.count({
      where: {
        profileId: userId,
        createdAt: {
          gte: previous7DaysStart,
          lt: previous7DaysEnd,
        },
      },
    });

    const trendingPercent = previous7DaysViews > 0
      ? Math.round(((last7DaysViews - previous7DaysViews) / previous7DaysViews) * 100)
      : last7DaysViews > 0 ? 100 : 0;

    return NextResponse.json({
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      newVisitorsToday,
      trendingPercent,
      dailyData,
      window,
    });

  } catch (error) {
    console.error("Error fetching profile metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
