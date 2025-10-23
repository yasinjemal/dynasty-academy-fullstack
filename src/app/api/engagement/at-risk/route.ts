import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/engagement/at-risk
 * Get list of at-risk students (admin only)
 * Students with dropOffRisk >= threshold
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const threshold = parseInt(searchParams.get("threshold") || "60");
    const limit = parseInt(searchParams.get("limit") || "50");

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const atRiskStudents = await prisma.engagementScore.findMany({
      where: {
        dropOffRisk: {
          gte: threshold,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        dropOffRisk: "desc",
      },
      take: limit,
    });

    // Get stats
    const totalStudents = await prisma.user.count({
      where: {
        role: "USER", // Students are role USER
      },
    });

    const criticalCount = await prisma.engagementScore.count({
      where: { dropOffRisk: { gte: 80 } },
    });

    const highCount = await prisma.engagementScore.count({
      where: {
        dropOffRisk: { gte: 60, lt: 80 },
      },
    });

    const mediumCount = await prisma.engagementScore.count({
      where: {
        dropOffRisk: { gte: 40, lt: 60 },
      },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      atRiskStudents,
      stats: {
        totalStudents,
        criticalRisk: criticalCount,
        highRisk: highCount,
        mediumRisk: mediumCount,
        atRiskPercentage: (
          ((criticalCount + highCount) / totalStudents) *
          100
        ).toFixed(1),
      },
    });
  } catch (error) {
    console.error("Error fetching at-risk students:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch at-risk students",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
