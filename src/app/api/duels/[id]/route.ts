import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * 🎮 GET DUEL API
 * Fetch a specific duel with all details
 */

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const duelId = params.id;

    const duel = await prisma.duel.findUnique({
      where: { id: duelId },
      include: {
        challenger: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        opponent: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        questions: {
          orderBy: {
            questionOrder: "asc",
          },
        },
      },
    });

    if (!duel) {
      return NextResponse.json({ error: "Duel not found" }, { status: 404 });
    }

    // Verify user is part of this duel
    if (
      duel.challengerId !== session.user.id &&
      duel.opponentId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You are not part of this duel" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      duel: {
        id: duel.id,
        status: duel.status,
        challenger: duel.challenger,
        opponent: duel.opponent,
        book: duel.book,
        xpBet: duel.xpBet,
        coinBet: duel.coinBet,
        challengerScore: duel.challengerScore,
        opponentScore: duel.opponentScore,
        winnerId: duel.winnerId,
        questions: duel.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options as string[],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
        })),
        createdAt: duel.createdAt,
        completedAt: duel.completedAt,
      },
    });
  } catch (error: any) {
    console.error("❌ Get duel error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch duel",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
