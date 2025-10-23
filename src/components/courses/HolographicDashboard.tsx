"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  RoundedBox,
  Float,
  MeshDistortMaterial,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PlayCircle,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  progress: number;
  thumbnail?: string;
  lessons: number;
  rating: number;
  color: string;
}

// 🎨 Floating Course Card in 3D Space
function CourseCard3D({
  course,
  position,
  onClick,
}: {
  course: Course;
  position: [number, number, number];
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(clock.getElapsedTime() + position[0]) * 0.1;

      // Rotate slightly when hovered
      if (hovered) {
        meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 2) * 0.1;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        {/* Card Base */}
        <RoundedBox args={[2, 2.5, 0.1]} radius={0.1}>
          <meshPhysicalMaterial
            color={course.color}
            metalness={0.3}
            roughness={0.2}
            transparent
            opacity={0.9}
            clearcoat={1}
          />
        </RoundedBox>

        {/* Glow Effect */}
        {hovered && (
          <RoundedBox args={[2.2, 2.7, 0.15]} radius={0.15}>
            <meshBasicMaterial color={course.color} transparent opacity={0.3} />
          </RoundedBox>
        )}

        {/* Course Title */}
        <Text
          position={[0, 0.8, 0.06]}
          fontSize={0.15}
          maxWidth={1.8}
          textAlign="center"
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {course.title}
        </Text>

        {/* Progress Bar */}
        <mesh position={[0, 0.3, 0.06]}>
          <planeGeometry args={[1.5, 0.08]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
        <mesh
          position={[-(1.5 - (course.progress / 100) * 1.5) / 2, 0.3, 0.07]}
        >
          <planeGeometry args={[(course.progress / 100) * 1.5, 0.08]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>

        {/* Progress Text */}
        <Text
          position={[0, 0.1, 0.06]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          {course.progress}% Complete
        </Text>

        {/* Stats */}
        <Text
          position={[-0.6, -0.2, 0.06]}
          fontSize={0.1}
          color="#9ca3af"
          anchorX="left"
        >
          {course.lessons} Lessons
        </Text>

        <Text
          position={[-0.6, -0.4, 0.06]}
          fontSize={0.1}
          color="#fbbf24"
          anchorX="left"
        >
          ⭐ {course.rating}
        </Text>

        {/* Continue Button */}
        <RoundedBox
          args={[1.2, 0.35, 0.05]}
          radius={0.1}
          position={[0, -0.8, 0.06]}
        >
          <meshStandardMaterial color={hovered ? "#8b5cf6" : "#6d28d9"} />
        </RoundedBox>
        <Text
          position={[0, -0.8, 0.12]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          Continue
        </Text>
      </group>
    </Float>
  );
}

// 🌟 Particle Background
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!pointsRef.current) return;

    const particles = 1000;
    const positions = new Float32Array(particles * 3);

    for (let i = 0; i < particles * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;
    }

    pointsRef.current.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.6} />
    </points>
  );
}

// 🎯 Central Navigation Hub
function NavigationHub() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
        />
      </mesh>

      {/* Orbital Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshBasicMaterial color="#6d28d9" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// 🎭 Main Holographic Dashboard Component
export default function HolographicDashboard() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");
  const [loading, setLoading] = useState(true);

  // Sample course data (replace with real data from API)
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      title: "Master React & Next.js",
      progress: 65,
      lessons: 24,
      rating: 4.9,
      color: "#3b82f6",
    },
    {
      id: "2",
      title: "Advanced TypeScript",
      progress: 40,
      lessons: 18,
      rating: 4.8,
      color: "#8b5cf6",
    },
    {
      id: "3",
      title: "UI/UX Design Mastery",
      progress: 80,
      lessons: 32,
      rating: 5.0,
      color: "#ec4899",
    },
    {
      id: "4",
      title: "3D Web Development",
      progress: 20,
      lessons: 28,
      rating: 4.7,
      color: "#10b981",
    },
    {
      id: "5",
      title: "AI & Machine Learning",
      progress: 55,
      lessons: 36,
      rating: 4.9,
      color: "#f59e0b",
    },
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleCourseClick = (courseId: string) => {
    setSelectedCourse(courseId);
    // Navigate to course page
    setTimeout(() => {
      router.push(`/courses/${courseId}`);
    }, 500);
  };

  // Arrange courses in 3D space
  const getCoursePosition = (
    index: number,
    total: number
  ): [number, number, number] => {
    if (viewMode === "grid") {
      const cols = 3;
      const row = Math.floor(index / cols);
      const col = index % cols;
      return [(col - 1) * 3, 1 - row * 3, 0];
    } else {
      // Carousel - circular arrangement
      const angle = (index / total) * Math.PI * 2;
      const radius = 5;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      {/* 2D UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="container mx-auto px-6 py-8 h-full flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Learning Universe
            </h1>
            <p className="text-purple-300">
              Navigate your courses in 3D space • {courses.length} courses in
              progress
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mt-6 pointer-events-auto"
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-300 hover:bg-white/20"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("carousel")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "carousel"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-300 hover:bg-white/20"
              }`}
            >
              Carousel View
            </button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-auto grid grid-cols-4 gap-4 pointer-events-auto"
          >
            {[
              {
                icon: BookOpen,
                label: "Active Courses",
                value: courses.length,
              },
              { icon: TrendingUp, label: "Avg Progress", value: "52%" },
              { icon: Zap, label: "Learning Streak", value: "12 days" },
              { icon: Star, label: "Achievements", value: "24" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20"
              >
                <stat.icon className="w-6 h-6 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-purple-300">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
          <pointLight
            position={[-10, 10, -10]}
            intensity={0.5}
            color="#ec4899"
          />
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={1}
            intensity={0.5}
            color="#a78bfa"
          />

          {/* Particle Background */}
          <ParticleField />

          {/* Central Navigation Hub */}
          <NavigationHub />

          {/* Course Cards */}
          {courses.map((course, index) => (
            <CourseCard3D
              key={course.id}
              course={course}
              position={getCoursePosition(index, courses.length)}
              onClick={() => handleCourseClick(course.id)}
            />
          ))}

          {/* Camera Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxDistance={20}
            minDistance={5}
          />
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Loading your universe...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
