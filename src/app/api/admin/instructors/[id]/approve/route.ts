/**
 * Instructor Approval API
 * PATCH /api/admin/instructors/[id]/approve
 * 
 * Approves or rejects instructor applications
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestMetadata } from "@/lib/security/audit-logger";
import {
  sendInstructorApprovalEmail,
  sendInstructorRejectionEmail,
} from "@/lib/mail/email-sender";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true, email: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, reason } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get instructor application
    const instructor = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Update user role to INSTRUCTOR
      const updatedInstructor = await prisma.user.update({
        where: { id: params.id },
        data: {
          role: "INSTRUCTOR",
          updatedAt: new Date(),
        },
      });

      // Send approval email
      await sendInstructorApprovalEmail(instructor.email!, {
        instructorName: instructor.name || 'Instructor',
        approvedBy: admin.name || admin.email || 'Admin',
        approvalDate: new Date().toLocaleDateString(),
        dashboardUrl: `${process.env.NEXTAUTH_URL}/instructor/dashboard`,
      });

      // Log to audit trail
      await createAuditLog({
        action: 'INSTRUCTOR_APPROVED',
        userId: admin.id,
        ...getRequestMetadata(request),
        severity: 'medium',
        metadata: {
          before: { role: instructor.role },
          after: { role: 'INSTRUCTOR', approvedBy: admin.id },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Instructor approved successfully. Email sent to ${instructor.email}`,
        instructor: updatedInstructor,
      });

    } else {
      // Reject application
      // Note: We don't change the role, just log the rejection
      
      // Send rejection email
      await sendInstructorRejectionEmail(instructor.email!, {
        instructorName: instructor.name || 'Applicant',
        rejectedBy: admin.name || admin.email || 'Admin',
        reason: reason || 'Application does not meet current requirements',
        reapplyUrl: `${process.env.NEXTAUTH_URL}/become-instructor`,
      });

      // Log to audit trail
      await createAuditLog({
        action: 'INSTRUCTOR_REJECTED',
        userId: admin.id,
        ...getRequestMetadata(request),
        severity: 'low',
        metadata: {
          before: { applicantId: instructor.id },
          after: { rejectedBy: admin.id, reason },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Instructor application rejected. Email sent to ${instructor.email}`,
        reason,
      });
    }

  } catch (error) {
    console.error("Instructor approval error:", error);
    return NextResponse.json(
      { error: "Failed to process instructor application" },
      { status: 500 }
    );
  }
}
