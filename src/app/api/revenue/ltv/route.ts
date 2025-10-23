/**
 * 💎 LIFETIME VALUE API
 * Predict and track customer value
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  calculateUserLTV,
  saveUserLTV,
  getHighValueUsers,
  batchCalculateLTV,
} from "@/lib/revenue/ltv-prediction";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/revenue/ltv?userId=xxx
 * Get LTV prediction for a user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;
    const segment = searchParams.get("segment"); // Filter by segment
    const minLTV = searchParams.get("minLTV"); // Filter by minimum LTV

    // Only admins can view other users or use filters
    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin && (userId !== session.user.id || segment || minLTV)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get high-value users (admin only)
    if (isAdmin && minLTV) {
      const users = await getHighValueUsers(parseFloat(minLTV));
      return NextResponse.json({
        success: true,
        users,
      });
    }

    // Get specific user's LTV
    let userLTV = await prisma.userLTV.findUnique({
      where: { userId },
      include: { user: true },
    });

    // Calculate if doesn't exist or is stale (>30 days)
    const isStale =
      !userLTV ||
      Date.now() - new Date(userLTV.calculatedAt).getTime() >
        30 * 24 * 60 * 60 * 1000;

    if (isStale) {
      const prediction = await calculateUserLTV(userId);
      userLTV = await saveUserLTV(prediction);
    }

    return NextResponse.json({
      success: true,
      ltv: userLTV,
    });
  } catch (error) {
    console.error("LTV calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate LTV" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/revenue/ltv/batch
 * Batch calculate LTV (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { limit = 100 } = body;

    const results = await batchCalculateLTV(limit);

    // Calculate summary stats
    const summary = {
      total: results.length,
      whales: results.filter((r) => r.segment === "whale").length,
      highValue: results.filter((r) => r.segment === "high-value").length,
      medium: results.filter((r) => r.segment === "medium").length,
      low: results.filter((r) => r.segment === "low").length,
      atRisk: results.filter((r) => r.segment === "at-risk").length,
      avgLTV:
        results.reduce((sum, r) => sum + r.predictedLTV, 0) / results.length,
      totalPredictedValue: results.reduce((sum, r) => sum + r.predictedLTV, 0),
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
    });
  } catch (error) {
    console.error("Batch LTV calculation error:", error);
    return NextResponse.json(
      { error: "Failed to batch calculate LTV" },
      { status: 500 }
    );
  }
}
