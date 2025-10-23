"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  Star,
  CreditCard,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
} from "lucide-react";

interface RevenueStats {
  totalEarnings: number;
  pendingPayout: number;
  availableBalance: number;
  totalStudents: number;
  activeCourses: number;
  averageRating: number;
  completionRate: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  growthRate: number;
  payoutHistory: PayoutRecord[];
  revenueByWeek: WeeklyRevenue[];
  topCourses: CourseRevenue[];
  upcomingPayout: {
    amount: number;
    date: string;
    coursesIncluded: number;
  };
}

interface PayoutRecord {
  id: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "processing";
  method: string;
}

interface WeeklyRevenue {
  week: string;
  revenue: number;
  students: number;
}

interface CourseRevenue {
  id: string;
  title: string;
  thumbnail: string;
  revenue: number;
  students: number;
  rating: number;
  trend: "up" | "down" | "stable";
}

export default function InstructorRevenuePage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  useEffect(() => {
    fetchRevenueStats();
  }, [timeRange]);

  const fetchRevenueStats = async () => {
    try {
      const response = await fetch(
        `/api/instructor/revenue?range=${timeRange}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch revenue stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const revenueChange = stats.growthRate;
  const isPositiveGrowth = revenueChange > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Revenue Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Track your earnings and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  isPositiveGrowth ? "text-green-400" : "text-red-400"
                }`}
              >
                {isPositiveGrowth ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(revenueChange).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${stats.totalEarnings.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm mt-2">Total Earnings</div>
          </motion.div>

          {/* Available Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
              <button className="text-xs text-purple-400 hover:text-purple-300 underline">
                Request Payout
              </button>
            </div>
            <div className="text-3xl font-bold text-purple-400">
              ${stats.availableBalance.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm mt-2">Available Balance</div>
          </motion.div>

          {/* Total Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm text-blue-400">
                +{stats.activeCourses} courses
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {stats.totalStudents.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm mt-2">Total Students</div>
          </motion.div>

          {/* Average Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-sm text-yellow-400">
                {stats.completionRate}% completion
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {stats.averageRating.toFixed(1)}/5.0
            </div>
            <div className="text-gray-400 text-sm mt-2">Average Rating</div>
          </motion.div>
        </div>

        {/* Revenue Chart & Upcoming Payout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Revenue Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="w-4 h-4" />
                Weekly Performance
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-4">
              {stats.revenueByWeek.map((week, index) => {
                const maxRevenue = Math.max(
                  ...stats.revenueByWeek.map((w) => w.revenue)
                );
                const percentage = (week.revenue / maxRevenue) * 100;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{week.week}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">
                          {week.students} students
                        </span>
                        <span className="font-semibold text-purple-400">
                          ${week.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Upcoming Payout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold">Next Payout</h3>
                <p className="text-sm text-gray-400">Scheduled payout</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  ${stats.upcomingPayout.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(stats.upcomingPayout.date).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Courses included</span>
                  <span className="font-semibold">
                    {stats.upcomingPayout.coursesIncluded}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Pending amount</span>
                  <span className="font-semibold text-yellow-400">
                    ${stats.pendingPayout.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payout Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Payout threshold</span>
                  <span className="text-gray-500">$50 minimum</span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        (stats.availableBalance / 50) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all">
                View Payout Details
              </button>
            </div>
          </motion.div>
        </div>

        {/* Top Performing Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Top Performing Courses</h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 underline">
              View All Courses
            </button>
          </div>

          <div className="space-y-4">
            {stats.topCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-all"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students} students
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {course.rating.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-green-400 mb-1">
                    ${course.revenue.toLocaleString()}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      course.trend === "up"
                        ? "text-green-400"
                        : course.trend === "down"
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {course.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : course.trend === "down" ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                    {course.trend === "up"
                      ? "Growing"
                      : course.trend === "down"
                      ? "Declining"
                      : "Stable"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payout History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-bold mb-6">Payout History</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.payoutHistory.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-purple-500/10 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      {new Date(payout.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4 font-semibold text-green-400">
                      ${payout.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-gray-400">{payout.method}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payout.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : payout.status === "processing"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {payout.status.charAt(0).toUpperCase() +
                          payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-purple-400 hover:text-purple-300 text-sm underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
