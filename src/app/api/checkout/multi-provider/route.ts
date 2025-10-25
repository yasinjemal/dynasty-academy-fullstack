import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { paymentGateway, PaymentProvider } from "@/lib/payments/gateway";

export async function GET() {
  // Return available payment providers
  const providers = paymentGateway.getAvailableProviders();

  return NextResponse.json({
    providers,
    default: providers.includes("stripe")
      ? "stripe"
      : providers.includes("paypal")
      ? "paypal"
      : providers.includes("payfast")
      ? "payfast"
      : null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      bookId,
      provider = "stripe",
      currency = "USD",
    } = (await req.json()) as {
      bookId: string;
      provider?: PaymentProvider;
      currency?: string;
    };

    if (!bookId) {
      return NextResponse.json({ error: "Book ID required" }, { status: 400 });
    }

    // Check if provider is available
    const availableProviders = paymentGateway.getAvailableProviders();
    if (!availableProviders.includes(provider)) {
      return NextResponse.json(
        {
          error: `Payment provider '${provider}' is not configured`,
          availableProviders,
        },
        { status: 400 }
      );
    }

    // Get book details
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        salePrice: true,
        coverImage: true,
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        bookId,
        status: "completed",
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        {
          error: "Book already purchased",
          purchased: true,
        },
        { status: 400 }
      );
    }

    // Calculate amount
    const amount = book.salePrice || book.price;

    // Convert currency for South African Rand (PayFast)
    let finalAmount = amount;
    let finalCurrency = currency;

    if (provider === "payfast") {
      // PayFast uses ZAR
      finalCurrency = "ZAR";
      // Simple conversion: $1 = R18 (update this to use real exchange rate API)
      if (currency === "USD") {
        finalAmount = amount * 18;
      }
    }

    // Create pending order in database
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        email: session.user.email!,
        subtotal: finalAmount,
        total: finalAmount,
        status: "PENDING",
        paymentMethod: provider.toUpperCase(),
      },
    });

    // Create payment session with chosen provider
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const paymentSession = await paymentGateway.createPaymentSession(
      provider,
      {
        userId: session.user.id,
        userName: session.user.name || "User",
        userEmail: session.user.email!,
        bookId: book.id,
        bookTitle: book.title,
        amount: finalAmount,
        currency: finalCurrency,
        orderId: order.id,
      },
      baseUrl
    );

    // Return session details
    return NextResponse.json({
      provider: paymentSession.provider,
      sessionId: paymentSession.sessionId,
      approvalUrl: paymentSession.approvalUrl,
      orderId: paymentSession.orderId,
      formData: paymentSession.formData, // For PayFast
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
