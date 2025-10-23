import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { triggerInterventions } from "@/lib/engagement/notifications";

/**
 * POST /api/engagement/interventions
 * Trigger engagement interventions for at-risk students
 * Admin only endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, threshold = 60, channel = "ALL" } = body;

    if (userId) {
      // Trigger interventions for specific user
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      const engagementScore = await (
        prisma as any
      ).engagement_scores.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      await prisma.$disconnect();

      if (!engagementScore) {
        return NextResponse.json(
          { error: "No engagement score found for user" },
          { status: 404 }
        );
      }

      if (engagementScore.dropOffRisk >= threshold) {
        await triggerInterventions(
          userId,
          engagementScore.dropOffRisk,
          channel
        );

        return NextResponse.json({
          success: true,
          message: `Interventions triggered via ${channel}`,
          user: engagementScore.user.name,
          risk: engagementScore.dropOffRisk,
          channel,
        });
      }

      return NextResponse.json({
        success: true,
        message: "User is not at risk",
        risk: engagementScore.dropOffRisk,
        threshold,
      });
    }

    // Trigger interventions for all at-risk students
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const atRiskStudents = await (prisma as any).engagement_scores.findMany({
      where: {
        dropOffRisk: {
          gte: threshold,
        },
        user: {
          role: "USER",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.$disconnect();

    const results = [];

    for (const student of atRiskStudents) {
      try {
        await triggerInterventions(
          student.userId,
          student.dropOffRisk,
          channel
        );
        results.push({
          userId: student.userId,
          name: student.user.name,
          risk: student.dropOffRisk,
          status: "success",
        });
      } catch (error) {
        results.push({
          userId: student.userId,
          name: student.user.name,
          risk: student.dropOffRisk,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Interventions triggered for ${
        results.filter((r) => r.status === "success").length
      } students`,
      total: results.length,
      threshold,
      results,
    });
  } catch (error) {
    console.error("Error triggering interventions:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger interventions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/engagement/interventions
 * Get intervention history for a user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;
    const limit = parseInt(searchParams.get("limit") || "20");

    // Only allow viewing own interventions or admin viewing any
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Get intervention notifications
    const interventions = await prisma.notification.findMany({
      where: {
        userId,
        type: "SYSTEM",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        title: true,
        message: true,
        createdAt: true,
      },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      interventions,
      total: interventions.length,
    });
  } catch (error) {
    console.error("Error fetching interventions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch interventions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
