"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface FuturePortalProps {
  onComplete?: () => void;
  skipIntro?: boolean;
}

export default function FuturePortal({
  onComplete,
  skipIntro = false,
}: FuturePortalProps) {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    // Check if user has seen intro before
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");

    if (skipIntro || hasSeenIntro === "true") {
      // Skip directly to homepage
      if (onComplete) onComplete();
      return;
    }

    // Show skip button after 3 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 3000);

    // Stage progression
    const stage1 = setTimeout(() => setStage(1), 1000); // Glow appears
    const stage2 = setTimeout(() => setStage(2), 3000); // Energy builds
    const stage3 = setTimeout(() => setStage(3), 6000); // Text appears
    const stage4 = setTimeout(() => setStage(4), 8500); // Expansion
    const complete = setTimeout(() => {
      localStorage.setItem("hasSeenIntro", "true");
      if (onComplete) onComplete();
    }, 10000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(stage3);
      clearTimeout(stage4);
      clearTimeout(complete);
    };
  }, [skipIntro, onComplete]);

  const handleSkip = () => {
    localStorage.setItem("hasSeenIntro", "true");
    if (onComplete) onComplete();
  };

  // Text animation variants
  const words = ["Welcome", "to", "the", "Future"];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      {/* The Blackhole */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={
                stage === 4
                  ? { scale: 20, opacity: 0 }
                  : { scale: 1, opacity: 1 }
              }
              exit={{ scale: 20, opacity: 0 }}
              transition={
                stage === 4
                  ? { duration: 1.5, ease: "easeIn" }
                  : { duration: 2, ease: "easeOut" }
              }
              className="relative"
            >
              {/* Core glow */}
              <div className="relative w-[400px] h-[400px] rounded-full">
                {/* Outer glow rings */}
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(
                      circle,
                      rgba(139, 92, 246, 0.8) 0%,
                      rgba(59, 130, 246, 0.6) 30%,
                      rgba(6, 182, 212, 0.4) 60%,
                      rgba(0, 0, 0, 0) 100%
                    )`,
                    filter: "blur(20px)",
                  }}
                />

                {/* Middle ring */}
                <motion.div
                  animate={{
                    rotate: -360,
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                    scale: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="absolute inset-[50px] rounded-full"
                  style={{
                    background: `radial-gradient(
                      circle,
                      rgba(139, 92, 246, 0.9) 0%,
                      rgba(59, 130, 246, 0.7) 40%,
                      rgba(0, 0, 0, 0) 100%
                    )`,
                    filter: "blur(15px)",
                  }}
                />

                {/* Core */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-[100px] rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-400"
                  style={{
                    filter: "blur(10px)",
                    boxShadow: `
                      0 0 60px rgba(139, 92, 246, 0.8),
                      0 0 120px rgba(59, 130, 246, 0.6),
                      0 0 180px rgba(6, 182, 212, 0.4)
                    `,
                  }}
                />

                {/* Energy particles */}
                {stage >= 2 && (
                  <>
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        style={{
                          left: "50%",
                          top: "50%",
                          marginLeft: "-4px",
                          marginTop: "-4px",
                        }}
                        animate={{
                          x: [0, Math.cos((i / 12) * Math.PI * 2) * 250],
                          y: [0, Math.sin((i / 12) * Math.PI * 2) * 250],
                          scale: [1, 0.5, 0],
                          opacity: [1, 0.5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "linear",
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Welcome Text */}
      <AnimatePresence>
        {stage >= 3 && stage < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <div className="flex gap-4 text-4xl md:text-6xl font-bold tracking-[0.2em]">
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.5,
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                    className="text-white"
                    style={{
                      textShadow: `
                        0 0 10px rgba(139, 92, 246, 0.8),
                        0 0 20px rgba(59, 130, 246, 0.6),
                        0 0 30px rgba(6, 182, 212, 0.4),
                        0 0 40px rgba(139, 92, 246, 0.3)
                      `,
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* White Flash */}
      <AnimatePresence>
        {stage === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* Skip Button */}
      <AnimatePresence>
        {showSkip && stage < 4 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed bottom-8 right-8 z-50 px-6 py-3 rounded-lg text-white font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            Skip Intro ›
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
