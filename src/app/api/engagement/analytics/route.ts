import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/engagement/analytics
 * Get intervention analytics and performance metrics from InterventionTracking
 * Admin only endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    const daysAgo = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Get all tracked interventions in range from the new InterventionTracking table
    const interventions = await (prisma as any).interventionTracking.findMany({
      where: {
        sentAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        channel: true,
        type: true,
        sentAt: true,
        openedAt: true,
        clickedAt: true,
        convertedAt: true,
        templateId: true,
      },
    });

    // Calculate REAL stats from tracked data
    const total_sent = interventions.length;
    const total_opened = interventions.filter(
      (i) => i.openedAt !== null
    ).length;
    const total_clicked = interventions.filter(
      (i) => i.clickedAt !== null
    ).length;
    const total_converted = interventions.filter(
      (i) => i.convertedAt !== null
    ).length;

    // Group by channel with REAL data
    const channelStats: { [key: string]: any } = {};
    interventions.forEach((intervention) => {
      const channel = intervention.channel || "UNKNOWN";
      if (!channelStats[channel]) {
        channelStats[channel] = {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
        };
      }
      channelStats[channel].sent++;
      if (intervention.openedAt) channelStats[channel].opened++;
      if (intervention.clickedAt) channelStats[channel].clicked++;
      if (intervention.convertedAt) channelStats[channel].converted++;
    });

    // Group by type with REAL data
    const typeGroups: { [key: string]: any } = {};
    interventions.forEach((intervention) => {
      const type = intervention.type || "general";
      if (!typeGroups[type]) {
        typeGroups[type] = { sent: 0, opened: 0, clicked: 0, converted: 0 };
      }
      typeGroups[type].sent++;
      if (intervention.openedAt) typeGroups[type].opened++;
      if (intervention.clickedAt) typeGroups[type].clicked++;
      if (intervention.convertedAt) typeGroups[type].converted++;
    });

    // Group by day with REAL data
    const dayGroups: { [key: string]: any } = {};
    interventions.forEach((intervention) => {
      const date = intervention.sentAt.toISOString().split("T")[0];
      if (!dayGroups[date]) {
        dayGroups[date] = {
          date,
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
        };
      }
      dayGroups[date].sent++;
      if (intervention.openedAt) dayGroups[date].opened++;
      if (intervention.clickedAt) dayGroups[date].clicked++;
      if (intervention.convertedAt) dayGroups[date].converted++;
    });

    const by_day = Object.values(dayGroups).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate average time to open (for opened interventions)
    const openedInterventions = interventions.filter(
      (i) => i.openedAt !== null
    );
    const avgTimeToOpenMs =
      openedInterventions.length > 0
        ? openedInterventions.reduce(
            (sum, i) => sum + (i.openedAt!.getTime() - i.sentAt.getTime()),
            0
          ) / openedInterventions.length
        : 0;
    const avgTimeToOpenHours = avgTimeToOpenMs / (1000 * 60 * 60);

    const stats = {
      total_sent,
      total_opened,
      total_clicked,
      total_converted,
      open_rate: total_sent > 0 ? (total_opened / total_sent) * 100 : 0,
      click_rate: total_sent > 0 ? (total_clicked / total_sent) * 100 : 0,
      conversion_rate:
        total_sent > 0 ? (total_converted / total_sent) * 100 : 0,
      avg_time_to_open: avgTimeToOpenHours,
      by_channel: channelStats,
      by_type: typeGroups,
      by_day,
    };

    return NextResponse.json({
      success: true,
      stats,
      range,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
