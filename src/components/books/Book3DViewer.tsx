"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Text,
  RoundedBox,
  Float,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { BookOpen, Sparkles, Wind, Eye } from "lucide-react";

interface Book3DViewerProps {
  bookId: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  content: string;
  onPageTurn: (direction: "next" | "prev") => void;
  onClose: () => void;
}

// 📖 3D Book Component with Realistic Pages
function Book3D({
  isOpen,
  leftPageContent,
  rightPageContent,
  onLeftClick,
  onRightClick,
}: {
  isOpen: boolean;
  leftPageContent: string;
  rightPageContent: string;
  onLeftClick: () => void;
  onRightClick: () => void;
}) {
  const bookRef = useRef<THREE.Group>(null);
  const leftPageRef = useRef<THREE.Mesh>(null);
  const rightPageRef = useRef<THREE.Mesh>(null);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  useFrame(({ clock }) => {
    if (bookRef.current) {
      // Gentle floating
      bookRef.current.position.y =
        Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
      bookRef.current.rotation.y =
        Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }

    // Page curl effect on hover
    if (leftPageRef.current && leftHovered) {
      leftPageRef.current.rotation.y = Math.max(
        leftPageRef.current.rotation.y - 0.05,
        -Math.PI * 0.15
      );
    } else if (leftPageRef.current) {
      leftPageRef.current.rotation.y = Math.min(
        leftPageRef.current.rotation.y + 0.05,
        0
      );
    }

    if (rightPageRef.current && rightHovered) {
      rightPageRef.current.rotation.y = Math.min(
        rightPageRef.current.rotation.y + 0.05,
        Math.PI * 0.15
      );
    } else if (rightPageRef.current) {
      rightPageRef.current.rotation.y = Math.max(
        rightPageRef.current.rotation.y - 0.05,
        0
      );
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={bookRef} position={[0, 0, 0]}>
        {/* Book Cover (Back) */}
        <RoundedBox args={[3, 4, 0.2]} position={[0, 0, -0.15]} radius={0.05}>
          <meshPhysicalMaterial
            color="#2d1b4e"
            metalness={0.8}
            roughness={0.2}
            clearcoat={1}
          />
        </RoundedBox>

        {/* Left Page */}
        <group ref={leftPageRef} position={[-0.75, 0, 0]}>
          <RoundedBox
            args={[1.4, 3.8, 0.02]}
            radius={0.02}
            onPointerOver={() => setLeftHovered(true)}
            onPointerOut={() => setLeftHovered(false)}
            onClick={onLeftClick}
          >
            <meshPhysicalMaterial
              color="#fef9e7"
              roughness={0.8}
              metalness={0.1}
              emissive={leftHovered ? "#fef9e7" : "#000000"}
              emissiveIntensity={leftHovered ? 0.1 : 0}
            />
          </RoundedBox>

          {/* Left Page Text */}
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.08}
            maxWidth={1.2}
            textAlign="left"
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            {leftPageContent.substring(0, 400)}
          </Text>

          {/* Left Page Glow */}
          {leftHovered && (
            <pointLight
              position={[0, 0, 0.5]}
              intensity={0.5}
              distance={2}
              color="#fef9e7"
            />
          )}
        </group>

        {/* Right Page */}
        <group ref={rightPageRef} position={[0.75, 0, 0]}>
          <RoundedBox
            args={[1.4, 3.8, 0.02]}
            radius={0.02}
            onPointerOver={() => setRightHovered(true)}
            onPointerOut={() => setRightHovered(false)}
            onClick={onRightClick}
          >
            <meshPhysicalMaterial
              color="#fef9e7"
              roughness={0.8}
              metalness={0.1}
              emissive={rightHovered ? "#fef9e7" : "#000000"}
              emissiveIntensity={rightHovered ? 0.1 : 0}
            />
          </RoundedBox>

          {/* Right Page Text */}
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.08}
            maxWidth={1.2}
            textAlign="left"
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            {rightPageContent.substring(0, 400)}
          </Text>

          {/* Right Page Glow */}
          {rightHovered && (
            <pointLight
              position={[0, 0, 0.5]}
              intensity={0.5}
              distance={2}
              color="#fef9e7"
            />
          )}
        </group>

        {/* Book Spine */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 4, 0.2]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Glow Around Book */}
        <pointLight
          position={[0, 0, 1]}
          intensity={0.3}
          distance={5}
          color="#8b5cf6"
        />
      </group>
    </Float>
  );
}

