/**
 * 📚 RAG EMBED API
 *
 * Trigger embedding for a specific book
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

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

    // Get bookId
    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: "bookId required" }, { status: 400 });
    }

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // TODO: Trigger embedding job
    // For now, return instructions to run script manually
    return NextResponse.json({
      message: `To embed "${book.title}", run: npx tsx scripts/embed-books.ts --book-id=${bookId}`,
      bookId: book.id,
      bookTitle: book.title,
      instructions: [
        "1. Open terminal",
        `2. Run: npx tsx scripts/embed-books.ts`,
        "3. Or use a background job queue (future enhancement)",
      ],
    });
  } catch (error) {
    console.error("RAG embed error:", error);
    return NextResponse.json(
      { error: "Embed trigger failed" },
      { status: 500 }
    );
  }
}
