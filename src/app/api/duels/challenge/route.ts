import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * 🎯⚔️ DUEL CHALLENGE API
 * Create and manage duel challenges
 */

export async function POST(req: NextRequest) {
  try {
    // 🔐 Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      opponentId,
      bookId,
      chapterId,
      xpBet = 0,
      coinBet = 0,
      difficulty = "medium",
    } = body;

    // Validation
    if (!opponentId || !bookId) {
      return NextResponse.json(
        { error: "opponentId and bookId are required" },
        { status: 400 }
      );
    }

    if (opponentId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot challenge yourself!" },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if opponent exists
    const opponent = await prisma.user.findUnique({
      where: { id: opponentId },
      select: { id: true, name: true, email: true },
    });

    if (!opponent) {
      return NextResponse.json(
        { error: "Opponent not found" },
        { status: 404 }
      );
    }

    // Get/Create DuelStats for challenger
    let challengerStats = await prisma.duelStats.findUnique({
      where: { userId: session.user.id },
    });

    if (!challengerStats) {
      challengerStats = await prisma.duelStats.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Check if challenger has enough XP/coins for bet
    if (xpBet > 0 && challengerStats.xp < xpBet) {
      return NextResponse.json(
        { error: `Insufficient XP. You have ${challengerStats.xp}, need ${xpBet}` },
        { status: 400 }
      );
    }

    if (coinBet > 0 && challengerStats.coins < coinBet) {
      return NextResponse.json(
        { error: `Insufficient coins. You have ${challengerStats.coins}, need ${coinBet}` },
        { status: 400 }
      );
    }

    // Check for existing pending duel between same users for same book
    const existingDuel = await prisma.duel.findFirst({
      where: {
        challengerId: session.user.id,
        opponentId,
        bookId,
        status: "PENDING",
      },
    });

    if (existingDuel) {
      return NextResponse.json(
        { error: "You already have a pending duel with this user for this book" },
        { status: 400 }
      );
    }

    // Create the duel challenge
    const duel = await prisma.duel.create({
      data: {
        challengerId: session.user.id,
        opponentId,
        bookId,
        chapterId,
        xpBet,
        coinBet,
        difficulty,
        status: "PENDING",
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
      },
    });

    // TODO: Send notification to opponent
    // await sendDuelChallengeNotification(opponentId, duel);

    console.log(
      `⚔️ Duel created! ${session.user.name} challenged ${opponent.name} in "${book.title}"`
    );

    return NextResponse.json({
      success: true,
      duel,
      message: `Challenge sent to ${opponent.name}!`,
    });
  } catch (error: any) {
    console.error("❌ Challenge creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create challenge",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 📋 GET: Get user's pending challenges
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "received"; // received, sent, all

    let where: any = {
      status: "PENDING",
    };

    if (type === "received") {
      where.opponentId = session.user.id;
    } else if (type === "sent") {
      where.challengerId = session.user.id;
    } else {
      // all
      where.OR = [
        { opponentId: session.user.id },
        { challengerId: session.user.id },
      ];
    }

    const challenges = await prisma.duel.findMany({
      where,
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
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Add "expiresAt" field (24 hours from creation)
    const enhancedChallenges = challenges.map((duel) => ({
      ...duel,
      expiresAt: new Date(duel.createdAt.getTime() + 24 * 60 * 60 * 1000),
      hoursRemaining: Math.max(
        0,
        Math.floor(
          (duel.createdAt.getTime() + 24 * 60 * 60 * 1000 - Date.now()) /
            (1000 * 60 * 60)
        )
      ),
    }));

    return NextResponse.json({
      success: true,
      challenges: enhancedChallenges,
      count: enhancedChallenges.length,
    });
  } catch (error: any) {
    console.error("❌ Get challenges error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch challenges",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
