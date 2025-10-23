"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Text,
  RoundedBox,
  Float,
  PerspectiveCamera,
  Environment,
  Stars,
  MeshTransmissionMaterial,
  Html,
  OrbitControls,
  Cylinder,
  Box,
  Plane,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  BookOpen,
  Sparkles,
  Eye,
  Zap,
  Radio,
  Cpu,
  Maximize,
  Minimize,
} from "lucide-react";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

interface FuturisticBook3DProps {
  bookId: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  content: string;
  onPageTurn: (direction: "next" | "prev") => void;
  onClose: () => void;
}

// Holographic Data Stream Particles
function DataStreamParticles({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 3000;

  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Positions in a cylindrical stream around the book
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const height = (Math.random() - 0.5) * 15;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Cyberpunk neon colors
      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        // Cyan
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.6) {
        // Magenta
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 1;
      } else {
        // Electric blue
        colors[i * 3] = 0.3;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 1;
      }

      speeds[i] = 0.5 + Math.random() * 1.5;
    }

    return { positions, colors, speeds };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !active) return;

    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      // Move particles upward in a spiral
      positions[i * 3 + 1] += speeds[i] * 0.02;

      // Spiral rotation
      const angle = state.clock.elapsedTime * 0.5 + i * 0.01;
      const radius = 3 + Math.sin(state.clock.elapsedTime + i * 0.1) * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Reset when too high
      if (positions[i * 3 + 1] > 7) {
        positions[i * 3 + 1] = -7;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Neon Grid Floor
function NeonGrid() {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y =
        -3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={gridRef} position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[20, 20, "#00ffff", "#ff00ff"]} />
      <Plane args={[20, 20]} position={[0, 0, -0.01]}>
        <meshBasicMaterial
          color="#0a0a1a"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </Plane>
    </group>
  );
}

