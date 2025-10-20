/**
 * 🤖 AI INSIGHTS API
 * Admin endpoint to view AI Coach analytics and content gaps
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/ai/insights
 * Get AI insights for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // Filter by insight type
    const resolved = searchParams.get("resolved"); // Filter by resolution status

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (resolved !== null) where.resolved = resolved === "true";

    // Get insights
    const insights = await prisma.aiInsight.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { frequency: "desc" },
        { createdAt: "desc" },
      ],
      take: 100,
    });

    // Get conversation stats
    const conversationStats = await prisma.aiConversation.aggregate({
      _count: { id: true },
      _avg: {
        responseTime: true,
        sentiment: true,
        rating: true,
        tokensUsed: true,
        cost: true,
      },
      _sum: {
        tokensUsed: true,
        cost: true,
        messageCount: true,
      },
    });

    // Get resolution rate
    const resolvedCount = await prisma.aiConversation.count({
      where: { resolved: true },
    });

    const resolutionRate =
      conversationStats._count.id > 0
        ? (resolvedCount / conversationStats._count.id) * 100
        : 0;

    // Get top confusion points
    const topConfusions = await prisma.aiInsight.findMany({
      where: { type: "CONFUSION", resolved: false },
      orderBy: { frequency: "desc" },
      take: 10,
    });

    // Get frequently asked questions
    const topQuestions = await prisma.aiInsight.findMany({
      where: { type: "QUESTION" },
      orderBy: { frequency: "desc" },
      take: 10,
    });

    return NextResponse.json({
      insights,
      stats: {
        totalConversations: conversationStats._count.id,
        avgResponseTime: conversationStats._avg.responseTime || 0,
        avgSentiment: conversationStats._avg.sentiment || 0,
        avgRating: conversationStats._avg.rating || 0,
        resolutionRate: Math.round(resolutionRate),
        totalMessages: conversationStats._sum.messageCount || 0,
        totalTokens: conversationStats._sum.tokensUsed || 0,
        totalCost: conversationStats._sum.cost || 0,
      },
      topConfusions,
      topQuestions,
    });
  } catch (error: any) {
    console.error("❌ Get insights error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/ai/insights/:id
 * Mark insight as resolved
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { insightId, resolved, resolution } = body;

    const updated = await prisma.aiInsight.update({
      where: { id: insightId },
      data: {
        resolved,
        resolvedAt: resolved ? new Date() : null,
        resolvedBy: resolved ? user.id : null,
        resolution,
      },
    });

    return NextResponse.json({ insight: updated });
  } catch (error: any) {
    console.error("❌ Update insight error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
