/**
 * API Route: Generate Quiz
 * POST /api/admin/ai/generate-quiz
 * GET /api/admin/ai/generated-quizzes
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import {
  generateQuiz,
  saveGeneratedQuiz,
  estimateQuizCost,
  type QuizGenerationConfig,
} from "@/lib/ai-quiz-generator";

const prisma = new PrismaClient();

// POST: Generate quiz
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
    const { sourceType, sourceId, config, saveToDatabase = true } = body;

    // Validation
    if (!sourceType || !sourceId) {
      return NextResponse.json(
        { error: "Missing required fields: sourceType, sourceId" },
        { status: 400 }
      );
    }

    if (!["course", "lesson", "book"].includes(sourceType)) {
      return NextResponse.json(
        { error: "sourceType must be course, lesson, or book" },
        { status: 400 }
      );
    }

    // Generate quiz
    const result = await generateQuiz(sourceType, sourceId, config);

    // Save to database if requested
    let savedId: string | null = null;
    if (saveToDatabase) {
      savedId = await saveGeneratedQuiz(
        result,
        sourceType,
        sourceId,
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
    console.error("Error in generate-quiz API:", error);

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

// GET: Retrieve generated quizzes
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
    const sourceId = searchParams.get("sourceId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let whereClause = `content_type = 'quiz'`;

    if (sourceId) {
      whereClause += ` AND source_id = '${sourceId}'`;
    }

    if (status && status !== "all") {
      whereClause += ` AND status = '${status}'`;
    }

    const quizzes = (await prisma.$queryRaw`
      SELECT 
        id, source_type, source_id, source_title,
        generated_data, status, confidence_score, 
        cost_usd, tokens_used, metadata, created_at
      FROM ai_generated_content
      WHERE ${prisma.$queryRawUnsafe(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as any[];

    // Get statistics
    const stats = (await prisma.$queryRaw`
      SELECT 
        COUNT(id) as total_quizzes,
        SUM(cost_usd) as total_cost,
        SUM(tokens_used) as total_tokens,
        AVG(confidence_score) as avg_confidence
      FROM ai_generated_content
      WHERE content_type = 'quiz'
    `) as any[];

    return NextResponse.json({
      success: true,
      data: {
        quizzes,
        stats: {
          totalQuizzes: Number(stats[0]?.total_quizzes || 0),
          totalCost: Number(stats[0]?.total_cost || 0),
          totalTokens: Number(stats[0]?.total_tokens || 0),
          avgConfidence: Number(stats[0]?.avg_confidence || 0),
        },
      },
    });
  } catch (error: any) {
    console.error("Error retrieving quizzes:", error);
    return NextResponse.json(
      { error: "Failed to retrieve quizzes" },
      { status: 500 }
    );
  }
}

// PUT: Get cost estimate
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      questionCount = 10,
      includeExplanations = true,
      useRAG = true,
    } = body;

    const estimate = estimateQuizCost(
      questionCount,
      includeExplanations,
      useRAG
    );

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
