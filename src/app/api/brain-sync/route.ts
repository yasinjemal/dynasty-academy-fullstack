/**
 * 🧠 BRAIN SYNC API - Real-Time Multiplayer Learning
 *
 * Revolutionary feature that connects learners studying the same content
 * in real-time. See cursors, highlights, and chat together.
 *
 * Think Google Docs meets Discord meets Learning Platform.
 * NO ONE HAS THIS.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export interface BrainSyncUser {
  id: string;
  name: string;
  image?: string;
  level: number;
  cursor?: { x: number; y: number };
  currentPage?: number;
  highlight?: { start: number; end: number; text: string };
  isTyping?: boolean;
  isSpeaking?: boolean;
  joinedAt: Date;
  color: string;
}

export interface BrainSyncRoom {
  id: string;
  contentType: "book" | "course" | "lesson";
  contentId: string;
  contentTitle: string;
  users: BrainSyncUser[];
  messages: BrainSyncMessage[];
  sharedHighlights: SharedHighlight[];
  createdAt: Date;
}

export interface BrainSyncMessage {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  timestamp: Date;
  type: "text" | "highlight" | "reaction" | "system";
}

export interface SharedHighlight {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  pageNumber: number;
  startOffset: number;
  endOffset: number;
  text: string;
  note?: string;
  reactions: { emoji: string; userId: string }[];
  createdAt: Date;
}

// Color palette for users
const USER_COLORS = [
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#F97316", // Orange
];

// In-memory rooms (use Redis in production)
const brainSyncRooms = new Map<string, BrainSyncRoom>();

function getOrCreateRoom(
  contentType: "book" | "course" | "lesson",
  contentId: string,
  contentTitle: string
): BrainSyncRoom {
  const roomKey = `${contentType}:${contentId}`;

  if (!brainSyncRooms.has(roomKey)) {
    brainSyncRooms.set(roomKey, {
      id: roomKey,
      contentType,
      contentId,
      contentTitle,
      users: [],
      messages: [],
      sharedHighlights: [],
      createdAt: new Date(),
    });
  }

  return brainSyncRooms.get(roomKey)!;
}

// GET - Get active brain sync rooms & users studying same content
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get("contentType") as
      | "book"
      | "course"
      | "lesson";
    const contentId = searchParams.get("contentId");
    const action = searchParams.get("action");

    // Action: Discover - Find other learners across all content
    if (action === "discover") {
      const activeRooms: any[] = [];

      brainSyncRooms.forEach((room) => {
        if (room.users.length > 0) {
          activeRooms.push({
            id: room.id,
            contentType: room.contentType,
            contentId: room.contentId,
            contentTitle: room.contentTitle,
            userCount: room.users.length,
            users: room.users.slice(0, 5).map((u) => ({
              name: u.name,
              image: u.image,
              level: u.level,
            })),
          });
        }
      });

      // Also get from database for persisted presence
      const dbPresence = await prisma.readingPresence.findMany({
        where: {
          lastSeenAt: {
            gte: new Date(Date.now() - 60 * 1000), // Active in last minute
          },
        },
        include: {
          user: {
            select: { name: true, image: true, level: true },
          },
          book: {
            select: { title: true, slug: true },
          },
        },
        take: 50,
      });

      // Group by book
      const bookGroups = new Map<string, any>();
      dbPresence.forEach((p) => {
        const key = p.bookId;
        if (!bookGroups.has(key)) {
          bookGroups.set(key, {
            id: `book:${p.bookId}`,
            contentType: "book",
            contentId: p.bookId,
            contentTitle: p.book.title,
            userCount: 0,
            users: [],
          });
        }
        const group = bookGroups.get(key);
        group.userCount++;
        if (group.users.length < 5) {
          group.users.push({
            name: p.user.name,
            image: p.user.image,
            level: p.user.level,
          });
        }
      });

      bookGroups.forEach((group) => {
        if (!activeRooms.find((r) => r.id === group.id)) {
          activeRooms.push(group);
        }
      });

      return NextResponse.json({
        success: true,
        rooms: activeRooms.sort((a, b) => b.userCount - a.userCount),
        totalLearners: dbPresence.length,
      });
    }

    // Action: Get specific room
    if (contentType && contentId) {
      // Get content title
      let contentTitle = "Unknown Content";

      if (contentType === "book") {
        const book = await prisma.book.findUnique({
          where: { id: contentId },
          select: { title: true },
        });
        contentTitle = book?.title || "Unknown Book";
      } else if (contentType === "course") {
        const course = await prisma.courses.findUnique({
          where: { id: contentId },
          select: { title: true },
        });
        contentTitle = course?.title || "Unknown Course";
      }

      const room = getOrCreateRoom(contentType, contentId, contentTitle);

      return NextResponse.json({
        success: true,
        room: {
          ...room,
          messages: room.messages.slice(-50), // Last 50 messages
        },
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("[Brain Sync GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch brain sync data" },
      { status: 500 }
    );
  }
}

// POST - Join room, send message, update presence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, contentType, contentId, contentTitle } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, image: true, level: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const room = getOrCreateRoom(
      contentType,
      contentId,
      contentTitle || "Study Room"
    );

    switch (action) {
      case "join": {
        // Check if user already in room
        const existingIndex = room.users.findIndex((u) => u.id === user.id);

        if (existingIndex === -1) {
          // Assign color based on index
          const color = USER_COLORS[room.users.length % USER_COLORS.length];

          room.users.push({
            id: user.id,
            name: user.name || "Anonymous",
            image: user.image || undefined,
            level: user.level || 1,
            joinedAt: new Date(),
            color,
          });

          // System message
          room.messages.push({
            id: crypto.randomUUID(),
            userId: "system",
            userName: "System",
            content: `${user.name || "Someone"} joined the study session! 🎉`,
            timestamp: new Date(),
            type: "system",
          });
        }

        return NextResponse.json({
          success: true,
          room: {
            ...room,
            messages: room.messages.slice(-50),
          },
          yourColor: room.users.find((u) => u.id === user.id)?.color,
        });
      }

      case "leave": {
        room.users = room.users.filter((u) => u.id !== user.id);

        room.messages.push({
          id: crypto.randomUUID(),
          userId: "system",
          userName: "System",
          content: `${user.name || "Someone"} left the session`,
          timestamp: new Date(),
          type: "system",
        });

        return NextResponse.json({ success: true });
      }

      case "message": {
        const { content, type = "text" } = body;

        const message: BrainSyncMessage = {
          id: crypto.randomUUID(),
          userId: user.id,
          userName: user.name || "Anonymous",
          userImage: user.image || undefined,
          content,
          timestamp: new Date(),
          type,
        };

        room.messages.push(message);

        // Keep only last 100 messages
        if (room.messages.length > 100) {
          room.messages = room.messages.slice(-100);
        }

        return NextResponse.json({ success: true, message });
      }

      case "cursor": {
        const { x, y, page } = body;
        const userIndex = room.users.findIndex((u) => u.id === user.id);

        if (userIndex !== -1) {
          room.users[userIndex].cursor = { x, y };
          room.users[userIndex].currentPage = page;
        }

        return NextResponse.json({ success: true });
      }

      case "highlight": {
        const { pageNumber, startOffset, endOffset, text, note } = body;
        const userInRoom = room.users.find((u) => u.id === user.id);

        const highlight: SharedHighlight = {
          id: crypto.randomUUID(),
          userId: user.id,
          userName: user.name || "Anonymous",
          userColor: userInRoom?.color || USER_COLORS[0],
          pageNumber,
          startOffset,
          endOffset,
          text,
          note,
          reactions: [],
          createdAt: new Date(),
        };

        room.sharedHighlights.push(highlight);

        // Add message about highlight
        room.messages.push({
          id: crypto.randomUUID(),
          userId: user.id,
          userName: user.name || "Anonymous",
          userImage: user.image || undefined,
          content: `highlighted: "${text.slice(0, 50)}${
            text.length > 50 ? "..." : ""
          }"`,
          timestamp: new Date(),
          type: "highlight",
        });

        return NextResponse.json({ success: true, highlight });
      }

      case "reaction": {
        const { highlightId, emoji } = body;
        const highlight = room.sharedHighlights.find(
          (h) => h.id === highlightId
        );

        if (highlight) {
          // Remove existing reaction from same user
          highlight.reactions = highlight.reactions.filter(
            (r) => r.userId !== user.id
          );
          // Add new reaction
          highlight.reactions.push({ emoji, userId: user.id });
        }

        return NextResponse.json({ success: true });
      }

      case "typing": {
        const { isTyping } = body;
        const userIndex = room.users.findIndex((u) => u.id === user.id);

        if (userIndex !== -1) {
          room.users[userIndex].isTyping = isTyping;
        }

        return NextResponse.json({ success: true });
      }

      case "speaking": {
        const { isSpeaking } = body;
        const userIndex = room.users.findIndex((u) => u.id === user.id);

        if (userIndex !== -1) {
          room.users[userIndex].isSpeaking = isSpeaking;
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Brain Sync POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to process brain sync action" },
      { status: 500 }
    );
  }
}
