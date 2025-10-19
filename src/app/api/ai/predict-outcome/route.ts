/**
 * 🤖 AI PREDICTIONS API
 *
 * Endpoint for advanced ML predictions and interventions
 * Uses ensemble models to predict student outcomes
 *
 * POST /api/ai/predict-outcome
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { advancedMLEngine } from "@/lib/intelligence/server/AdvancedMLEngine";

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    // Run ML prediction
    const prediction = await advancedMLEngine.predictStudentOutcome(
      session.user.id,
      courseId
    );

    return NextResponse.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Prediction error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate prediction",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/predict-outcome?courseId=xxx
 * Alternative GET endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    const prediction = await advancedMLEngine.predictStudentOutcome(
      session.user.id,
      courseId
    );

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error: any) {
    console.error("❌ Prediction error:", error);
    return NextResponse.json(
      { error: "Failed to generate prediction" },
      { status: 500 }
    );
  }
}
