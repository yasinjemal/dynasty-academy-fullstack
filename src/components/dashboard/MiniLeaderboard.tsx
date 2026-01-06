"use client";

import { motion } from "framer-motion";
import { Crown, Medal, TrendingUp } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/api/dashboard-data";

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
}

const rankColors: Record<
  number,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  1: {
    bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    text: "text-yellow-900",
    icon: <Crown className="w-4 h-4" />,
  },
  2: {
    bg: "bg-gradient-to-br from-gray-300 to-gray-400",
    text: "text-gray-800",
    icon: <Medal className="w-4 h-4" />,
  },
  3: {
    bg: "bg-gradient-to-br from-amber-600 to-orange-700",
    text: "text-amber-100",
    icon: <Medal className="w-4 h-4" />,
  },
};

export default function MiniLeaderboard({ entries }: MiniLeaderboardProps) {
  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const topThree = entries.slice(0, 3);

  // If current user is not in top 3, show top 3 + gap + current user
  const showCurrentUserSeparately =
    currentUserEntry && currentUserEntry.rank > 3;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Leaderboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Top performers this week
            </p>
          </div>
        </div>
        <a
          href="/leaderboard"
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium"
        >
          View All →
        </a>
      </div>

      {/* Podium Style Top 3 */}
      <div className="flex justify-center items-end gap-2 mb-6">
        {/* Second Place */}
        {topThree[1] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold overflow-hidden border-4 border-gray-400">
                {topThree[1].avatar ? (
                  <img
                    src={topThree[1].avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  topThree[1].name.charAt(0)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center max-w-[70px] truncate">
              {topThree[1].name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {topThree[1].xp.toLocaleString()} XP
            </p>
            <div className="h-16 w-14 bg-gray-200 dark:bg-gray-700 rounded-t-lg mt-1" />
          </motion.div>
        )}

        {/* First Place */}
        {topThree[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center -mt-4"
          >
            <div className="text-2xl mb-1">👑</div>
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-xl font-bold overflow-hidden border-4 border-yellow-400 ring-4 ring-yellow-200">
                {topThree[0].avatar ? (
                  <img
                    src={topThree[0].avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  topThree[0].name.charAt(0)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-yellow-900 text-xs font-bold">
                1
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white mt-2 text-center max-w-[80px] truncate">
              {topThree[0].name}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              {topThree[0].xp.toLocaleString()} XP
            </p>
            <div className="h-24 w-16 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg mt-1" />
          </motion.div>
        )}

        {/* Third Place */}
        {topThree[2] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-xl font-bold overflow-hidden border-4 border-amber-600">
                {topThree[2].avatar ? (
                  <img
                    src={topThree[2].avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  topThree[2].name.charAt(0)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                3
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center max-w-[70px] truncate">
              {topThree[2].name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {topThree[2].xp.toLocaleString()} XP
            </p>
            <div className="h-12 w-14 bg-amber-200 dark:bg-amber-900/50 rounded-t-lg mt-1" />
          </motion.div>
        )}
      </div>

      {/* Current User Position (if not in top 3) */}
      {showCurrentUserSeparately && currentUserEntry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4 relative">
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-2 text-xs text-gray-400">
              •••
            </span>
          </div>

          <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border-2 border-purple-200 dark:border-purple-800">
            <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              #{currentUserEntry.rank}
            </span>
            <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center overflow-hidden">
              {currentUserEntry.avatar ? (
                <img
                  src={currentUserEntry.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-purple-600 dark:text-purple-300 font-bold">
                  {currentUserEntry.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-purple-900 dark:text-purple-100">
                {currentUserEntry.name} (You)
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Level {currentUserEntry.level}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-900 dark:text-purple-100">
                {currentUserEntry.xp.toLocaleString()} XP
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
