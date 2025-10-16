// 🔮 API: Get Reading Predictions
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { AdvancedIntelligence } from "@/lib/intelligence/simpleIntelligence";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const chapterId = searchParams.get("chapterId");

    if (!bookId || !chapterId) {
      return NextResponse.json(
        { error: "Missing bookId or chapterId" },
        { status: 400 }
      );
    }

    // Generate advanced ML-powered predictions
    const predictions = await AdvancedIntelligence.predict(
      session.user.id,
      bookId,
      parseInt(chapterId)
    );

    return NextResponse.json({
      success: true,
      intelligence: "advanced", // Flag for client to show enhanced UI
      predictions: {
        recommendedSpeed: predictions.recommendedSpeed,
        recommendedAtmosphere: predictions.recommendedAtmosphere,
        suggestedBreakInterval: predictions.suggestedBreakInterval,
        predictedEngagement: predictions.predictedEngagement,
        completionProbability: predictions.completionProbability,
        suggestions: predictions.suggestions,
        // 🔥 Advanced metrics from our 5 algorithms (the moat)
        cognitiveLoad: predictions.cognitiveLoad,
        retentionScore: predictions.retentionScore,
        focusWindowDetected: predictions.focusWindowDetected,
        optimalSessionLength: predictions.optimalSessionLength,
        streakBonus: predictions.streakBonus,
        atmosphereMatch: predictions.atmosphereMatch,
      },
    });
  } catch (error) {
    console.error("[Intelligence API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate predictions" },
      { status: 500 }
    );
  }
}
