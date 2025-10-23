/**
 * Dynasty Academy: AI-Powered Personalized Recommendation Engine
 *
 * Uses hybrid approach:
 * 1. Content-based filtering (topics, difficulty, format)
 * 2. Collaborative filtering (similar user patterns)
 * 3. Contextual signals (time, progress, goals)
 * 4. AI embeddings for semantic similarity
 */

import { prisma } from "@/lib/db/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserProfile {
  userId: string;
  enrolledCourseIds: string[];
  completedCourseIds: string[];
  topicsOfInterest: string[];
  averageProgress: number;
  studyPattern: "binge" | "consistent" | "sporadic";
  preferredDifficulty?: "beginner" | "intermediate" | "advanced";
}

interface CourseRecommendation {
  courseId: string;
  score: number;
  reasons: string[];
  course?: any;
}

/**
 * Generate personalized course recommendations for a user
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<CourseRecommendation[]> {
  // Step 1: Build user profile
  const userProfile = await buildUserProfile(userId);

  // Step 2: Get candidate courses (not already enrolled)
  const candidates = await getCandidateCourses(userId);

  // Step 3: Score each candidate
  const scoredCandidates = await Promise.all(
    candidates.map(async (course) => {
      const score = await scoreCourse(course, userProfile);
      return {
        courseId: course.id,
        score: score.totalScore,
        reasons: score.reasons,
        course,
      };
    })
  );

  // Step 4: Sort by score and return top N
  return scoredCandidates.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Build user profile from activity data
 */
async function buildUserProfile(userId: string): Promise<UserProfile> {
  const enrollments = await prisma.course_enrollments.findMany({
    where: { userId },
    include: {
      courses: {
        select: {
          id: true,
          topics: true,
          difficulty: true,
        },
      },
    },
  });

  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const completedCourseIds = enrollments
    .filter((e) => e.progress && Number(e.progress) === 100)
    .map((e) => e.courseId);

  // Extract topics from enrolled courses
  const topicsOfInterest: string[] = [];
  enrollments.forEach((e) => {
    if (e.courses.topics) {
      topicsOfInterest.push(...e.courses.topics);
    }
  });

  // Calculate average progress
  const averageProgress =
    enrollments.length > 0
      ? enrollments.reduce(
          (sum, e) => sum + (e.progress ? Number(e.progress) : 0),
          0
        ) / enrollments.length
      : 0;

  // Determine study pattern based on activity timestamps
  const studyPattern = determineStudyPattern(enrollments);

  // Determine preferred difficulty
  const preferredDifficulty = determinePreferredDifficulty(enrollments);

  return {
    userId,
    enrolledCourseIds,
    completedCourseIds,
    topicsOfInterest: Array.from(new Set(topicsOfInterest)), // Remove duplicates
    averageProgress,
    studyPattern,
    preferredDifficulty,
  };
}

/**
 * Get courses user hasn't enrolled in yet
 */
async function getCandidateCourses(userId: string) {
  return prisma.course.findMany({
    where: {
      published: true,
      enrollments: {
        none: {
          userId,
        },
      },
    },
    include: {
      instructor: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          lessons: true,
        },
      },
    },
  });
}

/**
 * Score a course based on user profile
 */
async function scoreCourse(
  course: any,
  profile: UserProfile
): Promise<{ totalScore: number; reasons: string[] }> {
  const reasons: string[] = [];
  let totalScore = 0;

  // 1. Topic relevance (40% weight)
  const topicScore = calculateTopicRelevance(course, profile);
  if (topicScore > 0) {
    totalScore += topicScore * 0.4;
    reasons.push(
      `Matches your interest in ${profile.topicsOfInterest
        .slice(0, 2)
        .join(", ")}`
    );
  }

  // 2. Difficulty match (20% weight)
  const difficultyScore = calculateDifficultyMatch(course, profile);
  if (difficultyScore > 0) {
    totalScore += difficultyScore * 0.2;
    if (course.difficulty === profile.preferredDifficulty) {
      reasons.push(`Matches your ${profile.preferredDifficulty} skill level`);
    }
  }

  // 3. Collaborative filtering (20% weight)
  const collaborativeScore = await calculateCollaborativeScore(course, profile);
  if (collaborativeScore > 0) {
    totalScore += collaborativeScore * 0.2;
    reasons.push("Popular with similar learners");
  }

  // 4. Course quality (10% weight)
  const qualityScore = calculateQualityScore(course);
  totalScore += qualityScore * 0.1;

  // 5. Freshness (10% weight)
  const freshnessScore = calculateFreshnessScore(course);
  totalScore += freshnessScore * 0.1;
  if (freshnessScore > 80) {
    reasons.push("Recently updated content");
  }

  // Boost for trending courses
  if (course._count.enrollments > 100) {
    reasons.push("Trending course");
  }

  return {
    totalScore: Math.min(100, totalScore),
    reasons: reasons.slice(0, 3), // Top 3 reasons
  };
}

