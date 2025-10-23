/**
 * 🎯 ENGAGEMENT PREDICTION ENGINE
 * AI-powered drop-off prediction & intervention system
 *
 * This is the CORE of Module 3 - predicts which students will drop out
 * and triggers automatic interventions to keep them engaged.
 */

import { prisma } from "@/lib/db/prisma";

export interface EngagementSignals {
  // Login behavior
  loginFrequency: number; // Logins per week
  lastLoginDaysAgo: number;
  loginTrend: "increasing" | "stable" | "decreasing";

  // Session engagement
  avgSessionDuration: number; // Minutes
  sessionTrend: "increasing" | "stable" | "decreasing";

  // Learning progress
  lessonsPerWeek: number;
  completionRate: number; // Percentage
  progressVelocity: number; // Lessons per day
  velocityTrend: "increasing" | "stable" | "decreasing";

  // Quiz performance
  avgQuizScore: number;
  quizAttempts: number;
  quizTrend: "improving" | "stable" | "declining";

  // Engagement metrics
  streakDays: number;
  streakBroken: boolean;
  achievementsUnlocked: number;
  socialInteractions: number; // Comments, likes, shares

  // Time patterns
  studyConsistency: number; // 0-1, how consistent are study times
  optimalTimeMatch: number; // 0-1, studying at optimal times

  // Content interaction
  videoCompletionRate: number;
  bookmarksCreated: number;
  notesTaken: number;
}

export interface DropOffPrediction {
  userId: string;
  dropOffRisk: number; // 0-100
  weeklyRisk: number;
  monthlyRisk: number;
  signals: EngagementSignals;
  recommendedInterventions: InterventionType[];
  confidence: number; // 0-1
}

export type InterventionType =
  | "gentle_reminder"
  | "achievement_notification"
  | "streak_warning"
  | "personalized_content"
  | "discount_offer"
  | "peer_comparison"
  | "milestone_celebration"
  | "human_outreach";

/**
 * Calculate engagement score for a user
 * This is the MAIN ML function that predicts drop-off risk
 */
export async function calculateEngagementScore(
  userId: string
): Promise<DropOffPrediction> {
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          progress: true,
        },
      },
      quiz_attempts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      streak: true,
      achievements: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate behavioral signals
  const signals = await calculateSignals(userId, user);

  // ML-based risk calculation (simplified - can be replaced with real ML model)
  const riskFactors = {
    loginFrequency: calculateLoginRisk(
      signals.loginFrequency,
      signals.lastLoginDaysAgo
    ),
    sessionEngagement: calculateSessionRisk(
      signals.avgSessionDuration,
      signals.sessionTrend
    ),
    progressVelocity: calculateProgressRisk(
      signals.progressVelocity,
      signals.velocityTrend
    ),
    completionRate: calculateCompletionRisk(signals.completionRate),
    streak: calculateStreakRisk(signals.streakDays, signals.streakBroken),
    quizPerformance: calculateQuizRisk(signals.avgQuizScore, signals.quizTrend),
  };

  // Weighted average (these weights can be trained with real data)
  const weights = {
    loginFrequency: 0.25,
    sessionEngagement: 0.2,
    progressVelocity: 0.2,
    completionRate: 0.15,
    streak: 0.1,
    quizPerformance: 0.1,
  };

  const dropOffRisk =
    riskFactors.loginFrequency * weights.loginFrequency +
    riskFactors.sessionEngagement * weights.sessionEngagement +
    riskFactors.progressVelocity * weights.progressVelocity +
    riskFactors.completionRate * weights.completionRate +
    riskFactors.streak * weights.streak +
    riskFactors.quizPerformance * weights.quizPerformance;

  // Weekly and monthly projections
  const weeklyRisk = calculateWeeklyRisk(dropOffRisk, signals);
  const monthlyRisk = calculateMonthlyRisk(dropOffRisk, signals);

  // Recommend interventions based on risk level and signals
  const recommendedInterventions = recommendInterventions(dropOffRisk, signals);

  // Confidence based on data completeness
  const confidence = calculateConfidence(signals);

  return {
    userId,
    dropOffRisk: Math.round(dropOffRisk * 100),
    weeklyRisk: Math.round(weeklyRisk * 100),
    monthlyRisk: Math.round(monthlyRisk * 100),
    signals,
    recommendedInterventions,
    confidence,
  };
}

