"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  TrendingUp,
  Mic,
  Users,
  Palette,
  Music,
  Award,
  Gift,
  Sparkles,
  Zap,
  BookOpen,
  Check,
  ArrowRight,
  Crown,
  Upload,
} from "lucide-react";
import Link from "next/link";

interface BonusFeature {
  id: string;
  icon: any;
  title: string;
  description: string;
  value: string;
  status: "live" | "coming-soon";
  demoUrl?: string;
  gradient: string;
}

const BONUS_FEATURES: BonusFeature[] = [
  {
    id: "upload-books",
    icon: Upload,
    title: "Upload Your Own Books",
    description:
      "Upload PDFs & EPUBs from your personal library and read them in stunning 3D with all premium features! Your books, our magic.",
    value: "$50/mo",
    status: "live",
    demoUrl: "/upload",
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    id: "ai-summaries",
    icon: Brain,
    title: "AI Chapter Summaries",
    description:
      "AI analyzes each chapter and generates 3-sentence summaries with key concepts and connections. Saves 10+ hours per book!",
    value: "$30/mo",
    status: "live",
    demoUrl: "/summaries",
    gradient: "from-indigo-600 to-purple-600",
  },
  {
    id: "gamification",
    icon: Target,
    title: "Reading Goals & Gamification",
    description:
      "Set daily/weekly goals, earn points, unlock badges, build streaks, and level up. Makes reading addictive!",
    value: "$15/mo",
    status: "live",
    demoUrl: "/goals",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "analytics",
    icon: TrendingUp,
    title: "Advanced Reading Analytics",
    description:
      "Track reading speed, comprehension, best times, retention patterns, and growth over time with beautiful visualizations.",
    value: "$25/mo",
    status: "live",
    demoUrl: "/analytics",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    id: "tts",
    icon: Mic,
    title: "Premium Text-to-Speech",
    description:
      "Natural AI voices with multiple accents, speed control, and ambient background sounds. Listen anywhere!",
    value: "$40/mo",
    status: "coming-soon",
    gradient: "from-cyan-600 to-teal-600",
  },
  {
    id: "book-clubs",
    icon: Users,
    title: "Social Book Clubs",
    description:
      "Create/join clubs, group reading schedules, chapter discussions, and live 3D reading sessions with friends!",
    value: "$25/mo",
    status: "coming-soon",
    gradient: "from-green-600 to-emerald-600",
  },
  {
    id: "custom-covers",
    icon: Palette,
    title: "Custom Book Covers",
    description:
      "AI-generated covers, upload your own, or choose from templates. Make your library uniquely yours!",
    value: "$10/mo",
    status: "coming-soon",
    gradient: "from-pink-600 to-rose-600",
  },
  {
    id: "playlists",
    icon: Music,
    title: "Reading Playlists",
    description:
      "Curated music for each genre that auto-plays and adjusts to match your book's mood and pace.",
    value: "$20/mo",
    status: "coming-soon",
    gradient: "from-orange-600 to-amber-600",
  },
  {
    id: "certificates",
    icon: Award,
    title: "Certificates & Achievements",
    description:
      "Earn verified certificates, share on LinkedIn, add to your portfolio. Show off your reading accomplishments!",
    value: "$15/mo",
    status: "coming-soon",
    gradient: "from-amber-600 to-yellow-600",
  },
  {
    id: "surprises",
    icon: Gift,
    title: "Monthly Surprise Features",
    description:
      "Every month unlock NEW features, surprise gift books, exclusive content drops, and beta access. Keep discovering!",
    value: "$50/mo",
    status: "live",
    gradient: "from-purple-600 via-pink-600 to-orange-600",
  },
];

