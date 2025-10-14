"use client";

import { motion } from "framer-motion";
import { ReactNode, useState, MouseEvent } from "react";

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export default function HolographicCard({
  children,
  className = "",
  intensity = 1,
}: HolographicCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10 * intensity;
    const rotateYValue = ((x - centerX) / centerX) * 10 * intensity;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setGlowX((x / rect.width) * 100);
    setGlowY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowX(50);
    setGlowY(50);
  };

  return (
    <motion.div
      className={`magnetic-card relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Holographic shine effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)`,
          mixBlendMode: "color-dodge",
        }}
      />

      {/* Rainbow edge glow */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none"
        style={{
          background: `conic-gradient(from ${glowX}deg at ${glowX}% ${glowY}%, 
            #ff00ff 0deg, 
            #00ffff 90deg, 
            #00ff00 180deg, 
            #ffff00 270deg, 
            #ff00ff 360deg)`,
          WebkitMaskImage:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
