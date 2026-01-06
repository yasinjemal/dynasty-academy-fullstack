"use client";

import { motion } from "framer-motion";
import { Target, Calendar, Zap, ChevronRight } from "lucide-react";
import type { UpcomingGoal } from "@/lib/api/dashboard-data";

interface GoalsTrackerProps {
  goals: UpcomingGoal[];
}

const goalTypeIcons: Record<
  UpcomingGoal["type"],
  { icon: string; color: string }
> = {
  READING: { icon: "📚", color: "from-purple-500 to-pink-500" },
  COURSE: { icon: "🎓", color: "from-blue-500 to-cyan-500" },
  STREAK: { icon: "🔥", color: "from-orange-500 to-red-500" },
  XP: { icon: "⭐", color: "from-yellow-500 to-amber-500" },
  ACHIEVEMENT: { icon: "🏆", color: "from-green-500 to-emerald-500" },
};

const formatDeadline = (deadline: Date | null) => {
  if (!deadline) return null;

  const now = new Date();
  const diff = new Date(deadline).getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 7) return `${days} days left`;
  return new Date(deadline).toLocaleDateString();
};

export default function GoalsTracker({ goals }: GoalsTrackerProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Goals
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {goals.length} active goals
            </p>
          </div>
        </div>
        <a
          href="/goals"
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium flex items-center gap-1"
        >
          Manage
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No active goals
          </p>
          <a
            href="/goals"
            className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            Set your first goal →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const progress = Math.round(
              (goal.currentValue / goal.targetValue) * 100
            );
            const typeConfig = goalTypeIcons[goal.type];
            const deadline = formatDeadline(goal.deadline);

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${typeConfig.color} rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}
                  >
                    {typeConfig.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      {/* Reward */}
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full whitespace-nowrap">
                        <Zap className="w-3 h-3" />
                        {goal.reward}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${typeConfig.color} rounded-full`}
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {goal.currentValue.toLocaleString()} /{" "}
                        {goal.targetValue.toLocaleString()}
                        <span className="ml-1 text-purple-600 dark:text-purple-400 font-medium">
                          ({progress}%)
                        </span>
                      </span>

                      {deadline && (
                        <span
                          className={`flex items-center gap-1 ${
                            deadline === "Overdue"
                              ? "text-red-500"
                              : deadline === "Due today"
                              ? "text-orange-500"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {deadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
