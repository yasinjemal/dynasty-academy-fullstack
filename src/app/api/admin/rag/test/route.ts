/**
 * 🧪 RAG TEST API
 *
 * Test semantic search for admin dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { searchSimilarContent } from "@/lib/embeddings";

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

    // Get query
    const { query } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // Search
    const results = await searchSimilarContent(query, {
      matchThreshold: 0.6, // Lower threshold for testing
      matchCount: 5,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("RAG test error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
