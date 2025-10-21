"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Trophy,
  Flame,
  Award,
  Star,
  Gift,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import XPNotification from "@/components/gamification/XPNotification";
import LevelUpCelebration from "@/components/gamification/LevelUpCelebration";
import XPWidget, { XPFloatingWidget } from "@/components/gamification/XPWidget";
import StreakWidget from "@/components/gamification/StreakWidget";
import {
  awardXP,
  unlockAchievement,
} from "@/components/gamification/GamificationProvider";

export default function GamificationDemoPage() {
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXPAmount] = useState(50);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(5);
  const [loading, setLoading] = useState(false);

  // Test XP notification
  const testXPNotification = (amount: number, reason: string) => {
    setXPAmount(amount);
    setShowXP(true);
    setTimeout(() => setShowXP(false), 3500);
  };

  // Test Level Up
  const testLevelUp = (level: number) => {
    setLevelUpLevel(level);
    setShowLevelUp(true);
  };

  // Award real XP
  const awardRealXP = async (amount: number, reason: string) => {
    setLoading(true);
    try {
      const result = await awardXP(amount, reason);
      if (result) {
        toast.success(`Awarded +${amount} XP!`);
        testXPNotification(amount, reason);

        if (result.leveledUp) {
          setTimeout(() => {
            testLevelUp(result.newLevel);
          }, 3500);
        }
      }
    } catch (error) {
      toast.error("Failed to award XP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text mb-4"
          >
            🎮 Gamification System Demo
          </motion.h1>
          <p className="text-gray-400 text-lg">
            Test all the amazing gamification features!
          </p>
        </div>

        {/* Live Widgets Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              XP Widget (Medium)
            </h2>
            <XPWidget />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Streak Widget (Medium)
            </h2>
            <StreakWidget size="md" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Compact Widgets
            </h2>
            <Card className="bg-gray-800 border-gray-700 p-4 space-y-3">
              <XPWidget compact />
              <StreakWidget size="sm" />
            </Card>
          </motion.div>
        </div>

        {/* Large Widgets */}
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Detailed Streak Widget
            </h2>
            <StreakWidget size="lg" />
          </motion.div>
        </div>

        {/* Test Buttons */}
        <Card className="bg-gray-800 border-purple-500/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Test Notifications & Celebrations
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* XP Tests */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                XP Notifications
              </h3>
              <Button
                onClick={() => testXPNotification(25, "Completed a lesson")}
                className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30"
              >
                +25 XP (Small)
              </Button>
              <Button
                onClick={() => testXPNotification(100, "Finished a course")}
                className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
              >
                +100 XP (Large)
              </Button>
              <Button
                onClick={() =>
                  testXPNotification(500, "🎉 Completed 10-day streak!")
                }
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
              >
                +500 XP (Epic!)
              </Button>
            </div>

            {/* Level Up Tests */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Level Up Celebrations
              </h3>
              <Button
                onClick={() => testLevelUp(5)}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
              >
                Level 5 (Bronze)
              </Button>
              <Button
                onClick={() => testLevelUp(25)}
                className="w-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30"
              >
                Level 25 (Gold)
              </Button>
              <Button
                onClick={() => testLevelUp(100)}
                className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 border border-yellow-500/30"
              >
                Level 100 (Emperor!)
              </Button>
            </div>

            {/* Real Actions */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-green-400" />
                Real Actions (DB)
              </h3>
              <Button
                onClick={() => awardRealXP(50, "Completed a lesson")}
                disabled={loading}
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
              >
                {loading ? "Awarding..." : "Award +50 XP"}
              </Button>
              <Button
                onClick={() => awardRealXP(200, "Finished a course")}
                disabled={loading}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
              >
                {loading ? "Awarding..." : "Award +200 XP"}
              </Button>
              <Button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await unlockAchievement("first_lesson");
                    toast.success("Achievement unlocked!");
                  } catch (error) {
                    toast.error("Failed to unlock achievement");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
              >
                {loading ? "Unlocking..." : "Unlock Achievement"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Features Overview */}
        <Card className="bg-gray-800 border-purple-500/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Features Included
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "XP Notifications",
                desc: "Animated pop-ups with confetti",
                color: "yellow",
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Level Up Celebrations",
                desc: "Full-screen epic animations",
                color: "purple",
              },
              {
                icon: <Flame className="w-8 h-8" />,
                title: "Daily Streaks",
                desc: "Track consecutive days of activity",
                color: "orange",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Achievement System",
                desc: "Unlock badges and titles",
                color: "green",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Progress Tracking",
                desc: "Visual progress bars everywhere",
                color: "blue",
              },
              {
                icon: <Gift className="w-8 h-8" />,
                title: "Level Rewards",
                desc: "Unlock features as you level up",
                color: "pink",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-${feature.color}-500/10 border border-${feature.color}-500/30 rounded-xl p-6`}
              >
                <div className={`text-${feature.color}-400 mb-3`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Documentation */}
        <Card className="bg-gray-800 border-blue-500/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            📚 How to Use in Your App
          </h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-bold text-white mb-2">1. Award XP:</h3>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                {`import { awardXP } from '@/components/gamification/GamificationProvider';

// Award XP anywhere in your app
await awardXP(50, "Completed a lesson");`}
              </pre>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">2. Show Widgets:</h3>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                {`import XPWidget from '@/components/gamification/XPWidget';
import StreakWidget from '@/components/gamification/StreakWidget';

<XPWidget />
<StreakWidget size="md" />`}
              </pre>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">
                3. Unlock Achievements:
              </h3>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                {`import { unlockAchievement } from '@/components/gamification/GamificationProvider';

await unlockAchievement("first_lesson");`}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* XP Notification Component */}
      <XPNotification
        amount={xpAmount}
        reason="Test notification"
        show={showXP}
        onComplete={() => setShowXP(false)}
      />

      {/* Level Up Celebration */}
      <LevelUpCelebration
        show={showLevelUp}
        level={levelUpLevel}
        title={
          levelUpLevel >= 100
            ? "🔱 Dynasty Emperor"
            : levelUpLevel >= 25
            ? "🥇 Gold Dynasty"
            : "🥉 Bronze Dynasty"
        }
        xpToNext={Math.floor(1000 * Math.pow(1.5, levelUpLevel))}
        rewards={
          levelUpLevel === 100
            ? ["👑 Emperor Crown", "Special Title", "+1000 Bonus XP"]
            : levelUpLevel === 25
            ? ["Premium Content Access", "Gold Badge", "+500 Bonus XP"]
            : ["Profile Customization", "Bronze Badge"]
        }
        onClose={() => setShowLevelUp(false)}
      />

      {/* Floating Widget */}
      <XPFloatingWidget />
    </div>
  );
}
