"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  Book,
  Award,
  BarChart3,
  Activity,
  Eye,
  BookOpen,
} from "lucide-react";

interface IntelligenceStats {
  totalSessions: number;
  totalUsers: number;
  avgCompletionRate: number;
  avgEngagementScore: number;
  totalBehaviorPatterns: number;
  totalComplexityAnalyses: number;
  peakReadingHours: Array<{ hour: number; count: number }>;
  popularBooks: Array<{ bookId: string; bookTitle: string; sessions: number }>;
  userRetention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  predictionAccuracy: {
    engagement: number;
    completion: number;
    speed: number;
  };
}

export default function IntelligenceAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<IntelligenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">(
    "7d"
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check if user is admin
    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchStats();
  }, [session, status, router, timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/intelligence/stats?range=${timeRange}`
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch intelligence stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-xl">
            Loading Intelligence Analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-purple-600/20 rounded-2xl">
              <Brain className="w-12 h-12 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                🧠 Intelligence Analytics Dashboard
              </h1>
              <p className="text-purple-300 text-lg">
                AI Reading Intelligence System Performance & Insights
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mt-6">
            {(["24h", "7d", "30d", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800/50 text-purple-300 hover:bg-slate-800"
                }`}
              >
                {range === "24h" && "Last 24 Hours"}
                {range === "7d" && "Last 7 Days"}
                {range === "30d" && "Last 30 Days"}
                {range === "all" && "All Time"}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Sessions */}
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-purple-300 text-sm font-semibold mb-1">
              Total Sessions
            </p>
            <p className="text-4xl font-bold text-white">
              {stats.totalSessions.toLocaleString()}
            </p>
          </div>

          {/* Active Users */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-blue-300 text-sm font-semibold mb-1">
              Active Users
            </p>
            <p className="text-4xl font-bold text-white">
              {stats.totalUsers.toLocaleString()}
            </p>
          </div>

          {/* Avg Completion Rate */}
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-green-300 text-sm font-semibold mb-1">
              Avg Completion
            </p>
            <p className="text-4xl font-bold text-white">
              {stats.avgCompletionRate.toFixed(1)}%
            </p>
          </div>

          {/* Avg Engagement */}
          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-orange-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-orange-300 text-sm font-semibold mb-1">
              Avg Engagement
            </p>
            <p className="text-4xl font-bold text-white">
              {stats.avgEngagementScore.toFixed(1)}/10
            </p>
          </div>
        </div>

        {/* Prediction Accuracy */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-purple-500/30 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Award className="w-7 h-7 text-purple-400" />
            AI Prediction Accuracy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Engagement Accuracy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 font-semibold">
                  Engagement Prediction
                </span>
                <span className="text-2xl font-bold text-white">
                  {stats.predictionAccuracy.engagement.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                  style={{ width: `${stats.predictionAccuracy.engagement}%` }}
                />
              </div>
            </div>

            {/* Completion Accuracy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-300 font-semibold">
                  Completion Prediction
                </span>
                <span className="text-2xl font-bold text-white">
                  {stats.predictionAccuracy.completion.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                  style={{ width: `${stats.predictionAccuracy.completion}%` }}
                />
              </div>
            </div>

            {/* Speed Accuracy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 font-semibold">
                  Speed Recommendation
                </span>
                <span className="text-2xl font-bold text-white">
                  {stats.predictionAccuracy.speed.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                  style={{ width: `${stats.predictionAccuracy.speed}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Peak Reading Hours */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-purple-500/30 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="w-7 h-7 text-purple-400" />
            Peak Reading Hours
          </h2>
          <div className="grid grid-cols-12 gap-2">
            {stats.peakReadingHours.map((hour) => {
              const maxCount = Math.max(
                ...stats.peakReadingHours.map((h) => h.count)
              );
              const heightPercent = (hour.count / maxCount) * 100;
              return (
                <div
                  key={hour.hour}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-500 hover:from-purple-500 hover:to-purple-300"
                    style={{ height: `${Math.max(20, heightPercent)}px` }}
                    title={`${hour.count} sessions`}
                  />
                  <span className="text-xs text-purple-300 font-semibold">
                    {hour.hour}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Books */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-purple-500/30 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Book className="w-7 h-7 text-purple-400" />
            Most Analyzed Books
          </h2>
          <div className="space-y-4">
            {stats.popularBooks.slice(0, 10).map((book, index) => (
              <div
                key={book.bookId}
                className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-purple-600/20 rounded-lg">
                  <span className="text-xl font-bold text-purple-400">
                    #{index + 1}
                  </span>
                </div>
                <BookOpen className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <p className="text-white font-semibold">{book.bookTitle}</p>
                  <p className="text-purple-300 text-sm">ID: {book.bookId}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {book.sessions.toLocaleString()}
                  </p>
                  <p className="text-purple-300 text-sm">sessions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Retention */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Eye className="w-7 h-7 text-purple-400" />
            User Retention
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-purple-600/10 to-purple-600/5 rounded-xl border border-purple-500/20">
              <p className="text-purple-300 text-sm font-semibold mb-2">
                Daily Return Rate
              </p>
              <p className="text-4xl font-bold text-white">
                {stats.userRetention.daily.toFixed(1)}%
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-600/10 to-blue-600/5 rounded-xl border border-blue-500/20">
              <p className="text-blue-300 text-sm font-semibold mb-2">
                Weekly Return Rate
              </p>
              <p className="text-4xl font-bold text-white">
                {stats.userRetention.weekly.toFixed(1)}%
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-600/10 to-green-600/5 rounded-xl border border-green-500/20">
              <p className="text-green-300 text-sm font-semibold mb-2">
                Monthly Return Rate
              </p>
              <p className="text-4xl font-bold text-white">
                {stats.userRetention.monthly.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-purple-500/30">
            <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
            <p className="text-purple-300 text-sm font-semibold mb-2">
              Behavior Patterns Analyzed
            </p>
            <p className="text-3xl font-bold text-white">
              {stats.totalBehaviorPatterns.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-purple-500/30">
            <Brain className="w-8 h-8 text-purple-400 mb-4" />
            <p className="text-purple-300 text-sm font-semibold mb-2">
              Content Complexity Analyses
            </p>
            <p className="text-3xl font-bold text-white">
              {stats.totalComplexityAnalyses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
