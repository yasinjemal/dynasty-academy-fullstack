"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface BookPortalProps {
  bookTitle: string;
  bookCover?: string;
  onComplete: () => void;
}

// 📚 Animated Book Icon in 3D
function FloatingBook() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime()) * 0.2;
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Book Pages */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 2, 0.3]} />
        <meshPhysicalMaterial
          color="#fef9e7"
          roughness={0.8}
          metalness={0.1}
          clearcoat={0.5}
        />
      </mesh>

      {/* Book Cover */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[1.5, 2, 0.05]} />
        <meshPhysicalMaterial
          color="#8b5cf6"
          metalness={0.7}
          roughness={0.2}
          clearcoat={1}
        />
      </mesh>

      {/* Glow */}
      <Sphere args={[1.8, 32, 32]}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} />
      </Sphere>
    </group>
  );
}

// 🌀 Portal Vortex Effect
function PortalVortex() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <torusGeometry args={[3, 0.1, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[3.5, 0.08, 16, 100]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <torusGeometry args={[4, 0.06, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function BookPortal({
  bookTitle,
  bookCover,
  onComplete,
}: BookPortalProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000), // Portal appears
      setTimeout(() => setStage(2), 2500), // Book appears
      setTimeout(() => setStage(3), 4000), // Text appears
      setTimeout(() => setStage(4), 5500), // Zoom into book
      setTimeout(() => onComplete(), 7000), // Complete
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Starfield */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => {
            const size = Math.random() * 2;
            const x = Math.random() * 100;
            const y = Math.random() * 100;

            return (
              <motion.div
                key={`star-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            );
          })}
        </div>

        {/* 3D Scene */}
        <AnimatePresence>
          {stage >= 1 && stage < 4 && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 3 }}
              transition={{ duration: stage === 4 ? 1.5 : 2 }}
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight
                  position={[10, 10, 10]}
                  intensity={1}
                  color="#8b5cf6"
                />
                <pointLight
                  position={[-10, -10, -10]}
                  intensity={0.5}
                  color="#ec4899"
                />

                {/* Portal Vortex */}
                {stage >= 1 && <PortalVortex />}

                {/* Floating Book */}
                {stage >= 2 && <FloatingBook />}
              </Canvas>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Overlay */}
        <AnimatePresence>
          {stage === 3 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <motion.p
                  className="text-xl text-purple-300 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Entering the world of
                </motion.p>
                <motion.h1
                  className="text-6xl md:text-8xl font-bold text-white mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    textShadow: `
                      0 0 20px rgba(139, 92, 246, 0.8),
                      0 0 40px rgba(236, 72, 153, 0.6)
                    `,
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {bookTitle}
                </motion.h1>
                <motion.div
                  className="flex items-center justify-center gap-2 text-purple-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <p className="text-sm">Preparing your reading experience</p>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* White Flash */}
        <AnimatePresence>
          {stage === 4 && (
            <motion.div
              className="absolute inset-0 bg-white z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
