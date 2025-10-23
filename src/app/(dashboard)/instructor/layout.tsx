"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
} from "lucide-react";

interface InstructorLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    href: "/instructor/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/instructor/courses",
    label: "My Courses",
    icon: BookOpen,
  },
  {
    href: "/instructor/revenue",
    label: "Revenue",
    icon: DollarSign,
    badge: "New",
  },
  {
    href: "/instructor/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/instructor/students",
    label: "Students",
    icon: Users,
  },
  {
    href: "/instructor/messages",
    label: "Messages",
    icon: MessageSquare,
  },
  {
    href: "/instructor/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-purple-500/20 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-purple-500/20">
          <Link href="/instructor/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">👨‍🏫</span>
              </div>
              <div>
                <div className="font-bold text-white">Instructor Portal</div>
                <div className="text-xs text-gray-400">Dynasty Academy</div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white"
                      : "text-gray-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-xs rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || "I"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {session?.user?.name || "Instructor"}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {session?.user?.email}
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
