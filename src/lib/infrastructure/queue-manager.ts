/**
 * 🎯 QUEUE MANAGEMENT SYSTEM
 * Background job processing with Bull
 */

import Queue from "bull";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Queue definitions
 */
export const Queues = {
  EMAIL: "email-queue",
  ANALYTICS: "analytics-queue",
  NOTIFICATIONS: "notifications-queue",
  CONTENT: "content-processing-queue",
  REVENUE: "revenue-calculation-queue",
} as const;

// Queue instances
const queues: Record<string, Queue.Queue> = {};

/**
 * Get or create queue
 */
export function getQueue(name: string): Queue.Queue {
  if (!queues[name]) {
    queues[name] = new Queue(name, redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs
      },
    });

    // Event handlers
    queues[name].on("completed", (job) => {
      console.log(`✅ Job ${job.id} completed in queue ${name}`);
    });

    queues[name].on("failed", (job, err) => {
      console.error(`❌ Job ${job?.id} failed in queue ${name}:`, err.message);
    });

    queues[name].on("stalled", (job) => {
      console.warn(`⚠️ Job ${job.id} stalled in queue ${name}`);
    });
  }

  return queues[name];
}

/**
 * Email Queue Jobs
 */
export interface SendEmailJob {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function queueEmail(data: SendEmailJob): Promise<Queue.Job> {
  const queue = getQueue(Queues.EMAIL);
  return queue.add("send-email", data, {
    priority: 1,
  });
}

export async function queueBulkEmails(
  emails: SendEmailJob[]
): Promise<Queue.Job[]> {
  const queue = getQueue(Queues.EMAIL);
  return queue.addBulk(
    emails.map((email) => ({
      name: "send-email",
      data: email,
      opts: { priority: 2 },
    }))
  );
}

/**
 * Analytics Queue Jobs
 */
export interface AnalyticsAggregationJob {
  type: "daily" | "weekly" | "monthly";
  date: string;
  metrics: string[];
}

export async function queueAnalyticsAggregation(
  data: AnalyticsAggregationJob
): Promise<Queue.Job> {
  const queue = getQueue(Queues.ANALYTICS);
  return queue.add("aggregate-analytics", data, {
    priority: 3,
    delay: 0,
  });
}

export async function queueMetricCalculation(
  metricName: string,
  period: "hourly" | "daily" | "weekly" | "monthly"
): Promise<Queue.Job> {
  const queue = getQueue(Queues.ANALYTICS);
  return queue.add(
    "calculate-metric",
    { metricName, period },
    {
      priority: 2,
      jobId: `metric-${metricName}-${period}-${Date.now()}`,
    }
  );
}

/**
 * Notification Queue Jobs
 */
export interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  channels?: ("in-app" | "email" | "push")[];
}

export async function queueNotification(
  data: NotificationJob
): Promise<Queue.Job> {
  const queue = getQueue(Queues.NOTIFICATIONS);
  return queue.add("send-notification", data, {
    priority: 1,
  });
}

export async function queueBulkNotifications(
  notifications: NotificationJob[]
): Promise<Queue.Job[]> {
  const queue = getQueue(Queues.NOTIFICATIONS);
  return queue.addBulk(
    notifications.map((notification) => ({
      name: "send-notification",
      data: notification,
      opts: { priority: 2 },
    }))
  );
}

/**
 * Content Processing Queue Jobs
 */
export interface ContentProcessingJob {
  type: "video" | "audio" | "document" | "image";
  contentId: string;
  operations: string[];
}

export async function queueContentProcessing(
  data: ContentProcessingJob
): Promise<Queue.Job> {
  const queue = getQueue(Queues.CONTENT);
  return queue.add("process-content", data, {
    priority: 2,
    timeout: 300000, // 5 minutes
  });
}

/**
 * Revenue Calculation Queue Jobs
 */
export interface RevenueCalculationJob {
  type: "churn" | "ltv" | "pricing" | "upsell";
  userId?: string;
  batchSize?: number;
}

export async function queueRevenueCalculation(
  data: RevenueCalculationJob
): Promise<Queue.Job> {
  const queue = getQueue(Queues.REVENUE);
  return queue.add("calculate-revenue", data, {
    priority: 3,
  });
}

/**
 * Scheduled Jobs (Cron-like)
 */
export async function scheduleRecurringJobs(): Promise<void> {
  // Daily analytics aggregation at midnight
  const analyticsQueue = getQueue(Queues.ANALYTICS);
  await analyticsQueue.add(
    "daily-aggregation",
    { type: "daily" },
    {
      repeat: {
        cron: "0 0 * * *", // Every day at midnight
      },
    }
  );

  // Weekly reports every Monday
  await analyticsQueue.add(
    "weekly-report",
    { type: "weekly" },
    {
      repeat: {
        cron: "0 6 * * 1", // Every Monday at 6 AM
      },
    }
  );

  // Revenue calculations every hour
  const revenueQueue = getQueue(Queues.REVENUE);
  await revenueQueue.add(
    "hourly-revenue-calc",
    { type: "churn" },
    {
      repeat: {
        cron: "0 * * * *", // Every hour
      },
    }
  );

  console.log("✅ Scheduled recurring jobs");
}

/**
 * Get queue statistics
 */
export async function getQueueStats(
  queueName: string
): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}> {
  try {
    const queue = getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    const isPaused = await queue.isPaused();

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused: isPaused,
    };
  } catch (error) {
    console.error(`Get queue stats error for ${queueName}:`, error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      paused: false,
    };
  }
}

/**
 * Get all queue statistics
 */
export async function getAllQueueStats(): Promise<
  Record<
    string,
    {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      paused: boolean;
    }
  >
> {
  const stats: any = {};

  for (const queueName of Object.values(Queues)) {
    stats[queueName] = await getQueueStats(queueName);
  }

  return stats;
}

/**
 * Pause queue
 */
export async function pauseQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);
  await queue.pause();
  console.log(`⏸️ Queue ${queueName} paused`);
}

/**
 * Resume queue
 */
export async function resumeQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);
  await queue.resume();
  console.log(`▶️ Queue ${queueName} resumed`);
}

/**
 * Clear queue (remove all jobs)
 */
export async function clearQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);
  await queue.empty();
  console.log(`🗑️ Queue ${queueName} cleared`);
}

/**
 * Retry failed jobs
 */
export async function retryFailedJobs(queueName: string): Promise<number> {
  try {
    const queue = getQueue(queueName);
    const failed = await queue.getFailed();

    let retried = 0;
    for (const job of failed) {
      await job.retry();
      retried++;
    }

    console.log(`🔄 Retried ${retried} failed jobs in ${queueName}`);
    return retried;
  } catch (error) {
    console.error(`Retry failed jobs error for ${queueName}:`, error);
    return 0;
  }
}

/**
 * Close all queues
 */
export async function closeAllQueues(): Promise<void> {
  for (const [name, queue] of Object.entries(queues)) {
    await queue.close();
    console.log(`✅ Queue ${name} closed`);
  }
}

/**
 * Health check
 */
export async function areQueuesHealthy(): Promise<boolean> {
  try {
    // Check if we can get stats from a queue
    const queue = getQueue(Queues.EMAIL);
    await queue.getWaitingCount();
    return true;
  } catch (error) {
    console.error("Queue health check failed:", error);
    return false;
  }
}
