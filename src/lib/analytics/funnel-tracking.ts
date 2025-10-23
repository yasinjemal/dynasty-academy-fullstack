/**
 * 🎯 FUNNEL TRACKING
 * Track multi-step conversion paths
 */

import { prisma } from "@/lib/prisma";
import { trackEvent } from "./analytics-engine";

export interface FunnelStep {
  name: string;
  event: string;
  order: number;
}

export interface FunnelResult {
  step: string;
  users: number;
  conversions: number;
  conversionRate: number;
  dropoff: number;
  dropoffRate: number;
  avgTimeToNext?: number;
}

/**
 * Create a new funnel
 */
export async function createFunnel(data: {
  name: string;
  steps: FunnelStep[];
  timeWindow?: number; // Minutes
}) {
  return prisma.funnel.create({
    data: {
      name: data.name,
      steps: data.steps as any,
      timeWindow: data.timeWindow || 60, // Default 60 minutes
      active: true,
    },
  });
}

/**
 * Track user progress through funnel
 */
export async function trackFunnelStep(
  funnelId: string,
  userId: string,
  sessionId: string,
  step: number
) {
  // Get funnel definition
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
  });

  if (!funnel) throw new Error("Funnel not found");

  const steps = funnel.steps as FunnelStep[];
  const currentStep = steps.find((s) => s.order === step);

  if (!currentStep) throw new Error("Invalid step");

  // Check if user completed previous steps
  if (step > 0) {
    const previousSteps = await prisma.funnelEvent.findMany({
      where: {
        funnelId,
        userId,
        sessionId,
        step: { lt: step },
      },
    });

    if (previousSteps.length < step) {
      // User skipped steps - record anyway but mark incomplete
      await trackEvent({
        userId,
        sessionId,
        event: "funnel_step_skipped",
        category: "funnel",
        properties: {
          funnelId,
          funnelName: funnel.name,
          step,
          stepName: currentStep.name,
          skippedSteps: step - previousSteps.length,
        },
      });
    }
  }

  // Record funnel step
  const isLastStep = step === steps.length - 1;

  const funnelEvent = await prisma.funnelEvent.create({
    data: {
      funnelId,
      userId,
      sessionId,
      step,
      completed: isLastStep,
      timestamp: new Date(),
    },
  });

  // Track analytics event
  await trackEvent({
    userId,
    sessionId,
    event: "funnel_step_completed",
    category: "funnel",
    properties: {
      funnelId,
      funnelName: funnel.name,
      step,
      stepName: currentStep.name,
      completed: isLastStep,
    },
  });

  return funnelEvent;
}

/**
 * Get funnel analysis results
 */
export async function getFunnelResults(
  funnelId: string,
  startDate?: Date,
  endDate?: Date
): Promise<FunnelResult[]> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
  });

  if (!funnel) throw new Error("Funnel not found");

  const steps = funnel.steps as FunnelStep[];

  // Get funnel events
  const events = await prisma.funnelEvent.findMany({
    where: {
      funnelId,
      ...(startDate && { timestamp: { gte: startDate } }),
      ...(endDate && { timestamp: { lte: endDate } }),
    },
    orderBy: { timestamp: "asc" },
  });

  // Calculate results for each step
  const results: FunnelResult[] = [];
  let previousUsers = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepEvents = events.filter((e) => e.step === i);
    const uniqueUsers = new Set(stepEvents.map((e) => e.userId)).size;

    const conversions = i < steps.length - 1 
      ? events.filter((e) => e.step === i + 1).length 
      : stepEvents.filter((e) => e.completed).length;

    const conversionRate = uniqueUsers > 0 ? conversions / uniqueUsers : 0;
    const dropoff = i > 0 ? previousUsers - uniqueUsers : 0;
    const dropoffRate = i > 0 && previousUsers > 0 ? dropoff / previousUsers : 0;

    // Calculate avg time to next step
    let avgTimeToNext: number | undefined;
    if (i < steps.length - 1) {
      const times: number[] = [];
      stepEvents.forEach((event) => {
        const nextEvent = events.find(
          (e) =>
            e.userId === event.userId &&
            e.sessionId === event.sessionId &&
            e.step === i + 1 &&
            e.timestamp > event.timestamp
        );
        if (nextEvent) {
          times.push(
            (nextEvent.timestamp.getTime() - event.timestamp.getTime()) / 1000
          );
        }
      });
      avgTimeToNext =
        times.length > 0
          ? times.reduce((sum, t) => sum + t, 0) / times.length
          : undefined;
    }

    results.push({
      step: step.name,
      users: uniqueUsers,
      conversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      dropoff,
      dropoffRate: Math.round(dropoffRate * 100) / 100,
      avgTimeToNext,
    });

    previousUsers = uniqueUsers;
  }

  return results;
}

/**
 * Calculate overall funnel conversion rate
 */
export async function calculateFunnelConversion(
  funnelId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const events = await prisma.funnelEvent.findMany({
    where: {
      funnelId,
      ...(startDate && { timestamp: { gte: startDate } }),
      ...(endDate && { timestamp: { lte: endDate } }),
    },
  });

  if (events.length === 0) return 0;

  const startedUsers = new Set(events.filter((e) => e.step === 0).map((e) => e.userId)).size;
  const completedUsers = new Set(events.filter((e) => e.completed).map((e) => e.userId)).size;

  return startedUsers > 0 ? completedUsers / startedUsers : 0;
}

/**
 * Get drop-off analysis
 */
export async function getDropoffAnalysis(funnelId: string) {
  const results = await getFunnelResults(funnelId);

  // Find biggest drop-off point
  let maxDropoff = { step: "", rate: 0, users: 0 };
  results.forEach((result) => {
    if (result.dropoffRate > maxDropoff.rate) {
      maxDropoff = {
        step: result.step,
        rate: result.dropoffRate,
        users: result.dropoff,
      };
    }
  });

  return {
    biggestDropoff: maxDropoff,
    totalDropoff: results.reduce((sum, r) => sum + r.dropoff, 0),
    avgDropoffRate:
      results.reduce((sum, r) => sum + r.dropoffRate, 0) / results.length,
    results,
  };
}

/**
 * Get user journey through funnel
 */
export async function getUserFunnelJourney(funnelId: string, userId: string) {
  const events = await prisma.funnelEvent.findMany({
    where: { funnelId, userId },
    orderBy: { timestamp: "asc" },
  });

  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
  });

  if (!funnel) throw new Error("Funnel not found");

  const steps = funnel.steps as FunnelStep[];

  return events.map((event) => ({
    step: steps[event.step].name,
    timestamp: event.timestamp,
    completed: event.completed,
    sessionId: event.sessionId,
  }));
}

/**
 * List all active funnels
 */
export async function getActiveFunnels() {
  return prisma.funnel.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Deactivate funnel
 */
export async function deactivateFunnel(funnelId: string) {
  return prisma.funnel.update({
    where: { id: funnelId },
    data: { active: false },
  });
}
