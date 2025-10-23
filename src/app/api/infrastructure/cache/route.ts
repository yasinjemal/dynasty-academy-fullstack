/**
 * ⚡ CACHE STATS API
 * Redis cache statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCacheStats, flushCache } from "@/lib/infrastructure/redis";

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

    const stats = await getCacheStats();

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error("Get cache stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get cache stats" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    await flushCache();

    return NextResponse.json({ success: true, message: "Cache flushed" });
  } catch (error: any) {
    console.error("Flush cache error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to flush cache" },
      { status: 500 }
    );
  }
}
