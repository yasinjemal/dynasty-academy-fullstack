"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface XPNotificationProps {
  amount: number;
  reason?: string;
  show?: boolean;
  onComplete?: () => void;
}

export default function XPNotification({
  amount,
  reason = "Action completed",
  show = false,
  onComplete,
}: XPNotificationProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3000);

      // Trigger confetti for large XP gains
      if (amount >= 100) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.3 },
          colors: ["#8B5CF6", "#EC4899", "#F59E0B"],
        });
      }

      return () => clearTimeout(timer);
    }
  }, [show, amount, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-1 rounded-2xl shadow-2xl">
            <div className="bg-gray-900 rounded-xl px-6 py-4 flex items-center gap-4">
              {/* Animated Icon */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                }}
                className="flex-shrink-0"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" fill="white" />
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider">
                    XP Gained!
                  </p>
                </div>
                <p className="text-2xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text">
                  +{amount} XP
                </p>
                <p className="text-xs text-gray-400 mt-1">{reason}</p>
              </div>

              {/* Sparkles */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
              </motion.div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 blur-xl rounded-2xl -z-10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger XP notifications
export function useXPNotification() {
  const [notification, setNotification] = useState<{
    show: boolean;
    amount: number;
    reason?: string;
  }>({
    show: false,
    amount: 0,
  });

  const showXP = (amount: number, reason?: string) => {
    setNotification({ show: true, amount, reason });
  };

  const hideXP = () => {
    setNotification({ show: false, amount: 0 });
  };

  return { notification, showXP, hideXP };
}
