"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
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
  AlertTriangle,
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication and authorization
    if (status === "loading") {
      return; // Still loading session
    }

    if (status === "unauthenticated") {
      // Not logged in - redirect to login
      router.push("/auth/signin?callbackUrl=/instructor/dashboard");
      return;
    }

    if (session?.user) {
      // Check if user has INSTRUCTOR or ADMIN role
      const userRole = session.user.role;
      
      if (userRole === "INSTRUCTOR" || userRole === "ADMIN") {
        setIsAuthorized(true);
        setIsLoading(false);
      } else {
        // User doesn't have instructor access
        setIsAuthorized(false);
        setIsLoading(false);
        // Redirect to become instructor page after 3 seconds
        setTimeout(() => {
          router.push("/become-instructor");
        }, 3000);
      }
    }
  }, [session, status, router]);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthorized access
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-900/50 border border-red-500/20 rounded-xl p-8 backdrop-blur-sm text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You need to be an approved instructor to access this dashboard.
          </p>
          <div className="space-y-3">
            <Link href="/become-instructor">
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-white transition-all">
                Apply to Become an Instructor
              </button>
            </Link>
            <Link href="/">
              <button className="w-full py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 rounded-lg font-semibold text-white transition-all">
                Back to Home
              </button>
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Redirecting in 3 seconds...
          </p>
        </motion.div>
      </div>
    );
  }

  // Authorized - show instructor dashboard

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
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
