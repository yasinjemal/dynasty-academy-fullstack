/**
 * 💎 LIFETIME VALUE PREDICTION
 * ML-based customer value forecasting and segmentation
 */

import { prisma } from "@/lib/prisma";

export interface LTVPrediction {
  userId: string;
  predictedLTV: number;
  confidence: number;
  segment: "whale" | "high-value" | "medium" | "low" | "at-risk";
  upgradeProb: number;
  churnProb: number;
  referralProb: number;
  monthsSinceSignup: number;
  features: LTVFeatures;
}

export interface LTVFeatures {
  totalSpent: number;
  totalPurchases: number;
  avgPurchaseValue: number;
  purchaseFrequency: number; // Purchases per month
  daysSinceLastPurchase: number;
  engagementScore: number;
  completionRate: number;
  sessionFrequency: number;
  totalReferrals: number;
  isPremium: boolean;
  daysSinceSignup: number;
}

/**
 * Calculate predicted LTV for a user
 */
export async function calculateUserLTV(userId: string): Promise<LTVPrediction> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      purchases: true,
      engagementScore: true,
      progress: true,
      following: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Extract features
  const features = extractLTVFeatures(user);

  // Calculate predictions
  const predictedLTV = predictLifetimeValue(features);
  const confidence = calculateConfidence(features);
  const upgradeProb = predictUpgradeProbability(features);
  const churnProb = predictChurnProbability(features);
  const referralProb = predictReferralProbability(features);
  const segment = segmentUser(predictedLTV, churnProb);

  const monthsSinceSignup = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) /
      (30 * 24 * 60 * 60 * 1000)
  );

  return {
    userId,
    predictedLTV,
    confidence,
    segment,
    upgradeProb,
    churnProb,
    referralProb,
    monthsSinceSignup,
    features,
  };
}

/**
 * Extract feature vector from user data
 */
function extractLTVFeatures(user: any): LTVFeatures {
  const purchases = user.purchases || [];
  const totalSpent = purchases.reduce(
    (sum: number, p: any) => sum + p.amount,
    0
  );
  const totalPurchases = purchases.length;

  const daysSinceSignup =
    (Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000);
  const monthsSinceSignup = daysSinceSignup / 30;

  const avgPurchaseValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
  const purchaseFrequency =
    monthsSinceSignup > 0 ? totalPurchases / monthsSinceSignup : 0;

  // Days since last purchase
  let daysSinceLastPurchase = daysSinceSignup;
  if (purchases.length > 0) {
    const lastPurchase = purchases.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    daysSinceLastPurchase =
      (Date.now() - new Date(lastPurchase.createdAt).getTime()) /
      (24 * 60 * 60 * 1000);
  }

  // Engagement metrics
  const engagementScore = user.engagementScore?.score || 0;
  const completedProgress =
    user.progress?.filter((p: any) => p.completed) || [];
  const completionRate =
    user.progress?.length > 0
      ? (completedProgress.length / user.progress.length) * 100
      : 50;

  // Session frequency (logins per week)
  const daysSinceLastActive = user.lastActiveAt
    ? (Date.now() - new Date(user.lastActiveAt).getTime()) /
      (24 * 60 * 60 * 1000)
    : 999;
  const sessionFrequency =
    daysSinceLastActive < 7 ? 5 : daysSinceLastActive < 30 ? 2 : 0;

  return {
    totalSpent,
    totalPurchases,
    avgPurchaseValue,
    purchaseFrequency,
    daysSinceLastPurchase,
    engagementScore,
    completionRate,
    sessionFrequency,
    totalReferrals: user.following?.length || 0, // Proxy for referrals
    isPremium: user.isPremium || false,
    daysSinceSignup,
  };
}

/**
 * Predict lifetime value using weighted features
 */
function predictLifetimeValue(features: LTVFeatures): number {
  // Simple linear model (would use ML in production)
  let ltv = 0;

  // Historical spending is strong predictor
  ltv += features.totalSpent * 1.5; // Expect 1.5x their current spend

  // Purchase frequency
  ltv += features.purchaseFrequency * 500; // Each purchase/month = R500 LTV

  // Engagement adds value
  ltv += (features.engagementScore / 100) * 1000; // Up to R1000 from engagement

  // Completion rate indicates commitment
  ltv += (features.completionRate / 100) * 800; // Up to R800 from completion

  // Premium users worth more
  if (features.isPremium) {
    ltv += 2000;
  }

  // Referral potential
  ltv += features.totalReferrals * 200; // Each referral worth R200

  // Decay if inactive
  if (features.daysSinceLastPurchase > 90) {
    ltv *= 0.7; // 30% haircut for inactivity
  }

  // New users get benefit of doubt
  if (features.daysSinceSignup < 30) {
    ltv = Math.max(ltv, 2000); // Minimum R2000 for new users
  }

  return Math.round(ltv);
}

/**
 * Calculate confidence in prediction (0-1)
 */
