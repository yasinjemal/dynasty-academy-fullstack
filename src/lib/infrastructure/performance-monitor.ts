/**
 * ⚡ PERFORMANCE MONITORING
 * Track and analyze system performance
 */

import { logPerformance } from "./logger";
import { setCache, getCache, CacheKeys, CacheTTL } from "./redis";

/**
 * Performance metric types
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * API response time tracker
 */
const apiMetrics: Map<
  string,
  { count: number; total: number; min: number; max: number }
> = new Map();

/**
 * Track API response time
 */
export function trackApiPerformance(
  endpoint: string,
  duration: number,
  statusCode: number
): void {
  const key = `${endpoint}:${statusCode}`;

  if (!apiMetrics.has(key)) {
    apiMetrics.set(key, {
      count: 0,
      total: 0,
      min: duration,
      max: duration,
    });
  }

  const metric = apiMetrics.get(key)!;
  metric.count++;
  metric.total += duration;
  metric.min = Math.min(metric.min, duration);
  metric.max = Math.max(metric.max, duration);

  // Log slow requests (> 1 second)
  if (duration > 1000) {
    logPerformance(`Slow API: ${endpoint}`, duration, "ms", { statusCode });
  }
}

/**
 * Get API performance stats
 */
export function getApiPerformanceStats(): Array<{
  endpoint: string;
  statusCode: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  requestCount: number;
}> {
  const stats: Array<{
    endpoint: string;
    statusCode: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    requestCount: number;
  }> = [];

  for (const [key, metric] of apiMetrics.entries()) {
    const [endpoint, statusCode] = key.split(":");
    stats.push({
      endpoint,
      statusCode: parseInt(statusCode),
      avgDuration: Math.round(metric.total / metric.count),
      minDuration: metric.min,
      maxDuration: metric.max,
      requestCount: metric.count,
    });
  }

  return stats.sort((a, b) => b.avgDuration - a.avgDuration);
}

/**
 * Database query performance tracker
 */
const dbMetrics: Map<
  string,
  { count: number; total: number; min: number; max: number }
> = new Map();

/**
 * Track database query performance
 */
export function trackDbPerformance(query: string, duration: number): void {
  // Normalize query (remove values for grouping)
  const normalizedQuery = query.replace(/\$\d+/g, "$N").substring(0, 100);

  if (!dbMetrics.has(normalizedQuery)) {
    dbMetrics.set(normalizedQuery, {
      count: 0,
      total: 0,
      min: duration,
      max: duration,
    });
  }

  const metric = dbMetrics.get(normalizedQuery)!;
  metric.count++;
  metric.total += duration;
  metric.min = Math.min(metric.min, duration);
  metric.max = Math.max(metric.max, duration);

  // Log slow queries (> 500ms)
  if (duration > 500) {
    logPerformance(`Slow DB Query`, duration, "ms", {
      query: normalizedQuery,
    });
  }
}

/**
 * Get database performance stats
 */
export function getDbPerformanceStats(): Array<{
  query: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  queryCount: number;
}> {
  const stats: Array<{
    query: string;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    queryCount: number;
  }> = [];

  for (const [query, metric] of dbMetrics.entries()) {
    stats.push({
      query,
      avgDuration: Math.round(metric.total / metric.count),
      minDuration: metric.min,
      maxDuration: metric.max,
      queryCount: metric.count,
    });
  }

  return stats.sort((a, b) => b.avgDuration - a.avgDuration);
}

/**
 * Memory usage tracker
 */
export function getMemoryUsage(): {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  rssMB: number;
  heapUsedMB: number;
} {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    rssMB: Math.round(usage.rss / 1024 / 1024),
    heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
  };
}

/**
 * CPU usage tracker
 */
export function getCpuUsage(): {
  user: number;
  system: number;
  percent: number;
} {
  const usage = process.cpuUsage();
  const total = usage.user + usage.system;
  const percent = (total / 1000000) * 100; // Convert to percentage

  return {
    user: usage.user,
    system: usage.system,
    percent: Math.round(percent * 100) / 100,
  };
}