export default function OverDeliveryPage() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const totalPromisedValue = 109; // From pricing page
  const totalBonusValue = BONUS_FEATURES.reduce(
    (sum, f) => sum + parseInt(f.value.replace(/\D/g, "")),
    0
  );
  const totalDeliveredValue = totalPromisedValue + totalBonusValue;
  const savings = totalDeliveredValue - 99;
  const savingsPercent = Math.round((savings / totalDeliveredValue) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-6 relative"
          >
            <motion.div
              className="absolute inset-0 blur-3xl bg-purple-400/30 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Gift className="w-24 h-24 text-purple-400 relative z-10" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            We Over-Deliver
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              By Design
            </span>
          </h1>

          <p className="text-xl text-purple-300 max-w-3xl mx-auto mb-8">
            You pay for 3D reading. We give you 9 MORE premium features FOR
            FREE! 🎁
          </p>

          {/* Value Proposition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 mb-12"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">
                  ${totalPromisedValue}
                </div>
                <div className="text-purple-300 text-sm">What We Promise</div>
              </div>
              <div>
                <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  +${totalBonusValue}
                </div>
                <div className="text-purple-300 text-sm font-semibold">
                  BONUS Features! 🎉
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">
                  ${totalDeliveredValue}
                </div>
                <div className="text-purple-300 text-sm">
                  Total Value Delivered
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="text-3xl font-bold text-white mb-2">
                You Pay: <span className="text-green-400">$99/month</span>
              </div>
              <div className="text-lg text-purple-300">
                You Save:{" "}
                <span className="font-bold text-white">
                  ${savings}/month ({savingsPercent}% off!)
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {BONUS_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredFeature === feature.id;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="relative group"
              >
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`h-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all relative overflow-hidden ${
                    feature.status === "live"
                      ? "shadow-lg shadow-purple-500/20"
                      : ""
                  }`}
                >
                  {/* Background Gradient on Hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 0.1 : 0 }}
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}
                  />

                  {/* Status Badge */}
                  {feature.status === "live" ? (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        LIVE
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-amber-600/50 text-amber-200 text-xs font-bold rounded-full">
                        COMING SOON
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 relative z-10`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-purple-200 mb-4 text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Value Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                        <span className="text-green-400 font-bold text-sm">
                          {feature.value} VALUE
                        </span>
                      </div>
                      {feature.status === "live" && feature.demoUrl && (
                        <Link
                          href={feature.demoUrl}
                          className="text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center gap-1"
                        >
                          Try it <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>

                    {/* Included Badge */}
                    <div className="flex items-center gap-2 text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold text-sm">
                        {feature.status === "live"
                          ? "Included in Premium!"
                          : "Coming in Premium!"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20 mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Our Philosophy: Over-Deliver By Design
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-red-900/20 rounded-2xl p-6 border border-red-500/30">
              <h3 className="text-xl font-bold text-red-400 mb-4">
                ❌ Most Companies
              </h3>
              <ul className="space-y-3 text-red-200">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  Promise the world, deliver the basics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  Charge extra for every tiny feature
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  Surprise charges and hidden fees
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  Yearly price increases
                </li>
              </ul>
            </div>

            <div className="bg-green-900/20 rounded-2xl p-6 border border-green-500/30">
              <h3 className="text-xl font-bold text-green-400 mb-4">
                ✅ Dynasty Academy
              </h3>
              <ul className="space-y-3 text-green-200">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Promise features, deliver 10x more
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Include premium features for free
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  One price, unlimited value
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Monthly surprise feature drops
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 text-center">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-xl text-white font-semibold mb-2">
              "Users should feel like they're getting away with robbery!" 💎
            </p>
            <p className="text-purple-300">
              That's our mission. Every feature we add is a gift to you.
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready for the Best $99 You'll Ever Spend?
          </h2>
          <Link href="/pricing">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <Crown className="w-6 h-6" />
                Start Your 7-Day Free Trial
                <ArrowRight className="w-6 h-6" />
              </span>
            </motion.button>
          </Link>
          <p className="text-purple-300 mt-4">
            All bonus features included • No credit card required • Cancel
            anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}
