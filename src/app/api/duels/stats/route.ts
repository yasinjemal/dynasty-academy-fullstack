import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * 📊 USER STATS API
 * Get current user's duel statistics
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user stats
    let stats = await prisma.duelStats.findUnique({
      where: { userId: session.user.id },
    });

    if (!stats) {
      stats = await prisma.duelStats.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        tier: stats.tier,
        xp: stats.xp,
        coins: stats.coins,
        rank: stats.rank,
        totalDuels: stats.totalDuels,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        perfectGames: stats.perfectGames,
        highestScore: stats.highestScore,
        fastestWin: stats.fastestWin,
        totalXpEarned: stats.totalXpEarned,
        totalXpLost: stats.totalXpLost,
        lastDuelAt: stats.lastDuelAt,
      },
    });
  } catch (error: any) {
    console.error("❌ Stats fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
