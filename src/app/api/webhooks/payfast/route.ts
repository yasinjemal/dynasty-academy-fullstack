/**
 * 🇿🇦 PAYFAST WEBHOOK HANDLER
 * Handles Instant Payment Notifications (IPN) from PayFast
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { PayFastProvider } from "@/lib/payments/providers/payfast";
import { splitTransfer } from "@/lib/ledger/transfers";
import { getOrCreateAccount } from "@/lib/ledger/accounts";

export async function POST(req: NextRequest) {
  try {
    const payfast = new PayFastProvider();

    // Get form data
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("PayFast IPN received:", data);

    // Verify IPN
    const isValid = await payfast.verifyIPN(data);
    if (!isValid) {
      console.error("PayFast IPN verification failed");
      return NextResponse.json({ error: "Invalid IPN" }, { status: 400 });
    }

    // Check payment status
    if (data.payment_status !== "COMPLETE") {
      console.log("PayFast payment not complete:", data.payment_status);
      return NextResponse.json({ received: true });
    }

    // Extract metadata
    const userId = data.custom_str1;
    const bookId = data.custom_str2;
    const orderId = data.m_payment_id;

    if (!userId || !bookId || !orderId) {
      console.error("PayFast: Missing metadata");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error("PayFast: Order not found", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
      console.log("PayFast: Purchase already processed");
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
      console.error("PayFast: Book not found", bookId);
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        bookId,
        amount: parseFloat(data.amount_gross),
        status: "completed",
        paymentProvider: "payfast",
        paymentIntentId: data.pf_payment_id,
        metadata: {
          payfastData: data,
        },
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        paymentId: data.pf_payment_id,
        paymentMethod: "PAYFAST",
      },
    });

    // =====================================================
    // LEDGER INTEGRATION
    // =====================================================
    try {
      const buyerAccount = await getOrCreateAccount({
        ownerId: userId,
        kind: "user",
        currency: "ZAR",
      });

      const platformAccount = await getOrCreateAccount({
        ownerId: null,
        kind: "platform",
        currency: "ZAR",
      });

      const instructorAccount = await getOrCreateAccount({
        ownerId: book.authorId,
        kind: "instructor",
        currency: "ZAR",
      });

      // Platform fee: 10%
      const platformFeeRate = 0.1;
      const amountCents = Math.round(parseFloat(data.amount_gross) * 100);
      const platformFeeCents = Math.round(amountCents * platformFeeRate);

      await splitTransfer({
        buyerAccountId: buyerAccount.id,
        instructorAccountId: instructorAccount.id,
        platformAccountId: platformAccount.id,
        grossAmount: amountCents,
        platformFeeAmount: platformFeeCents,
        currency: "ZAR",
        productId: bookId,
        idempotencyKey: `payfast_${data.pf_payment_id}`,
      });

      console.log("✅ PayFast: Ledger entries created");
    } catch (ledgerError) {
      console.error("⚠️ PayFast: Ledger entry failed:", ledgerError);
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

    console.log("✅ PayFast: Purchase completed", purchase.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayFast webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
