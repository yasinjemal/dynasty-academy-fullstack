"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Sparkles,
  TrendingUp,
  Target,
  Brain,
  Zap,
  DollarSign,
  Briefcase,
  Code,
  BookOpen,
  Award,
  Calendar,
  ArrowRight,
  ChevronDown,
  Play,
  Star,
  Trophy,
  Crown,
  Shield,
  Flame,
  Timer,
  Users,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FutureTimeline from "./FutureTimeline";
import FutureSelfChat from "./FutureSelfChat";

interface FutureSelfPrediction {
  skills: {
    current: Array<{ name: string; level: number; category: string }>;
    projected: Array<{ name: string; level: number; category: string }>;
    newSkills: string[];
  };
  career: {
    currentLevel: string;
    projectedLevel: string;
    salaryRange: { min: number; max: number; currency: string };
    jobTitles: string[];
    companies: string[];
  };
  portfolio: {
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      difficulty: string;
      estimatedWeeks: number;
    }>;
    githubContributions: number;
    certifications: string[];
  };
  learning: {
    coursesCompleted: number;
    booksRead: number;
    totalHours: number;
    streakPrediction: number;
    xpProjection: number;
  };
  milestones: Array<{
    date: Date;
    title: string;
    description: string;
    icon: string;
    type: "skill" | "career" | "achievement" | "project" | "certification";
    probability: number;
  }>;
  letterFromFuture: string;
  confidence: number;
  probabilityOfSuccess: number;
  accelerators: string[];
  risks: string[];
  timeframe: string;
}

interface FutureSelfPageProps {
  userId: string;
  userName: string;
  userImage?: string;
}

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  currentValue,
  projectedValue,
  color,
  delay,
}: {
  icon: any;
  label: string;
  currentValue: string | number;
  projectedValue: string | number;
  color: string;
  delay: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${color} backdrop-blur-xl border border-white/10 overflow-hidden group cursor-pointer`}
    >
      {/* Background glow */}
      <motion.div
        animate={{
          scale: isHovered ? 1.5 : 1,
          opacity: isHovered ? 0.3 : 0.1,
        }}
        className="absolute inset-0 bg-white rounded-full blur-3xl"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-5 h-5 text-white/80" />
          <span className="text-sm text-white/80">{label}</span>
        </div>

        <div className="flex items-end gap-2">
          <motion.span
            className="text-3xl font-bold text-white"
            animate={{ scale: isHovered ? 1.1 : 1 }}
          >
            {currentValue}
          </motion.span>
          <motion.div
            animate={{ x: isHovered ? 5 : 0 }}
            className="flex items-center gap-1 text-green-400"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-lg font-semibold">{projectedValue}</span>
          </motion.div>
        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-xl" />
    </motion.div>
  );
};

// Skill Progress Bar
const SkillBar = ({
  skill,
  projected,
  delay,
}: {
  skill: { name: string; level: number };
  projected: number;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="space-y-1"
  >
    <div className="flex justify-between text-sm">
      <span className="text-white">{skill.name}</span>
      <span className="text-purple-400">
        {skill.level}% → {projected}%
      </span>
    </div>
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${projected}%` }}
        transition={{ duration: 1.5, delay }}
        className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-full relative"
      >
        {/* Current level marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white"
          style={{ left: `${(skill.level / projected) * 100}%` }}
        />
      </motion.div>
    </div>
  </motion.div>
);

// Letter from Future Component
const LetterFromFuture = ({ letter }: { letter: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {/* Envelope animation */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        <div className="bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-amber-900/30 backdrop-blur-xl rounded-2xl border border-amber-500/20 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: isOpen ? 180 : 0,
                }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
              >
                <Star className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h4 className="font-bold text-white">
                  Letter from Your Future Self
                </h4>
                <p className="text-xs text-amber-300">
                  Click to {isOpen ? "close" : "open"}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: "spring" }}
            >
              <ChevronDown className="w-5 h-5 text-amber-400" />
            </motion.div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/90 leading-relaxed whitespace-pre-line font-serif italic">
                      {letter}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl -z-10 opacity-50" />
    </motion.div>
  );
};