/**
 * Calculate all behavioral signals for a user
 */
async function calculateSignals(
  userId: string,
  user: any
): Promise<EngagementSignals> {
  // Get behavior events from last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const events = await prisma.behaviorEvent.findMany({
    where: {
      userId,
      timestamp: { gte: thirtyDaysAgo },
    },
    orderBy: { timestamp: "desc" },
  });

  // Calculate metrics from events
  const logins = events.filter((e) => e.eventType === "PAGE_VIEW").length;
  const sessions = groupIntoSessions(events);
  const lastLogin = events[0]?.timestamp || new Date(0);
  const daysSinceLogin = Math.floor(
    (Date.now() - lastLogin.getTime()) / (24 * 60 * 60 * 1000)
  );

  // Progress metrics
  const completedLessons = events.filter(
    (e) => e.eventType === "LESSON_COMPLETE"
  ).length;
  const totalLessons = user.enrollments.reduce(
    (sum: number, e: any) => sum + (e.progress?.length || 0),
    0
  );
  const completionRate =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Quiz metrics
  const quizScores = user.quiz_attempts.map((q: any) => q.score || 0);
  const avgQuizScore =
    quizScores.length > 0
      ? quizScores.reduce((a: number, b: number) => a + b, 0) /
        quizScores.length
      : 0;

  // Streak info
  const streakDays = user.streak?.currentStreak || 0;
  const streakBroken = user.streak ? daysSinceLogin > 1 : false;

  // Social metrics
  const socialEvents = events.filter((e) =>
    ["COMMENT", "LIKE", "SHARE"].includes(e.eventType)
  ).length;

  return {
    loginFrequency: logins / 4.3, // Per week (30 days / 7)
    lastLoginDaysAgo: daysSinceLogin,
    loginTrend: calculateTrend(events, "PAGE_VIEW"),

    avgSessionDuration: calculateAvgSessionDuration(sessions),
    sessionTrend: "stable", // Simplified

    lessonsPerWeek: completedLessons / 4.3,
    completionRate,
    progressVelocity: completedLessons / 30,
    velocityTrend: calculateTrend(events, "LESSON_COMPLETE"),

    avgQuizScore,
    quizAttempts: user.quiz_attempts.length,
    quizTrend:
      quizScores.length >= 3 && quizScores[0] > quizScores[2]
        ? "improving"
        : "stable",

    streakDays,
    streakBroken,
    achievementsUnlocked: user.achievements?.length || 0,
    socialInteractions: socialEvents,

    studyConsistency: 0.7, // Simplified - would analyze time patterns
    optimalTimeMatch: 0.6, // Simplified

    videoCompletionRate: 75, // Simplified
    bookmarksCreated: 0, // Would count from events
    notesTaken: 0,
  };
}

// Risk calculation functions
function calculateLoginRisk(frequency: number, daysAgo: number): number {
  if (daysAgo > 7) return 0.9; // Very high risk if not logged in for a week
  if (daysAgo > 3) return 0.6;
  if (frequency < 2) return 0.7; // Low login frequency
  if (frequency < 4) return 0.4;
  return 0.1; // Active user
}

function calculateSessionRisk(avgDuration: number, trend: string): number {
  if (avgDuration < 5) return 0.8; // Very short sessions
  if (avgDuration < 15) return 0.5;
  if (trend === "decreasing") return 0.6;
  return 0.2;
}

function calculateProgressRisk(velocity: number, trend: string): number {
  if (velocity < 0.1) return 0.9; // Almost no progress
  if (velocity < 0.3) return 0.6;
  if (trend === "decreasing") return 0.5;
  return 0.2;
}

function calculateCompletionRisk(rate: number): number {
  if (rate < 10) return 0.8;
  if (rate < 30) return 0.5;
  if (rate < 50) return 0.3;
  return 0.1;
}

function calculateStreakRisk(days: number, broken: boolean): number {
  if (broken) return 0.7;
  if (days < 3) return 0.5;
  if (days > 7) return 0.1; // Strong habit formed
  return 0.3;
}

