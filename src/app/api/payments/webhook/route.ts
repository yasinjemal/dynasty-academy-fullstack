/**
 * API ROUTE: Stripe Webhook Handler
 * POST /api/payments/webhook
 *
 * CRITICAL: Processes Stripe events and updates ledger
 * This is where money flows are recorded in the ledger
 *
 * Events handled:
 * - checkout.session.completed → Grant ownership + record entries
 * - charge.refunded → Revoke ownership + reverse entries
 * - payment_intent.succeeded → Update payout status
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/revenue/stripe";
import { prisma } from "@/lib/db";
import {
  getOrCreateAccount,
  getPlatformRevenueAccount,
  getInstructorAccount,
} from "@/lib/ledger/accounts";
import { transfer } from "@/lib/ledger/transfers";
import { calculateFee } from "@/lib/revenue/fees";
import { createAuditLog } from "@/lib/security/audit-logger";

export async function POST(req: NextRequest) {
  try {
    // Get webhook signature
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    const event = constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Check if event already processed (idempotency)
    const existingEvent = await prisma.stripeEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent?.processed) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true });
    }

    // Record event (idempotent)
    await prisma.stripeEvent.upsert({
      where: { id: event.id },
      create: {
        id: event.id,
        type: event.type,
        processed: false,
        data: event.data.object as any,
      },
      update: {},
    });

    // Process event based on type
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await prisma.stripeEvent.update({
      where: { id: event.id },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout
 * 1. Calculate trust-based fee
 * 2. Create ledger entries (platform fee + instructor net)
 * 3. Grant product ownership
 */
async function handleCheckoutCompleted(event: any) {
  const session = event.data.object;
  const metadata = session.metadata ?? {};

  const productId = metadata.productId;
  const userId = metadata.userId;
  const instructorId = metadata.instructorId;
  const amountCents = session.amount_total ?? 0;
  const currency = (session.currency ?? "usd").toUpperCase();

  if (!productId || !userId || !instructorId) {
    throw new Error("Missing required metadata on checkout session");
  }

  if (amountCents <= 0) {
    throw new Error("Checkout session amount must be greater than zero");
  }

  console.log(`Processing checkout: ${session.id}`);
  console.log(
    `Product: ${productId}, User: ${userId}, Amount: $${(
      amountCents / 100
    ).toFixed(2)}`
  );

  try {
    const feeCalc = await calculateFee(instructorId, amountCents);

    console.log(
      `Fee calculation: ${feeCalc.feePercentage * 100}% (${feeCalc.tier} tier)`
    );
    console.log(
      `Platform fee: $${(feeCalc.platformFeeCents / 100).toFixed(2)}`
    );
    console.log(
      `Instructor net: $${(feeCalc.instructorNetCents / 100).toFixed(2)}`
    );

    const buyerAccount = await getOrCreateAccount({
      ownerId: userId,
      kind: "user",
      currency,
    });
    const platformAccount = await getPlatformRevenueAccount(currency);
    const instructorAccount = await getInstructorAccount(
      instructorId,
      currency
    );

    if (feeCalc.platformFeeCents > 0) {
      await transfer({
        fromAccountId: buyerAccount.id,
        toAccountId: platformAccount.id,
        amount: feeCalc.platformFeeCents,
        currency,
        reason: "purchase_fee",
        refType: "platform_fee",
        refId: productId,
        idempotencyKey: `stripe_event_${event.id}:fee`,
        metadata: {
          checkoutSessionId: session.id,
          productId,
          userId,
          instructorId,
          trustScore: feeCalc.trustScore,
          tier: feeCalc.tier,
        },
      });
    }

    if (feeCalc.instructorNetCents > 0) {
      await transfer({
        fromAccountId: buyerAccount.id,
        toAccountId: instructorAccount.id,
        amount: feeCalc.instructorNetCents,
        currency,
        reason: "purchase_net",
        refType: "purchase",
        refId: productId,
        idempotencyKey: `stripe_event_${event.id}:net`,
        metadata: {
          checkoutSessionId: session.id,
          productId,
          userId,
          instructorId,
        },
      });
    }

    await prisma.ownership.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
        source: "purchase",
        grantedAt: new Date(),
        metadata: {
          checkoutSessionId: session.id,
          amountPaidCents: amountCents,
          currency,
        },
      },
      update: {
        revokedAt: null,
        source: "purchase",
        metadata: {
          checkoutSessionId: session.id,
          amountPaidCents: amountCents,
          currency,
        },
      },
    });

    await createAuditLog({
      action: "PURCHASE_COMPLETED",
      userId,
      severity: "info",
      metadata: {
        productId,
        instructorId,
        amountCents,
        currency,
        platformFeeCents: feeCalc.platformFeeCents,
        instructorNetCents: feeCalc.instructorNetCents,
        trustScore: feeCalc.trustScore,
        tier: feeCalc.tier,
      },
    });

    console.log(`✅ Checkout completed successfully`);
  } catch (error) {
    console.error(`Error processing checkout:`, error);
    throw error;
  }
}

