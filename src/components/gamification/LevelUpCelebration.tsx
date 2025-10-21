"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, TrendingUp, Award, Zap } from "lucide-react";
import confetti from "canvas-confetti";

interface LevelUpCelebrationProps {
  show: boolean;
  level: number;
  title?: string;
  xpToNext?: number;
  rewards?: string[];
  onClose?: () => void;
}

export default function LevelUpCelebration({
  show,
  level,
  title = "Dynasty Warrior",
  xpToNext = 1000,
  rewards = [],
  onClose,
}: LevelUpCelebrationProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      // Epic confetti celebration!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981"],
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              bounce: 0.5,
              duration: 0.8,
            }}
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Card */}
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-1 rounded-3xl shadow-2xl">
              <div className="bg-gray-900 rounded-3xl p-8">
                {/* Crown Icon */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-12 h-12 text-white" fill="white" />
                    </div>
                    {/* Sparkles around crown */}
                    {[0, 90, 180, 270].map((angle, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="absolute top-1/2 left-1/2"
                        style={{
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-50px)`,
                        }}
                      >
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Level Up Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mb-6"
                >
                  <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Level Up!
                  </p>
                  <h2 className="text-6xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text mb-2">
                    {level}
                  </h2>
                  <p className="text-xl font-bold text-white mb-1">{title}</p>
                  <p className="text-sm text-gray-400">
                    {xpToNext.toLocaleString()} XP to next level
                  </p>
                </motion.div>

                {/* Rewards */}
                {rewards.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 rounded-2xl p-4 mb-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-purple-400" />
                      <p className="text-sm font-bold text-white">
                        New Rewards Unlocked!
                      </p>
                    </div>
                    <div className="space-y-2">
                      {rewards.map((reward, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <Zap className="w-4 h-4 text-yellow-400" />
                          {reward}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Close Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => {
                    setVisible(false);
                    onClose?.();
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Continue Your Journey
                </motion.button>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-orange-600/30 blur-3xl rounded-3xl -z-10" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger level up celebrations
export function useLevelUpCelebration() {
  const [celebration, setCelebration] = useState<{
    show: boolean;
    level: number;
    title?: string;
    xpToNext?: number;
    rewards?: string[];
  }>({
    show: false,
    level: 1,
  });

  const showLevelUp = (
    level: number,
    title?: string,
    xpToNext?: number,
    rewards?: string[]
  ) => {
    setCelebration({ show: true, level, title, xpToNext, rewards });
  };

  const hideLevelUp = () => {
    setCelebration({ show: false, level: 1 });
  };

  return { celebration, showLevelUp, hideLevelUp };
}
