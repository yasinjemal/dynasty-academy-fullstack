/**
 * STRIPE INTEGRATION - SAFE MODE
 *
 * Non-custodial payment processing
 * Dynasty doesn't hold money - Stripe does
 * We track entitlements in internal ledger
 *
 * Flow:
 * 1. User pays Stripe (checkout session)
 * 2. Stripe sends webhook (checkout.session.completed)
 * 3. We record ledger entries + grant ownership
 * 4. Instructor gets paid via Stripe Connect
 */

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error("Stripe secret key not configured");
    }
    stripeClient = new Stripe(secret, {
      apiVersion: "2025-09-30.clover",
    });
  }

  return stripeClient;
}

/**
 * Create checkout session for product purchase
 */
export async function createCheckoutSession(params: {
  productId: string;
  productTitle: string;
  productDescription: string;
  priceAmountCents: number;
  currency: string;
  userId: string;
  userEmail: string;
  instructorId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const {
    productId,
    productTitle,
    productDescription,
    priceAmountCents,
    currency,
    userId,
    userEmail,
    instructorId,
    successUrl,
    cancelUrl,
  } = params;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: productTitle,
              description: productDescription,
            },
            unit_amount: priceAmountCents,
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        productId,
        userId,
        instructorId,
        type: "product_purchase",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}

/**
 * Create subscription checkout session
 */
export async function createSubscriptionSession(params: {
  productId: string;
  productTitle: string;
  priceAmountCents: number;
  currency: string;
  interval: "month" | "year";
  userId: string;
  userEmail: string;
  instructorId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const {
    productId,
    productTitle,
    priceAmountCents,
    currency,
    interval,
    userId,
    userEmail,
    instructorId,
    successUrl,
    cancelUrl,
  } = params;

  try {
    const stripe = getStripeClient();
    // Create or get Stripe price
    const price = await stripe.prices.create({
      currency: currency.toLowerCase(),
      product_data: {
        name: productTitle,
      },
      unit_amount: priceAmountCents,
      recurring: {
        interval,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        productId,
        userId,
        instructorId,
        type: "subscription",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating subscription session:", error);
    throw new Error("Failed to create subscription session");
  }
}

/**
 * Create Stripe Connect account for instructor
 */
export async function createConnectAccount(params: {
  instructorId: string;
  email: string;
  country: string;
}): Promise<string> {
  const { instructorId, email, country } = params;

  try {
    const stripe = getStripeClient();
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        instructorId,
      },
    });

    return account.id;
  } catch (error) {
    console.error("Error creating Connect account:", error);
    throw new Error("Failed to create Connect account");
  }
}

/**
 * Create Connect account onboarding link
 */
export async function createConnectOnboardingLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  try {
    const stripe = getStripeClient();
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return accountLink.url;
  } catch (error) {
    console.error("Error creating onboarding link:", error);
    throw new Error("Failed to create onboarding link");
  }
}

/**
 * Get Connect account details
 */
export async function getConnectAccount(
  accountId: string
): Promise<Stripe.Account> {
  try {
    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error("Error retrieving Connect account:", error);
    throw new Error("Failed to retrieve Connect account");
  }
}

/**
 * Create payout to instructor via Connect
 */
export async function createConnectPayout(params: {
  accountId: string;
  amountCents: number;
  currency: string;
  description: string;
  metadata?: any;
}): Promise<Stripe.Payout> {
  const { accountId, amountCents, currency, description, metadata } = params;

  try {
    const stripe = getStripeClient();
    const payout = await stripe.payouts.create(
      {
        amount: amountCents,
        currency: currency.toLowerCase(),
        description,
        metadata,
      },
      {
        stripeAccount: accountId,
      }
    );

    return payout;
  } catch (error) {
    console.error("Error creating payout:", error);
    throw new Error("Failed to create payout");
  }
}

/**
 * Process refund
 */
export async function createRefund(params: {
  paymentIntentId: string;
  amountCents?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}): Promise<Stripe.Refund> {
  const { paymentIntentId, amountCents, reason } = params;

  try {
    const stripe = getStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
      reason,
    });

    return refund;
  } catch (error) {
    console.error("Error creating refund:", error);
    throw new Error("Failed to create refund");
  }
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    const stripe = getStripeClient();
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw new Error("Invalid webhook signature");
  }
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw new Error("Failed to retrieve payment intent");
  }
}

/**
 * Get checkout session details
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });
    return session;
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    throw new Error("Failed to retrieve checkout session");
  }
}
