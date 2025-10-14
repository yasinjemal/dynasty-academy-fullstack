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
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Curated Library",
    description: "Access 500+ hand-picked books that transform lives",
    gradient: "from-orange-500 to-pink-600",
    color: "#f97316",
  },
  {
    icon: Zap,
    title: "Dynasty Points",
    description: "Earn rewards as you read, reflect, and grow",
    gradient: "from-yellow-500 to-orange-600",
    color: "#eab308",
  },
  {
    icon: Users,
    title: "Elite Community",
    description: "Connect with 10K+ ambitious learners worldwide",
    gradient: "from-blue-500 to-purple-600",
    color: "#3b82f6",
  },
  {
    icon: Crown,
    title: "Premium Experience",
    description: "Luxury reading with AI-powered insights",
    gradient: "from-purple-500 to-pink-600",
    color: "#a855f7",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set goals, track progress, achieve greatness",
    gradient: "from-green-500 to-emerald-600",
    color: "#22c55e",
  },
  {
    icon: Flame,
    title: "Streak System",
    description: "Build habits that stick with daily streaks",
    gradient: "from-red-500 to-orange-600",
    color: "#ef4444",
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
              Build Your Legacy
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A luxury learning experience crafted for those who demand excellence
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden">
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
                  className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 flex items-center justify-center`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />

                  {/* Pulse Effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient}`}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-pink-500 transition-all">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>

                {/* Floating Particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ backgroundColor: feature.color }}
                    initial={{
                      x: Math.random() * 100 - 50,
                      y: Math.random() * 100 - 50,
                      opacity: 0,
                    }}
                    whileHover={{
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
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
          <motion.button
            className="px-10 py-5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold text-white text-lg relative overflow-hidden group"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(249, 115, 22, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              See All Features
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
