"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Trophy,
  TrendingUp,
  Flame,
  Star,
  Award,
  Zap,
  Target,
  Calendar,
  Users,
  ChevronRight,
} from "lucide-react";

interface EngagementData {
  xp: number;
  level: number;
  levelInfo: {
    level: number;
    title: string;
    minXP: number;
    maxXP: number;
  };
  progress: {
    current: number;
    needed: number;
    percentage: number;
  };
  rank: {
    position: number;
    totalUsers: number;
    percentile: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
    freezesAvailable: number;
    milestones: number[];
  };
  recentXP: {
    action: string;
    xp: number;
    date: string;
  }[];
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  image: string | null;
  xp: number;
  level: number;
  rank: number;
}

export default function StudentEngagementPage() {
  const { data: session } = useSession();
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard">(
    "overview"
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchEngagementData();
      fetchLeaderboard();
    }
  }, [session]);

  const fetchEngagementData = async () => {
    try {
      console.log("Fetching engagement data...");
      const response = await fetch("/api/engagement/xp");
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Engagement data:", data);
        setEngagement(data);
      } else {
        const errorData = await response.json();
        console.error("API error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching engagement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        "/api/engagement/leaderboard?period=all_time&limit=10"
      );
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your progress...</div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">No engagement data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Your Journey
            </h1>
            <p className="text-purple-200 mt-2">
              Track your progress and compete with others
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {engagement.xp.toLocaleString()}
            </div>
            <div className="text-purple-200 text-sm">Total XP</div>
          </div>
        </div>

        {/* Level Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-purple-200 text-sm mb-1">Current Level</div>
              <div className="text-4xl font-bold text-white">
                Level {engagement.level}
              </div>
              <div className="text-2xl text-purple-300 mt-1">
                {engagement.levelInfo.title}
              </div>
            </div>
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                <Star className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-purple-900 font-bold px-4 py-2 rounded-full text-lg shadow-lg">
                #{engagement.rank.position}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-200">
                {engagement.progress.current.toLocaleString()} XP
              </span>
              <span className="text-purple-200">
                Next Level: {engagement.progress.needed.toLocaleString()} XP
              </span>
            </div>
            <div className="relative h-6 bg-black/20 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-1000 ease-out flex items-center justify-center"
                style={{ width: `${engagement.progress.percentage}%` }}
              >
                <span className="text-white font-bold text-xs">
                  {engagement.progress.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-12 h-12 text-white" />
              <div className="text-right">
                <div className="text-4xl font-bold text-white">
                  {engagement.streak.currentStreak}
                </div>
                <div className="text-orange-100 text-sm">Day Streak</div>
              </div>
            </div>
            <div className="space-y-2 text-white/90 text-sm">
              <div className="flex justify-between">
                <span>Longest:</span>
                <span className="font-bold">
                  {engagement.streak.longestStreak} days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Freezes:</span>
                <span className="font-bold">
                  {engagement.streak.freezesAvailable} available
                </span>
              </div>
              {engagement.streak.milestones.length > 0 && (
                <div className="pt-2 border-t border-white/20">
                  <div className="text-xs mb-1">Milestones Reached:</div>
                  <div className="flex gap-2 flex-wrap">
                    {engagement.streak.milestones.map((milestone) => (
                      <span
                        key={milestone}
                        className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold"
                      >
                        {milestone}d
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rank Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-12 h-12 text-yellow-300" />
              <div className="text-right">
                <div className="text-4xl font-bold text-white">
                  #{engagement.rank.position}
                </div>
                <div className="text-purple-100 text-sm">Global Rank</div>
              </div>
            </div>
            <div className="space-y-2 text-white/90 text-sm">
              <div className="flex justify-between">
                <span>Total Students:</span>
                <span className="font-bold">{engagement.rank.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span>Top Percentile:</span>
                <span className="font-bold">{engagement.rank.percentile}%</span>
              </div>
              <div className="pt-2 border-t border-white/20">
                <div className="text-xs text-center">
                  You&apos;re ahead of {100 - engagement.rank.percentile}% of
                  students! 🎉
                </div>
              </div>
            </div>
          </div>

          {/* Level Info Card */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-12 h-12 text-yellow-300" />
              <div className="text-right">
                <div className="text-4xl font-bold text-white">
                  {engagement.level}
                </div>
                <div className="text-cyan-100 text-sm">Current Level</div>
              </div>
            </div>
            <div className="space-y-2 text-white/90 text-sm">
              <div className="flex justify-between">
                <span>Title:</span>
                <span className="font-bold">{engagement.levelInfo.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Range:</span>
                <span className="font-bold">
                  {engagement.levelInfo.minXP.toLocaleString()} -{" "}
                  {engagement.levelInfo.maxXP.toLocaleString()} XP
                </span>
              </div>
              <div className="pt-2 border-t border-white/20">
                <div className="text-xs text-center">
                  Keep learning to reach the next level! 🚀
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/20">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-4 font-semibold transition-all ${
              activeTab === "overview"
                ? "text-white border-b-2 border-purple-400"
                : "text-purple-300 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`pb-4 px-4 font-semibold transition-all ${
              activeTab === "leaderboard"
                ? "text-white border-b-2 border-purple-400"
                : "text-purple-300 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Leaderboard
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Streak Calendar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-400" />
                Activity Streak
              </h3>
              <div className="bg-black/20 rounded-xl p-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🔥</div>
                  <div>
                    <div className="text-5xl font-bold text-white mb-2">
                      {engagement.streak.currentStreak}
                    </div>
                    <div className="text-purple-200">Days in a row!</div>
                  </div>
                  {engagement.streak.currentStreak > 0 && (
                    <div className="text-sm text-purple-300">
                      Last active:{" "}
                      {new Date(
                        engagement.streak.lastActivityDate
                      ).toLocaleDateString()}
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/20">
                    <div className="text-sm text-purple-200 mb-2">
                      Next Milestone:
                    </div>
                    <div className="flex justify-center gap-2">
                      {[7, 14, 30, 60, 100].map((milestone) => (
                        <div
                          key={milestone}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                            engagement.streak.milestones.includes(milestone)
                              ? "bg-green-500 text-white"
                              : engagement.streak.currentStreak >= milestone
                              ? "bg-yellow-500 text-white"
                              : "bg-white/20 text-purple-300"
                          }`}
                        >
                          {milestone}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent XP Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Recent Activity
              </h3>
              {engagement.recentXP && engagement.recentXP.length > 0 ? (
                <div className="space-y-3">
                  {engagement.recentXP.slice(0, 5).map((activity, index) => (
                    <div
                      key={index}
                      className="bg-black/20 rounded-lg p-4 flex items-center justify-between hover:bg-black/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {activity.action
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          <div className="text-purple-300 text-sm">
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">
                        +{activity.xp}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-purple-300 py-8">
                  <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <div>Start learning to earn XP!</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Top Students
            </h3>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === session?.user?.id;
                return (
                  <div
                    key={entry.userId}
                    className={`rounded-xl p-4 flex items-center justify-between transition-all ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg scale-105"
                        : "bg-black/20 hover:bg-black/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                            : index === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {entry.image ? (
                        <img
                          src={entry.image}
                          alt={entry.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="text-xs bg-yellow-400 text-purple-900 px-2 py-1 rounded-full font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-purple-300 text-sm">
                          Level {entry.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400">
                        {entry.xp.toLocaleString()}
                      </div>
                      <div className="text-purple-300 text-sm">XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Ways to Earn XP</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { action: "Complete Lesson", xp: 50, icon: "📚" },
              { action: "Finish Course", xp: 500, icon: "🎓" },
              { action: "Perfect Quiz", xp: 100, icon: "💯" },
              { action: "Daily Login", xp: 10, icon: "📅" },
              { action: "7 Day Streak", xp: 50, icon: "🔥" },
              { action: "30 Day Streak", xp: 200, icon: "🏆" },
              { action: "Help Others", xp: 25, icon: "🤝" },
              { action: "Create Content", xp: 75, icon: "✍️" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-black/20 rounded-lg p-4 text-center hover:bg-black/30 transition-all group cursor-pointer"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-white font-semibold text-sm mb-1">
                  {item.action}
                </div>
                <div className="text-yellow-400 font-bold">+{item.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
