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
  Sparkles as DreiSparkles,
  MeshDistortMaterial,
  Sphere,
  useTexture,
  Html,
  OrbitControls,
} from "@react-three/drei";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import * as THREE from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  BookOpen,
  Sparkles,
  Wind,
  Eye,
  Zap,
  Moon,
  Sun,
  Trees,
  Globe,
  Maximize,
  Minimize,
} from "lucide-react";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
} from "@react-three/postprocessing";

interface AdvancedBook3DProps {
  bookId: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  content: string;
  onPageTurn: (direction: "next" | "prev") => void;
  onClose: () => void;
}

// 🌌 Advanced Particle System with Eye Tracking
function ReadingEnergyParticles({ isReading }: { isReading: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 2000;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 8;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      colors[i3] = 0.5 + Math.random() * 0.5;
      colors[i3 + 1] = 0.3 + Math.random() * 0.7;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;

      sizes[i] = Math.random() * 0.15;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const y = positions[i3 + 1];

      // Spiral motion
      const angle = clock.getElapsedTime() * 0.1 + i * 0.01;
      const radius = 5 + Math.sin(clock.getElapsedTime() * 0.5 + i * 0.1) * 1.5;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = y + Math.sin(clock.getElapsedTime() + i) * 0.01;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Reset if too high or low
      if (positions[i3 + 1] > 4) positions[i3 + 1] = -4;
      if (positions[i3 + 1] < -4) positions[i3 + 1] = 4;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Rotation based on reading state
    particlesRef.current.rotation.y += isReading ? 0.001 : 0.0005;
  });

  return (
    <points ref={particlesRef} renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
        <bufferAttribute attach="attributes-size" args={[particles.sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={true}
        sizeAttenuation
      />
    </points>
  );
}

// 📖 Advanced 3D Book with Page Curl Physics
function AdvancedBook({
  leftContent,
  rightContent,
  onLeftClick,
  onRightClick,
  pageNumber,
  isFocusMode,
}: {
  leftContent: string;
  rightContent: string;
  onLeftClick: () => void;
  onRightClick: () => void;
  pageNumber: number;
  isFocusMode: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftPageRef = useRef<THREE.Mesh>(null);
  const rightPageRef = useRef<THREE.Mesh>(null);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);
  const [pageTurning, setPageTurning] = useState(false);

  // GSAP animations
  useGSAP(() => {
    if (!groupRef.current) return;

    // Entrance animation
    gsap.from(groupRef.current.position, {
      y: -5,
      duration: 1.5,
      ease: "power3.out",
    });

    gsap.from(groupRef.current.rotation, {
      x: Math.PI / 2,
      duration: 1.5,
      ease: "power3.out",
    });
  }, []);

  // Page turn animation
  useEffect(() => {
    if (!leftPageRef.current || !rightPageRef.current) return;

    if (pageTurning) {
      gsap.to(rightPageRef.current.rotation, {
        y: -Math.PI,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => setPageTurning(false),
      });
    }
  }, [pageTurning]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Gentle breathing motion
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.08;

    // Subtle rotation when not in focus mode
    if (!isFocusMode) {
      groupRef.current.rotation.y =
        Math.sin(clock.getElapsedTime() * 0.3) * 0.08;
    }

    // Page hover curl effect
    if (leftPageRef.current && leftHovered) {
      leftPageRef.current.rotation.y = THREE.MathUtils.lerp(
        leftPageRef.current.rotation.y,
        -Math.PI * 0.2,
        0.1
      );
    } else if (leftPageRef.current) {
      leftPageRef.current.rotation.y = THREE.MathUtils.lerp(
        leftPageRef.current.rotation.y,
        0,
        0.1
      );
    }

    if (rightPageRef.current && rightHovered) {
      rightPageRef.current.rotation.y = THREE.MathUtils.lerp(
        rightPageRef.current.rotation.y,
        Math.PI * 0.2,
        0.1
      );
    } else if (rightPageRef.current) {
      rightPageRef.current.rotation.y = THREE.MathUtils.lerp(
        rightPageRef.current.rotation.y,
        0,
        0.1
      );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Magical Book Aura */}
        <Sphere args={[3.5, 32, 32]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            transparent
            opacity={0.05}
            distort={0.3}
            speed={2}
            roughness={0.5}
          />
        </Sphere>

        {/* Book Cover/Back */}
        <RoundedBox
          args={[3.2, 4.2, 0.25]}
          position={[0, 0, -0.2]}
          radius={0.08}
          castShadow
        >
          <meshPhysicalMaterial
            color="#1a0b2e"
            metalness={0.9}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#4c1d95"
            emissiveIntensity={0.2}
          />
        </RoundedBox>

        {/* Left Page */}
        <group ref={leftPageRef} position={[-0.8, 0, 0]}>
          <RoundedBox
            args={[1.5, 3.9, 0.03]}
            radius={0.03}
            onPointerOver={() => setLeftHovered(true)}
            onPointerOut={() => setLeftHovered(false)}
            onClick={onLeftClick}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color="#fffef7"
              roughness={0.85}
              metalness={0.05}
              emissive={leftHovered ? "#fff9e6" : "#000000"}
              emissiveIntensity={leftHovered ? 0.15 : 0}
              clearcoat={0.3}
            />
          </RoundedBox>

          {/* Left Page Text */}
          <Text
            position={[0, 0, 0.52]}
            fontSize={0.09}
            maxWidth={1.35}
            textAlign="left"
            color="#000000"
            anchorX="center"
            anchorY="middle"
            renderOrder={999}
            outlineWidth={0.002}
            outlineColor="#ffffff"
          >
            {leftContent}
          </Text>

          {/* Page Number */}
          <Text
            position={[0, -1.8, 0.52]}
            fontSize={0.07}
            color="#000000"
            anchorX="center"
            renderOrder={999}
            outlineWidth={0.001}
            outlineColor="#ffffff"
          >
            {pageNumber}
          </Text>

          {/* Hover Glow */}
          {leftHovered && (
            <pointLight
              position={[0, 0, 0.6]}
              intensity={0.6}
              distance={2.5}
              color="#fef9e7"
              castShadow
            />
          )}
        </group>

        {/* Right Page */}
        <group ref={rightPageRef} position={[0.8, 0, 0]}>
          <RoundedBox
            args={[1.5, 3.9, 0.03]}
            radius={0.03}
            onPointerOver={() => setRightHovered(true)}
            onPointerOut={() => setRightHovered(false)}
            onClick={() => {
              setPageTurning(true);
              onRightClick();
            }}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color="#fffef7"
              roughness={0.85}
              metalness={0.05}
              emissive={rightHovered ? "#fff9e6" : "#000000"}
              emissiveIntensity={rightHovered ? 0.15 : 0}
              clearcoat={0.3}
            />
          </RoundedBox>

          {/* Right Page Text */}
          <Text
            position={[0, 0, 0.52]}
            fontSize={0.09}
            maxWidth={1.35}
            textAlign="left"
            color="#000000"
            anchorX="center"
            anchorY="middle"
            renderOrder={999}
            outlineWidth={0.002}
            outlineColor="#ffffff"
          >
            {rightContent}
            {/* Page Number */}
            <Text
              position={[0, -1.8, 0.52]}
              fontSize={0.07}
              color="#000000"
              anchorX="center"
              renderOrder={999}
              outlineWidth={0.001}
              outlineColor="#ffffff"
            >
              {pageNumber + 1}
            </Text>
            {pageNumber + 1}
          </Text>

          {/* Hover Glow */}
          {rightHovered && (
            <pointLight
              position={[0, 0, 0.6]}
              intensity={0.6}
              distance={2.5}
              color="#fef9e7"
              castShadow
            />
          )}
        </group>

        {/* Book Spine with Gold Embossing */}
        <RoundedBox args={[0.12, 4.2, 0.25]} position={[0, 0, 0]} radius={0.02}>
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.95}
            roughness={0.15}
            emissive="#d4af37"
            emissiveIntensity={0.3}
          />
        </RoundedBox>

        {/* Main Book Light */}
        <pointLight
          position={[0, 0, 2]}
          intensity={0.5}
          distance={6}
          color="#fef9e7"
          castShadow
        />

        {/* Magical Sparkles Around Book */}
        <DreiSparkles
          count={50}
          scale={4}
          size={2}
          speed={0.3}
          color="#8b5cf6"
          opacity={0.6}
        />
      </group>
    </Float>
  );
}

// 🌍 3D Environment Worlds
function EnvironmentWorld({ mode }: { mode: "cosmic" | "library" | "forest" }) {
  if (mode === "cosmic") {
    return (
      <>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0.5}
          fade
          speed={1}
        />
        {/* Removed dark sphere - it was blocking everything! */}
        <color attach="background" args={["#0a0118"]} />
      </>
    );
  }

  if (mode === "library") {
    return (
      <>
        <color attach="background" args={["#1a0f0a"]} />
        <fog attach="fog" args={["#3e2723", 15, 50]} />
      </>
    );
  }

  // Forest mode
  return (
    <>
      <color attach="background" args={["#0a1f0f"]} />
      <fog attach="fog" args={["#064e3b", 20, 50]} />
    </>
  );
}

