import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/users/me/courses
 * Get current user's enrolled courses with progress
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all enrolled courses with progress
    const enrollments = await prisma.$queryRaw<any[]>`
      SELECT 
        c.id,
        c.title,
        c."coverImage",
        c."instructorName" as instructor,
        ce.progress,
        ce."completedLessons",
        ce."totalLessons",
        ce.status,
        ce."enrolledAt",
        ce."lastAccessedAt",
        ce."totalWatchTime",
        ce."certificateIssued",
        ce."currentLessonId"
      FROM course_enrollments ce
      JOIN courses c ON c.id = ce."courseId"
      WHERE ce."userId" = ${userId}
      ORDER BY ce."lastAccessedAt" DESC NULLS LAST, ce."enrolledAt" DESC
    `;

    // Get current lesson title for each course
    const coursesWithLessons = await Promise.all(
      enrollments.map(async (enrollment) => {
        if (enrollment.currentLessonId) {
          const lesson = await prisma.$queryRaw<any[]>`
            SELECT title
            FROM course_lessons
            WHERE id = ${enrollment.currentLessonId}
            LIMIT 1
          `;

          return {
            ...enrollment,
            currentLessonTitle: lesson[0]?.title || null,
          };
        }
        return enrollment;
      })
    );

    // Calculate stats
    const totalEnrolled = enrollments.length;
    const totalCompleted = enrollments.filter(
      (e) => e.status === "completed"
    ).length;
    const totalInProgress = enrollments.filter(
      (e) => e.status === "active"
    ).length;
    const totalWatchTime = Math.round(
      enrollments.reduce((sum, e) => sum + (e.totalWatchTime || 0), 0) / 60
    ); // Convert to hours
    const averageProgress =
      totalEnrolled > 0
        ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
          totalEnrolled
        : 0;

    // Calculate streak (simplified - days with activity)
    const recentActivity = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT DATE("lastAccessedAt") as activity_date
      FROM course_enrollments
      WHERE "userId" = ${userId}
      AND "lastAccessedAt" >= NOW() - INTERVAL '30 days'
      ORDER BY activity_date DESC
    `;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const activity of recentActivity) {
      const activityDate = new Date(activity.activity_date);
      activityDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      courses: coursesWithLessons,
      stats: {
        totalEnrolled,
        totalCompleted,
        totalInProgress,
        totalWatchTime,
        averageProgress: Math.round(averageProgress),
        streak,
      },
    });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
