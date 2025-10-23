import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard } from "@/lib/engagement/gamification";

/**
 * GET /api/engagement/leaderboard?period=all_time&limit=10
 * Get leaderboard rankings
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") || "all_time") as
      | "daily"
      | "weekly"
      | "all_time";
    const limit = parseInt(searchParams.get("limit") || "10");

    const leaderboard = await getLeaderboard(period, limit);

    return NextResponse.json({
      success: true,
      leaderboard,
      period,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
