import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * 🏆 LEADERBOARD API
 * Global rankings, tier rankings, book-specific leaderboards
 * Where legends are made! ⚡
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type") || "global"; // global, tier, book
    const tier = searchParams.get("tier");
    const bookId = searchParams.get("bookId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let leaderboard: any[] = [];
    let total = 0;

    if (type === "global") {
      // 🌍 GLOBAL LEADERBOARD
      const stats = await prisma.duelStats.findMany({
        where: {
          totalDuels: {
            gt: 0, // Only users who have played
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: [{ xp: "desc" }, { wins: "desc" }, { currentStreak: "desc" }],
        take: limit,
        skip: offset,
      });

      total = await prisma.duelStats.count({
        where: {
          totalDuels: { gt: 0 },
        },
      });

      leaderboard = stats.map((stat, index) => ({
        rank: offset + index + 1,
        userId: stat.userId,
        user: stat.user,
        tier: stat.tier,
        xp: stat.xp,
        wins: stat.wins,
        losses: stat.losses,
        draws: stat.draws,
        winRate:
          stat.totalDuels > 0
            ? Math.round((stat.wins / stat.totalDuels) * 100)
            : 0,
        currentStreak: stat.currentStreak,
        longestStreak: stat.longestStreak,
        perfectGames: stat.perfectGames,
        highestScore: stat.highestScore,
        totalDuels: stat.totalDuels,
      }));
    } else if (type === "tier" && tier) {
      // 🏅 TIER-SPECIFIC LEADERBOARD
      const stats = await prisma.duelStats.findMany({
        where: {
          tier: tier.toUpperCase(),
          totalDuels: {
            gt: 0,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: [{ xp: "desc" }, { wins: "desc" }, { currentStreak: "desc" }],
        take: limit,
        skip: offset,
      });

      total = await prisma.duelStats.count({
        where: {
          tier: tier.toUpperCase(),
          totalDuels: { gt: 0 },
        },
      });

      leaderboard = stats.map((stat, index) => ({
        rank: offset + index + 1,
        userId: stat.userId,
        user: stat.user,
        tier: stat.tier,
        xp: stat.xp,
        wins: stat.wins,
        losses: stat.losses,
        draws: stat.draws,
        winRate:
          stat.totalDuels > 0
            ? Math.round((stat.wins / stat.totalDuels) * 100)
            : 0,
        currentStreak: stat.currentStreak,
        longestStreak: stat.longestStreak,
        perfectGames: stat.perfectGames,
        highestScore: stat.highestScore,
        totalDuels: stat.totalDuels,
      }));
    } else if (type === "book" && bookId) {
      // 📚 BOOK-SPECIFIC LEADERBOARD
      const allStats = await prisma.duelStats.findMany({
        where: {
          totalDuels: {
            gt: 0,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      // Filter and sort by book stats
      const bookLeaderboard = allStats
        .map((stat) => {
          const bookStats = (stat.bookStats as any)?.[bookId];
          if (!bookStats || bookStats.totalDuels === 0) {
            return null;
          }

          return {
            userId: stat.userId,
            user: stat.user,
            tier: stat.tier,
            xp: stat.xp,
            totalDuels: bookStats.totalDuels,
            wins: bookStats.wins,
            losses: bookStats.losses,
            winRate:
              bookStats.totalDuels > 0
                ? Math.round((bookStats.wins / bookStats.totalDuels) * 100)
                : 0,
            avgScore: bookStats.avgScore,
            totalScore: bookStats.totalScore,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => {
          // Sort by avg score, then total duels, then win rate
          if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
          if (b.totalDuels !== a.totalDuels) return b.totalDuels - a.totalDuels;
          return b.winRate - a.winRate;
        });

      total = bookLeaderboard.length;
      leaderboard = bookLeaderboard
        .slice(offset, offset + limit)
        .map((entry, index) => ({
          rank: offset + index + 1,
          ...entry,
        }));
    } else {
      return NextResponse.json(
        {
          error: "Invalid leaderboard type or missing parameters",
        },
        { status: 400 }
      );
    }

    // Get current user's position if logged in
    let userPosition = null;
    if (session?.user?.id) {
      if (type === "global") {
        const allStats = await prisma.duelStats.findMany({
          where: { totalDuels: { gt: 0 } },
          orderBy: [
            { xp: "desc" },
            { wins: "desc" },
            { currentStreak: "desc" },
          ],
          select: { userId: true },
        });
        const rank =
          allStats.findIndex((s) => s.userId === session.user.id) + 1;
        if (rank > 0) {
          userPosition = {
            rank,
            isOnLeaderboard: rank <= limit,
          };
        }
      }
    }

    console.log(
      `🏆 Leaderboard fetched: ${type} (${leaderboard.length} entries)`
    );

    return NextResponse.json({
      success: true,
      type,
      leaderboard,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      userPosition,
    });
  } catch (error: any) {
    console.error("❌ Leaderboard error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
