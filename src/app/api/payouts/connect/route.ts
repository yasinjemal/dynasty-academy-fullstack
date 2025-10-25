/**
 * API ROUTE: Create Stripe Connect Account
 * POST /api/payouts/connect
 *
 * Creates Stripe Connect Express account for instructor payouts
 * Instructors must complete KYC via Stripe onboarding
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createConnectAccount,
  createConnectOnboardingLink,
  getConnectAccount,
} from "@/lib/revenue/stripe";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/security/audit-logger";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Connect is enabled
    if (process.env.CONNECT_ENABLED !== "true") {
      return NextResponse.json(
        { error: "Stripe Connect is not enabled" },
        { status: 403 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Check if instructor (must have role)
    const instructor = await prisma.instructor.findUnique({
      where: { userId: user.id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "You must be an instructor to connect payouts" },
        { status: 403 }
      );
    }

    // Check if Connect account already exists
    const existingConnect = await prisma.stripeConnect.findUnique({
      where: { userId: user.id },
    });

    if (existingConnect) {
      // Get account status from Stripe
      const account = await getConnectAccount(existingConnect.stripeAccountId);

      // Check if onboarding is complete
      const onboardingComplete =
        account.charges_enabled && account.payouts_enabled;

      // Update local record
      await prisma.stripeConnect.update({
        where: { id: existingConnect.id },
        data: {
          onboardingComplete,
          payoutsEnabled: account.payouts_enabled,
          metadata: {
            chargesEnabled: account.charges_enabled,
            detailsSubmitted: account.details_submitted,
          },
        },
      });

      // Generate new onboarding link if not complete
      if (!onboardingComplete) {
        const onboardingUrl = await createConnectOnboardingLink(
          existingConnect.stripeAccountId,
          `${process.env.NEXT_PUBLIC_APP_URL}/instructor/payouts?refresh=true`,
          `${process.env.NEXT_PUBLIC_APP_URL}/instructor/payouts?success=true`
        );

        return NextResponse.json({
          accountId: existingConnect.stripeAccountId,
          onboardingUrl,
          onboardingComplete: false,
        });
      }

      return NextResponse.json({
        accountId: existingConnect.stripeAccountId,
        onboardingComplete: true,
      });
    }

    // Create new Connect account
    const accountId = await createConnectAccount({
      instructorId: instructor.id,
      email: user.email,
      country: "US", // TODO: Get from user profile
    });

    // Save to database
    await prisma.stripeConnect.create({
      data: {
        userId: user.id,
        stripeAccountId: accountId,
        onboardingComplete: false,
        payoutsEnabled: false,
        country: "US",
        currency: "USD",
      },
    });

    // Generate onboarding link
    const onboardingUrl = await createConnectOnboardingLink(
      accountId,
      `${process.env.NEXT_PUBLIC_APP_URL}/instructor/payouts?refresh=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/instructor/payouts?success=true`
    );

    // Audit log
    await createAuditLog({
      action: "CONNECT_ACCOUNT_CREATED",
      userId,
      severity: "info",
      metadata: {
        accountId,
        instructorId: instructor.id,
      },
    });

    return NextResponse.json({
      accountId,
      onboardingUrl,
      onboardingComplete: false,
    });
  } catch (error: any) {
    console.error("Error creating Connect account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Connect account" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get Connect account status
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

    // Get Connect record
    const connect = await prisma.stripeConnect.findUnique({
      where: { userId: user.id },
    });

    if (!connect) {
      return NextResponse.json({
        connected: false,
      });
    }

    // Get fresh status from Stripe
    const account = await getConnectAccount(connect.stripeAccountId);
    const onboardingComplete =
      account.charges_enabled && account.payouts_enabled;

    // Update local record
    await prisma.stripeConnect.update({
      where: { id: connect.id },
      data: {
        onboardingComplete,
        payoutsEnabled: account.payouts_enabled,
      },
    });

    return NextResponse.json({
      connected: true,
      accountId: connect.stripeAccountId,
      onboardingComplete,
      payoutsEnabled: account.payouts_enabled,
      country: connect.country,
      currency: connect.currency,
    });
  } catch (error: any) {
    console.error("Error getting Connect status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get Connect status" },
      { status: 500 }
    );
  }
}
