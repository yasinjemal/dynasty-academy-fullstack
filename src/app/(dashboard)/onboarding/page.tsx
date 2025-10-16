"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Target,
  Code,
  Rocket,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  Users,
  Trophy,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  category: "experience" | "goals" | "skills" | "time" | "style";
}

interface AssessmentResult {
  level: "beginner" | "intermediate" | "advanced";
  focusAreas: string[];
  recommendedPath: string;
  estimatedTime: string;
  dailyCommitment: string;
}

export default function AIOnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<
    "welcome" | "assessment" | "processing" | "results"
  >("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const questions: Question[] = [
    {
      id: "experience",
      question: "How would you describe your coding experience?",
      options: [
        "Complete beginner - Never written code before",
        "Basic - Know some HTML/CSS",
        "Intermediate - Built a few projects",
        "Advanced - Professional developer",
      ],
      category: "experience",
    },
    {
      id: "goal",
      question: "What's your primary goal?",
      options: [
        "Get my first developer job",
        "Switch to tech from another field",
        "Build my startup idea",
        "Level up my current skills",
        "Freelance and work remotely",
      ],
      category: "goals",
    },
    {
      id: "interest",
      question: "What excites you most?",
      options: [
        "Building beautiful websites (Frontend)",
        "Creating powerful APIs (Backend)",
        "Everything - Full Stack!",
        "Mobile apps (iOS/Android)",
        "Data & AI/ML",
      ],
      category: "skills",
    },
    {
      id: "time",
      question: "How much time can you commit daily?",
      options: [
        "30 minutes - I'm super busy",
        "1 hour - Consistent effort",
        "2 hours - Serious about this",
        "4+ hours - All in!",
      ],
      category: "time",
    },
    {
      id: "style",
      question: "How do you learn best?",
      options: [
        "Video tutorials - Show me!",
        "Hands-on projects - Let me build!",
        "Reading docs - I like details",
        "Mix of everything",
      ],
      category: "style",
    },
    {
      id: "timeline",
      question: "When do you want to achieve your goal?",
      options: [
        "3 months - Fast track",
        "6 months - Balanced pace",
        "12 months - Steady learning",
        "No rush - Learning for fun",
      ],
      category: "time",
    },
  ];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: answer });

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // All questions answered
      processAssessment();
    }
  };

  const processAssessment = async () => {
    setStep("processing");
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Generate personalized result
    const level = answers.experience?.includes("Complete")
      ? "beginner"
      : answers.experience?.includes("Basic")
      ? "beginner"
      : answers.experience?.includes("Intermediate")
      ? "intermediate"
      : "advanced";

    const focusAreas = [
      answers.interest?.includes("Frontend") ? "Frontend Development" : null,
      answers.interest?.includes("Backend") ? "Backend Development" : null,
      answers.interest?.includes("Full Stack")
        ? "Full Stack Development"
        : null,
      answers.interest?.includes("Mobile") ? "Mobile Development" : null,
      answers.interest?.includes("Data") ? "Data Science & AI" : null,
    ].filter(Boolean) as string[];

    const recommendedPath = answers.goal?.includes("first developer job")
      ? "Career Starter Track"
      : answers.goal?.includes("Switch to tech")
      ? "Career Switcher Program"
      : answers.goal?.includes("startup")
      ? "Entrepreneur Bootcamp"
      : "Skill Mastery Path";

    const estimatedTime = answers.timeline?.includes("3 months")
      ? "90 days"
      : answers.timeline?.includes("6 months")
      ? "180 days"
      : answers.timeline?.includes("12 months")
      ? "365 days"
      : "Self-paced";

    const dailyCommitment = answers.time?.includes("30 minutes")
      ? "30 min/day"
      : answers.time?.includes("1 hour")
      ? "1 hour/day"
      : answers.time?.includes("2 hours")
      ? "2 hours/day"
      : "4+ hours/day";

    setResult({
      level,
      focusAreas,
      recommendedPath,
      estimatedTime,
      dailyCommitment,
    });

    setIsProcessing(false);
    setStep("results");
  };

  const startLearning = async () => {
    // Save assessment results to user profile
    try {
      await fetch("/api/user/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, result }),
      });
    } catch (error) {
      console.error("Failed to save assessment:", error);
    }

    router.push("/learning-path");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <AnimatePresence mode="wait">
        {/* Welcome Screen */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                  Welcome to Dynasty Brain
                </h1>
                <p className="text-xl text-slate-300 mb-2">
                  Hey {session?.user?.name}! 👋
                </p>
                <p className="text-lg text-slate-400">
                  Ready to become a world-class developer?
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Here's what we'll do:
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      icon: Target,
                      text: "Take a 5-minute skill assessment",
                      color: "text-purple-400",
                    },
                    {
                      icon: Brain,
                      text: "AI analyzes your goals & experience",
                      color: "text-blue-400",
                    },
                    {
                      icon: Rocket,
                      text: "Get your personalized 90-day roadmap",
                      color: "text-pink-400",
                    },
                    {
                      icon: TrendingUp,
                      text: "Start learning with daily mini-lessons",
                      color: "text-green-400",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${item.color}`}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-slate-200">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep("assessment")}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 transition-all"
              >
                Let's Start! 🚀
                <ArrowRight className="w-6 h-6" />
              </motion.button>

              <p className="text-center text-slate-500 text-sm mt-4">
                Takes only 5 minutes • No credit card required
              </p>
            </div>
          </motion.div>
        )}

        {/* Assessment Questions */}
        {step === "assessment" && (
          <motion.div
            key="assessment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-3xl w-full">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-purple-400 font-semibold">
                    {Math.round(
                      ((currentQuestion + 1) / questions.length) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        ((currentQuestion + 1) / questions.length) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                >
                  <h2 className="text-3xl font-bold text-white mb-8">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-4">
                    {questions[currentQuestion].options.map((option, i) => (
                      <motion.button
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(option)}
                        className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl text-left text-slate-200 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 group-hover:bg-purple-500 flex items-center justify-center transition-colors">
                            <span className="text-purple-300 group-hover:text-white font-bold">
                              {String.fromCharCode(65 + i)}
                            </span>
                          </div>
                          <span className="text-lg">{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="mt-6 text-slate-400 hover:text-white transition-colors"
                >
                  ← Previous Question
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Processing AI Analysis */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity },
                }}
                className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-8"
              >
                <Brain className="w-16 h-16 text-white" />
              </motion.div>

              <h2 className="text-4xl font-bold text-white mb-4">
                AI is analyzing your profile...
              </h2>

              <div className="space-y-3 max-w-md mx-auto">
                {[
                  "Evaluating your experience level...",
                  "Mapping your learning goals...",
                  "Calculating optimal learning path...",
                  "Generating personalized roadmap...",
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.7 }}
                    className="flex items-center gap-3 text-slate-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    {text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results & Roadmap */}
        {step === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen p-6 py-12"
          >
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-white mb-4">
                  Your Personalized Roadmap is Ready! 🎉
                </h1>
                <p className="text-xl text-slate-300">
                  Here's your path to becoming a {result.focusAreas[0]} expert
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Level Card */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Award className="w-8 h-8 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">
                      Your Level
                    </h3>
                  </div>
                  <p className="text-4xl font-bold text-purple-300 capitalize mb-2">
                    {result.level}
                  </p>
                  <p className="text-slate-300">
                    Perfect starting point identified!
                  </p>
                </motion.div>

                {/* Timeline Card */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl p-8 border border-pink-500/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Clock className="w-8 h-8 text-pink-400" />
                    <h3 className="text-2xl font-bold text-white">Timeline</h3>
                  </div>
                  <p className="text-4xl font-bold text-pink-300">
                    {result.estimatedTime}
                  </p>
                  <p className="text-slate-300">
                    {result.dailyCommitment} commitment
                  </p>
                </motion.div>
              </div>

              {/* Recommended Path */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Rocket className="w-7 h-7 text-yellow-400" />
                  Your Learning Path: {result.recommendedPath}
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  {result.focusAreas.map((area, i) => (
                    <div
                      key={i}
                      className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20"
                    >
                      <Code className="w-8 h-8 text-purple-400 mb-3" />
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {area}
                      </h4>
                      <p className="text-sm text-slate-400">
                        Tailored curriculum awaits
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* What's Next */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  What Happens Next?
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: BookOpen,
                      text: "Daily 10-min lessons delivered to your inbox",
                    },
                    { icon: Zap, text: "20-min hands-on practice exercises" },
                    { icon: Brain, text: "5-min AI tutor sessions when stuck" },
                    { icon: Users, text: "Weekly live study rooms with peers" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white">
                      <item.icon className="w-6 h-6" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startLearning}
                className="w-full py-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white font-bold text-2xl flex items-center justify-center gap-3 shadow-2xl shadow-green-500/50 hover:shadow-green-500/80 transition-all"
              >
                Start My Learning Journey! 🚀
                <ArrowRight className="w-7 h-7" />
              </motion.button>

              <p className="text-center text-slate-400 mt-6">
                Your first lesson is ready to start!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
