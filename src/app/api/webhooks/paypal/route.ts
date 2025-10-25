/**
 * 💳 PAYPAL WEBHOOK HANDLER
 * Handles PayPal webhook events
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { PayPalProvider } from "@/lib/payments/providers/paypal";
import { splitTransfer } from "@/lib/ledger/transfers";
import { getOrCreateAccount } from "@/lib/ledger/accounts";

export async function POST(req: NextRequest) {
  try {
    const paypal = new PayPalProvider();
    const body = await req.text();
    const event = JSON.parse(body);

    console.log("PayPal webhook received:", event.event_type);

    // Verify webhook signature (optional but recommended)
    // const headers = {
    //   'paypal-auth-algo': req.headers.get('paypal-auth-algo') || '',
    //   'paypal-cert-url': req.headers.get('paypal-cert-url') || '',
    //   'paypal-transmission-id': req.headers.get('paypal-transmission-id') || '',
    //   'paypal-transmission-sig': req.headers.get('paypal-transmission-sig') || '',
    //   'paypal-transmission-time': req.headers.get('paypal-transmission-time') || '',
    // }
    // const isValid = await paypal.verifyWebhook({
    //   webhookId: process.env.PAYPAL_WEBHOOK_ID!,
    //   headers,
    //   body,
    // })
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    // }

    // Handle completed checkout
    if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
      const orderId = event.resource.id;

      // Capture the payment
      const capturedOrder = await paypal.captureOrder(orderId);

      if (capturedOrder.status !== "COMPLETED") {
        console.log("PayPal order not completed:", capturedOrder.status);
        return NextResponse.json({ received: true });
      }

      // Extract metadata
      const purchaseUnit = capturedOrder.purchase_units[0];
      const bookId = purchaseUnit.reference_id;
      const userId = purchaseUnit.custom_id;

      if (!userId || !bookId) {
        console.error("PayPal: Missing metadata");
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      // Check if already processed
      const existingPurchase = await prisma.purchase.findFirst({
        where: {
          userId,
          bookId,
          status: "completed",
        },
      });

      if (existingPurchase) {
        console.log("PayPal: Purchase already processed");
        return NextResponse.json({ received: true });
      }

      // Get book details
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: {
          id: true,
          title: true,
          authorId: true,
          price: true,
        },
      });

      if (!book) {
        console.error("PayPal: Book not found", bookId);
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }

      const captureId = purchaseUnit.payments?.captures?.[0]?.id;
      const amount = parseFloat(purchaseUnit.amount.value);
      const currency = purchaseUnit.amount.currency_code;

      // Create purchase record
      const purchase = await prisma.purchase.create({
        data: {
          userId,
          bookId,
          amount,
          status: "completed",
          paymentProvider: "paypal",
          paymentIntentId: captureId || orderId,
          metadata: {
            paypalOrder: capturedOrder,
          },
        },
      });

      // =====================================================
      // LEDGER INTEGRATION
      // =====================================================
      try {
        const buyerAccount = await getOrCreateAccount({
          ownerId: userId,
          kind: "user",
          currency,
        });

        const platformAccount = await getOrCreateAccount({
          ownerId: null,
          kind: "platform",
          currency,
        });

        const instructorAccount = await getOrCreateAccount({
          ownerId: book.authorId,
          kind: "instructor",
          currency,
        });

        // Platform fee: 10%
        const platformFeeRate = 0.1;
        const amountCents = Math.round(amount * 100);
        const platformFeeCents = Math.round(amountCents * platformFeeRate);

        await splitTransfer({
          buyerAccountId: buyerAccount.id,
          instructorAccountId: instructorAccount.id,
          platformAccountId: platformAccount.id,
          grossAmount: amountCents,
          platformFeeAmount: platformFeeCents,
          currency,
          productId: bookId,
          idempotencyKey: `paypal_${captureId || orderId}`,
        });

        console.log("✅ PayPal: Ledger entries created");
      } catch (ledgerError) {
        console.error("⚠️ PayPal: Ledger entry failed:", ledgerError);
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: "PAYMENT",
          title: "Payment Successful",
          message: `Your purchase of "${book.title}" was successful!`,
          read: false,
        },
      });

      console.log("✅ PayPal: Purchase completed", purchase.id);
    }

    // Handle payment capture completed (backup event)
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      console.log("PayPal: Payment capture completed");
      // Already handled in CHECKOUT.ORDER.APPROVED
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
