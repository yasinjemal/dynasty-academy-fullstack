"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Clock,
  Brain,
  Sparkles,
} from "lucide-react";

interface ReadingStats {
  todayMinutes: number;
  todayGoal: number;
  weeklyPages: number;
  weeklyGoal: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  points: number;
  nextLevelPoints: number;
  booksCompleted: number;
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt: Date;
}

const SAMPLE_BADGES: Badge[] = [
  {
    id: "1",
    name: "First Steps",
    description: "Complete your first reading session",
    icon: "🎯",
    rarity: "common",
    unlockedAt: new Date(),
  },
  {
    id: "2",
    name: "Week Warrior",
    description: "Read 7 days in a row",
    icon: "🔥",
    rarity: "rare",
    unlockedAt: new Date(),
  },
  {
    id: "3",
    name: "Speed Reader",
    description: "Read 100 pages in one day",
    icon: "⚡",
    rarity: "epic",
    unlockedAt: new Date(),
  },
];

export default function ReadingGoalsDashboard() {
  const [stats, setStats] = useState<ReadingStats>({
    todayMinutes: 45,
    todayGoal: 60,
    weeklyPages: 180,
    weeklyGoal: 250,
    currentStreak: 7,
    longestStreak: 14,
    level: 12,
    points: 2450,
    nextLevelPoints: 3000,
    booksCompleted: 8,
    badges: SAMPLE_BADGES,
  });

  const dailyProgress = (stats.todayMinutes / stats.todayGoal) * 100;
  const weeklyProgress = (stats.weeklyPages / stats.weeklyGoal) * 100;
  const levelProgress = ((stats.points % 1000) / 1000) * 100;

  const getRarityColor = (rarity: Badge["rarity"]) => {
    switch (rarity) {
      case "common":
        return "from-slate-600 to-slate-700";
      case "rare":
        return "from-blue-600 to-blue-700";
      case "epic":
        return "from-purple-600 to-purple-700";
      case "legendary":
        return "from-amber-600 to-orange-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-purple-400" />
            Reading Goals & Progress
          </h1>
          <p className="text-purple-300">
            Track your journey, earn rewards, and level up your reading game! 🚀
          </p>
        </motion.div>

        {/* Level & Points */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-amber-400" />
                <h2 className="text-3xl font-bold text-white">
                  Level {stats.level}
                </h2>
              </div>
              <p className="text-purple-300">
                {stats.points.toLocaleString()} points •{" "}
                {stats.nextLevelPoints - stats.points} to next level
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stats.booksCompleted}
              </div>
              <p className="text-purple-300">Books Completed</p>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="relative h-4 bg-slate-900/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {Math.round(levelProgress)}%
            </div>
          </div>
        </motion.div>

        {/* Daily & Weekly Goals */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Daily Goal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Today's Goal</h3>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white">
                  {stats.todayMinutes}
                </span>
                <span className="text-purple-300">
                  / {stats.todayGoal} minutes
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(dailyProgress, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    dailyProgress >= 100
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                />
              </div>
            </div>

            {dailyProgress >= 100 ? (
              <div className="flex items-center gap-2 text-green-400">
                <Award className="w-5 h-5" />
                <span className="font-semibold">Goal completed! 🎉</span>
              </div>
            ) : (
              <p className="text-purple-300 text-sm">
                {stats.todayGoal - stats.todayMinutes} minutes to go!
              </p>
            )}
          </motion.div>

          {/* Weekly Goal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">This Week</h3>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white">
                  {stats.weeklyPages}
                </span>
                <span className="text-purple-300">
                  / {stats.weeklyGoal} pages
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    weeklyProgress >= 100
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                />
              </div>
            </div>

            <p className="text-purple-300 text-sm">
              {Math.round(weeklyProgress)}% of weekly goal completed
            </p>
          </motion.div>
        </div>

        {/* Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Reading Streaks</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                {stats.currentStreak}
              </div>
              <p className="text-purple-300">Current Streak</p>
              <p className="text-sm text-purple-400 mt-1">🔥 Keep it going!</p>
            </div>

            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                {stats.longestStreak}
              </div>
              <p className="text-purple-300">Longest Streak</p>
              <p className="text-sm text-purple-400 mt-1">🏆 Personal best!</p>
            </div>
          </div>
        </motion.div>

        {/* Badges & Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-amber-400" />
            <h3 className="text-2xl font-bold text-white">
              Badges & Achievements
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {stats.badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`bg-gradient-to-br ${getRarityColor(
                  badge.rarity
                )}/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="text-5xl mb-4">{badge.icon}</div>
                <h4 className="text-lg font-bold text-white mb-2">
                  {badge.name}
                </h4>
                <p className="text-purple-300 text-sm mb-3">
                  {badge.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs uppercase font-bold ${
                      badge.rarity === "legendary"
                        ? "text-amber-400"
                        : badge.rarity === "epic"
                        ? "text-purple-400"
                        : badge.rarity === "rare"
                        ? "text-blue-400"
                        : "text-slate-400"
                    }`}
                  >
                    {badge.rarity}
                  </span>
                  <span className="text-xs text-purple-400">
                    {new Date(badge.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Locked Badge Example */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 opacity-50"
            >
              <div className="text-5xl mb-4 filter grayscale">🏅</div>
              <h4 className="text-lg font-bold text-white mb-2">
                Century Reader
              </h4>
              <p className="text-purple-300 text-sm mb-3">Complete 100 books</p>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-purple-400">
                  Legendary
                </span>
                <span className="text-xs text-purple-400">🔒 Locked</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-xl text-white font-semibold mb-2">
              You're doing amazing! 🎉
            </p>
            <p className="text-purple-300">
              You've read {stats.todayMinutes} minutes today. That's{" "}
              {Math.round((stats.todayMinutes / 60) * 100)}% more than the
              average person!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
