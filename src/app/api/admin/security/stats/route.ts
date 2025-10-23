import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getSecurityEventsSummary, getAuditLogs } from "@/lib/security/audit-logger";

/**
 * GET /api/admin/security/stats
 * Fetch security statistics for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "24h";

    // Convert range to days
    const days = range === "24h" ? 1 : range === "7d" ? 7 : 30;

    // Get security events summary
    const summary = await getSecurityEventsSummary(days);

    // Get recent events
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentEvents = await getAuditLogs({
      startDate,
      limit: 20,
    });

    // Calculate threat level
    const criticalCount = summary.bySeverity.critical || 0;
    const highCount = summary.bySeverity.high || 0;
    const mediumCount = summary.bySeverity.medium || 0;

    let threatLevel: "low" | "medium" | "high" | "critical" = "low";
    if (criticalCount > 0) threatLevel = "critical";
    else if (highCount > 5) threatLevel = "high";
    else if (mediumCount > 10) threatLevel = "medium";

    // Calculate active users (mock - in production, use real session data)
    const activeUsers = 42; // TODO: Implement real active session count

    // Format top threats
    const topThreats = Object.entries(summary.byAction)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Format recent events
    const formattedEvents = recentEvents.map((event) => ({
      id: event.id,
      action: event.action,
      severity: (event.after as any)?.severity || "low",
      userId: event.actorUserId,
      userEmail: event.actor?.email || "unknown",
      userName: event.actor?.name || "Unknown User",
      ipAddress: (event.after as any)?.ipAddress || "unknown",
      timestamp: event.createdAt.toISOString(),
      details: event.after,
    }));

    const stats = {
      totalEvents: summary.total,
      criticalEvents: criticalCount,
      failedLogins: summary.byAction.LOGIN_FAILED || 0,
      unauthorizedAccess: summary.byAction.UNAUTHORIZED_ACCESS || 0,
      suspiciousActivity: summary.byAction.SUSPICIOUS_ACTIVITY || 0,
      activeUsers,
      recentEvents: formattedEvents,
      threatLevel,
      topThreats,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Security stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security statistics" },
      { status: 500 }
    );
  }
}
