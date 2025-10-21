"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

interface XPWidgetProps {
  userId?: string;
  className?: string;
  compact?: boolean;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  xpCurrentLevel: number;
  title: string;
  totalXP: number;
}

export default function XPWidget({
  userId,
  className = "",
  compact = false,
}: XPWidgetProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const url = userId ? `/api/user/${userId}/stats` : `/api/user/stats`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("[XP Widget] Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();

    // Listen for XP updates
    const handleXPUpdate = (event: CustomEvent) => {
      loadStats();
    };

    window.addEventListener("xp-updated" as any, handleXPUpdate);

    return () => {
      window.removeEventListener("xp-updated" as any, handleXPUpdate);
    };
  }, [userId]);

  if (loading) {
    return (
      <Card
        className={`animate-pulse bg-gray-800 border-gray-700 ${className}`}
      >
        <div className="p-4 h-24" />
      </Card>
    );
  }

  if (!stats) return null;

  const progress =
    ((stats.xp - stats.xpCurrentLevel) /
      (stats.xpToNextLevel - stats.xpCurrentLevel)) *
    100;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{stats.level}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Level {stats.level}</span>
            <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-orange-600/10 border-purple-500/30 ${className}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">
                {stats.level}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Level {stats.level}
              </p>
              <p className="text-xs text-gray-400">{stats.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">
              {stats.xp.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{stats.xp.toLocaleString()} XP</span>
            <span>{stats.xpToNextLevel.toLocaleString()} XP</span>
          </div>
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </div>

        {/* Next Level Info */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <TrendingUp className="w-3 h-3" />
          <span>
            {(stats.xpToNextLevel - stats.xp).toLocaleString()} XP to next level
          </span>
        </div>
      </div>
    </Card>
  );
}

// Floating mini widget for corner of screen
export function XPFloatingWidget({ userId }: { userId?: string }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const url = userId ? `/api/user/${userId}/stats` : `/api/user/stats`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("[XP Floating Widget] Error:", error);
      }
    }

    loadStats();

    // Listen for XP updates
    const handleXPUpdate = () => loadStats();
    window.addEventListener("xp-updated" as any, handleXPUpdate);
    return () =>
      window.removeEventListener("xp-updated" as any, handleXPUpdate);
  }, [userId]);

  if (!stats || !visible) return null;

  const progress =
    ((stats.xp - stats.xpCurrentLevel) /
      (stats.xpToNextLevel - stats.xpCurrentLevel)) *
    100;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-20 right-4 z-50"
    >
      <div className="relative group">
        {/* Main Widget */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {stats.level}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-bold text-white">
                {stats.xp.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Mini Progress */}
          <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={() => setVisible(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>

        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl rounded-2xl -z-10" />

        {/* Tooltip on hover */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap shadow-xl border border-purple-500/30">
            <p className="font-bold">{stats.title}</p>
            <p className="text-gray-400">
              {(stats.xpToNextLevel - stats.xp).toLocaleString()} XP to Level{" "}
              {stats.level + 1}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
