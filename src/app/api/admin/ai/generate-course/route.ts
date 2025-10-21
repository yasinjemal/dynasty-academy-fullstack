/**
 * 🎓 AI Course Generator API
 *
 * POST /api/admin/ai/generate-course
 *
 * Generates a complete course structure from a book using AI.
 * Admin-only endpoint with comprehensive error handling.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  generateCourseFromBook,
  analyzeBook,
  type CourseGenerationConfig,
} from "@/lib/ai-course-generator";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const {
      bookId,
      mode = "balanced",
      targetAudience,
      moduleCount,
      useRAG = true,
      analyzeOnly = false,
    } = body;

    // 4. Validate required fields
    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required" },
        { status: 400 }
      );
    }

    // Validate mode
    if (mode && !["fast", "balanced", "comprehensive"].includes(mode)) {
      return NextResponse.json(
        { error: "mode must be: fast, balanced, or comprehensive" },
        { status: 400 }
      );
    }

    // Validate targetAudience
    if (
      targetAudience &&
      !["beginner", "intermediate", "advanced"].includes(targetAudience)
    ) {
      return NextResponse.json(
        {
          error: "targetAudience must be: beginner, intermediate, or advanced",
        },
        { status: 400 }
      );
    }

    // 5. If analyze only, just return book analysis
    if (analyzeOnly) {
      console.log("📊 Running book analysis only...");
      const analysis = await analyzeBook(bookId);

      return NextResponse.json({
        success: true,
        analysis,
        message: "Book analysis complete",
      });
    }

    // 6. Generate the full course
    console.log("🎓 Starting full course generation...");

    const config: CourseGenerationConfig = {
      bookId,
      mode,
      targetAudience,
      moduleCount,
      useRAG,
    };

    const result = await generateCourseFromBook(config, session.user.id);

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        course: result.course,
        analysis: result.analysis,
        metadata: result.metadata,
      },
      message: "Course generated successfully",
    });
  } catch (error: any) {
    console.error("❌ Course generation API error:", error);

    // Handle specific errors
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        {
          error: "Book not found",
          details: error.message,
        },
        { status: 404 }
      );
    }

    if (error.message?.includes("No content found")) {
      return NextResponse.json(
        {
          error: "No content available for this book",
          details: "Please ensure the book has content uploaded",
        },
        { status: 400 }
      );
    }

    if (
      error.code === "insufficient_quota" ||
      error.message?.includes("quota")
    ) {
      return NextResponse.json(
        {
          error: "OpenAI API quota exceeded",
          details: "Please check your OpenAI billing",
        },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Course generation failed",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve generated courses
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // 3. Get query parameters
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const status = searchParams.get("status") || "draft";
    const limit = parseInt(searchParams.get("limit") || "10");

    // 4. Build query
    let query = `
      SELECT 
        id,
        content_type,
        source_type,
        source_id,
        source_title,
        generated_data,
        status,
        confidence_score,
        tokens_used,
        cost_usd,
        generation_time_ms,
        created_at,
        reviewed_by,
        reviewed_at,
        published_to,
        published_at
      FROM ai_generated_content
      WHERE content_type = 'course'
    `;

    const params: any[] = [];

    if (bookId) {
      query += ` AND source_id = $${params.length + 1}`;
      params.push(bookId);
    }

    if (status !== "all") {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    // 5. Execute query
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const results = await prisma.$queryRawUnsafe(query, ...params);

    await prisma.$disconnect();

    // 6. Return results
    return NextResponse.json({
      success: true,
      data: results,
      count: Array.isArray(results) ? results.length : 0,
    });
  } catch (error: any) {
    console.error("❌ Get courses API error:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve courses",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
