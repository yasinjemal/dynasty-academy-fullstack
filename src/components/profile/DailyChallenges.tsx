"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  CheckCircle2,
  Clock,
  Flame,
  BookOpen,
  Trophy,
  Zap,
  Gift,
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  progress: number;
  target: number;
  unit: string;
  reward: string;
  expiresAt: Date;
  difficulty: "easy" | "medium" | "hard" | "insane";
}

interface DailyChallengesProps {
  challenges: Challenge[];
  completedToday: number;
}

const difficultyConfig = {
  easy: {
    color: "from-green-400 to-emerald-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-500",
  },
  medium: {
    color: "from-blue-400 to-cyan-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-500",
  },
  hard: {
    color: "from-purple-400 to-pink-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-500",
  },
  insane: {
    color: "from-red-400 via-orange-400 to-yellow-400",
    bgColor: "bg-gradient-to-br from-red-500/10 to-yellow-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-500",
  },
};

export default function DailyChallenges({
  challenges,
  completedToday,
}: DailyChallengesProps) {
  const totalChallenges = challenges.length;
  const completionRate = Math.round((completedToday / totalChallenges) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-500" />
              Daily Challenges
            </h2>
            <p className="text-sm text-muted-foreground">
              {completedToday} of {totalChallenges} completed today
            </p>
          </div>

          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 text-transparent bg-clip-text">
              {completionRate}%
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </motion.div>
        </div>

        {/* Overall progress */}
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
              initial={{ width: "0%" }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {completionRate === 100 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-green-500 font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              All challenges completed! Come back tomorrow for more!
            </motion.div>
          )}
        </div>
      </Card>

      {/* Challenge Cards */}
      <div className="space-y-4">
        {challenges.map((challenge, index) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            index={index}
          />
        ))}
      </div>

      {/* Bonus Reward */}
      {completionRate === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Gift className="w-12 h-12 text-yellow-500" />
              </motion.div>
              <div>
                <div className="text-lg font-bold">Perfect Day Bonus!</div>
                <div className="text-sm text-muted-foreground">
                  You've earned{" "}
                  <span className="text-yellow-500 font-semibold">
                    +500 Dynasty Score
                  </span>{" "}
                  for completing all challenges!
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function ChallengeCard({
  challenge,
  index,
}: {
  challenge: Challenge;
  index: number;
}) {
  const Icon = challenge.icon;
  const config = difficultyConfig[challenge.difficulty];
  const isCompleted = challenge.progress >= challenge.target;
  const progressPercent = Math.min(
    100,
    (challenge.progress / challenge.target) * 100
  );

  // Calculate time remaining
  const now = new Date();
  const timeRemaining = challenge.expiresAt.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card
        className={`
        p-5 border-2 relative overflow-hidden
        ${isCompleted ? "border-green-500/50" : config.borderColor}
        ${isCompleted ? "bg-green-500/5" : config.bgColor}
      `}
      >
        {/* Completion overlay */}
        {isCompleted && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <motion.div
                className={`
                  p-3 rounded-xl flex items-center justify-center
                  ${isCompleted ? "bg-green-500/20" : config.bgColor}
                `}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isCompleted ? "text-green-500" : config.textColor
                  }`}
                />
              </motion.div>

              {/* Title and description */}
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {challenge.title}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {challenge.description}
                </div>
              </div>
            </div>

            {/* Difficulty badge */}
            <Badge
              variant="outline"
              className={`${config.textColor} ${config.borderColor} capitalize`}
            >
              {challenge.difficulty}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {challenge.progress} / {challenge.target} {challenge.unit}
              </span>
              <span
                className={
                  isCompleted ? "text-green-500" : "text-muted-foreground"
                }
              >
                {Math.round(progressPercent)}%
              </span>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  isCompleted
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : `bg-gradient-to-r ${config.color}`
                }`}
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  delay: index * 0.1 + 0.2,
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            {/* Time remaining */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {hoursRemaining}h {minutesRemaining}m left
              </span>
            </div>

            {/* Reward */}
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-yellow-500">
                {challenge.reward}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Sample challenges
export const sampleChallenges: Challenge[] = [
  {
    id: "1",
    title: "Morning Reader",
    description: "Read 30 minutes before noon",
    icon: BookOpen,
    progress: 25,
    target: 30,
    unit: "min",
    reward: "+50 XP",
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    difficulty: "easy",
  },
  {
    id: "2",
    title: "Speed Reader",
    description: "Complete 3 chapters today",
    icon: Zap,
    progress: 1,
    target: 3,
    unit: "chapters",
    reward: "+100 XP",
    expiresAt: new Date(Date.now() + 15 * 60 * 60 * 1000),
    difficulty: "medium",
  },
  {
    id: "3",
    title: "Keep the Flame",
    description: "Maintain your reading streak",
    icon: Flame,
    progress: 1,
    target: 1,
    unit: "day",
    reward: "+25 XP",
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
    difficulty: "easy",
  },
  {
    id: "4",
    title: "Marathon Session",
    description: "Read for 2 hours straight",
    icon: Target,
    progress: 45,
    target: 120,
    unit: "min",
    reward: "+200 XP",
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
    difficulty: "hard",
  },
];
