import { PrismaClient } from "@prisma/client";

/**
 * Gamification System
 * XP, Achievements, Levels, and Leaderboards
 */

export interface XPGain {
  action: string;
  xp: number;
  multiplier?: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  rewards: string[];
}

// XP rewards for different actions
export const XP_REWARDS: Record<string, number> = {
  // Lessons
  lesson_start: 5,
  lesson_complete: 50,
  lesson_perfect: 100, // 100% quiz score

  // Courses
  course_enroll: 10,
  course_complete: 500,
  course_certificate: 200,

  // Quizzes
  quiz_attempt: 10,
  quiz_pass: 30,
  quiz_perfect: 100,

  // Engagement
  daily_login: 10,
  streak_milestone: 50, // Per milestone
  comment_post: 5,
  comment_helpful: 10,

  // Social
  share_content: 15,
  refer_friend: 100,
  help_peer: 25,

  // Books
  book_chapter_complete: 20,
  book_complete: 300,
  book_review: 25,

  // AI Features
  ai_chat_helpful: 5,
  content_generated: 10,
};

// Level progression (XP required for each level)
export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Novice", xpRequired: 0, rewards: ["Welcome Badge"] },
  { level: 2, title: "Learner", xpRequired: 100, rewards: ["Learner Badge"] },
  { level: 3, title: "Student", xpRequired: 250, rewards: ["Student Badge"] },
  {
    level: 4,
    title: "Scholar",
    xpRequired: 500,
    rewards: ["Scholar Badge", "1 Streak Freeze"],
  },
  { level: 5, title: "Expert", xpRequired: 1000, rewards: ["Expert Badge"] },
  {
    level: 6,
    title: "Master",
    xpRequired: 2000,
    rewards: ["Master Badge", "2 Streak Freezes"],
  },
  { level: 7, title: "Sage", xpRequired: 4000, rewards: ["Sage Badge"] },
  {
    level: 8,
    title: "Guru",
    xpRequired: 7000,
    rewards: ["Guru Badge", "5% Discount"],
  },
  {
    level: 9,
    title: "Legend",
    xpRequired: 12000,
    rewards: ["Legend Badge", "3 Streak Freezes"],
  },
  {
    level: 10,
    title: "Grandmaster",
    xpRequired: 20000,
    rewards: ["Grandmaster Badge", "10% Lifetime Discount", "Early Access"],
  },
];

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Calculate progress to next level
 */
export function calculateLevelProgress(totalXP: number): {
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  progressXP: number;
  requiredXP: number;
  progressPercentage: number;
} {
  const currentLevel = calculateLevel(totalXP);
  const currentIndex = LEVELS.findIndex((l) => l.level === currentLevel.level);
  const nextLevel =
    currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progressXP: 0,
      requiredXP: 0,
      progressPercentage: 100,
    };
  }

  const progressXP = totalXP - currentLevel.xpRequired;
  const requiredXP = nextLevel.xpRequired - currentLevel.xpRequired;
  const progressPercentage = Math.floor((progressXP / requiredXP) * 100);

  return {
    currentLevel,
    nextLevel,
    progressXP,
    requiredXP,
    progressPercentage,
  };
}

/**
 * Award XP to user
 */
export async function awardXP(
  userId: string,
  action: string,
  multiplier: number = 1
): Promise<{ newXP: number; newLevel: LevelInfo; leveledUp: boolean }> {
  const prisma = new PrismaClient();

  try {
    const baseXP = XP_REWARDS[action] || 0;
    const xpGained = Math.floor(baseXP * multiplier);

    // Get or create user profile
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const oldXP = user.xp || 0;
    const newXP = oldXP + xpGained;

    const oldLevel = calculateLevel(oldXP);
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel.level > oldLevel.level;

    // Update user XP
    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXP },
    });

    // If leveled up, award level rewards
    if (leveledUp) {
      // Award streak freezes if included in rewards
      const freezeReward = newLevel.rewards.find((r) => r.includes("Freeze"));
      if (freezeReward) {
        const freezeCount = parseInt(freezeReward.match(/\d+/)?.[0] || "0");

        const streak = await prisma.streak.findUnique({
          where: { userId },
        });

        if (streak) {
          await prisma.streak.update({
            where: { userId },
            data: {
              freezesAvailable: streak.freezesAvailable + freezeCount,
            },
          });
        }
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: "ACHIEVEMENT",
          title: `Level Up! You're now ${newLevel.title}!`,
          message: `Congratulations! You've reached level ${
            newLevel.level
          } and earned: ${newLevel.rewards.join(", ")}`,
          actionUrl: "/dashboard",
        },
      });
    }

    return { newXP, newLevel, leveledUp };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  period: "daily" | "weekly" | "all_time" = "all_time",
  limit: number = 10
): Promise<
  Array<{
    userId: string;
    name: string;
    image: string | null;
    xp: number;
    level: number;
    rank: number;
  }>
> {
  const prisma = new PrismaClient();

  try {
    // For daily/weekly, we'd need to track XP gains with timestamps
    // For now, implementing all_time leaderboard

    const users = await prisma.user.findMany({
      where: {
        role: "USER", // Students are role USER
      },
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
      },
      orderBy: {
        xp: "desc",
      },
      take: limit,
    });

    return users.map((user, index) => ({
      userId: user.id,
      name: user.name || "Anonymous",
      image: user.image,
      xp: user.xp || 0,
      level: calculateLevel(user.xp || 0).level,
      rank: index + 1,
    }));
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get user's leaderboard position
 */
export async function getUserRank(userId: string): Promise<{
  rank: number;
  totalUsers: number;
  percentile: number;
}> {
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Count users with more XP (excluding admins and moderators)
    const usersAhead = await prisma.user.count({
      where: {
        role: {
          notIn: ["ADMIN", "MODERATOR"],
        },
        xp: {
          gt: user.xp || 0,
        },
      },
    });

    // Total active users (excluding admins and moderators)
    const totalUsers = await prisma.user.count({
      where: {
        role: {
          notIn: ["ADMIN", "MODERATOR"],
        },
      },
    });

    const rank = usersAhead + 1;
    const percentile =
      totalUsers > 0 ? Math.floor(((totalUsers - rank) / totalUsers) * 100) : 0;

    return { rank, totalUsers, percentile };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check and unlock achievements
 */
export async function checkAchievements(userId: string): Promise<string[]> {
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: true,
        progress: true,
        streak: true,
      },
    });

    if (!user) return [];

    const unlockedAchievements: string[] = [];

    // Check various achievement conditions
    // This would integrate with your Achievement model

    // Example: First lesson completed
    if (user.progress.length >= 1) {
      // Check if "First Steps" achievement exists and isn't already unlocked
      // unlock achievement
    }

    // Example: Course completed
    const completedCourses = user.enrollments.filter(
      (e) => e.completionDate
    ).length;
    if (completedCourses >= 1) {
      // Unlock "Graduate" achievement
    }

    // Example: Streak milestones
    if (user.streak?.currentStreak >= 7) {
      // Unlock "Week Warrior" achievement
    }

    return unlockedAchievements;
  } finally {
    await prisma.$disconnect();
  }
}
