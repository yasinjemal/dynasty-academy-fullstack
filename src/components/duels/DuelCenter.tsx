"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Swords,
  Trophy,
  Flame,
  Zap,
  ChevronRight,
  Crown,
  Target,
  TrendingUp,
  Star,
  Medal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 🎮 DUEL CENTER - Dashboard Widget
 * Your command center for epic knowledge battles!
 */

interface DuelChallenge {
  id: string;
  challenger: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
  book: {
    id: string;
    title: string;
  };
  xpBet: number;
  coinBet: number;
  hoursRemaining: number;
}

interface DuelStats {
  tier: string;
  xp: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  rank: number | null;
  totalDuels: number;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    image: string | null;
    username: string | null;
  };
  tier: string;
  xp: number;
  winRate: number;
}

export default function DuelCenter() {
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<DuelChallenge[]>([]);
  const [stats, setStats] = useState<DuelStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadDuelData();
  }, []);

  const loadDuelData = async () => {
    try {
      setLoading(true);

      // Load pending challenges
      const challengesRes = await fetch("/api/duels/challenge?type=received");
      if (challengesRes.ok) {
        const challengesData = await challengesRes.json();
        setChallenges(challengesData.challenges?.slice(0, 3) || []);
      }

      // Load user stats
      const statsRes = await fetch("/api/duels/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Load top 5 leaderboard
      const leaderboardRes = await fetch(
        "/api/duels/leaderboard?type=global&limit=5"
      );
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.leaderboard || []);
      }
    } catch (error) {
      console.error("Failed to load duel data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/duels/${challengeId}/accept`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        // Navigate to battle arena
        window.location.href = `/duels/${challengeId}/battle`;
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to accept challenge");
      }
    } catch (error) {
      console.error("Failed to accept challenge:", error);
      alert("Something went wrong");
    }
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/duels/${challengeId}/accept`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadDuelData(); // Reload
      }
    } catch (error) {
      console.error("Failed to decline challenge:", error);
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      BRONZE: "from-amber-600 to-amber-800",
      SILVER: "from-gray-400 to-gray-600",
      GOLD: "from-yellow-400 to-yellow-600",
      PLATINUM: "from-cyan-400 to-cyan-600",
      DIAMOND: "from-blue-400 to-blue-600",
      MASTER: "from-purple-400 to-purple-600",
      LEGEND: "from-red-500 via-pink-500 to-purple-500",
    };
    return colors[tier] || "from-gray-500 to-gray-700";
  };

  const getTierIcon = (tier: string) => {
    if (tier === "LEGEND") return Crown;
    if (tier === "MASTER" || tier === "DIAMOND") return Star;
    if (tier === "PLATINUM" || tier === "GOLD") return Trophy;
    return Medal;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-purple-500/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-purple-500/30 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20 p-6 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Dynasty Duels
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </h2>
              <p className="text-sm text-purple-300">
                Battle for knowledge supremacy
              </p>
            </div>
          </div>

          {stats && (
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getTierColor(
                  stats.tier
                )} text-white font-bold text-sm`}
              >
                {(() => {
                  const Icon = getTierIcon(stats.tier);
                  return <Icon className="w-4 h-4" />;
                })()}
                {stats.tier}
              </div>
              {stats.rank && (
                <p className="text-xs text-purple-300 mt-1">
                  Rank #{stats.rank}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Pending Challenges */}
        {challenges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" />
                Incoming Challenges
                <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs">
                  {challenges.length}
                </span>
              </h3>
            </div>

            <div className="space-y-3">
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-4 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          challenge.challenger.image ||
                          "/avatars/default-avatar.png"
                        }
                        alt={challenge.challenger.name}
                        className="w-12 h-12 rounded-full border-2 border-purple-500"
                      />
                      <div>
                        <p className="font-semibold text-white">
                          {challenge.challenger.name}
                        </p>
                        <p className="text-sm text-purple-300">
                          {challenge.book.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-yellow-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {challenge.xpBet} XP
                          </span>
                          <span className="text-xs text-purple-300">
                            {challenge.hoursRemaining}h left
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineChallenge(challenge.id)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptChallenge(challenge.id)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Your Stats */}
        {stats && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Your Stats
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
                <p className="text-sm text-green-300">Wins</p>
                <p className="text-3xl font-bold text-white">{stats.wins}</p>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-4 border border-red-500/30">
                <p className="text-sm text-red-300">Losses</p>
                <p className="text-3xl font-bold text-white">{stats.losses}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 border border-yellow-500/30">
                <p className="text-sm text-yellow-300 flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  Streak
                </p>
                <p className="text-3xl font-bold text-white">
                  {stats.currentStreak}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                <p className="text-sm text-purple-300 flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  XP
                </p>
                <p className="text-3xl font-bold text-white">
                  {stats.xp.toLocaleString()}
                </p>
              </div>
            </div>

            {stats.totalDuels > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-purple-300">
                  Win Rate:{" "}
                  <span className="text-white font-bold">
                    {Math.round((stats.wins / stats.totalDuels) * 100)}%
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Top 5 Leaderboard Preview */}
        {leaderboard.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Top Duelists
            </h3>

            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3 border border-purple-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        entry.rank === 1
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                          : entry.rank === 2
                          ? "bg-gradient-to-br from-gray-400 to-gray-600"
                          : entry.rank === 3
                          ? "bg-gradient-to-br from-amber-600 to-amber-800"
                          : "bg-slate-700"
                      }`}
                    >
                      <span className="text-white font-bold text-sm">
                        {entry.rank}
                      </span>
                    </div>
                    <img
                      src={entry.user.image || "/avatars/default-avatar.png"}
                      alt={entry.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {entry.user.name}
                      </p>
                      <p className="text-xs text-purple-300">
                        {entry.tier} • {entry.winRate}% WR
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-400">
                      {entry.xp.toLocaleString()} XP
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-purple-500/20">
          <Button
            onClick={() => (window.location.href = "/duels")}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
          >
            <Swords className="w-4 h-4 mr-2" />
            Start Duel
          </Button>

          <Button
            onClick={() => (window.location.href = "/duels/leaderboard")}
            variant="outline"
            className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
