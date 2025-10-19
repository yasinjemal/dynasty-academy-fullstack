"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Volume2, VolumeX, Play, Pause } from "lucide-react";

interface GestureProps {
  onGestureDetected?: (gesture: string) => void;
  enabled: boolean;
}

export default function GestureRecognition({
  onGestureDetected,
  enabled,
}: GestureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsActive(false);
      return;
    }

    // Simple hand tracking using video stream + canvas analysis
    let stream: MediaStream | null = null;
    let animationId: number | null = null;

    const startGestureDetection = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsActive(true);
          detectGestures();
        }
      } catch (error) {
        console.error("Camera access denied:", error);
      }
    };

    const detectGestures = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const analyze = () => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Simple motion detection algorithm
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Analyze image for hand-like movements
          let totalBrightness = 0;
          let brightPixels = 0;

          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            totalBrightness += brightness;
            if (brightness > 150) brightPixels++;
          }

          const avgBrightness = totalBrightness / (data.length / 4);
          const brightRatio = brightPixels / (data.length / 4);

          // Simple gesture detection based on brightness patterns
          let detectedGesture: string | null = null;

          if (brightRatio > 0.4 && avgBrightness > 120) {
            detectedGesture = "palm_open"; // Open palm (bright, large area)
          } else if (brightRatio < 0.2 && avgBrightness < 80) {
            detectedGesture = "fist"; // Closed fist (dark, small area)
          } else if (brightRatio > 0.25 && brightRatio < 0.35) {
            detectedGesture = "peace"; // Peace sign or pointing
          }

          if (detectedGesture && detectedGesture !== lastGesture) {
            setLastGesture(detectedGesture);
            onGestureDetected?.(detectedGesture);

            // Auto-clear after 2 seconds
            setTimeout(() => setLastGesture(null), 2000);
          }
        }

        animationId = requestAnimationFrame(analyze);
      };

      analyze();
    };

    if (enabled) {
      startGestureDetection();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled, lastGesture, onGestureDetected]);

  const gestureIcons: Record<string, React.ReactNode> = {
    palm_open: <Hand className="w-8 h-8" />,
    fist: <VolumeX className="w-8 h-8" />,
    peace: <Play className="w-8 h-8" />,
  };

  const gestureLabels: Record<string, string> = {
    palm_open: "Stop / Pause",
    fist: "Mute / Close",
    peace: "Continue / Play",
  };

  if (!enabled) return null;

  return (
    <>
      {/* Hidden video stream */}
      <video
        ref={videoRef}
        className="hidden"
        width={320}
        height={240}
        autoPlay
        muted
        playsInline
      />

      {/* Hidden canvas for analysis */}
      <canvas ref={canvasRef} className="hidden" width={320} height={240} />

      {/* Gesture Status Indicator */}
      <motion.button
        onClick={() => setShowPreview(!showPreview)}
        className="fixed bottom-32 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border-2 border-cyan-400/30 flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isActive
            ? [
                "0 0 20px rgba(6, 182, 212, 0.3)",
                "0 0 40px rgba(6, 182, 212, 0.6)",
                "0 0 20px rgba(6, 182, 212, 0.3)",
              ]
            : [],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
          },
        }}
      >
        <Hand
          className={`w-6 h-6 ${isActive ? "text-cyan-400" : "text-white/60"}`}
        />
      </motion.button>

      {/* Gesture Detection Feedback */}
      <AnimatePresence>
        {lastGesture && (
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
          >
            <div className="bg-gradient-to-br from-cyan-500/90 to-blue-500/90 backdrop-blur-xl border-2 border-white/20 rounded-3xl px-8 py-6 shadow-2xl">
              <motion.div
                className="flex flex-col items-center gap-4 text-white"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
              >
                {gestureIcons[lastGesture]}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    Gesture Detected
                  </div>
                  <div className="text-sm opacity-80">
                    {gestureLabels[lastGesture]}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Preview (optional) */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed bottom-48 left-6 z-50 w-64 bg-black/90 backdrop-blur-xl border border-cyan-400/30 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            <div className="p-3">
              <div className="text-xs text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                <Hand className="w-4 h-4" />
                Gesture Detection Active
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-3 border border-cyan-400/20">
                <div className="text-xs text-white/70 space-y-1">
                  <div className="flex items-center gap-2">
                    <Hand className="w-3 h-3" /> Open Palm = Stop/Pause
                  </div>
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-3 h-3" /> Fist = Mute/Close
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3" /> Peace Sign = Play/Continue
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
