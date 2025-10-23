/**
 * 🛡️ CHURN PREDICTION ENGINE
 * ML-based risk scoring and automated win-back
 */

import { prisma } from "@/lib/prisma";
import { sendEngagementEmail } from "@/lib/engagement/notifications";

export interface ChurnFactors {
  loginFrequency: number; // 0-100
  sessionDuration: number; // 0-100
  completionRate: number; // 0-100
  engagementScore: number; // 0-100
  supportSentiment: number; // 0-100
  paymentIssues: number; // 0-100
  timeOnPlatform: number; // 0-100
}

export interface ChurnPrediction {
  userId: string;
  riskScore: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  churnProbability: number; // 0-1
  daysUntilChurn: number;
  factors: ChurnFactors;
  recommendations: string[];
}

/**
 * Calculate churn risk score for a user
 */
export async function calculateChurnRisk(
  userId: string
): Promise<ChurnPrediction> {
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      progress: true,
      behaviorEvents: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      },
      engagementScore: true,
      purchases: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate individual factors
  const factors: ChurnFactors = {
    loginFrequency: calculateLoginFrequency(user),
    sessionDuration: calculateSessionDuration(user),
    completionRate: calculateCompletionRate(user),
    engagementScore: user.engagementScore?.score || 0,
    supportSentiment: 75, // Default good sentiment (would integrate with support system)
    paymentIssues: 0, // Would check for failed payments
    timeOnPlatform: calculateTimeOnPlatform(user),
  };

  // Weighted risk calculation
  const weights = {
    loginFrequency: 0.25,
    sessionDuration: 0.15,
    completionRate: 0.2,
    engagementScore: 0.2,
    supportSentiment: 0.1,
    paymentIssues: 0.05,
    timeOnPlatform: 0.05,
  };

  // Calculate weighted score (lower score = higher risk)
  let weightedScore = 0;
  Object.entries(factors).forEach(([key, value]) => {
    weightedScore += value * weights[key as keyof ChurnFactors];
  });

  // Invert to risk score (higher = more likely to churn)
  const riskScore = Math.round(100 - weightedScore);

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" | "critical";
  if (riskScore < 30) riskLevel = "low";
  else if (riskScore < 60) riskLevel = "medium";
  else if (riskScore < 80) riskLevel = "high";
  else riskLevel = "critical";

  // Calculate churn probability (0-1)
  const churnProbability = riskScore / 100;

  // Estimate days until churn
  const daysUntilChurn = Math.max(1, Math.round(90 * (1 - churnProbability)));

  // Generate recommendations
  const recommendations = generateRecommendations(factors, riskLevel);

  return {
    userId,
    riskScore,
    riskLevel,
    churnProbability,
    daysUntilChurn,
    factors,
    recommendations,
  };
}

/**
 * Calculate login frequency score (0-100)
 */
function calculateLoginFrequency(user: any): number {
  const lastLogin = user.lastActiveAt || user.lastLoginAt;
  if (!lastLogin) return 0;

  const daysSinceLogin = Math.floor(
    (Date.now() - new Date(lastLogin).getTime()) / (24 * 60 * 60 * 1000)
  );

  // Score decreases with days since login
  if (daysSinceLogin === 0) return 100;
  if (daysSinceLogin <= 1) return 90;
  if (daysSinceLogin <= 3) return 70;
  if (daysSinceLogin <= 7) return 40;
  if (daysSinceLogin <= 14) return 20;
  return 5;
}

/**
 * Calculate session duration score (0-100)
 */
function calculateSessionDuration(user: any): number {
  // Would calculate from session analytics
  // For now, use behavior events as proxy
  const recentEvents = user.behaviorEvents?.length || 0;

  if (recentEvents > 50) return 100;
  if (recentEvents > 30) return 80;
  if (recentEvents > 15) return 60;
  if (recentEvents > 5) return 40;
  if (recentEvents > 0) return 20;
  return 0;
}

/**
 * Calculate completion rate score (0-100)
 */
function calculateCompletionRate(user: any): number {
  const progress = user.progress || [];
  if (progress.length === 0) return 50; // Neutral for new users

  const completedCount = progress.filter((p: any) => p.completed).length;
  const rate = (completedCount / progress.length) * 100;

  return Math.round(rate);
}

/**
 * Calculate time on platform score (0-100)
 */
