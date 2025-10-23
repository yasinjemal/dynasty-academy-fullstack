/**
 * SendGrid Email Service Integration
 * Handles transactional emails for engagement interventions
 */

import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || "noreply@dynastyacademy.com";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Dynasty Academy";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SendGrid API key not configured. Email not sent.");
    return false;
  }

  try {
    const msg: any = {
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
    };

    // Use template if provided
    if (options.templateId) {
      msg.templateId = options.templateId;
      msg.dynamicTemplateData = options.dynamicTemplateData || {};
    } else {
      msg.text = options.text;
      msg.html = options.html;
    }

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error("❌ SendGrid error:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return false;
  }
}

/**
 * Send engagement intervention email
 */
export async function sendEngagementEmail(
  to: string,
  userName: string,
  interventionType: string,
  data: Record<string, any>
): Promise<boolean> {
  const templates: Record<
    string,
    {
      subject: string;
      html: (name: string, data: any) => string;
    }
  > = {
    gentle_reminder: {
      subject: "We miss you! Come back to your learning journey 📚",
      html: (name, data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">Hey ${name}! 👋</h1>
          <p style="font-size: 16px; color: #374151;">
            It's been ${data.daysSince} days since your last visit. We've been working hard to 
            create amazing new content just for you!
          </p>
          <p style="font-size: 16px; color: #374151;">
            Your current progress: <strong>${data.progress}% complete</strong> in "${data.courseName}"
          </p>
          <a href="${data.continueUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Continue Learning →
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Keep learning, keep growing! 🚀
          </p>
        </div>
      `,
    },
    streak_warning: {
      subject: "🔥 Your ${data.streakDays}-day streak is at risk!",
      html: (name, data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); border-radius: 16px;">
          <h1 style="color: white; text-align: center;">🔥 STREAK ALERT! 🔥</h1>
          <div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0;">
            <p style="font-size: 18px; color: #374151;">
              Hey ${name}!
            </p>
            <p style="font-size: 16px; color: #374151;">
              Your <strong style="color: #ff6b6b;">${data.streakDays}-day learning streak</strong> is about to end! 
              You've worked so hard to build this momentum - don't let it slip away now!
            </p>
            <p style="font-size: 16px; color: #374151;">
              Just complete one quick lesson to keep your streak alive. It only takes a few minutes!
            </p>
            <a href="${data.lessonUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; width: 100%; text-align: center; box-sizing: border-box;">
              Save My Streak! 🔥
            </a>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Time remaining: <strong>${data.hoursLeft} hours</strong>
            </p>
          </div>
        </div>
      `,
    },
    achievement_unlocked: {
      subject: "🏆 Achievement Unlocked: ${data.achievementName}!",
      html: (name, data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 80px; margin-bottom: 20px;">🏆</div>
            <h1 style="color: #7c3aed; margin: 0;">Congratulations, ${name}!</h1>
            <p style="font-size: 20px; color: #ec4899; font-weight: bold; margin-top: 10px;">
              Achievement Unlocked!
            </p>
          </div>
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 30px; border-radius: 12px; color: white; text-align: center;">
            <h2 style="margin: 0 0 10px 0;">${data.achievementName}</h2>
            <p style="font-size: 16px; margin: 10px 0;">
              ${data.achievementDescription}
            </p>
            <p style="font-size: 24px; font-weight: bold; margin-top: 20px;">
              +${data.xpReward} XP
            </p>
          </div>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
            Keep up the amazing work! 🌟
          </p>
        </div>
      `,
    },
    milestone_celebration: {
      subject: "🎉 You've reached ${data.milestone}!",
      html: (name, data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 16px;">
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 100px; margin-bottom: 20px;">🎉</div>
            <h1 style="color: white; margin: 0;">MILESTONE ACHIEVED!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 12px;">
            <p style="font-size: 18px; color: #374151;">
              Wow, ${name}! You did it! 🎊
            </p>
            <p style="font-size: 16px; color: #374151;">
              You've just reached <strong>${data.milestone}</strong>!
            </p>
            <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
              <li>${data.stat1}</li>
              <li>${data.stat2}</li>
              <li>${data.stat3}</li>
            </ul>
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 20px; border-radius: 8px; color: white; text-align: center; margin: 20px 0;">
              <p style="font-size: 18px; margin: 0;">🏆 Reward Unlocked!</p>
              <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">
                ${data.rewardDescription}
              </p>
            </div>
            <a href="${data.dashboardUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; width: 100%; text-align: center; box-sizing: border-box;">
              View Your Progress →
            </a>
          </div>
        </div>
      `,
    },
  };

  const template = templates[interventionType];

  if (!template) {
    console.warn(`Unknown intervention type: ${interventionType}`);
    return false;
  }

  return sendEmail({
    to,
    subject: template.subject.replace(
      /\$\{data\.(\w+)\}/g,
      (_, key) => data[key]
    ),
    text: `Hi ${userName}, ${template.subject}`,
    html: template.html(userName, data),
  });
}

/**
 * Send bulk engagement emails
 */
export async function sendBulkEngagementEmails(
  recipients: Array<{
    email: string;
    name: string;
    interventionType: string;
    data: Record<string, any>;
  }>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const success = await sendEngagementEmail(
      recipient.email,
      recipient.name,
      recipient.interventionType,
      recipient.data
    );

    if (success) {
      sent++;
    } else {
      failed++;
    }

    // Rate limiting: wait 100ms between emails
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { sent, failed };
}
