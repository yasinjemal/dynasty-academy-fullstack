import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { getIpHash, getTodayString } from "@/lib/narration/textNormalization";

/**
 * 🎙️ COMMUNITY NARRATOR - PLAY COUNTING ENDPOINT
 *
 * Anti-fraud play counting:
 * - Deduplicate by (narrationId, userId, ipHash, day)
 * - Hash IP + User Agent + Day to prevent spam
 * - Atomic increment to prevent race conditions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: narrationId } = await params;

    if (!narrationId) {
      return NextResponse.json(
        { error: "Missing narration ID" },
        { status: 400 }
      );
    }

    // Get user ID if authenticated (optional)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Get IP and User Agent for fraud prevention
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const day = getTodayString(); // YYYY-MM-DD

    // Generate IP hash for deduplication
    const ipHash = getIpHash(ip, userAgent, day);

    // Try to insert play record (fails if duplicate)
    try {
      await prisma.narrationPlay.create({
        data: {
          narrationId,
          userId,
          ipHash,
          day: new Date(day),
        },
      });

      // Increment play count
      await prisma.communityNarration.update({
        where: { id: narrationId },
        data: {
          playCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Play counted",
      });
    } catch (error: any) {
      // Unique constraint violation = already played today
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            message: "Already counted for today",
          },
          { status: 200 }
        ); // Not an error, just already counted
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ Error counting play:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET play statistics for a narration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: narrationId } = await params;

    // Get total plays
    const narration = await prisma.communityNarration.findUnique({
      where: { id: narrationId },
      select: {
        playCount: true,
        likeCount: true,
      },
    });

    if (!narration) {
      return NextResponse.json(
        { error: "Narration not found" },
        { status: 404 }
      );
    }

    // Get unique listeners (distinct users)
    const uniqueListeners = await prisma.narrationPlay.findMany({
      where: { narrationId },
      distinct: ["userId"],
      select: { userId: true },
    });

    // Get plays in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPlays = await prisma.narrationPlay.count({
      where: {
        narrationId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      playCount: narration.playCount,
      likeCount: narration.likeCount,
      uniqueListeners: uniqueListeners.length,
      recentPlays,
    });
  } catch (error) {
    console.error("❌ Error getting play stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
