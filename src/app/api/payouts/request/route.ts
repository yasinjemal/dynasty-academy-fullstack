/**
 * API ROUTE: Request Payout
 * POST /api/payouts/request
 *
 * Instructor requests payout from their ledger balance
 * Requires:
 * - Verified instructor (KYC complete)
 * - Stripe Connect onboarding complete
 * - Sufficient balance
 * - Rate limiting (3 payouts per day)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/db";
import {
  getInstructorAccount,
  getBalanceCents,
  getOrCreateAccount,
} from "@/lib/ledger/accounts";
import { transfer } from "@/lib/ledger/transfers";
import { createConnectPayout } from "@/lib/revenue/stripe";
import { createAuditLog } from "@/lib/security/audit-logger";

// Rate limiter: 3 payouts per day
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    parseInt(process.env.PAYOUT_RATE_LIMIT || "3"),
    "1 d"
  ),
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check
    const identifier = `payout:${userId}`;
    const { success, limit, remaining, reset } = await ratelimit.limit(
      identifier
    );

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit,
          remaining,
          resetAt: new Date(reset),
        },
        { status: 429 }
      );
    }

    // Get request body
    const body = await req.json();
    const { amountCents, currency = "USD" } = body;

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Check minimum payout amount
    const minPayoutCents = parseInt(
      process.env.MIN_PAYOUT_AMOUNT_CENTS || "5000"
    );
    if (amountCents < minPayoutCents) {
      return NextResponse.json(
        {
          error: `Minimum payout amount is $${minPayoutCents / 100}`,
        },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get instructor record
    const instructor = await prisma.instructor.findUnique({
      where: { userId: user.id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "You must be an instructor to request payouts" },
        { status: 403 }
      );
    }

    // Check if instructor is verified (KYC required)
    if (process.env.REQUIRE_INSTRUCTOR_KYC === "true" && !instructor.verified) {
      return NextResponse.json(
        {
          error: "You must complete KYC verification before requesting payouts",
        },
        { status: 403 }
      );
    }

    // Check if Connect account exists and is ready
    const connect = await prisma.stripeConnect.findUnique({
      where: { userId: user.id },
    });

    if (!connect) {
      return NextResponse.json(
        { error: "You must connect your Stripe account first" },
        { status: 403 }
      );
    }

    if (!connect.onboardingComplete || !connect.payoutsEnabled) {
      return NextResponse.json(
        { error: "Complete Stripe onboarding before requesting payouts" },
        { status: 403 }
      );
    }

    // Get instructor ledger account
    const instructorAccount = await getInstructorAccount(
      instructor.id,
      currency
    );

    // Check balance
    const balanceCents = await getBalanceCents(instructorAccount.id);

    if (balanceCents < amountCents) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          availableCents: balanceCents,
          requestedCents: amountCents,
        },
        { status: 400 }
      );
    }

    // Create payout record (pending)
    const payout = await prisma.payout.create({
      data: {
        instructorId: instructor.id,
        amountCents,
        currency,
        status: "pending",
      },
    });

    try {
      // Create Stripe payout
      const stripePayout = await createConnectPayout({
        accountId: connect.stripeAccountId,
        amountCents,
        currency,
        description: `Payout to ${user.email}`,
        metadata: {
          payoutId: payout.id,
          instructorId: instructor.id,
        },
      });

      // Update payout record
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: "processing",
          stripePayoutId: stripePayout.id,
          processedAt: new Date(),
        },
      });

      // Create ledger entry (debit from instructor account)
      // NOTE: We don't transfer to another account, just debit
      // The actual payout happens via Stripe to instructor's bank
      const payoutSinkAccount = await getOrCreateAccount({
        ownerId: "platform_payout_sink",
        kind: "platform",
        currency,
      });

      await transfer({
        fromAccountId: instructorAccount.id,
        toAccountId: payoutSinkAccount.id,
        amount: amountCents,
        currency,
        reason: "payout",
        refType: "payout",
        refId: payout.id,
        idempotencyKey: `payout_${payout.id}`,
        metadata: {
          stripePayoutId: stripePayout.id,
          instructorId: instructor.id,
        },
      });

      // Audit log
      await createAuditLog({
        action: "PAYOUT_REQUESTED",
        userId,
        severity: "info",
        metadata: {
          payoutId: payout.id,
          amountCents,
          instructorId: instructor.id,
          stripePayoutId: stripePayout.id,
        },
      });

      return NextResponse.json({
        payoutId: payout.id,
        amountCents,
        currency,
        status: "processing",
        stripePayoutId: stripePayout.id,
        estimatedArrival: stripePayout.arrival_date
          ? new Date(stripePayout.arrival_date * 1000)
          : null,
      });
    } catch (error: any) {
      // Update payout record to failed
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: "failed",
          failureReason: error.message,
        },
      });

      throw error;
    }
  } catch (error: any) {
    console.error("Error requesting payout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to request payout" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get payout history
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get instructor
    const instructor = await prisma.instructor.findUnique({
      where: { userId: user.id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "You must be an instructor" },
        { status: 403 }
      );
    }

    // Get payouts
    const payouts = await prisma.payout.findMany({
      where: { instructorId: instructor.id },
      orderBy: { requestedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      payouts: payouts.map((p) => ({
        id: p.id,
        amountCents: p.amountCents,
        amountDollars: p.amountCents / 100,
        currency: p.currency,
        status: p.status,
        requestedAt: p.requestedAt,
        processedAt: p.processedAt,
        failureReason: p.failureReason,
      })),
    });
  } catch (error: any) {
    console.error("Error getting payouts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get payouts" },
      { status: 500 }
    );
  }
}
