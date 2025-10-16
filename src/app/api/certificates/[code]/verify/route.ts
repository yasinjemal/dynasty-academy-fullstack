import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/certificates/[code]/verify
 * Verify certificate authenticity
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
      return NextResponse.json({
        valid: false,
        error: "Certificate not found or invalid verification code",
      });
    }

    const certData = certificate[0];

    return NextResponse.json({
      valid: true,
      certificate: {
        id: certData.id,
        verificationCode: certData.verificationCode,
        issuedAt: certData.issuedAt,
        userName: certData.userName || certData.userEmail,
        courseTitle: certData.courseTitle,
        instructorName: certData.instructorName || "Dynasty Academy",
      },
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Failed to verify certificate",
      },
      { status: 500 }
    );
  }
}
