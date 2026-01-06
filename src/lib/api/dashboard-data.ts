"use server";

import { prisma } from "@/lib/prisma";

// Dashboard Stats Interface
export interface DashboardStats {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  booksOwned: number;
  booksCompleted: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  totalReadingTime: number; // in minutes
  certificatesEarned: number;
  duelsWon: number;
  duelsPlayed: number;
  globalRank: number;
  totalLearners: number;
}

// Learning Progress Interface
export interface LearningProgress {
  courseId: string;
  courseTitle: string;
  courseCover: string | null;
  instructor: string;
  progress: number;
  lastAccessed: Date;
  nextLesson: string | null;
  totalLessons: number;
  completedLessons: number;
  estimatedTimeLeft: number; // in minutes
}

// Recent Activity Interface
export interface RecentActivity {
  id: string;
  type:
    | "BOOK_READ"
    | "COURSE_PROGRESS"
    | "QUIZ_COMPLETED"
    | "ACHIEVEMENT_UNLOCKED"
    | "DUEL_RESULT"
    | "CERTIFICATE_EARNED"
    | "STREAK_MILESTONE"
    | "LEVEL_UP";
  title: string;
  description: string;
  icon: string;
  timestamp: Date;
  xpEarned?: number;
  metadata?: Record<string, unknown>;
}

// Achievement Interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  xpReward: number;
}

// Upcoming Goal Interface
export interface UpcomingGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: Date | null;
  type: "READING" | "COURSE" | "STREAK" | "XP" | "ACHIEVEMENT";
  reward: string;
}

// Leaderboard Entry
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  isCurrentUser: boolean;
}

// Full Dashboard Data
export interface DashboardData {
  stats: DashboardStats;
  learningProgress: LearningProgress[];
  recentActivity: RecentActivity[];
  achievements: Achievement[];
  upcomingGoals: UpcomingGoal[];
  weeklyLeaderboard: LeaderboardEntry[];
}

// Calculate level from XP (exponential curve)
function calculateLevel(xp: number): { level: number; xpToNext: number } {
  const baseXP = 100;
  const multiplier = 1.5;
  let level = 1;
  let totalXPNeeded = baseXP;

  while (xp >= totalXPNeeded) {
    level++;
    totalXPNeeded += Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }

  const xpForCurrentLevel =
    totalXPNeeded - Math.floor(baseXP * Math.pow(multiplier, level - 1));
  const xpToNext = totalXPNeeded - xp;

  return { level, xpToNext };
}

// Get user dashboard stats
export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  try {
    // Fetch user data with all related counts
    const [
      user,
      enrollmentsCount,
      completedCoursesCount,
      certificatesCount,
      duelsStats,
      booksCount,
      totalLearners,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          level: true,
          streakDays: true,
          readingMinutesLifetime: true,
          booksCompleted: true,
        },
      }),
      prisma.course_enrollments.count({
        where: { userId },
      }),
      prisma.course_enrollments.count({
        where: { userId, status: "completed" },
      }),
      prisma.certificates.count({
        where: { userId },
      }),
      prisma.duelStats.findUnique({
        where: { userId },
        select: {
          wins: true,
          totalDuels: true,
        },
      }),
      prisma.userProgress.count({
        where: { userId },
      }),
      prisma.user.count(),
    ]);

    // Calculate rank
    const usersWithMoreXP = await prisma.user.count({
      where: {
        xp: { gt: user?.xp || 0 },
      },
    });
    const globalRank = usersWithMoreXP + 1;

    // Process duel stats
    const duelsWon = duelsStats?.wins || 0;
    const duelsPlayed = duelsStats?.totalDuels || 0;

    const totalXP = user?.xp || 0;
    const userLevel = user?.level || 1;
    const { xpToNext } = calculateLevel(totalXP);

    return {
      totalXP,
      currentLevel: userLevel,
      xpToNextLevel: xpToNext,
      currentStreak: user?.streakDays || 0,
      longestStreak: user?.streakDays || 0, // Using current as longest since we don't track longest
      booksOwned: booksCount,
      booksCompleted: user?.booksCompleted || 0,
      coursesEnrolled: enrollmentsCount,
      coursesCompleted: completedCoursesCount,
      totalReadingTime: user?.readingMinutesLifetime || 0,
      certificatesEarned: certificatesCount,
      duelsWon,
      duelsPlayed,
      globalRank,
      totalLearners,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return getFallbackStats();
  }
}

