import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// ============================================
// SENTENCE HIGHLIGHTS API
// Multi-device sync for highlighted sentences
// ============================================

// Validation schema
const highlightSchema = z.object({
  bookId: z.string(),
  chapterNumber: z.number().int().min(1),
  sentenceIndex: z.number().int().min(0),
  sentenceText: z.string().min(1),
  color: z.string().default("#FFD700"),
  note: z.string().optional(),
});

// POST /api/listening/highlights - Save highlight
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = highlightSchema.parse(body);

    // Verify book exists and user has access
    const book = await prisma.book.findUnique({
      where: { id: data.bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if user owns book (has purchased or it's free)
    if (!book.isFree) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: session.user.id,
          bookId: data.bookId,
        },
      });

      if (!purchase) {
        return NextResponse.json(
          { error: "You must purchase this book to highlight sentences" },
          { status: 403 }
        );
      }
    }

    // Create or update highlight
    const highlight = await prisma.sentenceHighlight.upsert({
      where: {
        userId_bookId_chapterNumber_sentenceIndex: {
          userId: session.user.id,
          bookId: data.bookId,
          chapterNumber: data.chapterNumber,
          sentenceIndex: data.sentenceIndex,
        },
      },
      update: {
        sentenceText: data.sentenceText,
        color: data.color,
        note: data.note,
      },
      create: {
        userId: session.user.id,
        bookId: data.bookId,
        chapterNumber: data.chapterNumber,
        sentenceIndex: data.sentenceIndex,
        sentenceText: data.sentenceText,
        color: data.color,
        note: data.note,
      },
    });

    // 🎉 SURPRISE: Check for highlighter achievement (30 Dynasty Points!)
    await checkHighlighterAchievement(session.user.id);

    return NextResponse.json({
      success: true,
      highlight,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[Highlights API] Save error:", error);
    return NextResponse.json(
      { error: "Failed to save highlight" },
      { status: 500 }
    );
  }
}

// GET /api/listening/highlights?bookId=xxx&chapterNumber=1
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const chapterNumber = searchParams.get("chapterNumber");

    const where: any = {
      userId: session.user.id,
    };

    if (bookId) where.bookId = bookId;
    if (chapterNumber) where.chapterNumber = parseInt(chapterNumber, 10);

    const highlights = await prisma.sentenceHighlight.findMany({
      where,
      orderBy: [{ chapterNumber: "asc" }, { sentenceIndex: "asc" }],
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
    });

    return NextResponse.json({
      highlights,
      count: highlights.length,
    });
  } catch (error) {
    console.error("[Highlights API] Load error:", error);
    return NextResponse.json(
      { error: "Failed to load highlights" },
      { status: 500 }
    );
  }
}

// DELETE /api/listening/highlights?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Highlight ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const highlight = await prisma.sentenceHighlight.findUnique({
      where: { id },
    });

    if (!highlight) {
      return NextResponse.json(
        { error: "Highlight not found" },
        { status: 404 }
      );
    }

    if (highlight.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.sentenceHighlight.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Highlight removed",
    });
  } catch (error) {
    console.error("[Highlights API] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete highlight" },
      { status: 500 }
    );
  }
}

// ============================================
// 🎉 SURPRISE HELPER: Auto-unlock achievement
// ============================================

async function checkHighlighterAchievement(userId: string) {
  try {
    // Count user's total highlights
    const highlightCount = await prisma.sentenceHighlight.count({
      where: { userId },
    });

    // Unlock "highlighter" achievement if 10+ highlights (30 Dynasty Points!)
    if (highlightCount >= 10) {
      const achievement = await prisma.achievement.findUnique({
        where: { key: "highlighter" },
      });

      if (!achievement) return;

      // Check if already unlocked
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (existing) return; // Already unlocked

      // 🏆 UNLOCK ACHIEVEMENT!
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: highlightCount,
        },
      });

      // Award Dynasty Points
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: achievement.dynastyPoints },
        },
      });

      console.log(
        `🎨 Achievement unlocked: "highlighter" (+${achievement.dynastyPoints} Dynasty Points!)`
      );
    }
  } catch (error) {
    console.error("[Highlights API] Achievement check failed:", error);
    // Don't throw - achievement is bonus feature
  }
}
