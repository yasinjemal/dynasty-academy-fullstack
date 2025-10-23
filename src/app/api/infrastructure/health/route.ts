/**
 * 🏥 INFRASTRUCTURE HEALTH API
 * System health monitoring
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemHealth } from "@/lib/infrastructure/performance-monitor";
import { isRedisHealthy } from "@/lib/infrastructure/redis";
import { areQueuesHealthy } from "@/lib/infrastructure/queue-manager";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can view infrastructure
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

    // Get system health
    const health = await getSystemHealth();

    // Check Redis and Queues
    const redisHealthy = await isRedisHealthy();
    const queuesHealthy = await areQueuesHealthy();

    return NextResponse.json({
      health,
      services: {
        redis: redisHealthy ? "healthy" : "unhealthy",
        queues: queuesHealthy ? "healthy" : "unhealthy",
      },
    });
  } catch (error: any) {
    console.error("Get health error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get health" },
      { status: 500 }
    );
  }
}