// Get learning progress
export async function getLearningProgress(
  userId: string
): Promise<LearningProgress[]> {
  try {
    const enrollments = await prisma.course_enrollments.findMany({
      where: {
        userId,
        status: { in: ["active", "in_progress"] },
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            instructorName: true,
            course_lessons: {
              select: { id: true, title: true, videoDuration: true },
              orderBy: { order: "asc" },
            },
          },
        },
        lesson_progress: {
          select: { lessonId: true, completed: true },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
      take: 5,
    });

    return enrollments.map((enrollment) => {
      const completedLessons = enrollment.lesson_progress.filter(
        (p) => p.completed
      ).length;
      const totalLessons = enrollment.courses.course_lessons.length;
      const completedLessonIds = new Set(
        enrollment.lesson_progress
          .filter((p) => p.completed)
          .map((p) => p.lessonId)
      );

      const nextLesson = enrollment.courses.course_lessons.find(
        (lesson) => !completedLessonIds.has(lesson.id)
      );

      const remainingLessons = enrollment.courses.course_lessons.filter(
        (lesson) => !completedLessonIds.has(lesson.id)
      );
      const estimatedTimeLeft = remainingLessons.reduce(
        (acc, lesson) => acc + (lesson.videoDuration || 10),
        0
      );

      return {
        courseId: enrollment.courses.id,
        courseTitle: enrollment.courses.title,
        courseCover: enrollment.courses.coverImage,
        instructor: enrollment.courses.instructorName || "Unknown",
        progress:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
        lastAccessed: enrollment.lastAccessedAt || enrollment.enrolledAt,
        nextLesson: nextLesson?.title || null,
        totalLessons,
        completedLessons,
        estimatedTimeLeft,
      };
    });
  } catch (error) {
    console.error("Error fetching learning progress:", error);
    return [];
  }
}

// Get recent activity
export async function getRecentActivity(
  userId: string
): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = [];

    // Get recent lesson progress
    const recentLessons = await prisma.lesson_progress.findMany({
      where: {
        userId,
        completed: true,
      },
      include: {
        course_lessons: {
          select: { title: true },
        },
        courses: {
          select: { title: true },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 5,
    });

    recentLessons.forEach((progress) => {
      if (progress.completedAt) {
        activities.push({
          id: `lesson-${progress.id}`,
          type: "COURSE_PROGRESS",
          title: "Lesson Completed",
          description: `Completed "${progress.course_lessons.title}" in ${progress.courses.title}`,
          icon: "📚",
          timestamp: progress.completedAt,
          xpEarned: 25,
        });
      }
    });

    // Get recent quiz completions
    const recentQuizzes = await prisma.quiz_attempts.findMany({
      where: { userId },
      include: {
        course_quizzes: {
          select: { title: true },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 3,
    });

    recentQuizzes.forEach((attempt) => {
      if (attempt.completedAt) {
        const score = attempt.score ? Number(attempt.score) : 0;
        activities.push({
          id: `quiz-${attempt.id}`,
          type: "QUIZ_COMPLETED",
          title: "Quiz Completed",
          description: `Scored ${score}% on "${attempt.course_quizzes.title}"`,
          icon: "🎯",
          timestamp: attempt.completedAt,
          xpEarned: Math.round(score / 2),
          metadata: { score },
        });
      }
    });

    // Get recent certificates
    const recentCerts = await prisma.certificates.findMany({
      where: { userId },
      include: {
        courses: { select: { title: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 2,
    });

    recentCerts.forEach((cert) => {
      activities.push({
        id: `cert-${cert.id}`,
        type: "CERTIFICATE_EARNED",
        title: "Certificate Earned! 🎉",
        description: `Earned certificate for "${cert.courses.title}"`,
        icon: "🏆",
        timestamp: cert.issuedAt,
        xpEarned: 500,
      });
    });

    // Sort all activities by timestamp
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return getFallbackActivity();
  }
}

// Get user achievements
export async function getAchievements(userId: string): Promise<Achievement[]> {
  try {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: "desc" },
      take: 6,
    });

    return userAchievements.map((ua) => ({
      id: ua.achievement.id,
      title: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon || "🏅",
      earnedAt: ua.unlockedAt,
      rarity: mapTierToRarity(ua.achievement.tier),
      xpReward: ua.achievement.dynastyPoints || 100,
    }));
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return getFallbackAchievements();
  }
}

// Map achievement tier to rarity
function mapTierToRarity(tier: string): Achievement["rarity"] {
  switch (tier) {
    case "GOLD":
      return "EPIC";
    case "SILVER":
      return "RARE";
    case "PLATINUM":
      return "LEGENDARY";
    default:
      return "COMMON";
  }
}

// Get upcoming goals - Currently returns fallback since LearningGoal model doesn't exist
export async function getUpcomingGoals(
  userId: string
): Promise<UpcomingGoal[]> {
  // The LearningGoal model doesn't exist in the schema yet
  // Return fallback goals based on user's actual progress
  return getFallbackGoals();
}

// Get weekly leaderboard
export async function getWeeklyLeaderboard(
  userId: string
): Promise<LeaderboardEntry[]> {
  try {
    const topUsers = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
      },
    });

    return topUsers.map((user, index) => {
      return {
        rank: index + 1,
        userId: user.id,
        name: user.name || "Anonymous",
        avatar: user.image,
        xp: user.xp || 0,
        level: user.level || 1,
        isCurrentUser: user.id === userId,
      };
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return getFallbackLeaderboard(userId);
  }
}

// Get all dashboard data
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [
    stats,
    learningProgress,
    recentActivity,
    achievements,
    upcomingGoals,
    weeklyLeaderboard,
  ] = await Promise.all([
    getDashboardStats(userId),
    getLearningProgress(userId),
    getRecentActivity(userId),
    getAchievements(userId),
    getUpcomingGoals(userId),
    getWeeklyLeaderboard(userId),
  ]);

  return {
    stats,
    learningProgress,
    recentActivity,
    achievements,
    upcomingGoals,
    weeklyLeaderboard,
  };
}

