"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  Crown,
  Youtube,
  Wand2,
  Hammer,
  ArrowRight,
  Video,
  BookOpen,
  Target,
} from "lucide-react";

export default function CourseForgeHub() {
  const router = useRouter();

  const creationModes = [
    {
      id: "youtube",
      title: "🚀 Quick Create",
      subtitle: "AI-Powered Instant Course",
      description:
        "Paste a YouTube URL and let AI transform it into a complete, structured course in minutes",
      icon: Youtube,
      gradient: "from-red-600 via-pink-600 to-purple-600",
      features: [
        "Auto transcript extraction",
        "AI splits into 12-20 sections",
        "Smart chapter detection",
        "One-click generation",
      ],
      badge: "Fastest",
      badgeColor: "bg-red-500",
      route: "/instructor/create/youtube",
      comingSoon: false,
    },
    {
      id: "smart",
      title: "⚡ Smart Builder",
      subtitle: "AI-Assisted Creation",
      description:
        "Build your course with AI helping every step - from outlines to quizzes to content suggestions",
      icon: Wand2,
      gradient: "from-purple-600 via-blue-600 to-cyan-600",
      features: [
        "AI content suggestions",
        "Auto-generate quizzes",
        "Smart summaries",
        "Drag & drop builder",
      ],
      badge: "Recommended",
      badgeColor: "bg-purple-500",
      route: "/instructor/create/smart",
      comingSoon: false,
    },
    {
      id: "pro",
      title: "💪 Pro Mode",
      subtitle: "Full Manual Control",
      description:
        "Complete creative freedom - build every detail from scratch with advanced tools and options",
      icon: Hammer,
      gradient: "from-amber-600 via-orange-600 to-red-600",
      features: [
        "Total customization",
        "Advanced settings",
        "Bulk operations",
        "Expert tools",
      ],
      badge: "Advanced",
      badgeColor: "bg-amber-500",
      route: "/instructor/create-course",
      comingSoon: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-500/30 mb-6"
          >
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-purple-300 font-semibold">
              Dynasty Course Forge
            </span>
          </motion.div>

          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Create Your Masterpiece
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your creation path and build extraordinary courses that
            transform lives
          </p>
        </motion.div>

        {/* Creation Mode Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {creationModes.map((mode, index) => {
            const Icon = mode.icon;

            return (
              <motion.div
                key={mode.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl`}
                />

                {/* Card */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 h-full flex flex-col">
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`${mode.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
                    >
                      {mode.badge}
                    </span>
                    {mode.comingSoon && (
                      <span className="bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${mode.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {mode.title}
                  </h3>
                  <p className="text-purple-300 font-semibold mb-3">
                    {mode.subtitle}
                  </p>
                  <p className="text-gray-400 mb-6 flex-grow">
                    {mode.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-8">
                    {mode.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-300 text-sm"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mode.gradient}`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => !mode.comingSoon && router.push(mode.route)}
                    disabled={mode.comingSoon}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
                      mode.comingSoon
                        ? "bg-gray-700 cursor-not-allowed"
                        : `bg-gradient-to-r ${mode.gradient} hover:shadow-lg hover:shadow-purple-500/50`
                    }`}
                  >
                    {mode.comingSoon ? "Coming Soon" : "Start Building"}
                    {!mode.comingSoon && (
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">
                Average Creation Time
              </span>
            </div>
            <p className="text-3xl font-bold text-white">5 mins</p>
            <p className="text-xs text-gray-500 mt-1">with Quick Create</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Courses Created</span>
            </div>
            <p className="text-3xl font-bold text-white">10,000+</p>
            <p className="text-xs text-gray-500 mt-1">by Dynasty instructors</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-600/10 to-cyan-600/5 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span className="text-gray-400 text-sm">Success Rate</span>
            </div>
            <p className="text-3xl font-bold text-white">95%</p>
            <p className="text-xs text-gray-500 mt-1">course completion</p>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => router.push("/instructor/courses")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Courses
          </button>
        </motion.div>
      </div>
    </div>
  );
}
