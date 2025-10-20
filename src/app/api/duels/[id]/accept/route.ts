import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * ✅ POST: Accept a duel challenge
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const duelId = params.id;

    // Get the duel
    const duel = await prisma.duel.findUnique({
      where: { id: duelId },
      include: {
        challenger: {
          select: { id: true, name: true },
        },
        opponent: {
          select: { id: true, name: true },
        },
        book: {
          select: { id: true, title: true },
        },
      },
    });

    if (!duel) {
      return NextResponse.json({ error: "Duel not found" }, { status: 404 });
    }

    // Verify user is the opponent
    if (duel.opponentId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not the opponent of this duel" },
        { status: 403 }
      );
    }

    // Check if already accepted/declined
    if (duel.status !== "PENDING") {
      return NextResponse.json(
        { error: `Duel is already ${duel.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Check if expired (24 hours)
    const expiresAt = new Date(duel.createdAt.getTime() + 24 * 60 * 60 * 1000);
    if (Date.now() > expiresAt.getTime()) {
      await prisma.duel.update({
        where: { id: duelId },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Duel challenge has expired" },
        { status: 400 }
      );
    }

    // Get/Create opponent's DuelStats
    let opponentStats = await prisma.duelStats.findUnique({
      where: { userId: session.user.id },
    });

    if (!opponentStats) {
      opponentStats = await prisma.duelStats.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Check if opponent has enough XP/coins for bet
    if (duel.xpBet > 0 && opponentStats.xp < duel.xpBet) {
      return NextResponse.json(
        { error: `Insufficient XP. You have ${opponentStats.xp}, need ${duel.xpBet}` },
        { status: 400 }
      );
    }

    if (duel.coinBet > 0 && opponentStats.coins < duel.coinBet) {
      return NextResponse.json(
        { error: `Insufficient coins. You have ${opponentStats.coins}, need ${duel.coinBet}` },
        { status: 400 }
      );
    }

    // Generate questions using AI
    const questionsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/duels/generate-questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: duel.bookId,
          chapterId: duel.chapterId,
          difficulty: duel.difficulty,
        }),
      }
    );

    if (!questionsResponse.ok) {
      throw new Error("Failed to generate questions");
    }

    const { questions } = await questionsResponse.json();

    // Update duel status and create questions
    const updatedDuel = await prisma.duel.update({
      where: { id: duelId },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
        questions: {
          create: questions.map((q: any) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            questionOrder: q.questionOrder,
            difficulty: q.difficulty,
            estimatedTime: q.estimatedTime,
            pageReference: q.pageReference,
          })),
        },
      },
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
            coverImage: true,
          },
        },
        questions: true,
      },
    });

    console.log(
      `✅ Duel accepted! ${duel.opponent.name} accepted challenge from ${duel.challenger.name}`
    );

    // TODO: Send notification to challenger that duel was accepted

    return NextResponse.json({
      success: true,
      duel: updatedDuel,
      message: "Challenge accepted! Battle begins now! ⚔️",
    });
  } catch (error: any) {
    console.error("❌ Accept duel error:", error);
    return NextResponse.json(
      {
        error: "Failed to accept challenge",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * ❌ DELETE: Decline a duel challenge
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const duelId = params.id;

    // Get the duel
    const duel = await prisma.duel.findUnique({
      where: { id: duelId },
    });

    if (!duel) {
      return NextResponse.json({ error: "Duel not found" }, { status: 404 });
    }

    // Verify user is the opponent
    if (duel.opponentId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not the opponent of this duel" },
        { status: 403 }
      );
    }

    // Check if already accepted/declined
    if (duel.status !== "PENDING") {
      return NextResponse.json(
        { error: `Duel is already ${duel.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update duel status to DECLINED
    await prisma.duel.update({
      where: { id: duelId },
      data: { status: "DECLINED" },
    });

    console.log(
      `❌ Duel declined by opponent (ID: ${duel.opponentId})`
    );

    // TODO: Send notification to challenger that duel was declined

    return NextResponse.json({
      success: true,
      message: "Challenge declined",
    });
  } catch (error: any) {
    console.error("❌ Decline duel error:", error);
    return NextResponse.json(
      {
        error: "Failed to decline challenge",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
