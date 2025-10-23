/**
 * Email Testing API Endpoint
 * POST /api/admin/email/test
 * 
 * Allows admins to test email functionality
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import {
  sendTestEmail,
  sendInstructorApprovalEmail,
  sendSecurityAlert,
  sendCourseEnrollmentEmail,
  sendPayoutProcessedEmail,
} from "@/lib/mail/email-sender";

export async function POST(request: NextRequest) {
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
      select: { role: true, email: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { testType, recipientEmail } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Recipient email required" },
        { status: 400 }
      );
    }

    let result;

    switch (testType) {
      case 'basic':
        result = await sendTestEmail(recipientEmail);
        break;

      case 'instructor-approval':
        result = await sendInstructorApprovalEmail(recipientEmail, {
          instructorName: 'John Doe',
          approvedBy: user.email || 'Admin',
          approvalDate: new Date().toLocaleDateString(),
          dashboardUrl: `${process.env.NEXTAUTH_URL}/instructor/dashboard`,
        });
        break;

      case 'security-alert':
        result = await sendSecurityAlert([recipientEmail], {
          alertType: 'Multiple Failed Login Attempts',
          severity: 'high',
          timestamp: new Date().toISOString(),
          details: 'Someone attempted to login 5 times with incorrect credentials.',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          actionRequired: 'Review security logs and consider blocking this IP.',
        });
        break;

      case 'course-enrollment':
        result = await sendCourseEnrollmentEmail(recipientEmail, {
          courseName: 'Advanced TypeScript Mastery',
          studentName: 'Jane Smith',
          studentEmail: 'jane@example.com',
          enrollmentDate: new Date().toLocaleDateString(),
          courseUrl: `${process.env.NEXTAUTH_URL}/instructor/courses/123`,
          totalStudents: 47,
        });
        break;

      case 'payout-processed':
        result = await sendPayoutProcessedEmail(recipientEmail, {
          instructorName: 'John Doe',
          amount: 1250.00,
          period: 'October 2025',
          processedDate: new Date().toLocaleDateString(),
          transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          nextPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid test type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${recipientEmail}`,
      result,
    });

  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { error: "Failed to send test email", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
