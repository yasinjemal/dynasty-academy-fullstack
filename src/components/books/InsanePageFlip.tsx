"use client";

import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Zap, Star } from "lucide-react";

interface InsanePageFlipProps {
  children: React.ReactNode;
  pageNumber: number;
  direction: "next" | "prev";
  isTransitioning: boolean;
  theme?: string;
  intensity?: "off" | "subtle" | "normal" | "insane"; // 🎚️ Intensity control
}

export default function InsanePageFlip({
  children,
  pageNumber,
  direction,
  isTransitioning,
  theme = "light",
  intensity = "normal", // 🎚️ Default to normal
}: InsanePageFlipProps) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🛑 If OFF, return plain content (no effects!)
  if (intensity === "off") {
    return <>{children}</>;
  }

  // 🎚️ Calculate effect intensity multipliers
  const intensitySettings = {
    subtle: { particles: 10, duration: 0.8, glow: 0.3, backgroundGlow: false },
    normal: { particles: 30, duration: 1, glow: 0.5, backgroundGlow: false },
    insane: { particles: 60, duration: 1.5, glow: 1, backgroundGlow: true },
  };

  const settings = intensitySettings[intensity] || intensitySettings.normal;

  // 🎨 PARTICLE EXPLOSION on page turn
  useEffect(() => {
    if (isTransitioning) {
      const newParticles = Array.from(
        { length: settings.particles },
        (_, i) => ({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      );
      setParticles(newParticles);

      setTimeout(() => setParticles([]), settings.duration * 1000);
    }
  }, [isTransitioning, pageNumber, settings.particles, settings.duration]);

  // 🎯 THEME COLORS
  const themeColors = {
    light: {
      primary: "#8b5cf6",
      secondary: "#ec4899",
      accent: "#f59e0b",
      glow: "rgba(139, 92, 246, 0.5)",
    },
    dark: {
      primary: "#a78bfa",
      secondary: "#f472b6",
      accent: "#fbbf24",
      glow: "rgba(167, 139, 250, 0.5)",
    },
    sepia: {
      primary: "#d97706",
      secondary: "#ea580c",
      accent: "#f59e0b",
      glow: "rgba(217, 119, 6, 0.5)",
    },
  };

  const colors =
    themeColors[theme as keyof typeof themeColors] || themeColors.light;

  // 🔥 INSANE ANIMATION VARIANTS
  const pageVariants = {
    enter: (direction: "next" | "prev") => ({
      x: direction === "next" ? "100%" : "-100%",
      rotateY: direction === "next" ? 90 : -90,
      scale: 0.8,
      opacity: 0,
      filter: "blur(10px)",
      transformOrigin: direction === "next" ? "left center" : "right center",
    }),
    center: {
      x: 0,
      rotateY: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transformOrigin: "center center",
    },
    exit: (direction: "next" | "prev") => ({
      x: direction === "next" ? "-100%" : "100%",
      rotateY: direction === "next" ? -90 : 90,
      scale: 0.8,
      opacity: 0,
      filter: "blur(10px)",
      transformOrigin: direction === "next" ? "right center" : "left center",
    }),
  };

  // 🌊 RIPPLE EFFECT
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const createRipple = () => {
    const newRipple = {
      id: Date.now(),
      x: 50,
      y: 50,
    };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  };

  useEffect(() => {
    if (isTransitioning) {
      createRipple();
    }
  }, [isTransitioning, pageNumber]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden perspective-[2000px]"
    >
      {/* 🌟 BACKGROUND GRADIENT SHIFT (only for insane mode) */}
      {settings.backgroundGlow && (
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: [
              `radial-gradient(circle at 0% 0%, ${colors.glow} 0%, transparent 50%)`,
              `radial-gradient(circle at 100% 100%, ${colors.glow} 0%, transparent 50%)`,
              `radial-gradient(circle at 0% 100%, ${colors.glow} 0%, transparent 50%)`,
              `radial-gradient(circle at 100% 0%, ${colors.glow} 0%, transparent 50%)`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* 🎆 PARTICLE EXPLOSION */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 ${10 * settings.glow}px ${colors.glow}`,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
              x: [(Math.random() - 0.5) * 200],
              y: [(Math.random() - 0.5) * 200],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: settings.duration, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* 🌊 RIPPLE WAVES */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-4 pointer-events-none"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              borderColor: colors.primary,
              boxShadow: `0 0 ${20 * settings.glow}px ${colors.glow}`,
            }}
            initial={{ width: 0, height: 0, opacity: 1, x: "-50%", y: "-50%" }}
            animate={{
              width: ["0px", "800px"],
              height: ["0px", "800px"],
              opacity: [1, 0],
            }}
            transition={{ duration: settings.duration, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* 🔥 MAIN PAGE FLIP ANIMATION */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={pageNumber}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6,
          }}
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* ✨ SHIMMER EFFECT OVERLAY */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 0%, ${colors.glow} 50%, transparent 100%)`,
            }}
            animate={{
              x: ["-200%", "200%"],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: isTransitioning ? 1 : 0,
            }}
          />

          {/* 🎭 CONTENT WITH 3D TRANSFORM */}
          <motion.div
            className="w-full h-full"
            animate={{
              scale: isTransitioning ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: settings.duration * 0.6, ease: "easeOut" }}
          >
            {children}
          </motion.div>

          {/* 💎 CORNER SPARKLES */}
          {isTransitioning && (
            <>
              {[
                { x: "5%", y: "5%" },
                { x: "95%", y: "5%" },
                { x: "5%", y: "95%" },
                { x: "95%", y: "95%" },
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{ left: pos.x, top: pos.y }}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <Sparkles
                    className="w-8 h-8"
                    style={{ color: colors.accent }}
                  />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ⚡ LIGHTNING FLASH on Turn */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3 * settings.glow, 0],
              background: [
                `radial-gradient(circle at center, ${colors.primary} 0%, transparent 50%)`,
                `radial-gradient(circle at center, ${colors.secondary} 0%, transparent 70%)`,
                "transparent",
              ],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: settings.duration * 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* 🌈 RAINBOW TRAIL (Easter Egg) */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 pointer-events-none"
        animate={{
          background: isTransitioning
            ? [
                `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
                `linear-gradient(90deg, ${colors.accent} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
                `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.accent} 50%, ${colors.primary} 100%)`,
              ]
            : "transparent",
          scaleX: isTransitioning ? [0, 1, 0] : 0,
        }}
        transition={{ duration: settings.duration * 0.6, ease: "easeInOut" }}
        style={{
          transformOrigin: direction === "next" ? "left" : "right",
          boxShadow: `0 0 ${20 * settings.glow}px ${colors.glow}`,
        }}
      />

      {/* 🎯 PAGE NUMBER BADGE with GLOW - Only shows during transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute top-4 right-4 px-4 py-2 rounded-full backdrop-blur-xl pointer-events-none z-50"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 ${30 * settings.glow}px ${
                colors.glow
              }, inset 0 0 ${20 * settings.glow}px rgba(255,255,255,${
                0.2 * settings.glow
              })`,
            }}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{
              opacity: 1,
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0],
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: settings.duration * 0.4, ease: "easeOut" }}
          >
            <div className="text-white font-bold text-lg flex items-center gap-2">
              <Star className="w-5 h-5" fill="currentColor" />
              Page {pageNumber}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 SIDE GLOW TRAILS */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 pointer-events-none"
        style={{
          left: direction === "next" ? 0 : "auto",
          right: direction === "prev" ? 0 : "auto",
          background: `linear-gradient(to ${
            direction === "next" ? "bottom" : "top"
          }, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
          boxShadow: `0 0 ${30 * settings.glow}px ${colors.glow}`,
        }}
        animate={{
          scaleY: isTransitioning ? [0, 1, 0] : 0,
          opacity: isTransitioning ? [0, 1, 0] : 0,
        }}
        transition={{ duration: settings.duration * 0.6, ease: "easeInOut" }}
      />
    </div>
  );
}
