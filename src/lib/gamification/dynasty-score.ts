/**
 * Dynasty Score System
 *
 * A global reputation ranking system that rewards:
 * - Course completion
 * - High quiz scores
 * - Consistent learning streaks
 * - Community contributions
 * - Course creation (instructors)
 * - Helpful comments
 * - Peer mentoring
 *
 * Unlocks perks at milestones:
 * - Bronze (100): Profile badge
 * - Silver (500): Early access to new courses
 * - Gold (1500): 10% discount on all courses
 * - Platinum (3000): Free course monthly
 * - Diamond (5000): Instructor certification
 * - Legend (10000): Lifetime premium access
 */

import { prisma } from "@/lib/db";

export type DynastyTier =
  | "Novice" // 0-99
  | "Bronze" // 100-499
  | "Silver" // 500-1499
  | "Gold" // 1500-2999
  | "Platinum" // 3000-4999
  | "Diamond" // 5000-9999
  | "Legend"; // 10000+

export interface DynastyScore {
  userId: string;
  totalScore: number;
  tier: DynastyTier;
  breakdown: {
    coursesCompleted: number;
    quizAverage: number;
    streakDays: number;
    commentsHelpful: number;
    coursesCreated: number;
    mentoringSessions: number;
  };
  perks: string[];
  nextMilestone: {
    tier: DynastyTier;
    pointsNeeded: number;
    unlocks: string[];
  };
  rank: number; // Global ranking
  percentile: number; // Top X%
}

/**
 * Calculate user's Dynasty Score
 */
export async function calculateDynastyScore(
  userId: string
): Promise<DynastyScore> {
  const [
    coursesCompleted,
    quizAverage,
    streakDays,
    commentsHelpful,
    coursesCreated,
    mentoringSessions,
  ] = await Promise.all([
    getCoursesCompleted(userId),
    getQuizAverage(userId),
    getStreakDays(userId),
    getHelpfulComments(userId),
    getCoursesCreated(userId),
    getMentoringSessions(userId),
  ]);

  // Point calculation
  const points = {
    courses: coursesCompleted * 100, // 100 pts per course
    quizzes: Math.round(quizAverage * 10), // Up to 1000 pts for perfect quizzes
    streak: streakDays * 5, // 5 pts per day streak
    comments: commentsHelpful * 20, // 20 pts per helpful comment
    created: coursesCreated * 500, // 500 pts per course created
    mentoring: mentoringSessions * 50, // 50 pts per mentoring session
  };

  const totalScore = Object.values(points).reduce((sum, val) => sum + val, 0);

  const tier = getTier(totalScore);
  const perks = getPerks(tier);
  const nextMilestone = getNextMilestone(totalScore, tier);

  // Global ranking (mock for now)
  const rank = await getGlobalRank(userId, totalScore);
  const percentile = await getPercentile(totalScore);

  return {
    userId,
    totalScore,
    tier,
    breakdown: {
      coursesCompleted,
      quizAverage,
      streakDays,
      commentsHelpful,
      coursesCreated,
      mentoringSessions,
    },
    perks,
    nextMilestone,
    rank,
    percentile,
  };
}

/**
 * Get courses completed count
 */
async function getCoursesCompleted(userId: string): Promise<number> {
  // TODO: Implement actual progress tracking
  // This would query UserProgress or similar table
  return Math.floor(Math.random() * 15);
}

/**
 * Get average quiz score
 */
async function getQuizAverage(userId: string): Promise<number> {
  // TODO: Query actual quiz results
  return 75 + Math.random() * 20; // 75-95 range
}

/**
 * Get current learning streak
 */
async function getStreakDays(userId: string): Promise<number> {
  // TODO: Calculate from daily activity logs
  return Math.floor(Math.random() * 30);
}

/**
 * Get helpful comments count
 */
async function getHelpfulComments(userId: string): Promise<number> {
  // TODO: Query comment upvotes/helpful marks
  return Math.floor(Math.random() * 50);
}

/**
 * Get courses created (for instructors)
 */
async function getCoursesCreated(userId: string): Promise<number> {
  const count = await prisma.course.count({
    where: {
      userId,
      isPublished: true,
    },
  });
  return count;
}

/**
 * Get mentoring sessions count
 */
async function getMentoringSessions(userId: string): Promise<number> {
  // TODO: Implement mentoring system tracking
  return Math.floor(Math.random() * 10);
}

/**
 * Determine tier based on total score
 */
function getTier(score: number): DynastyTier {
  if (score >= 10000) return "Legend";
  if (score >= 5000) return "Diamond";
  if (score >= 3000) return "Platinum";
  if (score >= 1500) return "Gold";
  if (score >= 500) return "Silver";
  if (score >= 100) return "Bronze";
  return "Novice";
}

/**
 * Get perks for a tier
 */
