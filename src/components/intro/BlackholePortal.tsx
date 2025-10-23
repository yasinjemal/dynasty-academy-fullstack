"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface BlackholePortalProps {
  onComplete?: () => void;
  skipIntro?: boolean;
}

// 🌌 Animated Blackhole Component
function Blackhole() {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create particle system for energy trails
  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = Math.random() * 3 + 1;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2;

      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = height;
      positions[i + 2] = Math.sin(angle) * radius;
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesRef.current.geometry = particles;
  }, []);

  // Animate rotation and pulsing
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = -clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group>
      {/* Central Blackhole */}
      <Sphere ref={meshRef} args={[1.5, 128, 128]} scale={1}>
        <MeshDistortMaterial
          color="#8B5CF6"
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Energy Ring 1 */}
      <Sphere args={[2, 64, 64]} scale={1}>
        <meshBasicMaterial
          color="#3B82F6"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          wireframe
        />
      </Sphere>

      {/* Energy Ring 2 */}
      <Sphere args={[2.5, 64, 64]} scale={1}>
        <meshBasicMaterial
          color="#06B6D4"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          wireframe
        />
      </Sphere>

      {/* Particle Swarm */}
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial
          size={0.05}
          color="#FFFFFF"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// 🎭 Main Portal Component
export default function BlackholePortal({
  onComplete,
  skipIntro = false,
}: BlackholePortalProps) {
  const [stage, setStage] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if user has seen intro
    const hasSeenIntro = localStorage.getItem("hasSeenBlackholeIntro");

    if (skipIntro || hasSeenIntro === "true") {
      onComplete?.();
      return;
    }

    // Show skip button after 3 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 3000);

    // Stage progression
    const timers = [
      setTimeout(() => setStage(1), 2000), // Blackhole awakens
      setTimeout(() => setStage(2), 4000), // Energy vortex
      setTimeout(() => setStage(3), 6000), // Welcome text
      setTimeout(() => setStage(4), 8000), // Portal expansion
      setTimeout(() => {
        localStorage.setItem("hasSeenBlackholeIntro", "true");
        onComplete?.();
      }, 10000),
    ];

    return () => {
      clearTimeout(skipTimer);
      timers.forEach(clearTimeout);
    };
  }, [skipIntro, onComplete]);

  const handleSkip = () => {
    localStorage.setItem("hasSeenBlackholeIntro", "true");
    onComplete?.();
  };

  const words = ["Welcome", "to", "the", "Future"];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Skip Button */}
        <AnimatePresence>
          {showSkip && (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={handleSkip}
              className="fixed top-8 right-8 z-[10000] px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              Skip Intro
            </motion.button>
          )}
        </AnimatePresence>

        {/* Stage 1-2: Blackhole 3D Scene */}
        <AnimatePresence>
          {stage >= 1 && stage < 4 && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 20 }}
              transition={{ duration: stage === 4 ? 1.5 : 2 }}
            >
              <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.3} />
                <pointLight
                  position={[10, 10, 10]}
                  intensity={1}
                  color="#8B5CF6"
                />
                <pointLight
                  position={[-10, -10, -10]}
                  intensity={0.5}
                  color="#06B6D4"
                />
                <Blackhole />
              </Canvas>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 3: "Welcome to the Future" Text */}
        <AnimatePresence>
          {stage === 3 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                {words.map((word, i) => (
                  <motion.span
                    key={word}
                    className="inline-block text-6xl md:text-8xl font-bold text-white tracking-[0.2em] mr-4"
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    transition={{
                      delay: i * 0.3,
                      duration: 0.8,
                    }}
                    style={{
                      textShadow: `
                        0 0 10px rgba(139, 92, 246, 0.8),
                        0 0 20px rgba(59, 130, 246, 0.6),
                        0 0 30px rgba(6, 182, 212, 0.4)
                      `,
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 4: White Flash */}
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

        {/* Starfield Background (always visible) */}
        <div className="absolute inset-0">
          {[...Array(200)].map((_, i) => {
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

        {/* Cosmic Hum (optional audio) */}
        <audio ref={audioRef} loop>
          <source src="/sounds/cosmic-hum.mp3" type="audio/mpeg" />
        </audio>
      </motion.div>
    </AnimatePresence>
  );
}