/**
 * Handle refund
 * 1. Reverse ledger entries
 * 2. Revoke product ownership
 */
async function handleChargeRefunded(event: any) {
  const charge = event.data.object;
  const refundId = charge.refunds?.data?.[0]?.id;

  console.log(`Processing refund: ${refundId}`);

  try {
    // Find original purchase via charge ID
    const originalEvent = await prisma.stripeEvent.findFirst({
      where: {
        type: "checkout.session.completed",
        data: {
          path: ["payment_intent"],
          equals: charge.payment_intent,
        },
      },
    });

    if (!originalEvent) {
      console.error("Original checkout session not found for refund");
      return;
    }

    const sessionData = originalEvent.data as any;
    const metadata = sessionData.metadata ?? {};

    const productId = metadata.productId;
    const userId = metadata.userId;
    const instructorId = metadata.instructorId;
    const amountCents = charge.amount_refunded ?? 0;
    const currency = (charge.currency ?? "usd").toUpperCase();

    if (!productId || !userId || !instructorId) {
      throw new Error("Missing metadata for refund processing");
    }

    if (amountCents <= 0) {
      console.warn(
        `Refund ${
          refundId ?? "unknown"
        } has zero amount, skipping ledger updates`
      );
      return;
    }

    const feeCalc = await calculateFee(instructorId, amountCents);

    const platformAccount = await getPlatformRevenueAccount(currency);
    const instructorAccount = await getInstructorAccount(
      instructorId,
      currency
    );
    const buyerAccount = await getOrCreateAccount({
      ownerId: userId,
      kind: "user",
      currency,
    });

    if (feeCalc.platformFeeCents > 0) {
      await transfer({
        fromAccountId: platformAccount.id,
        toAccountId: buyerAccount.id,
        amount: feeCalc.platformFeeCents,
        currency,
        reason: "refund_fee",
        refType: "refund",
        refId: productId,
        idempotencyKey: `stripe_event_${event.id}:fee_refund`,
        metadata: {
          refundId,
          originalEventId: originalEvent.id,
          productId,
          userId,
          instructorId,
        },
      });
    }

    if (feeCalc.instructorNetCents > 0) {
      await transfer({
        fromAccountId: instructorAccount.id,
        toAccountId: buyerAccount.id,
        amount: feeCalc.instructorNetCents,
        currency,
        reason: "refund_net",
        refType: "refund",
        refId: productId,
        idempotencyKey: `stripe_event_${event.id}:net_refund`,
        metadata: {
          refundId,
          originalEventId: originalEvent.id,
          productId,
          userId,
          instructorId,
        },
      });
    }

    // Revoke ownership
    await prisma.ownership.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        revokedAt: new Date(),
        source: "revoked",
        metadata: {
          refundId,
          refundedAt: new Date(),
          refundAmountCents: amountCents,
          currency,
        },
      },
    });

    // Audit log
    await createAuditLog({
      action: "REFUND_PROCESSED",
      userId,
      severity: "warning",
      metadata: {
        productId,
        instructorId,
        refundId,
        amountCents,
        currency,
      },
    });

    console.log(`✅ Refund processed successfully`);
  } catch (error) {
    console.error(`Error processing refund:`, error);
    throw error;
  }
}

/**
 * Handle payment succeeded (for tracking)
 */
async function handlePaymentSucceeded(event: any) {
  const paymentIntent = event.data.object;

  console.log(`Payment succeeded: ${paymentIntent.id}`);

  // Just log for now - actual processing happens in checkout.session.completed
  await createAuditLog({
    action: "PAYMENT_SUCCEEDED",
    severity: "info",
    metadata: {
      paymentIntentId: paymentIntent.id,
      amountCents: paymentIntent.amount,
    },
  });
}
