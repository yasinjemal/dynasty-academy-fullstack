"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  BookOpen,
  Clock,
  Zap,
  Trophy,
  Users,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PomodoroTimerProps {
  isHost: boolean;
  studyDuration: number; // minutes
  breakDuration: number; // minutes
  currentPhase: "study" | "break" | "idle";
  timeRemaining: number; // seconds
  participants: number;
  onStart: (studyMins: number, breakMins: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

// Preset durations
const PRESETS = [
  { study: 25, break: 5, name: "Classic", icon: "🍅" },
  { study: 50, break: 10, name: "Deep Focus", icon: "🧠" },
  { study: 15, break: 3, name: "Quick Sprint", icon: "⚡" },
  { study: 90, break: 20, name: "Ultralearning", icon: "🚀" },
];

export default function PomodoroTimer({
  isHost,
  studyDuration,
  breakDuration,
  currentPhase,
  timeRemaining,
  participants,
  onStart,
  onPause,
  onResume,
  onReset,
}: PomodoroTimerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customStudy, setCustomStudy] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const totalDuration =
    currentPhase === "study" ? studyDuration * 60 : breakDuration * 60;
  const progress =
    totalDuration > 0
      ? ((totalDuration - timeRemaining) / totalDuration) * 100
      : 0;

  // Phase colors
  const phaseColors = {
    study: {
      bg: "from-purple-600 to-pink-600",
      ring: "ring-purple-500",
      text: "text-purple-400",
      glow: "shadow-purple-500/50",
    },
    break: {
      bg: "from-green-500 to-emerald-500",
      ring: "ring-green-500",
      text: "text-green-400",
      glow: "shadow-green-500/50",
    },
    idle: {
      bg: "from-slate-600 to-slate-700",
      ring: "ring-slate-500",
      text: "text-slate-400",
      glow: "shadow-slate-500/30",
    },
  };

  const colors = phaseColors[currentPhase];

  // Track completed sessions
  useEffect(() => {
    if (currentPhase === "break" && timeRemaining === breakDuration * 60) {
      setCompletedSessions((prev) => prev + 1);
    }
  }, [currentPhase, timeRemaining, breakDuration]);

  const handleStartSession = () => {
    const preset = PRESETS[selectedPreset];
    onStart(preset?.study || customStudy, preset?.break || customBreak);
    setIsExpanded(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-50"
    >
      {/* Mini timer (collapsed) */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="mini"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className={`
              relative cursor-pointer group
              bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4
              border border-white/10 shadow-2xl ${colors.glow}
              hover:border-white/20 transition-all
            `}
          >
            {/* Glowing ring */}
            {currentPhase !== "idle" && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${
                    currentPhase === "study" ? "#8b5cf6" : "#10b981"
                  }, transparent)`,
                  opacity: 0.3,
                }}
              />
            )}

            <div className="relative flex items-center gap-4">
              {/* Timer circle */}
              <div className="relative w-16 h-16">
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-slate-700"
                  />
                  {currentPhase !== "idle" && (
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="url(#timerGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={176}
                      strokeDashoffset={176 - (progress / 100) * 176}
                    />
                  )}
                  <defs>
                    <linearGradient
                      id="timerGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          currentPhase === "study" ? "#8b5cf6" : "#10b981"
                        }
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          currentPhase === "study" ? "#ec4899" : "#34d399"
                        }
                      />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {currentPhase === "idle" ? (
                    <Play className="w-6 h-6 text-slate-400" />
                  ) : currentPhase === "break" ? (
                    <Coffee className="w-6 h-6 text-green-400" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  )}
                </div>
              </div>

              {/* Time display */}
              <div>
                <p className="text-2xl font-mono font-bold text-white">
                  {currentPhase === "idle"
                    ? "--:--"
                    : formatTime(timeRemaining)}
                </p>
                <p
                  className={`text-xs uppercase tracking-wider ${colors.text}`}
                >
                  {currentPhase === "idle"
                    ? "Click to start"
                    : currentPhase === "study"
                    ? "Focus Time"
                    : "Break Time"}
                </p>
              </div>

              {/* Participants indicator */}
              {participants > 1 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                  <Users className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300">
                    {participants}
                  </span>
                </div>
              )}
            </div>

            {/* Session count */}
            {completedSessions > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">
                  {completedSessions}
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl w-80"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: currentPhase !== "idle" ? 360 : 0 }}
                  transition={{
                    duration: 2,
                    repeat: currentPhase !== "idle" ? Infinity : 0,
                    ease: "linear",
                  }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <Clock className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-white">Study Timer</h3>
                  <p className="text-xs text-slate-400">
                    {completedSessions} sessions completed
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-slate-400"
              >
                ✕
              </Button>
            </div>

            {/* Big timer display */}
            <div className="relative mb-6">
              {/* Circular progress */}
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-800"
                  />
                  {currentPhase !== "idle" && (
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="url(#bigTimerGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={440}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{
                        strokeDashoffset: 440 - (progress / 100) * 440,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  <defs>
                    <linearGradient
                      id="bigTimerGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          currentPhase === "study" ? "#8b5cf6" : "#10b981"
                        }
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          currentPhase === "study" ? "#ec4899" : "#34d399"
                        }
                      />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-mono font-bold text-white">
                    {currentPhase === "idle"
                      ? "--:--"
                      : formatTime(timeRemaining)}
                  </p>
                  <p
                    className={`text-sm uppercase tracking-wider ${colors.text} mt-1`}
                  >
                    {currentPhase === "idle"
                      ? "Ready"
                      : currentPhase === "study"
                      ? "Focus"
                      : "Break"}
                  </p>
                </div>
              </div>

              {/* Phase indicator dots */}
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{
                      scale: i < completedSessions % 4 ? 1 : 0.8,
                      backgroundColor:
                        i < completedSessions % 4 ? "#f59e0b" : "#475569",
                    }}
                    className="w-3 h-3 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            {currentPhase === "idle" ? (
              <>
                {/* Presets */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {PRESETS.map((preset, index) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedPreset(index)}
                      className={`
                        p-3 rounded-xl text-left transition-all
                        ${
                          selectedPreset === index
                            ? "bg-purple-500/20 border-2 border-purple-500/50"
                            : "bg-slate-800/50 border-2 border-transparent hover:border-white/10"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{preset.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {preset.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {preset.study}m / {preset.break}m
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Start button */}
                <Button
                  onClick={handleStartSession}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 h-12 text-lg"
                  disabled={!isHost}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isHost ? "Start Focus Session" : "Waiting for host..."}
                </Button>

                {participants > 1 && (
                  <p className="text-center text-xs text-slate-400 mt-3">
                    <Users className="w-3 h-3 inline mr-1" />
                    {participants} people will study together
                  </p>
                )}
              </>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={isPaused ? onResume : onPause}
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={!isHost}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  onClick={onReset}
                  variant="ghost"
                  className="h-12 px-4"
                  disabled={!isHost}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Achievement preview */}
            {completedSessions > 0 && completedSessions % 4 === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">
                      Pomodoro Master!
                    </p>
                    <p className="text-xs text-amber-400/70">
                      +50 XP earned for 4 focus sessions
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
