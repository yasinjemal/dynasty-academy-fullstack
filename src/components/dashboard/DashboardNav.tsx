"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/shared/NotificationBell";
import ThemeToggle from "@/components/shared/ThemeToggle";
import UserProfileDropdown from "@/components/shared/UserProfileDropdown";

interface DashboardNavProps {
  userName: string;
  userImage?: string | null;
  userRole: string;
}

export default function DashboardNav({
  userName,
  userImage,
  userRole,
}: DashboardNavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-purple-200/50 dark:border-purple-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-lg md:text-xl">
                DA
              </span>
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dynasty Academy
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="text-sm">
                🎓 Courses
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="ghost" size="sm" className="text-sm">
                📚 Library
              </Button>
            </Link>
            <Link href="/duels">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border border-pink-500/30"
              >
                ⚔️ Duels
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/30"
              >
                🛒 Shop
              </Button>
            </Link>
            <Link href="/future-self">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 animate-pulse"
              >
                🔮 Future Self
              </Button>
            </Link>
            <Link href="/brain-sync">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30"
              >
                🧠 Brain Sync
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-sm">
                ✍️ Blog
              </Button>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart" className="md:hidden">
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

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-purple-200/30 dark:border-purple-900/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
        <div className="flex justify-around py-2 px-4">
          <Link
            href="/courses"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="text-lg">🎓</span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">
              Courses
            </span>
          </Link>
          <Link
            href="/library"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="text-lg">📚</span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">
              Library
            </span>
          </Link>
          <Link
            href="/duels"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="text-lg">⚔️</span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">
              Duels
            </span>
          </Link>
          <Link
            href="/marketplace"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="text-lg">🛒</span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">
              Shop
            </span>
          </Link>
          <Link
            href="/achievements"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="text-lg">🏆</span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">
              Awards
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
