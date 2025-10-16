import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      category,
      level,
      language,
      thumbnail,
      price,
      isPremium,
      tags,
      learningObjectives,
      requirements,
      targetAudience,
      sections,
      status,
    } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, category" },
        { status: 400 }
      );
    }

    // Calculate total lessons and duration
    const lessonCount = sections.reduce(
      (acc: number, section: any) => acc + (section.lessons?.length || 0),
      0
    );

    const duration = sections.reduce(
      (acc: number, section: any) =>
        acc +
        (section.lessons?.reduce(
          (sum: number, lesson: any) => sum + (lesson.duration || 0),
          0
        ) || 0),
      0
    );

    // Create course with sections and lessons
    const course = await prisma.courses.create({
      data: {
        title,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        shortDescription: subtitle || "",
        description,
        category,
        level: level as any,
        language: language || "English",
        coverImage: thumbnail || "",
        price: parseFloat(price) || 0,
        isPremium: isPremium || false,
        tags: tags || [],
        lessonCount,
        duration,
        status: status === "published" ? "published" : "draft",
        instructorId: session.user.id,
        enrollmentCount: 0,
        averageRating: 0,
        reviewCount: 0,
        featured: false,
        publishedAt: status === "published" ? new Date() : null,
        // Store additional metadata in a JSON field if your schema supports it
      },
    });

    // Create sections and lessons
    if (sections && sections.length > 0) {
      for (const [sectionIndex, section] of sections.entries()) {
        const createdSection = await prisma.course_sections.create({
          data: {
            courseId: course.id,
            title: section.title || `Section ${sectionIndex + 1}`,
            description: section.description || "",
            order: sectionIndex + 1,
          },
        });

        // Create lessons for this section
        if (section.lessons && section.lessons.length > 0) {
          for (const [lessonIndex, lesson] of section.lessons.entries()) {
            await prisma.course_lessons.create({
              data: {
                courseId: course.id,
                sectionId: createdSection.id,
                title: lesson.title || `Lesson ${lessonIndex + 1}`,
                description: lesson.description || "",
                type: lesson.type || "video",
                content: lesson.content || "",
                videoUrl: lesson.videoUrl || "",
                duration: lesson.duration || 0,
                order: lessonIndex + 1,
                isFree: false,
              },
            });
          }
        }
      }
    }

    return NextResponse.json(
      {
        id: course.id,
        slug: course.slug,
        message:
          status === "published"
            ? "Course published successfully!"
            : "Course saved as draft!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all courses created by this instructor
    const courses = await prisma.courses.findMany({
      where: {
        instructorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            course_enrollments: true,
            course_reviews: true,
          },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
