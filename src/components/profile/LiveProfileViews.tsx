"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Eye, TrendingUp, Sparkles } from "lucide-react";

interface LiveProfileViewsProps {
  initialViews: number;
  isLive?: boolean;
}

export default function LiveProfileViews({
  initialViews,
  isLive = true,
}: LiveProfileViewsProps) {
  const [views, setViews] = useState(initialViews);
  const [showPulse, setShowPulse] = useState(false);
  const [recentIncrease, setRecentIncrease] = useState<number | null>(null);

  useEffect(() => {
    if (!isLive) return;

    // Simulate live view updates (in production, use WebSocket or polling)
    const interval = setInterval(() => {
      // Random chance of new view (20%)
      if (Math.random() > 0.8) {
        const increase = Math.floor(Math.random() * 3) + 1;
        setViews((prev) => prev + increase);
        setRecentIncrease(increase);
        setShowPulse(true);

        setTimeout(() => {
          setShowPulse(false);
          setRecentIncrease(null);
        }, 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 relative overflow-hidden">
      {/* Background pulse effect */}
      <AnimatePresence>
        {showPulse && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 1.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              className="p-2 rounded-lg bg-purple-500/20"
              animate={showPulse ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Eye className="w-5 h-5 text-purple-500" />
            </motion.div>
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2">
                Profile Views
                {isLive && (
                  <motion.span
                    className="flex items-center gap-1 text-xs text-green-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    LIVE
                  </motion.span>
                )}
              </h3>
            </div>
          </div>

          {/* Trending indicator */}
          <motion.div
            className="flex items-center gap-1 text-xs text-green-500"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">+12%</span>
          </motion.div>
        </div>

        {/* Main counter */}
        <div className="flex items-end gap-2 mb-4">
          <motion.div
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 text-transparent bg-clip-text"
            key={views}
            initial={{ scale: 1 }}
            animate={showPulse ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {views.toLocaleString()}
          </motion.div>

          {/* +N animation */}
          <AnimatePresence>
            {recentIncrease && (
              <motion.div
                className="text-lg font-bold text-green-500 flex items-center gap-1"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 1.5 }}
              >
                <Sparkles className="w-4 h-4" />+{recentIncrease}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Time breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            className="text-center p-2 rounded-lg bg-background/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-lg font-bold text-purple-400">
              {Math.floor(views * 0.3).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Today</div>
          </motion.div>

          <motion.div
            className="text-center p-2 rounded-lg bg-background/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-lg font-bold text-pink-400">
              {Math.floor(views * 0.5).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </motion.div>

          <motion.div
            className="text-center p-2 rounded-lg bg-background/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-lg font-bold text-orange-400">
              {Math.floor(views * 0.2).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </motion.div>
        </div>

        {/* Sparkle particles on update */}
        <AnimatePresence>
          {showPulse && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    opacity: 1,
                    x: "50%",
                    y: "50%",
                    scale: 0,
                  }}
                  animate={{
                    opacity: 0,
                    x: `${50 + Math.cos((i * Math.PI) / 4) * 100}%`,
                    y: `${50 + Math.sin((i * Math.PI) / 4) * 100}%`,
                    scale: 1,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
