import { PrismaClient } from "@prisma/client";
import { sendEngagementEmail } from "@/lib/services/sendgrid";
import { sendEngagementPush } from "@/lib/services/push";

/**
 * Smart Notification Engine
 * Sends intelligent, timed notifications to prevent drop-offs
 */

export type NotificationChannel = "EMAIL" | "PUSH" | "IN_APP" | "SMS";
export type NotificationType =
  | "gentle_reminder"
  | "streak_warning"
  | "achievement_unlocked"
  | "milestone_celebration"
  | "personalized_content"
  | "discount_offer"
  | "peer_comparison"
  | "human_outreach";

interface NotificationTemplate {
  subject: string;
  body: string;
  cta: string;
  ctaUrl?: string;
}

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  data?: Record<string, any>;
  scheduledFor?: Date;
}

/**
 * Get notification template based on type
 */
export function getNotificationTemplate(
  type: NotificationType,
  data: Record<string, any> = {}
): NotificationTemplate {
  const templates: Record<NotificationType, NotificationTemplate> = {
    gentle_reminder: {
      subject: `${data.userName}, we miss you! 🎓`,
      body: `It's been ${data.daysSinceLastLogin} days since your last visit. Your progress is waiting for you!`,
      cta: "Continue Learning",
      ctaUrl: "/dashboard",
    },
    streak_warning: {
      subject: `⚠️ Your ${data.currentStreak}-day streak is at risk!`,
      body: `Don't break your amazing ${data.currentStreak}-day streak! Just 5 minutes of learning today will keep it alive.`,
      cta: "Save My Streak",
      ctaUrl: "/dashboard",
    },
    achievement_unlocked: {
      subject: `🏆 Achievement Unlocked: ${data.achievementName}!`,
      body: `Congratulations! You've earned the "${data.achievementName}" achievement. Keep up the great work!`,
      cta: "View Achievement",
      ctaUrl: "/achievements",
    },
    milestone_celebration: {
      subject: `🎉 Milestone Reached: ${data.milestone}!`,
      body: `Amazing work! You've ${data.milestoneDescription}. You're making incredible progress!`,
      cta: "See Progress",
      ctaUrl: "/dashboard",
    },
    personalized_content: {
      subject: `We found the perfect ${data.contentType} for you!`,
      body: `Based on your learning style, we think you'll love "${data.contentTitle}". It matches your ${data.learningStyle} preference perfectly.`,
      cta: "Check It Out",
      ctaUrl: data.contentUrl,
    },
    discount_offer: {
      subject: `Special offer just for you: ${data.discountPercent}% off! 💎`,
      body: `We noticed you've been away. Here's ${data.discountPercent}% off your next purchase to welcome you back!`,
      cta: "Claim Offer",
      ctaUrl: "/pricing",
    },
    peer_comparison: {
      subject: `Your peers are advancing! 📊`,
      body: `Students who joined with you have completed ${data.peerAverage} more lessons. You can catch up!`,
      cta: "See Leaderboard",
      ctaUrl: "/leaderboard",
    },
    human_outreach: {
      subject: `${data.instructorName} wants to help you succeed`,
      body: `Our instructor ${data.instructorName} noticed you might need support. They're here to help you get back on track.`,
      cta: "Schedule Call",
      ctaUrl: "/support",
    },
  };

  return templates[type];
}

/**
 * Calculate optimal send time based on user behavior
 */
export async function calculateOptimalSendTime(userId: string): Promise<Date> {
  const prisma = new PrismaClient();

  try {
    // Get user's personalization profile
    const profile = await prisma.personalizationProfile.findUnique({
      where: { userId },
    });

    const now = new Date();

    if (profile?.optimalStudyTime) {
      // Use their optimal time
      const [hours, minutes] = profile.optimalStudyTime.split(":").map(Number);
      const optimalTime = new Date(now);
      optimalTime.setHours(hours, minutes, 0, 0);

      // If optimal time already passed today, schedule for tomorrow
      if (optimalTime < now) {
        optimalTime.setDate(optimalTime.getDate() + 1);
      }

      return optimalTime;
    }

    // Default: send in 1 hour if no profile
    const defaultTime = new Date(now.getTime() + 60 * 60 * 1000);
    return defaultTime;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Send notification (main function)
 */
export async function sendNotification(
  params: SendNotificationParams
): Promise<boolean> {
  const { userId, type, channel, data = {}, scheduledFor } = params;

  const prisma = new PrismaClient();

  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get template
    const template = getNotificationTemplate(type, {
      userName: user.name || "Student",
      ...data,
    });

    // Determine send time
    const sendTime = scheduledFor || (await calculateOptimalSendTime(userId));

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: "SYSTEM", // You can customize this
        title: template.subject,
        message: template.body,
        read: false,
        actionUrl: template.ctaUrl,
        metadata: {
          channel,
          notificationType: type,
          template: template.cta,
          scheduledFor: sendTime,
          ...data,
        },
      },
    });

    // 🔥 TRACK INTERVENTION FOR ANALYTICS
    const tracking = await trackIntervention({
      userId,
      type,
      channel,
      subject: template.subject,
      body: template.body,
    });

    // Send through appropriate channel
    if (channel === "EMAIL") {
      // Send via SendGrid
      await sendEngagementEmail(user.email, user.name || "Student", type, {
        ...data,
        continueUrl: template.ctaUrl || "/dashboard",
        dashboardUrl: "/student/engagement",
        trackingPixel: tracking?.trackingPixel, // Add tracking pixel to email
      });
      console.log(`✅ [EMAIL] Sent to ${user.email}: ${template.subject}`);
    } else if (channel === "PUSH") {
      // Send push notification
      await sendEngagementPush(userId, type, {
        ...data,
        continueUrl: template.ctaUrl || "/dashboard",
        dashboardUrl: "/student/engagement",
      });
      console.log(`✅ [PUSH] Sent to ${userId}: ${template.subject}`);
    } else if (channel === "IN_APP") {
      // In-app notification is already saved in database
      console.log(`[IN_APP] Created notification for ${userId}`);
    } else if (channel === "SMS") {
      // await sendSMS(user.phone, template.body);
      console.log(`[SMS] Would send to user ${userId}: ${template.body}`);
    }

    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Send interventions based on engagement score
 */
