"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DuelBattleArena from "@/components/duels/DuelBattleArena";
import DuelResults from "@/components/duels/DuelResults";

/**
 * 🎮 BATTLE PAGE
 * Where duels are fought!
 */

interface Duel {
  id: string;
  challenger: {
    id: string;
    name: string;
    image: string | null;
  };
  opponent: {
    id: string;
    name: string;
    image: string | null;
  };
  book: {
    id: string;
    title: string;
  };
  xpBet: number;
  coinBet: number;
  questions: Array<{
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: number;
  }>;
  challengerScore: number | null;
  opponentScore: number | null;
  winnerId: string | null;
  status: string;
}

export default function BattlePage() {
  const params = useParams();
  const duelId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [duel, setDuel] = useState<Duel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => {
    loadDuel();
  }, [duelId]);

  const loadDuel = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/duels/${duelId}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load duel");
      }

      const data = await res.json();
      setDuel(data.duel);

      // Check if duel is completed
      if (
        data.duel.status === "COMPLETED" &&
        data.duel.challengerScore !== null &&
        data.duel.opponentScore !== null
      ) {
        setShowResults(true);
        setMyScore(data.duel.challengerScore); // You can determine which score is "yours" based on session
        setOpponentScore(data.duel.opponentScore);
      }
    } catch (err: any) {
      console.error("Failed to load duel:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBattleComplete = async (
    finalScore: number,
    answers: number[]
  ) => {
    try {
      // Submit results to API
      const res = await fetch(`/api/duels/${duelId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          totalTime: 300, // 5 minutes total (60s per question)
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit results");
      }

      const data = await res.json();

      setMyScore(finalScore);
      setOpponentScore(data.opponentScore || 0);

      // If both players finished, show results
      if (data.isComplete) {
        setShowResults(true);
      } else {
        // Waiting for opponent
        alert("Results submitted! Waiting for your opponent to finish...");
        window.location.href = "/duels";
      }
    } catch (err) {
      console.error("Failed to submit results:", err);
      alert("Error submitting results. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300 text-lg">Loading battle arena...</p>
        </div>
      </div>
    );
  }

  if (error || !duel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">
            {error || "Duel not found"}
          </p>
          <button
            onClick={() => (window.location.href = "/duels")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
          >
            Back to Duels
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <DuelResults
        myScore={myScore}
        opponentScore={opponentScore}
        myName="You" // TODO: Get from session
        opponentName={duel.opponent.name}
        bookTitle={duel.book.title}
        xpEarned={myScore > opponentScore ? duel.xpBet * 2 : 0}
        coinsEarned={Math.floor(myScore / 10)}
        onRematch={() => {
          // TODO: Implement rematch
          window.location.href = "/duels";
        }}
        onNewChallenge={() => {
          window.location.href = "/duels";
        }}
      />
    );
  }

  return (
    <DuelBattleArena
      questions={duel.questions.map((q) => ({
        question: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }))}
      myName="You" // TODO: Get from session
      opponentName={duel.opponent.name}
      myAvatar="/avatars/default-avatar.png" // TODO: Get from session
      opponentAvatar={duel.opponent.image || "/avatars/default-avatar.png"}
      xpBet={duel.xpBet}
      coinBet={duel.coinBet}
      onComplete={handleBattleComplete}
    />
  );
}
