import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/courses/[id]
 * Fetch complete course data with sections, lessons, and progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const { id: courseIdOrSlug } = await params;

    // Fetch course with raw SQL - support both ID and slug lookup
    const course = await prisma.$queryRaw<any[]>`
      SELECT 
        c.id, c.title, c.description, c."coverImage",
        c.level, c.category, c.duration, c."lessonCount",
        c."instructorName" as "instructor",
        COALESCE(e.progress, 0) as progress,
        COALESCE(e."completedLessons", 0) as "completedLessons",
        c."lessonCount" as "totalLessons"
      FROM courses c
      LEFT JOIN course_enrollments e ON e."courseId" = c.id AND e."userId" = ${userId}
      WHERE c.id = ${courseIdOrSlug} OR c.slug = ${courseIdOrSlug}
      LIMIT 1
    `;

    if (!course || course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseId = course[0].id;

    // Fetch sections
    const sections = await prisma.$queryRaw<any[]>`
      SELECT 
        id, title, description, "order"
      FROM course_sections
      WHERE "courseId" = ${courseId}
      ORDER BY "order" ASC
    `;

    // Fetch lessons with progress and quiz info
    const lessons = await prisma.$queryRaw<any[]>`
      SELECT 
        l.id, l."sectionId", l.title, l.type,
        l."videoUrl", l."pdfUrl",
        l.content, l."order",
        COALESCE(l."videoDuration" / 60, 10) as duration,
        COALESCE(lp.completed, false) as completed,
        COALESCE(lp."quizPassed", false) as "quizPassed",
        COALESCE(lp."quizAttempts", 0) as "quizAttempts",
        lp."lastQuizScore" as "lastQuizScore",
        (SELECT COUNT(*) > 0 FROM course_quizzes WHERE "lessonId" = l.id) as "hasQuiz"
      FROM course_lessons l
      LEFT JOIN lesson_progress lp ON lp."lessonId" = l.id AND lp."userId" = ${userId}
      WHERE l."courseId" = ${courseId}
      ORDER BY l."order" ASC
    `;

    // Add default values for isLocked and requiresQuiz (since columns may not exist)
    const lessonsWithDefaults = lessons.map((lesson, index) => ({
      ...lesson,
      isLocked: index > 0, // First lesson unlocked, rest locked by default
      requiresQuiz: lesson.hasQuiz || false,
    }));

    // Group lessons by section
    const sectionsWithLessons = sections.map((section) => ({
      ...section,
      lessons: lessonsWithDefaults.filter((l) => l.sectionId === section.id),
    }));

    const courseData = {
      ...course[0],
      sections: sectionsWithLessons,
    };

    console.log("📊 API Response Debug:");
    console.log("- totalLessons:", courseData.totalLessons);
    console.log("- lessonCount:", courseData.lessonCount);
    console.log("- completedLessons:", courseData.completedLessons);
    console.log("- sections:", courseData.sections?.length);
    console.log(
      "- total lessons in sections:",
      courseData.sections?.reduce(
        (acc: number, s: any) => acc + (s.lessons?.length || 0),
        0
      )
    );

    return NextResponse.json(courseData);
  } catch (error: any) {
    console.error("❌ Course API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch course",
        details: error?.message || "Unknown error",
        code: error?.code || "UNKNOWN"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]
 * Enroll user in course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Check if already enrolled
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM course_enrollments
      WHERE "userId" = ${session.user.id} AND "courseId" = ${courseId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
    }

    // Get total lesson count
    const courseInfo = await prisma.$queryRaw<any[]>`
      SELECT "lessonCount" FROM courses WHERE id = ${courseId} LIMIT 1
    `;

    if (!courseInfo || courseInfo.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Create enrollment
    const enrollmentId = `enr_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await prisma.$executeRaw`
      INSERT INTO course_enrollments (
        id, "userId", "courseId", status, progress, 
        "completedLessons", "totalLessons", "enrolledAt", "updatedAt"
      ) VALUES (
        ${enrollmentId},
        ${session.user.id},
        ${courseId},
        'active',
        0,
        0,
        ${courseInfo[0].lessonCount},
        NOW(),
        NOW()
      )
    `;

    // Update course enrollment count
    await prisma.$executeRaw`
      UPDATE courses 
      SET "enrollmentCount" = "enrollmentCount" + 1
      WHERE id = ${courseId}
    `;

    return NextResponse.json({
      success: true,
      enrollmentId,
      message: "Successfully enrolled in course",
    });
  } catch (error) {
    console.error("❌ Course Enrollment Error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
