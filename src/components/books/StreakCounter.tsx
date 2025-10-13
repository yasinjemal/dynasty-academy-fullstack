"use client";

import { useEffect, useState } from "react";
import { Flame, TrendingUp, Clock, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  totalSessions: number;
  isActive: boolean;
  daysUntilBreak: number;
}

export default function StreakCounter({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStreak() {
      try {
        const response = await fetch("/api/listening/streaks");
        if (!response.ok) throw new Error("Failed to load streak");
        const data = await response.json();
        setStreak(data.streak);
      } catch (error) {
        console.error("[Streak Counter] Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStreak();

    // Refresh every minute
    const interval = setInterval(loadStreak, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-4 bg-gray-900 border-gray-800 animate-pulse">
        <div className="h-16 bg-gray-800 rounded"></div>
      </Card>
    );
  }

  if (!streak) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Flame
            className={`w-5 h-5 ${
              streak.isActive
                ? "text-orange-500 animate-pulse"
                : "text-gray-500"
            }`}
          />
          <span className="text-lg font-bold text-white">
            {streak.currentStreak}
          </span>
          <span className="text-sm text-gray-400">day streak</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20 border-orange-500/30">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame
              className={`w-6 h-6 ${
                streak.isActive
                  ? "text-orange-500 animate-pulse"
                  : "text-gray-500"
              }`}
            />
            <h3 className="text-lg font-bold text-white">Listening Streak</h3>
          </div>
          {!streak.isActive && streak.currentStreak === 0 && (
            <p className="text-sm text-gray-400">
              Start listening today to begin your streak!
            </p>
          )}
          {!streak.isActive && streak.currentStreak > 0 && (
            <p className="text-sm text-yellow-400">
              ⚠️ Your streak will break in {Math.abs(streak.daysUntilBreak)}{" "}
              days!
            </p>
          )}
          {streak.isActive && (
            <p className="text-sm text-green-400">✅ Streak active today!</p>
          )}
        </div>
        <Badge
          variant="outline"
          className={`${
            streak.isActive
              ? "border-orange-500 bg-orange-500/20 text-orange-400"
              : "border-gray-600 bg-gray-800 text-gray-400"
          }`}
        >
          {streak.isActive ? "ACTIVE" : "INACTIVE"}
        </Badge>
      </div>

      {/* Main Streak Display */}
      <div className="flex items-end gap-4 mb-6">
        <div>
          <div className="text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            {streak.currentStreak}
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            Current Streak
          </div>
        </div>
        {streak.longestStreak > streak.currentStreak && (
          <div className="pb-2">
            <div className="flex items-center gap-1.5 text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-lg font-bold">{streak.longestStreak}</span>
              <span className="text-xs">best</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {Math.round(streak.totalMinutes / 60)}
            <span className="text-sm text-gray-400 ml-1">hours</span>
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-400">
            <Zap className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {streak.totalSessions}
          </p>
        </div>
      </div>

      {/* Progress to next milestone */}
      {streak.currentStreak > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <StreakMilestone currentStreak={streak.currentStreak} />
        </div>
      )}
    </Card>
  );
}

function StreakMilestone({ currentStreak }: { currentStreak: number }) {
  const milestones = [3, 7, 30, 100];
  const nextMilestone = milestones.find((m) => m > currentStreak) || 100;
  const progress = (currentStreak / nextMilestone) * 100;

  const rewards = {
    3: "30 Dynasty Points",
    7: "75 Dynasty Points",
    30: "300 Dynasty Points",
    100: "1000 Dynasty Points",
  } as Record<number, string>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Next Milestone: {nextMilestone} days
        </span>
        <span className="text-yellow-400 font-bold">
          🏆 {rewards[nextMilestone as keyof typeof rewards]}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">
        {nextMilestone - currentStreak} days to go
      </p>
    </div>
  );
}
