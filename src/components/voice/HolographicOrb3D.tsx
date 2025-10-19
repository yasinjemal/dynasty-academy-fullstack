"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface HolographicOrbProps {
  isListening: boolean;
  isProcessing: boolean;
}

function AnimatedOrb({ isListening, isProcessing }: HolographicOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const time = state.clock.getElapsedTime();

    // Rotate the orb
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;

    // Pulsate when listening or processing
    if (isListening || isProcessing) {
      const scale = 1 + Math.sin(time * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);

      // Change distortion
      materialRef.current.distort = 0.3 + Math.sin(time * 2) * 0.2;
      materialRef.current.speed = 2 + Math.sin(time) * 0.5;
    } else {
      meshRef.current.scale.setScalar(1);
      materialRef.current.distort = 0.2;
      materialRef.current.speed = 1;
    }
  });

  return (
    <Sphere args={[1, 64, 64]} ref={meshRef}>
      <MeshDistortMaterial
        ref={materialRef}
        color={isProcessing ? "#fbbf24" : isListening ? "#a855f7" : "#6b7280"}
        attach="material"
        distort={0.2}
        speed={1}
        roughness={0.2}
        metalness={0.8}
        emissive={
          isProcessing ? "#fbbf24" : isListening ? "#a855f7" : "#374151"
        }
        emissiveIntensity={isListening || isProcessing ? 0.5 : 0.2}
      />
    </Sphere>
  );
}

export default function HolographicOrb3D({
  isListening,
  isProcessing,
}: HolographicOrbProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#a855f7"
        />
        <AnimatedOrb isListening={isListening} isProcessing={isProcessing} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!isListening && !isProcessing}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
