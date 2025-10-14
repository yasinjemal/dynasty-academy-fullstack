"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Award, Sparkles, Lock } from "lucide-react";

interface AchievementsTabProps {
  userId: string;
  username: string;
  isOwner: boolean;
}

type AchievementTier = "BRONZE" | "SILVER" | "GOLD" | "ELITE" | "ALL";

interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  tier: string;
  iconUrl?: string;
  awardedAt?: string;
  progress?: number;
  locked?: boolean;
}

export default function AchievementsTab({
  userId,
  username,
  isOwner,
}: AchievementsTabProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<AchievementTier>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [username]);

  const fetchAchievements = async () => {
    try {
      const res = await fetch(`/api/users/${username}/achievements`);
      if (res.ok) {
        const json = await res.json();
        setAchievements(json.achievements || []);
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements =
    filter === "ALL"
      ? achievements
      : achievements.filter((a) => a.tier === filter);

  const tierCounts = {
    ELITE: achievements.filter((a) => a.tier === "ELITE").length,
    GOLD: achievements.filter((a) => a.tier === "GOLD").length,
    SILVER: achievements.filter((a) => a.tier === "SILVER").length,
    BRONZE: achievements.filter((a) => a.tier === "BRONZE").length,
  };

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center dark:from-purple-950 dark:to-purple-900">
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {achievements.length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">
            Total
          </div>
        </div>
        <TierStat tier="ELITE" count={tierCounts.ELITE} />
        <TierStat tier="GOLD" count={tierCounts.GOLD} />
        <TierStat tier="SILVER" count={tierCounts.SILVER} />
        <TierStat tier="BRONZE" count={tierCounts.BRONZE} />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          label="All"
          count={achievements.length}
        />
        <FilterButton
          active={filter === "ELITE"}
          onClick={() => setFilter("ELITE")}
          label="Elite"
          count={tierCounts.ELITE}
          gradient="from-purple-500 to-pink-500"
        />
        <FilterButton
          active={filter === "GOLD"}
          onClick={() => setFilter("GOLD")}
          label="Gold"
          count={tierCounts.GOLD}
          gradient="from-yellow-400 to-yellow-600"
        />
        <FilterButton
          active={filter === "SILVER"}
          onClick={() => setFilter("SILVER")}
          label="Silver"
          count={tierCounts.SILVER}
          gradient="from-gray-300 to-gray-500"
        />
        <FilterButton
          active={filter === "BRONZE"}
          onClick={() => setFilter("BRONZE")}
          label="Bronze"
          count={tierCounts.BRONZE}
          gradient="from-orange-400 to-orange-600"
        />
      </div>

      {/* Achievements Grid */}
      <AnimatePresence mode="wait">
        {filteredAchievements.length > 0 ? (
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredAchievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50"
          >
            <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "ALL"
                ? "No achievements yet"
                : `No ${filter.toLowerCase()} achievements yet`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Tier Stat Component
function TierStat({ tier, count }: { tier: string; count: number }) {
  const configs = {
    ELITE: {
      gradient: "from-purple-500 to-pink-500",
      icon: <Sparkles className="h-5 w-5" />,
    },
    GOLD: {
      gradient: "from-yellow-400 to-yellow-600",
      icon: <Star className="h-5 w-5" />,
    },
    SILVER: {
      gradient: "from-gray-300 to-gray-500",
      icon: <Award className="h-5 w-5" />,
    },
    BRONZE: {
      gradient: "from-orange-400 to-orange-600",
      icon: <Trophy className="h-5 w-5" />,
    },
  };

  const config = configs[tier as keyof typeof configs];

  return (
    <div
      className={`rounded-xl bg-gradient-to-br p-4 text-center text-white ${config.gradient}`}
    >
      <div className="mb-1 flex justify-center">{config.icon}</div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs opacity-90">{tier}</div>
    </div>
  );
}

// Filter Button Component
function FilterButton({
  active,
  onClick,
  label,
  count,
  gradient,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  gradient?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? gradient
            ? `bg-gradient-to-r ${gradient} text-white shadow-md`
            : "bg-purple-600 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {label} <span className="ml-1 opacity-75">({count})</span>
    </button>
  );
}

// Achievement Card Component
function AchievementCard({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const tierGradients = {
    ELITE: "from-purple-500 via-pink-500 to-purple-600",
    GOLD: "from-yellow-400 via-yellow-500 to-yellow-600",
    SILVER: "from-gray-300 via-gray-400 to-gray-500",
    BRONZE: "from-orange-400 via-orange-500 to-orange-600",
  };

  const tierBorders = {
    ELITE: "border-purple-300 dark:border-purple-800",
    GOLD: "border-yellow-300 dark:border-yellow-800",
    SILVER: "border-gray-300 dark:border-gray-700",
    BRONZE: "border-orange-300 dark:border-orange-800",
  };

  const gradient = tierGradients[achievement.tier as keyof typeof tierGradients];
  const border = tierBorders[achievement.tier as keyof typeof tierBorders];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white transition-all hover:scale-105 hover:shadow-2xl dark:bg-gray-900 ${border}`}
    >
      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity group-hover:opacity-10 ${gradient}`}
      />

      {/* Sparkle Effect */}
      {achievement.tier === "ELITE" && (
        <div className="absolute right-2 top-2">
          <Sparkles className="h-5 w-5 animate-pulse text-purple-500" />
        </div>
      )}

      {/* Locked State */}
      {achievement.locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Lock className="h-8 w-8 text-white" />
        </div>
      )}

      <div className="relative p-6">
        {/* Icon */}
        <div className="mb-4 flex items-center justify-between">
          <div className={`text-5xl ${achievement.locked ? "grayscale" : ""}`}>
            {achievement.iconUrl || "🏆"}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white ${
              achievement.tier === "ELITE"
                ? `bg-gradient-to-r ${gradient}`
                : "bg-gray-500"
            }`}
          >
            {achievement.tier}
          </span>
        </div>

        {/* Title & Description */}
        <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {achievement.title}
        </h4>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {achievement.description}
        </p>

        {/* Progress Bar (if in progress) */}
        {achievement.progress !== undefined && achievement.progress < 100 && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{achievement.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full bg-gradient-to-r transition-all duration-500 ${gradient}`}
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Awarded Date */}
        {achievement.awardedAt && (
          <div className="mt-4 border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-gray-800">
            Earned {new Date(achievement.awardedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
