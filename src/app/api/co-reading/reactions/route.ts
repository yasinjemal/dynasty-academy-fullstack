import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schema
const reactionSchema = z.object({
  bookId: z.string().min(1),
  bookSlug: z.string().min(1),
  page: z.number().int().positive(),
  emote: z.string().min(1).max(10), // Allow emoji
});

// GET: Load all reactions for a specific page
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const page = searchParams.get("page");

    if (!bookId || !page) {
      return NextResponse.json(
        { error: "Missing bookId or page" },
        { status: 400 }
      );
    }

    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum)) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }

    // Load all reactions for this page
    const reactions = await prisma.pageReaction.findMany({
      where: {
        bookId,
        page: pageNum,
      },
      orderBy: {
        count: "desc",
      },
    });

    return NextResponse.json({
      reactions: reactions.map((r) => ({
        emote: r.emote,
        count: r.count,
        userIds: r.userIds,
      })),
    });
  } catch (error) {
    console.error("[GET /api/co-reading/reactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to load reactions" },
      { status: 500 }
    );
  }
}

// POST: Add or remove a reaction
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = reactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { bookId, bookSlug, page, emote } = validation.data;
    const userId = session.user.id;

    // Check if reaction already exists
    const existingReaction = await prisma.pageReaction.findUnique({
      where: {
        bookId_page_emote: {
          bookId,
          page,
          emote,
        },
      },
    });

    if (existingReaction) {
      // Check if user already reacted
      const userAlreadyReacted = existingReaction.userIds.includes(userId);

      if (userAlreadyReacted) {
        // REMOVE reaction (toggle off)
        const updatedUserIds = existingReaction.userIds.filter(
          (id) => id !== userId
        );

        if (updatedUserIds.length === 0) {
          // Delete reaction if no users left
          await prisma.pageReaction.delete({
            where: {
              id: existingReaction.id,
            },
          });

          return NextResponse.json({
            action: "removed",
            emote,
            count: 0,
            userIds: [],
          });
        } else {
          // Update count and userIds
          const updated = await prisma.pageReaction.update({
            where: {
              id: existingReaction.id,
            },
            data: {
              count: updatedUserIds.length,
              userIds: updatedUserIds,
            },
          });

          return NextResponse.json({
            action: "removed",
            emote: updated.emote,
            count: updated.count,
            userIds: updated.userIds,
          });
        }
      } else {
        // ADD user to reaction
        const updatedUserIds = [...existingReaction.userIds, userId];

        const updated = await prisma.pageReaction.update({
          where: {
            id: existingReaction.id,
          },
          data: {
            count: updatedUserIds.length,
            userIds: updatedUserIds,
          },
        });

        return NextResponse.json({
          action: "added",
          emote: updated.emote,
          count: updated.count,
          userIds: updated.userIds,
        });
      }
    } else {
      // CREATE new reaction
      const newReaction = await prisma.pageReaction.create({
        data: {
          bookId,
          bookSlug,
          page,
          emote,
          count: 1,
          userIds: [userId],
        },
      });

      return NextResponse.json({
        action: "added",
        emote: newReaction.emote,
        count: newReaction.count,
        userIds: newReaction.userIds,
      });
    }
  } catch (error) {
    console.error("[POST /api/co-reading/reactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to save reaction" },
      { status: 500 }
    );
  }
}
