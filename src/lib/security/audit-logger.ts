import { prisma } from "@/lib/db/prisma";

/**
 * Comprehensive audit logging for security events
 */

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "UNAUTHORIZED_ACCESS"
  | "ROLE_CHANGE"
  | "INSTRUCTOR_APPLICATION"
  | "INSTRUCTOR_APPROVED"
  | "INSTRUCTOR_REJECTED"
  | "REVENUE_ACCESS"
  | "COURSE_CREATED"
  | "COURSE_DELETED"
  | "PAYOUT_REQUESTED"
  | "PAYOUT_COMPLETED"
  | "SUSPICIOUS_ACTIVITY";

interface AuditLogParams {
  action: AuditAction;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  targetRoute?: string;
  targetEntity?: string;
  targetEntityId?: string;
  metadata?: Record<string, any>;
  severity?: "low" | "medium" | "high" | "critical";
}

/**
 * Create audit log entry
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    const {
      action,
      userId,
      ipAddress,
      userAgent,
      targetRoute,
      targetEntity,
      targetEntityId,
      metadata,
      severity = "low",
    } = params;

    // Determine if this is a security event
    const isSecurityEvent = [
      "UNAUTHORIZED_ACCESS",
      "LOGIN_FAILED",
      "SUSPICIOUS_ACTIVITY",
    ].includes(action);

    const log = await prisma.auditLog.create({
      data: {
        actorUserId: userId || "anonymous",
        action,
        entity: targetEntity || "system",
        entityId: targetEntityId || null,
        before: metadata?.before || null,
        after: {
          ipAddress,
          userAgent,
          targetRoute,
          severity,
          isSecurityEvent,
          ...metadata?.after,
        },
        createdAt: new Date(),
      },
    });

    // If critical security event, trigger alerts
    if (severity === "critical") {
      await handleCriticalSecurityEvent(params);
    }

    return log;
  } catch (error) {
    console.error("Audit log creation failed:", error);
    // Don't throw - audit logging should never break the main flow
    return null;
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  severity?: string;
  limit?: number;
}) {
  const { userId, action, startDate, endDate, severity, limit = 100 } = filters;

  const where: any = {};

  if (userId) where.actorUserId = userId;
  if (action) where.action = action;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  if (severity) {
    where.after = {
      path: ["severity"],
      equals: severity,
    };
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Get security events summary
 */
export async function getSecurityEventsSummary(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: startDate },
      action: {
        in: ["UNAUTHORIZED_ACCESS", "LOGIN_FAILED", "SUSPICIOUS_ACTIVITY"],
      },
    },
  });

  const summary = {
    total: logs.length,
    byAction: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    topUsers: {} as Record<string, number>,
    topRoutes: {} as Record<string, number>,
  };

  logs.forEach((log) => {
    // Count by action
    summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;

    // Count by severity
    const severity = (log.after as any)?.severity || "low";
    summary.bySeverity[severity] = (summary.bySeverity[severity] || 0) + 1;

    // Count by user
    if (log.actorUserId) {
      summary.topUsers[log.actorUserId] =
        (summary.topUsers[log.actorUserId] || 0) + 1;
    }

    // Count by route
    const route = (log.after as any)?.targetRoute;
    if (route) {
      summary.topRoutes[route] = (summary.topRoutes[route] || 0) + 1;
    }
  });

  return summary;
}

/**
 * Detect suspicious activity patterns
 */
export async function detectSuspiciousActivity(userId: string, ipAddress: string) {
  const last15Minutes = new Date();
  last15Minutes.setMinutes(last15Minutes.getMinutes() - 15);

  // Check for rapid failed login attempts
  const recentFailures = await prisma.auditLog.count({
    where: {
      actorUserId: userId,
      action: "LOGIN_FAILED",
      createdAt: { gte: last15Minutes },
    },
  });

  if (recentFailures >= 5) {
    await createAuditLog({
      action: "SUSPICIOUS_ACTIVITY",
      userId,
      ipAddress,
      severity: "high",
      metadata: {
        after: {
          reason: "Multiple failed login attempts",
          count: recentFailures,
        },
      },
    });
    return true;
  }

  // Check for access from multiple IPs
  const recentLogs = await prisma.auditLog.findMany({
    where: {
      actorUserId: userId,
      createdAt: { gte: last15Minutes },
    },
    select: {
      after: true,
    },
  });

  const uniqueIPs = new Set(
    recentLogs.map((log) => (log.after as any)?.ipAddress).filter(Boolean)
  );

  if (uniqueIPs.size >= 3) {
    await createAuditLog({
      action: "SUSPICIOUS_ACTIVITY",
      userId,
      ipAddress,
      severity: "medium",
      metadata: {
        after: {
          reason: "Multiple IP addresses detected",
          ipCount: uniqueIPs.size,
        },
      },
    });
    return true;
  }

  return false;
}

/**
 * Handle critical security events
 */
async function handleCriticalSecurityEvent(params: AuditLogParams) {
  // In production: Send to Sentry, email admins, trigger webhooks
  console.error("🚨 CRITICAL SECURITY EVENT:", {
    action: params.action,
    userId: params.userId,
    ipAddress: params.ipAddress,
    timestamp: new Date().toISOString(),
  });

  // TODO: Integrate with notification system
  // await sendSecurityAlert({
  //   to: process.env.ADMIN_EMAIL,
  //   subject: "Critical Security Event Detected",
  //   body: JSON.stringify(params, null, 2)
  // });
}

/**
 * Middleware helper to log requests
 */
export function getRequestMetadata(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for") || 
                request.headers.get("x-real-ip") || 
                "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    targetRoute: new URL(request.url).pathname,
  };
}
