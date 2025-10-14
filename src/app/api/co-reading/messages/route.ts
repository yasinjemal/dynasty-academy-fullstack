import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schemas
const createMessageSchema = z.object({
  bookId: z.string(),
  bookSlug: z.string(),
  page: z.number().int().positive(),
  message: z.string().min(1).max(1000),
});

const editMessageSchema = z.object({
  message: z.string().min(1).max(1000),
});

/**
 * GET /api/co-reading/messages
 * Fetch paginated message history for a specific book page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const cursor = searchParams.get("cursor"); // For pagination

    if (!bookId || !page) {
      return NextResponse.json(
        { error: "bookId and page are required" },
        { status: 400 }
      );
    }

    // Build query
    const where = {
      bookId,
      page,
    };

    // Cursor-based pagination for better performance
    const messages = await prisma.pageChat.findMany({
      where,
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: {
        createdAt: "desc", // Latest first
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get total count
    const total = await prisma.pageChat.count({ where });

    // Reverse to show oldest first in UI
    const messagesReversed = messages.reverse();

    return NextResponse.json({
      messages: messagesReversed,
      total,
      hasMore: messages.length === limit,
      nextCursor:
        messages.length === limit ? messages[messages.length - 1].id : null,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/co-reading/messages
 * Create a new chat message for a specific page
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, image: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate request body
    const body = await request.json();
    const validation = createMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { bookId, bookSlug, page, message } = validation.data;

    // Rate limiting check (10 messages per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentMessages = await prisma.pageChat.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneMinuteAgo,
        },
      },
    });

    if (recentMessages >= 10) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Please wait before sending more messages.",
        },
        { status: 429 }
      );
    }

    // Create the message
    const newMessage = await prisma.pageChat.create({
      data: {
        bookId,
        bookSlug,
        page,
        userId: user.id,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/co-reading/messages/[id]
 * Edit an existing message (only by the author)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get message ID from URL
    const url = new URL(request.url);
    const messageId = url.pathname.split("/").pop();

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = editMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { message } = validation.data;

    // Find the message
    const existingMessage = await prisma.pageChat.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check ownership
    if (existingMessage.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own messages" },
        { status: 403 }
      );
    }

    // Update the message
    const updatedMessage = await prisma.pageChat.update({
      where: { id: messageId },
      data: {
        message,
        edited: true,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error editing message:", error);
    return NextResponse.json(
      { error: "Failed to edit message" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/co-reading/messages/[id]
 * Delete a message (only by the author)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get message ID from URL
    const url = new URL(request.url);
    const messageId = url.pathname.split("/").pop();

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Find the message
    const existingMessage = await prisma.pageChat.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check ownership
    if (existingMessage.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own messages" },
        { status: 403 }
      );
    }

    // Delete the message
    await prisma.pageChat.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
