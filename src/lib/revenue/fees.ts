/**
 * TRUST-BASED FEE CALCULATION
 *
 * Safe Mode: Feature-flagged platform fees
 * Higher trust = lower fees = more revenue for instructor
 *
 * Tier System:
 * - Unverified (0-199):   50% fee → 50% to instructor
 * - Verified (200-499):   35% fee → 65% to instructor
 * - Trusted (500-799):    25% fee → 75% to instructor
 * - Elite (800-949):      15% fee → 85% to instructor
 * - Legendary (950-1000):  5% fee → 95% to instructor
 */

import { calculateTrustScore } from "@/lib/governance/trust-score-engine";

export interface FeeCalculation {
  grossAmountCents: number;
  platformFeeCents: number;
  instructorNetCents: number;
  feePercentage: number;
  trustScore: number;
  tier: string;
}

/**
 * Calculate platform fee based on trust score
 */
export function platformFeeFor(trustScore: number): number {
  if (trustScore >= 950) return 0.05; // Legendary: 5%
  if (trustScore >= 800) return 0.15; // Elite: 15%
  if (trustScore >= 500) return 0.25; // Trusted: 25%
  if (trustScore >= 200) return 0.35; // Verified: 35%
  return 0.5; // Unverified: 50%
}

/**
 * Get trust tier name from score
 */
export function getTrustTier(trustScore: number): string {
  if (trustScore >= 950) return "Legendary";
  if (trustScore >= 800) return "Elite";
  if (trustScore >= 500) return "Trusted";
  if (trustScore >= 200) return "Verified";
  return "Unverified";
}

/**
 * Calculate fee breakdown for a transaction
 */
export async function calculateFee(
  instructorId: string,
  grossAmountCents: number
): Promise<FeeCalculation> {
  try {
    // Get instructor trust score
    const trustData = await calculateTrustScore(instructorId);
    const trustScore = trustData.score;

    // Check feature flag
    const trustFeeEnabled = process.env.TRUST_FEE_ENABLED === "true";

    // Calculate fee percentage
    const feePercentage = trustFeeEnabled ? platformFeeFor(trustScore) : 0.3; // Default 30% if disabled

    // Calculate amounts
    const platformFeeCents = Math.round(grossAmountCents * feePercentage);
    const instructorNetCents = grossAmountCents - platformFeeCents;

    return {
      grossAmountCents,
      platformFeeCents,
      instructorNetCents,
      feePercentage,
      trustScore,
      tier: getTrustTier(trustScore),
    };
  } catch (error) {
    console.error("Error calculating fee:", error);

    // Fallback to default 30% fee on error
    const platformFeeCents = Math.round(grossAmountCents * 0.3);
    const instructorNetCents = grossAmountCents - platformFeeCents;

    return {
      grossAmountCents,
      platformFeeCents,
      instructorNetCents,
      feePercentage: 0.3,
      trustScore: 0,
      tier: "Unverified",
    };
  }
}

/**
 * Calculate potential earnings for different trust tiers
 * Useful for instructor dashboard to show incentives
 */
export function calculateEarningsPotential(grossAmountCents: number): {
  tier: string;
  trustScore: number;
  feePercentage: number;
  platformFeeCents: number;
  instructorNetCents: number;
  instructorNetDollars: number;
}[] {
  const tiers = [
    { tier: "Unverified", trustScore: 0, feePercentage: 0.5 },
    { tier: "Verified", trustScore: 200, feePercentage: 0.35 },
    { tier: "Trusted", trustScore: 500, feePercentage: 0.25 },
    { tier: "Elite", trustScore: 800, feePercentage: 0.15 },
    { tier: "Legendary", trustScore: 950, feePercentage: 0.05 },
  ];

  return tiers.map(({ tier, trustScore, feePercentage }) => {
    const platformFeeCents = Math.round(grossAmountCents * feePercentage);
    const instructorNetCents = grossAmountCents - platformFeeCents;

    return {
      tier,
      trustScore,
      feePercentage,
      platformFeeCents,
      instructorNetCents,
      instructorNetDollars: instructorNetCents / 100,
    };
  });
}

/**
 * Calculate how much more instructor earns vs Unverified tier
 */
export function calculateEarningsBoost(
  trustScore: number,
  grossAmountCents: number
): {
  currentNetCents: number;
  unverifiedNetCents: number;
  extraEarningsCents: number;
  extraEarningsDollars: number;
  boostPercentage: number;
} {
  const currentFee = platformFeeFor(trustScore);
  const unverifiedFee = 0.5;

  const currentNetCents = Math.round(grossAmountCents * (1 - currentFee));
  const unverifiedNetCents = Math.round(grossAmountCents * (1 - unverifiedFee));

  const extraEarningsCents = currentNetCents - unverifiedNetCents;
  const boostPercentage =
    ((currentNetCents - unverifiedNetCents) / unverifiedNetCents) * 100;

  return {
    currentNetCents,
    unverifiedNetCents,
    extraEarningsCents,
    extraEarningsDollars: extraEarningsCents / 100,
    boostPercentage,
  };
}

/**
 * Format fee for display
 */
export function formatFee(feeCalculation: FeeCalculation): string {
  const { platformFeeCents, feePercentage, tier } = feeCalculation;
  const feeDollars = (platformFeeCents / 100).toFixed(2);
  const feePercent = (feePercentage * 100).toFixed(0);

  return `$${feeDollars} (${feePercent}% ${tier} tier)`;
}

/**
 * Format instructor net earnings for display
 */
export function formatInstructorNet(feeCalculation: FeeCalculation): string {
  const { instructorNetCents } = feeCalculation;
  const netDollars = (instructorNetCents / 100).toFixed(2);

  return `$${netDollars}`;
}
