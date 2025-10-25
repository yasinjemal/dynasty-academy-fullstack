/**
 * TRUST-BASED FEE CALCULATION TESTS
 *
 * Tests for fee calculation based on instructor trust score
 * - Fee percentage mapping (5-50%)
 * - Trust tier determination
 * - Fee calculation accuracy
 * - Earnings boost calculation
 */

import { describe, it, expect } from "vitest";
import {
  platformFeeFor,
  getTrustTier,
  calculateEarningsPotential,
  calculateEarningsBoost,
} from "@/lib/revenue/fees";

describe("Trust-Based Fees", () => {
  describe("Fee Percentage Calculation", () => {
    it("should return 50% for Unverified (0-199)", () => {
      expect(platformFeeFor(0)).toBe(0.5);
      expect(platformFeeFor(100)).toBe(0.5);
      expect(platformFeeFor(199)).toBe(0.5);
    });

    it("should return 35% for Verified (200-499)", () => {
      expect(platformFeeFor(200)).toBe(0.35);
      expect(platformFeeFor(350)).toBe(0.35);
      expect(platformFeeFor(499)).toBe(0.35);
    });

    it("should return 25% for Trusted (500-799)", () => {
      expect(platformFeeFor(500)).toBe(0.25);
      expect(platformFeeFor(650)).toBe(0.25);
      expect(platformFeeFor(799)).toBe(0.25);
    });

    it("should return 15% for Elite (800-949)", () => {
      expect(platformFeeFor(800)).toBe(0.15);
      expect(platformFeeFor(875)).toBe(0.15);
      expect(platformFeeFor(949)).toBe(0.15);
    });

    it("should return 5% for Legendary (950-1000)", () => {
      expect(platformFeeFor(950)).toBe(0.05);
      expect(platformFeeFor(975)).toBe(0.05);
      expect(platformFeeFor(1000)).toBe(0.05);
    });

    it("should handle boundary conditions", () => {
      // Just below threshold
      expect(platformFeeFor(199)).toBe(0.5);
      expect(platformFeeFor(499)).toBe(0.35);
      expect(platformFeeFor(799)).toBe(0.25);
      expect(platformFeeFor(949)).toBe(0.15);

      // Just at threshold
      expect(platformFeeFor(200)).toBe(0.35);
      expect(platformFeeFor(500)).toBe(0.25);
      expect(platformFeeFor(800)).toBe(0.15);
      expect(platformFeeFor(950)).toBe(0.05);
    });
  });

  describe("Trust Tier Determination", () => {
    it("should return correct tier names", () => {
      expect(getTrustTier(0)).toBe("Unverified");
      expect(getTrustTier(150)).toBe("Unverified");
      expect(getTrustTier(200)).toBe("Verified");
      expect(getTrustTier(400)).toBe("Verified");
      expect(getTrustTier(500)).toBe("Trusted");
      expect(getTrustTier(700)).toBe("Trusted");
      expect(getTrustTier(800)).toBe("Elite");
      expect(getTrustTier(900)).toBe("Elite");
      expect(getTrustTier(950)).toBe("Legendary");
      expect(getTrustTier(1000)).toBe("Legendary");
    });
  });

  describe("Earnings Potential Calculation", () => {
    it("should calculate earnings for all tiers", () => {
      const grossAmountCents = 10000; // $100
      const potential = calculateEarningsPotential(grossAmountCents);

      expect(potential).toHaveLength(5);

      // Unverified: 50% fee = $50 instructor
      expect(potential[0].tier).toBe("Unverified");
      expect(potential[0].feePercentage).toBe(0.5);
      expect(potential[0].instructorNetCents).toBe(5000);
      expect(potential[0].instructorNetDollars).toBe(50);

      // Verified: 35% fee = $65 instructor
      expect(potential[1].tier).toBe("Verified");
      expect(potential[1].feePercentage).toBe(0.35);
      expect(potential[1].instructorNetCents).toBe(6500);
      expect(potential[1].instructorNetDollars).toBe(65);

      // Trusted: 25% fee = $75 instructor
      expect(potential[2].tier).toBe("Trusted");
      expect(potential[2].feePercentage).toBe(0.25);
      expect(potential[2].instructorNetCents).toBe(7500);
      expect(potential[2].instructorNetDollars).toBe(75);

      // Elite: 15% fee = $85 instructor
      expect(potential[3].tier).toBe("Elite");
      expect(potential[3].feePercentage).toBe(0.15);
      expect(potential[3].instructorNetCents).toBe(8500);
      expect(potential[3].instructorNetDollars).toBe(85);

      // Legendary: 5% fee = $95 instructor
      expect(potential[4].tier).toBe("Legendary");
      expect(potential[4].feePercentage).toBe(0.05);
      expect(potential[4].instructorNetCents).toBe(9500);
      expect(potential[4].instructorNetDollars).toBe(95);
    });
  });

  describe("Earnings Boost Calculation", () => {
    it("should calculate boost vs Unverified tier", () => {
      const grossAmountCents = 10000; // $100

      // Unverified baseline (no boost)
      const unverifiedBoost = calculateEarningsBoost(0, grossAmountCents);
      expect(unverifiedBoost.extraEarningsCents).toBe(0);
      expect(unverifiedBoost.boostPercentage).toBe(0);

      // Verified: +$15 vs Unverified
      const verifiedBoost = calculateEarningsBoost(200, grossAmountCents);
      expect(verifiedBoost.extraEarningsCents).toBe(1500);
      expect(verifiedBoost.boostPercentage).toBe(30); // 30% more

      // Trusted: +$25 vs Unverified
      const trustedBoost = calculateEarningsBoost(500, grossAmountCents);
      expect(trustedBoost.extraEarningsCents).toBe(2500);
      expect(trustedBoost.boostPercentage).toBe(50); // 50% more

      // Elite: +$35 vs Unverified
      const eliteBoost = calculateEarningsBoost(800, grossAmountCents);
      expect(eliteBoost.extraEarningsCents).toBe(3500);
      expect(eliteBoost.boostPercentage).toBe(70); // 70% more

      // Legendary: +$45 vs Unverified
      const legendaryBoost = calculateEarningsBoost(950, grossAmountCents);
      expect(legendaryBoost.extraEarningsCents).toBe(4500);
      expect(legendaryBoost.boostPercentage).toBe(90); // 90% more
    });

    it("should calculate boost for realistic sale amounts", () => {
      // $50 product
      const boost50 = calculateEarningsBoost(800, 5000); // Elite
      expect(boost50.currentNetCents).toBe(4250); // $42.50
      expect(boost50.unverifiedNetCents).toBe(2500); // $25.00
      expect(boost50.extraEarningsCents).toBe(1750); // $17.50 more

      // $200 product
      const boost200 = calculateEarningsBoost(950, 20000); // Legendary
      expect(boost200.currentNetCents).toBe(19000); // $190.00
      expect(boost200.unverifiedNetCents).toBe(10000); // $100.00
      expect(boost200.extraEarningsCents).toBe(9000); // $90.00 more
    });
  });

  describe("Fee Calculation Accuracy", () => {
    it("should calculate exact fees with no rounding errors", () => {
      const testCases = [
        { amount: 10000, score: 0, expectedFee: 5000, expectedNet: 5000 },
        { amount: 10000, score: 200, expectedFee: 3500, expectedNet: 6500 },
        { amount: 10000, score: 500, expectedFee: 2500, expectedNet: 7500 },
        { amount: 10000, score: 800, expectedFee: 1500, expectedNet: 8500 },
        { amount: 10000, score: 950, expectedFee: 500, expectedNet: 9500 },
      ];

      testCases.forEach(({ amount, score, expectedFee, expectedNet }) => {
        const feePercentage = platformFeeFor(score);
        const feeCents = Math.round(amount * feePercentage);
        const netCents = amount - feeCents;

        expect(feeCents).toBe(expectedFee);
        expect(netCents).toBe(expectedNet);
      });
    });

    it("should handle odd amounts correctly", () => {
      // $99.99 at Elite (15% fee)
      const amount = 9999;
      const feePercentage = platformFeeFor(800);
      const feeCents = Math.round(amount * feePercentage);
      const netCents = amount - feeCents;

      expect(feeCents).toBe(1500); // Rounds to $15.00
      expect(netCents).toBe(8499); // $84.99
      expect(feeCents + netCents).toBe(amount); // Must equal original
    });
  });

  describe("Revenue Impact Analysis", () => {
    it("should show significant revenue boost for Elite instructors", () => {
      const grossAmountCents = 10000; // $100 sale

      // Unverified instructor
      const unverifiedNet = Math.round(grossAmountCents * 0.5);

      // Elite instructor
      const eliteNet = Math.round(grossAmountCents * 0.85);

      const extraPerSale = eliteNet - unverifiedNet;
      expect(extraPerSale).toBe(3500); // $35 extra per sale

      // On 1,000 sales
      const extraPer1000Sales = extraPerSale * 1000;
      expect(extraPer1000Sales).toBe(3500000); // $35,000 extra!
    });

    it("should show Legendary tier earns almost all revenue", () => {
      const grossAmountCents = 10000; // $100 sale
      const legendaryNet = Math.round(grossAmountCents * 0.95);

      expect(legendaryNet).toBe(9500); // $95 to instructor
      expect(legendaryNet / grossAmountCents).toBe(0.95); // 95% revenue share
    });
  });
});
