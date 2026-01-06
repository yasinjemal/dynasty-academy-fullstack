"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  Headphones,
  BookOpen,
  Trophy,
  Users,
  Zap,
  Target,
  LineChart,
  Shield,
  Bot,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description:
      "Personal AI tutor that adapts to your learning style, answers questions, and creates custom study plans.",
    color: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
  },
  {
    icon: Headphones,
    title: "Audio Intelligence",
    description:
      "Listen to any book with professional AI narration. Learn on the go with podcast-quality audio.",
    color: "from-pink-500 to-rose-600",
    bgGlow: "bg-pink-500/20",
  },
  {
    icon: Target,
    title: "Smart Quizzes",
    description:
      "AI-generated quizzes that test comprehension and reinforce key concepts after every chapter.",
    color: "from-orange-500 to-amber-600",
    bgGlow: "bg-orange-500/20",
  },
  {
    icon: Trophy,
    title: "Earn Certificates",
    description:
      "Complete courses and books to earn verifiable certificates. Showcase your achievements.",
    color: "from-amber-500 to-yellow-600",
    bgGlow: "bg-amber-500/20",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description:
      "Detailed analytics on your learning journey. Track XP, streaks, and mastery levels.",
    color: "from-green-500 to-emerald-600",
    bgGlow: "bg-green-500/20",
  },
  {
    icon: Users,
    title: "Community Learning",
    description:
      "Join study groups, compete on leaderboards, and learn alongside ambitious peers.",
    color: "from-blue-500 to-cyan-600",
    bgGlow: "bg-blue-500/20",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-[#030014] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-orange-950/20" />

        {/* Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-400">
              Cutting-Edge Technology
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-white">Learn Smarter with </span>
            <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-violet-500 bg-clip-text text-transparent">
              AI
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the future of education with our revolutionary AI-powered
            platform that makes learning faster, more effective, and actually
            enjoyable.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="group relative h-full p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-white/20 transition-all"
                whileHover={{ y: -8 }}
              >
                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon className="w-full h-full text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Glow */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 ${feature.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity`}
                />

                {/* Corner Accent */}
                <div
                  className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-5 rounded-tl-full`}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href="/features">
            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 hover:border-pink-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="w-5 h-5" />
              Explore All AI Features
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
