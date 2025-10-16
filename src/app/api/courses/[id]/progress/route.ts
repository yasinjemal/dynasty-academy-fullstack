import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// GET /api/courses/[id]/progress - Fetch detailed progress analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    // TODO: Replace with actual Prisma queries
    // const courseProgress = await prisma.enhancedLessonProgress.findMany({
    //   where: { userId, lesson: { courseId: params.id } },
    //   include: { lesson: true }
    // });

    // const streak = await prisma.studyStreak.findUnique({
    //   where: { userId }
    // });

    // const recentSessions = await prisma.dailyStudySession.findMany({
    //   where: { userId },
    //   orderBy: { date: 'desc' },
    //   take: 7
    // });

    // Mock data
    const mockData = {
      currentLesson: {
        title: "Understanding React Hooks",
        progress: 65,
        totalTimeSpent: 2700, // 45 minutes
        watchCount: 2,
      },
      courseStats: {
        totalLessons: 24,
        completedLessons: 8,
        totalTimeSpent: 18000, // 5 hours
        averageSpeed: 1.25,
      },
      streak: {
        current: 7,
        longest: 14,
        lastStudyDate: new Date().toISOString().split("T")[0],
        studyDates: Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          // Randomly mark some days as studied (for demo)
          if (Math.random() > 0.4) {
            return date.toISOString().split("T")[0];
          }
          return null;
        }).filter(Boolean) as string[],
      },
      weeklyActivity: [
        { date: "Mon", minutes: 45, lessons: 2 },
        { date: "Tue", minutes: 60, lessons: 3 },
        { date: "Wed", minutes: 30, lessons: 1 },
        { date: "Thu", minutes: 75, lessons: 3 },
        { date: "Fri", minutes: 50, lessons: 2 },
        { date: "Sat", minutes: 90, lessons: 4 },
        { date: "Sun", minutes: 40, lessons: 2 },
      ],
      recentSessions: [
        {
          date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 2700, // 45 min
          lessons: ["Lesson 1", "Lesson 2"],
        },
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 3600, // 60 min
          lessons: ["Lesson 3", "Lesson 4", "Lesson 5"],
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 1800, // 30 min
          lessons: ["Lesson 6"],
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 4500, // 75 min
          lessons: ["Lesson 7", "Lesson 8", "Lesson 9"],
        },
        {
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 3000, // 50 min
          lessons: ["Lesson 10", "Lesson 11"],
        },
      ],
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/progress - Update progress metrics
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      lessonId,
      timeSpent,
      playbackSpeed,
      pauseCount,
      seekCount,
      completed,
    } = body;

    // TODO: Replace with actual Prisma transaction
    // await prisma.$transaction(async (tx) => {
    //   // Update enhanced lesson progress
    //   await tx.enhancedLessonProgress.upsert({
    //     where: {
    //       userId_lessonId: {
    //         userId: session.user.id,
    //         lessonId,
    //       }
    //     },
    //     update: {
    //       totalTimeSpent: { increment: timeSpent },
    //       playbackSpeed,
    //       pauseCount: { increment: pauseCount },
    //       seekCount: { increment: seekCount },
    //       isCompleted: completed,
    //       lastWatchedAt: new Date(),
    //     },
    //     create: {
    //       userId: session.user.id,
    //       lessonId,
    //       totalTimeSpent: timeSpent,
    //       playbackSpeed,
    //       pauseCount,
    //       seekCount,
    //       isCompleted: completed,
    //     }
    //   });

    //   // Update study streak
    //   const today = new Date().toISOString().split('T')[0];
    //   await tx.studyStreak.upsert({
    //     where: { userId: session.user.id },
    //     update: {
    //       lastStudyDate: new Date(),
    //       totalStudyTime: { increment: Math.floor(timeSpent / 60) },
    //     },
    //     create: {
    //       userId: session.user.id,
    //       currentStreak: 1,
    //       longestStreak: 1,
    //       lastStudyDate: new Date(),
    //       studyDates: [today],
    //     }
    //   });

    //   // Update daily session
    //   await tx.dailyStudySession.upsert({
    //     where: {
    //       userId_date: {
    //         userId: session.user.id,
    //         date: new Date(),
    //       }
    //     },
    //     update: {
    //       totalTime: { increment: Math.floor(timeSpent / 60) },
    //       lessonsWatched: { increment: 1 },
    //     },
    //     create: {
    //       userId: session.user.id,
    //       date: new Date(),
    //       totalTime: Math.floor(timeSpent / 60),
    //       lessonsWatched: 1,
    //     }
    //   });
    // });

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
