"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LightningBoltProps {
  trigger?: boolean;
  points?: number;
  onComplete?: () => void;
}

export default function LightningBolt({
  trigger = false,
  points = 10,
  onComplete,
}: LightningBoltProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 1500);
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
          {/* Lightning Bolt SVG */}
          <motion.svg
            width="200"
            height="300"
            viewBox="0 0 200 300"
            className="absolute"
            initial={{ scale: 0, rotate: -15 }}
            animate={{
              scale: [0, 1.5, 1],
              rotate: [-15, 5, 0],
              filter: [
                "drop-shadow(0 0 20px #fbbf24) brightness(2)",
                "drop-shadow(0 0 40px #f59e0b) brightness(3)",
                "drop-shadow(0 0 20px #fbbf24) brightness(2)",
              ],
            }}
            transition={{ duration: 0.6, times: [0, 0.3, 1] }}
          >
            <path
              d="M100 10 L110 100 L130 100 L80 180 L90 110 L70 110 Z"
              fill="url(#lightning-gradient)"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            <defs>
              <linearGradient
                id="lightning-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </motion.svg>

          {/* Electric Arcs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 bg-gradient-to-b from-yellow-200 via-yellow-400 to-transparent rounded-full"
              style={{
                height: "100px",
                left: `${45 + i * 2}%`,
                top: "20%",
              }}
              initial={{ opacity: 0, scaleY: 0, originY: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scaleY: [0, 1, 0],
              }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                repeat: 2,
              }}
            />
          ))}

          {/* Points Text */}
          <motion.div
            className="absolute text-6xl font-black text-yellow-400"
            style={{
              textShadow:
                "0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)",
              marginTop: "-100px",
            }}
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
              y: -50,
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
            }}
            transition={{ duration: 1.5 }}
          >
            +{points} DS
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
