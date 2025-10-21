/**
 * 🗑️ RAG DELETE API
 *
 * Delete embeddings for specific content
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { deleteEmbeddings } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get params
    const { contentType, contentId } = await request.json();

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: "contentType and contentId required" },
        { status: 400 }
      );
    }

    // Delete
    const result = await deleteEmbeddings(contentType, contentId);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Delete failed", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("RAG delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
