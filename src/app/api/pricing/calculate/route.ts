/**
 * 💰 DYNAMIC PRICING API
 * Calculate optimized prices in real-time
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  calculateDynamicPrice,
  getPricingContext,
  trackPriceTest,
} from "@/lib/revenue/dynamic-pricing";

/**
 * POST /api/pricing/calculate
 * Calculate optimized price for a product
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { productId, productType, context = {} } = body;

    if (!productId || !productType) {
      return NextResponse.json(
        { error: "productId and productType are required" },
        { status: 400 }
      );
    }

    // Build pricing context
    const userAgent = req.headers.get("user-agent") || undefined;
    const fullContext = {
      ...getPricingContext(session?.user?.id, userAgent),
      ...context,
    };

    // Calculate price
    const pricing = await calculateDynamicPrice(productId, productType, fullContext);

    // Track price test impression
    if (pricing.finalPrice !== pricing.basePrice) {
      await trackPriceTest(productId, pricing.finalPrice, "impression");
    }

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.error("Pricing calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pricing/calculate?productId=xxx&productType=course
 * Calculate optimized price (GET method for caching)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("productId");
    const productType = searchParams.get("productType");

    if (!productId || !productType) {
      return NextResponse.json(
        { error: "productId and productType are required" },
        { status: 400 }
      );
    }

    // Build pricing context
    const userAgent = req.headers.get("user-agent") || undefined;
    const context = getPricingContext(session?.user?.id, userAgent);

    // Calculate price
    const pricing = await calculateDynamicPrice(
      productId,
      productType as any,
      context
    );

    // Track price test impression
    if (pricing.finalPrice !== pricing.basePrice) {
      await trackPriceTest(productId, pricing.finalPrice, "impression");
    }

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.error("Pricing calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 }
    );
  }
}
