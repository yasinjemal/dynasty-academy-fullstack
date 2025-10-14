"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  layer: number;
  twinkleDelay: number;
}

export default function ParallaxStars() {
  const [stars, setStars] = useState<Star[]>([]);
  const { scrollY } = useScroll();

  // Different parallax speeds for different layers
  const layer1Y = useTransform(scrollY, [0, 1000], [0, -100]);
  const layer2Y = useTransform(scrollY, [0, 1000], [0, -200]);
  const layer3Y = useTransform(scrollY, [0, 1000], [0, -300]);

  useEffect(() => {
    // Generate stars across 3 layers
    const newStars: Star[] = [];

    for (let layer = 1; layer <= 3; layer++) {
      const starCount = layer === 1 ? 30 : layer === 2 ? 40 : 50;

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: newStars.length,
          x: Math.random() * 100,
          y: Math.random() * 200, // Taller to account for scrolling
          size: layer === 1 ? 3 : layer === 2 ? 2 : 1,
          layer,
          twinkleDelay: Math.random() * 3,
        });
      }
    }

    setStars(newStars);
  }, []);

  const getLayerTransform = (layer: number) => {
    switch (layer) {
      case 1:
        return layer1Y;
      case 2:
        return layer2Y;
      case 3:
        return layer3Y;
      default:
        return layer1Y;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[1, 2, 3].map((layer) => (
        <motion.div
          key={layer}
          className="absolute inset-0"
          style={{ y: getLayerTransform(layer) }}
        >
          {stars
            .filter((star) => star.layer === layer)
            .map((star) => (
              <motion.div
                key={star.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: star.twinkleDelay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
        </motion.div>
      ))}
    </div>
  );
}
