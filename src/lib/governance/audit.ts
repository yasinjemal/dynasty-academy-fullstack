/**
 * Dynasty Academy Governance: Audit Logging System
 *
 * Every admin action is logged for transparency and accountability
 */

import { prisma } from "@/lib/db/prisma";

export type AuditAction =
  | "create_course"
  | "update_course"
  | "delete_course"
  | "publish_course"
  | "unpublish_course"
  | "approve_instructor_application"
  | "reject_instructor_application"
  | "update_user_role"
  | "suspend_user"
  | "unsuspend_user"
  | "update_governance_settings"
  | "manual_ranking_override";

export type AuditEntity =
  | "course"
  | "user"
  | "instructor_application"
  | "governance_settings"
  | "ranking";

interface AuditLogData {
  actorUserId: string; // Who performed the action
  action: AuditAction;
  entity: AuditEntity;
  entityId: string; // ID of affected entity
  before?: Record<string, any>; // State before action
  after?: Record<string, any>; // State after action
  reason?: string; // Optional justification
  metadata?: Record<string, any>; // Additional context
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: data.actorUserId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        before: data.before || {},
        after: data.after || {},
        reason: data.reason,
        metadata: data.metadata,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should never break main functionality
  }
}

/**
 * Get audit history for an entity
 */
export async function getAuditHistory(
  entity: AuditEntity,
  entityId: string,
  limit: number = 50
) {
  return prisma.auditLog.findMany({
    where: {
      entity,
      entityId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      actor: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Get all audit logs (admin view)
 */
export async function getAllAuditLogs(
  filters?: {
    actorUserId?: string;
    action?: AuditAction;
    entity?: AuditEntity;
    startDate?: Date;
    endDate?: Date;
  },
  page: number = 1,
  limit: number = 100
) {
  const where = {
    ...(filters?.actorUserId && { actorUserId: filters.actorUserId }),
    ...(filters?.action && { action: filters.action }),
    ...(filters?.entity && { entity: filters.entity }),
    ...(filters?.startDate &&
      filters?.endDate && {
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get audit stats for transparency dashboard
 */
export async function getAuditStats(
  timeframe: "day" | "week" | "month" = "week"
) {
  const now = new Date();
  const startDate = new Date();

  if (timeframe === "day") startDate.setDate(now.getDate() - 1);
  else if (timeframe === "week") startDate.setDate(now.getDate() - 7);
  else startDate.setMonth(now.getMonth() - 1);

  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      action: true,
      entity: true,
      actorUserId: true,
    },
  });

  // Count by action
  const actionCounts: Record<string, number> = {};
  logs.forEach((log: any) => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });

  // Count by entity
  const entityCounts: Record<string, number> = {};
  logs.forEach((log: any) => {
    entityCounts[log.entity] = (entityCounts[log.entity] || 0) + 1;
  });

  // Count unique actors
  const uniqueActors = new Set(logs.map((log: any) => log.actorUserId));

  return {
    totalLogs: logs.length,
    uniqueActors: uniqueActors.size,
    actionCounts,
    entityCounts,
    timeframe,
  };
}

/**
 * Helper: Log course actions
 */
export async function logCourseAction(
  actorUserId: string,
  action: Extract<
    AuditAction,
    | "create_course"
    | "update_course"
    | "delete_course"
    | "publish_course"
    | "unpublish_course"
  >,
  courseId: string,
  before?: any,
  after?: any,
  reason?: string
) {
  return createAuditLog({
    actorUserId,
    action,
    entity: "course",
    entityId: courseId,
    before,
    after,
    reason,
  });
}

/**
 * Helper: Log user actions
 */
export async function logUserAction(
  actorUserId: string,
  action: Extract<
    AuditAction,
    "update_user_role" | "suspend_user" | "unsuspend_user"
  >,
  targetUserId: string,
  before?: any,
  after?: any,
  reason?: string
) {
  return createAuditLog({
    actorUserId,
    action,
    entity: "user",
    entityId: targetUserId,
    before,
    after,
    reason,
  });
}

/**
 * Helper: Log instructor application actions
 */
export async function logInstructorApplicationAction(
  actorUserId: string,
  action: Extract<
    AuditAction,
    "approve_instructor_application" | "reject_instructor_application"
  >,
  applicationId: string,
  before?: any,
  after?: any,
  reason?: string
) {
  return createAuditLog({
    actorUserId,
    action,
    entity: "instructor_application",
    entityId: applicationId,
    before,
    after,
    reason,
  });
}

/**
 * Helper: Log governance changes
 */
export async function logGovernanceAction(
  actorUserId: string,
  action: Extract<
    AuditAction,
    "update_governance_settings" | "manual_ranking_override"
  >,
  entityId: string,
  before?: any,
  after?: any,
  reason?: string
) {
  return createAuditLog({
    actorUserId,
    action,
    entity:
      action === "manual_ranking_override" ? "ranking" : "governance_settings",
    entityId,
    before,
    after,
    reason,
  });
}
