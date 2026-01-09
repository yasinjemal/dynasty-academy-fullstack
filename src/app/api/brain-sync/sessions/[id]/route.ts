"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface BrainSyncSession {
  id: string;
  participants: string[];
  lastActivityAt: Date;
  status: string;
}

// GET - Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessions: BrainSyncSession[] = global.brainSyncSessions || [];
    const session = sessions.find((s) => s.id === id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// POST - Join a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sessions: BrainSyncSession[] = global.brainSyncSessions || [];
    const sessionIndex = sessions.findIndex((s) => s.id === id);

    if (sessionIndex === -1) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessions[sessionIndex];

    // Check if already in session
    if (session.participants.includes(authSession.user.id)) {
      return NextResponse.json({
        session,
        roomUrl: `/brain-sync/room/${session.id}`,
        message: "Already in session",
      });
    }

    // Add user to session
    session.participants.push(authSession.user.id);
    session.lastActivityAt = new Date();

    return NextResponse.json({
      session,
      roomUrl: `/brain-sync/room/${session.id}`,
      message: "Joined successfully",
    });
  } catch (error) {
    console.error("Error joining session:", error);
    return NextResponse.json(
      { error: "Failed to join session" },
      { status: 500 }
    );
  }
}

// DELETE - Leave a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sessions: BrainSyncSession[] = global.brainSyncSessions || [];
    const sessionIndex = sessions.findIndex((s) => s.id === id);

    if (sessionIndex === -1) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessions[sessionIndex];
    session.participants = session.participants.filter(
      (p) => p !== authSession.user.id
    );
    session.lastActivityAt = new Date();

    // End session if no participants
    if (session.participants.length === 0) {
      session.status = "ended";
    }

    return NextResponse.json({
      message: "Left session",
      session,
    });
  } catch (error) {
    console.error("Error leaving session:", error);
    return NextResponse.json(
      { error: "Failed to leave session" },
      { status: 500 }
    );
  }
}

declare global {
  // eslint-disable-next-line no-var
  var brainSyncSessions: BrainSyncSession[] | undefined;
}
