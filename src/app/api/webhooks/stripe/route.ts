import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db/prisma";
import Stripe from "stripe";
import { splitTransfer } from "@/lib/ledger/transfers";
import { getOrCreateAccount } from "@/lib/ledger/accounts";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Get metadata
      const userId = session.metadata?.userId;
      const cartItemsData = session.metadata?.cartItems;

      if (!userId || !cartItemsData) {
        throw new Error("Missing metadata");
      }

      const cartItems = JSON.parse(cartItemsData) as Array<{
        bookId: string;
        quantity: number;
        price: number;
      }>;

      // Calculate total
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: "COMPLETED",
          paymentMethod: "STRIPE",
          stripePaymentId: session.payment_intent as string,
          items: {
            create: cartItems.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      });

      // Clear user's cart
      await prisma.cartItem.deleteMany({
        where: { userId },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: "ORDER",
          title: "Order Confirmed",
          message: `Your order #${order.id.slice(0, 8)} has been confirmed!`,
          read: false,
        },
      });

      console.log("Order created successfully:", order.id);

      // =====================================================
      // LEDGER INTEGRATION: Record financial transaction
      // =====================================================
      try {
        // Get or create ledger accounts
        const buyerAccount = await getOrCreateAccount({
          ownerId: userId,
          kind: "user",
          currency: "USD",
        });

        const platformAccount = await getOrCreateAccount({
          ownerId: null, // Platform has no owner
          kind: "platform",
          currency: "USD",
        });

        // Platform fee: 10% (adjust based on your business model)
        const platformFeeRate = 0.1;
        const totalAmountCents = Math.round(totalAmount * 100); // Convert to cents
        const platformFeeCents = Math.round(totalAmountCents * platformFeeRate);
        const instructorNetCents = totalAmountCents - platformFeeCents;

        // For each book in the order, find the instructor and record ledger entries
        for (const item of order.items) {
          if (!item.book.authorId) {
            console.warn(
              `Book ${item.bookId} has no author, skipping ledger entry`
            );
            continue;
          }

          const instructorAccount = await getOrCreateAccount({
            ownerId: item.book.authorId,
            kind: "instructor",
            currency: "USD",
          });

          const itemAmountCents = Math.round(item.price * 100 * item.quantity);
          const itemPlatformFeeCents = Math.round(
            itemAmountCents * platformFeeRate
          );
          const itemInstructorNetCents = itemAmountCents - itemPlatformFeeCents;

          // Create atomic split transfer (fee + net payment in single TX)
          await splitTransfer({
            buyerAccountId: buyerAccount.id,
            instructorAccountId: instructorAccount.id,
            platformAccountId: platformAccount.id,
            grossAmount: itemAmountCents,
            platformFeeAmount: itemPlatformFeeCents,
            currency: "USD",
            productId: item.bookId,
            idempotencyKey: `stripe_${session.id}_${item.bookId}`, // Prevent duplicate entries
          });

          console.log(
            `Ledger entry created: Book ${item.bookId}, Gross: $${
              itemAmountCents / 100
            }, Fee: $${itemPlatformFeeCents / 100}, Net: $${
              itemInstructorNetCents / 100
            }`
          );
        }

        console.log("✅ All ledger entries created successfully");
      } catch (ledgerError) {
        // Log but don't fail the webhook - order is already created
        console.error(
          "⚠️ Ledger entry creation failed (order still succeeded):",
          ledgerError
        );
        // TODO: Add alerting/monitoring for ledger failures
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