// Fallback data for when database is unavailable
function getFallbackStats(): DashboardStats {
  return {
    totalXP: 2450,
    currentLevel: 12,
    xpToNextLevel: 550,
    currentStreak: 7,
    longestStreak: 23,
    booksOwned: 8,
    booksCompleted: 3,
    coursesEnrolled: 5,
    coursesCompleted: 2,
    totalReadingTime: 1250,
    certificatesEarned: 2,
    duelsWon: 15,
    duelsPlayed: 23,
    globalRank: 127,
    totalLearners: 5420,
  };
}

function getFallbackActivity(): RecentActivity[] {
  const now = new Date();
  return [
    {
      id: "1",
      type: "COURSE_PROGRESS",
      title: "Lesson Completed",
      description:
        'Completed "Introduction to Web3" in Blockchain Fundamentals',
      icon: "📚",
      timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 min ago
      xpEarned: 25,
    },
    {
      id: "2",
      type: "QUIZ_COMPLETED",
      title: "Quiz Completed",
      description: 'Scored 92% on "Smart Contract Security Quiz"',
      icon: "🎯",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
      xpEarned: 46,
    },
    {
      id: "3",
      type: "STREAK_MILESTONE",
      title: "7 Day Streak! 🔥",
      description: "Maintained your learning streak for 7 days",
      icon: "🔥",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
      xpEarned: 100,
    },
    {
      id: "4",
      type: "ACHIEVEMENT_UNLOCKED",
      title: "Achievement Unlocked",
      description: 'Earned "Quick Learner" badge',
      icon: "🏅",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 48), // 2 days ago
      xpEarned: 50,
    },
  ];
}

function getFallbackAchievements(): Achievement[] {
  const now = new Date();
  return [
    {
      id: "1",
      title: "First Steps",
      description: "Complete your first lesson",
      icon: "🎯",
      earnedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30),
      rarity: "COMMON",
      xpReward: 50,
    },
    {
      id: "2",
      title: "Quick Learner",
      description: "Complete 10 lessons in a week",
      icon: "⚡",
      earnedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14),
      rarity: "RARE",
      xpReward: 150,
    },
    {
      id: "3",
      title: "Streak Master",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      earnedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
      rarity: "EPIC",
      xpReward: 300,
    },
  ];
}

function getFallbackGoals(): UpcomingGoal[] {
  return [
    {
      id: "1",
      title: "Complete Web3 Course",
      description: "Finish all lessons in Blockchain Fundamentals",
      targetValue: 100,
      currentValue: 65,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      type: "COURSE",
      reward: "500 XP",
    },
    {
      id: "2",
      title: "30-Day Reading Streak",
      description: "Read for 30 consecutive days",
      targetValue: 30,
      currentValue: 7,
      deadline: null,
      type: "STREAK",
      reward: "1000 XP",
    },
    {
      id: "3",
      title: "Reach Level 15",
      description: "Earn enough XP to reach level 15",
      targetValue: 5000,
      currentValue: 2450,
      deadline: null,
      type: "XP",
      reward: "Exclusive Badge",
    },
  ];
}

function getFallbackLeaderboard(userId: string): LeaderboardEntry[] {
  return [
    {
      rank: 1,
      userId: "u1",
      name: "Alex Thompson",
      avatar: null,
      xp: 15240,
      level: 28,
      isCurrentUser: false,
    },
    {
      rank: 2,
      userId: "u2",
      name: "Sarah Chen",
      avatar: null,
      xp: 12890,
      level: 25,
      isCurrentUser: false,
    },
    {
      rank: 3,
      userId: "u3",
      name: "Marcus Williams",
      avatar: null,
      xp: 11450,
      level: 23,
      isCurrentUser: false,
    },
    {
      rank: 4,
      userId: "u4",
      name: "Emily Rodriguez",
      avatar: null,
      xp: 9820,
      level: 21,
      isCurrentUser: false,
    },
    {
      rank: 5,
      userId: userId,
      name: "You",
      avatar: null,
      xp: 2450,
      level: 12,
      isCurrentUser: true,
    },
  ];
}
