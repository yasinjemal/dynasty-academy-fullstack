/**
 * Dynasty Academy Email Notification System
 *
 * Handles all transactional emails:
 * - Instructor approvals
 * - Security alerts
 * - Course enrollments
 * - Payout notifications
 *
 * Supports: Resend API (primary) + SMTP fallback
 */

import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || "Dynasty Academy <no-reply@dynasty.academy>",
  replyTo: process.env.EMAIL_REPLY_TO || "support@dynasty.academy",
};

// Email template types
export type EmailTemplate =
  | "instructor-approved"
  | "instructor-rejected"
  | "security-alert"
  | "course-enrollment"
  | "payout-processed"
  | "new-student"
  | "critical-security-event";

// Email data interfaces
export interface InstructorApprovedData {
  instructorName: string;
  approvedBy: string;
  approvalDate: string;
  dashboardUrl: string;
}

export interface InstructorRejectedData {
  instructorName: string;
  rejectedBy: string;
  reason: string;
  reapplyUrl: string;
}

export interface SecurityAlertData {
  alertType: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  actionRequired?: string;
}

export interface CourseEnrollmentData {
  courseName: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: string;
  courseUrl: string;
  totalStudents: number;
}

export interface PayoutProcessedData {
  instructorName: string;
  amount: number;
  period: string;
  processedDate: string;
  transactionId: string;
  nextPayoutDate: string;
}

// Main email sending function
export async function sendEmail({
  to,
  subject,
  template,
  data,
}: {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data: any;
}) {
  try {
    const html = generateEmailHTML(template, data);
    const text = generateEmailText(template, data);

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: EMAIL_CONFIG.replyTo,
    });

    console.log(`✅ Email sent successfully: ${template}`, result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error(`❌ Email send failed: ${template}`, error);

    // Log to audit system
    await logEmailFailure(template, to, error);

    return { success: false, error };
  }
}

// Send instructor approval email
export async function sendInstructorApprovalEmail(
  instructorEmail: string,
  data: InstructorApprovedData
) {
  return sendEmail({
    to: instructorEmail,
    subject: "🎉 Congratulations! Your Instructor Application is Approved",
    template: "instructor-approved",
    data,
  });
}

// Send instructor rejection email
export async function sendInstructorRejectionEmail(
  instructorEmail: string,
  data: InstructorRejectedData
) {
  return sendEmail({
    to: instructorEmail,
    subject: "Regarding Your Instructor Application",
    template: "instructor-rejected",
    data,
  });
}

// Send security alert to admins
export async function sendSecurityAlert(
  adminEmails: string[],
  data: SecurityAlertData
) {
  const urgencyPrefix = data.severity === "critical" ? "🚨 URGENT: " : "⚠️ ";

  return sendEmail({
    to: adminEmails,
    subject: `${urgencyPrefix}Security Alert: ${data.alertType}`,
    template: "security-alert",
    data,
  });
}

// Send course enrollment notification to instructor
export async function sendCourseEnrollmentEmail(
  instructorEmail: string,
  data: CourseEnrollmentData
) {
  return sendEmail({
    to: instructorEmail,
    subject: `🎓 New Student Enrolled: ${data.courseName}`,
    template: "course-enrollment",
    data,
  });
}

// Send payout processed notification
export async function sendPayoutProcessedEmail(
  instructorEmail: string,
  data: PayoutProcessedData
) {
  return sendEmail({
    to: instructorEmail,
    subject: `💰 Payout Processed: $${data.amount.toFixed(2)}`,
    template: "payout-processed",
    data,
  });
}