function calculateQuizRisk(avgScore: number, trend: string): number {
  if (avgScore < 50) return 0.7;
  if (avgScore < 70) return 0.4;
  if (trend === "declining") return 0.5;
  return 0.2;
}

function calculateWeeklyRisk(
  baseRisk: number,
  signals: EngagementSignals
): number {
  // Higher risk in short term if recent activity is low
  const recencyMultiplier = signals.lastLoginDaysAgo > 3 ? 1.3 : 1.0;
  return Math.min(1, baseRisk * recencyMultiplier);
}

function calculateMonthlyRisk(
  baseRisk: number,
  signals: EngagementSignals
): number {
  // Monthly risk factors in longer-term trends
  const trendMultiplier = signals.velocityTrend === "decreasing" ? 1.2 : 1.0;
  return Math.min(1, baseRisk * trendMultiplier);
}

function recommendInterventions(
  risk: number,
  signals: EngagementSignals
): InterventionType[] {
  const interventions: InterventionType[] = [];

  if (risk > 0.8) {
    // Critical risk - aggressive intervention
    interventions.push("human_outreach");
    interventions.push("discount_offer");
  }

  if (risk > 0.6) {
    interventions.push("personalized_content");
    if (signals.streakBroken) interventions.push("streak_warning");
  }

  if (risk > 0.4) {
    interventions.push("achievement_notification");
    interventions.push("peer_comparison");
  }

  if (risk > 0.2) {
    interventions.push("gentle_reminder");
    interventions.push("milestone_celebration");
  }

  return interventions;
}

function calculateConfidence(signals: EngagementSignals): number {
  // Confidence based on data completeness
  let dataPoints = 0;
  let totalPoints = 0;

  const checks = [
    signals.loginFrequency > 0,
    signals.lessonsPerWeek >= 0,
    signals.quizAttempts > 0,
    signals.avgSessionDuration > 0,
    signals.socialInteractions >= 0,
  ];

  dataPoints = checks.filter(Boolean).length;
  totalPoints = checks.length;

  return dataPoints / totalPoints;
}

// Helper functions
function groupIntoSessions(events: any[]): any[] {
  const sessions: any[] = [];
  let currentSession: any = null;
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  events.forEach((event) => {
    if (
      !currentSession ||
      event.timestamp.getTime() - currentSession.end > SESSION_TIMEOUT
    ) {
      currentSession = {
        start: event.timestamp,
        end: event.timestamp,
        events: [event],
      };
      sessions.push(currentSession);
    } else {
      currentSession.end = event.timestamp;
      currentSession.events.push(event);
    }
  });

  return sessions;
}

function calculateAvgSessionDuration(sessions: any[]): number {
  if (sessions.length === 0) return 0;

  const totalMinutes = sessions.reduce((sum, session) => {
    const duration = (session.end - session.start) / (60 * 1000);
    return sum + duration;
  }, 0);

  return totalMinutes / sessions.length;
}

function calculateTrend(
  events: any[],
  eventType: string
): "increasing" | "stable" | "decreasing" {
  const filtered = events.filter((e) => e.eventType === eventType);
  if (filtered.length < 6) return "stable";

  const firstHalf = filtered.slice(0, filtered.length / 2).length;
  const secondHalf = filtered.slice(filtered.length / 2).length;

  if (secondHalf > firstHalf * 1.2) return "increasing";
  if (secondHalf < firstHalf * 0.8) return "decreasing";
  return "stable";
}

/**
 * Save engagement score to database
 */
export async function saveEngagementScore(prediction: DropOffPrediction) {
  return await prisma.engagementScore.upsert({
    where: { userId: prediction.userId },
    create: {
      userId: prediction.userId,
      dropOffRisk: prediction.dropOffRisk,
      weeklyRisk: prediction.weeklyRisk,
      monthlyRisk: prediction.monthlyRisk,
      signals: prediction.signals as any,
      interventions: [],
      lastCalculated: new Date(),
    },
    update: {
      dropOffRisk: prediction.dropOffRisk,
      weeklyRisk: prediction.weeklyRisk,
      monthlyRisk: prediction.monthlyRisk,
      signals: prediction.signals as any,
      lastCalculated: new Date(),
    },
  });
}
