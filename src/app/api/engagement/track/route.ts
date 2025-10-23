import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/engagement/track
 * Track user behavior events for ML training
 *
 * Example events:
 * - page_view, lesson_start, lesson_complete
 * - quiz_attempt, quiz_complete
 * - video_watch, note_taken
 * - login, logout, session_end
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventType, metadata = {}, sessionId, deviceType, platform } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Create behavior event
    const event = await prisma.behaviorEvent.create({
      data: {
        userId: session.user.id,
        eventType,
        metadata,
        sessionId,
        deviceType,
        platform,
        timestamp: new Date(),
      },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      event,
      message: "Event tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json(
      {
        error: "Failed to track event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/engagement/track?userId=xxx&limit=100
 * Get behavior events for a user (admin only, or own events)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;
    const limit = parseInt(searchParams.get("limit") || "100");
    const eventType = searchParams.get("eventType");

    // Only allow users to view their own events, or admins to view any
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const events = await prisma.behaviorEvent.findMany({
      where: {
        userId,
        ...(eventType && { eventType }),
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
