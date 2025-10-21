import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET /api/user/stats - Get current user stats
// GET /api/user/[userId]/stats - Get specific user stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requesting another user's stats (from URL path)
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const isUserSpecific =
      pathParts.includes("user") &&
      pathParts[pathParts.indexOf("user") + 1] !== "stats";
    const targetUserId = isUserSpecific
      ? pathParts[pathParts.indexOf("user") + 1]
      : session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        dynastyScore: true,
        level: true,
        streakDays: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate XP for current and next level
    const level = user.level || 1;
    const totalXP = user.dynastyScore || 0;

    function getXPForLevel(lvl: number): number {
      return Math.floor(1000 * Math.pow(1.5, lvl - 1));
    }

    function getUserTitle(lvl: number): string {
      if (lvl >= 100) return "🔱 Dynasty Emperor";
      if (lvl >= 76) return "👑 Diamond Dynasty";
      if (lvl >= 51) return "💎 Platinum Dynasty";
      if (lvl >= 26) return "🥇 Gold Dynasty";
      if (lvl >= 11) return "🥈 Silver Dynasty";
      if (lvl >= 6) return "🥉 Bronze Dynasty";
      return "🌟 Rising Dynasty";
    }

    const xpCurrentLevel = getXPForLevel(level);
    const xpToNextLevel = getXPForLevel(level + 1);

    return NextResponse.json({
      level,
      xp: totalXP,
      xpCurrentLevel,
      xpToNextLevel,
      title: getUserTitle(level),
      totalXP,
      progress:
        ((totalXP - xpCurrentLevel) / (xpToNextLevel - xpCurrentLevel)) * 100,
    });
  } catch (error) {
    console.error("[User Stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
