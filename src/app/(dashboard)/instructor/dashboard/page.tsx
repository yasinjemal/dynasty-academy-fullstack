"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  DollarSign,
  Users,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  Star,
  Eye,
  MessageSquare,
  Shield,
  Award,
} from "lucide-react";
import { calculateTrustScore } from "@/lib/governance/trust-score-engine";

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalStudents: number;
  activeCourses: number;
  averageRating: number;
  totalViews: number;
  pendingQuestions: number;
  recentEnrollments: {
    studentName: string;
    courseName: string;
    date: string;
    amount: number;
  }[];
}

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trustScore, setTrustScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(async () => {
      // Calculate trust score for instructor
      const instructorId = "user_instructor_123"; // TODO: Get from session
      const trust = await calculateTrustScore(instructorId);

      setStats({
        totalRevenue: 12450,
        monthlyRevenue: 3200,
        totalStudents: 847,
        activeCourses: 5,
        averageRating: 4.8,
        totalViews: 15234,
        pendingQuestions: 12,
        recentEnrollments: [
          {
            studentName: "John Doe",
            courseName: "Advanced Web Development",
            date: "2 hours ago",
            amount: 99,
          },
          {
            studentName: "Jane Smith",
            courseName: "React Masterclass",
            date: "5 hours ago",
            amount: 149,
          },
          {
            studentName: "Mike Johnson",
            courseName: "TypeScript Fundamentals",
            date: "1 day ago",
            amount: 79,
          },
        ],
      });
      setTrustScore(trust);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome back! 👋
        </h1>
        <p className="text-gray-400 mt-2">
          Here's what's happening with your courses today
        </p>
      </div>

      {/* Trust Score Card (NEW!) */}
      {trustScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-2 border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Trust Score: {trustScore.tier}
                </h3>
                <p className="text-sm text-gray-400">
                  {trustScore.totalScore}/1000 points
                </p>
              </div>
            </div>
            <Link
              href="/admin/instructor-verification"
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm font-medium transition-colors"
            >
              Improve Score
            </Link>
          </div>

          <div className="space-y-3">
            {/* Revenue Share */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300 text-sm">Revenue Share</span>
              <span className="text-green-400 font-bold">
                {(trustScore.multipliers.revenueShare * 100).toFixed(0)}%
              </span>
            </div>

            {/* Visibility Boost */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300 text-sm">Visibility Boost</span>
              <span className="text-purple-400 font-bold">
                {trustScore.multipliers.visibility}x
              </span>
            </div>

            {/* Moderation Level */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300 text-sm">Moderation Level</span>
              <span className="text-blue-400 font-bold">
                {trustScore.multipliers.moderationThreshold > 80
                  ? "Auto-Approved"
                  : trustScore.multipliers.moderationThreshold > 50
                  ? "Light"
                  : "Standard"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Progress to next tier</span>
              <span>{((trustScore.totalScore / 1000) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: `${(trustScore.totalScore / 1000) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            <Link
              href="/instructor/revenue"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="text-3xl font-bold text-green-400">
            ${stats.monthlyRevenue.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm mt-2">This Month</div>
          <div className="mt-3 text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12.5% from last month
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <Link
              href="/instructor/students"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {stats.totalStudents.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm mt-2">Total Students</div>
          <div className="mt-3 text-xs text-blue-400">+47 new this week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <Link
              href="/instructor/courses"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {stats.activeCourses}
          </div>
          <div className="text-gray-400 text-sm mt-2">Active Courses</div>
          <div className="mt-3 text-xs text-purple-400">
            All courses published
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <Star className="w-8 h-8 text-yellow-400" />
            <Link
              href="/instructor/analytics"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-gray-400 text-sm mt-2">Average Rating</div>
          <div className="mt-3 text-xs text-yellow-400">
            Based on 234 reviews
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Enrollments</h2>
            <Link
              href="/instructor/students"
              className="text-sm text-purple-400 hover:text-purple-300 underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentEnrollments.map((enrollment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {enrollment.studentName[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {enrollment.studentName}
                  </div>
                  <div className="text-sm text-gray-400">
                    {enrollment.courseName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-400">
                    +${enrollment.amount}
                  </div>
                  <div className="text-xs text-gray-500">{enrollment.date}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>

          <div className="space-y-3">
            <Link href="/instructor/create">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all text-white"
              >
                ✨ Create New Course
              </motion.button>
            </Link>

            <Link href="/instructor/revenue">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-800 border border-purple-500/20 hover:border-purple-500/40 rounded-lg font-semibold transition-all text-white flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                View Revenue
              </motion.button>
            </Link>

            <Link href="/instructor/analytics">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-800 border border-purple-500/20 hover:border-purple-500/40 rounded-lg font-semibold transition-all text-white flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </motion.button>
            </Link>

            <div className="pt-4 border-t border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Total Views</span>
                </div>
                <span className="font-semibold text-white">
                  {stats.totalViews.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Pending Q&A</span>
                </div>
                <span className="font-semibold text-yellow-400">
                  {stats.pendingQuestions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              💰 Total Lifetime Earnings
            </h3>
            <p className="text-gray-400">
              Track your complete revenue history and upcoming payouts
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-green-400 mb-2">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <Link href="/instructor/revenue">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all text-white"
              >
                View Details →
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
