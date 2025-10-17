"use client";

import { useEffect, useRef } from "react";

interface ParticleEffectProps {
  type: "stars" | "fireflies" | "snow" | "sakura" | "sparkles" | "none";
  density: number; // 0-100
  enabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation?: number;
  rotationSpeed?: number;
  color?: string;
  pulsePhase?: number;
}

export default function ParticleEffect({
  type,
  density,
  enabled,
}: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || type === "none") {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Calculate particle count based on density
    const particleCount = Math.floor((density / 100) * 100); // Max 100 particles

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(type, canvas.width, canvas.height));
      }
    };

    initParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Update rotation if applicable
        if (particle.rotation !== undefined && particle.rotationSpeed) {
          particle.rotation += particle.rotationSpeed;
        }

        // Update pulse phase for fireflies
        if (particle.pulsePhase !== undefined) {
          particle.pulsePhase += 0.05;
        }

        // Wrap around screen
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        // Draw particle
        drawParticle(ctx, particle, type);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [type, density, enabled]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: type === "snow" ? "normal" : "screen" }}
    />
  );
}

// Create a particle based on type
function createParticle(
  type: string,
  width: number,
  height: number
): Particle {
  const baseParticle = {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0,
    speedX: 0,
    speedY: 0,
    opacity: 0,
  };

  switch (type) {
    case "stars":
      return {
        ...baseParticle,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      };

    case "fireflies":
      return {
        ...baseParticle,
        size: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: 0.8,
        color: `hsl(${Math.random() * 60 + 30}, 100%, 70%)`, // Yellow-orange
        pulsePhase: Math.random() * Math.PI * 2,
      };

    case "snow":
      return {
        ...baseParticle,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: Math.random() * 1 + 0.5, // Fall down
        opacity: Math.random() * 0.6 + 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      };

    case "sakura":
      return {
        ...baseParticle,
        size: Math.random() * 6 + 4,
        speedX: Math.sin(Math.random() * Math.PI * 2) * 0.3,
        speedY: Math.random() * 0.8 + 0.4, // Gentle fall
        opacity: Math.random() * 0.7 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        color: `hsl(${Math.random() * 30 + 330}, 70%, 85%)`, // Pink
      };

    case "sparkles":
      return {
        ...baseParticle,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        color: `hsl(${Math.random() * 60 + 240}, 100%, 70%)`, // Purple-blue
      };

    default:
      return baseParticle;
  }
}

// Draw particle based on type
function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  type: string
) {
  ctx.save();
  ctx.translate(particle.x, particle.y);

  if (particle.rotation !== undefined) {
    ctx.rotate(particle.rotation);
  }

  switch (type) {
    case "stars":
      // Pulsing star
      const starOpacity =
        particle.opacity *
        (0.5 + 0.5 * Math.sin(particle.pulsePhase || 0));
      ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity})`;
      drawStar(ctx, 0, 0, 5, particle.size, particle.size / 2);
      break;

    case "fireflies":
      // Glowing firefly
      const glowOpacity =
        0.3 + 0.7 * Math.sin(particle.pulsePhase || 0);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 3);
      gradient.addColorStop(0, particle.color || "rgba(255, 200, 0, 1)");
      gradient.addColorStop(0.5, particle.color?.replace("1)", `${glowOpacity})`) || `rgba(255, 200, 0, ${glowOpacity})`);
      gradient.addColorStop(1, "rgba(255, 200, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size * 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "snow":
      // Snowflake
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
      // Add sparkle
      ctx.strokeStyle = `rgba(200, 220, 255, ${particle.opacity * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-particle.size, 0);
      ctx.lineTo(particle.size, 0);
      ctx.moveTo(0, -particle.size);
      ctx.lineTo(0, particle.size);
      ctx.stroke();
      break;

    case "sakura":
      // Cherry blossom petal
      ctx.fillStyle = particle.color || `rgba(255, 182, 193, ${particle.opacity})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Add detail
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(0, -particle.size * 0.2, particle.size * 0.3, particle.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "sparkles":
      // Sparkle/diamond
      const sparkleOpacity =
        particle.opacity *
        (0.4 + 0.6 * Math.abs(Math.sin(particle.pulsePhase || 0)));
      ctx.fillStyle = particle.color?.replace("1)", `${sparkleOpacity})`) || `rgba(168, 85, 247, ${sparkleOpacity})`;
      ctx.beginPath();
      ctx.moveTo(0, -particle.size);
      ctx.lineTo(particle.size * 0.3, 0);
      ctx.lineTo(0, particle.size);
      ctx.lineTo(-particle.size * 0.3, 0);
      ctx.closePath();
      ctx.fill();
      break;
  }

  ctx.restore();
}

// Helper function to draw a star
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}
