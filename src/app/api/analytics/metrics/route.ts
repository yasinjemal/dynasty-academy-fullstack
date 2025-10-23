/**
 * 📈 METRICS API
 * Business metrics management
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  saveMetric,
  getMetrics,
  calculateActiveUsers,
  calculateConversionRate,
  calculateRetention,
  calculateGrowthRate,
} from "@/lib/analytics/analytics-engine";

/**
 * POST /api/analytics/metrics - Save metric
 * GET /api/analytics/metrics - Query metrics
 */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can save metrics
    const user = await prisma?.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, value, target, period, metadata } = body;

    if (!name || value === undefined) {
      return NextResponse.json(
        { error: "Name and value required" },
        { status: 400 }
      );
    }

    const metric = await saveMetric({
      name,
      value,
      target,
      period: period || "daily",
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true, metric });
  } catch (error: any) {
    console.error("Save metric error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save metric" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can view metrics
    const user = await prisma?.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Calculate active users
    if (action === "active_users") {
      const period = searchParams.get("period") as "day" | "week" | "month" || "day";
      const count = await calculateActiveUsers(period);
      return NextResponse.json({ period, count });
    }

    // Calculate conversion rate
    if (action === "conversion") {
      const startEvent = searchParams.get("startEvent");
      const endEvent = searchParams.get("endEvent");
      const timeWindowMinutes = parseInt(
        searchParams.get("timeWindow") || "1440"
      ); // 24 hours default

      if (!startEvent || !endEvent) {
        return NextResponse.json(
          { error: "startEvent and endEvent required" },
          { status: 400 }
        );
      }

      const rate = await calculateConversionRate(
        startEvent,
        endEvent,
        timeWindowMinutes
      );
      return NextResponse.json({ startEvent, endEvent, rate });
    }

    // Calculate retention
    if (action === "retention") {
      const cohortDate = searchParams.get("cohortDate")
        ? new Date(searchParams.get("cohortDate")!)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const retention = await calculateRetention(cohortDate);
      return NextResponse.json({ cohortDate, retention });
    }

    // Calculate growth rate
    if (action === "growth") {
      const metric = searchParams.get("metric");
      const currentPeriod = searchParams.get("currentPeriod") as "day" | "week" | "month" || "week";
      const previousPeriod = searchParams.get("previousPeriod") as "day" | "week" | "month" || "week";

      if (!metric) {
        return NextResponse.json(
          { error: "Metric name required" },
          { status: 400 }
        );
      }

      const growthRate = await calculateGrowthRate(
        metric,
        currentPeriod,
        previousPeriod
      );
      return NextResponse.json({ metric, growthRate });
    }

    // Query metrics
    const name = searchParams.get("name");
    const period = searchParams.get("period") as "hourly" | "daily" | "weekly" | "monthly";
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date();
    const limit = parseInt(searchParams.get("limit") || "100");

    const metrics = await getMetrics({
      name,
      period,
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json({ metrics, count: metrics.length });
  } catch (error: any) {
    console.error("Get metrics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get metrics" },
      { status: 500 }
    );
  }
}
