import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateEngagementScore } from "@/lib/engagement/prediction";

/**
 * POST /api/engagement/calculate
 * Calculate and save engagement score for a user
 * This triggers the AI prediction engine
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    // Only allow users to calculate their own score, or admins to calculate any
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUserId = userId || session.user.id;

    // Run the AI prediction
    const prediction = await calculateEngagementScore(targetUserId);

    return NextResponse.json({
      success: true,
      prediction,
      message: "Engagement score calculated successfully",
    });
  } catch (error) {
    console.error("Error calculating engagement score:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate engagement score",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/engagement/calculate?userId=xxx
 * Get the latest engagement score for a user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Only allow users to view their own score, or admins to view any
    if (userId && userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUserId = userId || session.user.id;

    // Get from database instead of recalculating
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const engagementScore = await prisma.engagementScore.findUnique({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    await prisma.$disconnect();

    if (!engagementScore) {
      return NextResponse.json(
        {
          error: "No engagement score found",
          message: "Run calculation first",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      engagementScore,
    });
  } catch (error) {
    console.error("Error fetching engagement score:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch engagement score",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