export async function triggerInterventions(
  userId: string,
  dropOffRisk: number,
  channelFilter: string = "ALL"
): Promise<void> {
  console.log(
    `Triggering interventions for user ${userId} (risk: ${dropOffRisk}) via ${channelFilter}`
  );

  // Determine which interventions to send based on risk
  const interventions: string[] = [];

  if (dropOffRisk >= 80) {
    interventions.push("streak_warning", "discount_offer", "human_outreach");
  } else if (dropOffRisk >= 60) {
    interventions.push("gentle_reminder", "personalized_content");
  } else {
    interventions.push("gentle_reminder");
  }

  // Map intervention types to notification types
  const interventionMapping: Record<string, NotificationType> = {
    gentle_reminder: "gentle_reminder",
    achievement_notification: "achievement_unlocked",
    streak_warning: "streak_warning",
    personalized_content: "personalized_content",
    discount_offer: "discount_offer",
    peer_comparison: "peer_comparison",
    milestone_celebration: "milestone_celebration",
    human_outreach: "human_outreach",
  };

  // Determine which channels to use
  const channels: NotificationChannel[] = [];

  if (channelFilter === "ALL") {
    if (dropOffRisk >= 80) {
      channels.push("EMAIL", "PUSH", "IN_APP");
    } else if (dropOffRisk >= 60) {
      channels.push("EMAIL", "IN_APP");
    } else {
      channels.push("IN_APP");
    }
  } else {
    // Use specific channel requested
    channels.push(channelFilter as NotificationChannel);
  }

  // Send interventions with appropriate channels
  for (const intervention of interventions) {
    const notificationType = interventionMapping[intervention];
    if (!notificationType) continue;

    // Send via all selected channels
    for (const channel of channels) {
      await sendNotification({ userId, type: notificationType, channel });
    }
  }
}

/**
 * Schedule daily streak reminders (cron job)
 */
export async function scheduleStreakReminders(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    // Find users with active streaks who haven't been active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streaksAtRisk = await prisma.streak.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastActiveDate: { lt: today },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`Found ${streaksAtRisk.length} streaks at risk`);

    for (const streak of streaksAtRisk) {
      await sendNotification({
        userId: streak.userId,
        type: "streak_warning",
        channel: "PUSH",
        data: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Track intervention in the InterventionTracking table
 * This enables real analytics!
 */
export async function trackIntervention(params: {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  body?: string;
  templateId?: string;
}) {
  const prisma = new PrismaClient();

  try {
    const tracking = await (prisma as any).interventionTracking.create({
      data: {
        userId: params.userId,
        channel: params.channel,
        type: params.type,
        subject: params.subject,
        body: params.body,
        templateId: params.templateId,
        sentAt: new Date(),
        // trackingPixel will be generated for emails
        trackingPixel:
          params.channel === "EMAIL"
            ? `tracking_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`
            : null,
      },
    });

    console.log(
      `📊 [TRACKING] Intervention tracked: ${params.type} via ${params.channel}`
    );
    return tracking;
  } catch (error) {
    console.error("Error tracking intervention:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Mark intervention as opened (for tracking open rates)
 */
export async function markInterventionOpened(trackingPixel: string) {
  const prisma = new PrismaClient();

  try {
    await (prisma as any).interventionTracking.updateMany({
      where: {
        trackingPixel,
        openedAt: null, // Only mark once
      },
      data: {
        openedAt: new Date(),
      },
    });
    console.log(`📊 [TRACKING] Intervention opened: ${trackingPixel}`);
  } catch (error) {
    console.error("Error marking intervention as opened:", error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Mark intervention as clicked
 */
export async function markInterventionClicked(trackingId: string) {
  const prisma = new PrismaClient();

  try {
    await (prisma as any).interventionTracking.update({
      where: { id: trackingId },
      data: {
        clickedAt: new Date(),
      },
    });
    console.log(`📊 [TRACKING] Intervention clicked: ${trackingId}`);
  } catch (error) {
    console.error("Error marking intervention as clicked:", error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Mark intervention as converted (user completed desired action)
 */
export async function markInterventionConverted(
  trackingId: string,
  conversionGoal?: string,
  conversionValue?: number
) {
  const prisma = new PrismaClient();

  try {
    await (prisma as any).interventionTracking.update({
      where: { id: trackingId },
      data: {
        convertedAt: new Date(),
        conversionGoal,
        conversionValue,
      },
    });
    console.log(
      `📊 [TRACKING] Intervention converted: ${trackingId} (${conversionGoal})`
    );
  } catch (error) {
    console.error("Error marking intervention as converted:", error);
  } finally {
    await prisma.$disconnect();
  }
}
