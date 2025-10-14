"use client";

import { motion } from "framer-motion";

interface PulsingGlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export default function PulsingGlow({
  children,
  color = "orange",
  intensity = "medium",
  className = "",
}: PulsingGlowProps) {
  const intensityMap = {
    low: 10,
    medium: 20,
    high: 30,
  };

  const blur = intensityMap[intensity];

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        boxShadow: [
          `0 0 ${blur}px ${
            color === "orange"
              ? "rgba(249, 115, 22, 0.3)"
              : color === "purple"
              ? "rgba(168, 85, 247, 0.3)"
              : color === "blue"
              ? "rgba(59, 130, 246, 0.3)"
              : color === "green"
              ? "rgba(34, 197, 94, 0.3)"
              : "rgba(249, 115, 22, 0.3)"
          }`,
          `0 0 ${blur * 2}px ${
            color === "orange"
              ? "rgba(249, 115, 22, 0.6)"
              : color === "purple"
              ? "rgba(168, 85, 247, 0.6)"
              : color === "blue"
              ? "rgba(59, 130, 246, 0.6)"
              : color === "green"
              ? "rgba(34, 197, 94, 0.6)"
              : "rgba(249, 115, 22, 0.6)"
          }`,
          `0 0 ${blur}px ${
            color === "orange"
              ? "rgba(249, 115, 22, 0.3)"
              : color === "purple"
              ? "rgba(168, 85, 247, 0.3)"
              : color === "blue"
              ? "rgba(59, 130, 246, 0.3)"
              : color === "green"
              ? "rgba(34, 197, 94, 0.3)"
              : "rgba(249, 115, 22, 0.3)"
          }`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
