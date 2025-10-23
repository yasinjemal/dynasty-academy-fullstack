/**
 * Active Sessions API
 * GET /api/admin/sessions/active
 * 
 * Returns real-time active session statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  getActiveUserStats,
  getUserSessionDetails,
  sessionStore,
} from "@/lib/security/session-tracker";

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Authorization check - Admin only
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get active session statistics
    const stats = getActiveUserStats();
    
    // Get all active sessions (limited to last 50)
    const allSessions = sessionStore.getAllSessions()
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
      .slice(0, 50)
      .map(s => ({
        userId: s.userId,
        sessionId: s.sessionId.substring(0, 8) + "...", // Truncate for security
        ipAddress: s.ipAddress,
        deviceInfo: s.deviceInfo,
        loginTime: s.loginTime,
        lastActivity: s.lastActivity,
        duration: Math.floor((Date.now() - s.loginTime.getTime()) / 1000 / 60), // minutes
      }));

    return NextResponse.json({
      success: true,
      stats,
      sessions: allSessions,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Active sessions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch active sessions" },
      { status: 500 }
    );
  }
}
