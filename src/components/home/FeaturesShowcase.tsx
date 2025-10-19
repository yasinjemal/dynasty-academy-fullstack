"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BookOpen,
  Zap,
  Users,
  Crown,
  Target,
  TrendingUp,
  Flame,
  Award,
  GraduationCap,
  FileText,
  MessageSquare,
  Heart,
  Brain,
  Sparkles,
  Video,
  Music,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Premium Books Library",
    description:
      "500+ curated books with AI-powered reading modes, co-reading, and luxury listen experience",
    gradient: "from-orange-500 to-pink-600",
    color: "#f97316",
    badge: "Most Popular",
  },
  {
    icon: GraduationCap,
    title: "Interactive Courses",
    description:
      "Professional courses with video lessons, quizzes, certificates, and progress tracking",
    gradient: "from-blue-500 to-cyan-600",
    color: "#3b82f6",
    badge: "New",
  },
  {
    icon: FileText,
    title: "PDF-to-Course AI",
    description:
      "Upload any PDF and generate a complete 12-lesson course in 2 minutes with AI",
    gradient: "from-purple-500 to-pink-600",
    color: "#a855f7",
    badge: "Revolutionary",
  },
  {
    icon: MessageSquare,
    title: "Community Feed",
    description:
      "Share insights, discuss books, post reflections, and connect with 10K+ learners",
    gradient: "from-green-500 to-emerald-600",
    color: "#22c55e",
  },
  {
    icon: Users,
    title: "Co-Reading Experience",
    description:
      "Read together in real-time with live chat, reactions, and presence indicators",
    gradient: "from-pink-500 to-rose-600",
    color: "#ec4899",
  },
  {
    icon: Music,
    title: "AI Audio Intelligence",
    description:
      "Professional text-to-speech with 8 neural voices, speed control, and ambient sounds",
    gradient: "from-indigo-500 to-purple-600",
    color: "#6366f1",
  },
  {
    icon: Brain,
    title: "Dynasty Brain AI",
    description:
      "AI tutor, personalized learning paths, skill assessments, and smart recommendations",
    gradient: "from-violet-500 to-fuchsia-600",
    color: "#8b5cf6",
    badge: "AI-Powered",
  },
  {
    icon: Video,
    title: "Study Rooms",
    description:
      "Live collaborative learning spaces with video, screen sharing, and group activities",
    gradient: "from-cyan-500 to-blue-600",
    color: "#06b6d4",
  },
  {
    icon: Zap,
    title: "Dynasty Points",
    description:
      "Gamification system with XP, levels, achievements, daily streaks, and leaderboards",
    gradient: "from-yellow-500 to-orange-600",
    color: "#eab308",
  },
  {
    icon: Heart,
    title: "Social Learning",
    description:
      "Follow users, like posts, comment on reflections, and build your learning network",
    gradient: "from-red-500 to-pink-600",
    color: "#ef4444",
  },
  {
    icon: Crown,
    title: "Career Dashboard",
    description:
      "Track progress, view analytics, manage goals, and showcase achievements",
    gradient: "from-amber-500 to-orange-600",
    color: "#f59e0b",
  },
  {
    icon: Sparkles,
    title: "Premium Experience",
    description:
      "Luxury UI with glass morphism, 3D effects, smooth animations, and dark mode",
    gradient: "from-slate-500 to-zinc-600",
    color: "#64748b",
  },
];

export default function FeaturesShowcase() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <div
      ref={containerRef}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-[#0A1628] to-[#0A0E27]"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6"
            animate={{
              boxShadow: [
                "0 0 20px rgba(249, 115, 22, 0.2)",
                "0 0 40px rgba(249, 115, 22, 0.4)",
                "0 0 20px rgba(249, 115, 22, 0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">
              Premium Features
            </span>
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Master Your Learning Journey
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Books, Courses, AI Tools, Community, and More - All in One Premium
            Platform
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden">
                {/* Badge */}
                {feature.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                      {feature.badge}
                    </span>
                  </div>
                )}
                {/* Glow Effect on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  initial={{
                    background:
                      "linear-gradient(45deg, transparent, transparent)",
                  }}
                  whileHover={{
                    background: `linear-gradient(45deg, ${feature.color}22, transparent, ${feature.color}22)`,
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Icon Container */}
                <motion.div
                  className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 flex items-center justify-center`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-7 h-7 text-white" />

                  {/* Pulse Effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient}`}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-pink-500 transition-all">
                  {feature.title}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>

                {/* Floating Particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      opacity: 0,
                      backgroundColor: feature.color,
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                    }}
                    whileHover={{
                      x: [(i - 1) * 30, (i - 1) * 50],
                      y: [(i - 1) * 20, (i - 1) * 40],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.a
            href="/dashboard"
            className="inline-block px-10 py-5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold text-white text-lg relative overflow-hidden group cursor-pointer"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(249, 115, 22, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Start Learning Now - It's Free
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>

          <p className="text-sm text-gray-500 mt-4">
            Join 10,000+ learners • No credit card required
          </p>
        </motion.div>
      </div>
    </div>
  );
}
