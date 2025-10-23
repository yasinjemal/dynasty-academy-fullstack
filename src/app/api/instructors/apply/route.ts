import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/instructors/apply
 * Check user's application status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's most recent application
    const application = await prisma.instructorApplication.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        pitch: true,
        topics: true,
        portfolioUrl: true,
        rejectionReason: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructors/apply
 * Submit instructor application
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pitch, topics, portfolioUrl } = body;

    // Validation
    if (!pitch || pitch.length < 100) {
      return NextResponse.json(
        { error: "Pitch must be at least 100 characters" },
        { status: 400 }
      );
    }

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "At least one topic is required" },
        { status: 400 }
      );
    }

    if (topics.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 topics allowed" },
        { status: 400 }
      );
    }

    // Check if user already has a pending application
    const existingApplication = await prisma.instructorApplication.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You already have a pending application" },
        { status: 400 }
      );
    }

    // Check if user was recently rejected (within 30 days)
    const recentRejection = await prisma.instructorApplication.findFirst({
      where: {
        userId: session.user.id,
        status: "rejected",
        reviewedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
    });

    if (recentRejection) {
      return NextResponse.json(
        {
          error:
            "You can reapply 30 days after your last rejection. Please wait.",
        },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.instructorApplication.create({
      data: {
        userId: session.user.id,
        pitch,
        topics,
        portfolioUrl: portfolioUrl || null,
        status: "pending",
      },
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    // Log audit action
    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "submit_instructor_application",
          entity: "instructor_application",
          entityId: application.id,
          after: {
            topics: topics.length,
            hasPortfolio: !!portfolioUrl,
          },
        },
      });
    } catch (auditError) {
      console.error("Audit log failed:", auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
      },
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
