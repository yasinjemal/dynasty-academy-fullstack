/**
 * 🚀 AI Publisher API - Phase 2d
 * API endpoints for publishing AI-generated courses to live platform
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  publishCourse,
  getPublishedCourses,
  getPublishedCourseStatus,
  updateCourseStatus,
  validatePublishConfig,
  type PublishCourseConfig,
} from "@/lib/ai-publisher";

/**
 * POST /api/admin/ai/publish
 * Publish an AI-generated course to the live platform
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Admin check
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { generatedCourseId, config } = body;

    // Validate input
    if (!generatedCourseId) {
      return NextResponse.json(
        { success: false, error: "Generated course ID is required" },
        { status: 400 }
      );
    }

    // Validate config
    if (config) {
      const validation = validatePublishConfig(config);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid configuration",
            errors: validation.errors,
          },
          { status: 400 }
        );
      }
    }

    // Publish course
    const result = await publishCourse(
      generatedCourseId,
      session.user.id,
      config as PublishCourseConfig
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to publish course",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in publish API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/ai/publish
 * Get published courses and their status
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Admin check
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // Get specific course status
    if (courseId) {
      const status = await getPublishedCourseStatus(courseId);

      if (!status) {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: status,
      });
    }

    // Get all published courses
    const courses = await getPublishedCourses(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        courses,
        total: courses.length,
      },
    });
  } catch (error) {
    console.error("Error in get published courses API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai/publish
 * Update course status (publish/unpublish)
 */
export async function PUT(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Admin check
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId, status } = body;

    // Validate input
    if (!courseId || !status) {
      return NextResponse.json(
        { success: false, error: "Course ID and status are required" },
        { status: 400 }
      );
    }

    if (!["draft", "published"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status must be draft or published" },
        { status: 400 }
      );
    }

    // Update status
    const success = await updateCourseStatus(courseId, status);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to update course status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { courseId, status },
    });
  } catch (error) {
    console.error("Error in update status API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
