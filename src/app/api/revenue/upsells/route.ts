/**
 * 🎯 SMART UPSELL API
 * Personalized product recommendations
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUpsellRecommendations,
  trackUpsellEvent,
  createUpsellRule,
  getUpsellAnalytics,
} from "@/lib/revenue/upsell-engine";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/revenue/upsells?trigger=cart&userId=xxx
 * Get personalized upsell recommendations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const trigger = searchParams.get("trigger") as any;
    const userId = searchParams.get("userId") || session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (!trigger) {
      return NextResponse.json({ error: "trigger required" }, { status: 400 });
    }

    // Build context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cartItems: true,
        purchases: true,
        progress: true,
        userLTV: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const context = {
      userId,
      currentPage: req.headers.get("referer") || "",
      cartValue: user.cartItems?.reduce(
        (sum, item) => sum + (item.price || 0),
        0
      ),
      cartItems: user.cartItems?.map(
        (item) => item.bookId || item.courseId || ""
      ),
      completedCourses: user.progress
        ?.filter((p) => p.completed)
        .map((p) => p.bookId),
      userSegment: user.userLTV?.segment || "low",
      totalSpent: user.userLTV?.totalSpent || 0,
    };

    const recommendations = await getUpsellRecommendations(context, trigger);

    // Track impressions
    for (const rec of recommendations) {
      await trackUpsellEvent(userId, rec.ruleId, "shown", context);
    }

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Upsell recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/revenue/upsells/track
 * Track upsell interaction
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { userId, ruleId, action, revenue, context } = body;

    if (!userId || !ruleId || !action) {
      return NextResponse.json(
        { error: "userId, ruleId, and action required" },
        { status: 400 }
      );
    }

    await trackUpsellEvent(userId, ruleId, action, context, revenue);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upsell tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/revenue/upsells (Admin only)
 * Create or update upsell rule
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const rule = await createUpsellRule(body);

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error) {
    console.error("Upsell rule creation error:", error);
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revenue/upsells/analytics (Admin only)
 * Get upsell performance analytics
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const ruleId = searchParams.get("ruleId") || undefined;

    const analytics = await getUpsellAnalytics(ruleId);

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Upsell analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    );
  }
}
