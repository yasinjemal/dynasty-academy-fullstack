"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, TrendingUp } from "lucide-react";

interface ActivityDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
  totalDays?: number;
}

export default function ActivityHeatmap({
  data,
  totalDays = 365,
}: ActivityHeatmapProps) {
  // Generate last N days
  const generateDays = (): ActivityDay[] => {
    const days: ActivityDay[] = [];
    const today = new Date();

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      // Find existing data or create empty
      const existing = data.find((d) => d.date === dateString);
      days.push(
        existing || {
          date: dateString,
          count: 0,
          level: 0,
        }
      );
    }

    return days;
  };

  const days = generateDays();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted hover:bg-muted/80";
      case 1:
        return "bg-purple-200 dark:bg-purple-900/30 hover:bg-purple-300 dark:hover:bg-purple-900/50";
      case 2:
        return "bg-purple-400 dark:bg-purple-700/50 hover:bg-purple-500 dark:hover:bg-purple-700/70";
      case 3:
        return "bg-purple-600 dark:bg-purple-500/70 hover:bg-purple-700 dark:hover:bg-purple-500/90";
      case 4:
        return "bg-purple-800 dark:bg-purple-400 hover:bg-purple-900 dark:hover:bg-purple-300";
      default:
        return "bg-muted";
    }
  };

  const totalContributions = days.reduce((sum, day) => sum + day.count, 0);
  const currentStreak = calculateStreak(days);
  const longestStreak = calculateLongestStreak(days);
  const mostActiveDay = days.reduce(
    (max, day) => (day.count > max.count ? day : max),
    days[0]
  );

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Activity Heatmap</h3>
            <p className="text-sm text-muted-foreground">
              {totalContributions} readings this year
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className={`w-3 h-3 rounded ${getColor(level)}`} />
          ))}
          <span className="text-muted-foreground">More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <TooltipProvider key={dayIndex}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className={`w-3 h-3 rounded transition-all cursor-pointer ${getColor(
                          day.level
                        )}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: (weekIndex * 7 + dayIndex) * 0.001,
                          duration: 0.2,
                        }}
                        whileHover={{ scale: 1.5 }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-semibold">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-muted-foreground">
                          {day.count} {day.count === 1 ? "reading" : "readings"}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl font-bold text-purple-500">
            {currentStreak}
          </div>
          <div className="text-xs text-muted-foreground">Current Streak</div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-purple-500">
            {longestStreak}
          </div>
          <div className="text-xs text-muted-foreground">Longest Streak</div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-2xl font-bold text-purple-500">
            {mostActiveDay.count}
          </div>
          <div className="text-xs text-muted-foreground">Best Day</div>
        </motion.div>
      </div>
    </Card>
  );
}

function calculateStreak(days: ActivityDay[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calculateLongestStreak(days: ActivityDay[]): number {
  let longest = 0;
  let current = 0;

  for (const day of days) {
    if (day.count > 0) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}
