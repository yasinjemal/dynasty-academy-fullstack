"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Upload, X, Video } from "lucide-react";

interface VideoBackgroundProps {
  opacity: number;
  blur: number;
  isPlaying: boolean;
  isMuted: boolean;
  selectedVideo: string;
  customVideo: string | null;
  onOpacityChange: (value: number) => void;
  onBlurChange: (value: number) => void;
  onPlayToggle: () => void;
  onMuteToggle: () => void;
  onVideoSelect: (video: string) => void;
  onCustomVideoUpload: (video: string) => void;
  onRemoveCustomVideo: () => void;
}

// Curated ambient effects - Using CSS gradients for performance and reliability
export const ambientVideos = {
  none: {
    name: "None",
    icon: "🚫",
    url: "",
    gradient: "",
    description: "No background video",
  },
  rain: {
    name: "Rain & Thunder",
    icon: "🌧️",
    url: "",
    gradient: "linear-gradient(180deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)",
    description: "Peaceful rain with distant thunder",
  },
  ocean: {
    name: "Ocean Waves",
    icon: "🌊",
    url: "",
    gradient: "linear-gradient(180deg, #005AA7 0%, #FFFDE4 50%, #005AA7 100%)",
    description: "Gentle waves on a beach",
  },
  fireplace: {
    name: "Cozy Fireplace",
    icon: "🔥",
    url: "",
    gradient: "linear-gradient(180deg, #ff4e00 0%, #ec9f05 50%, #ff4e00 100%)",
    description: "Crackling fireplace ambiance",
  },
  space: {
    name: "Space & Stars",
    icon: "✨",
    url: "",
    gradient: "linear-gradient(180deg, #000428 0%, #004e92 50%, #000428 100%)",
    description: "Drifting through the cosmos",
  },
  forest: {
    name: "Forest Nature",
    icon: "🌲",
    url: "",
    gradient: "linear-gradient(180deg, #134E5E 0%, #71B280 50%, #134E5E 100%)",
    description: "Peaceful forest scenery",
  },
  clouds: {
    name: "Moving Clouds",
    icon: "☁️",
    url: "",
    gradient: "linear-gradient(180deg, #bdc3c7 0%, #2c3e50 50%, #bdc3c7 100%)",
    description: "Time-lapse clouds drifting",
  },
  snow: {
    name: "Gentle Snowfall",
    icon: "❄️",
    url: "",
    gradient: "linear-gradient(180deg, #e6dada 0%, #274046 50%, #e6dada 100%)",
    description: "Soft snow falling peacefully",
  },
  city: {
    name: "City Night Lights",
    icon: "🌃",
    url: "",
    gradient: "linear-gradient(180deg, #2C3E50 0%, #FD746C 50%, #2C3E50 100%)",
    description: "Urban night time-lapse",
  },
  sunrise: {
    name: "Sunrise/Sunset",
    icon: "🌅",
    url: "",
    gradient: "linear-gradient(180deg, #FF512F 0%, #F09819 50%, #FF512F 100%)",
    description: "Golden hour beauty",
  },
  abstract: {
    name: "Abstract Patterns",
    icon: "🎨",
    url: "",
    gradient: "linear-gradient(180deg, #8E2DE2 0%, #4A00E0 50%, #8E2DE2 100%)",
    description: "Flowing abstract visuals",
  },
};

export type VideoKey = keyof typeof ambientVideos;

export default function VideoBackground({
  opacity,
  blur,
  isPlaying,
  isMuted,
  selectedVideo,
  customVideo,
  onOpacityChange,
  onBlurChange,
  onPlayToggle,
  onMuteToggle,
  onVideoSelect,
  onCustomVideoUpload,
  onRemoveCustomVideo,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get current video data
  const currentVideo = ambientVideos[selectedVideo as VideoKey];
  const currentVideoUrl = customVideo || currentVideo?.url || "";
  const currentGradient = currentVideo?.gradient || "";

  // Handle play/pause for videos
  useEffect(() => {
    if (!videoRef.current || !currentVideoUrl) return;

    if (isPlaying) {
      videoRef.current.play().catch((err) => {
        console.log("Video play prevented:", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, currentVideoUrl]);

  // Handle mute for videos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle video change
  useEffect(() => {
    if (videoRef.current && currentVideoUrl) {
      setIsLoading(true);
      videoRef.current.load();
    } else {
      setIsLoading(false);
    }
  }, [currentVideoUrl]);

  // Handle custom video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "video/mp4" || file.type === "video/webm")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCustomVideoUpload(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (selectedVideo === "none" && !customVideo) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Animated Gradient Background (for preset themes) */}
      {!customVideo && currentGradient && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            backgroundPosition: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          style={{
            background: currentGradient,
            backgroundSize: "200% 200%",
            opacity: opacity / 100,
            filter: blur > 0 ? `blur(${blur}px)` : "none",
          }}
        />
      )}

      {/* Video Element (for custom uploads) */}
      {customVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          autoPlay
          muted={isMuted}
          crossOrigin="anonymous"
          onLoadedData={() => setIsLoading(false)}
          onCanPlay={() => {
            if (isPlaying && videoRef.current) {
              videoRef.current.play().catch((err) => {
                console.log("Video autoplay failed:", err);
              });
            }
          }}
          onError={(e) => {
            console.error("Video loading error:", e);
            setIsLoading(false);
          }}
          style={{
            opacity: opacity / 100,
            filter: blur > 0 ? `blur(${blur}px)` : "none",
          }}
        >
          <source src={customVideo} type="video/mp4" />
          Your browser does not support video backgrounds.
        </video>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm font-medium">Loading video...</p>
          </div>
        </div>
      )}

      {/* Gradient Overlay for Better Text Readability */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30"
        style={{ opacity: opacity / 100 }}
      />
    </div>
  );
}