function getPerks(tier: DynastyTier): string[] {
  const allPerks: Record<DynastyTier, string[]> = {
    Novice: ["Access to community forums"],
    Bronze: ["Profile badge: Bronze Scholar", "Access to beginner resources"],
    Silver: [
      "Profile badge: Silver Achiever",
      "Early access to new courses (24h)",
      "Priority email support",
    ],
    Gold: [
      "Profile badge: Gold Master",
      "10% discount on all courses",
      "Access to exclusive webinars",
      "Custom profile theme",
    ],
    Platinum: [
      "Profile badge: Platinum Elite",
      "Free course credit monthly ($50 value)",
      "Direct instructor messaging",
      "Beta feature access",
    ],
    Diamond: [
      "Profile badge: Diamond Expert",
      "Instructor certification pathway",
      "Revenue share on referrals (5%)",
      "Exclusive Diamond lounge access",
    ],
    Legend: [
      "Profile badge: LEGEND 👑",
      "Lifetime premium access (all courses)",
      "Personal learning advisor",
      "Featured on Dynasty Hall of Fame",
      "Revenue share on referrals (10%)",
      "Annual Dynasty Summit invite",
    ],
  };

  // Accumulate all perks from current tier and below
  const tiers: DynastyTier[] = [
    "Novice",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Legend",
  ];
  const currentIndex = tiers.indexOf(tier);

  return tiers.slice(0, currentIndex + 1).flatMap((t) => allPerks[t]);
}

/**
 * Get next milestone information
 */
function getNextMilestone(currentScore: number, currentTier: DynastyTier) {
  const milestones: Record<
    DynastyTier,
    { threshold: number; unlocks: string[] }
  > = {
    Novice: {
      threshold: 100,
      unlocks: ["Bronze badge", "Beginner resources"],
    },
    Bronze: {
      threshold: 500,
      unlocks: ["Silver badge", "Early access", "Priority support"],
    },
    Silver: {
      threshold: 1500,
      unlocks: ["Gold badge", "10% discount", "Exclusive webinars"],
    },
    Gold: {
      threshold: 3000,
      unlocks: ["Platinum badge", "Free monthly course", "Beta access"],
    },
    Platinum: {
      threshold: 5000,
      unlocks: ["Diamond badge", "Instructor cert", "5% referral share"],
    },
    Diamond: {
      threshold: 10000,
      unlocks: ["LEGEND status", "Lifetime premium", "10% referral share"],
    },
    Legend: {
      threshold: Infinity,
      unlocks: ["You've achieved the highest tier!"],
    },
  };

  const tiers: DynastyTier[] = [
    "Novice",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Legend",
  ];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIndex + 1] || "Legend";
  const nextMilestoneData = milestones[currentTier];

  return {
    tier: nextTier,
    pointsNeeded: nextMilestoneData.threshold - currentScore,
    unlocks: nextMilestoneData.unlocks,
  };
}

/**
 * Get global rank
 */
async function getGlobalRank(userId: string, score: number): Promise<number> {
  // TODO: Implement actual ranking query
  // Would count users with higher scores
  return Math.floor(Math.random() * 1000) + 1;
}

/**
 * Get percentile
 */
async function getPercentile(score: number): Promise<number> {
  // TODO: Calculate actual percentile from all user scores
  return Math.round(95 - Math.random() * 10); // Top 85-95%
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 100) {
  // TODO: Query top users by Dynasty Score
  // For now, return mock data

  const mockUsers = Array.from({ length: limit }, (_, i) => ({
    rank: i + 1,
    userId: `user-${i + 1}`,
    username: `Scholar${i + 1}`,
    score: 10000 - i * 50,
    tier: getTier(10000 - i * 50),
    avatarUrl: null,
  }));

  return mockUsers;
}

/**
 * Award points for specific actions
 */
export async function awardPoints(params: {
  userId: string;
  action:
    | "course_complete"
    | "quiz_perfect"
    | "comment_helpful"
    | "streak_milestone"
    | "course_created";
  points?: number;
}) {
  const { userId, action, points: customPoints } = params;

  const pointValues: Record<typeof action, number> = {
    course_complete: 100,
    quiz_perfect: 50,
    comment_helpful: 20,
    streak_milestone: 25,
    course_created: 500,
  };

  const points = customPoints ?? pointValues[action];

  console.log(`🏆 Awarded ${points} points to user ${userId} for ${action}`);

  // TODO: Store in database
  // await prisma.dynastyScoreLog.create({
  //   data: { userId, action, points }
  // });

  // Check for tier upgrade
  const score = await calculateDynastyScore(userId);

  return {
    pointsAwarded: points,
    newTotal: score.totalScore,
    tier: score.tier,
    tierUpgraded: false, // TODO: Compare with previous tier
  };
}

/**
 * Get score history
 */
export async function getScoreHistory(userId: string, days: number = 30) {
  // TODO: Query score log grouped by day
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
    points: Math.floor(Math.random() * 100),
    total: 1000 + i * 50,
  }));
}

/**
 * Compare with friends
 */
export async function compareDynastyScore(userId: string, friendIds: string[]) {
  const scores = await Promise.all(
    [userId, ...friendIds].map((id) => calculateDynastyScore(id))
  );

  return scores.sort((a, b) => b.totalScore - a.totalScore);
}
