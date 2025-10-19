"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Zap,
  Brain,
  Award,
  Lock,
  Sparkles,
  Activity,
  TrendingUp,
  Target,
} from "lucide-react";

// Neural Particle Background (Full Page)
const FullPageNeuralParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number }> =
      [];
    const particleCount = 80; // More particles for full page

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139, 92, 246, 0.4)";
        ctx.fill();

        // Draw connections
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

// Holographic Video Player Container
const HolographicVideoPlayer = ({ videoUrl }: { videoUrl?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative rounded-3xl overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      style={{
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,20,60,0.9) 100%)",
      }}
    >
      {/* Holographic border */}
      <div className="absolute inset-0 rounded-3xl">
        <div
          className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-fuchsia-500/40 bg-clip-border"
          style={{ padding: "2px" }}
        />
      </div>

      {/* Cursor glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)",
          x: smoothMouseX,
          y: smoothMouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Video content */}
      <div className="relative aspect-video bg-black/50 backdrop-blur-xl">
        {videoUrl ? (
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-purple-400"
            >
              <Play className="w-24 h-24" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Futuristic controls */}
      <div className="relative p-4 backdrop-blur-xl bg-black/30 border-t border-purple-500/20">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </motion.button>

          {/* Progress bar */}
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500"
              initial={{ width: "0%" }}
              animate={{ width: "35%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {/* Time */}
          <div className="text-cyan-400 font-mono text-sm">08:24 / 23:45</div>
        </div>
      </div>

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)",
          height: "20%",
        }}
      />
    </motion.div>
  );
};

// Futuristic Lesson Card
const FuturisticLessonCard = ({
  lesson,
  isActive,
  onClick,
}: {
  lesson: { id: string; title: string; duration: number; completed: boolean };
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ x: 5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-4 rounded-2xl cursor-pointer transition-all ${
        isActive
          ? "bg-gradient-to-r from-purple-900/40 to-fuchsia-900/40 border-purple-500/50"
          : "bg-white/5 hover:bg-white/10 border-white/10"
      } border backdrop-blur-sm`}
    >
      {/* Glow effect when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 blur-xl -z-10" />
      )}

      <div className="flex items-center gap-4">
        {/* Status orb */}
        <motion.div
          animate={lesson.completed ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          {lesson.completed ? (
            <div className="relative">
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(34, 211, 238, 0.4)",
                    "0 0 0 8px rgba(34, 211, 238, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          ) : isActive ? (
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 animate-pulse" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <Circle className="w-8 h-8 text-gray-500" />
          )}
        </motion.div>

        {/* Lesson info */}
        <div className="flex-1">
          <h4
            className={`font-semibold ${
              isActive ? "text-white" : "text-gray-300"
            }`}
          >
            {lesson.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-cyan-400 font-mono">
              {lesson.duration} min
            </span>
            {lesson.completed && (
              <span className="text-xs text-green-400 font-mono">
                COMPLETED
              </span>
            )}
          </div>
        </div>

        {/* Arrow indicator */}
        {isActive && (
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-cyan-400"
          >
            <Zap className="w-5 h-5" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Floating Stats Card
const FloatingStatsCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.05 }}
      className="relative p-4 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border border-white/10"
    >
      {/* Glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} blur-xl opacity-20 -z-10`}
      />

      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-mono">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Progress Ring
const ProgressRing = ({ progress }: { progress: number }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      {/* Background ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {progress}%
        </span>
        <span className="text-xs text-gray-400 font-mono">COMPLETE</span>
      </div>
    </div>
  );
};

// Main Component
export default function FuturisticCoursePage() {
  const [currentLesson, setCurrentLesson] = useState(0);

  const lessons = [
    { id: "1", title: "Introduction to React", duration: 24, completed: true },
    { id: "2", title: "Components & Props", duration: 32, completed: true },
    { id: "3", title: "State & Lifecycle", duration: 28, completed: false },
    { id: "4", title: "Hooks Deep Dive", duration: 45, completed: false },
    { id: "5", title: "Context API", duration: 38, completed: false },
  ];

  const completedLessons = lessons.filter((l) => l.completed).length;
  const progress = Math.round((completedLessons / lessons.length) * 100);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Full page neural particle background */}
      <FullPageNeuralParticles />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="border-b border-white/10 backdrop-blur-xl bg-black/30"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  COMPLETE REACT & NEXT.JS MASTERCLASS
                </h1>
                <p className="text-sm text-gray-400 font-mono mt-1">
                  NEURAL LEARNING INTERFACE • DYNASTY ACADEMY 2035
                </p>
              </div>
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-6 h-6 text-purple-400" />
                </motion.div>
                <span className="text-cyan-400 font-mono text-sm">
                  NEURAL LINK ACTIVE
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main layout */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Video Player (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video player */}
              <HolographicVideoPlayer videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ" />

              {/* Stats cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-3 gap-4"
              >
                <FloatingStatsCard
                  icon={Target}
                  label="FOCUS LEVEL"
                  value="87%"
                  color="from-purple-600 to-fuchsia-600"
                />
                <FloatingStatsCard
                  icon={Activity}
                  label="ENGAGEMENT"
                  value="94%"
                  color="from-cyan-600 to-blue-600"
                />
                <FloatingStatsCard
                  icon={TrendingUp}
                  label="MASTERY"
                  value="76%"
                  color="from-green-600 to-emerald-600"
                />
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative p-6 rounded-3xl bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border border-white/10"
              >
                <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                  {["Overview", "Quiz", "Resources", "Discussion"].map(
                    (tab) => (
                      <button
                        key={tab}
                        className="px-4 py-2 rounded-lg font-mono text-sm bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                      >
                        {tab.toUpperCase()}
                      </button>
                    )
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Lesson Overview
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Master the fundamentals of React and Next.js in this
                    comprehensive masterclass. Learn component architecture,
                    state management, hooks, and modern best practices.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right: Sidebar (1/3 width) */}
            <div className="space-y-6">
              {/* Progress card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative p-6 rounded-3xl bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border border-white/10"
              >
                <div className="flex flex-col items-center">
                  <ProgressRing progress={progress} />
                  <div className="mt-4 text-center">
                    <p className="text-lg font-bold text-white">
                      {completedLessons} of {lessons.length} Lessons
                    </p>
                    <p className="text-sm text-gray-400 font-mono mt-1">
                      KEEP PUSHING FORWARD
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Lessons list */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative p-6 rounded-3xl bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border border-white/10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">
                    COURSE CONTENT
                  </h3>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {lessons.map((lesson, index) => (
                    <FuturisticLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isActive={index === currentLesson}
                      onClick={() => setCurrentLesson(index)}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Achievement card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative p-6 rounded-3xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-xl border border-yellow-500/30"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-600/10 to-orange-600/10 blur-xl" />
                <div className="relative flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Award className="w-12 h-12 text-yellow-400" />
                  </motion.div>
                  <div>
                    <p className="text-yellow-400 font-bold">
                      Complete this course
                    </p>
                    <p className="text-sm text-gray-400">
                      Earn your certificate
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #a78bfa 0%, #22d3ee 100%);
        }
      `}</style>
    </div>
  );
}
