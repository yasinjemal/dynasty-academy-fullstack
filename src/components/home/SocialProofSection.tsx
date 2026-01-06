"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  Trophy,
  Flame,
  Star,
  TrendingUp,
  Crown,
  Medal,
  Zap,
} from "lucide-react";
import type {
  HomepageStats,
  TopLearner,
  RecentActivity,
} from "@/lib/api/homepage-data";

interface SocialProofSectionProps {
  stats: HomepageStats;
  topLearners: TopLearner[];
  recentActivity: RecentActivity[];
}

export default function SocialProofSection({
  stats,
  topLearners,
  recentActivity,
}: SocialProofSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const mainStats = [
    {
      icon: Users,
      value: stats.totalUsers.toLocaleString(),
      suffix: "+",
      label: "Active Learners",
      color: "from-blue-400 to-cyan-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: BookOpen,
      value: stats.totalBooksRead.toLocaleString(),
      suffix: "+",
      label: "Books Completed",
      color: "from-orange-400 to-amber-400",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: GraduationCap,
      value: stats.totalCertificates.toLocaleString(),
      suffix: "+",
      label: "Certificates Earned",
      color: "from-violet-400 to-purple-400",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: Trophy,
      value: "99",
      suffix: "%",
      label: "Success Rate",
      color: "from-green-400 to-emerald-400",
      bgColor: "bg-green-500/10",
    },
  ];

  const medalColors = [
    "from-amber-400 to-yellow-500", // Gold
    "from-gray-300 to-gray-400", // Silver
    "from-amber-600 to-orange-600", // Bronze
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-[#030014] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/10 to-transparent" />

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/50 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {mainStats.map((stat, index) => (
            <motion.div
              key={index}
              className={`relative p-6 rounded-2xl ${stat.bgColor} border border-white/10 backdrop-blur-xl overflow-hidden`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 mb-4`}
              >
                <stat.icon className="w-full h-full text-white" />
              </div>

              {/* Value */}
              <div className="flex items-baseline gap-1">
                <motion.span
                  className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                >
                  {stat.value}
                </motion.span>
                <span
                  className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <p className="text-gray-400 mt-2 font-medium">{stat.label}</p>

              {/* Glow Effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* Leaderboard & Activity Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Learners Leaderboard */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Top Learners</h3>
                  <p className="text-sm text-gray-400">
                    This month's champions
                  </p>
                </div>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="p-4">
              {topLearners.map((learner, index) => (
                <motion.div
                  key={learner.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  {/* Rank */}
                  <div className="relative">
                    {index < 3 ? (
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${medalColors[index]} flex items-center justify-center shadow-lg`}
                      >
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-400">
                          #{index + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  {learner.image ? (
                    <Image
                      src={learner.image}
                      alt={String(learner.name || "Learner")}
                      width={44}
                      height={44}
                      className="rounded-full ring-2 ring-white/20"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {String(learner.name || "D").charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">
                      {learner.name || "Dynasty Member"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {learner.booksRead} books • {learner.coursesCompleted}{" "}
                      courses
                    </p>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">
                        {learner.xp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View All */}
            <div className="p-4 border-t border-white/10">
              <Link href="/leaderboard">
                <motion.button
                  className="w-full py-3 text-center text-orange-400 font-semibold hover:bg-orange-500/10 rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Full Leaderboard →
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Live Activity
                    </h3>
                    <p className="text-sm text-gray-400">
                      What's happening now
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  <span className="text-sm text-green-400 font-medium">
                    Live
                  </span>
                </div>
              </div>
            </div>

            {/* Activity List */}
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  {/* Avatar */}
                  {activity.userImage ? (
                    <Image
                      src={activity.userImage}
                      alt={activity.userName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {activity.userName.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white">
                        {activity.userName}
                      </span>{" "}
                      <span className="text-gray-400">{activity.action}</span>{" "}
                      <span className="font-medium text-orange-400">
                        {activity.target}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timeAgo}
                    </p>
                  </div>

                  {/* Type Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === "book_completed"
                        ? "bg-orange-500/20 text-orange-400"
                        : activity.type === "course_enrolled"
                        ? "bg-violet-500/20 text-violet-400"
                        : activity.type === "certificate_earned"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {activity.type === "book_completed" ? (
                      <BookOpen className="w-4 h-4" />
                    ) : activity.type === "course_enrolled" ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : activity.type === "certificate_earned" ? (
                      <Trophy className="w-4 h-4" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Join CTA */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-r from-violet-500/5 to-pink-500/5">
              <Link href="/register">
                <motion.button
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Flame className="w-5 h-5" />
                  Join the Community
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
