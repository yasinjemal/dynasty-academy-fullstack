'use client';

import { Trophy, Flame, Heart, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SignalBarProps {
  dynastyScore: number;
  level: number;
  streakDays: number;
  thanksReceived: number;
}

export default function SignalBar({
  dynastyScore,
  level,
  streakDays,
  thanksReceived,
}: SignalBarProps) {
  // Calculate XP for next level (simple formula)
  const xpForNextLevel = level * 150;
  const xpProgress = (dynastyScore % xpForNextLevel) / xpForNextLevel;

  return (
    <div className="flex flex-wrap gap-3">
      {/* Dynasty Score */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 dark:border-purple-900 dark:bg-purple-950">
              <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold">{dynastyScore} DS</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              {dynastyScore} DS • {Math.ceil(xpForNextLevel - (dynastyScore % xpForNextLevel))} to Level {level + 1}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Level */}
      <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-900 dark:bg-blue-950">
        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-semibold">Level {level}</span>
      </div>

      {/* Streak */}
      {streakDays > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 dark:border-orange-900 dark:bg-orange-950">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-semibold">{streakDays} day streak</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                On a {streakDays}-day run • Keep the flame alive
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Thanks */}
      {thanksReceived > 0 && (
        <div className="flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 dark:border-pink-900 dark:bg-pink-950">
          <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          <span className="text-sm font-semibold">{thanksReceived} Thanks</span>
        </div>
      )}
    </div>
  );
}
