"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserProfileDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-lg"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-purple-500 shadow-lg">
            {getInitials(session.user.name || "U")}
          </div>
        )}
        <svg
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-lg">
                  {getInitials(session.user.name || "U")}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {session.user.name}
                </h3>
                <p className="text-xs text-white/80 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href={
                session.user.username
                  ? `/@${session.user.username}`
                  : "/settings/profile"
              }
              onClick={() => setIsOpen(false)}
            >
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    My Profile
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    View and edit profile
                  </p>
                </div>
              </button>
            </Link>

            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Dashboard
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    View your stats
                  </p>
                </div>
              </button>
            </Link>

            <Link href="/orders" onClick={() => setIsOpen(false)}>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-lg">📦</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    My Orders
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Track your purchases
                  </p>
                </div>
              </button>
            </Link>

            <Link href="/achievements" onClick={() => setIsOpen(false)}>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Achievements
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    View your badges
                  </p>
                </div>
              </button>
            </Link>

            {session.user.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setIsOpen(false)}>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-lg">⚙️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Admin Panel
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Manage the platform
                    </p>
                  </div>
                </button>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-lg">🚪</span>
              </div>
              <div>
                <p className="font-semibold">Sign Out</p>
                <p className="text-xs opacity-80">See you soon!</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