// Holographic Book Pages
function HolographicBook({
  leftContent,
  rightContent,
  pageNumber,
  onPageTurn,
}: {
  leftContent: string;
  rightContent: string;
  pageNumber: number;
  onPageTurn: (direction: "next" | "prev") => void;
}) {
  const leftPageRef = useRef<THREE.Group>(null);
  const rightPageRef = useRef<THREE.Group>(null);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  useFrame((state) => {
    if (leftPageRef.current) {
      leftPageRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
    if (rightPageRef.current) {
      rightPageRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 0.02;
    }
  });

  const handleLeftClick = () => {
    if (leftPageRef.current) {
      gsap.to(leftPageRef.current.rotation, {
        y: -Math.PI,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          onPageTurn("prev");
          if (leftPageRef.current) {
            gsap.set(leftPageRef.current.rotation, { y: 0 });
          }
        },
      });
    }
  };

  const handleRightClick = () => {
    if (rightPageRef.current) {
      gsap.to(rightPageRef.current.rotation, {
        y: Math.PI,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          onPageTurn("next");
          if (rightPageRef.current) {
            gsap.set(rightPageRef.current.rotation, { y: 0 });
          }
        },
      });
    }
  };

  return (
    <group>
      {/* Left Page */}
      <group
        ref={leftPageRef}
        position={[-1.6, 0, 0]}
        onPointerEnter={() => setLeftHovered(true)}
        onPointerLeave={() => setLeftHovered(false)}
        onClick={handleLeftClick}
      >
        {/* Holographic Glass Page - MORE VISIBLE */}
        <RoundedBox args={[1.5, 2, 0.05]} radius={0.02}>
          <meshPhysicalMaterial
            color="#00ffff"
            transparent
            opacity={0.4}
            roughness={0.05}
            metalness={0.3}
            transmission={0.5}
            thickness={1.5}
            emissive="#00ffff"
            emissiveIntensity={leftHovered ? 0.8 : 0.4}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        {/* Solid Background for Text Readability */}
        <RoundedBox
          args={[1.48, 1.98, 0.01]}
          radius={0.02}
          position={[0, 0, -0.01]}
        >
          <meshStandardMaterial
            color="#001a1a"
            transparent
            opacity={0.85}
            emissive="#003333"
            emissiveIntensity={0.2}
          />
        </RoundedBox>

        {/* Glowing Border */}
        <RoundedBox args={[1.52, 2.02, 0.01]} radius={0.02}>
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={leftHovered ? 0.8 : 0.5}
            side={THREE.BackSide}
          />
        </RoundedBox>

        {/* Text Content - CRISP & READABLE */}
        <Text
          position={[0, 0.3, 0.06]}
          fontSize={0.075}
          maxWidth={1.3}
          textAlign="left"
          color="#00ffff"
          anchorX="center"
          anchorY="top"
          outlineWidth={0.005}
          outlineColor="#ffffff"
          fillOpacity={1}
        >
          {leftContent.substring(0, 280)}
        </Text>

        {/* Page Number */}
        <Text
          position={[0, -1.7, 0.06]}
          fontSize={0.06}
          color="#00ffff"
          anchorX="center"
          outlineWidth={0.003}
          outlineColor="#ffffff"
          fillOpacity={1}
        >
          {pageNumber}
        </Text>

        {/* Hover Glow */}
        {leftHovered && (
          <pointLight
            position={[0, 0, 0.5]}
            intensity={2}
            distance={2}
            color="#00ffff"
          />
        )}
      </group>

      {/* Right Page */}
      <group
        ref={rightPageRef}
        position={[1.6, 0, 0]}
        onPointerEnter={() => setRightHovered(true)}
        onPointerLeave={() => setRightHovered(false)}
        onClick={handleRightClick}
      >
        {/* Holographic Glass Page - MORE VISIBLE */}
        <RoundedBox args={[1.5, 2, 0.05]} radius={0.02}>
          <meshPhysicalMaterial
            color="#ff00ff"
            transparent
            opacity={0.4}
            roughness={0.05}
            metalness={0.3}
            transmission={0.5}
            thickness={1.5}
            emissive="#ff00ff"
            emissiveIntensity={rightHovered ? 0.8 : 0.4}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        {/* Solid Background for Text Readability */}
        <RoundedBox
          args={[1.48, 1.98, 0.01]}
          radius={0.02}
          position={[0, 0, -0.01]}
        >
          <meshStandardMaterial
            color="#1a001a"
            transparent
            opacity={0.85}
            emissive="#330033"
            emissiveIntensity={0.2}
          />
        </RoundedBox>

        {/* Glowing Border */}
        <RoundedBox args={[1.52, 2.02, 0.01]} radius={0.02}>
          <meshBasicMaterial
            color="#ff00ff"
            transparent
            opacity={rightHovered ? 0.8 : 0.5}
            side={THREE.BackSide}
          />
        </RoundedBox>

        {/* Text Content - CRISP & READABLE */}
        <Text
          position={[0, 0.3, 0.06]}
          fontSize={0.075}
          maxWidth={1.3}
          textAlign="left"
          color="#ff00ff"
          anchorX="center"
          anchorY="top"
          outlineWidth={0.005}
          outlineColor="#ffffff"
          fillOpacity={1}
        >
          {rightContent.substring(0, 280)}
        </Text>

        {/* Page Number */}
        <Text
          position={[0, -1.7, 0.06]}
          fontSize={0.06}
          color="#ff00ff"
          anchorX="center"
          outlineWidth={0.003}
          outlineColor="#ffffff"
          fillOpacity={1}
        >
          {pageNumber + 1}
        </Text>

        {/* Hover Glow */}
        {rightHovered && (
          <pointLight
            position={[0, 0, 0.5]}
            intensity={2}
            distance={2}
            color="#ff00ff"
          />
        )}
      </group>

      {/* Center Spine Hologram - ULTRA BRIGHT */}
      <Cylinder args={[0.08, 0.08, 2.2, 16]} rotation={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={5}
          metalness={1}
          roughness={0}
        />
      </Cylinder>
      {/* Spine Glow Effect */}
      <pointLight
        position={[0, 0, 0]}
        intensity={3}
        distance={1.5}
        color="#ffffff"
      />
    </group>
  );
}

