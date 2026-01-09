import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

// Brain Sync Session model (stored in memory for now)
interface BrainSyncSession {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  hostImage?: string;
  contentType: "book" | "course" | "lesson";
  contentId: string;
  contentTitle: string;
  contentImage?: string;
  contentSlug: string;
  maxParticipants: number;
  level: string;
  isPrivate: boolean;
  voiceEnabled: boolean;
  participants: string[]; // User IDs
  tags: string[];
  createdAt: Date;
  lastActivityAt: Date;
  status: "active" | "ended";
}

// Declare global type for session store
declare global {
  // eslint-disable-next-line no-var
  var brainSyncSessionStore: BrainSyncSession[] | undefined;
}

// Get sessions from global store
function getSessions(): BrainSyncSession[] {
  if (!global.brainSyncSessionStore) {
    global.brainSyncSessionStore = [];
  }
  return global.brainSyncSessionStore;
}

// GET - Fetch active Brain Sync sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const level = searchParams.get("level");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    // Use our helper to get sessions
    const activeSessions = getSessions();

    let filteredSessions = activeSessions.filter((s) => s.status === "active");

    // Apply filters
    if (level && level !== "all") {
      filteredSessions = filteredSessions.filter((s) => s.level === level);
    }

    if (type && type !== "all") {
      filteredSessions = filteredSessions.filter((s) => s.contentType === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredSessions = filteredSessions.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.contentTitle.toLowerCase().includes(searchLower) ||
          s.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    // Sort by activity
    filteredSessions.sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime()
    );

    // Get stats
    const stats = {
      learnersOnline: new Set(activeSessions.flatMap((s) => s.participants))
        .size,
      activeSessions: activeSessions.filter((s) => s.status === "active")
        .length,
      knowledgeShared: activeSessions.length * 15, // Placeholder metric
    };

    return NextResponse.json({
      sessions: filteredSessions.map((s) => ({
        ...s,
        participantCount: s.participants.length,
        isJoinable:
          s.participants.length < s.maxParticipants &&
          (!session?.user?.id || !s.participants.includes(session.user.id)),
      })),
      stats,
    });
  } catch (error) {
    console.error("Error fetching Brain Sync sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new Brain Sync session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("🔐 Session for POST:", session?.user?.email);

    if (!session?.user?.id) {
      console.error("❌ No session user ID - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📝 Creating Brain Sync session with body:", body);

    const {
      name,
      contentType,
      contentId,
      maxParticipants = 10,
      level = "all",
      isPrivate = false,
      voiceEnabled = true,
      tags = [],
    } = body;

    // Validate content exists
    let content: {
      title: string;
      coverImage: string | null;
      slug: string;
    } | null = null;

    if (contentType === "book") {
      const book = await prisma.book.findUnique({
        where: { id: contentId },
        select: { title: true, coverImage: true, slug: true },
      });
      content = book;
      console.log("📚 Found book:", book?.title, "slug:", book?.slug);
    } else if (contentType === "course") {
      const course = await prisma.courses.findUnique({
        where: { id: contentId },
        select: { title: true, coverImage: true, slug: true },
      });
      content = course;
      console.log("📖 Found course:", course?.title, "slug:", course?.slug);
    }

    if (!content) {
      console.error("❌ Content not found for id:", contentId);
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true },
    });

    // Create session
    const newSession: BrainSyncSession = {
      id: crypto.randomUUID(),
      name: name || `${content.title} Study Session`,
      hostId: session.user.id,
      hostName: user?.name || "Anonymous",
      hostImage: user?.image || undefined,
      contentType,
      contentId,
      contentTitle: content.title,
      contentImage: content.coverImage || undefined,
      contentSlug: content.slug,
      maxParticipants,
      level,
      isPrivate,
      voiceEnabled,
      participants: [session.user.id],
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      lastActivityAt: new Date(),
      status: "active",
    };

    // Store in global (in production, use Redis/database)
    const sessions = getSessions();
    sessions.push(newSession);
    global.brainSyncSessionStore = sessions;

    console.log("✅ Session created:", {
      id: newSession.id,
      contentTitle: newSession.contentTitle,
      contentSlug: newSession.contentSlug,
    });

    return NextResponse.json({
      session: newSession,
      roomUrl: `/brain-sync/room/${newSession.id}`,
    });
  } catch (error) {
    console.error("Error creating Brain Sync session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
