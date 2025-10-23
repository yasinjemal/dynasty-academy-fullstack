import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/engagement/campaigns - List all campaigns
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const active = searchParams.get("active");

    const campaigns = await (prisma as any).scheduledCampaign.findMany({
      where: {
        ...(status && { status }),
        ...(active !== null && { isActive: active === "true" }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/engagement/campaigns - Create new campaign
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      templateId,
      targetAudience,
      customFilter,
      scheduleType,
      scheduledAt,
      recurringPattern,
      recurringDays,
      recurringTime,
      isDripCampaign,
      dripDays,
    } = body;

    // Validation
    if (!name || !targetAudience || !scheduleType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate nextRunAt based on schedule
    let nextRunAt: Date | null = null;
    if (scheduleType === "one_time" && scheduledAt) {
      nextRunAt = new Date(scheduledAt);
    } else if (scheduleType === "recurring" && recurringTime) {
      // Set next run to today at the recurring time
      const [hours, minutes] = recurringTime.split(":");
      nextRunAt = new Date();
      nextRunAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      // If time has passed today, schedule for tomorrow
      if (nextRunAt < new Date()) {
        nextRunAt.setDate(nextRunAt.getDate() + 1);
      }
    } else if (scheduleType === "drip") {
      // Drip campaigns start immediately for new users
      nextRunAt = new Date();
    }

    const campaign = await (prisma as any).scheduledCampaign.create({
      data: {
        name,
        description,
        templateId,
        targetAudience,
        customFilter: customFilter ? JSON.parse(customFilter) : null,
        scheduleType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        recurringPattern,
        recurringDays: recurringDays || [],
        recurringTime,
        isDripCampaign: isDripCampaign || false,
        dripDays: dripDays || [],
        status: "draft",
        isActive: false,
        nextRunAt,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

// PUT /api/engagement/campaigns/:id - Update campaign
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID required" },
        { status: 400 }
      );
    }

    // Handle date conversions
    if (updateData.scheduledAt) {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }
    if (updateData.nextRunAt) {
      updateData.nextRunAt = new Date(updateData.nextRunAt);
    }

    const campaign = await (prisma as any).scheduledCampaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE /api/engagement/campaigns/:id
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID required" },
        { status: 400 }
      );
    }

    // Don't actually delete, just mark as inactive
    await (prisma as any).scheduledCampaign.update({
      where: { id },
      data: {
        isActive: false,
        status: "completed",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
