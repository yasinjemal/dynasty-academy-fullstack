/**
 * 💳 PAYPAL INTEGRATION
 * Global payment gateway
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 */

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: "sandbox" | "live";
}

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    payee?: {
      email_address?: string;
      merchant_id?: string;
    };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
  payer?: {
    name?: {
      given_name: string;
      surname: string;
    };
    email_address?: string;
    payer_id?: string;
  };
}

export class PayPalProvider {
  private config: PayPalConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      clientId: process.env.PAYPAL_CLIENT_ID || "",
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
      mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
    };

    this.baseUrl =
      this.config.mode === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";
  }

  /**
   * Get PayPal access token
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString("base64");

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Create PayPal order
   */
  async createOrder({
    userId,
    bookId,
    bookTitle,
    amount,
    currency = "USD",
    returnUrl,
    cancelUrl,
  }: {
    userId: string;
    bookId: string;
    bookTitle: string;
    amount: number;
    currency?: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ orderId: string; approvalUrl: string }> {
    const accessToken = await this.getAccessToken();

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: bookId,
          description: bookTitle,
          custom_id: userId, // Store user ID
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "Dynasty Academy",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal order creation failed: ${JSON.stringify(error)}`);
    }

    const order = await response.json();

    // Get approval URL
    const approvalUrl = order.links.find(
      (link: { rel: string; href: string }) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    return {
      orderId: order.id,
      approvalUrl,
    };
  }

  /**
   * Capture PayPal order (complete payment)
   */
  async captureOrder(orderId: string): Promise<PayPalOrder> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal capture failed: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<PayPalOrder> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get PayPal order");
    }

    return response.json();
  }

  /**
   * Verify PayPal webhook signature
   */
  async verifyWebhook({
    webhookId,
    headers,
    body,
  }: {
    webhookId: string;
    headers: Record<string, string>;
    body: string;
  }): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const verificationData = {
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const response = await fetch(
      `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationData),
      }
    );

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.verification_status === "SUCCESS";
  }

  /**
   * Check if PayPal is configured
   */
  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }
}
