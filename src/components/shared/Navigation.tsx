"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  BookOpen,
  Users,
  GraduationCap,
  Briefcase,
  FileText,
  Brain,
  MessageSquare,
  Info,
  Mail,
  Home,
  ChevronRight,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/books", label: "Books", icon: BookOpen },
    { href: "/blog", label: "Blog", icon: FileText },
    { href: "/community", label: "Community", icon: Users, highlight: true },
    {
      href: "/become-instructor",
      label: "Teach",
      icon: GraduationCap,
      highlight: true,
    },
    {
      href: "/pdf-to-course",
      label: "PDF to Course",
      icon: FileText,
      highlight: true,
    },
    {
      href: "/onboarding",
      label: "Dynasty Brain",
      icon: Brain,
      highlight: true,
    },
    {
      href: "/study-rooms",
      label: "Study Rooms",
      icon: Users,
      highlight: true,
    },
    { href: "/career", label: "Career", icon: Briefcase, highlight: true },
    { href: "/works", label: "Works", icon: Briefcase },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      <nav className="border-b border-purple-100 dark:border-purple-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">DB</span>
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty Built Academy
              </span>
              <span className="sm:hidden text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navLinks.slice(1, 8).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors relative group py-2 ${
                    isActive(link.href)
                      ? "text-purple-600 dark:text-purple-400 font-semibold"
                      : "text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                  } ${link.highlight ? "font-medium" : ""}`}
                >
                  {link.label}
                  {link.highlight && (
                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                  )}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {status === "authenticated" ? (
                <>
                  <Link href="/dashboard" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="min-h-[44px]">
                      Dashboard
                    </Button>
                  </Link>
                  <Link
                    href={
                      session?.user?.username
                        ? `/@${session.user.username}`
                        : "/settings/profile"
                    }
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {session?.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="min-h-[44px]">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-h-[44px] px-4"
                    >
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Join</span>
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay & Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-gray-900 z-50 lg:hidden shadow-2xl overflow-y-auto safe-area-bottom"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between safe-area-top">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* User Section (if authenticated) */}
              {status === "authenticated" && session?.user && (
                <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {session.user.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        View Dashboard
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <div className="px-4 py-4">
                <nav className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl min-h-[48px] transition-all touch-manipulation ${
                          isActive(link.href)
                            ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${
                            isActive(link.href)
                              ? "text-purple-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span className="flex-1">{link.label}</span>
                        {link.highlight && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full">
                            New
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Auth Section (if not authenticated) */}
              {status !== "authenticated" && (
                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full min-h-[48px] text-base"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button className="w-full min-h-[48px] text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-400 text-center">
                  © 2024 Dynasty Built Academy
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
