"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  useGLTF,
  PerspectiveCamera,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Volume2, VolumeX, Minimize2, Maximize2, X } from "lucide-react";

interface AIAvatarMentorProps {
  courseId?: string;
  lessonId?: string;
  context?: "course" | "lesson" | "book" | "dashboard";
  minimizable?: boolean;
}

// 🤖 3D Avatar Head Component
function AvatarHead({ talking = false }: { talking?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;

      // Slight rotation when talking
      if (talking) {
        meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 2) * 0.1;
      }
    }

    if (glowRef.current && talking) {
      // Pulsing glow when speaking
      const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Main Avatar Head */}
      <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#8B5CF6"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
        />
      </Sphere>

      {/* Energy Glow */}
      <Sphere ref={glowRef} args={[1.2, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={talking ? 0.3 : 0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Eyes */}
      <Sphere args={[0.15, 16, 16]} position={[-0.3, 0.2, 0.8]}>
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#06B6D4"
          emissiveIntensity={2}
        />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.3, 0.2, 0.8]}>
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#06B6D4"
          emissiveIntensity={2}
        />
      </Sphere>

      {/* Mouth (animated when talking) */}
      {talking && (
        <mesh position={[0, -0.3, 0.8]}>
          <torusGeometry args={[0.2, 0.05, 16, 32, Math.PI]} />
          <meshBasicMaterial color="#3B82F6" />
        </mesh>
      )}
    </group>
  );
}

// 🎤 Speech Synthesis Hook
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || muted) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [muted]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, muted, setMuted };
}

// 🧠 AI Response Generator
function generateMentorResponse(context: string, userQuery?: string): string {
  const responses = {
    course: [
      "Welcome to this course! I'm here to guide you through every step.",
      "This module contains powerful knowledge. Take your time to absorb it.",
      "Remember, mastery comes from consistent practice and reflection.",
    ],
    lesson: [
      "Let's dive into this lesson together. I'll help you understand the concepts.",
      "Feel free to ask me questions at any time. I'm here to help!",
      "This is a crucial concept. Make sure you understand it before moving forward.",
    ],
    book: [
      "This book contains transformative wisdom. Let's explore it together.",
      "Take notes as you read. I'll help you retain the key insights.",
      "What part of this chapter resonates with you the most?",
    ],
    dashboard: [
      "Welcome back! Ready to continue your learning journey?",
      "I see you're making great progress. Keep up the excellent work!",
      "Which course would you like to explore today?",
    ],
  };

  const contextResponses =
    responses[context as keyof typeof responses] || responses.dashboard;
  return contextResponses[Math.floor(Math.random() * contextResponses.length)];
}

// 🎭 Main AI Avatar Component
export default function AIAvatarMentor({
  courseId,
  lessonId,
  context = "dashboard",
  minimizable = true,
}: AIAvatarMentorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const { speak, stop, speaking, muted, setMuted } = useSpeech();

  // Initialize with greeting
  useEffect(() => {
    const greeting = generateMentorResponse(context);
    setCurrentMessage(greeting);

    // Speak after a short delay
    const timer = setTimeout(() => {
      speak(greeting);
    }, 1000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [context]);

  // Handle user interactions (can be extended)
  const handleUserQuery = (query: string) => {
    const response = generateMentorResponse(context, query);
    setCurrentMessage(response);
    speak(response);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`fixed ${
          isMinimized
            ? "bottom-6 right-6 w-24 h-24"
            : "bottom-6 right-6 w-96 h-[500px]"
        } z-50 transition-all duration-300`}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-purple-900/90 via-slate-900/90 to-blue-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            {minimizable && (
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white" />
                )}
              </button>
            )}

            <button
              onClick={() => {
                stop();
                setIsVisible(false);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-red-500/30 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {!isMinimized ? (
            <>
              {/* 3D Avatar Canvas */}
              <div className="w-full h-1/2">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 4]} />
                  <ambientLight intensity={0.5} />
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
                  <AvatarHead talking={speaking} />
                </Canvas>
              </div>

              {/* Message Display */}
              <div className="p-6 h-1/2 flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto">
                  <motion.p
                    key={currentMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-sm leading-relaxed"
                  >
                    {currentMessage}
                  </motion.p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => handleUserQuery("explain this concept")}
                    className="px-3 py-1.5 text-xs rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 transition-colors"
                  >
                    Explain this
                  </button>
                  <button
                    onClick={() => handleUserQuery("what's next")}
                    className="px-3 py-1.5 text-xs rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 transition-colors"
                  >
                    What's next?
                  </button>
                  <button
                    onClick={() => handleUserQuery("quiz me")}
                    className="px-3 py-1.5 text-xs rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-200 transition-colors"
                  >
                    Quiz me
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Minimized View
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={{
                  scale: speaking ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: speaking ? Infinity : 0,
                }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
