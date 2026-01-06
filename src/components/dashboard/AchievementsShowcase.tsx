"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Sparkles } from "lucide-react";
import type { Achievement } from "@/lib/api/dashboard-data";

interface AchievementsShowcaseProps {
  achievements: Achievement[];
}

const rarityStyles: Record<
  Achievement["rarity"],
  { bg: string; border: string; glow: string }
> = {
  COMMON: {
    bg: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
    border: "border-gray-300 dark:border-gray-600",
    glow: "",
  },
  RARE: {
    bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30",
    border: "border-blue-400 dark:border-blue-600",
    glow: "shadow-blue-500/20",
  },
  EPIC: {
    bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30",
    border: "border-purple-400 dark:border-purple-600",
    glow: "shadow-purple-500/30",
  },
  LEGENDARY: {
    bg: "from-yellow-100 to-amber-200 dark:from-yellow-900/30 dark:to-amber-800/30",
    border: "border-yellow-400 dark:border-yellow-500",
    glow: "shadow-yellow-500/40",
  },
};

const rarityLabels: Record<Achievement["rarity"], string> = {
  COMMON: "Common",
  RARE: "Rare ⭐",
  EPIC: "Epic ✨",
  LEGENDARY: "Legendary 🌟",
};

export default function AchievementsShowcase({
  achievements,
}: AchievementsShowcaseProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Achievements
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {achievements.length} unlocked
            </p>
          </div>
        </div>
        <a
          href="/achievements"
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium"
        >
          View All →
        </a>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No achievements yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Complete lessons and challenges to earn achievements!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const styles = rarityStyles[achievement.rarity];
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-gradient-to-br ${styles.bg} rounded-xl p-4 border-2 ${styles.border} ${styles.glow} shadow-lg hover:scale-105 transition-transform cursor-pointer`}
              >
                {/* Rarity Badge */}
                <div className="absolute -top-2 -right-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      achievement.rarity === "LEGENDARY"
                        ? "bg-yellow-500 text-yellow-900"
                        : achievement.rarity === "EPIC"
                        ? "bg-purple-500 text-white"
                        : achievement.rarity === "RARE"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {rarityLabels[achievement.rarity]}
                  </span>
                </div>

                {/* Icon */}
                <div className="text-4xl mb-3">{achievement.icon}</div>

                {/* Content */}
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {achievement.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {achievement.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    +{achievement.xpReward} XP
                  </span>
                </div>

                {/* Sparkle Effect for Legendary */}
                {achievement.rarity === "LEGENDARY" && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                    <Sparkles className="absolute top-2 left-2 w-4 h-4 text-yellow-400 animate-pulse" />
                    <Sparkles className="absolute bottom-2 right-6 w-3 h-3 text-yellow-400 animate-pulse delay-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