function calculateConfidence(features: LTVFeatures): number {
  let confidence = 0;

  // More purchases = higher confidence
  if (features.totalPurchases >= 5) confidence += 0.3;
  else if (features.totalPurchases >= 2) confidence += 0.15;

  // Longer tenure = higher confidence
  if (features.daysSinceSignup >= 180) confidence += 0.3;
  else if (features.daysSinceSignup >= 90) confidence += 0.2;
  else if (features.daysSinceSignup >= 30) confidence += 0.1;

  // High engagement = reliable
  if (features.engagementScore >= 70) confidence += 0.2;
  else if (features.engagementScore >= 40) confidence += 0.1;

  // Recent activity = confident
  if (features.daysSinceLastPurchase < 30) confidence += 0.2;
  else if (features.daysSinceLastPurchase < 90) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

/**
 * Predict upgrade probability (0-1)
 */
function predictUpgradeProbability(features: LTVFeatures): number {
  if (features.isPremium) return 0; // Already premium

  let prob = 0;

  // High engagement → likely to upgrade
  prob += (features.engagementScore / 100) * 0.4;

  // Frequent purchases → buyer mentality
  if (features.purchaseFrequency > 1) prob += 0.3;
  else if (features.purchaseFrequency > 0.5) prob += 0.15;

  // High completion → sees value
  prob += (features.completionRate / 100) * 0.3;

  return Math.min(prob, 1.0);
}

/**
 * Predict churn probability (0-1)
 */
function predictChurnProbability(features: LTVFeatures): number {
  let prob = 0;

  // Long time since last purchase
  if (features.daysSinceLastPurchase > 180) prob += 0.4;
  else if (features.daysSinceLastPurchase > 90) prob += 0.2;

  // Low engagement
  prob += ((100 - features.engagementScore) / 100) * 0.3;

  // Low completion
  prob += ((100 - features.completionRate) / 100) * 0.2;

  // Low session frequency
  if (features.sessionFrequency < 1) prob += 0.1;

  return Math.min(prob, 1.0);
}

/**
 * Predict referral probability (0-1)
 */
function predictReferralProbability(features: LTVFeatures): number {
  let prob = 0;

  // High engagement → likely to share
  prob += (features.engagementScore / 100) * 0.4;

  // Many completions → satisfied customer
  prob += (features.completionRate / 100) * 0.3;

  // Already referred others
  if (features.totalReferrals > 0) prob += 0.3;

  return Math.min(prob, 1.0);
}

/**
 * Segment user by value
 */
function segmentUser(
  ltv: number,
  churnProb: number
): "whale" | "high-value" | "medium" | "low" | "at-risk" {
  if (churnProb > 0.7) return "at-risk";
  if (ltv >= 10000) return "whale";
  if (ltv >= 5000) return "high-value";
  if (ltv >= 2000) return "medium";
  return "low";
}

/**
 * Save LTV prediction to database
 */
export async function saveUserLTV(prediction: LTVPrediction) {
  const monthsSinceLastPurchase =
    prediction.features.daysSinceLastPurchase > 0
      ? Math.floor(prediction.features.daysSinceLastPurchase / 30)
      : undefined;

  const avgMonthlySpend =
    prediction.monthsSinceSignup > 0
      ? prediction.features.totalSpent / prediction.monthsSinceSignup
      : 0;

  return prisma.userLTV.upsert({
    where: { userId: prediction.userId },
    create: {
      userId: prediction.userId,
      predictedLTV: prediction.predictedLTV,
      confidence: prediction.confidence,
      segment: prediction.segment,
      upgradeProb: prediction.upgradeProb,
      churnProb: prediction.churnProb,
      referralProb: prediction.referralProb,
      actualLTV: prediction.features.totalSpent,
      totalSpent: prediction.features.totalSpent,
      totalPurchases: prediction.features.totalPurchases,
      totalReferrals: prediction.features.totalReferrals,
      referralValue: 0,
      monthsSinceSignup: prediction.monthsSinceSignup,
      monthsSinceLastPurchase,
      avgMonthlySpend,
      features: prediction.features as any,
    },
    update: {
      predictedLTV: prediction.predictedLTV,
      confidence: prediction.confidence,
      segment: prediction.segment,
      upgradeProb: prediction.upgradeProb,
      churnProb: prediction.churnProb,
      referralProb: prediction.referralProb,
      actualLTV: prediction.features.totalSpent,
      totalSpent: prediction.features.totalSpent,
      totalPurchases: prediction.features.totalPurchases,
      monthsSinceSignup: prediction.monthsSinceSignup,
      monthsSinceLastPurchase,
      avgMonthlySpend,
      features: prediction.features as any,
    },
  });
}

/**
 * Get high-value users for targeting
 */
export async function getHighValueUsers(minLTV = 5000) {
  return prisma.userLTV.findMany({
    where: {
      predictedLTV: { gte: minLTV },
      segment: { in: ["whale", "high-value"] },
    },
    include: { user: true },
    orderBy: { predictedLTV: "desc" },
  });
}

/**
 * Batch calculate LTV for all users
 */
export async function batchCalculateLTV(limit = 100) {
  const users = await prisma.user.findMany({
    take: limit,
    select: { id: true },
  });

  const results = [];

  for (const user of users) {
    try {
      const prediction = await calculateUserLTV(user.id);
      await saveUserLTV(prediction);
      results.push(prediction);
    } catch (error) {
      console.error(`Error calculating LTV for user ${user.id}:`, error);
    }
  }

  return results;
}
