import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/courses
 * Fetch all published courses with enrollment status
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Fetch all published courses
    const courses = await prisma.$queryRaw<any[]>`
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.description,
        c."shortDescription",
        c."coverImage",
        c.level,
        c.category,
        c.tags,
        c.price,
        c.duration,
        c."lessonCount",
        c."enrollmentCount",
        c."averageRating",
        c."reviewCount",
        c.status,
        c.featured,
        c."isPremium",
        c."createdAt",
        c."publishedAt",
        CASE 
          WHEN e.id IS NOT NULL THEN true 
          ELSE false 
        END as "isEnrolled",
        CASE
          WHEN e.id IS NOT NULL THEN
            ROUND(
              (SELECT COUNT(*)::numeric 
               FROM lesson_progress lp 
               JOIN course_lessons cl ON cl.id = lp."lessonId"
               WHERE lp."userId" = ${session?.user?.id || "none"} 
               AND cl."courseId" = c.id 
               AND lp.completed = true) * 100.0 /
              NULLIF(c."lessonCount", 0),
              0
            )
          ELSE 0
        END as progress
      FROM courses c
      LEFT JOIN course_enrollments e 
        ON e."courseId" = c.id 
        AND e."userId" = ${session?.user?.id || "none"}
      WHERE c.status = 'published'
      ORDER BY 
        c.featured DESC,
        c."createdAt" DESC
    `;

    return NextResponse.json({
      success: true,
      courses: courses || [],
      totalCourses: courses?.length || 0,
    });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Create a new course (instructor/admin only)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      shortDescription,
      coverImage,
      level,
      category,
      price,
      duration,
    } = body;

    // Validate required fields
    if (!title || !slug || !description || !level || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create course
    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        title,
        slug,
        description,
        shortDescription: shortDescription || null,
        coverImage: coverImage || null,
        level,
        category,
        price: price || 0,
        duration: duration || 0,
        authorId: session.user.id,
        status: "draft",
        featured: false,
        isPremium: false,
        lessonCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("❌ Error creating course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