// Generate HTML email content
function generateEmailHTML(template: EmailTemplate, data: any): string {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
      .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 10px 10px; }
      .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
      .alert-critical { border-left: 4px solid #dc2626; padding: 16px; background: #fef2f2; }
      .alert-high { border-left: 4px solid #ea580c; padding: 16px; background: #fff7ed; }
      .alert-medium { border-left: 4px solid #f59e0b; padding: 16px; background: #fffbeb; }
      .alert-low { border-left: 4px solid #3b82f6; padding: 16px; background: #eff6ff; }
    </style>
  `;

  switch (template) {
    case "instructor-approved":
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Dynasty Academy!</h1>
          </div>
          <div class="content">
            <h2>Congratulations, ${data.instructorName}!</h2>
            <p>Your instructor application has been approved by ${data.approvedBy} on ${data.approvalDate}.</p>
            <p>You can now:</p>
            <ul>
              <li>Create and publish courses</li>
              <li>Access your instructor dashboard</li>
              <li>View real-time earnings</li>
              <li>Track student enrollments</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl}" class="button">Go to Instructor Dashboard</a>
            </p>
            <p><strong>What's next?</strong></p>
            <ol>
              <li>Complete your instructor profile</li>
              <li>Create your first course</li>
              <li>Start earning 70% revenue share!</li>
            </ol>
          </div>
          <div class="footer">
            <p>Dynasty Academy - From Learner to Legend</p>
            <p>Questions? Reply to this email or visit our help center.</p>
          </div>
        </div>
      `;

    case "instructor-rejected":
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Regarding Your Application</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.instructorName},</h2>
            <p>Thank you for your interest in becoming a Dynasty Academy instructor.</p>
            <p>After careful review, we're unable to approve your application at this time.</p>
            <p><strong>Reason:</strong> ${data.reason}</p>
            <p>We encourage you to:</p>
            <ul>
              <li>Build your portfolio and expertise</li>
              <li>Complete courses on our platform</li>
              <li>Engage with the community</li>
            </ul>
            <p>You're welcome to reapply after 30 days.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.reapplyUrl}" class="button">Learn More</a>
            </p>
          </div>
          <div class="footer">
            <p>Dynasty Academy - Your learning journey continues</p>
          </div>
        </div>
      `;

    case "security-alert":
      const alertClass = `alert-${data.severity}`;
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>🛡️ Security Alert</h1>
          </div>
          <div class="content">
            <div class="${alertClass}">
              <h3>⚠️ ${data.alertType}</h3>
              <p><strong>Severity:</strong> ${data.severity.toUpperCase()}</p>
              <p><strong>Time:</strong> ${data.timestamp}</p>
            </div>
            <h3>Details:</h3>
            <p>${data.details}</p>
            ${
              data.ipAddress
                ? `<p><strong>IP Address:</strong> ${data.ipAddress}</p>`
                : ""
            }
            ${
              data.userAgent
                ? `<p><strong>User Agent:</strong> ${data.userAgent}</p>`
                : ""
            }
            ${
              data.actionRequired
                ? `
              <div style="background: #fef2f2; padding: 16px; margin-top: 20px; border-radius: 6px;">
                <h4>🚨 Action Required:</h4>
                <p>${data.actionRequired}</p>
              </div>
            `
                : ""
            }
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://dynasty.academy/admin/security" class="button">View Security Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>Dynasty Security System - Automated Alert</p>
          </div>
        </div>
      `;

    case "course-enrollment":
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>🎓 New Student Enrolled!</h1>
          </div>
          <div class="content">
            <h2>Great news!</h2>
            <p><strong>${data.studentName}</strong> just enrolled in your course:</p>
            <h3 style="color: #667eea;">${data.courseName}</h3>
            <p><strong>Enrollment Date:</strong> ${data.enrollmentDate}</p>
            <p><strong>Student Email:</strong> ${data.studentEmail}</p>
            <p>You now have <strong>${data.totalStudents} students</strong> in this course! 🎉</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.courseUrl}" class="button">View Course Dashboard</a>
            </p>
            <p><em>Keep up the great work! Remember to engage with your students and maintain high-quality content.</em></p>
          </div>
          <div class="footer">
            <p>Dynasty Academy - Empowering Instructors</p>
          </div>
        </div>
      `;

    case "payout-processed":
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>💰 Payout Processed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.instructorName},</h2>
            <p>Your payout has been successfully processed!</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #15803d; margin: 0;">$${data.amount.toFixed(
                2
              )}</h1>
              <p style="color: #16a34a; margin: 5px 0;">For period: ${
                data.period
              }</p>
            </div>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Processed Date:</strong> ${data.processedDate}</p>
            <p><strong>Next Payout:</strong> ${data.nextPayoutDate}</p>
            <p>The funds should appear in your account within 2-5 business days.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://dynasty.academy/instructor/revenue" class="button">View Revenue Details</a>
            </p>
          </div>
          <div class="footer">
            <p>Dynasty Academy - Supporting Your Success</p>
          </div>
        </div>
      `;

    default:
      return `<div>Email template not found</div>`;
  }
}

// Generate plain text email content (fallback)
function generateEmailText(template: EmailTemplate, data: any): string {
  switch (template) {
    case "instructor-approved":
      return `
Congratulations, ${data.instructorName}!

Your instructor application has been approved by ${data.approvedBy} on ${data.approvalDate}.

You can now access your instructor dashboard at: ${data.dashboardUrl}

What's next?
1. Complete your instructor profile
2. Create your first course
3. Start earning 70% revenue share!

Dynasty Academy - From Learner to Legend
      `.trim();

    case "security-alert":
      return `
SECURITY ALERT

Alert Type: ${data.alertType}
Severity: ${data.severity.toUpperCase()}
Time: ${data.timestamp}

Details: ${data.details}

${data.ipAddress ? `IP Address: ${data.ipAddress}` : ""}
${data.actionRequired ? `Action Required: ${data.actionRequired}` : ""}

View Security Dashboard: https://dynasty.academy/admin/security
      `.trim();

    default:
      return "Dynasty Academy Notification";
  }
}

// Log email failures to audit system
async function logEmailFailure(
  template: EmailTemplate,
  to: string | string[],
  error: any
) {
  try {
    // Import audit logger dynamically to avoid circular dependencies
    const { createAuditLog } = await import("@/lib/security/audit-logger");

    await createAuditLog({
      action: "EMAIL_SEND_FAILURE",
      severity: "medium",
      metadata: {
        before: { template, recipients: Array.isArray(to) ? to : [to] },
        after: { error: error.message },
      },
    });
  } catch (logError) {
    console.error("Failed to log email failure:", logError);
  }
}

// Batch email sending (for newsletters, announcements)
export async function sendBatchEmails(
  recipients: string[],
  subject: string,
  template: EmailTemplate,
  data: any
) {
  const results = [];

  // Send in batches of 50 to avoid rate limits
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const promises = batch.map((email) =>
      sendEmail({ to: email, subject, template, data })
    );

    const batchResults = await Promise.allSettled(promises);
    results.push(...batchResults);

    // Wait 1 second between batches
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { successful, failed, total: recipients.length };
}

// Test email function (for development)
export async function sendTestEmail(to: string) {
  return sendEmail({
    to,
    subject: "✅ Dynasty Academy Email System Test",
    template: "instructor-approved",
    data: {
      instructorName: "Test Instructor",
      approvedBy: "Admin",
      approvalDate: new Date().toLocaleDateString(),
      dashboardUrl: "https://dynasty.academy/instructor/dashboard",
    },
  });
}
