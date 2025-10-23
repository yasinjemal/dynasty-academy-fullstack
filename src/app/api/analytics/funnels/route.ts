/**
 * 🎯 FUNNELS API
 * Conversion path tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createFunnel,
  trackFunnelStep,
  getFunnelResults,
  calculateFunnelConversion,
  getDropoffAnalysis,
  getUserFunnelJourney,
  getActiveFunnels,
  deactivateFunnel,
} from "@/lib/analytics/funnel-tracking";

/**
 * POST /api/analytics/funnels - Create funnel or track step
 * GET /api/analytics/funnels - Query funnels
 */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, funnelId, name, steps, step, sessionId, timeWindow } = body;

    // Create funnel (admin only)
    if (action === "create") {
      const user = await prisma?.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      if (!name || !steps || steps.length < 2) {
        return NextResponse.json(
          { error: "Name and at least 2 steps required" },
          { status: 400 }
        );
      }

      const funnel = await createFunnel({
        name,
        steps,
        timeWindow: timeWindow || 60,
      });

      return NextResponse.json({ success: true, funnel });
    }

    // Track funnel step
    if (action === "track") {
      if (!funnelId || step === undefined || !sessionId) {
        return NextResponse.json(
          { error: "funnelId, step, and sessionId required" },
          { status: 400 }
        );
      }

      const event = await trackFunnelStep(
        funnelId,
        session.user.id,
        sessionId,
        step
      );

      return NextResponse.json({ success: true, event });
    }

    // Deactivate funnel (admin only)
    if (action === "deactivate") {
      const user = await prisma?.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      if (!funnelId) {
        return NextResponse.json(
          { error: "Funnel ID required" },
          { status: 400 }
        );
      }

      const funnel = await deactivateFunnel(funnelId);
      return NextResponse.json({ success: true, funnel });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Funnel error:", error);
    return NextResponse.json(
      { error: error.message || "Funnel operation failed" },
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

    // Only admins can view funnel analytics
    const user = await prisma?.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const funnelId = searchParams.get("funnelId");

    // Get funnel results
    if (action === "results" && funnelId) {
      const startDate = searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined;
      const endDate = searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined;

      const results = await getFunnelResults(funnelId, startDate, endDate);
      return NextResponse.json({ funnelId, results });
    }

    // Get conversion rate
    if (action === "conversion" && funnelId) {
      const startDate = searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined;
      const endDate = searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined;

      const rate = await calculateFunnelConversion(funnelId, startDate, endDate);
      return NextResponse.json({ funnelId, conversionRate: rate });
    }

    // Get dropoff analysis
    if (action === "dropoff" && funnelId) {
      const analysis = await getDropoffAnalysis(funnelId);
      return NextResponse.json({ funnelId, analysis });
    }

    // Get user journey
    if (action === "journey") {
      const userId = searchParams.get("userId");
      if (!funnelId || !userId) {
        return NextResponse.json(
          { error: "funnelId and userId required" },
          { status: 400 }
        );
      }

      const journey = await getUserFunnelJourney(funnelId, userId);
      return NextResponse.json({ funnelId, userId, journey });
    }

    // List active funnels
    const funnels = await getActiveFunnels();
    return NextResponse.json({ funnels });
  } catch (error: any) {
    console.error("Get funnels error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get funnels" },
      { status: 500 }
    );
  }
}
