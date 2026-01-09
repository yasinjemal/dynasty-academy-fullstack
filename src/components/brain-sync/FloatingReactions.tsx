"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingReaction {
  id: string;
  emoji: string;
  userName: string;
  x: number;
  timestamp: number;
}

interface FloatingReactionsProps {
  reactions: FloatingReaction[];
  onSendReaction: (emoji: string) => void;
}

// Popular reaction emojis
const REACTION_EMOJIS = [
  "🔥",
  "💯",
  "👏",
  "❤️",
  "🚀",
  "💡",
  "🤯",
  "✨",
  "👀",
  "🎉",
  "💪",
  "🙌",
  "😂",
  "🤔",
  "👍",
  "⚡",
];

// Single floating reaction
const FloatingEmoji = ({ reaction }: { reaction: FloatingReaction }) => {
  const randomX = useRef(Math.random() * 40 - 20); // -20 to 20
  const randomDuration = useRef(2 + Math.random() * 1); // 2-3 seconds
  const randomDelay = useRef(Math.random() * 0.2);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 0,
        x: reaction.x,
        scale: 0.5,
        rotate: -10,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: -400,
        x: reaction.x + randomX.current,
        scale: [0.5, 1.2, 1, 0.8],
        rotate: [0, 10, -5, 0],
      }}
      transition={{
        duration: randomDuration.current,
        delay: randomDelay.current,
        ease: "easeOut",
      }}
      className="absolute bottom-0 pointer-events-none flex flex-col items-center"
      style={{ left: `${reaction.x}%` }}
    >
      <span className="text-4xl drop-shadow-lg filter">{reaction.emoji}</span>
      <motion.span
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: [0, 1, 0], y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap mt-1"
      >
        {reaction.userName}
      </motion.span>
    </motion.div>
  );
};

// Reaction picker button
const ReactionPicker = ({
  onSelect,
  isOpen,
  onToggle,
}: {
  onSelect: (emoji: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
      >
        <span className="text-2xl">😊</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl"
          >
            <div className="grid grid-cols-4 gap-2 w-48">
              {REACTION_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.3, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onSelect(emoji);
                    onToggle();
                  }}
                  className="text-2xl p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>

            {/* Arrow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
              <div className="w-3 h-3 bg-slate-900/95 rotate-45 border-r border-b border-white/10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick reaction buttons (most used)
const QuickReactions = ({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) => {
  const quickEmojis = ["🔥", "💯", "👏", "❤️"];

  return (
    <div className="flex gap-1">
      {quickEmojis.map((emoji) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.2, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(emoji)}
          className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-center text-xl transition-colors border border-white/5"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
};

export default function FloatingReactions({
  reactions,
  onSendReaction,
}: FloatingReactionsProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [displayedReactions, setDisplayedReactions] = useState<
    FloatingReaction[]
  >([]);

  // Clean up old reactions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDisplayedReactions((prev) =>
        prev.filter((r) => now - r.timestamp < 3000)
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Add new reactions
  useEffect(() => {
    if (reactions.length > 0) {
      const lastReaction = reactions[reactions.length - 1];
      if (!displayedReactions.find((r) => r.id === lastReaction.id)) {
        setDisplayedReactions((prev) => [...prev, lastReaction]);
      }
    }
  }, [reactions]);

  return (
    <>
      {/* Floating reactions container */}
      <div className="fixed bottom-32 right-8 w-80 h-96 pointer-events-none overflow-hidden z-40">
        <AnimatePresence>
          {displayedReactions.map((reaction) => (
            <FloatingEmoji key={reaction.id} reaction={reaction} />
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction controls */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <QuickReactions onSelect={onSendReaction} />
        <ReactionPicker
          isOpen={isPickerOpen}
          onToggle={() => setIsPickerOpen(!isPickerOpen)}
          onSelect={onSendReaction}
        />
      </div>
    </>
  );
}

export { REACTION_EMOJIS };
