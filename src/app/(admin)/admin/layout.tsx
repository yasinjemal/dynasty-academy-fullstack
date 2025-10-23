"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/courses", label: "Courses", icon: "🎓" },
  { href: "/admin/books", label: "Books", icon: "📚" },
  { href: "/admin/blog", label: "Blog Posts", icon: "📝" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  {
    href: "/admin/instructor-applications",
    label: "Instructor Applications",
    icon: "👨‍🏫",
  },
  {
    href: "/admin/governance",
    label: "Governance & Audit",
    icon: "⚖️",
  },
  {
    href: "/admin/gamification-demo",
    label: "🎮 Gamification Demo",
    icon: "🎮",
  },
  {
    href: "/admin/audio-intelligence",
    label: "🧠 Audio Intelligence",
    icon: "🧠",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DB</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">
                Dynasty Built
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Admin Panel
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session?.user?.name || "Admin"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
