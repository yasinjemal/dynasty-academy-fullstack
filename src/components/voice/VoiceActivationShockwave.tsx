"use client";

import { motion, AnimatePresence } from "framer-motion";

interface VoiceShockwaveProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function VoiceActivationShockwave({
  trigger,
  onComplete,
}: VoiceShockwaveProps) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          onAnimationComplete={onComplete}
        >
          {/* Multiple shockwave rings */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-purple-400"
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{
                width: ["0px", "3000px"],
                height: ["0px", "3000px"],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              style={{
                boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)",
              }}
            />
          ))}

          {/* Center flash */}
          <motion.div
            className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 2, 0], opacity: [1, 0.5, 0] }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: "blur(30px)",
            }}
          />

          {/* Energy particles */}
          {[...Array(30)].map((_, i) => {
            const angle = (i / 30) * Math.PI * 2;
            const distance = 200 + Math.random() * 300;
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full bg-purple-400"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  scale: [1, 0],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.02,
                  ease: "easeOut",
                }}
              />
            );
          })}

          {/* Scan lines */}
          <motion.div
            className="absolute w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`line-${i}`}
                className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                style={{
                  top: `${(i * 100) / 20}%`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0, 1, 0] }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.03,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* Hexagon pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="hexagons"
                  width="50"
                  height="43.4"
                  patternUnits="userSpaceOnUse"
                  patternTransform="scale(2)"
                >
                  <polygon
                    points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
                    fill="none"
                    stroke="rgba(168, 85, 247, 0.3)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
