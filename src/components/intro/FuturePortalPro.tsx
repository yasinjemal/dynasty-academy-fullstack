"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface FuturePortalProps {
  onComplete?: () => void;
  skipIntro?: boolean;
}

// 🌀 3D BLACKHOLE COMPONENT - REAL ACCRETION DISK!
function Blackhole({ stage }: { stage: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const diskRefs = useRef<THREE.Mesh[]>([]);
  const accretionRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate blackhole core
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.3;
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;

      // Pulse effect
      const pulse = 1 + Math.sin(time * 2) * 0.08;
      meshRef.current.scale.setScalar(pulse);
    }

    // Animate accretion disk (flat spiral)
    if (accretionRef.current) {
      accretionRef.current.rotation.z = time * 1.5; // Fast rotation
    }

    // Animate orbital disks (tilted at angles like real blackhole)
    diskRefs.current.forEach((disk, i) => {
      if (disk) {
        // Each disk rotates at different speed (inner faster, outer slower)
        disk.rotation.z = time * (2 - i * 0.3);

        // Subtle wobble
        disk.rotation.x = Math.sin(time + i) * 0.1;

        const pulse = 1 + Math.sin(time * 3 + i) * 0.05;
        disk.scale.setScalar(1 + i * 0.3 + pulse * 0.08);
      }
    });
  });

  return (
    <group>
      {/* Core Blackhole - Dark center */}
      <Sphere ref={meshRef} args={[1.5, 128, 128]} scale={stage >= 1 ? 1 : 0}>
        <MeshDistortMaterial
          color="#000000"
          emissive="#1a0033"
          emissiveIntensity={1}
          distort={0.6}
          speed={1.5}
          roughness={0}
          metalness={1}
        />
      </Sphere>

      {/* Event Horizon Glow */}
      {stage >= 1 && (
        <Sphere args={[1.8, 64, 64]} scale={stage >= 1 ? 1 : 0}>
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.3} />
        </Sphere>
      )}

      {/* Accretion Disk - Flat spinning disk */}
      {stage >= 2 && (
        <mesh ref={accretionRef} rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[3, 0.8, 2, 100]} />
          <meshStandardMaterial
            color="#FF6B00"
            emissive="#FF4500"
            emissiveIntensity={2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Orbital Disks - Multiple rings at different angles */}
      {stage >= 2 &&
        [0, 1, 2, 3].map((ring, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) diskRefs.current[i] = el;
            }}
            rotation={[
              Math.PI / 2 + (i * Math.PI) / 8, // Tilted at angles
              0,
              (i * Math.PI) / 4,
            ]}
          >
            <torusGeometry args={[3.5 + i * 1, 0.15, 16, 100]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#8B5CF6" : "#06B6D4"}
              emissive={i % 2 === 0 ? "#8B5CF6" : "#06B6D4"}
              emissiveIntensity={1.5}
              transparent
              opacity={0.5 - i * 0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

      {/* Energy Jets - Shooting from poles */}
      {stage >= 2 && (
        <>
          {/* Top jet */}
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.1, 0.5, 4, 16]} />
            <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
          </mesh>
          {/* Bottom jet */}
          <mesh position={[0, -5, 0]}>
            <cylinderGeometry args={[0.5, 0.1, 4, 16]} />
            <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
}

// 💫 PARTICLE FIELD
function ParticleField({ stage }: { stage: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 1000;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 5 + Math.random() * 10;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
    colors[i * 3 + 2] = 1;
  }

  useFrame((state) => {
    if (particlesRef.current && stage >= 2) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      particlesRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
    }
  });

  if (stage < 2) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} />
    </points>
  );
}

// 📸 CAMERA ANIMATION
function CameraRig({ stage }: { stage: number }) {
  useFrame((state) => {
    // Zoom in effect
    if (stage === 1) {
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        8,
        0.05
      );
    } else if (stage === 2) {
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        6,
        0.05
      );
    } else if (stage === 3) {
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        5,
        0.05
      );
    } else if (stage === 4) {
      // Zoom into blackhole
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        0.5,
        0.1
      );
    }
  });

  return null;
}

