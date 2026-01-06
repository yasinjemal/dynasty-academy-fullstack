"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { DashboardData } from "@/lib/api/dashboard-data";

// Dynamic imports for code splitting
const StatsHero = dynamic(() => import("./StatsHero"), {
  loading: () => <DashboardSkeleton section="hero" />,
});
const ContinueLearning = dynamic(() => import("./ContinueLearning"), {
  loading: () => <DashboardSkeleton section="card" />,
});
const QuickActions = dynamic(() => import("./QuickActions"), {
  loading: () => <DashboardSkeleton section="actions" />,
});
const ActivityFeed = dynamic(() => import("./ActivityFeed"), {
  loading: () => <DashboardSkeleton section="card" />,
});
const AchievementsShowcase = dynamic(() => import("./AchievementsShowcase"), {
  loading: () => <DashboardSkeleton section="card" />,
});
const GoalsTracker = dynamic(() => import("./GoalsTracker"), {
  loading: () => <DashboardSkeleton section="card" />,
});
const MiniLeaderboard = dynamic(() => import("./MiniLeaderboard"), {
  loading: () => <DashboardSkeleton section="card" />,
});

interface DashboardClientProps {
  data: DashboardData;
  userName: string;
  userRole: string;
}

function DashboardSkeleton({
  section,
}: {
  section: "hero" | "card" | "actions";
}) {
  if (section === "hero") {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 animate-pulse">
        <div className="h-12 bg-white/10 rounded-lg w-2/3 mb-4" />
        <div className="h-6 bg-white/10 rounded-lg w-1/2 mb-8" />
        <div className="h-24 bg-white/10 rounded-2xl mb-6" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (section === "actions") {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 mb-6" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardClient({
  data,
  userName,
  userRole,
}: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatsHero stats={data.stats} userName={userName} />
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickActions />
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Learning & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ContinueLearning courses={data.learningProgress} />
            </motion.section>

            {/* Achievements Showcase */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AchievementsShowcase achievements={data.achievements} />
            </motion.section>

            {/* Goals Tracker */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GoalsTracker goals={data.upcomingGoals} />
            </motion.section>
          </div>

          {/* Right Column - Activity & Leaderboard */}
          <div className="space-y-8">
            {/* Activity Feed */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ActivityFeed activities={data.recentActivity} />
            </motion.section>

            {/* Mini Leaderboard */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <MiniLeaderboard entries={data.weeklyLeaderboard} />
            </motion.section>

            {/* Admin Quick Access */}
            {userRole === "ADMIN" && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <AdminQuickAccess />
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Quick Access Component
function AdminQuickAccess() {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <span className="text-xl">👑</span>
        </div>
        <div>
          <h3 className="font-bold">Admin Panel</h3>
          <p className="text-sm text-white/70">Manage your platform</p>
        </div>
      </div>

      <div className="space-y-2">
        <a
          href="/admin"
          className="block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
        >
          📊 Dashboard
        </a>
        <a
          href="/admin/courses"
          className="block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
        >
          🎓 Manage Courses
        </a>
        <a
          href="/admin/users"
          className="block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
        >
          👥 Manage Users
        </a>
        <a
          href="/admin/blog"
          className="block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
        >
          ✍️ Write Blog Post
        </a>
      </div>
    </div>
  );
}