function calculateTimeOnPlatform(user: any): number {
  const daysSinceSignup = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)
  );

  // New users get benefit of doubt
  if (daysSinceSignup < 7) return 80;
  if (daysSinceSignup < 30) return 70;

  // Long-time users scored by continued activity
  return calculateLoginFrequency(user);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  factors: ChurnFactors,
  riskLevel: string
): string[] {
  const recommendations: string[] = [];

  if (factors.loginFrequency < 50) {
    recommendations.push("Send re-engagement email with personalized content");
  }

  if (factors.sessionDuration < 50) {
    recommendations.push("Suggest shorter, bite-sized content");
  }

  if (factors.completionRate < 50) {
    recommendations.push("Offer easier content or learning path guidance");
  }

  if (factors.engagementScore < 50) {
    recommendations.push("Trigger gamification incentives (streak, XP bonus)");
  }

  if (riskLevel === "high" || riskLevel === "critical") {
    recommendations.push("Offer discount or premium feature unlock");
    recommendations.push("Schedule personal check-in call");
  }

  return recommendations;
}

/**
 * Update or create churn risk record
 */
export async function saveChurnRisk(prediction: ChurnPrediction) {
  return prisma.churnRisk.upsert({
    where: { userId: prediction.userId },
    create: {
      userId: prediction.userId,
      riskScore: prediction.riskScore,
      riskLevel: prediction.riskLevel,
      churnProbability: prediction.churnProbability,
      daysUntilChurn: prediction.daysUntilChurn,
      factors: prediction.factors as any,
      interventionHistory: [],
    },
    update: {
      riskScore: prediction.riskScore,
      riskLevel: prediction.riskLevel,
      churnProbability: prediction.churnProbability,
      daysUntilChurn: prediction.daysUntilChurn,
      factors: prediction.factors as any,
    },
  });
}

/**
 * Trigger automated win-back intervention
 */
export async function triggerWinBackIntervention(userId: string) {
  const churnRisk = await prisma.churnRisk.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!churnRisk) return;

  const { riskLevel, interventionsSent } = churnRisk;

  // Determine intervention type based on risk and previous attempts
  let offerType: string;
  let discountPercent: number | undefined;
  let message: string;

  if (riskLevel === "medium" && interventionsSent === 0) {
    // First attempt: Gentle nudge
    offerType = "gentle_reminder";
    message = "We miss you! Come back and continue your learning journey.";
  } else if (riskLevel === "high" && interventionsSent <= 1) {
    // Second attempt: Discount offer
    offerType = "discount";
    discountPercent = 20;
    message =
      "Special offer: 20% off your next purchase! Don't let your streak die.";
  } else if (riskLevel === "critical") {
    // Critical: Big offer
    offerType = "discount";
    discountPercent = 50;
    message =
      "We value you! Get 50% off premium content. Let's reignite your learning.";
  } else {
    // Default
    offerType = "feature_unlock";
    message = "Unlock premium features free for 7 days. Try something new!";
  }

  // Create win-back offer
  const offer = await prisma.winBackOffer.create({
    data: {
      userId,
      offerType,
      discountPercent,
      message,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Send email
  await sendEngagementEmail(
    churnRisk.user.email,
    "We Miss You! Special Offer Inside 💎",
    message,
    "Claim Offer",
    `/offers/${offer.id}`
  );

  // Update intervention count
  await prisma.churnRisk.update({
    where: { userId },
    data: {
      interventionsSent: { increment: 1 },
      lastIntervention: new Date(),
      interventionHistory: {
        push: {
          type: offerType,
          date: new Date(),
          offerId: offer.id,
        } as any,
      },
    },
  });

  // Mark offer as sent
  await prisma.winBackOffer.update({
    where: { id: offer.id },
    data: { sent: true, sentAt: new Date() },
  });

  return offer;
}

/**
 * Calculate churn risk for all users (batch job)
 */
export async function batchCalculateChurnRisks(limit = 100) {
  const users = await prisma.user.findMany({
    take: limit,
    select: { id: true },
  });

  const results = [];

  for (const user of users) {
    try {
      const prediction = await calculateChurnRisk(user.id);
      await saveChurnRisk(prediction);

      // Auto-trigger intervention for high/critical risk
      if (
        prediction.riskLevel === "high" ||
        prediction.riskLevel === "critical"
      ) {
        await triggerWinBackIntervention(user.id);
      }

      results.push(prediction);
    } catch (error) {
      console.error(`Error calculating churn for user ${user.id}:`, error);
    }
  }

  return results;
}
