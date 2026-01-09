"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Target,
  Rocket,
  Brain,
  Calendar,
  DollarSign,
  Award,
  Briefcase,
  Code,
  BookOpen,
  Zap,
  ChevronRight,
  MessageCircle,
  Clock,
  Star,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Milestone {
  date: Date;
  title: string;
  description: string;
  icon: string;
  type: "skill" | "career" | "achievement" | "project" | "certification";
  probability: number;
}

interface FutureTimelineProps {
  milestones: Milestone[];
  timeframe: string;
  onMilestoneClick?: (milestone: Milestone) => void;
}

// Particle effect for the timeline
const TimelineParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }> = [];

    const colors = ["#8B5CF6", "#EC4899", "#06B6D4", "#F59E0B"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1, // Float upward
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Reset when particle goes off screen
        if (p.y < 0) {
          p.y = canvas.offsetHeight;
          p.x = Math.random() * canvas.offsetWidth;
        }
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-40"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

// Glowing milestone node
const MilestoneNode = ({
  milestone,
  index,
  isActive,
  onClick,
}: {
  milestone: Milestone;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) => {
  const getTypeColor = (type: Milestone["type"]) => {
    switch (type) {
      case "skill":
        return "from-purple-500 to-violet-600";
      case "career":
        return "from-emerald-500 to-teal-600";
      case "achievement":
        return "from-amber-500 to-orange-600";
      case "project":
        return "from-cyan-500 to-blue-600";
      case "certification":
        return "from-pink-500 to-rose-600";
      default:
        return "from-purple-500 to-violet-600";
    }
  };

  const getTypeIcon = (type: Milestone["type"]) => {
    switch (type) {
      case "skill":
        return <Brain className="w-5 h-5" />;
      case "career":
        return <Briefcase className="w-5 h-5" />;
      case "achievement":
        return <Trophy className="w-5 h-5" />;
      case "project":
        return <Code className="w-5 h-5" />;
      case "certification":
        return <Award className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const formattedDate = new Date(milestone.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
      className="relative flex items-center gap-4"
    >
      {/* Connecting line */}
      {index > 0 && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: index * 0.15, duration: 0.3 }}
          className="absolute -top-8 left-6 w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-purple-500/20 origin-top"
        />
      )}

      {/* Milestone node */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center
          bg-gradient-to-br ${getTypeColor(milestone.type)}
          shadow-lg cursor-pointer group
          ${isActive ? "ring-4 ring-white/30" : ""}
        `}
      >
        {/* Pulse effect */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTypeColor(
            milestone.type
          )}`}
        />

        {/* Icon */}
        <span className="relative z-10 text-white">
          {milestone.icon ? (
            <span className="text-xl">{milestone.icon}</span>
          ) : (
            getTypeIcon(milestone.type)
          )}
        </span>

        {/* Probability badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center">
          <span className="text-[10px] text-white font-bold">
            {milestone.probability}%
          </span>
        </div>
      </motion.button>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-purple-400 font-medium">
            {formattedDate}
          </span>
          <span
            className={`
            text-xs px-2 py-0.5 rounded-full capitalize
            bg-gradient-to-r ${getTypeColor(milestone.type)} bg-opacity-20
            text-white/80
          `}
          >
            {milestone.type}
          </span>
        </div>

        <h4 className="text-white font-semibold mb-1">{milestone.title}</h4>
        <p className="text-sm text-slate-400">{milestone.description}</p>
      </div>
    </motion.div>
  );
};

export default function FutureTimeline({
  milestones,
  timeframe,
  onMilestoneClick,
}: FutureTimelineProps) {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case "3months":
        return "3 Months";
      case "6months":
        return "6 Months";
      case "1year":
        return "1 Year";
      case "2years":
        return "2 Years";
      default:
        return "6 Months";
    }
  };

  return (
    <div className="relative">
      {/* Background particles */}
      <TimelineParticles />

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-slate-900/80 via-purple-900/30 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
              >
                <Rocket className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Your Future Timeline
                </h3>
                <p className="text-sm text-purple-300">
                  Next {getTimeframeLabel(timeframe)} • {milestones.length}{" "}
                  Milestones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">
                {getTimeframeLabel(timeframe)} Journey
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
          {milestones.map((milestone, index) => (
            <MilestoneNode
              key={index}
              milestone={milestone}
              index={index}
              isActive={activeMilestone === index}
              onClick={() => {
                setActiveMilestone(index);
                onMilestoneClick?.(milestone);
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">
                AI-Predicted based on your learning velocity
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
            >
              View Full Journey
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  );
}
