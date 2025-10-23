"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FuturePortalProps {
  onComplete?: () => void;
  skipIntro?: boolean;
}

export default function FuturePortalUltimate({
  onComplete,
  skipIntro = false,
}: FuturePortalProps) {
  const [stage, setStage] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check if user has seen intro before (client-side only)
    const hasSeenIntro =
      typeof window !== "undefined"
        ? localStorage.getItem("hasSeenIntro")
        : null;

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
      if (typeof window !== "undefined") {
        localStorage.setItem("hasSeenIntro", "true");
      }
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
  }, [skipIntro, onComplete, isMounted]);

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasSeenIntro", "true");
    }
    if (onComplete) onComplete();
  };

  if (!isMounted) {
    return null;
  }

  const words = ["Welcome", "to", "the", "Future"];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      {/* 🌌 STARFIELD BACKGROUND - 200 twinkling stars */}
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => {
          const size = Math.random() * 3;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const delay = Math.random() * 3;
          const duration = 2 + Math.random() * 3;

          return (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                opacity: 0.3,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* 🌀 THE BLACKHOLE - ULTIMATE VERSION */}
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
              <div className="relative w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full">
                {/* 🔵 OUTER GLOW RING - Layer 1 (Slowest) */}
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
                      rgba(139, 92, 246, 0.9) 0%,
                      rgba(59, 130, 246, 0.7) 20%,
                      rgba(6, 182, 212, 0.5) 40%,
                      rgba(139, 92, 246, 0.3) 60%,
                      rgba(0, 0, 0, 0) 100%
                    )`,
                    filter: "blur(30px)",
                    boxShadow: `
                      0 0 100px rgba(139, 92, 246, 0.8),
                      0 0 200px rgba(59, 130, 246, 0.6)
                    `,
                  }}
                />

                {/* 🟣 CONIC GRADIENT RING - Layer 2 (Fast rotation) */}
                <motion.div
                  animate={{
                    rotate: -360,
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                    scale: {
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="absolute inset-[30px] rounded-full"
                  style={{
                    background: `conic-gradient(
                      from 0deg,
                      rgba(139, 92, 246, 0.8) 0deg,
                      rgba(59, 130, 246, 0.6) 90deg,
                      rgba(6, 182, 212, 0.8) 180deg,
                      rgba(139, 92, 246, 0.6) 270deg,
                      rgba(139, 92, 246, 0.8) 360deg
                    )`,
                    filter: "blur(25px)",
                  }}
                />

                {/* 🌀 VORTEX RING - Layer 3 (Medium rotation) */}
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                    scale: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="absolute inset-[60px] rounded-full"
                  style={{
                    background: `conic-gradient(
                      from 45deg,
                      rgba(139, 92, 246, 1) 0deg,
                      rgba(59, 130, 246, 0.8) 60deg,
                      transparent 120deg,
                      rgba(6, 182, 212, 0.9) 180deg,
                      transparent 240deg,
                      rgba(139, 92, 246, 1) 360deg
                    )`,
                    filter: "blur(20px)",
                  }}
                />

                {/* 💜 ENERGY BAND RING - Layer 4 (Counter-rotation) */}
                <motion.div
                  animate={{
                    rotate: -360,
                    scale: [1, 1.12, 1],
                  }}
                  transition={{
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="absolute inset-[90px] rounded-full"
                  style={{
                    background: `radial-gradient(
                      circle,
                      rgba(139, 92, 246, 1) 0%,
                      rgba(59, 130, 246, 0.9) 30%,
                      rgba(6, 182, 212, 0.7) 60%,
                      rgba(0, 0, 0, 0) 100%
                    )`,
                    filter: "blur(15px)",
                  }}
                />

                {/* ✨ SUPERMASSIVE CORE - Layer 5 (Intense glow) */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-[120px] rounded-full bg-gradient-to-br from-purple-300 via-blue-400 to-cyan-300"
                  style={{
                    filter: "blur(12px)",
                    boxShadow: `
                      0 0 80px rgba(139, 92, 246, 1),
                      0 0 160px rgba(59, 130, 246, 0.8),
                      0 0 240px rgba(6, 182, 212, 0.6),
                      inset 0 0 60px rgba(255, 255, 255, 0.5)
                    `,
                  }}
                />

                {/* ⚪ WHITE HOT CENTER - Layer 6 (Absolute core) */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-[160px] md:inset-[200px] rounded-full bg-white"
                  style={{
                    filter: "blur(8px)",
                    boxShadow: `
                      0 0 40px rgba(255, 255, 255, 1),
                      0 0 80px rgba(139, 92, 246, 0.8)
                    `,
                  }}
                />

                {/* 💫 INNER RING PARTICLES (24 particles) */}
                {stage >= 2 && (
                  <>
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={`inner-${i}`}
                        className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
                        style={{
                          left: "50%",
                          top: "50%",
                          marginLeft: "-6px",
                          marginTop: "-6px",
                        }}
                        animate={{
                          x: [
                            0,
                            Math.cos((i / 24) * Math.PI * 2) * 180,
                            Math.cos((i / 24) * Math.PI * 2) * 280,
                          ],
                          y: [
                            0,
                            Math.sin((i / 24) * Math.PI * 2) * 180,
                            Math.sin((i / 24) * Math.PI * 2) * 280,
                          ],
                          scale: [1, 1.5, 0],
                          opacity: [1, 0.8, 0],
                        }}
                        transition={{
                          duration: 3.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeOut",
                        }}
                      />
                    ))}

                    {/* 🌟 OUTER RING PARTICLES (36 particles) */}
                    {[...Array(36)].map((_, i) => (
                      <motion.div
                        key={`outer-${i}`}
                        className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                        style={{
                          left: "50%",
                          top: "50%",
                          marginLeft: "-4px",
                          marginTop: "-4px",
                        }}
                        animate={{
                          x: [0, Math.cos((i / 36) * Math.PI * 2) * 320],
                          y: [0, Math.sin((i / 36) * Math.PI * 2) * 320],
                          scale: [1, 0.5, 0],
                          opacity: [1, 0.6, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: i * 0.08,
                          ease: "linear",
                        }}
                      />
                    ))}

                    {/* 🌀 SPIRAL PARTICLES (60 particles) */}
                    {[...Array(60)].map((_, i) => {
                      const angle = (i / 60) * Math.PI * 2;
                      const spiralFactor = i / 60;

                      return (
                        <motion.div
                          key={`spiral-${i}`}
                          className="absolute w-1 h-1 bg-cyan-300 rounded-full"
                          style={{
                            left: "50%",
                            top: "50%",
                            marginLeft: "-2px",
                            marginTop: "-2px",
                          }}
                          animate={{
                            x: [
                              0,
                              Math.cos(angle + spiralFactor * Math.PI * 4) *
                                (150 + spiralFactor * 200),
                            ],
                            y: [
                              0,
                              Math.sin(angle + spiralFactor * Math.PI * 4) *
                                (150 + spiralFactor * 200),
                            ],
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: i * 0.05,
                            ease: "easeInOut",
                          }}
                        />
                      );
                    })}

                    {/* 💍 EXPANDING ENERGY RINGS (5 rings) */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={`ring-${i}`}
                        className="absolute inset-0 rounded-full border-2 border-purple-500/30"
                        animate={{
                          scale: [0, 3],
                          opacity: [0.8, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: i * 0.8,
                          ease: "easeOut",
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

      {/* ✨ WELCOME TEXT - ULTIMATE EDITION */}
      <AnimatePresence>
        {stage >= 3 && stage < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
          >
            <div className="text-center relative">
              {/* Background glow */}
              <motion.div
                className="absolute inset-0 blur-3xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  background: `radial-gradient(
                    circle,
                    rgba(139, 92, 246, 0.6) 0%,
                    rgba(59, 130, 246, 0.4) 50%,
                    transparent 100%
                  )`,
                }}
              />

              {/* Main text */}
              <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-[0.15em] md:tracking-[0.25em] relative z-10">
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      delay: i * 0.4,
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="text-white relative"
                    style={{
                      textShadow: `
                        0 0 20px rgba(139, 92, 246, 1),
                        0 0 40px rgba(59, 130, 246, 0.8),
                        0 0 60px rgba(6, 182, 212, 0.6),
                        0 0 80px rgba(139, 92, 246, 0.4),
                        0 0 100px rgba(59, 130, 246, 0.3)
                      `,
                      WebkitTextStroke: "1px rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {word}
                    {/* Sparkle effects */}
                    <motion.span
                      className="absolute -top-2 -right-2 text-2xl"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        delay: i * 0.4 + 0.5,
                        duration: 1,
                      }}
                    >
                      ✨
                    </motion.span>
                  </motion.span>
                ))}
              </div>

              {/* Dynasty OS Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 1 }}
                className="mt-8 text-lg md:text-2xl text-cyan-300 tracking-[0.3em] font-light"
                style={{
                  textShadow: `
                    0 0 10px rgba(6, 182, 212, 0.8),
                    0 0 20px rgba(6, 182, 212, 0.5)
                  `,
                }}
              >
                DYNASTY OS
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚡ WHITE FLASH - ENHANCED WITH COLOR BURST */}
      <AnimatePresence>
        {stage === 4 && (
          <>
            {/* Color burst first */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-40"
              style={{
                background: `radial-gradient(
                  circle,
                  rgba(139, 92, 246, 1) 0%,
                  rgba(59, 130, 246, 0.8) 30%,
                  rgba(6, 182, 212, 0.6) 60%,
                  transparent 100%
                )`,
              }}
            />
            {/* Then white flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute inset-0 bg-white z-50"
            />
          </>
        )}
      </AnimatePresence>

      {/* 🎯 SKIP BUTTON - PREMIUM STYLE */}
      <AnimatePresence>
        {showSkip && stage < 4 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 px-8 py-4 rounded-xl text-white font-semibold tracking-wider transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              boxShadow: `
                0 0 20px rgba(139, 92, 246, 0.4),
                0 0 40px rgba(59, 130, 246, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.1)
              `,
            }}
          >
            <span className="flex items-center gap-2">
              Skip Intro
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ›
              </motion.span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 📊 LOADING INDICATOR */}
      {stage >= 3 && stage < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="fixed bottom-8 left-8 z-50 text-white/50 text-sm tracking-wide"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Dynasty OS...
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
