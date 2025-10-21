"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import XPNotification from "./XPNotification";
import LevelUpCelebration from "./LevelUpCelebration";
import { useAchievementToasts } from "@/hooks/useAchievementToasts";

interface GamificationContextType {
  showXP: (amount: number, reason?: string) => void;
  showLevelUp: (
    level: number,
    title?: string,
    xpToNext?: number,
    rewards?: string[]
  ) => void;
  triggerXPUpdate: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined
);

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within GamificationProvider");
  }
  return context;
}

interface GamificationProviderProps {
  children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  const [xpNotification, setXPNotification] = useState<{
    show: boolean;
    amount: number;
    reason?: string;
  }>({
    show: false,
    amount: 0,
  });

  const [levelUpData, setLevelUpData] = useState<{
    show: boolean;
    level: number;
    title?: string;
    xpToNext?: number;
    rewards?: string[];
  }>({
    show: false,
    level: 1,
  });

  // Initialize achievement toasts
  useAchievementToasts();

  const showXP = useCallback((amount: number, reason?: string) => {
    setXPNotification({ show: true, amount, reason });
  }, []);

  const showLevelUp = useCallback(
    (level: number, title?: string, xpToNext?: number, rewards?: string[]) => {
      setLevelUpData({ show: true, level, title, xpToNext, rewards });
    },
    []
  );

  const triggerXPUpdate = useCallback(() => {
    // Dispatch custom event to update all XP widgets
    window.dispatchEvent(new CustomEvent("xp-updated"));
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        showXP,
        showLevelUp,
        triggerXPUpdate,
      }}
    >
      {children}

      {/* XP Notification */}
      <XPNotification
        amount={xpNotification.amount}
        reason={xpNotification.reason}
        show={xpNotification.show}
        onComplete={() => setXPNotification({ show: false, amount: 0 })}
      />

      {/* Level Up Celebration */}
      <LevelUpCelebration
        show={levelUpData.show}
        level={levelUpData.level}
        title={levelUpData.title}
        xpToNext={levelUpData.xpToNext}
        rewards={levelUpData.rewards}
        onClose={() => setLevelUpData({ show: false, level: 1 })}
      />
    </GamificationContext.Provider>
  );
}

// Helper function to award XP from anywhere in the app
export async function awardXP(
  amount: number,
  reason?: string,
  showNotification = true
) {
  try {
    const response = await fetch("/api/gamification/award-xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, reason }),
    });

    if (!response.ok) throw new Error("Failed to award XP");

    const data = await response.json();

    // Trigger XP notification
    if (showNotification && window) {
      window.dispatchEvent(
        new CustomEvent("show-xp", {
          detail: { amount, reason },
        })
      );
    }

    // Check if leveled up
    if (data.leveledUp) {
      window.dispatchEvent(
        new CustomEvent("level-up", {
          detail: {
            level: data.newLevel,
            title: data.newTitle,
            xpToNext: data.xpToNextLevel,
            rewards: data.rewards,
          },
        })
      );
    }

    // Trigger update for all widgets
    window.dispatchEvent(new CustomEvent("xp-updated"));

    return data;
  } catch (error) {
    console.error("[Award XP] Error:", error);
    return null;
  }
}

// Helper to unlock achievements
export async function unlockAchievement(achievementKey: string) {
  try {
    const response = await fetch("/api/gamification/unlock-achievement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: achievementKey }),
    });

    if (!response.ok) throw new Error("Failed to unlock achievement");

    const data = await response.json();

    // Trigger achievement toast
    if (data.achievement && window) {
      window.dispatchEvent(
        new CustomEvent("achievement-unlocked", {
          detail: data.achievement,
        })
      );
    }

    return data;
  } catch (error) {
    console.error("[Unlock Achievement] Error:", error);
    return null;
  }
}
