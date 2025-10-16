import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CertificateGenerator } from "@/lib/certificates/generator";

const prisma = new PrismaClient();

/**
 * GET /api/certificates/[code]/download
 * Download certificate PDF by verification code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find certificate
    const certificate = await prisma.$queryRaw<any[]>`
      SELECT 
        c.id,
        c."userId",
        c."courseId",
        c."verificationCode",
        c."issuedAt",
        u.name as "userName",
        u.email as "userEmail",
        co.title as "courseTitle",
        co."instructorName"
      FROM certificates c
      JOIN users u ON u.id = c."userId"
      JOIN courses co ON co.id = c."courseId"
      WHERE c."verificationCode" = ${code}
      LIMIT 1
    `;

    if (!certificate || certificate.length === 0) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    const certData = certificate[0];

    // Generate PDF
    const generator = new CertificateGenerator();
    const pdfBlob = await generator.generateCertificate({
      studentName: certData.userName || certData.userEmail || "Student",
      courseTitle: certData.courseTitle,
      completionDate: new Date(certData.issuedAt),
      instructorName: certData.instructorName || "Dynasty Academy",
      verificationCode: certData.verificationCode,
      courseId: certData.courseId,
      userId: certData.userId,
    });

    // Convert Blob to Buffer
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${certData.courseTitle.replace(
          /\s+/g,
          "_"
        )}_Certificate.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error downloading certificate:", error);
    return NextResponse.json(
      { error: "Failed to download certificate" },
      { status: 500 }
    );
  }
}
