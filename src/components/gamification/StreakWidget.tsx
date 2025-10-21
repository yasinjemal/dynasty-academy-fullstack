"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar, Zap, TrendingUp, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StreakWidgetProps {
  userId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface StreakData {
  current: number;
  longest: number;
  isActive: boolean;
  daysUntilBreak: number;
  totalDays: number;
}

export default function StreakWidget({
  userId,
  className = "",
  size = "md",
}: StreakWidgetProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStreak() {
      try {
        const url = userId ? `/api/user/${userId}/streak` : `/api/user/streak`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load streak");
        const data = await response.json();
        setStreak(data.streak);
      } catch (error) {
        console.error("[Streak Widget] Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStreak();

    // Refresh every hour
    const interval = setInterval(loadStreak, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <Card
        className={`animate-pulse bg-gray-800 border-gray-700 ${className}`}
      >
        <div className={`p-${size === "sm" ? "3" : size === "md" ? "4" : "6"}`}>
          <div className="h-16 bg-gray-700 rounded" />
        </div>
      </Card>
    );
  }

  if (!streak) return null;

  // Small size (inline)
  if (size === "sm") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.div
          animate={
            streak.isActive
              ? {
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Flame
            className={`w-5 h-5 ${
              streak.isActive ? "text-orange-500" : "text-gray-500"
            }`}
          />
        </motion.div>
        <div>
          <span className="text-lg font-bold text-white">{streak.current}</span>
          <span className="text-sm text-gray-400 ml-1">day streak</span>
        </div>
      </div>
    );
  }

  // Medium size (card)
  if (size === "md") {
    return (
      <Card
        className={`bg-gradient-to-br from-orange-600/10 via-red-600/10 to-pink-600/10 border-orange-500/30 ${className}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={
                  streak.isActive
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Flame
                  className={`w-6 h-6 ${
                    streak.isActive ? "text-orange-500" : "text-gray-500"
                  }`}
                />
              </motion.div>
              <div>
                <p className="text-sm font-bold text-white">Daily Streak</p>
                <p className="text-xs text-gray-400">Keep it alive!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-transparent bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text">
                {streak.current}
              </p>
              <p className="text-xs text-gray-400">days</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs">
            {streak.isActive ? (
              <div className="flex items-center gap-1 text-green-400">
                <Zap className="w-3 h-3" />
                <span>Active today!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-400">
                <Calendar className="w-3 h-3" />
                <span>Complete an action to keep your streak!</span>
              </div>
            )}
          </div>

          {/* Best Streak */}
          {streak.longest > streak.current && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Best Streak
                </span>
                <span className="font-bold">{streak.longest} days</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Large size (detailed)
  return (
    <Card
      className={`bg-gradient-to-br from-orange-600/10 via-red-600/10 to-pink-600/10 border-orange-500/30 ${className}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
              <motion.div
                animate={
                  streak.isActive
                    ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, 10, -10, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Flame
                  className={`w-6 h-6 ${
                    streak.isActive ? "text-orange-500" : "text-gray-500"
                  }`}
                />
              </motion.div>
              Daily Streak
            </h3>
            <p className="text-sm text-gray-400">
              {streak.isActive
                ? "You're on fire! 🔥"
                : "Complete an action today!"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text">
              {streak.current}
            </div>
            <p className="text-sm text-gray-400 mt-1">days</p>
          </div>
        </div>

        {/* Progress to milestones */}
        <div className="space-y-3 mb-6">
          {[7, 14, 30, 100].map((milestone) => {
            const reached = streak.current >= milestone;
            const isCurrent =
              streak.current < milestone &&
              (milestone === 7 ||
                streak.current >=
                  [7, 14, 30, 100][[7, 14, 30, 100].indexOf(milestone) - 1] ||
                0);
            const progress = Math.min(100, (streak.current / milestone) * 100);

            return (
              <div key={milestone} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      reached
                        ? "text-green-400 font-bold"
                        : isCurrent
                        ? "text-orange-400 font-bold"
                        : "text-gray-500"
                    }
                  >
                    {milestone} Day Milestone
                  </span>
                  <span
                    className={
                      reached
                        ? "text-green-400"
                        : isCurrent
                        ? "text-orange-400"
                        : "text-gray-500"
                    }
                  >
                    {reached
                      ? "✓"
                      : isCurrent
                      ? `${streak.current}/${milestone}`
                      : "🔒"}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      reached
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "bg-gradient-to-r from-orange-500 to-red-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Award className="w-3 h-3" />
              <span>Best Streak</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {streak.longest}
              <span className="text-sm text-gray-400 ml-1">days</span>
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Total Active</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {streak.totalDays}
              <span className="text-sm text-gray-400 ml-1">days</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
