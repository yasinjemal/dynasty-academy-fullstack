import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * DELETE /api/narrations/[id]
 * Delete a community narration (only creator can delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find narration
    const narration = await prisma.communityNarration.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!narration) {
      return NextResponse.json(
        { success: false, error: "Narration not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (narration.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own narrations" },
        { status: 403 }
      );
    }

    // Delete narration (cascade will delete likes, plays, flags)
    await prisma.communityNarration.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Narration deleted successfully",
    });
  } catch (error) {
    console.error("Delete narration error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete narration",
      },
      { status: 500 }
    );
  }
}
