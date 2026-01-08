"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Swords,
  Trophy,
  Upload,
  BarChart2,
  Settings,
  Wallet,
  ShoppingCart,
  Target,
  Sparkles,
  Brain,
} from "lucide-react";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href: string;
  gradient: string;
  description: string;
  badge?: string;
}

const quickActions: QuickAction[] = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    label: "My Courses",
    href: "/my-courses",
    gradient: "from-blue-500 to-cyan-500",
    description: "Continue learning",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    label: "3D Library",
    href: "/library",
    gradient: "from-purple-500 to-pink-500",
    description: "Immersive reading",
    badge: "NEW",
  },
  {
    icon: <Swords className="w-6 h-6" />,
    label: "Duels",
    href: "/duels",
    gradient: "from-pink-500 to-rose-500",
    description: "Challenge friends",
    badge: "HOT",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    label: "Achievements",
    href: "/achievements",
    gradient: "from-yellow-500 to-orange-500",
    description: "View badges",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    label: "Leaderboard",
    href: "/leaderboard",
    gradient: "from-green-500 to-emerald-500",
    description: "Your ranking",
  },
  {
    icon: <Target className="w-6 h-6" />,
    label: "My Progress",
    href: "/student/engagement",
    gradient: "from-indigo-500 to-purple-500",
    description: "Track stats",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    label: "AI Summaries",
    href: "/summaries",
    gradient: "from-violet-500 to-purple-600",
    description: "Smart notes",
  },
  {
    icon: <Upload className="w-6 h-6" />,
    label: "Upload Book",
    href: "/upload",
    gradient: "from-orange-500 to-red-500",
    description: "Add your PDFs",
  },
];

const secondaryActions: QuickAction[] = [
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    label: "Marketplace",
    href: "/marketplace",
    gradient: "from-green-500 to-teal-500",
    description: "Browse courses",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    label: "Wallet",
    href: "/wallet",
    gradient: "from-yellow-500 to-amber-500",
    description: "Earnings & credits",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: "Settings",
    href: "/settings/profile",
    gradient: "from-gray-500 to-gray-600",
    description: "Preferences",
  },
];

export default function QuickActions() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Primary Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-purple-100 dark:border-purple-900/50">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Jump into action
            </p>
          </div>
        </div>

        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-3 sm:grid sm:grid-cols-4 sm:overflow-x-visible sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory sm:snap-none">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[120px] sm:w-auto snap-start"
            >
              <Link href={action.href}>
                <div className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all sm:hover:-translate-y-1 hover:shadow-lg min-h-[100px] sm:min-h-[130px] touch-manipulation">
                  {/* Badge */}
                  {action.badge && (
                    <span
                      className={`absolute -top-1 -right-1 text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full ${
                        action.badge === "NEW"
                          ? "bg-green-500 text-white"
                          : "bg-pink-500 text-white"
                      }`}
                    >
                      {action.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${action.gradient} rounded-lg sm:rounded-xl flex items-center justify-center text-white mb-2 sm:mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg`}
                  >
                    {action.icon}
                  </div>

                  {/* Text */}
                  <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm mb-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                    {action.label}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Secondary Actions - horizontal scroll on mobile */}
      <div className="flex overflow-x-auto pb-2 gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
        {secondaryActions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="flex-shrink-0"
          >
            <Link href={action.href}>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all group min-h-[44px] touch-manipulation">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${action.gradient} rounded-md sm:rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
                >
                  {action.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 whitespace-nowrap">
                    {action.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
