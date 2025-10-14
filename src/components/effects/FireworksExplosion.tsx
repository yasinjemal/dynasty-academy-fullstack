"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

interface FireworksExplosionProps {
  trigger?: boolean;
  message?: string;
  onComplete?: () => void;
}

export default function FireworksExplosion({
  trigger = false,
  message = "LEVEL UP!",
  onComplete,
}: FireworksExplosionProps) {
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      setShow(true);

      // Generate particles
      const newParticles: Particle[] = [];
      const colors = [
        "#ef4444",
        "#f59e0b",
        "#eab308",
        "#22c55e",
        "#3b82f6",
        "#a855f7",
        "#ec4899",
      ];

      for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50;
        const velocity = 100 + Math.random() * 100;
        newParticles.push({
          id: i,
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.2,
        });
      }
      setParticles(newParticles);

      setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000);
    }
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: particle.color }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0, 1, 0.5],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Center Flash */}
          <motion.div
            className="absolute w-40 h-40 rounded-full bg-white"
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 3, 0],
              opacity: [1, 0.5, 0],
            }}
            transition={{ duration: 1 }}
          />

          {/* Message */}
          <motion.div
            className="absolute text-7xl font-black bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent"
            style={{
              textShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
            }}
            initial={{ scale: 0, rotate: -10, opacity: 0 }}
            animate={{
              scale: [0, 1.3, 1],
              rotate: [10, -5, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1] }}
          >
            {message}
          </motion.div>

          {/* Ring Waves */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute border-4 border-yellow-400 rounded-full"
              initial={{ width: 0, height: 0, opacity: 0.8 }}
              animate={{
                width: 800,
                height: 800,
                opacity: 0,
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
