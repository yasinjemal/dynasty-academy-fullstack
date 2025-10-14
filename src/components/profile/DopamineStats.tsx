"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Trophy,
  Flame,
  TrendingUp,
  Eye,
  Zap,
  Target,
  Award,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface DopamineStatsProps {
  dynastyScore: number;
  level: number;
  streakDays: number;
  followersCount: number;
  booksCompleted: number;
  readingMinutes: number;
}

// Animated Counter Component with Odometer Effect
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [display]);

  return (
    <span className="tabular-nums font-bold">
      {displayValue}
      {suffix}
    </span>
  );
}

// Pulsing Dynasty Score with Glow
function DynastyScorePulse({ score, level }: { score: number; level: number }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      <Card className="p-6 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border-purple-500/30 overflow-hidden">
        {/* Animated Background Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="w-6 h-6 text-yellow-500" />
              </motion.div>
              <span className="text-sm font-medium text-muted-foreground">
                Dynasty Score
              </span>
            </div>
            <motion.div
              className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xs font-bold text-blue-400">
                Level {level}
              </span>
            </motion.div>
          </div>

          <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 text-transparent bg-clip-text">
            <AnimatedCounter value={score} />
          </div>

          {/* Progress to Next Level */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                initial={{ width: "0%" }}
                animate={{ width: `${(score % 1000) / 10}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-center">
              <AnimatedCounter value={1000 - (score % 1000)} /> XP to next level
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Streak Counter with Fire Animation
function StreakFlame({ days }: { days: number }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Flame className="w-5 h-5 text-orange-500" />
              </motion.div>
              <span className="text-sm font-medium text-muted-foreground">
                Streak
              </span>
            </div>
            <div className="text-3xl font-bold text-orange-400">
              <AnimatedCounter value={days} /> days
            </div>
          </div>

          {/* Streak Milestone Badges */}
          <div className="flex flex-col gap-1">
            {[7, 30, 100].map((milestone) => (
              <motion.div
                key={milestone}
                className={`w-2 h-2 rounded-full ${
                  days >= milestone ? "bg-orange-500" : "bg-muted"
                }`}
                whileHover={{ scale: 1.5 }}
                animate={days >= milestone ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        {days >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-xs text-orange-400/80"
          >
            🔥 Don't break the chain!
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

// Quick Stat Card with Hover Effect
function QuickStat({
  icon: Icon,
  label,
  value,
  suffix = "",
  color,
  delay = 0,
}: {
  icon: any;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card
        className={`p-4 bg-gradient-to-br ${color} border-opacity-30 hover:border-opacity-50 transition-all duration-300 cursor-pointer`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-bold">
              <AnimatedCounter value={value} suffix={suffix} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function DopamineStats({
  dynastyScore,
  level,
  streakDays,
  followersCount,
  booksCompleted,
  readingMinutes,
}: DopamineStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Main Dynasty Score */}
      <DynastyScorePulse score={dynastyScore} level={level} />

      {/* Streak Counter */}
      <StreakFlame days={streakDays} />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <QuickStat
          icon={Eye}
          label="Followers"
          value={followersCount}
          color="from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          delay={0.2}
        />
        <QuickStat
          icon={Award}
          label="Books Done"
          value={booksCompleted}
          color="from-green-500/20 to-emerald-500/20 border-green-500/30"
          delay={0.3}
        />
        <QuickStat
          icon={Zap}
          label="Minutes"
          value={Math.round(readingMinutes)}
          color="from-yellow-500/20 to-amber-500/20 border-yellow-500/30"
          delay={0.4}
        />
        <QuickStat
          icon={TrendingUp}
          label="Growth"
          value={Math.round(dynastyScore / 100)}
          suffix="%"
          color="from-purple-500/20 to-fuchsia-500/20 border-purple-500/30"
          delay={0.5}
        />
      </div>

      {/* Achievement Teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/20 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-5 h-5 text-yellow-500" />
              </motion.div>
              <div>
                <div className="text-sm font-medium">Next Achievement</div>
                <div className="text-xs text-muted-foreground">
                  Read 5 more books
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-400">80%</div>
          </div>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: "80%" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