export default function FuturePortalPro({
  onComplete,
  skipIntro = false,
}: FuturePortalProps) {
  const [stage, setStage] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // 🔥 REMOVED localStorage check - SHOW EVERY TIME!
    if (skipIntro) {
      if (onComplete) onComplete();
      return;
    }

    // Audio beeping effect
    if (typeof window !== "undefined" && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }

    const skipTimer = setTimeout(() => setShowSkip(true), 3000);

    // Stage progression with beeps
    const stage1 = setTimeout(() => {
      setStage(1);
      playBeep(440, 0.1); // First beep
    }, 1000);

    const stage2 = setTimeout(() => {
      setStage(2);
      playBeep(554, 0.1); // Second beep (higher)
    }, 3000);

    const stage3 = setTimeout(() => {
      setStage(3);
      playBeep(659, 0.15); // Third beep (even higher)
    }, 6000);

    const stage4 = setTimeout(() => {
      setStage(4);
      playBeep(880, 0.2); // Final beep (highest)
    }, 8500);

    const complete = setTimeout(() => {
      // 🔥 REMOVED localStorage.setItem - No more saving!
      if (onComplete) onComplete();
    }, 10000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(stage3);
      clearTimeout(stage4);
      clearTimeout(complete);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [skipIntro, onComplete, isMounted]);

  const playBeep = (frequency: number, duration: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const handleSkip = () => {
    // 🔥 REMOVED localStorage - Just skip to homepage!
    if (onComplete) onComplete();
  };

  if (!isMounted) {
    return null;
  }

  const words = ["Welcome", "to", "the", "Future"];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      {/* 🌌 STARFIELD BACKGROUND */}
      <div className="absolute inset-0">
        {[...Array(300)].map((_, i) => {
          const size = Math.random() * 2 + 1;
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
                opacity: 0.4,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
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

      {/* 🌀 3D BLACKHOLE CANVAS */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            {/* Dramatic lighting for real blackhole look */}
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#FF6B00" />
            <pointLight
              position={[-10, -10, -10]}
              intensity={1}
              color="#8B5CF6"
            />
            <pointLight position={[0, 10, 0]} intensity={1.5} color="#00FFFF" />
            <spotLight
              position={[0, 0, 15]}
              angle={0.3}
              penumbra={1}
              intensity={2}
              color="#FFFFFF"
            />

            <Blackhole stage={stage} />
            <ParticleField stage={stage} />
            <CameraRig stage={stage} />
          </Suspense>
        </Canvas>
      </div>

      {/* 🔊 PULSING AURA CIRCLES (2D Overlay) */}
      <AnimatePresence>
        {stage >= 2 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3, 4, 5, 6].map((ring, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  width: `${200 + i * 150}px`,
                  height: `${200 + i * 150}px`,
                  borderColor:
                    i % 2 === 0
                      ? "rgba(139, 92, 246, 0.3)"
                      : "rgba(6, 182, 212, 0.3)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ✨ WELCOME TEXT */}
      <AnimatePresence>
        {stage >= 3 && stage < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 z-10"
          >
            <div className="text-center relative">
              {/* Massive glow behind text */}
              <motion.div
                className="absolute inset-0 blur-[100px]"
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  background: `radial-gradient(
                    circle,
                    rgba(139, 92, 246, 0.8) 0%,
                    rgba(59, 130, 246, 0.6) 40%,
                    rgba(6, 182, 212, 0.4) 70%,
                    transparent 100%
                  )`,
                }}
              />

              <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.2em] relative z-10">
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      delay: i * 0.3,
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="text-white relative"
                    style={{
                      textShadow: `
                        0 0 30px rgba(139, 92, 246, 1),
                        0 0 60px rgba(59, 130, 246, 0.9),
                        0 0 90px rgba(6, 182, 212, 0.7),
                        0 0 120px rgba(139, 92, 246, 0.5),
                        0 0 150px rgba(59, 130, 246, 0.3)
                      `,
                      WebkitTextStroke: "2px rgba(255, 255, 255, 0.3)",
                      filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))",
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              {/* DYNASTY OS Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1 }}
                className="mt-12 text-2xl md:text-4xl text-cyan-300 tracking-[0.4em] font-light"
                style={{
                  textShadow: `
                    0 0 20px rgba(6, 182, 212, 1),
                    0 0 40px rgba(6, 182, 212, 0.7),
                    0 0 60px rgba(6, 182, 212, 0.5)
                  `,
                }}
              >
                DYNASTY OS
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚡ ZOOM VIGNETTE EFFECT */}
      <AnimatePresence>
        {stage === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20"
            style={{
              background: `radial-gradient(
                circle,
                transparent 0%,
                transparent 30%,
                rgba(139, 92, 246, 0.3) 60%,
                rgba(59, 130, 246, 0.6) 80%,
                rgba(6, 182, 212, 0.9) 100%
              )`,
            }}
          />
        )}
      </AnimatePresence>

      {/* ⚡ WHITE FLASH */}
      <AnimatePresence>
        {stage === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* 🎯 SKIP BUTTON */}
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
                "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              boxShadow: `
                0 0 30px rgba(139, 92, 246, 0.5),
                0 0 60px rgba(59, 130, 246, 0.4),
                inset 0 0 30px rgba(255, 255, 255, 0.15)
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

      {/* 📊 LOADING */}
      {stage >= 3 && stage < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="fixed bottom-8 left-8 z-50 text-cyan-300/70 text-sm tracking-widest"
        >
          INITIALIZING DYNASTY OS...
        </motion.div>
      )}
    </div>
  );
}
