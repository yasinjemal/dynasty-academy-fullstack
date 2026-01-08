"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  GraduationCap,
  User,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  requireAuth?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    requireAuth: true,
  },
];

const guestItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/login", label: "Sign In", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show on certain pages
  const hiddenPaths = ["/login", "/register", "/onboarding"];
  if (hiddenPaths.some((path) => pathname?.startsWith(path))) {
    return null;
  }

  const items = status === "authenticated" ? navItems : guestItems;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <nav className="mobile-bottom-nav md:hidden">
      <div className="mobile-bottom-nav-inner">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? "active" : ""}`}
            >
              <motion.div
                initial={false}
                animate={active ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
