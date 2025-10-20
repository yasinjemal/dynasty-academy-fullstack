import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * 🏆 DUEL COMPLETION API
 * Submit answers, calculate scores, award rewards, update rankings
 * This is where the magic happens! ⚡
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
    const body = await req.json();
    const { answers, totalTime } = body; // answers: number[], totalTime: number (seconds)

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers array is required" },
        { status: 400 }
      );
    }

    // Get the duel with questions
    const duel = await prisma.duel.findUnique({
      where: { id: duelId },
      include: {
        questions: {
          orderBy: { questionOrder: "asc" },
        },
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
      },
    });

    if (!duel) {
      return NextResponse.json({ error: "Duel not found" }, { status: 404 });
    }

    // Verify user is part of this duel
    const isChallenger = duel.challengerId === session.user.id;
    const isOpponent = duel.opponentId === session.user.id;

    if (!isChallenger && !isOpponent) {
      return NextResponse.json(
        { error: "You are not part of this duel" },
        { status: 403 }
      );
    }

    // Check if duel is active
    if (duel.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Duel is ${duel.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Calculate score and update questions
    let score = 0;
    let correctAnswers = 0;
    let streak = 0;
    let longestStreak = 0;
    let perfectGame = true;

    const updatedQuestions = await Promise.all(
      duel.questions.map(async (question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const timeTaken = Math.floor(totalTime / duel.questions.length) * 1000; // Rough estimate per question

        if (isCorrect) {
          correctAnswers++;
          streak++;
          longestStreak = Math.max(longestStreak, streak);

          // Calculate points
          const basePoints = 100;
          const difficultyBonus = Math.floor(question.difficulty * 50);
          const speedBonus = Math.max(0, 50 - Math.floor(timeTaken / 1000) * 5);
          const comboMultiplier = 1 + Math.min(streak - 1, 10) * 0.1;

          const questionPoints = Math.floor(
            (basePoints + difficultyBonus + speedBonus) * comboMultiplier
          );
          score += questionPoints;
        } else {
          streak = 0;
          perfectGame = false;
        }

        // Update question with user's answer
        const updateData = isChallenger
          ? {
              challengerAnswer: userAnswer,
              challengerTime: timeTaken,
              challengerCorrect: isCorrect,
            }
          : {
              opponentAnswer: userAnswer,
              opponentTime: timeTaken,
              opponentCorrect: isCorrect,
            };

        return prisma.duelQuestion.update({
          where: { id: question.id },
          data: updateData,
        });
      })
    );

    // Add perfect game bonus
    if (perfectGame) {
      score += 500;
    }

    // Add streak bonus
    if (longestStreak > 2) {
      score += longestStreak * 50;
    }

    // Update duel with user's score
    const duelUpdateData = isChallenger
      ? { challengerScore: score }
      : { opponentScore: score };

    await prisma.duel.update({
      where: { id: duelId },
      data: duelUpdateData,
    });

    // Check if both players have finished
    const updatedDuel = await prisma.duel.findUnique({
      where: { id: duelId },
    });

    let isComplete = false;
    let winnerId: string | null = null;
    let xpReward = 0;
    let coinsReward = 0;

    if (
      updatedDuel?.challengerScore !== null &&
      updatedDuel?.opponentScore !== null
    ) {
      // Both players finished! Determine winner
      isComplete = true;

      const challengerScore = updatedDuel.challengerScore;
      const opponentScore = updatedDuel.opponentScore;

      if (challengerScore > opponentScore) {
        winnerId = duel.challengerId;
      } else if (opponentScore > challengerScore) {
        winnerId = duel.opponentId;
      }
      // If equal, it's a draw (winnerId stays null)

      // Update duel status
      await prisma.duel.update({
        where: { id: duelId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          winnerId,
        },
      });

      // Award rewards to winner
      if (winnerId) {
        const isWinner = winnerId === session.user.id;
        
        if (isWinner) {
          // Calculate rewards
          xpReward = score; // Base XP = score
          xpReward += duel.xpBet * 2; // Winner takes both bets
          coinsReward = Math.floor(score / 10);
          coinsReward += duel.coinBet * 2;

          // Update user's DuelStats
          await updateDuelStats(session.user.id, {
            won: true,
            score,
            xpEarned: xpReward,
            coinsEarned: coinsReward,
            perfectGame,
            longestStreak,
            totalTime,
            bookId: duel.bookId,
          });

          // Update loser's stats
          const loserId = winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
          await updateDuelStats(loserId, {
            won: false,
            score: winnerId === duel.challengerId ? opponentScore : challengerScore,
            xpEarned: 0,
            coinsEarned: 0,
            perfectGame: false,
            longestStreak: 0,
            totalTime,
            bookId: duel.bookId,
          });

          // Deduct bets from loser
          const loserStats = await prisma.duelStats.findUnique({
            where: { userId: loserId },
          });

          if (loserStats) {
            await prisma.duelStats.update({
              where: { userId: loserId },
              data: {
                xp: Math.max(0, loserStats.xp - duel.xpBet),
                coins: Math.max(0, loserStats.coins - duel.coinBet),
                totalXpLost: loserStats.totalXpLost + duel.xpBet,
              },
            });
          }
        }
      } else {
        // Draw - return bets, small XP reward
        xpReward = Math.floor(score / 2);
        coinsReward = Math.floor(score / 20);

        await updateDuelStats(session.user.id, {
          won: null, // Draw
          score,
          xpEarned: xpReward,
          coinsEarned: coinsReward,
          perfectGame,
          longestStreak,
          totalTime,
          bookId: duel.bookId,
        });
      }

      // TODO: Send notifications to both players
      // await sendDuelCompletionNotification(duel.challengerId, duel.opponentId, winnerId);
    } else {
      // Only one player finished, just save their score
      xpReward = 0; // No reward until both finish
      coinsReward = 0;
    }

    console.log(
      `✅ Duel progress saved! User: ${session.user.name}, Score: ${score}, Correct: ${correctAnswers}/${duel.questions.length}`
    );

    return NextResponse.json({
      success: true,
      score,
      correctAnswers,
      totalQuestions: duel.questions.length,
      accuracy: Math.round((correctAnswers / duel.questions.length) * 100),
      perfectGame,
      longestStreak,
      isComplete,
      isWinner: winnerId === session.user.id,
      isDraw: isComplete && !winnerId,
      xpReward,
      coinsReward,
      opponentScore: isComplete
        ? isChallenger
          ? updatedDuel?.opponentScore
          : updatedDuel?.challengerScore
        : null,
    });
  } catch (error: any) {
    console.error("❌ Duel completion error:", error);
    return NextResponse.json(
      {
        error: "Failed to complete duel",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 📊 Update user's duel statistics
 */
async function updateDuelStats(
  userId: string,
  data: {
    won: boolean | null; // true = win, false = loss, null = draw
    score: number;
    xpEarned: number;
    coinsEarned: number;
    perfectGame: boolean;
    longestStreak: number;
    totalTime: number;
    bookId: string;
  }
) {
  // Get or create DuelStats
  let stats = await prisma.duelStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    stats = await prisma.duelStats.create({
      data: { userId },
    });
  }

  // Calculate new values
  const totalDuels = stats.totalDuels + 1;
  const wins = data.won === true ? stats.wins + 1 : stats.wins;
  const losses = data.won === false ? stats.losses + 1 : stats.losses;
  const draws = data.won === null ? stats.draws + 1 : stats.draws;

  // Update streak
  let currentStreak = stats.currentStreak;
  if (data.won === true) {
    currentStreak++;
  } else if (data.won === false) {
    currentStreak = 0;
  }
  const longestStreak = Math.max(stats.longestStreak, currentStreak);

  // Update XP and determine tier
  const newXP = stats.xp + data.xpEarned;
  const newTier = calculateTier(newXP);

  // Calculate rank (this would need a more complex query in production)
  // For now, we'll set it to null and calculate it separately
  const rank = null;

  // Update performance metrics
  const perfectGames = data.perfectGame
    ? stats.perfectGames + 1
    : stats.perfectGames;
  const fastestWin =
    data.won && (!stats.fastestWin || data.totalTime < stats.fastestWin)
      ? data.totalTime
      : stats.fastestWin;
  const highestScore = Math.max(stats.highestScore, data.score);

  // Update book-specific stats
  const bookStats = (stats.bookStats as any) || {};
  if (!bookStats[data.bookId]) {
    bookStats[data.bookId] = {
      totalDuels: 0,
      wins: 0,
      losses: 0,
      avgScore: 0,
      totalScore: 0,
    };
  }
  bookStats[data.bookId].totalDuels++;
  if (data.won === true) bookStats[data.bookId].wins++;
  if (data.won === false) bookStats[data.bookId].losses++;
  bookStats[data.bookId].totalScore += data.score;
  bookStats[data.bookId].avgScore = Math.floor(
    bookStats[data.bookId].totalScore / bookStats[data.bookId].totalDuels
  );

  // Update stats
  await prisma.duelStats.update({
    where: { userId },
    data: {
      totalDuels,
      wins,
      losses,
      draws,
      currentStreak,
      longestStreak,
      lastDuelAt: new Date(),
      rank,
      tier: newTier,
      xp: newXP,
      coins: stats.coins + data.coinsEarned,
      perfectGames,
      fastestWin,
      highestScore,
      totalXpEarned: stats.totalXpEarned + data.xpEarned,
      bookStats,
    },
  });

  // Update global rank asynchronously (not blocking)
  updateGlobalRank(userId).catch((err) =>
    console.error("Failed to update rank:", err)
  );

  return true;
}

/**
 * 🏆 Calculate tier based on XP
 */
function calculateTier(xp: number): string {
  if (xp >= 50000) return "LEGEND";
  if (xp >= 20000) return "MASTER";
  if (xp >= 10000) return "DIAMOND";
  if (xp >= 6000) return "PLATINUM";
  if (xp >= 3000) return "GOLD";
  if (xp >= 1000) return "SILVER";
  return "BRONZE";
}

/**
 * 📊 Update user's global rank
 */
async function updateGlobalRank(userId: string) {
  // Get all users ordered by XP
  const allStats = await prisma.duelStats.findMany({
    orderBy: { xp: "desc" },
    select: { userId: true },
  });

  // Find user's rank
  const rank = allStats.findIndex((s) => s.userId === userId) + 1;

  if (rank > 0) {
    await prisma.duelStats.update({
      where: { userId },
      data: { rank },
    });
  }
}