// ✨ Magical Particles Around Book
function ReadingParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;

      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(clock.getElapsedTime() + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particles = new THREE.BufferGeometry();
  const count = 500;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    positions[i] = Math.cos(angle) * radius;
    positions[i + 1] = (Math.random() - 0.5) * 5;
    positions[i + 2] = Math.sin(angle) * radius;
  }

  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return (
    <points ref={particlesRef} geometry={particles}>
      <pointsMaterial size={0.03} color="#8b5cf6" transparent opacity={0.6} />
    </points>
  );
}

// 🎭 Main 3D Book Viewer
export default function Book3DViewer({
  bookId,
  title,
  author,
  currentPage,
  totalPages,
  content,
  onPageTurn,
  onClose,
}: Book3DViewerProps) {
  const [viewMode, setViewMode] = useState<"3d" | "immersive">("3d");
  const [showParticles, setShowParticles] = useState(true);
  const [ambientMode, setAmbientMode] = useState<
    "cosmic" | "library" | "nature"
  >("cosmic");

  // Split content into pages (simple version)
  const wordsPerPage = 400;
  const words = content.split(" ");
  const leftPageStart = currentPage * wordsPerPage;
  const leftPageContent = words
    .slice(leftPageStart, leftPageStart + wordsPerPage)
    .join(" ");
  const rightPageContent = words
    .slice(leftPageStart + wordsPerPage, leftPageStart + wordsPerPage * 2)
    .join(" ");

  const handlePrevPage = () => {
    if (currentPage > 0) {
      onPageTurn("prev");
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalPages / 2)) {
      onPageTurn("next");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-purple-950/50 to-slate-950">
      {/* Ambient Background */}
      <div className="absolute inset-0 opacity-20">
        {ambientMode === "cosmic" && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black" />
        )}
        {ambientMode === "library" && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900 via-slate-900 to-black" />
        )}
        {ambientMode === "nature" && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900 via-slate-900 to-black" />
        )}
      </div>

      {/* Top Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            ← Exit 3D View
          </button>

          <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <p className="text-white font-medium">{title}</p>
            <p className="text-purple-300 text-sm">{author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient Mode Toggle */}
          <button
            onClick={() =>
              setAmbientMode((m) =>
                m === "cosmic"
                  ? "library"
                  : m === "library"
                  ? "nature"
                  : "cosmic"
              )
            }
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
            title="Change Ambient"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Particles Toggle */}
          <button
            onClick={() => setShowParticles(!showParticles)}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
            title="Toggle Particles"
          >
            <Wind className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 6]} />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#8b5cf6" />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ec4899" />
          <spotLight
            position={[0, 8, 0]}
            angle={0.5}
            penumbra={1}
            intensity={1}
            color="#fef9e7"
            castShadow
          />

          {/* 3D Book */}
          <Book3D
            isOpen={true}
            leftPageContent={leftPageContent}
            rightPageContent={rightPageContent}
            onLeftClick={handlePrevPage}
            onRightClick={handleNextPage}
          />

          {/* Particles */}
          {showParticles && <ReadingParticles />}
        </Canvas>
      </div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-6"
      >
        {/* Previous Page */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Page Counter */}
        <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <p className="text-white font-medium">
            Page {currentPage * 2 + 1}-{currentPage * 2 + 2} of {totalPages}
          </p>
          <div className="w-48 h-2 bg-white/20 rounded-full mt-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${((currentPage * 2) / totalPages) * 100}%` }}
            />
          </div>
        </div>

        {/* Next Page */}
        <button
          onClick={handleNextPage}
          disabled={currentPage >= Math.ceil(totalPages / 2) - 1}
          className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </motion.div>

      {/* Reading Stats (Bottom Left) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-8 left-8 z-10"
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-300">
            <Eye className="w-4 h-4" />
            <span className="text-sm">
              Reading Time: {Math.ceil(totalPages / 10)} min
            </span>
          </div>
          <div className="flex items-center gap-2 text-pink-300">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">
              Progress: {Math.round(((currentPage * 2) / totalPages) * 100)}%
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
