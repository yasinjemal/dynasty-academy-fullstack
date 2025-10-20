"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Zap,
  TrendingUp,
  Users,
  BookOpen,
  ChevronLeft,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 🏆 LEADERBOARD PAGE
 * Where legends are ranked!
 */

interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
  tier: string;
  xp: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  perfectGames: number;
  highestScore: number;
  totalDuels: number;
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [viewType, setViewType] = useState<"global" | "tier">("global");
  const [selectedTier, setSelectedTier] = useState("BRONZE");
  const [userPosition, setUserPosition] = useState<any>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [viewType, selectedTier]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const url =
        viewType === "global"
          ? "/api/duels/leaderboard?type=global&limit=100"
          : `/api/duels/leaderboard?type=tier&tier=${selectedTier}&limit=100`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setUserPosition(data.userPosition);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
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

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white";
    if (rank === 2)
      return "bg-gradient-to-br from-gray-400 to-gray-600 text-white";
    if (rank === 3)
      return "bg-gradient-to-br from-amber-600 to-amber-800 text-white";
    return "bg-slate-700 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-red-900/50 border-b border-purple-500/30">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <Link href="/duels">
            <Button
              variant="ghost"
              className="text-purple-300 hover:text-white mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Duels
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-red-400 text-transparent bg-clip-text">
                GLOBAL LEADERBOARD
              </h1>
              <p className="text-xl text-purple-200">
                Where the best duelists compete for glory! 🏆
              </p>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {leaderboard.length}
                </div>
                <div className="text-sm text-purple-300">Players</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-slate-900/50 rounded-2xl border border-purple-500/30 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-400" />
              Filter Leaderboard
            </h3>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={() => setViewType("global")}
              className={`${
                viewType === "global"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-slate-800 text-purple-300 hover:bg-slate-700"
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Global Rankings
            </Button>

            <Button
              onClick={() => setViewType("tier")}
              className={`${
                viewType === "tier"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-slate-800 text-purple-300 hover:bg-slate-700"
              }`}
            >
              <Trophy className="w-4 h-4 mr-2" />
              By Tier
            </Button>
          </div>

          {viewType === "tier" && (
            <div className="flex flex-wrap gap-2">
              {[
                "BRONZE",
                "SILVER",
                "GOLD",
                "PLATINUM",
                "DIAMOND",
                "MASTER",
                "LEGEND",
              ].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedTier === tier
                      ? `bg-gradient-to-r ${getTierColor(tier)} text-white`
                      : "bg-slate-800 text-purple-300 hover:bg-slate-700"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Your Position */}
        {userPosition && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/50 p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-white">
                    #{userPosition.rank}
                  </div>
                  <div className="text-sm text-purple-300">Your Rank</div>
                </div>
                <div className="h-16 w-px bg-purple-500/30"></div>
                <div>
                  <p className="text-white font-semibold">
                    You're in the top{" "}
                    {Math.round((userPosition.rank / leaderboard.length) * 100)}
                    %!
                  </p>
                  <p className="text-sm text-purple-300">
                    Keep dueling to climb higher
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-xl text-purple-300">
              No rankings yet. Be the first to compete!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const TierIcon = getTierIcon(entry.tier);
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-slate-900/50 rounded-xl border ${
                    entry.rank <= 3
                      ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                      : "border-purple-500/20"
                  } p-6 hover:border-purple-500/50 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Rank + User */}
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(
                          entry.rank
                        )} font-bold text-lg shadow-lg`}
                      >
                        {entry.rank}
                      </div>

                      {/* Avatar */}
                      <img
                        src={
                          entry.user.image || "/avatars/default-avatar.png"
                        }
                        alt={entry.user.name}
                        className={`w-14 h-14 rounded-full border-2 ${
                          entry.rank <= 3
                            ? "border-yellow-400"
                            : "border-purple-500"
                        }`}
                      />

                      {/* User Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-lg">
                            {entry.user.name}
                          </p>
                          {entry.rank === 1 && (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                              entry.tier
                            )} text-white text-xs font-bold`}
                          >
                            <TierIcon className="w-3 h-3" />
                            {entry.tier}
                          </span>
                          <span className="text-sm text-purple-300">
                            {entry.totalDuels} duels
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {entry.xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-purple-300">XP</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {entry.wins}
                        </div>
                        <div className="text-xs text-purple-300">Wins</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {entry.winRate}%
                        </div>
                        <div className="text-xs text-purple-300">Win Rate</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {entry.currentStreak}
                        </div>
                        <div className="text-xs text-purple-300">Streak</div>
                      </div>

                      {entry.perfectGames > 0 && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-400 flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {entry.perfectGames}
                          </div>
                          <div className="text-xs text-purple-300">Perfect</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
