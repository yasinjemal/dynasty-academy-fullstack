import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const moderateSchema = z.object({
  action: z.enum(["timeout", "ban", "delete_message", "resolve_flag"]),
  targetType: z.enum(["user", "message"]),
  targetId: z.string(),
  reason: z.string().optional(),
  duration: z.number().optional(), // For timeout (minutes)
});

// POST: Perform moderation action (MODERATOR/ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is MODERATOR or ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Moderator access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = moderateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { action, targetType, targetId, reason, duration } = validation.data;

    // Perform action based on type
    switch (action) {
      case "timeout":
        if (targetType !== "user") {
          return NextResponse.json(
            { error: "Timeout action requires user target" },
            { status: 400 }
          );
        }

        const timeoutUntil = new Date();
        timeoutUntil.setMinutes(timeoutUntil.getMinutes() + (duration || 60));

        await prisma.user.update({
          where: { id: targetId },
          data: {
            isSuspended: true,
            suspendedUntil: timeoutUntil,
          },
        });

        await prisma.moderationLog.create({
          data: {
            action: "timeout",
            targetType: "user",
            targetId,
            moderatorId: session.user.id,
            reason: reason || "Timeout applied",
            details: { duration, until: timeoutUntil },
          },
        });

        return NextResponse.json({
          success: true,
          message: `User timed out until ${timeoutUntil.toISOString()}`,
        });

      case "ban":
        if (targetType !== "user") {
          return NextResponse.json(
            { error: "Ban action requires user target" },
            { status: 400 }
          );
        }

        await prisma.user.update({
          where: { id: targetId },
          data: {
            isBanned: true,
            banReason: reason || "Banned by moderator",
          },
        });

        await prisma.moderationLog.create({
          data: {
            action: "ban",
            targetType: "user",
            targetId,
            moderatorId: session.user.id,
            reason: reason || "Banned by moderator",
          },
        });

        return NextResponse.json({
          success: true,
          message: "User permanently banned",
        });

      case "delete_message":
        if (targetType !== "message") {
          return NextResponse.json(
            { error: "Delete action requires message target" },
            { status: 400 }
          );
        }

        await prisma.pageChat.update({
          where: { id: targetId },
          data: {
            moderatorDeleted: true,
            deletedBy: session.user.id,
          },
        });

        await prisma.moderationLog.create({
          data: {
            action: "delete_message",
            targetType: "message",
            targetId,
            moderatorId: session.user.id,
            reason: reason || "Message deleted by moderator",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Message deleted by moderator",
        });

      case "resolve_flag":
        if (targetType !== "message") {
          return NextResponse.json(
            { error: "Resolve action requires message target" },
            { status: 400 }
          );
        }

        // Resolve all flags for this message
        await prisma.messageFlag.updateMany({
          where: { messageId: targetId, resolved: false },
          data: {
            resolved: true,
            resolvedBy: session.user.id,
            resolvedAt: new Date(),
          },
        });

        // Update message
        await prisma.pageChat.update({
          where: { id: targetId },
          data: {
            flagged: false,
            flagReason: null,
          },
        });

        await prisma.moderationLog.create({
          data: {
            action: "resolve_flag",
            targetType: "message",
            targetId,
            moderatorId: session.user.id,
            reason: reason || "Flag resolved",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Flags resolved",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[POST /api/co-reading/moderation/action] Error:", error);
    return NextResponse.json(
      { error: "Failed to perform moderation action" },
      { status: 500 }
    );
  }
}

// GET: Get moderation queue (flagged messages)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is MODERATOR or ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Moderator access required" },
        { status: 403 }
      );
    }

    // Get flagged messages
    const flaggedMessages = await prisma.pageChat.findMany({
      where: {
        flagged: true,
        moderatorDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        flags: {
          where: { resolved: false },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        flaggedAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ messages: flaggedMessages });
  } catch (error) {
    console.error("[GET /api/co-reading/moderation/action] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderation queue" },
      { status: 500 }
    );
  }
}
