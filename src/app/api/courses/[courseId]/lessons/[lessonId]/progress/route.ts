import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/courses/[courseId]/lessons/[lessonId]/progress
 * Get user's progress for a specific lesson
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, lessonId } = await params;

    // Get progress
    const progress = await prisma.$queryRaw<any[]>`
      SELECT 
        lp.id,
        lp."userId",
        lp."lessonId",
        lp."courseId",
        lp.status,
        lp.progress,
        lp."watchTime",
        lp."lastPosition",
        lp.completed,
        lp."completedAt",
        lp.notes,
        lp.bookmarked,
        lp."lastAccessedAt"
      FROM lesson_progress lp
      WHERE lp."userId" = ${session.user.id}
      AND lp."courseId" = ${courseId}
      AND lp."lessonId" = ${lessonId}
      LIMIT 1
    `;

    if (!progress || progress.length === 0) {
      return NextResponse.json({
        exists: false,
        progress: {
          status: "not_started",
          progress: 0,
          watchTime: 0,
          lastPosition: 0,
          completed: false,
        },
      });
    }

    return NextResponse.json({
      exists: true,
      progress: progress[0],
    });
  } catch (error) {
    console.error("Error fetching lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[courseId]/lessons/[lessonId]/progress
 * Update user's progress for a specific lesson
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, lessonId } = await params;
    const body = await request.json();

    const {
      watchTime = 0,
      lastPosition = 0,
      progress = 0,
      completed = false,
      notes = null,
      bookmarked = null,
    } = body;

    // Determine status based on progress
    let status = "not_started";
    if (completed) {
      status = "completed";
    } else if (progress > 0) {
      status = "in_progress";
    }

    // Get enrollment ID
    const enrollment = await prisma.$queryRaw<any[]>`
      SELECT id FROM course_enrollments
      WHERE "userId" = ${session.user.id}
      AND "courseId" = ${courseId}
      LIMIT 1
    `;

    if (!enrollment || enrollment.length === 0) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    const enrollmentId = enrollment[0].id;

    // Check if progress record exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM lesson_progress
      WHERE "userId" = ${session.user.id}
      AND "lessonId" = ${lessonId}
      LIMIT 1
    `;

    let progressRecord;

    if (existing && existing.length > 0) {
      // Update existing progress
      const updateFields: string[] = [];
      const values: any[] = [];

      updateFields.push(`"watchTime" = $${values.length + 1}`);
      values.push(watchTime);

      updateFields.push(`"lastPosition" = $${values.length + 1}`);
      values.push(lastPosition);

      updateFields.push(`"progress" = $${values.length + 1}`);
      values.push(progress);

      updateFields.push(`status = $${values.length + 1}`);
      values.push(status);

      if (completed) {
        updateFields.push(`completed = true`);
        updateFields.push(`"completedAt" = NOW()`);
      }

      if (notes !== null) {
        updateFields.push(`notes = $${values.length + 1}`);
        values.push(notes);
      }

      if (bookmarked !== null) {
        updateFields.push(`bookmarked = $${values.length + 1}`);
        values.push(bookmarked);
      }

      updateFields.push(`"lastAccessedAt" = NOW()`);
      updateFields.push(`"updatedAt" = NOW()`);

      values.push(session.user.id);
      values.push(lessonId);

      await prisma.$executeRawUnsafe(
        `UPDATE lesson_progress 
         SET ${updateFields.join(", ")}
         WHERE "userId" = $${values.length - 1}
         AND "lessonId" = $${values.length}`,
        ...values
      );

      progressRecord = await prisma.$queryRaw<any[]>`
        SELECT * FROM lesson_progress
        WHERE "userId" = ${session.user.id}
        AND "lessonId" = ${lessonId}
        LIMIT 1
      `;
    } else {
      // Create new progress record
      const progressId = `prog_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      await prisma.$executeRaw`
        INSERT INTO lesson_progress (
          id, "userId", "lessonId", "courseId", "enrollmentId",
          status, progress, "watchTime", "lastPosition",
          completed, "completedAt", notes, bookmarked,
          "createdAt", "updatedAt", "lastAccessedAt"
        ) VALUES (
          ${progressId},
          ${session.user.id},
          ${lessonId},
          ${courseId},
          ${enrollmentId},
          ${status},
          ${progress},
          ${watchTime},
          ${lastPosition},
          ${completed},
          ${completed ? new Date() : null},
          ${notes},
          ${bookmarked !== null ? bookmarked : false},
          NOW(),
          NOW(),
          NOW()
        )
      `;

      progressRecord = await prisma.$queryRaw<any[]>`
        SELECT * FROM lesson_progress
        WHERE id = ${progressId}
        LIMIT 1
      `;
    }

    // Update enrollment progress if lesson is completed
    if (completed) {
      // Get total lessons and completed lessons count
      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          c."lessonCount" as total,
          COUNT(DISTINCT lp."lessonId")::int as completed
        FROM courses c
        LEFT JOIN lesson_progress lp ON lp."courseId" = c.id 
          AND lp."userId" = ${session.user.id}
          AND lp.completed = true
        WHERE c.id = ${courseId}
        GROUP BY c."lessonCount"
      `;

      if (stats && stats.length > 0) {
        const { total, completed: completedCount } = stats[0];
        const enrollmentProgress =
          total > 0 ? ((completedCount / total) * 100).toFixed(2) : 0;

        const allCompleted = completedCount >= total;

        await prisma.$executeRaw`
          UPDATE course_enrollments
          SET 
            progress = ${parseFloat(enrollmentProgress.toString())},
            "completedLessons" = ${completedCount},
            "totalLessons" = ${total},
            status = ${allCompleted ? "completed" : "active"},
            "completedAt" = ${allCompleted ? new Date() : null},
            "updatedAt" = NOW()
          WHERE "userId" = ${session.user.id}
          AND "courseId" = ${courseId}
        `;
      }
    }

    return NextResponse.json({
      success: true,
      progress: progressRecord?.[0] || null,
      message: completed
        ? "Lesson completed!"
        : "Progress saved successfully",
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
