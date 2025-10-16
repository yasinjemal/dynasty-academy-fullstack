"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Target,
  Zap,
  BookOpen,
  Code,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  Star,
  Award,
  Rocket,
  Calendar,
  BarChart3,
} from "lucide-react";

interface LearningNode {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "practice" | "project" | "quiz" | "milestone";
  duration: string;
  status: "completed" | "current" | "locked";
  progress: number;
  xp: number;
  level: number;
}

export default function LearningPathPage() {
  const { data: session } = useSession();
  const [userLevel, setUserLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState({ current: 0, target: 30 });

  const learningPath: LearningNode[] = [
    // Week 1: Foundations
    {
      id: "1",
      title: "Welcome & Setup",
      description: "Get your dev environment ready",
      type: "lesson",
      duration: "10 min",
      status: "completed",
      progress: 100,
      xp: 50,
      level: 1,
    },
    {
      id: "2",
      title: "HTML Basics",
      description: "Structure of web pages",
      type: "lesson",
      duration: "15 min",
      status: "completed",
      progress: 100,
      xp: 100,
      level: 1,
    },
    {
      id: "3",
      title: "Build Your First Page",
      description: "Create a personal profile page",
      type: "practice",
      duration: "20 min",
      status: "current",
      progress: 60,
      xp: 150,
      level: 1,
    },
    {
      id: "4",
      title: "CSS Styling",
      description: "Make your pages beautiful",
      type: "lesson",
      duration: "15 min",
      status: "locked",
      progress: 0,
      xp: 100,
      level: 1,
    },
    {
      id: "5",
      title: "Responsive Design",
      description: "Mobile-first layouts",
      type: "lesson",
      duration: "20 min",
      status: "locked",
      progress: 0,
      xp: 150,
      level: 1,
    },
    {
      id: "6",
      title: "Portfolio Project",
      description: "Build your portfolio website",
      type: "project",
      duration: "2 hours",
      status: "locked",
      progress: 0,
      xp: 500,
      level: 1,
    },
    {
      id: "7",
      title: "Level 1 Complete! 🎉",
      description: "Frontend foundations mastered",
      type: "milestone",
      duration: "5 min",
      status: "locked",
      progress: 0,
      xp: 1000,
      level: 1,
    },
    // Week 2: JavaScript
    {
      id: "8",
      title: "JavaScript Basics",
      description: "Variables, functions, and logic",
      type: "lesson",
      duration: "20 min",
      status: "locked",
      progress: 0,
      xp: 150,
      level: 2,
    },
    {
      id: "9",
      title: "DOM Manipulation",
      description: "Make your pages interactive",
      type: "lesson",
      duration: "25 min",
      status: "locked",
      progress: 0,
      xp: 200,
      level: 2,
    },
    {
      id: "10",
      title: "Build a Calculator",
      description: "Practice JS fundamentals",
      type: "practice",
      duration: "30 min",
      status: "locked",
      progress: 0,
      xp: 250,
      level: 2,
    },
  ];

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return BookOpen;
      case "practice":
        return Code;
      case "project":
        return Rocket;
      case "quiz":
        return Brain;
      case "milestone":
        return Trophy;
      default:
        return BookOpen;
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "from-green-500 to-emerald-500";
      case "current":
        return "from-purple-500 to-pink-500";
      case "locked":
        return "from-gray-600 to-gray-700";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Stats */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Your Learning Journey
              </h1>
              <p className="text-slate-300">
                Welcome back, {session?.user?.name}! Let's continue building
                amazing things 🚀
              </p>
            </div>
            <Link href="/onboarding">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all">
                Retake Assessment
              </button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Level */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-purple-400" />
                <span className="text-slate-400">Level</span>
              </div>
              <p className="text-4xl font-bold text-white">{userLevel}</p>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-blue-500" />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                750 / 1000 XP to Level 2
              </p>
            </motion.div>

            {/* Streak */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-orange-400" />
                <span className="text-slate-400">Streak</span>
              </div>
              <p className="text-4xl font-bold text-white">{streak} days 🔥</p>
              <p className="text-sm text-slate-400 mt-3">
                Keep it going! Study today to continue
              </p>
            </motion.div>

            {/* Daily Goal */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-green-400" />
                <span className="text-slate-400">Today's Goal</span>
              </div>
              <p className="text-4xl font-bold text-white">
                {dailyGoal.current} min
              </p>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{
                    width: `${(dailyGoal.current / dailyGoal.target) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {dailyGoal.target - dailyGoal.current} min remaining
              </p>
            </motion.div>

            {/* Progress */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-pink-400" />
                <span className="text-slate-400">Overall Progress</span>
              </div>
              <p className="text-4xl font-bold text-white">23%</p>
              <p className="text-sm text-slate-400 mt-3">
                87% ready for junior dev jobs!
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Today's Lesson */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-400" />
            Today's Mission
          </h2>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-4 py-2 bg-white/20 rounded-full text-sm text-white font-semibold">
                    IN PROGRESS
                  </span>
                  <h3 className="text-3xl font-bold text-white mt-4 mb-2">
                    Build Your First Page
                  </h3>
                  <p className="text-white/80 text-lg">
                    Create a personal profile page with HTML
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm mb-1">Progress</p>
                  <p className="text-5xl font-bold text-white">60%</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 text-white">
                  <Clock className="w-5 h-5" />
                  <span>20 min remaining</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Star className="w-5 h-5" />
                  <span>+150 XP reward</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Trophy className="w-5 h-5" />
                  <span>Level 1</span>
                </div>
              </div>

              <Link href="/courses/html-basics">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl text-purple-600 font-bold text-lg shadow-xl"
                >
                  <Play className="w-6 h-6" />
                  Continue Learning
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Learning Path Tree */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Your 90-Day Roadmap
          </h2>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-gray-600" />

            {/* Nodes */}
            <div className="space-y-6">
              {learningPath.map((node, index) => {
                const Icon = getNodeIcon(node.type);
                const colorClass = getNodeColor(node.status);

                return (
                  <motion.div
                    key={node.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Node Circle */}
                    <div
                      className={`absolute left-0 w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center z-10 shadow-xl`}
                    >
                      {node.status === "completed" ? (
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      ) : node.status === "locked" ? (
                        <Lock className="w-8 h-8 text-white" />
                      ) : (
                        <Icon className="w-8 h-8 text-white" />
                      )}
                    </div>

                    {/* Node Card */}
                    <div className="ml-24">
                      <motion.div
                        whileHover={{
                          scale: node.status !== "locked" ? 1.02 : 1,
                        }}
                        className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border ${
                          node.status === "current"
                            ? "border-purple-500/50 shadow-lg shadow-purple-500/20"
                            : "border-white/10"
                        } ${node.status === "locked" ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">
                                {node.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  node.type === "milestone"
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : node.type === "project"
                                    ? "bg-purple-500/20 text-purple-300"
                                    : "bg-blue-500/20 text-blue-300"
                                }`}
                              >
                                {node.type}
                              </span>
                            </div>
                            <p className="text-slate-400">{node.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-slate-400 mb-1">
                              {node.duration}
                            </p>
                            <p className="text-lg font-bold text-purple-400">
                              +{node.xp} XP
                            </p>
                          </div>
                        </div>

                        {node.status !== "locked" && node.progress > 0 && (
                          <div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                style={{ width: `${node.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                              {node.progress}% complete
                            </p>
                          </div>
                        )}

                        {node.status === "current" && (
                          <Link href={`/learn/${node.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold"
                            >
                              <Play className="w-5 h-5" />
                              Continue
                            </motion.button>
                          </Link>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="mt-12 p-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-3xl border border-yellow-500/20">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Next Milestone
          </h3>
          <p className="text-slate-300 text-lg mb-4">
            Complete 5 more lessons to unlock "Level 1 Complete" achievement and
            earn 1000 XP!
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-gradient-to-r from-yellow-500 to-orange-500" />
            </div>
            <span className="text-white font-semibold">2 / 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
