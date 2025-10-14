"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles,
  Zap,
  Crown,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628]"
    >
      {/* Animated Grid Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(to right, rgba(249, 115, 22, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(249, 115, 22, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* Floating Orbs */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${
              i % 3 === 0
                ? "rgba(249, 115, 22, 0.1)"
                : i % 3 === 1
                ? "rgba(168, 85, 247, 0.1)"
                : "rgba(59, 130, 246, 0.1)"
            } 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      <motion.div
        className="relative z-10 flex items-center justify-center min-h-screen px-4"
        style={{ y, opacity, scale }}
      >
        <div className="max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Glowing Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(249, 115, 22, 0.3)",
                    "0 0 40px rgba(249, 115, 22, 0.6)",
                    "0 0 20px rgba(249, 115, 22, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">
                  Welcome to Dynasty Academy
                </span>
              </motion.div>

              {/* Main Heading with Morphing Effect */}
              <motion.h1
                className="text-6xl lg:text-7xl font-black mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  Build Your
                </span>
                <br />
                <motion.span
                  className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Dynasty
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Transform your life through{" "}
                <span className="text-orange-400 font-semibold">knowledge</span>
                , build your{" "}
                <span className="text-purple-400 font-semibold">legacy</span>,
                and join a community of{" "}
                <span className="text-blue-400 font-semibold">greatness</span>.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold text-white text-lg relative overflow-hidden group"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(249, 115, 22, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Start Your Journey
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <motion.button
                  className="px-8 py-4 bg-white/5 backdrop-blur-lg border-2 border-white/10 rounded-xl font-bold text-white text-lg"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(249, 115, 22, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Explore Books
                  </span>
                </motion.button>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  { icon: Users, value: "10K+", label: "Members" },
                  { icon: BookOpen, value: "500+", label: "Books" },
                  { icon: TrendingUp, value: "99%", label: "Success Rate" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                    <div className="text-2xl font-black text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: 3D Book Display */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="relative w-full h-[600px] flex items-center justify-center">
                {/* Floating Book */}
                <motion.div
                  className="relative"
                  animate={{
                    y: [0, -20, 0],
                    rotateY: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className="relative w-80 h-96 rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 shadow-2xl shadow-orange-500/50 overflow-hidden"
                    style={{ transform: "rotateY(-15deg) rotateX(5deg)" }}
                  >
                    {/* Book Spine */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-b from-orange-700 to-purple-900" />

                    {/* Book Cover Content */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                      <div>
                        <Crown className="w-12 h-12 text-white/80 mb-4" />
                        <h3 className="text-3xl font-black text-white mb-2">
                          The Dynasty
                          <br />
                          Blueprint
                        </h3>
                        <p className="text-white/60 text-sm">
                          Your Path to Greatness
                        </p>
                      </div>
                      <div className="text-white/40 text-xs">
                        Dynasty Academy
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                  </div>

                  {/* Floating Particles around Book */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-orange-400"
                      style={{
                        left: "50%",
                        top: "50%",
                      }}
                      animate={{
                        x: [0, Math.cos((i * Math.PI) / 4) * 150, 0],
                        y: [0, Math.sin((i * Math.PI) / 4) * 150, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 blur-3xl -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
