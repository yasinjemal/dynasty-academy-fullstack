/**
 * 🎯 QUEUES STATS API
 * Background job queue monitoring
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllQueueStats } from "@/lib/infrastructure/queue-manager";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins
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

    const stats = await getAllQueueStats();

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error("Get queue stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get queue stats" },
      { status: 500 }
    );
  }
}
