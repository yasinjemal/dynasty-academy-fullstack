import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/instructor/revenue
 * Fetch instructor revenue statistics and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an instructor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "INSTRUCTOR" && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Instructor access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get instructor's courses
    const instructorCourses = await prisma.courses.findMany({
      where: {
        instructorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        price: true,
        thumbnail: true,
        averageRating: true,
      },
    });

    const courseIds = instructorCourses.map((c) => c.id);

    // Get total enrollments and revenue
    const enrollments = await prisma.course_enrollments.findMany({
      where: {
        courseId: { in: courseIds },
        enrolledAt: { gte: startDate },
      },
      include: {
        courses: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    });

    // Calculate total earnings (70% revenue share for instructor)
    const revenueShare = 0.7;
    const totalRevenue = enrollments.reduce(
      (sum, enrollment) => sum + (Number(enrollment.courses.price) || 0),
      0
    );
    const totalEarnings = totalRevenue * revenueShare;

    // Get all-time stats
    const allEnrollments = await prisma.course_enrollments.findMany({
      where: { courseId: { in: courseIds } },
    });

    const allTimeRevenue =
      allEnrollments.reduce(
        (sum, e) => sum + (Number(e.courses?.price) || 0),
        0
      ) * revenueShare;

    // Calculate pending payout (earnings not yet paid out)
    const lastPayoutDate = new Date();
    lastPayoutDate.setDate(1); // First day of current month

    const pendingEnrollments = await prisma.course_enrollments.findMany({
      where: {
        courseId: { in: courseIds },
        enrolledAt: { gte: lastPayoutDate },
      },
      include: {
        courses: {
          select: { price: true },
        },
      },
    });

    const pendingPayout =
      pendingEnrollments.reduce(
        (sum, e) => sum + (Number(e.courses.price) || 0),
        0
      ) * revenueShare;

    // Available balance (mock - in production, track actual payouts)
    const availableBalance = pendingPayout;

    // Calculate student count
    const uniqueStudents = new Set(allEnrollments.map((e) => e.userId));
    const totalStudents = uniqueStudents.size;

    // Calculate average rating
    const averageRating =
      instructorCourses.reduce((sum, c) => sum + (c.averageRating || 0), 0) /
        instructorCourses.length || 0;

    // Calculate completion rate
    const completedEnrollments = allEnrollments.filter(
      (e) => e.progress && Number(e.progress) === 100
    );
    const completionRate =
      allEnrollments.length > 0
        ? (completedEnrollments.length / allEnrollments.length) * 100
        : 0;

    // Get previous period revenue for growth calculation
    const previousStartDate = new Date(startDate);
    const daysDiff = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);

    const previousEnrollments = await prisma.course_enrollments.findMany({
      where: {
        courseId: { in: courseIds },
        enrolledAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      include: {
        courses: {
          select: { price: true },
        },
      },
    });

    const previousRevenue =
      previousEnrollments.reduce(
        (sum, e) => sum + (Number(e.courses.price) || 0),
        0
      ) * revenueShare;

    const growthRate =
      previousRevenue > 0
        ? ((totalEarnings - previousRevenue) / previousRevenue) * 100
        : 0;

    // Generate weekly revenue data
    const weeks = Math.ceil(daysDiff / 7);
    const revenueByWeek = [];

    for (let i = 0; i < Math.min(weeks, 12); i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const weekEnrollments = await prisma.course_enrollments.findMany({
        where: {
          courseId: { in: courseIds },
          enrolledAt: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
        include: {
          courses: {
            select: { price: true },
          },
        },
      });

      const weekRevenue =
        weekEnrollments.reduce(
          (sum, e) => sum + (Number(e.courses.price) || 0),
          0
        ) * revenueShare;

      revenueByWeek.unshift({
        week: `Week ${i + 1}`,
        revenue: Math.round(weekRevenue),
        students: weekEnrollments.length,
      });
    }

    // Get top performing courses
    const courseRevenues = await Promise.all(
      instructorCourses.map(async (course) => {
        const courseEnrollments = await prisma.course_enrollments.findMany({
          where: {
            courseId: course.id,
            enrolledAt: { gte: startDate },
          },
        });

        const revenue =
          courseEnrollments.length * (Number(course.price) || 0) * revenueShare;

        // Calculate trend (compare to previous period)
        const prevEnrollments = await prisma.course_enrollments.count({
          where: {
            courseId: course.id,
            enrolledAt: {
              gte: previousStartDate,
              lt: startDate,
            },
          },
        });

        const trend =
          courseEnrollments.length > prevEnrollments
            ? "up"
            : courseEnrollments.length < prevEnrollments
            ? "down"
            : "stable";

        return {
          id: course.id,
          title: course.title || "Untitled Course",
          thumbnail: course.thumbnail || "",
          revenue: Math.round(revenue),
          students: courseEnrollments.length,
          rating: course.averageRating || 0,
          trend,
        };
      })
    );

    // Sort by revenue and get top 5
    const topCourses = courseRevenues
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Generate payout history (mock data - in production, fetch from payout table)
    const payoutHistory = [
      {
        id: "payout_1",
        amount: 2450,
        date: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(),
        status: "completed" as const,
        method: "Bank Transfer",
      },
      {
        id: "payout_2",
        amount: 1890,
        date: new Date(now.getFullYear(), now.getMonth() - 2, 15).toISOString(),
        status: "completed" as const,
        method: "PayPal",
      },
      {
        id: "payout_3",
        amount: 3200,
        date: new Date(now.getFullYear(), now.getMonth() - 3, 15).toISOString(),
        status: "completed" as const,
        method: "Bank Transfer",
      },
    ];

    // Calculate upcoming payout
    const nextPayoutDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);

    const stats = {
      totalEarnings: Math.round(allTimeRevenue),
      pendingPayout: Math.round(pendingPayout),
      availableBalance: Math.round(availableBalance),
      totalStudents,
      activeCourses: instructorCourses.length,
      averageRating: Math.round(averageRating * 10) / 10,
      completionRate: Math.round(completionRate),
      thisMonthRevenue: Math.round(totalEarnings),
      lastMonthRevenue: Math.round(previousRevenue),
      growthRate: Math.round(growthRate * 10) / 10,
      payoutHistory,
      revenueByWeek,
      topCourses,
      upcomingPayout: {
        amount: Math.round(pendingPayout),
        date: nextPayoutDate.toISOString(),
        coursesIncluded: instructorCourses.length,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Revenue stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue statistics" },
      { status: 500 }
    );
  }
}
