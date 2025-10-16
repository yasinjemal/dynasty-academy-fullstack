import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { PrismaClient } from "@prisma/client";
import { CertificateGenerator } from "@/lib/certificates/generator";

const prisma = new PrismaClient();

/**
 * POST /api/courses/[id]/certificate
 * Generate certificate for completed course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Verify course completion
    const enrollment = await prisma.$queryRaw<any[]>`
      SELECT 
        ce.id,
        ce.progress,
        ce.status,
        ce."completedAt",
        ce."certificateIssued",
        c.title as "courseTitle",
        c."instructorName",
        c."certificateEnabled"
      FROM course_enrollments ce
      JOIN courses c ON c.id = ce."courseId"
      WHERE ce."userId" = ${session.user.id}
      AND ce."courseId" = ${courseId}
      LIMIT 1
    `;

    if (!enrollment || enrollment.length === 0) {
      return NextResponse.json(
        { error: "Course not found or not enrolled" },
        { status: 404 }
      );
    }

    const enrollmentData = enrollment[0];

    // Check if certificates are enabled for this course
    if (!enrollmentData.certificateEnabled) {
      return NextResponse.json(
        { error: "Certificates are not available for this course" },
        { status: 403 }
      );
    }

    // Check if course is completed
    if (
      enrollmentData.status !== "completed" ||
      enrollmentData.progress < 100
    ) {
      return NextResponse.json(
        {
          error: "Course must be 100% completed to generate certificate",
          progress: enrollmentData.progress,
          status: enrollmentData.status,
        },
        { status: 400 }
      );
    }

    // Check if certificate already issued
    if (enrollmentData.certificateIssued) {
      // Return existing certificate
      const existingCert = await prisma.$queryRaw<any[]>`
        SELECT 
          id,
          "verificationCode",
          "issuedAt",
          "pdfUrl"
        FROM certificates
        WHERE "userId" = ${session.user.id}
        AND "courseId" = ${courseId}
        ORDER BY "issuedAt" DESC
        LIMIT 1
      `;

      if (existingCert && existingCert.length > 0) {
        return NextResponse.json({
          alreadyIssued: true,
          certificate: existingCert[0],
        });
      }
    }

    // Generate verification code
    const verificationCode = CertificateGenerator.generateVerificationCode(
      session.user.id,
      courseId
    );

    // Get user name
    const user = await prisma.$queryRaw<any[]>`
      SELECT name, email
      FROM users
      WHERE id = ${session.user.id}
      LIMIT 1
    `;

    const userName = user[0]?.name || user[0]?.email || "Student";

    // Generate certificate PDF
    const generator = new CertificateGenerator();
    const pdfBlob = await generator.generateCertificate({
      studentName: userName,
      courseTitle: enrollmentData.courseTitle,
      completionDate: enrollmentData.completedAt || new Date(),
      instructorName: enrollmentData.instructorName || "Dynasty Academy",
      verificationCode,
      courseId,
      userId: session.user.id,
    });

    // In production, upload to cloud storage (Cloudinary, S3, etc.)
    // For now, we'll store the verification code and generate on-demand
    const pdfUrl = `/api/certificates/${verificationCode}/download`;

    // Create certificate record
    const certificateId = `cert_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await prisma.$executeRaw`
      INSERT INTO certificates (
        id,
        "userId",
        "courseId",
        "verificationCode",
        "issuedAt",
        "pdfUrl"
      ) VALUES (
        ${certificateId},
        ${session.user.id},
        ${courseId},
        ${verificationCode},
        NOW(),
        ${pdfUrl}
      )
    `;

    // Update enrollment
    await prisma.$executeRaw`
      UPDATE course_enrollments
      SET 
        "certificateIssued" = true,
        "certificateIssuedAt" = NOW(),
        "certificateUrl" = ${pdfUrl}
      WHERE "userId" = ${session.user.id}
      AND "courseId" = ${courseId}
    `;

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificateId,
        verificationCode,
        issuedAt: new Date(),
        pdfUrl,
        downloadUrl: pdfUrl,
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses/[id]/certificate
 * Get certificate status for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Check enrollment and certificate status
    const enrollment = await prisma.$queryRaw<any[]>`
      SELECT 
        ce.status,
        ce.progress,
        ce."certificateIssued",
        ce."certificateIssuedAt",
        ce."certificateUrl",
        c."certificateEnabled"
      FROM course_enrollments ce
      JOIN courses c ON c.id = ce."courseId"
      WHERE ce."userId" = ${session.user.id}
      AND ce."courseId" = ${courseId}
      LIMIT 1
    `;

    if (!enrollment || enrollment.length === 0) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 404 }
      );
    }

    const data = enrollment[0];

    // Get certificate if issued
    let certificate = null;
    if (data.certificateIssued) {
      const cert = await prisma.$queryRaw<any[]>`
        SELECT 
          id,
          "verificationCode",
          "issuedAt",
          "pdfUrl"
        FROM certificates
        WHERE "userId" = ${session.user.id}
        AND "courseId" = ${courseId}
        ORDER BY "issuedAt" DESC
        LIMIT 1
      `;

      if (cert && cert.length > 0) {
        certificate = cert[0];
      }
    }

    return NextResponse.json({
      certificatesEnabled: data.certificateEnabled,
      courseCompleted: data.status === "completed" && data.progress >= 100,
      certificateIssued: data.certificateIssued,
      progress: data.progress,
      certificate,
    });
  } catch (error) {
    console.error("Error fetching certificate status:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate status" },
      { status: 500 }
    );
  }
}
