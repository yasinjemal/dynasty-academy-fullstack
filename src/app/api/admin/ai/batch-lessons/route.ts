/**
 * API Route: Batch Lesson Generation
 * POST /api/admin/ai/batch-lessons
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import {
  generateBatchLessons,
  saveGeneratedLesson,
  type LessonGenerationConfig,
} from "@/lib/ai-lesson-generator";

const prisma = new PrismaClient();

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
    const { courseId, lessons, bookId, config, saveToDatabase = true } = body;

    // Validation
    if (
      !courseId ||
      !lessons ||
      !Array.isArray(lessons) ||
      lessons.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, lessons (array)" },
        { status: 400 }
      );
    }

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required" },
        { status: 400 }
      );
    }

    // Validate each lesson has required fields
    for (const lesson of lessons) {
      if (!lesson.title || !lesson.objective) {
        return NextResponse.json(
          { error: "Each lesson must have title and objective" },
          { status: 400 }
        );
      }
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Generate all lessons
    const batchResult = await generateBatchLessons(
      courseId,
      lessons,
      bookId,
      config
    );

    // Save to database if requested
    const savedIds: string[] = [];
    if (saveToDatabase) {
      for (const result of batchResult.results) {
        try {
          const savedId = await saveGeneratedLesson(
            result,
            courseId,
            bookId,
            config || {}
          );
          savedIds.push(savedId);
        } catch (error) {
          console.error("Error saving lesson:", error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        results: batchResult.results,
        savedIds,
        summary: batchResult.summary,
      },
    });
  } catch (error: any) {
    console.error("Error in batch-lessons API:", error);

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate batch lessons" },
      { status: 500 }
    );
  }
}

// GET: Check batch job status (for async processing in future)
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
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const job = await prisma.ai_generation_jobs.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    console.error("Error checking job status:", error);
    return NextResponse.json(
      { error: "Failed to check job status" },
      { status: 500 }
    );
  }
}
