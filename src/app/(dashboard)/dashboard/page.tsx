"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/shared/NotificationBell";
import ThemeToggle from "@/components/shared/ThemeToggle";
import UserProfileDropdown from "@/components/shared/UserProfileDropdown";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-white text-lg font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-purple-200/50 dark:border-purple-900/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link
              href="/"
              className="flex items-center space-x-2 md:space-x-3 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-white font-bold text-lg md:text-xl">
                  DB
                </span>
              </div>
              <span className="hidden sm:block text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty Built Academy
              </span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Link href="/courses">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  🎓 Courses
                </Button>
              </Link>
              <Link href="/books">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  📚 Books
                </Button>
              </Link>
              <Link href="/blog">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  ✍️ Blog
                </Button>
              </Link>
              <Link href="/achievements" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  🏆
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="sm">
                  🛒
                </Button>
              </Link>
              <ThemeToggle />
              <NotificationBell />
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        {/* Hero Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Welcome back, {session.user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Grid with Hover Effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10">
          {/* Total Books Card */}
          <div className="group relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-5 sm:p-6 md:p-7 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <span className="text-xs md:text-sm text-white/80 font-medium">
                  This Month
                </span>
              </div>
              <p className="text-white/90 text-sm md:text-base font-medium mb-2">
                Total Books
              </p>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                0
              </p>
              <div className="flex items-center text-white/80 text-xs md:text-sm">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  0% from last month
                </span>
              </div>
            </div>
          </div>

          {/* Blog Posts Card */}
          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-5 sm:p-6 md:p-7 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <span className="text-xs md:text-sm text-white/80 font-medium">
                  Published
                </span>
              </div>
              <p className="text-white/90 text-sm md:text-base font-medium mb-2">
                Blog Posts
              </p>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                0
              </p>
              <div className="flex items-center text-white/80 text-xs md:text-sm">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Start writing today!
                </span>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="group relative bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-5 sm:p-6 md:p-7 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <span className="text-xs md:text-sm text-white/80 font-medium">
                  Completed
                </span>
              </div>
              <p className="text-white/90 text-sm md:text-base font-medium mb-2">
                Orders
              </p>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                0
              </p>
              <div className="flex items-center text-white/80 text-xs md:text-sm">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  $0.00 total revenue
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Modern Card Grid */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-6 md:p-7 lg:p-8 border border-purple-200/50 dark:border-purple-800/50 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Quick Actions ⚡
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            <Link
              href="/courses"
              className="group relative bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-indigo-200/50 dark:border-indigo-700/50"
            >
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 bg-indigo-200/50 dark:bg-indigo-700/50 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  My Courses
                </span>
              </div>
            </Link>

            <Link
              href="/books"
              className="group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-lg hover:shadow-purple-200/50 dark:hover:shadow-purple-900/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-purple-200/50 dark:border-purple-700/50"
            >
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 bg-purple-200/50 dark:bg-purple-700/50 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  Browse Books
                </span>
              </div>
            </Link>

            <Link
              href="/blog"
              className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-blue-200/50 dark:border-blue-700/50"
            >
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 bg-blue-200/50 dark:bg-blue-700/50 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  Read Blog
                </span>
              </div>
            </Link>

            <Link
              href="/achievements"
              className="group relative bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-lg hover:shadow-yellow-200/50 dark:hover:shadow-yellow-900/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-yellow-200/50 dark:border-yellow-700/50"
            >
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 bg-yellow-200/50 dark:bg-yellow-700/50 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  Achievements
                </span>
              </div>
            </Link>

            <Link
              href="/leaderboard"
              className="group relative bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-lg hover:shadow-green-200/50 dark:hover:shadow-green-900/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-green-200/50 dark:border-green-700/50"
            >
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 bg-green-200/50 dark:bg-green-700/50 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  Leaderboard
                </span>
              </div>
            </Link>
          </div>

          {/* Community CTA - Different for Users vs Admins */}
          <div className="mt-6 sm:mt-8">
            {session.user?.role === "ADMIN" ? (
              <Link href="/admin/blog">
                <button className="group relative w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
                    <div
                      className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl animate-pulse"
                      style={{ animationDelay: "1s" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-xl sm:text-2xl font-bold">
                          ✍️ Write a Blog Post
                        </p>
                        <p className="text-sm text-white/80 mt-1">
                          Share your knowledge and insights with the community
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 group-hover:translate-x-2 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </button>
              </Link>
            ) : (
              <Link href="/community">
                <button className="group relative w-full bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-green-500/50 overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
                    <div
                      className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl animate-pulse"
                      style={{ animationDelay: "1s" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-xl sm:text-2xl font-bold">
                          🌟 Join the Community
                        </p>
                        <p className="text-sm text-white/80 mt-1">
                          Share ideas, ask questions, and connect with fellow
                          learners
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 group-hover:translate-x-2 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Account Info - Modern Profile Card */}
        <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/20 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-6 md:p-7 lg:p-8 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 border-3 md:border-4 border-white dark:border-gray-900 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Account Information
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                Manage your profile and preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-purple-100 dark:border-purple-800/30 hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Full Name
              </p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
                {session.user?.name}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-purple-100 dark:border-purple-800/30 hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Email Address
              </p>
              <p
                className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white truncate"
                title={session.user?.email || ""}
              >
                {session.user?.email}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-purple-100 dark:border-purple-800/30 hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Account Role
              </p>
              <span
                className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold ${
                  session.user?.role === "ADMIN"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {session.user?.role === "ADMIN" && "👑 "}
                {session.user?.role}
              </span>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 border border-purple-100 dark:border-purple-800/30 hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Member Since
              </p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/settings/profile" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-sm sm:text-base">
                ✏️ Edit Profile
              </Button>
            </Link>
            {session.user?.role === "ADMIN" && (
              <Link href="/admin" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 font-semibold py-5 sm:py-6 rounded-xl hover:scale-[1.02] transition-all text-sm sm:text-base"
                >
                  👑 Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
