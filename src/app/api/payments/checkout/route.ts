/**
 * API ROUTE: Create Checkout Session
 * POST /api/payments/checkout
 *
 * Creates Stripe checkout session for product purchase
 * Safe Mode: Stripe handles payment, we track in ledger via webhook
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckoutSession } from "@/lib/revenue/stripe";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/security/audit-logger";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user already owns product
    const existingOwnership = await prisma.ownership.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingOwnership && !existingOwnership.revokedAt) {
      return NextResponse.json(
        { error: "You already own this product" },
        { status: 400 }
      );
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Parse pricing (assume first price for now)
    const pricing = product.pricingJson as any;
    const price = pricing.prices?.[0];

    if (!price) {
      return NextResponse.json(
        { error: "Product pricing not configured" },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession({
      productId: product.id,
      productTitle: product.title,
      productDescription: product.description || "",
      priceAmountCents: price.amount * 100, // Convert dollars to cents
      currency: price.currency || "USD",
      userId,
      userEmail: user.email,
      instructorId: product.instructorId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace?canceled=true`,
    });

    // Audit log
    await createAuditLog({
      action: "CHECKOUT_SESSION_CREATED",
      userId,
      severity: "info",
      metadata: {
        productId,
        sessionId: session.id,
        amountCents: price.amount * 100,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
