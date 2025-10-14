"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Trophy,
  Star,
  Flame,
  BookOpen,
  Users,
  Zap,
  Crown,
  Sparkles,
  Award,
  Target,
  Lock,
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
  progress?: number;
  total?: number;
}

interface AchievementShowcaseProps {
  achievements: Achievement[];
  totalPossible: number;
}

const rarityConfig = {
  common: {
    color: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/50",
    textColor: "text-gray-400",
    glow: "shadow-gray-500/50",
  },
  rare: {
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    textColor: "text-blue-400",
    glow: "shadow-blue-500/50",
  },
  epic: {
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
    textColor: "text-purple-400",
    glow: "shadow-purple-500/50",
  },
  legendary: {
    color: "from-orange-400 via-yellow-400 to-orange-400",
    bgColor: "bg-gradient-to-br from-orange-500/20 to-yellow-500/20",
    borderColor: "border-orange-500/50",
    textColor: "text-orange-400",
    glow: "shadow-orange-500/50 shadow-lg",
  },
};

export default function AchievementShowcase({
  achievements,
  totalPossible,
}: AchievementShowcaseProps) {
  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);
  const completionRate = Math.round((unlocked.length / totalPossible) * 100);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Achievement Gallery
            </h2>
            <p className="text-muted-foreground">
              {unlocked.length} of {totalPossible} unlocked
            </p>
          </div>

          <div className="text-center">
            <motion.div
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 text-transparent bg-clip-text"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              {completionRate}%
            </motion.div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
            initial={{ width: "0%" }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </Card>

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Unlocked ({unlocked.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unlocked.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
                isUnlocked={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Locked ({locked.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {locked.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
                isUnlocked={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AchievementCard({
  achievement,
  index,
  isUnlocked,
}: {
  achievement: Achievement;
  index: number;
  isUnlocked: boolean;
}) {
  const Icon = achievement.icon;
  const config = rarityConfig[achievement.rarity];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.5,
              type: "spring",
              bounce: 0.4,
            }}
            whileHover={{
              scale: 1.05,
              y: -5,
              rotateY: isUnlocked ? 360 : 0,
              transition: { duration: 0.6 },
            }}
          >
            <Card
              className={`
              p-4 border-2 cursor-pointer relative overflow-hidden
              ${isUnlocked ? config.borderColor : "border-muted/50"}
              ${isUnlocked ? config.bgColor : "bg-muted/20"}
              ${isUnlocked ? config.glow : ""}
            `}
            >
              {/* Legendary shimmer effect */}
              {isUnlocked && achievement.rarity === "legendary" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              )}

              {/* Icon */}
              <div className="relative">
                <motion.div
                  className={`
                    w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center
                    ${
                      isUnlocked
                        ? `bg-gradient-to-br ${config.color}`
                        : "bg-muted"
                    }
                    ${
                      isUnlocked && achievement.rarity === "legendary"
                        ? "animate-pulse"
                        : ""
                    }
                  `}
                  animate={
                    isUnlocked
                      ? {
                          rotate:
                            achievement.rarity === "legendary"
                              ? [0, 5, -5, 0]
                              : 0,
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Icon
                    className={`w-8 h-8 ${
                      isUnlocked ? "text-white" : "text-muted-foreground"
                    }`}
                  />
                </motion.div>

                {/* Rarity badge */}
                {isUnlocked && (
                  <Badge
                    variant="outline"
                    className={`absolute -top-1 -right-1 text-xs ${config.textColor} ${config.borderColor}`}
                  >
                    {achievement.rarity}
                  </Badge>
                )}

                {/* Lock overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div
                className={`text-center text-sm font-semibold ${
                  isUnlocked ? "" : "text-muted-foreground"
                }`}
              >
                {isUnlocked ? achievement.name : "???"}
              </div>

              {/* Progress bar for locked */}
              {!isUnlocked &&
                achievement.progress !== undefined &&
                achievement.total !== undefined && (
                  <div className="mt-2">
                    <div className="text-xs text-center text-muted-foreground mb-1">
                      {achievement.progress}/{achievement.total}
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${
                            (achievement.progress / achievement.total) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div>
            <div className="font-bold mb-1">
              {isUnlocked ? achievement.name : "Locked Achievement"}
            </div>
            <div className="text-sm text-muted-foreground">
              {isUnlocked
                ? achievement.description
                : "Keep exploring to unlock this achievement!"}
            </div>
            {isUnlocked && achievement.unlockedAt && (
              <div className="text-xs text-muted-foreground mt-2">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Sample achievements data for demo
export const sampleAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Steps",
    description: "Complete your first book",
    icon: BookOpen,
    rarity: "common",
    unlockedAt: new Date(),
  },
  {
    id: "2",
    name: "Social Butterfly",
    description: "Get 100 followers",
    icon: Users,
    rarity: "rare",
    unlockedAt: new Date(),
  },
  {
    id: "3",
    name: "Speed Reader",
    description: "Read for 10 hours in one week",
    icon: Zap,
    rarity: "epic",
    unlockedAt: new Date(),
  },
  {
    id: "4",
    name: "Dynasty Legend",
    description: "Reach Dynasty Score 10,000",
    icon: Crown,
    rarity: "legendary",
    unlockedAt: new Date(),
  },
  {
    id: "5",
    name: "Streak Master",
    description: "Maintain a 100-day streak",
    icon: Flame,
    rarity: "legendary",
    progress: 45,
    total: 100,
  },
  {
    id: "6",
    name: "Book Collector",
    description: "Complete 50 books",
    icon: BookOpen,
    rarity: "epic",
    progress: 32,
    total: 50,
  },
];
