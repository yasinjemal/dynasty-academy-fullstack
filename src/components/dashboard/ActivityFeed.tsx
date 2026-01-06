"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, Award, Zap, Trophy, TrendingUp } from "lucide-react";
import type { RecentActivity } from "@/lib/api/dashboard-data";

interface ActivityFeedProps {
  activities: RecentActivity[];
}

const getActivityIcon = (type: RecentActivity["type"]) => {
  switch (type) {
    case "BOOK_READ":
      return <BookOpen className="w-4 h-4" />;
    case "COURSE_PROGRESS":
      return <Target className="w-4 h-4" />;
    case "QUIZ_COMPLETED":
      return <Zap className="w-4 h-4" />;
    case "ACHIEVEMENT_UNLOCKED":
      return <Award className="w-4 h-4" />;
    case "DUEL_RESULT":
      return <Trophy className="w-4 h-4" />;
    case "CERTIFICATE_EARNED":
      return <Trophy className="w-4 h-4" />;
    case "STREAK_MILESTONE":
      return <TrendingUp className="w-4 h-4" />;
    case "LEVEL_UP":
      return <TrendingUp className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const getActivityColor = (type: RecentActivity["type"]) => {
  switch (type) {
    case "BOOK_READ":
      return "from-purple-500 to-pink-500";
    case "COURSE_PROGRESS":
      return "from-blue-500 to-cyan-500";
    case "QUIZ_COMPLETED":
      return "from-green-500 to-emerald-500";
    case "ACHIEVEMENT_UNLOCKED":
      return "from-yellow-500 to-orange-500";
    case "DUEL_RESULT":
      return "from-pink-500 to-red-500";
    case "CERTIFICATE_EARNED":
      return "from-yellow-500 to-amber-500";
    case "STREAK_MILESTONE":
      return "from-orange-500 to-red-500";
    case "LEVEL_UP":
      return "from-purple-500 to-indigo-500";
    default:
      return "from-gray-500 to-gray-600";
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Your activity will appear here as you learn
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Recent Activity ⚡
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          Last 7 days
        </span>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-transparent" />

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-10"
            >
              {/* Timeline Dot */}
              <div
                className={`absolute left-0 w-8 h-8 rounded-full bg-gradient-to-br ${getActivityColor(
                  activity.type
                )} flex items-center justify-center text-white shadow-lg`}
              >
                {activity.icon ? (
                  <span className="text-sm">{activity.icon}</span>
                ) : (
                  getActivityIcon(activity.type)
                )}
              </div>

              {/* Activity Card */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {activity.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">
                      {activity.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    {activity.xpEarned && activity.xpEarned > 0 && (
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        +{activity.xpEarned} XP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
