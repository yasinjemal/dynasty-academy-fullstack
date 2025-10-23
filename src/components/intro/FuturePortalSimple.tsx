"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface FuturePortalProps {
  onComplete?: () => void;
  skipIntro?: boolean;
}

// 🌀 SIMPLE BLACKHOLE - Just cycling disk
function Blackhole({ stage }: { stage: number }) {
  const diskRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Core gentle pulse
    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      coreRef.current.scale.setScalar(pulse);
    }

    // No spinning - static disk
  });

  return (
    <group>
      {/* Dark Core */}
      <Sphere ref={coreRef} args={[1.5, 64, 64]} scale={stage >= 1 ? 1 : 0}>
        <MeshDistortMaterial
          color="#1a0033"
          emissive="#8B5CF6"
          emissiveIntensity={0.5}
          distort={0.3}
          speed={1}
          roughness={0}
          metalness={1}
        />
      </Sphere>

      {/* Cycling Disk */}
      {stage >= 1 && (
        <mesh ref={diskRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[3, 0.6, 2, 100]} />
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#8B5CF6"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// 📸 Camera zoom OUT
function CameraRig({ stage }: { stage: number }) {
  useFrame((state) => {
    if (stage === 4) {
      // Zoom OUT instead of in
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        20,
        0.05
      );
    }
  });
  return null;
}

export default function FuturePortalSimple({
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

    if (skipIntro) {
      if (onComplete) onComplete();
      return;
    }

    // Setup audio
    if (typeof window !== "undefined" && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }

    const skipTimer = setTimeout(() => setShowSkip(true), 3000);

    // Simple progression with Siri-style beeps
    const stage1 = setTimeout(() => {
      setStage(1);
      playSiriBeep(1); // Low
    }, 1000);

    const stage2 = setTimeout(() => {
      setStage(2);
      playSiriBeep(2); // Mid
    }, 3000);

    const stage3 = setTimeout(() => {
      setStage(3);
      playSiriBeep(3); // High
    }, 6000);

    const stage4 = setTimeout(() => {
      setStage(4);
      playSiriBeep(4); // Highest
    }, 8000);

    const complete = setTimeout(() => {
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

  // 🔊 Siri-style beep (smooth sine wave)
  const playSiriBeep = (level: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Siri frequencies (smooth progression)
    const frequencies = [520, 660, 780, 880];
    oscillator.frequency.value = frequencies[level - 1];
    oscillator.type = "sine"; // Pure sine wave like Siri

    // Smooth envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  const handleSkip = () => {
    if (onComplete) onComplete();
  };

  if (!isMounted) {
    return null;
  }

  const words = ["Welcome", "to", "the", "Future"];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      {/* Simple starfield */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => {
          const size = Math.random() * 2;
          const x = Math.random() * 100;
          const y = Math.random() * 100;

          return (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                opacity: 0.5,
              }}
            />
          );
        })}
      </div>

      {/* 🌀 Simple 3D Blackhole */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#8B5CF6" />
            <pointLight
              position={[-10, -10, -10]}
              intensity={0.5}
              color="#06B6D4"
            />

            <Blackhole stage={stage} />
            <CameraRig stage={stage} />
          </Suspense>
        </Canvas>
      </div>

      {/* ✨ Text (simple fade) */}
      <AnimatePresence>
        {stage >= 3 && stage < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
          >
            <div className="text-center">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-5xl sm:text-6xl md:text-8xl font-bold tracking-[0.2em]">
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.2,
                      duration: 0.5,
                    }}
                    className="text-white"
                    style={{
                      textShadow: `
                        0 0 30px rgba(139, 92, 246, 0.8),
                        0 0 60px rgba(59, 130, 246, 0.5)
                      `,
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-xl md:text-2xl text-cyan-300 tracking-[0.3em]"
              >
                DYNASTY OS
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚡ Simple flash */}
      <AnimatePresence>
        {stage === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* 🎯 Skip button */}
      <AnimatePresence>
        {showSkip && stage < 4 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed bottom-8 right-8 z-50 px-6 py-3 rounded-lg text-white/80 text-sm tracking-wide hover:text-white transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            Skip ›
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
