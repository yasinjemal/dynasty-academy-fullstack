import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";

// ============================================
// LISTENING STREAKS API
// ============================================

// GET /api/listening/streaks - Get user's streak data

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const streak = await prisma.listeningStreak.findUnique({
      where: { userId: session.user.id },
    });

    if (!streak) {
      // No streak yet, return default
      return NextResponse.json({
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          totalMinutes: 0,
          totalSessions: 0,
          lastListenDate: null,
        },
      });
    }

    // Calculate if streak is still active
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastListenDate = new Date(streak.lastListenDate);
    lastListenDate.setHours(0, 0, 0, 0);

    const daysSinceLastListen = Math.floor(
      (today.getTime() - lastListenDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isActive = daysSinceLastListen <= 1;

    return NextResponse.json({
      streak: {
        currentStreak: isActive ? streak.currentStreak : 0,
        longestStreak: streak.longestStreak,
        totalMinutes: streak.totalMinutes,
        totalSessions: streak.totalSessions,
        lastListenDate: streak.lastListenDate,
        isActive,
        daysUntilBreak: isActive ? 1 - daysSinceLastListen : 0,
      },
    });
  } catch (error) {
    console.error("[Streaks API] Error:", error);
    return NextResponse.json(
      { error: "Failed to load streak data" },
      { status: 500 }
    );
  }
}
