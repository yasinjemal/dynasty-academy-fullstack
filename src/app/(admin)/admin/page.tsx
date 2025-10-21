"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalBlogPosts: number;
  totalOrders: number;
  totalRevenue: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    time: string;
  }>;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBooks: 0,
    totalBlogPosts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API calls
        // Simulating data for now
        setStats({
          totalUsers: 1248,
          totalBooks: 52,
          totalBlogPosts: 186,
          totalOrders: 423,
          totalRevenue: 12450.5,
          recentActivities: [
            {
              id: "1",
              type: "user",
              description: "New user registration: John Doe",
              time: "5 min ago",
            },
            {
              id: "2",
              type: "order",
              description: "New order #1234 - $49.99",
              time: "12 min ago",
            },
            {
              id: "3",
              type: "book",
              description: "Book updated: Advanced JavaScript",
              time: "1 hour ago",
            },
            {
              id: "4",
              type: "blog",
              description: "New blog post published",
              time: "2 hours ago",
            },
            {
              id: "5",
              type: "order",
              description: "Order #1233 completed",
              time: "3 hours ago",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
              👑
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {session?.user?.name || "Admin"}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Here's what's happening with your academy today
              </p>
            </div>
          </div>
        </div>

        {/* Animated Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          {/* Total Users */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">
                  Total Users
                </CardTitle>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                  👥
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold mb-1">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="inline-block w-4 h-4 rounded bg-white/30 flex items-center justify-center">
                  ↑
                </span>
                <span className="opacity-90">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Books */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">
                  Books
                </CardTitle>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                  📚
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold mb-1">{stats.totalBooks}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="inline-block w-4 h-4 rounded bg-white/30 flex items-center justify-center">
                  +
                </span>
                <span className="opacity-90">3 new this month</span>
              </div>
            </CardContent>
          </Card>

          {/* Blog Posts */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">
                  Blog Posts
                </CardTitle>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                  ✍️
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold mb-1">
                {stats.totalBlogPosts}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="inline-block w-4 h-4 rounded bg-white/30 flex items-center justify-center">
                  🔥
                </span>
                <span className="opacity-90">+8 this week</span>
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">
                  Orders
                </CardTitle>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                  🛒
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold mb-1">{stats.totalOrders}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="inline-block w-4 h-4 rounded bg-white/30 flex items-center justify-center">
                  ↑
                </span>
                <span className="opacity-90">+18% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-600 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">
                  Revenue
                </CardTitle>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                  💰
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold mb-1">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="inline-block w-4 h-4 rounded bg-white/30 flex items-center justify-center">
                  ↑
                </span>
                <span className="opacity-90">+25% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm">
                  📊
                </div>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {stats.recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-4 px-4 py-2 rounded-lg transition-colors duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg shadow-lg ${
                        activity.type === "user"
                          ? "bg-gradient-to-br from-purple-500 to-purple-700"
                          : activity.type === "order"
                          ? "bg-gradient-to-br from-orange-500 to-red-600"
                          : activity.type === "book"
                          ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                          : "bg-gradient-to-br from-green-500 to-emerald-600"
                      }`}
                    >
                      {activity.type === "user" && "👤"}
                      {activity.type === "order" && "🛒"}
                      {activity.type === "book" && "📚"}
                      {activity.type === "blog" && "📝"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <span>🕐</span>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm">
                  ⚡
                </div>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <Link href="/admin/course-generator">
                <Button className="w-full justify-start bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="mr-3 text-xl relative z-10">✨</span>
                  <span className="font-medium relative z-10">
                    AI Course Generator
                  </span>
                  <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full relative z-10">
                    NEW
                  </span>
                </Button>
              </Link>
              <Link href="/admin/lesson-generator">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="mr-3 text-xl relative z-10">📝</span>
                  <span className="font-medium relative z-10">
                    AI Lesson Generator
                  </span>
                  <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full relative z-10">
                    NEW
                  </span>
                </Button>
              </Link>
              <Link href="/admin/quiz-generator">
                <Button className="w-full justify-start bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="mr-3 text-xl relative z-10">🎯</span>
                  <span className="font-medium relative z-10">
                    AI Quiz Generator
                  </span>
                  <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full relative z-10">
                    NEW
                  </span>
                </Button>
              </Link>
              <Link href="/admin/publisher">
                <Button className="w-full justify-start bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="mr-3 text-xl relative z-10">🚀</span>
                  <span className="font-medium relative z-10">
                    AI Publisher
                  </span>
                  <span className="ml-auto text-xs bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-900 px-2 py-0.5 rounded-full font-bold relative z-10 animate-pulse">
                    LIVE
                  </span>
                </Button>
              </Link>
              <Link href="/admin/ai-insights">
                <Button className="w-full justify-start bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                  <span className="mr-3 text-xl">🤖</span>
                  <span className="font-medium">AI Insights</span>
                </Button>
              </Link>
              <Link href="/admin/rag-management">
                <Button className="w-full justify-start bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                  <span className="mr-3 text-xl">🎛️</span>
                  <span className="font-medium">RAG Management</span>
                </Button>
              </Link>
              <Link href="/admin/books">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                  <span className="mr-3 text-xl">📚</span>
                  <span className="font-medium">Manage Books</span>
                </Button>
              </Link>
              <Link href="/admin/blog">
                <Button className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                  <span className="mr-3 text-xl">✍️</span>
                  <span className="font-medium">Create Blog Post</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                  <span className="mr-3 text-xl">👥</span>
                  <span className="font-medium">View Users</span>
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button className="w-full justify-start bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                  <span className="mr-3 text-xl">🛒</span>
                  <span className="font-medium">View Orders</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
