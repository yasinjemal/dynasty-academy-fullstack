/**
 * Dynasty Built Academy - Recommendations API
 * Personalized content recommendations with smart caching
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { smartCache } from "@/lib/optimization/smart-cache";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || undefined;

    // Try cache first
    const cacheKey = `recommendations:${userId}:${category || "all"}:${limit}`;
    const cached = await smartCache.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        recommendations: cached,
        cached: true,
        generated: false,
      });
    }

    // Generate fresh recommendations
    console.log(`🎯 Generating recommendations for user ${userId}`);

    // Import recommendation engine
    const { getPersonalizedRecommendations, getContinueLearning } =
      await import("@/lib/ai/recommendation-engine");

    // Get personalized course recommendations
    const recommendations = await getPersonalizedRecommendations(userId, limit);

    // Cache for 1 hour (adaptive TTL will adjust based on access patterns)
    await smartCache.set(cacheKey, recommendations, 3600000);

    return NextResponse.json({
      recommendations,
      cached: false,
      generated: true,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to track user interactions (for improving recommendations)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { contentId, action, contentType } = body;

    // Validate input
    if (!contentId || !action || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: contentId, action, contentType" },
        { status: 400 }
      );
    }

    // Store interaction for recommendation engine
    // This will be used to improve future recommendations
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    try {
      await prisma.userInteraction.create({
        data: {
          userId,
          contentId,
          contentType,
          action, // 'view', 'like', 'complete', 'bookmark'
          timestamp: new Date(),
        },
      });

      // Invalidate user's recommendation cache
      const cacheKeys = [
        `recommendations:${userId}:all:10`,
        `recommendations:${userId}:all:20`,
        `recommendations:${userId}:${contentType}:10`,
      ];

      for (const key of cacheKeys) {
        smartCache.clear();
      }

      return NextResponse.json({
        success: true,
        message: "Interaction tracked",
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("❌ Error tracking interaction:", error);

    return NextResponse.json(
      {
        error: "Failed to track interaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
