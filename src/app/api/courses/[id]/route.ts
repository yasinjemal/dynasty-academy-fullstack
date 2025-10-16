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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Fetch course with raw SQL (since Prisma schema not updated yet)
    const course = await prisma.$queryRaw<any[]>`
      SELECT 
        c.id, c.title, c.description, c."coverImage",
        c.level, c.category, c.duration, c."lessonCount",
        c."instructorName" as "instructor",
        COALESCE(e.progress, 0) as progress,
        COALESCE(e."completedLessons", 0) as "completedLessons",
        c."lessonCount" as "totalLessons"
      FROM courses c
      LEFT JOIN course_enrollments e ON e."courseId" = c.id AND e."userId" = ${session.user.id}
      WHERE c.id = ${courseId}
      LIMIT 1
    `;

    if (!course || course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch sections
    const sections = await prisma.$queryRaw<any[]>`
      SELECT 
        id, title, description, "order"
      FROM course_sections
      WHERE "courseId" = ${courseId}
      ORDER BY "order" ASC
    `;

    // Fetch lessons with progress
    const lessons = await prisma.$queryRaw<any[]>`
      SELECT 
        l.id, l."sectionId", l.title, l.type,
        l."videoUrl", l."pdfUrl",
        l.content, l."order",
        COALESCE(l."videoDuration" / 60, 10) as duration,
        COALESCE(lp.completed, false) as completed
      FROM course_lessons l
      LEFT JOIN lesson_progress lp ON lp."lessonId" = l.id AND lp."userId" = ${session.user.id}
      WHERE l."courseId" = ${courseId}
      ORDER BY l."order" ASC
    `;

    // Group lessons by section
    const sectionsWithLessons = sections.map((section) => ({
      ...section,
      lessons: lessons.filter((l) => l.sectionId === section.id),
    }));

    const courseData = {
      ...course[0],
      sections: sectionsWithLessons,
    };

    return NextResponse.json(courseData);
  } catch (error) {
    console.error("❌ Course API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
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
