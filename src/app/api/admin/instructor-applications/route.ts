import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";

/**
 * GET /api/admin/instructor-applications
 * Fetch all applications (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.instructorApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/instructor-applications
 * Approve or reject application (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, action, rejectionReason } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: "Application ID and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get application
    const application = await prisma.instructorApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "pending") {
      return NextResponse.json(
        { error: "Application already reviewed" },
        { status: 400 }
      );
    }

    // Update application
    const updatedApplication = await prisma.instructorApplication.update({
      where: { id: applicationId },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: action === "reject" ? rejectionReason || null : null,
      },
    });

    // If approved, upgrade user role to INSTRUCTOR
    if (action === "approve") {
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          role: Role.INSTRUCTOR,
        },
      });
    }

    // Log audit action
    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: `${action}_instructor_application`,
          entity: "instructor_application",
          entityId: applicationId,
          before: {
            status: application.status,
          },
          after: {
            status: updatedApplication.status,
            reviewedBy: session.user.id,
            userRole: action === "approve" ? "INSTRUCTOR" : undefined,
          },
        },
      });
    } catch (auditError) {
      console.error("Audit log failed:", auditError);
    }

    // TODO: Send email to applicant
    // If approved: Welcome email with next steps
    // If rejected: Rejection email with reason (if provided)

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Application ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error reviewing application:", error);
    return NextResponse.json(
      { error: "Failed to review application" },
      { status: 500 }
    );
  }
}
