// 🧠 API: Track Reading Behavior & Generate Intelligence
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { AdvancedIntelligence } from "@/lib/intelligence/simpleIntelligence";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Track user behavior with advanced analytics
    await AdvancedIntelligence.trackBehavior({
      userId: session.user.id,
      bookId: data.bookId,
      chapterId: data.chapterId,
      sessionDuration: data.sessionDuration || 0,
      completed: data.completed || false,
      pauseCount: data.pauseCount || 0,
      pauseDuration: data.pauseDuration || 0,
      speedChanges: data.speedChanges || 0,
      atmosphereChanges: data.atmosphereChanges || 0,
    });

    return NextResponse.json({
      success: true,
      message: "Advanced intelligence tracking complete",
      tracked: {
        session: true,
        patterns: true,
        learning: true,
      },
    });
  } catch (error) {
    console.error("[Intelligence API] Error:", error);
    return NextResponse.json(
      { error: "Failed to track behavior" },
      { status: 500 }
    );
  }
}
