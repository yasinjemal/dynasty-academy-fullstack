"use client";

import { motion } from "framer-motion";
import { Zap, Target, TrendingUp, Award } from "lucide-react";
import type { DashboardStats } from "@/lib/api/dashboard-data";

interface StatsHeroProps {
  stats: DashboardStats;
  userName: string;
}

export default function StatsHero({ stats, userName }: StatsHeroProps) {
  const xpProgress =
    stats.xpToNextLevel > 0
      ? ((stats.totalXP % 1000) /
          ((stats.totalXP % 1000) + stats.xpToNextLevel)) *
        100
      : 100;

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2"
            >
              Welcome back, {userName}! 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-purple-200 text-sm sm:text-base lg:text-lg"
            >
              You're doing amazing! Keep the momentum going.
            </motion.p>
          </div>

          {/* Rank Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 border border-white/20 w-fit"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <span className="text-lg sm:text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-white/60 text-[10px] sm:text-sm">
                Global Rank
              </p>
              <p className="text-white text-lg sm:text-2xl font-bold">
                #{stats.globalRank.toLocaleString()}
              </p>
            </div>
            <div className="text-white/40 text-[10px] sm:text-sm hidden xs:block">
              of {stats.totalLearners.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Level & XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-white text-xl sm:text-3xl font-bold">
                    {stats.currentLevel}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  LVL
                </div>
              </div>
              <div>
                <p className="text-white/60 text-[10px] sm:text-sm">
                  Total Experience
                </p>
                <p className="text-white text-lg sm:text-2xl lg:text-3xl font-bold">
                  {stats.totalXP.toLocaleString()} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[10px] sm:text-sm">
                To Next Level
              </p>
              <p className="text-purple-300 text-base sm:text-xl font-bold">
                {stats.xpToNextLevel.toLocaleString()} XP
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="relative h-3 sm:h-4 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-orange-500/30"
          >
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <span className="text-base sm:text-xl">🔥</span>
              </div>
              <div>
                <p className="text-orange-200 text-[10px] sm:text-xs">
                  Current Streak
                </p>
                <p className="text-white text-lg sm:text-2xl font-bold">
                  {stats.currentStreak}{" "}
                  <span className="text-xs sm:text-sm font-normal">days</span>
                </p>
              </div>
            </div>
            <p className="text-orange-300/60 text-[10px] sm:text-xs">
              Best: {stats.longestStreak} days
            </p>
          </motion.div>

          {/* Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-500/30"
          >
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-blue-200 text-[10px] sm:text-xs">Courses</p>
                <p className="text-white text-lg sm:text-2xl font-bold">
                  {stats.coursesCompleted}/{stats.coursesEnrolled}
                </p>
              </div>
            </div>
            <p className="text-blue-300/60 text-[10px] sm:text-xs">Completed</p>
          </motion.div>

          {/* Books */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-500/30"
          >
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <span className="text-base sm:text-xl">📚</span>
              </div>
              <div>
                <p className="text-purple-200 text-[10px] sm:text-xs">Books</p>
                <p className="text-white text-lg sm:text-2xl font-bold">
                  {stats.booksOwned}
                </p>
              </div>
            </div>
            <p className="text-purple-300/60 text-[10px] sm:text-xs">
              {stats.booksCompleted} completed
            </p>
          </motion.div>

          {/* Certificates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-yellow-500/30"
          >
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              </div>
              <div>
                <p className="text-yellow-200 text-[10px] sm:text-xs">
                  Certificates
                </p>
                <p className="text-white text-lg sm:text-2xl font-bold">
                  {stats.certificatesEarned}
                </p>
              </div>
            </div>
            <p className="text-yellow-300/60 text-[10px] sm:text-xs">Earned</p>
          </motion.div>
        </div>

        {/* Duels Stats */}
        {stats.duelsPlayed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-3 sm:mt-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-pink-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-500/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
                </div>
                <div>
                  <p className="text-pink-200 text-[10px] sm:text-xs">
                    Duels Performance
                  </p>
                  <p className="text-white text-base sm:text-xl font-bold">
                    {stats.duelsWon} W / {stats.duelsPlayed} P
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-pink-200 text-[10px] sm:text-xs">Win Rate</p>
                <p className="text-white text-base sm:text-xl font-bold">
                  {stats.duelsPlayed > 0
                    ? Math.round((stats.duelsWon / stats.duelsPlayed) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