// Floating Holograms
function FloatingHolograms() {
  return (
    <>
      {/* Floating Rings */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 3, -3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh position={[0, -2, -3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.2} />
        </mesh>
      </Float>
    </>
  );
}

// Camera Controller
function CameraController({ focusMode }: { focusMode: boolean }) {
  const { camera } = useThree();

  useGSAP(() => {
    gsap.to(camera.position, {
      z: focusMode ? 3.5 : 6,
      y: focusMode ? 0 : 0.5,
      duration: 1,
      ease: "power2.inOut",
    });
  }, [focusMode]);

  return null;
}

// Main Scene
function Scene({
  leftContent,
  rightContent,
  pageNumber,
  onPageTurn,
  showParticles,
  focusMode,
}: {
  leftContent: string;
  rightContent: string;
  pageNumber: number;
  onPageTurn: (direction: "next" | "prev") => void;
  showParticles: boolean;
  focusMode: boolean;
}) {
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0.5, 6]} fov={60} />
      <CameraController focusMode={focusMode} />

      {/* Lighting - BRIGHTER FOR VISIBILITY */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <pointLight position={[5, 5, 5]} intensity={2.5} color="#00ffff" />
      <pointLight position={[-5, 5, 5]} intensity={2.5} color="#ff00ff" />
      <pointLight position={[0, 0, 8]} intensity={3} color="#ffffff" />
      <spotLight
        position={[0, 10, 0]}
        intensity={3}
        angle={0.6}
        penumbra={1}
        color="#ffffff"
        castShadow
      />
      {/* Fill lights for book pages */}
      <pointLight position={[-2, 0, 2]} intensity={2} color="#00ffff" />
      <pointLight position={[2, 0, 2]} intensity={2} color="#ff00ff" />

      {/* Background */}
      <color attach="background" args={["#000000"]} />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Environment */}
      <NeonGrid />
      <FloatingHolograms />

      {/* Data Stream Particles */}
      {showParticles && <DataStreamParticles active={showParticles} />}

      {/* Holographic Book */}
      <HolographicBook
        leftContent={leftContent}
        rightContent={rightContent}
        pageNumber={pageNumber}
        onPageTurn={onPageTurn}
      />

      {/* Post Processing */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.001, 0.001] as [number, number]}
        />
      </EffectComposer>

      {/* Orbit Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

// Main Component
export default function FuturisticBook3D({
  bookId,
  title,
  author,
  currentPage,
  totalPages,
  content,
  onPageTurn,
  onClose,
}: FuturisticBook3DProps) {
  const [showParticles, setShowParticles] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  // Split content into pages
  const wordsPerPage = 280;
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
    <div className="fixed inset-0 bg-black z-50">
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Scene
          leftContent={leftPageContent}
          rightContent={rightPageContent}
          pageNumber={currentPage * 2 + 1}
          onPageTurn={onPageTurn}
          showParticles={showParticles}
          focusMode={focusMode}
        />
      </Canvas>

      {/* UI Controls */}
      <AnimatePresence mode="wait">
        <motion.div
          key="title-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-6 py-3 shadow-2xl shadow-cyan-500/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-cyan-300/70 text-sm mt-1">{author}</p>
          </div>
        </motion.div>

        {/* Control Buttons */}
        <motion.div
          key="control-buttons"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3"
        >
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`p-3 rounded-xl backdrop-blur-xl transition-all ${
              showParticles
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                : "bg-gray-900/50 border-gray-700/50 text-gray-400"
            } border hover:scale-110`}
            title="Toggle Data Stream"
          >
            <Radio className="w-5 h-5" />
          </button>

          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`p-3 rounded-xl backdrop-blur-xl transition-all ${
              focusMode
                ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                : "bg-gray-900/50 border-gray-700/50 text-gray-400"
            } border hover:scale-110`}
            title="Focus Mode"
          >
            {focusMode ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 backdrop-blur-xl hover:scale-110 transition-all"
            title="Exit VR Mode"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Page Navigation */}
        <motion.div
          key="page-navigation"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4"
        >
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl backdrop-blur-xl hover:from-cyan-500/30 hover:to-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold"
          >
            ← Previous
          </button>

          <div className="px-6 py-3 bg-black/80 border border-purple-500/30 rounded-xl backdrop-blur-xl">
            <p className="text-purple-300 font-mono">
              Pages {currentPage * 2 + 1}-{currentPage * 2 + 2} of {totalPages}
            </p>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(totalPages / 2)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-xl backdrop-blur-xl hover:from-purple-500/30 hover:to-pink-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold"
          >
            Next →
          </button>
        </motion.div>

        {/* VR Badge */}
        <motion.div
          key="vr-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-6 right-6"
        >
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                VR READING MODE
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
