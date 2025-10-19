"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface CircularSpectrumProps {
  isActive: boolean;
  stream?: MediaStream;
}

export default function CircularAudioSpectrum({
  isActive,
  stream,
}: CircularSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Setup audio analysis
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyzer.fftSize = 512;
    analyzer.smoothingTimeConstant = 0.85;
    source.connect(analyzer);

    audioContextRef.current = audioContext;
    analyzerRef.current = analyzer;

    // Start visualization
    drawSpectrum();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isActive]);

  const drawSpectrum = () => {
    const canvas = canvasRef.current;
    const analyzer = analyzerRef.current;

    if (!canvas || !analyzer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyzer.getByteFrequencyData(dataArray);

      // Clear with fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw circular spectrum
      const bars = 128;
      const angleStep = (Math.PI * 2) / bars;

      for (let i = 0; i < bars; i++) {
        const value = dataArray[Math.floor((i / bars) * bufferLength)];
        const barHeight = (value / 255) * 120;
        const angle = i * angleStep;

        // Outer circle
        const startX = centerX + Math.cos(angle) * radius;
        const startY = centerY + Math.sin(angle) * radius;
        const endX = centerX + Math.cos(angle) * (radius + barHeight);
        const endY = centerY + Math.sin(angle) * (radius + barHeight);

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, "rgba(168, 85, 247, 0.8)"); // Purple
        gradient.addColorStop(0.5, "rgba(217, 70, 239, 0.6)"); // Fuchsia
        gradient.addColorStop(1, "rgba(6, 182, 212, 0.8)"); // Cyan

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(168, 85, 247, 0.5)";
      }

      // Draw inner circle glow
      ctx.shadowBlur = 30;
      ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Average amplitude for center visualization
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      const pulseRadius = radius - 20 + (average / 255) * 30;

      ctx.shadowBlur = 40;
      ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      const centerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        pulseRadius / 2,
        centerX,
        centerY,
        pulseRadius
      );
      centerGradient.addColorStop(0, "rgba(168, 85, 247, 0.4)");
      centerGradient.addColorStop(1, "rgba(168, 85, 247, 0)");
      ctx.fillStyle = centerGradient;
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;
    };

    draw();
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <canvas ref={canvasRef} width={400} height={400} className="opacity-80" />
    </motion.div>
  );
}
