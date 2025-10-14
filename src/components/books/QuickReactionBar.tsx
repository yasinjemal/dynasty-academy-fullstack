"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";

interface QuickReactionBarProps {
  onReact: (emoji: string, textIndex: number) => void;
  currentTextIndex?: number;
}

const QUICK_EMOJIS = ["👍", "🔥", "💡", "❤️", "😂", "🎯"];

export default function QuickReactionBar({
  onReact,
  currentTextIndex = 0,
}: QuickReactionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReaction = (emoji: string) => {
    onReact(emoji, currentTextIndex);
    // Brief feedback animation
    setIsExpanded(false);
    setTimeout(() => setIsExpanded(false), 100);
  };

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <div className="relative">
        {/* Emoji Options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 flex gap-1 border border-gray-200 dark:border-gray-700"
            >
              {QUICK_EMOJIS.map((emoji, index) => (
                <motion.button
                  key={emoji}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleReaction(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-110 active:scale-95"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isExpanded
              ? "bg-purple-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
          }`}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Smile className="w-6 h-6" />
          </motion.div>
        </motion.button>

        {/* Tooltip when closed */}
        {!isExpanded && (
          <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Quick React
          </div>
        )}
      </div>
    </div>
  );
}