// 🎥 Dynamic Camera Controller
function CameraController({ isFocusMode }: { isFocusMode: boolean }) {
  const { camera } = useThree();

  useGSAP(() => {
    if (isFocusMode) {
      // Zoom in when focused
      gsap.to(camera.position, {
        z: 4,
        duration: 1.2,
        ease: "power2.inOut",
      });
    } else {
      // Default camera position
      gsap.to(camera.position, {
        z: 7,
        duration: 1.2,
        ease: "power2.inOut",
      });
    }
  }, [isFocusMode]);

  return null;
}

// 🎭 Main Advanced 3D Viewer
export default function AdvancedBook3D({
  bookId,
  title,
  author,
  currentPage,
  totalPages,
  content,
  onPageTurn,
  onClose,
}: AdvancedBook3DProps) {
  const [environment, setEnvironment] = useState<
    "cosmic" | "library" | "forest"
  >("cosmic");
  const [showParticles, setShowParticles] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [showEffects, setShowEffects] = useState(true);

  // Split content into pages
  const wordsPerPage = 350;
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

  // Auto-detect reading state
  useEffect(() => {
    const timer = setTimeout(() => setIsReading(true), 2000);
    return () => clearTimeout(timer);
  }, [currentPage]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Top Controls */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 p-6"
      >
        <div className="flex items-center justify-between">
          {/* Left: Exit & Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-2xl hover:shadow-purple-500/50"
            >
              ← Exit 3D
            </button>

            <div className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
              <p className="text-white font-bold text-lg">{title}</p>
              <p className="text-purple-300 text-sm">{author}</p>
            </div>
          </div>

          {/* Right: Environment & Effects Controls */}
          <div className="flex items-center gap-3">
            {/* Environment Switcher */}
            <button
              onClick={() =>
                setEnvironment((e) =>
                  e === "cosmic"
                    ? "library"
                    : e === "library"
                    ? "forest"
                    : "cosmic"
                )
              }
              className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all"
              title="Change Environment"
            >
              {environment === "cosmic" && (
                <Moon className="w-5 h-5 text-purple-300" />
              )}
              {environment === "library" && (
                <BookOpen className="w-5 h-5 text-amber-300" />
              )}
              {environment === "forest" && (
                <Trees className="w-5 h-5 text-green-300" />
              )}
            </button>

            {/* Particles Toggle */}
            <button
              onClick={() => setShowParticles(!showParticles)}
              className={`p-3 rounded-xl backdrop-blur-xl border transition-all ${
                showParticles
                  ? "bg-purple-500/20 border-purple-400/50"
                  : "bg-white/10 border-white/20"
              }`}
              title="Toggle Particles"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </button>

            {/* Focus Mode */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-3 rounded-xl backdrop-blur-xl border transition-all ${
                isFocusMode
                  ? "bg-pink-500/20 border-pink-400/50"
                  : "bg-white/10 border-white/20"
              }`}
              title="Focus Mode"
            >
              {isFocusMode ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Effects Toggle */}
            <button
              onClick={() => setShowEffects(!showEffects)}
              className={`p-3 rounded-xl backdrop-blur-xl border transition-all ${
                showEffects
                  ? "bg-cyan-500/20 border-cyan-400/50"
                  : "bg-white/10 border-white/20"
              }`}
              title="Toggle Effects"
            >
              <Zap className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={50} />

        {/* Lighting - BOOSTED for visibility! */}
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          color="#ffffff"
          castShadow
        />
        <spotLight
          position={[0, 10, 0]}
          angle={0.5}
          penumbra={1}
          intensity={2.5}
          color="#fef9e7"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={1.2}
          color="#ec4899"
        />
        <pointLight position={[0, -5, 3]} intensity={0.8} color="#ffffff" />

        {/* Environment */}
        <EnvironmentWorld mode={environment} />

        {/* Main Book */}
        <AdvancedBook
          leftContent={leftPageContent}
          rightContent={rightPageContent}
          onLeftClick={handlePrevPage}
          onRightClick={handleNextPage}
          pageNumber={currentPage * 2 + 1}
          isFocusMode={isFocusMode}
        />

        {/* Particle System */}
        {showParticles && <ReadingEnergyParticles isReading={isReading} />}

        {/* Camera Controller */}
        <CameraController isFocusMode={isFocusMode} />

        {/* Post Processing Effects */}
        {showEffects && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={0.5}
            />
            <DepthOfField
              focusDistance={0.01}
              focalLength={0.2}
              bokehScale={isFocusMode ? 6 : 2}
            />
          </EffectComposer>
        )}

        {/* Optional: Orbit Controls for manual camera control */}
        {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
      </Canvas>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 z-20 p-8"
      >
        <div className="flex items-center justify-center gap-6">
          {/* Previous */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
          >
            ← Previous
          </button>

          {/* Page Counter */}
          <div className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
            <p className="text-white font-bold text-center mb-2">
              Pages {currentPage * 2 + 1}-{currentPage * 2 + 2} of {totalPages}
            </p>
            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentPage * 2) / totalPages) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Next */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(totalPages / 2) - 1}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-pink-700 text-white font-bold hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
          >
            Next →
          </button>
        </div>
      </motion.div>

      {/* Reading Stats (Bottom Left) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-8 left-8 z-20"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <p className="text-purple-300 text-sm">Reading Time</p>
              <p className="text-white font-bold">
                {Math.ceil(totalPages / 10)} min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <p className="text-pink-300 text-sm">Progress</p>
              <p className="text-white font-bold">
                {Math.round(((currentPage * 2) / totalPages) * 100)}%
              </p>
            </div>
          </div>

          {isReading && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-green-300 text-sm font-medium">
                Reading Mode Active
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Environment Info (Bottom Right) */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-8 right-8 z-20"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <p className="text-white/60 text-xs mb-2">ENVIRONMENT</p>
          <p className="text-white font-bold text-lg capitalize">
            {environment}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