// Main Page Component
export default function FutureSelfPage({
  userId,
  userName,
  userImage,
}: FutureSelfPageProps) {
  const [prediction, setPrediction] = useState<FutureSelfPrediction | null>(
    null
  );
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<
    "3months" | "6months" | "1year" | "2years"
  >("6months");
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "chat">(
    "overview"
  );

  useEffect(() => {
    fetchPrediction();
  }, [timeframe]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/future-self?timeframe=${timeframe}`);
      const data = await response.json();
      if (data.success) {
        setPrediction(data.prediction);
        setCurrentStats(data.currentStats);
      }
    } catch (error) {
      console.error("Failed to fetch prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  const timeframeOptions = [
    { value: "3months", label: "3 Months", icon: "⚡" },
    { value: "6months", label: "6 Months", icon: "🚀" },
    { value: "1year", label: "1 Year", icon: "🌟" },
    { value: "2years", label: "2 Years", icon: "👑" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          {/* Animated loading orb */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Connecting to Your Future...
          </h2>
          <p className="text-purple-300">
            AI is analyzing your learning patterns
          </p>

          {/* Progress dots */}
          <div className="flex gap-2 justify-center mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 rounded-full bg-purple-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔮
                </motion.div>
                Meet Your Future Self
              </h1>
              <p className="text-purple-300 text-lg">
                AI-powered prediction of where you&apos;re headed based on your
                current trajectory
              </p>
            </div>

            {/* Timeframe selector */}
            <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/10">
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeframe(option.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeframe === option.value
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "text-purple-300 hover:bg-white/5"
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-4 mt-6 border-b border-white/10 pb-4">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "timeline", label: "Timeline", icon: Calendar },
              { id: "chat", label: "Chat with Future You", icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && prediction && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Confidence & Success meters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-semibold">
                        Probability of Success
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-emerald-400">
                      {prediction.probabilityOfSuccess}%
                    </span>
                  </div>
                  <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.probabilityOfSuccess}%` }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-semibold">
                        AI Prediction Confidence
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-blue-400">
                      {prediction.confidence}%
                    </span>
                  </div>
                  <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.confidence}%` }}
                      transition={{ duration: 1.5, delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={GraduationCap}
                  label="Level"
                  currentValue={currentStats?.level || 1}
                  projectedValue={Math.floor(
                    prediction.learning.xpProjection / 1000
                  )}
                  color="from-purple-900/50 to-violet-900/50"
                  delay={0.2}
                />
                <StatCard
                  icon={Flame}
                  label="XP"
                  currentValue={`${((currentStats?.xp || 0) / 1000).toFixed(
                    1
                  )}K`}
                  projectedValue={`${(
                    prediction.learning.xpProjection / 1000
                  ).toFixed(1)}K`}
                  color="from-orange-900/50 to-amber-900/50"
                  delay={0.3}
                />
                <StatCard
                  icon={BookOpen}
                  label="Courses"
                  currentValue={currentStats?.coursesEnrolled || 0}
                  projectedValue={prediction.learning.coursesCompleted}
                  color="from-cyan-900/50 to-blue-900/50"
                  delay={0.4}
                />
                <StatCard
                  icon={Timer}
                  label="Streak"
                  currentValue={`${currentStats?.streak || 0}d`}
                  projectedValue={`${prediction.learning.streakPrediction}d`}
                  color="from-pink-900/50 to-rose-900/50"
                  delay={0.5}
                />
              </div>

              {/* Career Projection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Career Trajectory
                    </h3>
                    <p className="text-sm text-purple-300">
                      Where you&apos;re headed professionally
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Level progression */}
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400">Career Level</p>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-800 rounded-lg text-white">
                        {prediction.career.currentLevel}
                      </span>
                      <ArrowRight className="w-5 h-5 text-emerald-400" />
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-white font-semibold">
                        {prediction.career.projectedLevel}
                      </span>
                    </div>
                  </div>

                  {/* Salary range */}
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400">
                      Projected Salary Range
                    </p>
                    <div className="flex items-center gap-2 text-2xl font-bold text-emerald-400">
                      <DollarSign className="w-6 h-6" />
                      {(prediction.career.salaryRange.min / 1000).toFixed(0)}K -{" "}
                      {(prediction.career.salaryRange.max / 1000).toFixed(0)}K
                    </div>
                  </div>

                  {/* Job titles */}
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400">Potential Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {prediction.career.jobTitles
                        .slice(0, 3)
                        .map((title, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-lg"
                          >
                            {title}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Skills Growth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Skills Growth
                    </h3>
                    <p className="text-sm text-purple-300">
                      Your skills trajectory
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {prediction.skills.projected.slice(0, 6).map((skill, i) => (
                    <SkillBar
                      key={skill.name}
                      skill={
                        prediction.skills.current.find(
                          (s) => s.name === skill.name
                        ) || { name: skill.name, level: 0 }
                      }
                      projected={skill.level}
                      delay={0.6 + i * 0.1}
                    />
                  ))}
                </div>

                {/* New skills */}
                {prediction.skills.newSkills.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-sm text-purple-400 mb-3">
                      🌟 New Skills You&apos;ll Acquire:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {prediction.skills.newSkills.map((skill, i) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="px-3 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-purple-300 rounded-full text-sm"
                        >
                          + {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Letter from Future Self */}
              <LetterFromFuture letter={prediction.letterFromFuture} />

              {/* Accelerators & Risks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Rocket className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-white">
                      Success Accelerators
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {prediction.accelerators.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-emerald-300"
                      >
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-red-400" />
                    <h4 className="font-bold text-white">Risks to Watch</h4>
                  </div>
                  <ul className="space-y-2">
                    {prediction.risks.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-red-300"
                      >
                        <span className="text-sm">⚠️ {item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === "timeline" && prediction && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FutureTimeline
                milestones={prediction.milestones}
                timeframe={prediction.timeframe}
              />
            </motion.div>
          )}

          {activeTab === "chat" && prediction && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <FutureSelfChat
                prediction={prediction}
                userName={userName}
                userImage={userImage}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
