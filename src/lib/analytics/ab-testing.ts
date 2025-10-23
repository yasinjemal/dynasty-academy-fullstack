/**
 * 🧪 A/B TESTING FRAMEWORK
 * Run experiments and measure impact
 */

import { prisma } from "@/lib/prisma";
import { trackEvent } from "./analytics-engine";

export interface ABTestVariant {
  id: string;
  name: string;
  config: Record<string, any>;
  allocation: number; // 0-100 percentage
}

export interface ABTestConfig {
  name: string;
  description?: string;
  hypothesis?: string;
  variants: ABTestVariant[];
  metrics: string[];
  primaryMetric: string;
  trafficAllocation?: number;
}

/**
 * Create a new A/B test
 */
export async function createABTest(config: ABTestConfig) {
  // Validate allocations sum to 100
  const totalAllocation = config.variants.reduce((sum, v) => sum + v.allocation, 0);
  if (Math.abs(totalAllocation - 100) > 0.01) {
    throw new Error("Variant allocations must sum to 100%");
  }

  const allocation: Record<string, number> = {};
  config.variants.forEach((v) => {
    allocation[v.id] = v.allocation;
  });

  return prisma.aBTest.create({
    data: {
      name: config.name,
      description: config.description,
      hypothesis: config.hypothesis,
      variants: config.variants as any,
      allocation: allocation as any,
      metrics: config.metrics,
      primaryMetric: config.primaryMetric,
      trafficAllocation: config.trafficAllocation || 1.0,
      status: "draft",
    },
  });
}

/**
 * Start an A/B test
 */
export async function startABTest(testId: string) {
  return prisma.aBTest.update({
    where: { id: testId },
    data: {
      status: "running",
      startDate: new Date(),
    },
  });
}

/**
 * Pause an A/B test
 */
export async function pauseABTest(testId: string) {
  return prisma.aBTest.update({
    where: { id: testId },
    data: { status: "paused" },
  });
}

/**
 * Complete an A/B test with results
 */
export async function completeABTest(
  testId: string,
  results: Record<string, any>,
  winner?: string
) {
  return prisma.aBTest.update({
    where: { id: testId },
    data: {
      status: "completed",
      endDate: new Date(),
      results: results as any,
      winner,
    },
  });
}

/**
 * Assign user to test variant
 */
export async function assignUserToVariant(
  testId: string,
  userId: string
): Promise<string> {
  // Check if user already assigned
  const existing = await prisma.aBTestAssignment.findUnique({
    where: {
      testId_userId: { testId, userId },
    },
  });

  if (existing) return existing.variant;

  // Get test config
  const test = await prisma.aBTest.findUnique({
    where: { id: testId },
  });

  if (!test || test.status !== "running") {
    throw new Error("Test not found or not running");
  }

  // Check traffic allocation (what % of users get included)
  if (Math.random() > test.trafficAllocation) {
    // User not in test, return control
    const variants = test.variants as ABTestVariant[];
    return variants[0].id; // Always control first
  }

  // Select variant based on allocation
  const variants = test.variants as ABTestVariant[];
  const allocation = test.allocation as Record<string, number>;
  const random = Math.random() * 100;

  let cumulative = 0;
  let selectedVariant = variants[0].id;

  for (const variant of variants) {
    cumulative += allocation[variant.id];
    if (random <= cumulative) {
      selectedVariant = variant.id;
      break;
    }
  }

  // Save assignment
  await prisma.aBTestAssignment.create({
    data: {
      testId,
      userId,
      variant: selectedVariant,
    },
  });

  // Track event
  await trackEvent({
    userId,
    event: "ab_test_assigned",
    category: "experiment",
    properties: {
      testId,
      testName: test.name,
      variant: selectedVariant,
    },
  });

  return selectedVariant;
}

/**
 * Get user's variant for a test
 */
export async function getUserVariant(
  testId: string,
  userId: string
): Promise<string | null> {
  const assignment = await prisma.aBTestAssignment.findUnique({
    where: {
      testId_userId: { testId, userId },
    },
  });

  return assignment?.variant || null;
}

/**
 * Track conversion for A/B test
 */
export async function trackABTestConversion(
  testId: string,
  userId: string,
  value?: number
) {
  const assignment = await prisma.aBTestAssignment.findUnique({
    where: {
      testId_userId: { testId, userId },
    },
  });

  if (!assignment || assignment.converted) return;

  await prisma.aBTestAssignment.update({
    where: { id: assignment.id },
    data: {
      converted: true,
      convertedAt: new Date(),
      value,
    },
  });

  // Track event
  await trackEvent({
    userId,
    event: "ab_test_converted",
    category: "experiment",
    properties: {
      testId,
      variant: assignment.variant,
      value,
    },
  });
}

/**
 * Get A/B test results
 */
export async function getABTestResults(testId: string) {
  const test = await prisma.aBTest.findUnique({
    where: { id: testId },
    include: {
      assignments: true,
    },
  });

  if (!test) throw new Error("Test not found");

  const variants = test.variants as ABTestVariant[];
  const results: Record<string, any> = {};

  for (const variant of variants) {
    const assignments = test.assignments.filter((a) => a.variant === variant.id);
    const conversions = assignments.filter((a) => a.converted);
    const totalValue = conversions.reduce((sum, a) => sum + (a.value || 0), 0);

    results[variant.id] = {
      name: variant.name,
      participants: assignments.length,
      conversions: conversions.length,
      conversionRate: assignments.length > 0 ? (conversions.length / assignments.length) * 100 : 0,
      totalValue,
      avgValue: conversions.length > 0 ? totalValue / conversions.length : 0,
    };
  }

  // Calculate statistical significance
  const variantIds = variants.map((v) => v.id);
  if (variantIds.length === 2) {
    const [controlId, variantId] = variantIds;
    const control = results[controlId];
    const treatment = results[variantId];

    const confidence = calculateStatisticalSignificance(
      control.participants,
      control.conversions,
      treatment.participants,
      treatment.conversions
    );

    results.confidence = confidence;
    results.significant = confidence > 0.95;
  }

  return {
    test,
    results,
  };
}

/**
 * Calculate statistical significance (Z-test for proportions)
 */
function calculateStatisticalSignificance(
  n1: number,
  x1: number,
  n2: number,
  x2: number
): number {
  if (n1 === 0 || n2 === 0) return 0;

  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const p = (x1 + x2) / (n1 + n2);

  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  const z = Math.abs(p1 - p2) / se;

  // Convert Z-score to confidence level (approximate)
  // z > 1.96 = 95% confidence, z > 2.58 = 99% confidence
  if (z > 2.58) return 0.99;
  if (z > 1.96) return 0.95;
  if (z > 1.64) return 0.90;
  if (z > 1.28) return 0.80;
  return z / 2.58; // Rough approximation
}

/**
 * Get active A/B tests
 */
export async function getActiveABTests() {
  return prisma.aBTest.findMany({
    where: { status: "running" },
    orderBy: { startDate: "desc" },
  });
}

/**
 * Declare winner and complete test
 */
export async function declareWinner(testId: string, winnerId: string) {
  const { results } = await getABTestResults(testId);

  await completeABTest(testId, results, winnerId);

  return {
    winner: results[winnerId],
    confidence: results.confidence || 0,
  };
}
