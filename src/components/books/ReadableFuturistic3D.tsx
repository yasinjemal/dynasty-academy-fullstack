"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Text,
  RoundedBox,
  Float,
  PerspectiveCamera,
  Stars,
  Html,
  OrbitControls,
  Plane,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { BookOpen, Radio, Maximize, Minimize, Eye, EyeOff } from "lucide-react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

interface ReadableFuturistic3DProps {
  bookId: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  content: string;
  onPageTurn: (direction: "next" | "prev") => void;
  onClose: () => void;
}

// Subtle Ambient Particles (way less overwhelming)
function AmbientParticles({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 500; // Reduced from 3000!

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 3;
      const height = (Math.random() - 0.5) * 10;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Warm golden-amber colors (like floating dust in old library)
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        // Gold dust
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.2;
      } else {
        // Warm amber
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
      }
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !active) return;
    pointsRef.current.rotation.y += 0.0002;
  });

  if (!active) return null;

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
        size={0.03}
        vertexColors
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Single Page Book (Mobile-Friendly!)
function ReadableBook({
  content,
  pageNumber,
  onPageTurn,
}: {
  content: string;
  pageNumber: number;
  onPageTurn: (direction: "next" | "prev") => void;
}) {
  const pageRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const handlePrevClick = () => {
    if (pageRef.current) {
      gsap.to(pageRef.current.rotation, {
        y: Math.PI,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          onPageTurn("prev");
          if (pageRef.current) {
            gsap.set(pageRef.current.rotation, { y: 0 });
          }
        },
      });
    }
  };

  const handleNextClick = () => {
    if (pageRef.current) {
      gsap.to(pageRef.current.rotation, {
        y: -Math.PI,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          onPageTurn("next");
          if (pageRef.current) {
            gsap.set(pageRef.current.rotation, { y: 0 });
          }
        },
      });
    }
  };

  return (
    <group>
      {/* Single Page - VINTAGE PAPER (Larger for better readability) */}
      <group
        ref={pageRef}
        position={[0, 0, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Aged Paper Texture - Larger single page */}
        <RoundedBox args={[2.2, 2.8, 0.03]} radius={0.02}>
          <meshStandardMaterial
            color={hovered ? "#fef5e7" : "#f9f3e8"}
            roughness={0.95}
            metalness={0}
            emissive="#fff8dc"
            emissiveIntensity={hovered ? 0.15 : 0.05}
          />
        </RoundedBox>

        {/* Vintage Paper Shadow/Depth */}
        <RoundedBox
          args={[2.18, 2.78, 0.01]}
          radius={0.02}
          position={[0, 0, -0.02]}
        >
          <meshStandardMaterial color="#d4c5a9" roughness={1} />
        </RoundedBox>

        {/* Gold Leaf Border (subtle vintage accent) */}
        {hovered && (
          <RoundedBox args={[2.24, 2.84, 0.01]} radius={0.02}>
            <meshStandardMaterial
              color="#d4af37"
              emissive="#ffd700"
              emissiveIntensity={0.4}
              metalness={0.8}
              roughness={0.3}
              transparent
              opacity={0.4}
              side={THREE.BackSide}
            />
          </RoundedBox>
        )}

        {/* Elegant Serif Text - More content fits! */}
        <Text
          position={[0, 1.0, 0.03]}
          fontSize={0.058}
          maxWidth={2.0}
          textAlign="justify"
          color="#2c1810"
          anchorX="center"
          anchorY="top"
          lineHeight={1.6}
          letterSpacing={0.005}
        >
          {content.substring(0, 550)}
        </Text>

        {/* Decorative Page Number with Ornament */}
        <Text
          position={[0, -1.3, 0.03]}
          fontSize={0.05}
          color="#8b7355"
          anchorX="center"
        >
          ~ {pageNumber} ~
        </Text>

        {/* Warm vintage glow on hover */}
        {hovered && (
          <pointLight
            position={[0, 0, 0.5]}
            intensity={1}
            distance={2}
            color="#ffd700"
          />
        )}

        {/* Left side clickable area for previous page */}
        <mesh
          position={[-0.6, 0, 0.04]}
          onClick={handlePrevClick}
          visible={false}
        >
          <planeGeometry args={[1, 2.8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Right side clickable area for next page */}
        <mesh
          position={[0.6, 0, 0.04]}
          onClick={handleNextClick}
          visible={false}
        >
          <planeGeometry args={[1, 2.8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
}

// Vintage Library Environment
function SubtleEnvironment() {
  return (
    <>
      {/* Vintage wooden floor/desk */}
      <Plane
        args={[30, 30]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.5, 0]}
      >
        <meshStandardMaterial
          color="#4a3728"
          roughness={0.85}
          metalness={0.05}
          emissive="#2c1810"
          emissiveIntensity={0.1}
        />
      </Plane>

      {/* Floating golden ornamental circles (like old library decorations) */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh position={[0, 2.8, -5]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.4, 0.015, 16, 100]} />
          <meshStandardMaterial
            color="#d4af37"
            emissive="#ffd700"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.4}
          />
        </mesh>
      </Float>

      {/* Smaller inner ornamental ring */}
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh position={[0, 2.8, -5]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.01, 16, 100]} />
          <meshStandardMaterial
            color="#c9a961"
            emissive="#ffd700"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.35}
          />
        </mesh>
      </Float>

      {/* Subtle ambient light orbs (like old oil lamps) */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
        <mesh position={[-4, 1, -3]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#fff4d6"
            emissive="#ffeb99"
            emissiveIntensity={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>
      <Float speed={1.3} rotationIntensity={0.1} floatIntensity={0.35}>
        <mesh position={[4, 0.8, -3]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color="#fff4d6"
            emissive="#ffeb99"
            emissiveIntensity={0.7}
            transparent
            opacity={0.25}
          />
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
      z: focusMode ? 2.5 : 4,
      y: focusMode ? 0 : 0.3,
      duration: 0.8,
      ease: "power2.inOut",
    });
  }, [focusMode]);

  return null;
}

// Main Scene
function Scene({
  content,
  pageNumber,
  onPageTurn,
  showParticles,
  focusMode,
}: {
  content: string;
  pageNumber: number;
  onPageTurn: (direction: "next" | "prev") => void;
  showParticles: boolean;
  focusMode: boolean;
}) {
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0.3, 4]} fov={65} />
      <CameraController focusMode={focusMode} />

      {/* Warm Vintage Library Lighting */}
      <ambientLight intensity={0.7} color="#fff8e7" />
      <directionalLight position={[3, 5, 3]} intensity={1.2} color="#fffaf0" />
      <directionalLight position={[-3, 5, 3]} intensity={1.2} color="#fffaf0" />
      <pointLight position={[0, 4, 4]} intensity={1.8} color="#ffeaa7" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#ffd700" />
      <pointLight position={[3, 2, 2]} intensity={0.8} color="#ffd700" />

      {/* Warm Library Background */}
      <color attach="background" args={["#1a1410"]} />
      <Stars
        radius={100}
        depth={50}
        count={1500}
        factor={1.5}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Environment */}
      <SubtleEnvironment />

      {/* Subtle Particles */}
      <AmbientParticles active={showParticles} />

      {/* Readable Single Page Book */}
      <ReadableBook
        content={content}
        pageNumber={pageNumber}
        onPageTurn={onPageTurn}
      />

      {/* Very Subtle Bloom */}
      <EffectComposer>
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>

      {/* Orbit Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2.5}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

// Main Component
export default function ReadableFuturistic3D({
  bookId,
  title,
  author,
  currentPage,
  totalPages,
  content,
  onPageTurn,
  onClose,
}: ReadableFuturistic3DProps) {
  const [showParticles, setShowParticles] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  // Split content into single pages (more words per page!)
  const wordsPerPage = 550;
  const words = content.split(" ");
  const pageStart = currentPage * wordsPerPage;
  const pageContent = words
    .slice(pageStart, pageStart + wordsPerPage)
    .join(" ");

  const handlePrevPage = () => {
    if (currentPage > 0) {
      onPageTurn("prev");
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(words.length / wordsPerPage) - 1) {
      onPageTurn("next");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-950 via-stone-900 to-neutral-950 z-50">
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
          content={pageContent}
          pageNumber={currentPage + 1}
          onPageTurn={onPageTurn}
          showParticles={showParticles}
          focusMode={focusMode}
        />
      </Canvas>

      {/* Clean UI Controls */}
      <AnimatePresence mode="wait">
        <motion.div
          key="title-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-xl border-2 border-amber-600/40 rounded-lg px-8 py-4 shadow-2xl shadow-amber-900/30">
            <h2 className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-900 to-orange-900 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-amber-800/80 text-sm mt-1 font-serif italic">
              {author}
            </p>
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
            className={`p-3 rounded-lg backdrop-blur-xl transition-all shadow-lg border-2 ${
              showParticles
                ? "bg-amber-500/20 border-amber-600/50 text-amber-700"
                : "bg-stone-800/30 border-stone-600/50 text-stone-400"
            } hover:scale-110`}
            title="Toggle Ambient Effects"
          >
            {showParticles ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`p-3 rounded-lg backdrop-blur-xl transition-all shadow-lg border-2 ${
              focusMode
                ? "bg-amber-600/20 border-amber-700/50 text-amber-800"
                : "bg-stone-800/30 border-stone-600/50 text-stone-400"
            } hover:scale-110`}
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
            className="p-3 rounded-lg bg-amber-100/90 border-2 border-amber-600 text-amber-900 backdrop-blur-xl hover:scale-110 transition-all shadow-lg hover:bg-amber-200"
            title="Exit 3D Mode"
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
            className="px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-600/40 text-amber-900 rounded-lg backdrop-blur-xl hover:from-amber-200 hover:to-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-serif font-semibold shadow-lg"
          >
            ← Previous
          </button>

          <div className="px-6 py-3 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-600/40 rounded-lg backdrop-blur-xl shadow-lg">
            <p className="text-amber-900 font-serif font-medium">
              Page {currentPage + 1} of {Math.ceil(words.length / wordsPerPage)}
            </p>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(words.length / wordsPerPage) - 1}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 border-2 border-amber-700 text-amber-50 rounded-lg backdrop-blur-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-serif font-semibold shadow-lg"
          >
            Next →
          </button>
        </motion.div>

        {/* Vintage Badge */}
        <motion.div
          key="mode-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-6 right-6"
        >
          <div className="px-4 py-2 bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-600/50 rounded-full backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
              <span className="text-xs font-serif font-bold text-amber-900">
                CLASSIC READING
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
