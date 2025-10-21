/**
 * 📝 Update Generated Course Status API
 *
 * POST /api/admin/ai/course-status
 *
 * Update status, review, or publish generated courses
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication & admin
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // 2. Parse request
    const { id, action, reviewNotes, editedData } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { error: "id and action are required" },
        { status: 400 }
      );
    }

    // 3. Handle different actions
    switch (action) {
      case "approve":
        await prisma.$executeRaw`
          UPDATE ai_generated_content
          SET 
            status = 'approved',
            approved_by = ${session.user.id},
            approved_at = NOW(),
            review_notes = ${reviewNotes || null},
            updated_at = NOW()
          WHERE id = ${id}
        `;
        break;

      case "reject":
        await prisma.$executeRaw`
          UPDATE ai_generated_content
          SET 
            status = 'rejected',
            reviewed_by = ${session.user.id},
            reviewed_at = NOW(),
            review_notes = ${reviewNotes || "Rejected"},
            updated_at = NOW()
          WHERE id = ${id}
        `;
        break;

      case "edit":
        if (!editedData) {
          return NextResponse.json(
            { error: "editedData required for edit action" },
            { status: 400 }
          );
        }

        await prisma.$executeRaw`
          UPDATE ai_generated_content
          SET 
            generated_data = ${JSON.stringify(editedData)}::jsonb,
            edit_count = COALESCE(edit_count, 0) + 1,
            last_edited_at = NOW(),
            updated_at = NOW()
          WHERE id = ${id}
        `;
        break;

      case "publish":
        // This will actually create the course in the database
        // For now, just mark as published
        await prisma.$executeRaw`
          UPDATE ai_generated_content
          SET 
            status = 'published',
            published_at = NOW(),
            updated_at = NOW()
          WHERE id = ${id}
        `;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: approve, reject, edit, or publish" },
          { status: 400 }
        );
    }

    // 4. Get updated record
    const updated = await prisma.$queryRaw`
      SELECT * FROM ai_generated_content WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: `Course ${action}ed successfully`,
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ Update status error:", error);

    return NextResponse.json(
      { error: "Failed to update course status", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
