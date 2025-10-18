"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  X,
  Video,
} from "lucide-react";

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

// Curated ambient videos with free sources
export const ambientVideos = {
  none: {
    name: "None",
    icon: "🚫",
    url: "",
    description: "No background video",
  },
  rain: {
    name: "Rain & Thunder",
    icon: "🌧️",
    url: "https://cdn.pixabay.com/vimeo/401879315/Rain.mp4?width=1280&hash=76c5e06de2b0921ac7f4ee84bd1d1a01d96dcc0e",
    description: "Peaceful rain with distant thunder",
  },
  ocean: {
    name: "Ocean Waves",
    icon: "🌊",
    url: "https://cdn.pixabay.com/vimeo/370802760/Ocean.mp4?width=1280&hash=15a2c6c32e75e4d3b8e76dce2c6d4b2e7a4c8e9f",
    description: "Gentle waves on a beach",
  },
  fireplace: {
    name: "Cozy Fireplace",
    icon: "🔥",
    url: "https://cdn.pixabay.com/vimeo/449878202/fireplace.mp4?width=1280&hash=a5c8e06de2b0921ac7f4ee84bd1d1a01d96dcc0e",
    description: "Crackling fireplace ambiance",
  },
  space: {
    name: "Space & Stars",
    icon: "✨",
    url: "https://cdn.pixabay.com/vimeo/476746611/space.mp4?width=1280&hash=b6d9f17ef3c1a32bd8f5ff95ce2e2b3f8e5d9f0g",
    description: "Drifting through the cosmos",
  },
  forest: {
    name: "Forest Nature",
    icon: "🌲",
    url: "https://cdn.pixabay.com/vimeo/411292381/Forest.mp4?width=1280&hash=c7e0g28fg4d2b43ce9g6gg06df3f3c4g9f6e0g1h",
    description: "Peaceful forest scenery",
  },
  clouds: {
    name: "Moving Clouds",
    icon: "☁️",
    url: "https://cdn.pixabay.com/vimeo/364019915/clouds.mp4?width=1280&hash=d8f1h39gh5e3c54df0h7hh17eg4g4d5h0g7f1h2i",
    description: "Time-lapse clouds drifting",
  },
  snow: {
    name: "Gentle Snowfall",
    icon: "❄️",
    url: "https://cdn.pixabay.com/vimeo/494384663/snow.mp4?width=1280&hash=e9g2i40hi6f4d65eg1i8ii28fh5h5e6i1h8g2i3j",
    description: "Soft snow falling peacefully",
  },
  city: {
    name: "City Night Lights",
    icon: "🌃",
    url: "https://cdn.pixabay.com/vimeo/351001313/city.mp4?width=1280&hash=f0h3j51ij7g5e76fh2j9jj39gi6i6f7j2i9h3j4k",
    description: "Urban night time-lapse",
  },
  sunrise: {
    name: "Sunrise/Sunset",
    icon: "🌅",
    url: "https://cdn.pixabay.com/vimeo/388367969/sunrise.mp4?width=1280&hash=g1i4k62jk8h6f87gi3k0kk40hj7j7g8k3j0i4k5l",
    description: "Golden hour beauty",
  },
  abstract: {
    name: "Abstract Patterns",
    icon: "🎨",
    url: "https://cdn.pixabay.com/vimeo/456123789/abstract.mp4?width=1280&hash=h2j5l73kl9i7g98hj4l1ll51ik8k8h9l4k1j5l6m",
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get current video URL
  const currentVideoUrl = customVideo || ambientVideos[selectedVideo as VideoKey]?.url || "";

  // Handle play/pause
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play().catch((err) => {
        console.log("Video play prevented:", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Handle mute
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
      {/* Video Element */}
      {currentVideoUrl && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onLoadedData={() => setIsLoading(false)}
          onCanPlay={() => {
            if (isPlaying && videoRef.current) {
              videoRef.current.play().catch(console.log);
            }
          }}
          style={{
            opacity: opacity / 100,
            filter: blur > 0 ? `blur(${blur}px)` : "none",
          }}
        >
          <source src={currentVideoUrl} type="video/mp4" />
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
