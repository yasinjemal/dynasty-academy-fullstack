import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/engagement/streak?userId=xxx
 * Get streak status for a user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Only allow users to view their own streak, or admins to view any
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    let streak = await prisma.streak.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create initial streak if doesn't exist
    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date(),
          freezesAvailable: 0,
          milestones: [],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      streak,
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch streak",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/engagement/streak
 * Update streak (called when user completes activity)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let streak = await prisma.streak.findUnique({
      where: { userId: session.user.id },
    });

    if (!streak) {
      // Create new streak
      streak = await prisma.streak.create({
        data: {
          userId: session.user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          freezesAvailable: 0,
          milestones: [],
        },
      });
    } else {
      const lastActive = new Date(streak.lastActiveDate);
      const lastActiveDay = new Date(
        lastActive.getFullYear(),
        lastActive.getMonth(),
        lastActive.getDate()
      );
      const daysDiff = Math.floor(
        (today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Already active today, no change
        await prisma.$disconnect();
        return NextResponse.json({
          success: true,
          streak,
          message: "Already active today",
        });
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        const newStreak = streak.currentStreak + 1;
        const milestones = [...(streak.milestones as number[])];

        // Check for milestone achievements
        if (
          [7, 14, 30, 60, 100, 365].includes(newStreak) &&
          !milestones.includes(newStreak)
        ) {
          milestones.push(newStreak);
        }

        // Award freeze at milestones
        let freezesAwarded = 0;
        if ([7, 30, 100].includes(newStreak)) {
          freezesAwarded = 1;
        }

        streak = await prisma.streak.update({
          where: { userId: session.user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(streak.longestStreak, newStreak),
            lastActiveDate: today,
            freezesAvailable: streak.freezesAvailable + freezesAwarded,
            milestones,
          },
        });
      } else if (daysDiff === 2 && streak.freezesAvailable > 0) {
        // Missed one day but have freeze available
        streak = await prisma.streak.update({
          where: { userId: session.user.id },
          data: {
            currentStreak: streak.currentStreak + 1,
            lastActiveDate: today,
            freezesAvailable: streak.freezesAvailable - 1,
          },
        });
      } else {
        // Streak broken - reset
        streak = await prisma.streak.update({
          where: { userId: session.user.id },
          data: {
            currentStreak: 1,
            lastActiveDate: today,
          },
        });
      }
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      streak,
      message: "Streak updated successfully",
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      {
        error: "Failed to update streak",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
