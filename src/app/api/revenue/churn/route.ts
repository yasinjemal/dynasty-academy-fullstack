/**
 * 🛡️ CHURN PREDICTION API
 * Calculate risk and trigger interventions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  calculateChurnRisk,
  saveChurnRisk,
  triggerWinBackIntervention,
  batchCalculateChurnRisks,
} from "@/lib/revenue/churn-prediction";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/revenue/churn?userId=xxx
 * Get churn risk for a user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Only admins can view other users' churn risk
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get from database if exists
    let churnRisk = await prisma.churnRisk.findUnique({
      where: { userId },
    });

    // Calculate if doesn't exist or is stale (>7 days)
    const isStale =
      !churnRisk ||
      Date.now() - new Date(churnRisk.calculatedAt).getTime() >
        7 * 24 * 60 * 60 * 1000;

    if (isStale) {
      const prediction = await calculateChurnRisk(userId);
      churnRisk = await saveChurnRisk(prediction);
    }

    return NextResponse.json({
      success: true,
      churnRisk,
    });
  } catch (error) {
    console.error("Churn risk error:", error);
    return NextResponse.json(
      { error: "Failed to calculate churn risk" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/revenue/churn/intervene
 * Trigger win-back intervention
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, batch } = body;

    if (batch) {
      // Batch process multiple users
      const results = await batchCalculateChurnRisks(100);
      return NextResponse.json({
        success: true,
        processed: results.length,
        highRisk: results.filter(
          (r) => r.riskLevel === "high" || r.riskLevel === "critical"
        ).length,
      });
    }

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const offer = await triggerWinBackIntervention(userId);

    return NextResponse.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Intervention error:", error);
    return NextResponse.json(
      { error: "Failed to trigger intervention" },
      { status: 500 }
    );
  }
}
