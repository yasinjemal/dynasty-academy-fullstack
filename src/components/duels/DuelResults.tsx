"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  Star,
  TrendingUp,
  Award,
  Flame,
  Crown,
  Target,
  Brain,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface DuelResultsProps {
  myScore: number;
  opponentScore: number;
  answersCorrect: number;
  totalQuestions: number;
  totalTime: number;
  xpEarned: number;
  coinsEarned: number;
  isVictory: boolean;
  streak?: number;
  perfectGame?: boolean;
  newRank?: number;
  oldRank?: number;
  achievements?: string[];
  opponentName: string;
  bookTitle: string;
  onRematch?: () => void;
  onNewChallenge?: () => void;
  onViewStats?: () => void;
}

export default function DuelResults({
  myScore,
  opponentScore,
  answersCorrect,
  totalQuestions,
  totalTime,
  xpEarned,
  coinsEarned,
  isVictory,
  streak = 0,
  perfectGame = false,
  newRank,
  oldRank,
  achievements = [],
  opponentName,
  bookTitle,
  onRematch,
  onNewChallenge,
  onViewStats,
}: DuelResultsProps) {
  // Fire confetti on victory
  useEffect(() => {
    if (isVictory) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#9333ea", "#ec4899", "#f59e0b"],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#9333ea", "#ec4899", "#f59e0b"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isVictory]);

  const accuracy = Math.round((answersCorrect / totalQuestions) * 100);
  const scoreDifference = Math.abs(myScore - opponentScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1047] to-[#0A0E27] relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(to right, #8b5cf6 1px, transparent 1px),
            linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          {isVictory ? (
            <>
              {/* Victory Animation */}
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative inline-block mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 blur-3xl opacity-50 animate-pulse" />
                <div className="relative">
                  <Trophy className="w-32 h-32 text-yellow-400 mx-auto drop-shadow-2xl" />
                  {perfectGame && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 360] }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                    >
                      <Crown className="w-8 h-8 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4"
              >
                VICTORY!
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl text-white/80"
              >
                You crushed {opponentName}! 🔥
              </motion.p>
            </>
          ) : (
            <>
              {/* Defeat */}
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-32 h-32 mx-auto mb-6 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-2xl opacity-30" />
                <Target className="w-full h-full text-cyan-400 relative" />
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-4"
              >
                DEFEATED
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl text-white/80"
              >
                {opponentName} was stronger this time
              </motion.p>
            </>
          )}
        </motion.div>

        {/* Score Comparison */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-6 mb-8"
        >
          {/* Your Score */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-3xl p-6 text-center">
            <div className="text-purple-300 text-sm mb-2 font-bold">
              YOUR SCORE
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2"
            >
              {myScore}
            </motion.div>
            <div className="text-white/60 text-xs">
              {answersCorrect}/{totalQuestions} correct • {accuracy}%
            </div>
          </div>

          {/* Difference */}
          <div className="backdrop-blur-xl bg-white/5 border-2 border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
            <div
              className={`text-4xl font-black ${
                isVictory ? "text-green-400" : "text-red-400"
              }`}
            >
              {isVictory ? "+" : "-"}
              {scoreDifference}
            </div>
            <div className="text-white/60 text-xs mt-1">Point difference</div>
          </div>

          {/* Opponent Score */}
          <div className="backdrop-blur-xl bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-center">
            <div className="text-white/60 text-sm mb-2 font-bold">
              {opponentName.toUpperCase()}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="text-6xl font-black text-white/40 mb-2"
            >
              {opponentScore}
            </motion.div>
            <div className="text-white/40 text-xs">Opponent's score</div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {/* XP Earned */}
          <div className="backdrop-blur-xl bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-white/80 text-sm">XP Earned</span>
            </div>
            <div className="text-3xl font-black text-purple-400">
              +{xpEarned}
            </div>
          </div>

          {/* Coins Earned */}
          <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white/80 text-sm">Coins</span>
            </div>
            <div className="text-3xl font-black text-yellow-400">
              +{coinsEarned}
            </div>
          </div>

          {/* Time */}
          <div className="backdrop-blur-xl bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-white/80 text-sm">Time</span>
            </div>
            <div className="text-3xl font-black text-cyan-400">
              {Math.floor(totalTime / 60)}:
              {String(totalTime % 60).padStart(2, "0")}
            </div>
          </div>

          {/* Accuracy */}
          <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-white/80 text-sm">Accuracy</span>
            </div>
            <div className="text-3xl font-black text-green-400">
              {accuracy}%
            </div>
          </div>
        </motion.div>

        {/* Achievements & Bonuses */}
        {(perfectGame ||
          streak > 2 ||
          achievements.length > 0 ||
          (newRank && oldRank)) && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-3xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-400" />
              Achievements & Bonuses
            </h3>

            <div className="space-y-3">
              {perfectGame && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3"
                >
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-white font-bold">PERFECT GAME!</div>
                    <div className="text-yellow-300 text-sm">
                      All answers correct! +500 XP Bonus
                    </div>
                  </div>
                </motion.div>
              )}

              {streak > 2 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="flex items-center gap-3 bg-orange-500/20 border border-orange-500/30 rounded-xl p-3"
                >
                  <Flame className="w-8 h-8 text-orange-400" />
                  <div>
                    <div className="text-white font-bold">
                      {streak} ANSWER STREAK!
                    </div>
                    <div className="text-orange-300 text-sm">
                      On fire! +{streak * 50} XP Bonus
                    </div>
                  </div>
                </motion.div>
              )}

              {newRank && oldRank && newRank !== oldRank && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center gap-3 bg-purple-500/20 border border-purple-500/30 rounded-xl p-3"
                >
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-white font-bold">RANK UP!</div>
                    <div className="text-purple-300 text-sm">
                      #{oldRank} → #{newRank} on the leaderboard!
                    </div>
                  </div>
                </motion.div>
              )}

              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="flex items-center gap-3 bg-blue-500/20 border border-blue-500/30 rounded-xl p-3"
                >
                  <Award className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-white font-bold">NEW ACHIEVEMENT!</div>
                    <div className="text-blue-300 text-sm">{achievement}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {onRematch && (
            <Button
              onClick={onRematch}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Flame className="w-5 h-5 mr-2" />
              Rematch
            </Button>
          )}

          {onNewChallenge && (
            <Button
              onClick={onNewChallenge}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Brain className="w-5 h-5 mr-2" />
              New Challenge
            </Button>
          )}

          {onViewStats && (
            <Button
              onClick={onViewStats}
              variant="outline"
              className="border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-6 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Stats
            </Button>
          )}
        </motion.div>

        {/* Share Victory */}
        {isVictory && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-6"
          >
            <p className="text-white/60 text-sm mb-3">Share your victory!</p>
            <div className="flex justify-center gap-3">
              <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                𝕏
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                📘
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                💬
              </button>
            </div>
          </motion.div>
        )}

        {/* Book Context */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-8 text-white/40 text-sm"
        >
          <p>Book: {bookTitle}</p>
        </motion.div>
      </div>
    </div>
  );
}
