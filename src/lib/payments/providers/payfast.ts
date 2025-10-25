/**
 * 🇿🇦 PAYFAST INTEGRATION
 * South African payment gateway
 * Docs: https://developers.payfast.co.za/
 */

import crypto from "crypto";

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  testMode: boolean;
}

interface PayFastPaymentData {
  merchantId: string;
  merchantKey: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  nameFirst: string;
  emailAddress: string;
  mPaymentId: string; // Unique payment ID
  amount: string;
  itemName: string;
  itemDescription?: string;
  customStr1?: string; // User ID
  customStr2?: string; // Book ID
  customStr3?: string; // Order type
  emailConfirmation?: string;
  confirmationAddress?: string;
  signature?: string;
}

export class PayFastProvider {
  private config: PayFastConfig;

  constructor() {
    this.config = {
      merchantId: process.env.PAYFAST_MERCHANT_ID || "",
      merchantKey: process.env.PAYFAST_MERCHANT_KEY || "",
      passphrase: process.env.PAYFAST_PASSPHRASE || "",
      testMode: process.env.NODE_ENV !== "production",
    };
  }

  /**
   * Create payment form data for PayFast
   */
  createPayment({
    userId,
    userName,
    userEmail,
    bookId,
    bookTitle,
    amount,
    orderId,
    returnUrl,
    cancelUrl,
    notifyUrl,
  }: {
    userId: string;
    userName: string;
    userEmail: string;
    bookId: string;
    bookTitle: string;
    amount: number;
    orderId: string;
    returnUrl: string;
    cancelUrl: string;
    notifyUrl: string;
  }) {
    const paymentData: PayFastPaymentData = {
      merchantId: this.config.merchantId,
      merchantKey: this.config.merchantKey,
      returnUrl,
      cancelUrl,
      notifyUrl,
      nameFirst: userName.split(" ")[0] || userName,
      emailAddress: userEmail,
      mPaymentId: orderId,
      amount: amount.toFixed(2), // PayFast requires 2 decimal places
      itemName: bookTitle,
      itemDescription: `Purchase: ${bookTitle}`,
      customStr1: userId,
      customStr2: bookId,
      customStr3: "book_purchase",
      emailConfirmation: "1",
      confirmationAddress: userEmail,
    };

    // Generate signature
    paymentData.signature = this.generateSignature(paymentData);

    return {
      url: this.config.testMode
        ? "https://sandbox.payfast.co.za/eng/process"
        : "https://www.payfast.co.za/eng/process",
      data: paymentData,
    };
  }

  /**
   * Generate MD5 signature for PayFast
   */
  private generateSignature(data: Partial<PayFastPaymentData>): string {
    // Create parameter string
    let paramString = "";
    const sortedKeys = Object.keys(data).sort();

    for (const key of sortedKeys) {
      if (key !== "signature") {
        const value = data[key as keyof PayFastPaymentData];
        if (value !== undefined && value !== "") {
          paramString += `${key}=${encodeURIComponent(value.toString())}&`;
        }
      }
    }

    // Remove trailing &
    paramString = paramString.slice(0, -1);

    // Add passphrase
    if (this.config.passphrase) {
      paramString += `&passphrase=${encodeURIComponent(
        this.config.passphrase
      )}`;
    }

    // Generate MD5 hash
    return crypto.createHash("md5").update(paramString).digest("hex");
  }

  /**
   * Verify PayFast webhook signature
   */
  verifySignature(data: Record<string, string>): boolean {
    const signature = data.signature;
    delete data.signature;

    const generatedSignature = this.generateSignature(
      data as Partial<PayFastPaymentData>
    );
    return signature === generatedSignature;
  }

  /**
   * Verify PayFast IPN (Instant Payment Notification)
   */
  async verifyIPN(data: Record<string, string>): Promise<boolean> {
    // 1. Check signature
    if (!this.verifySignature({ ...data })) {
      console.error("PayFast: Invalid signature");
      return false;
    }

    // 2. Verify payment status
    const validStatuses = ["COMPLETE"];
    if (!validStatuses.includes(data.payment_status)) {
      console.error("PayFast: Invalid payment status", data.payment_status);
      return false;
    }

    // 3. Verify amount (compare with your database)
    // This should be done in the webhook handler

    return true;
  }

  /**
   * Check if PayFast is configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.merchantId &&
      this.config.merchantKey &&
      this.config.passphrase
    );
  }
}
