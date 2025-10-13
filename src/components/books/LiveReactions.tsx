"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";

interface Reaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  page: number;
  textIndex: number;
  timestamp: number;
}

interface LiveReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string, textIndex: number) => void;
}

const EMOJI_OPTIONS = ["🔥", "💡", "😮", "❤️", "👏", "🎯", "💯", "🤔"];

export default function LiveReactions({
  reactions,
  onReact,
}: LiveReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(
    null
  );

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Calculate text index (simplified)
      const textIndex = Date.now(); // In production, use actual text position
      setSelectedTextIndex(textIndex);
      setShowEmojiPicker(true);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    if (selectedTextIndex !== null) {
      onReact(emoji, selectedTextIndex);
      setShowEmojiPicker(false);
      setSelectedTextIndex(null);

      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <>
      {/* Floating Reactions */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{
                opacity: 1,
                y: 0,
                scale: 0,
                x: Math.random() * window.innerWidth * 0.8,
              }}
              animate={{
                opacity: 0,
                y: -200,
                scale: [0, 1.5, 1],
                rotate: [0, 10, -10, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3,
                ease: "easeOut",
              }}
              className="absolute bottom-1/4 text-4xl"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-3 border-2 border-purple-500"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                React to this text:
              </span>
            </div>
            <div className="flex gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowEmojiPicker(false);
                setSelectedTextIndex(null);
              }}
              className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction Button (always visible) */}
      <button
        onClick={() => {
          setShowEmojiPicker(!showEmojiPicker);
          setSelectedTextIndex(Date.now());
        }}
        className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        title="Add reaction"
      >
        <Smile className="w-5 h-5" />
      </button>

      {/* Hidden div to capture text selection */}
      <div
        onMouseUp={handleTextSelection}
        className="fixed inset-0 pointer-events-none z-30"
      />
    </>
  );
}
