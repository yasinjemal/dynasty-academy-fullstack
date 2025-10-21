/**
 * API Route: Generate Lesson Content
 * POST /api/admin/ai/generate-lesson
 * GET /api/admin/ai/generated-lessons
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import {
  generateLessonContent,
  saveGeneratedLesson,
  estimateLessonCost,
  type LessonGenerationConfig,
} from "@/lib/ai-lesson-generator";

const prisma = new PrismaClient();

// POST: Generate lesson content
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      courseId,
      lessonData,
      bookId,
      config,
      saveToDatabase = true,
    } = body;

    // Validation
    if (!courseId || !lessonData || !bookId) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, lessonData, bookId" },
        { status: 400 }
      );
    }

    if (!lessonData.title || !lessonData.objective) {
      return NextResponse.json(
        { error: "Lesson data must include title and objective" },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Generate lesson content
    const result = await generateLessonContent(
      courseId,
      lessonData,
      bookId,
      config
    );

    // Save to database if requested
    let savedId: string | null = null;
    if (saveToDatabase) {
      savedId = await saveGeneratedLesson(
        result,
        courseId,
        bookId,
        config || {}
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        savedId,
      },
    });
  } catch (error: any) {
    console.error("Error in generate-lesson API:", error);

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate lesson content" },
      { status: 500 }
    );
  }
}

// GET: Retrieve generated lessons
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {
      content_type: "lesson",
    };

    if (courseId) {
      where.metadata = {
        path: ["courseId"],
        equals: courseId,
      };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const lessons = await prisma.ai_generated_content.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit,
      select: {
        id: true,
        source_title: true,
        generated_data: true,
        status: true,
        confidence_score: true,
        quality_score: true,
        cost_usd: true,
        tokens_used: true,
        metadata: true,
        created_at: true,
      },
    });

    // Get statistics
    const stats = await prisma.ai_generated_content.aggregate({
      where: { content_type: "lesson" },
      _count: { id: true },
      _sum: {
        cost_usd: true,
        tokens_used: true,
      },
      _avg: {
        confidence_score: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        lessons,
        stats: {
          totalLessons: stats._count.id || 0,
          totalCost: stats._sum.cost_usd || 0,
          totalTokens: stats._sum.tokens_used || 0,
          avgConfidence: stats._avg.confidence_score || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Error retrieving lessons:", error);
    return NextResponse.json(
      { error: "Failed to retrieve lessons" },
      { status: 500 }
    );
  }
}

// POST estimate: Get cost estimate
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { wordCount = 800, useRAG = true } = body;

    const estimate = estimateLessonCost(wordCount, useRAG);

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (error: any) {
    console.error("Error estimating cost:", error);
    return NextResponse.json(
      { error: "Failed to estimate cost" },
      { status: 500 }
    );
  }
}