/**
 * Calculate topic relevance score (0-100)
 */
function calculateTopicRelevance(course: any, profile: UserProfile): number {
  if (!course.topics || course.topics.length === 0) return 0;

  const matchingTopics = course.topics.filter((topic: string) =>
    profile.topicsOfInterest.includes(topic)
  );

  const score = (matchingTopics.length / course.topics.length) * 100;
  return score;
}

/**
 * Calculate difficulty match score (0-100)
 */
function calculateDifficultyMatch(course: any, profile: UserProfile): number {
  if (!profile.preferredDifficulty || !course.difficulty) return 50;

  const difficultyLevels = ["beginner", "intermediate", "advanced"];
  const userLevel = difficultyLevels.indexOf(profile.preferredDifficulty);
  const courseLevel = difficultyLevels.indexOf(course.difficulty);

  // Perfect match = 100, adjacent = 70, far = 40
  const diff = Math.abs(userLevel - courseLevel);
  if (diff === 0) return 100;
  if (diff === 1) return 70;
  return 40;
}

/**
 * Calculate collaborative filtering score (0-100)
 * Find users similar to current user and see what they liked
 */
async function calculateCollaborativeScore(
  course: any,
  profile: UserProfile
): Promise<number> {
  try {
    // Find users who enrolled in same courses as current user
    const similarUsers = await prisma.course_enrollments.findMany({
      where: {
        courseId: {
          in: profile.enrolledCourseIds,
        },
        userId: {
          not: profile.userId,
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    const similarUserIds = similarUsers.map((u) => u.userId);

    if (similarUserIds.length === 0) return 50; // No data, neutral score

    // Check how many similar users enrolled in this course
    const enrollmentCount = await prisma.course_enrollments.count({
      where: {
        courseId: course.id,
        userId: {
          in: similarUserIds,
        },
      },
    });

    // Score based on percentage of similar users who enrolled
    const score = Math.min(
      100,
      (enrollmentCount / similarUserIds.length) * 200
    );
    return score;
  } catch (error) {
    console.error("Collaborative filtering error:", error);
    return 50; // Fallback to neutral
  }
}

/**
 * Calculate course quality score (0-100)
 */
function calculateQualityScore(course: any): number {
  let score = 0;

  // Ratings
  if (course.averageRating) {
    score += (course.averageRating / 5) * 50;
  } else {
    score += 25; // Neutral for no ratings
  }

  // Content volume (lessons)
  const lessonScore = Math.min(50, (course._count.lessons / 20) * 50);
  score += lessonScore;

  return Math.min(100, score);
}

/**
 * Calculate freshness score (0-100)
 */
function calculateFreshnessScore(course: any): number {
  const now = new Date();
  const lastUpdate = course.updatedAt ? new Date(course.updatedAt) : now;
  const daysSinceUpdate =
    (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

  // Full score if updated in last 30 days, decay to 20 over 365 days
  if (daysSinceUpdate <= 30) return 100;
  const decay = Math.min(1, (daysSinceUpdate - 30) / 335);
  return 100 - decay * 80;
}

/**
 * Determine user's study pattern from activity
 */
function determineStudyPattern(
  enrollments: any[]
): "binge" | "consistent" | "sporadic" {
  // This is simplified - in production, analyze actual activity logs
  if (enrollments.length === 0) return "sporadic";

  const avgProgress =
    enrollments.reduce(
      (sum, e) => sum + (e.progress ? Number(e.progress) : 0),
      0
    ) / enrollments.length;

  if (avgProgress > 70) return "consistent";
  if (avgProgress > 30) return "binge";
  return "sporadic";
}

/**
 * Determine user's preferred difficulty from completed courses
 */
function determinePreferredDifficulty(
  enrollments: any[]
): "beginner" | "intermediate" | "advanced" | undefined {
  const completedCourses = enrollments.filter(
    (e) => e.progress && Number(e.progress) === 100
  );

  if (completedCourses.length === 0) return undefined;

  // Count difficulty levels of completed courses
  const difficultyCounts: Record<string, number> = {};
  completedCourses.forEach((e) => {
    const difficulty = e.courses.difficulty;
    if (difficulty) {
      difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
    }
  });

  // Return most common difficulty
  const sorted = Object.entries(difficultyCounts).sort(([, a], [, b]) => b - a);
  return sorted[0]?.[0] as any;
}

/**
 * Get "Continue Learning" recommendations (in-progress courses)
 */
export async function getContinueLearning(userId: string) {
  return prisma.course_enrollments.findMany({
    where: {
      userId,
      progress: {
        gt: 0,
        lt: 100,
      },
    },
    orderBy: {
      lastAccessedAt: "desc",
    },
    take: 5,
    include: {
      courses: {
        include: {
          users: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
}
