import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { checkLikeLimit } from "@/lib/narration/rateLimit";

/**
 * 🎙️ COMMUNITY NARRATOR - LIKE ENDPOINT
 *
 * Like system with:
 * - Auth required
 * - Rate limiting (30 likes per 10 minutes)
 * - One like per user per narration
 * - Toggle behavior (like/unlike)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: narrationId } = await params;

    // Auth required for likes
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to like narrations" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limiting
    const rateLimit = await checkLikeLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many likes. Try again after ${rateLimit.resetAt.toLocaleTimeString()}`,
          resetAt: rateLimit.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    // Check if already liked
    const existingLike = await prisma.narrationLike.findUnique({
      where: {
        narrationId_userId: {
          narrationId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike (toggle behavior)
      await prisma.narrationLike.delete({
        where: { id: existingLike.id },
      });

      // Decrement like count
      await prisma.communityNarration.update({
        where: { id: narrationId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        action: "unliked",
        message: "Like removed",
      });
    } else {
      // Like
      await prisma.narrationLike.create({
        data: {
          narrationId,
          userId,
        },
      });

      // Increment like count
      const narration = await prisma.communityNarration.update({
        where: { id: narrationId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
        select: {
          likeCount: true,
        },
      });

      return NextResponse.json({
        success: true,
        action: "liked",
        message: "Like added",
        likeCount: narration.likeCount,
      });
    }
  } catch (error) {
    console.error("❌ Error toggling like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET - Check like status for current user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: narrationId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        liked: false,
        likeCount: 0,
      });
    }

    const userId = session.user.id;

    // Check if user liked this narration
    const existingLike = await prisma.narrationLike.findUnique({
      where: {
        narrationId_userId: {
          narrationId,
          userId,
        },
      },
    });

    // Get total like count
    const narration = await prisma.communityNarration.findUnique({
      where: { id: narrationId },
      select: { likeCount: true },
    });

    return NextResponse.json({
      liked: !!existingLike,
      likeCount: narration?.likeCount || 0,
    });
  } catch (error) {
    console.error("❌ Error checking like status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
