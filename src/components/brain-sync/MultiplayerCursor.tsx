"use client";

import { motion } from "framer-motion";

interface MultiplayerCursorProps {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
  isTyping?: boolean;
}

export default function MultiplayerCursor({
  userId,
  userName,
  color,
  x,
  y,
  isTyping = false,
}: MultiplayerCursorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x,
        y,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 500,
        mass: 0.5,
      }}
      className="fixed pointer-events-none z-50"
      style={{ left: 0, top: 0 }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M5.5 3.21V20.8C5.5 21.3 5.85 21.55 6.2 21.55C6.35 21.55 6.5 21.5 6.65 21.4L10.95 17.55H18.5C19.05 17.55 19.5 17.1 19.5 16.55V4.21C19.5 3.66 19.05 3.21 18.5 3.21H5.5Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
        {/* Cursor pointer shape */}
        <path
          d="M6 3L6 18L9 15L12 21L14 20L11 14L15 14L6 3Z"
          fill={color}
          stroke="white"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Name tag */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute left-5 top-5"
      >
        <div
          className="px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap shadow-lg flex items-center gap-1"
          style={{ backgroundColor: color }}
        >
          {userName.split(" ")[0]}

          {/* Typing indicator */}
          {isTyping && (
            <span className="flex gap-0.5 ml-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{
                    y: [-1, -3, -1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-1 h-1 rounded-full bg-white/80"
                />
              ))}
            </span>
          )}
        </div>
      </motion.div>

      {/* Click ripple effect */}
      <motion.div
        initial={{ opacity: 0.5, scale: 0 }}
        animate={{
          opacity: [0.5, 0],
          scale: [0, 2],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2,
        }}
        className="absolute -left-3 -top-3 w-6 h-6 rounded-full"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}

// Utility to render multiple cursors
export function MultiplayerCursors({
  cursors,
  currentUserId,
}: {
  cursors: Array<{
    userId: string;
    userName: string;
    color: string;
    x: number;
    y: number;
    isTyping?: boolean;
  }>;
  currentUserId: string;
}) {
  return (
    <>
      {cursors
        .filter((cursor) => cursor.userId !== currentUserId)
        .map((cursor) => (
          <MultiplayerCursor
            key={cursor.userId}
            userId={cursor.userId}
            userName={cursor.userName}
            color={cursor.color}
            x={cursor.x}
            y={cursor.y}
            isTyping={cursor.isTyping}
          />
        ))}
    </>
  );
}
