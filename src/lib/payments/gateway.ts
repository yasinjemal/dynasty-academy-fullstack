/**
 * 💰 UNIFIED PAYMENT GATEWAY
 * Supports multiple payment providers: Stripe, PayFast, PayPal
 */

import { PayFastProvider } from "./providers/payfast";
import { PayPalProvider } from "./providers/paypal";
import Stripe from "stripe";

export type PaymentProvider = "stripe" | "payfast" | "paypal";

export interface PaymentSessionData {
  userId: string;
  userName: string;
  userEmail: string;
  bookId: string;
  bookTitle: string;
  amount: number;
  currency?: string;
  orderId: string;
}

export interface PaymentSession {
  provider: PaymentProvider;
  sessionId: string;
  approvalUrl: string;
  orderId: string;
  formData?: Record<string, string>; // For PayFast redirect
}

export class PaymentGateway {
  private stripe: Stripe | null;
  private payfast: PayFastProvider;
  private paypal: PayPalProvider;

  constructor() {
    // Initialize Stripe
    this.stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2024-12-18.acacia",
        })
      : null;

    // Initialize PayFast
    this.payfast = new PayFastProvider();

    // Initialize PayPal
    this.paypal = new PayPalProvider();
  }

  /**
   * Get available payment providers
   */
  getAvailableProviders(): PaymentProvider[] {
    const providers: PaymentProvider[] = [];

    if (this.stripe) providers.push("stripe");
    if (this.payfast.isConfigured()) providers.push("payfast");
    if (this.paypal.isConfigured()) providers.push("paypal");

    return providers;
  }

  /**
   * Create payment session with specified provider
   */
  async createPaymentSession(
    provider: PaymentProvider,
    data: PaymentSessionData,
    baseUrl: string
  ): Promise<PaymentSession> {
    const returnUrl = `${baseUrl}/books/${data.bookId}/read?success=true`;
    const cancelUrl = `${baseUrl}/books/${data.bookId}/read?canceled=true`;
    const notifyUrl = `${baseUrl}/api/webhooks/${provider}`;

    switch (provider) {
      case "stripe":
        return this.createStripeSession(data, returnUrl, cancelUrl);

      case "payfast":
        return this.createPayFastSession(data, returnUrl, cancelUrl, notifyUrl);

      case "paypal":
        return this.createPayPalSession(data, returnUrl, cancelUrl);

      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  /**
   * Create Stripe checkout session
   */
  private async createStripeSession(
    data: PaymentSessionData,
    returnUrl: string,
    cancelUrl: string
  ): Promise<PaymentSession> {
    if (!this.stripe) {
      throw new Error("Stripe is not configured");
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: data.currency || "usd",
            product_data: {
              name: data.bookTitle,
              description: "Full book access - Lifetime",
            },
            unit_amount: Math.round(data.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${returnUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      client_reference_id: data.userId,
      metadata: {
        userId: data.userId,
        bookId: data.bookId,
        type: "book_purchase",
        orderId: data.orderId,
      },
    });

    return {
      provider: "stripe",
      sessionId: session.id,
      approvalUrl: session.url!,
      orderId: data.orderId,
    };
  }

  /**
   * Create PayFast payment session
   */
  private async createPayFastSession(
    data: PaymentSessionData,
    returnUrl: string,
    cancelUrl: string,
    notifyUrl: string
  ): Promise<PaymentSession> {
    const payment = this.payfast.createPayment({
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      bookId: data.bookId,
      bookTitle: data.bookTitle,
      amount: data.amount,
      orderId: data.orderId,
      returnUrl,
      cancelUrl,
      notifyUrl,
    });

    return {
      provider: "payfast",
      sessionId: data.orderId,
      approvalUrl: payment.url,
      orderId: data.orderId,
      formData: payment.data as unknown as Record<string, string>,
    };
  }

  /**
   * Create PayPal order
   */
  private async createPayPalSession(
    data: PaymentSessionData,
    returnUrl: string,
    cancelUrl: string
  ): Promise<PaymentSession> {
    const { orderId, approvalUrl } = await this.paypal.createOrder({
      userId: data.userId,
      bookId: data.bookId,
      bookTitle: data.bookTitle,
      amount: data.amount,
      currency: data.currency || "USD",
      returnUrl,
      cancelUrl,
    });

    return {
      provider: "paypal",
      sessionId: orderId,
      approvalUrl,
      orderId: data.orderId,
    };
  }

  /**
   * Get provider instances (for webhook handlers)
   */
  getProviders() {
    return {
      stripe: this.stripe,
      payfast: this.payfast,
      paypal: this.paypal,
    };
  }
}

// Singleton instance
export const paymentGateway = new PaymentGateway();
