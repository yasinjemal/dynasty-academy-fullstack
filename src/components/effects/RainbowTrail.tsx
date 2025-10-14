"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  color: string;
}

export default function RainbowTrail() {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const nextIdRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#a855f7", // purple
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle to max 30 updates per second
      if (now - lastUpdateRef.current < 33) return;
      lastUpdateRef.current = now;

      const newPoint: TrailPoint = {
        id: nextIdRef.current,
        x: e.clientX,
        y: e.clientY,
        color: colors[nextIdRef.current % colors.length],
      };

      nextIdRef.current++;

      setTrail((prev) => {
        // Keep only last 10 points
        const newTrail = [...prev, newPoint].slice(-10);
        return newTrail;
      });

      // Remove the point after animation
      setTimeout(() => {
        setTrail((prev) => prev.filter((p) => p.id !== newPoint.id));
      }, 600);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x,
              top: point.y,
              background: `radial-gradient(circle, ${point.color} 0%, transparent 70%)`,
            }}
            initial={{
              width: 40,
              height: 40,
              x: -20,
              y: -20,
              opacity: 0.8,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              scale: 0.5,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
