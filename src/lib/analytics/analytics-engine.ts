/**
 * 📊 ANALYTICS ENGINE
 * Track, measure, and analyze everything
 */

import { prisma } from "@/lib/prisma";

export interface AnalyticsEventData {
  userId?: string;
  sessionId?: string;
  event: string;
  category?: string;
  properties?: Record<string, any>;
  page?: string;
  referrer?: string;
  userAgent?: string;
}

/**
 * Track an analytics event
 */
export async function trackEvent(data: AnalyticsEventData) {
  return prisma.analyticsEvent.create({
    data: {
      userId: data.userId,
      sessionId: data.sessionId,
      event: data.event,
      category: data.category,
      properties: data.properties || {},
      page: data.page,
      referrer: data.referrer,
      userAgent: data.userAgent,
      timestamp: new Date(),
    },
  });
}

/**
 * Get analytics events with filters
 */
export async function getEvents(filters: {
  userId?: string;
  event?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const where: any = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.event) where.event = filters.event;
  if (filters.category) where.category = filters.category;
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }

  return prisma.analyticsEvent.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: filters.limit || 1000,
  });
}

/**
 * Calculate daily/monthly active users
 */
export async function calculateActiveUsers(
  period: "daily" | "weekly" | "monthly"
) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "daily":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "weekly":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "monthly":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  const activeUsers = await prisma.analyticsEvent.groupBy({
    by: ["userId"],
    where: {
      userId: { not: null },
      timestamp: { gte: startDate },
    },
  });

  return activeUsers.length;
}

/**
 * Save a metric value
 */
export async function saveMetric(
  name: string,
  value: number,
  period: "hourly" | "daily" | "weekly" | "monthly",
  options: {
    target?: number;
    change?: number;
    metadata?: Record<string, any>;
  } = {}
) {
  const date = new Date();

  return prisma.metric.upsert({
    where: {
      name_period_date: {
        name,
        period,
        date,
      },
    },
    create: {
      name,
      value,
      target: options.target,
      change: options.change,
      period,
      date,
      metadata: options.metadata || {},
    },
    update: {
      value,
      target: options.target,
      change: options.change,
      metadata: options.metadata || {},
    },
  });
}

/**
 * Get metrics over time
 */
export async function getMetrics(
  name: string,
  period: "hourly" | "daily" | "weekly" | "monthly",
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.metric.findMany({
    where: {
      name,
      period,
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });
}

/**
 * Calculate conversion rate between two events
 */
export async function calculateConversionRate(
  fromEvent: string,
  toEvent: string,
  timeWindow = 86400 // 24 hours in seconds
): Promise<number> {
  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

  // Get users who triggered from event
  const fromUsers = await prisma.analyticsEvent.findMany({
    where: {
      event: fromEvent,
      timestamp: { gte: startDate },
      userId: { not: null },
    },
    select: { userId: true, timestamp: true },
    distinct: ["userId"],
  });

  if (fromUsers.length === 0) return 0;

  // Check how many converted
  let converted = 0;

  for (const fromUser of fromUsers) {
    if (!fromUser.userId) continue;

    const windowEnd = new Date(
      fromUser.timestamp.getTime() + timeWindow * 1000
    );

    const toEvent = await prisma.analyticsEvent.findFirst({
      where: {
        event: toEvent,
        userId: fromUser.userId,
        timestamp: {
          gte: fromUser.timestamp,
          lte: windowEnd,
        },
      },
    });

    if (toEvent) converted++;
  }

  return (converted / fromUsers.length) * 100;
}

/**
 * Get event counts grouped by dimension
 */
export async function getEventCounts(
  event: string,
  groupBy: "day" | "hour" | "userId",
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      event,
      timestamp: { gte: startDate },
    },
    select: {
      userId: true,
      timestamp: true,
    },
  });

  // Group by dimension
  const grouped: Record<string, number> = {};

  events.forEach((e) => {
    let key: string;

    if (groupBy === "userId") {
      key = e.userId || "anonymous";
    } else if (groupBy === "day") {
      key = e.timestamp.toISOString().split("T")[0];
    } else {
      // hour
      key = e.timestamp.toISOString().split(":")[0];
    }

    grouped[key] = (grouped[key] || 0) + 1;
  });

  return grouped;
}

/**
 * Calculate retention rate for a cohort
 */
export async function calculateRetention(
  cohortStartDate: Date,
  cohortEndDate: Date,
  periods = [1, 7, 14, 30] // Days to check
): Promise<Record<string, number>> {
  // Get users who signed up in cohort period
  const cohortUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: cohortStartDate,
        lte: cohortEndDate,
      },
    },
    select: { id: true, createdAt: true },
  });

  if (cohortUsers.length === 0) {
    return {};
  }

  const retention: Record<string, number> = {};

  for (const period of periods) {
    let activeCount = 0;

    for (const user of cohortUsers) {
      const checkDate = new Date(user.createdAt);
      checkDate.setDate(checkDate.getDate() + period);

      const endDate = new Date(checkDate);
      endDate.setDate(endDate.getDate() + 1);

      // Check if user was active on that day
      const activity = await prisma.analyticsEvent.findFirst({
        where: {
          userId: user.id,
          timestamp: {
            gte: checkDate,
            lt: endDate,
          },
        },
      });

      if (activity) activeCount++;
    }

    const rate = (activeCount / cohortUsers.length) * 100;
    retention[`day${period}`] = Math.round(rate * 100) / 100;
  }

  return retention;
}

/**
 * Get top events by count
 */
export async function getTopEvents(limit = 10, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = await prisma.analyticsEvent.groupBy({
    by: ["event"],
    where: {
      timestamp: { gte: startDate },
    },
    _count: { event: true },
    orderBy: {
      _count: { event: "desc" },
    },
    take: limit,
  });

  return events.map((e) => ({
    event: e.event,
    count: e._count.event,
  }));
}

/**
 * Calculate growth rate
 */
export async function calculateGrowthRate(
  metric: string,
  period: "daily" | "weekly" | "monthly"
): Promise<number> {
  const metrics = await prisma.metric.findMany({
    where: { name: metric, period },
    orderBy: { date: "desc" },
    take: 2,
  });

  if (metrics.length < 2) return 0;

  const [current, previous] = metrics;
  const change = ((current.value - previous.value) / previous.value) * 100;

  return Math.round(change * 100) / 100;
}
