"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface ChatMuteToggleProps {
  onToggle?: (isMuted: boolean) => void;
}

export default function ChatMuteToggle({ onToggle }: ChatMuteToggleProps) {
  const [isMuted, setIsMuted] = useState(false);

  // Load mute state from localStorage on mount
  useEffect(() => {
    const savedMuteState = localStorage.getItem("chat-muted");
    if (savedMuteState) {
      const muted = savedMuteState === "true";
      setIsMuted(muted);
      onToggle?.(muted);
    }
  }, []);

  const handleToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem("chat-muted", String(newMutedState));
    onToggle?.(newMutedState);
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-2 rounded-lg transition-all ${
        isMuted
          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
      title={isMuted ? "Unmute chat notifications" : "Mute chat notifications"}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </motion.button>
  );
}
