import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const flagSchema = z.object({
  messageId: z.string(),
  reason: z.enum([
    "spam",
    "harassment",
    "inappropriate",
    "hate_speech",
    "other",
  ]),
  details: z.string().optional(),
});

// POST: Flag a message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = flagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { messageId, reason, details } = validation.data;

    // Check if message exists
    const message = await prisma.pageChat.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user already flagged this message
    const existingFlag = await prisma.messageFlag.findFirst({
      where: {
        messageId,
        flaggedBy: session.user.id,
      },
    });

    if (existingFlag) {
      return NextResponse.json(
        { error: "You have already flagged this message" },
        { status: 400 }
      );
    }

    // Create flag
    const flag = await prisma.messageFlag.create({
      data: {
        messageId,
        flaggedBy: session.user.id,
        reason,
        details,
      },
    });

    // Update message flagged status
    await prisma.pageChat.update({
      where: { id: messageId },
      data: {
        flagged: true,
        flagReason: reason,
        flaggedBy: session.user.id,
        flaggedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, flag });
  } catch (error) {
    console.error("[POST /api/co-reading/moderation/flag] Error:", error);
    return NextResponse.json(
      { error: "Failed to flag message" },
      { status: 500 }
    );
  }
}
