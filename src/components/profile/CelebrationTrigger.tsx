"use client";

import { useEffect, useRef } from "react";
import { confettiConfig } from "@/lib/confetti";

interface CelebrationTriggerProps {
  type:
    | "levelUp"
    | "achievement"
    | "milestone"
    | "streak"
    | "follow"
    | "bookComplete";
  trigger: boolean;
  emoji?: string;
  onComplete?: () => void;
}

export default function CelebrationTrigger({
  type,
  trigger,
  emoji,
  onComplete,
}: CelebrationTriggerProps) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;

      // Fire confetti based on type
      switch (type) {
        case "levelUp":
          confettiConfig.levelUp();
          break;
        case "achievement":
          confettiConfig.achievement();
          break;
        case "milestone":
          confettiConfig.milestone(emoji);
          break;
        case "streak":
          confettiConfig.streak();
          break;
        case "follow":
          confettiConfig.follow();
          break;
        case "bookComplete":
          confettiConfig.bookComplete();
          break;
      }

      if (onComplete) {
        setTimeout(onComplete, 3000);
      }

      // Reset after animation
      setTimeout(() => {
        hasTriggered.current = false;
      }, 4000);
    }
  }, [trigger, type, emoji, onComplete]);

  return null;
}
