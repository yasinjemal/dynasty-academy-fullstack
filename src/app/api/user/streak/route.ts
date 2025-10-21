import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET /api/user/streak - Get current user streak
// GET /api/user/[userId]/streak - Get specific user streak
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requesting another user's streak
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const isUserSpecific =
      pathParts.includes("user") &&
      pathParts[pathParts.indexOf("user") + 1] !== "streak";
    const targetUserId = isUserSpecific
      ? pathParts[pathParts.indexOf("user") + 1]
      : session.user.id;

    // Get user's streak data
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        streakDays: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check listening streak
    const listeningStreak = await prisma.listeningStreak.findUnique({
      where: { userId: targetUserId },
    });

    // Calculate if streak is active (last activity within 24 hours)
    const now = new Date();
    const lastActive = user.lastActiveAt || new Date(0);
    const hoursSinceActive =
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    const isActive = hoursSinceActive < 24;

    // Calculate days until streak breaks
    const hoursUntilBreak = 24 - hoursSinceActive;
    const daysUntilBreak = Math.ceil(hoursUntilBreak / 24);

    // Total active days (from various activities)
    const totalDaysActive = await prisma.dynastyActivity.count({
      where: {
        userId: targetUserId,
      },
    });

    const currentStreak = user.streakDays || 0;
    const longestStreak = listeningStreak?.longestStreak || currentStreak;

    return NextResponse.json({
      streak: {
        current: currentStreak,
        longest: longestStreak,
        isActive,
        daysUntilBreak,
        totalDays: totalDaysActive,
        lastActive: lastActive.toISOString(),
      },
    });
  } catch (error) {
    console.error("[User Streak] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user streak" },
      { status: 500 }
    );
  }
}
