"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  PlusCircle,
  BarChart3,
  BookOpen,
  X,
  ChevronUp,
} from "lucide-react";

export default function InstructorQuickAccess() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for authenticated users
  if (!session) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2"
            >
              {/* Create Course */}
              <Link href="/instructor/create-course">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all whitespace-nowrap"
                >
                  <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Create Course
                </motion.button>
              </Link>

              {/* My Courses */}
              <Link href="/instructor/courses">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all whitespace-nowrap"
                >
                  <BookOpen className="w-5 h-5" />
                  My Courses
                </motion.button>
              </Link>

              {/* Dashboard */}
              <Link href="/instructor/courses">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl text-white font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all whitespace-nowrap"
                >
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all ${
            isOpen
              ? "bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/50"
              : "bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 shadow-purple-500/50"
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <GraduationCap className="w-7 h-7 text-white" />
                {/* Pulse animation for "new" indicator */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Tooltip when closed */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-20 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 rounded-lg text-white text-sm font-medium shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Instructor Tools
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
          </motion.div>
        )}
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
}
