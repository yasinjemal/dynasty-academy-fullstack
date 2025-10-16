"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  Target,
  Flame,
  Calendar,
  Award,
  BarChart3,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgressData {
  currentLesson: {
    title: string;
    progress: number;
    totalTimeSpent: number;
    watchCount: number;
  };
  courseStats: {
    totalLessons: number;
    completedLessons: number;
    totalTimeSpent: number;
    averageSpeed: number;
  };
  streak: {
    current: number;
    longest: number;
    lastStudyDate: string;
    studyDates: string[];
  };
  weeklyActivity: Array<{
    date: string;
    minutes: number;
    lessons: number;
  }>;
  recentSessions: Array<{
    date: string;
    duration: number;
    lessons: string[];
  }>;
}

interface ProgressAnalyticsProps {
  userId: string;
  courseId: string;
}

export function ProgressAnalytics({
  userId,
  courseId,
}: ProgressAnalyticsProps) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "overview" | "streak" | "sessions"
  >("overview");

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/progress?userId=${userId}`
        );
        if (response.ok) {
          const progressData = await response.json();
          setData(progressData);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, [userId, courseId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Your Progress Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Track your learning journey and stay motivated
          </p>
        </div>
        <div className="flex gap-2">
          {(["overview", "streak", "sessions"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedView === view
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Course Progress"
          value={`${Math.round(
            (data.courseStats.completedLessons /
              data.courseStats.totalLessons) *
              100
          )}%`}
          subtitle={`${data.courseStats.completedLessons}/${data.courseStats.totalLessons} lessons`}
          color="purple"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Time Invested"
          value={formatTime(data.courseStats.totalTimeSpent)}
          subtitle="Total study time"
          color="blue"
        />
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label="Study Streak"
          value={`${data.streak.current} days`}
          subtitle={`Best: ${data.streak.longest} days`}
          color="orange"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Playback Speed"
          value={`${data.courseStats.averageSpeed}x`}
          subtitle="Average speed"
          color="green"
        />
      </div>

      {/* Overview View */}
      {selectedView === "overview" && (
        <div className="space-y-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Weekly Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#9333ea" name="Minutes Studied" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Current Lesson Progress */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Current Lesson: {data.currentLesson.title}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-semibold text-purple-600">
                    {data.currentLesson.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.currentLesson.progress}%` }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(data.currentLesson.totalTimeSpent)} spent
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{data.currentLesson.watchCount}x watched</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streak View */}
      {selectedView === "streak" && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Study Streak Calendar
          </h3>

          {/* Streak Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">
                {data.streak.current}
              </p>
              <p className="text-sm text-gray-600 mt-1">Current Streak</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {data.streak.longest}
              </p>
              <p className="text-sm text-gray-600 mt-1">Longest Streak</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {data.streak.studyDates.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Study Days</p>
            </div>
          </div>

          {/* Calendar Grid (Last 30 days) */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              const dateStr = date.toISOString().split("T")[0];
              const hasStudied = data.streak.studyDates.includes(dateStr);
              const today = isToday(dateStr);

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    today ? "ring-2 ring-purple-600" : ""
                  } ${
                    hasStudied
                      ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                  title={dateStr}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sessions View */}
      {selectedView === "sessions" && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Recent Study Sessions
          </h3>
          <div className="space-y-4">
            {data.recentSessions.map((session, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {new Date(session.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm text-purple-600 font-medium">
                    {formatTime(session.duration)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {session.lessons.length} lessons studied
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  color: "purple" | "blue" | "orange" | "green";
}) {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className={`p-3 ${colorClasses[color]} rounded-lg w-fit mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
