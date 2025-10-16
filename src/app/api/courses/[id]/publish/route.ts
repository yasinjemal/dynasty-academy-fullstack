import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * PATCH /api/courses/[id]/publish
 * Publish a draft course (make it visible to students)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if course exists and belongs to user
    const course = await prisma.courses.findFirst({
      where: {
        id: id,
        authorId: user.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Update course status to published
    const publishedCourse = await prisma.courses.update({
      where: { id: id },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Course published successfully!",
      course: {
        id: publishedCourse.id,
        title: publishedCourse.title,
        slug: publishedCourse.slug,
        status: publishedCourse.status,
        publishedAt: publishedCourse.publishedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error publishing course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to publish course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