/**
 * System uptime
 */
export function getUptime(): {
  process: number;
  system: number;
  processFormatted: string;
  systemFormatted: string;
} {
  const processUptime = process.uptime();
  const systemUptime = require("os").uptime();

  return {
    process: Math.round(processUptime),
    system: Math.round(systemUptime),
    processFormatted: formatUptime(processUptime),
    systemFormatted: formatUptime(systemUptime),
  };
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "< 1m";
}

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  logPerformance(name, duration, "ms");

  return { result, duration };
}

/**
 * Performance timer class
 */
export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number> = new Map();

  constructor(private name: string) {
    this.startTime = Date.now();
  }

  mark(label: string): void {
    this.marks.set(label, Date.now() - this.startTime);
  }

  end(): { total: number; marks: Record<string, number> } {
    const total = Date.now() - this.startTime;
    const marks: Record<string, number> = {};

    for (const [label, duration] of this.marks.entries()) {
      marks[label] = duration;
    }

    logPerformance(this.name, total, "ms", { marks });

    return { total, marks };
  }
}

/**
 * Get comprehensive system health
 */
export async function getSystemHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  memory: ReturnType<typeof getMemoryUsage>;
  cpu: ReturnType<typeof getCpuUsage>;
  uptime: ReturnType<typeof getUptime>;
  api: { avgResponseTime: number; requestCount: number };
  database: { avgQueryTime: number; queryCount: number };
}> {
  const memory = getMemoryUsage();
  const cpu = getCpuUsage();
  const uptime = getUptime();

  // Calculate API stats
  const apiStats = getApiPerformanceStats();
  const totalApiRequests = apiStats.reduce((sum, s) => sum + s.requestCount, 0);
  const avgApiDuration =
    totalApiRequests > 0
      ? apiStats.reduce((sum, s) => sum + s.avgDuration * s.requestCount, 0) /
        totalApiRequests
      : 0;

  // Calculate DB stats
  const dbStats = getDbPerformanceStats();
  const totalDbQueries = dbStats.reduce((sum, s) => sum + s.queryCount, 0);
  const avgDbDuration =
    totalDbQueries > 0
      ? dbStats.reduce((sum, s) => sum + s.avgDuration * s.queryCount, 0) /
        totalDbQueries
      : 0;

  // Determine health status
  let status: "healthy" | "degraded" | "unhealthy" = "healthy";

  if (
    memory.heapUsedMB > 1000 ||
    avgApiDuration > 1000 ||
    avgDbDuration > 500
  ) {
    status = "degraded";
  }

  if (
    memory.heapUsedMB > 1500 ||
    avgApiDuration > 3000 ||
    avgDbDuration > 1000
  ) {
    status = "unhealthy";
  }

  return {
    status,
    memory,
    cpu,
    uptime,
    api: {
      avgResponseTime: Math.round(avgApiDuration),
      requestCount: totalApiRequests,
    },
    database: {
      avgQueryTime: Math.round(avgDbDuration),
      queryCount: totalDbQueries,
    },
  };
}

/**
 * Cache system health for fast access
 */
export async function cacheSystemHealth(): Promise<void> {
  const health = await getSystemHealth();
  await setCache(`${CacheKeys.METRICS}system_health`, health, CacheTTL.SHORT);
}

/**
 * Get cached system health
 */
export async function getCachedSystemHealth(): Promise<ReturnType<
  typeof getSystemHealth
> | null> {
  return getCache<Awaited<ReturnType<typeof getSystemHealth>>>(
    `${CacheKeys.METRICS}system_health`
  );
}

/**
 * Reset performance metrics
 */
export function resetPerformanceMetrics(): void {
  apiMetrics.clear();
  dbMetrics.clear();
  logPerformance("Metrics Reset", 0, "", {});
}
