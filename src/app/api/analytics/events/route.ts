/**
 * 📊 ANALYTICS EVENTS API
 * Track and query events
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { trackEvent, getEvents, getEventCounts, getTopEvents } from "@/lib/analytics/analytics-engine";

/**
 * POST /api/analytics/events - Track new event
 * GET /api/analytics/events - Query events
 */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { event, category, properties, page, referrer } = body;

    if (!event) {
      return NextResponse.json({ error: "Event name required" }, { status: 400 });
    }

    // Get session ID from cookies or generate
    const sessionId = req.cookies.get("session_id")?.value || crypto.randomUUID();

    const analyticsEvent = await trackEvent({
      userId: session.user.id,
      sessionId,
      event,
      category: category || "general",
      properties: properties || {},
      page: page || req.headers.get("referer") || undefined,
      referrer: referrer || req.headers.get("referer") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      event: analyticsEvent,
    });
  } catch (error: any) {
    console.error("Track event error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track event" },
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

    // Only admins can query all events
    const user = await prisma?.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Event counts
    if (action === "counts") {
      const groupBy = searchParams.get("groupBy") as "day" | "hour" | "userId" || "day";
      const event = searchParams.get("event") || undefined;
      const startDate = searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : new Date();

      const counts = await getEventCounts(groupBy, event, startDate, endDate);
      return NextResponse.json({ counts });
    }

    // Top events
    if (action === "top") {
      const limit = parseInt(searchParams.get("limit") || "10");
      const startDate = searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : new Date();

      const topEvents = await getTopEvents(limit, startDate, endDate);
      return NextResponse.json({ events: topEvents });
    }

    // Query events
    const userId = searchParams.get("userId") || undefined;
    const event = searchParams.get("event") || undefined;
    const category = searchParams.get("category") || undefined;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;
    const limit = parseInt(searchParams.get("limit") || "100");

    const events = await getEvents({
      userId,
      event,
      category,
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (error: any) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get events" },
      { status: 500 }
    );
  }
}
