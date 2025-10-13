import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// ============================================
// LISTENING PROGRESS API - Multi-Device Cloud Sync
// ============================================

// POST /api/listening/progress - Save progress
// GET /api/listening/progress?bookSlug=X&chapterNumber=Y - Load progress

const progressSchema = z.object({
  bookSlug: z.string(),
  chapterNumber: z.number().int().positive(),
  position: z.number().min(0),
  duration: z.number().min(0),
  speed: z.number().min(0.5).max(3.0),
  voiceId: z.string(),
  completed: z.boolean().optional().default(false),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

// Save progress (upsert)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = progressSchema.parse(body);

    // Get book by slug
    const book = await prisma.book.findUnique({
      where: { slug: data.bookSlug },
      select: { id: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Upsert progress
    const progress = await prisma.listeningProgress.upsert({
      where: {
        userId_bookId_chapterNumber: {
          userId: session.user.id,
          bookId: book.id,
          chapterNumber: data.chapterNumber,
        },
      },
      update: {
        position: data.position,
        duration: data.duration,
        speed: data.speed,
        voiceId: data.voiceId,
        completed: data.completed,
        lastListened: new Date(),
        deviceId: data.deviceId,
        deviceName: data.deviceName,
      },
      create: {
        userId: session.user.id,
        bookId: book.id,
        chapterNumber: data.chapterNumber,
        position: data.position,
        duration: data.duration,
        speed: data.speed,
        voiceId: data.voiceId,
        completed: data.completed,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
      },
    });

    // 🎉 SURPRISE #1: Auto-update streak when user listens!
    await updateListeningStreak(session.user.id);

    // 🎉 SURPRISE #2: Check if user unlocked achievements!
    await checkAchievements(session.user.id, {
      listenedToday: true,
      completedChapter: data.completed,
      duration: data.duration,
      speed: data.speed,
    });

    return NextResponse.json({
      success: true,
      progress,
      message: "Progress saved successfully",
    });
  } catch (error: any) {
    console.error("[Progress API] Error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}

// Load progress
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookSlug = searchParams.get("bookSlug");
    const chapterNumber = searchParams.get("chapterNumber");

    if (!bookSlug) {
      return NextResponse.json(
        { error: "bookSlug is required" },
        { status: 400 }
      );
    }

    // Get book
    const book = await prisma.book.findUnique({
      where: { slug: bookSlug },
      select: { id: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // If chapter specified, get specific progress
    if (chapterNumber) {
      const progress = await prisma.listeningProgress.findUnique({
        where: {
          userId_bookId_chapterNumber: {
            userId: session.user.id,
            bookId: book.id,
            chapterNumber: parseInt(chapterNumber),
          },
        },
      });

      return NextResponse.json({ progress });
    }

    // Otherwise, get all progress for this book
    const allProgress = await prisma.listeningProgress.findMany({
      where: {
        userId: session.user.id,
        bookId: book.id,
      },
      orderBy: {
        lastListened: "desc",
      },
    });

    return NextResponse.json({ progress: allProgress });
  } catch (error) {
    console.error("[Progress API] Error:", error);
    return NextResponse.json(
      { error: "Failed to load progress" },
      { status: 500 }
    );
  }
}

// ============================================
// 🎉 SURPRISE: Auto-update listening streak
// ============================================
async function updateListeningStreak(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.listeningStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // Create first streak
      await prisma.listeningStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastListenDate: today,
          totalMinutes: 0,
          totalSessions: 1,
        },
      });
      return;
    }

    const lastListenDate = new Date(streak.lastListenDate);
    lastListenDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastListenDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day, just increment sessions
      await prisma.listeningStreak.update({
        where: { userId },
        data: {
          totalSessions: streak.totalSessions + 1,
        },
      });
    } else if (daysDiff === 1) {
      // Next day, increment streak
      const newStreak = streak.currentStreak + 1;
      await prisma.listeningStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streak.longestStreak),
          lastListenDate: today,
          totalSessions: streak.totalSessions + 1,
        },
      });
    } else {
      // Streak broken, reset to 1
      await prisma.listeningStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastListenDate: today,
          totalSessions: streak.totalSessions + 1,
        },
      });
    }
  } catch (error) {
    console.error("[Streak] Error:", error);
  }
}

// ============================================
// 🎉 SURPRISE: Auto-check achievements
// ============================================
async function checkAchievements(
  userId: string,
  context: {
    listenedToday: boolean;
    completedChapter: boolean;
    duration: number;
    speed: number;
  }
) {
  try {
    // Get user's current achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const unlockedKeys = new Set(
      userAchievements.map((ua) => ua.achievement.key)
    );

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();

    // Check each achievement
    const newUnlocks: string[] = [];

    for (const achievement of allAchievements) {
      if (unlockedKeys.has(achievement.key)) continue;

      let shouldUnlock = false;

      // First Listen
      if (achievement.key === "first_listen" && context.listenedToday) {
        shouldUnlock = true;
      }

      // Night Owl (after 10 PM)
      if (achievement.key === "night_owl" && context.listenedToday) {
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 6) {
          shouldUnlock = true;
        }
      }

      // Early Bird (before 6 AM)
      if (achievement.key === "early_bird" && context.listenedToday) {
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 6) {
          shouldUnlock = true;
        }
      }

      // Speed Demon (2x speed for 30 minutes)
      if (achievement.key === "speed_demon" && context.speed >= 2.0) {
        const minutes = context.duration / 60;
        if (minutes >= 30) {
          shouldUnlock = true;
        }
      }

      // Unlock achievement
      if (shouldUnlock) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: achievement.requirement,
          },
        });
        newUnlocks.push(achievement.key);

        // Award Dynasty Points
        await prisma.user.update({
          where: { id: userId },
          data: {
            dynastyScore: {
              increment: achievement.dynastyPoints,
            },
          },
        });
      }
    }

    if (newUnlocks.length > 0) {
      console.log(`[Achievements] User ${userId} unlocked:`, newUnlocks);
    }
  } catch (error) {
    console.error("[Achievements] Error:", error);
  }
}
