"use client";

import { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Loader2,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  videoProvider: "youtube" | "vimeo" | "cloudinary" | "custom";
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  lastPosition?: number; // Resume from last position
  autoPlay?: boolean;
  courseId?: string;
  lessonId?: string;
}

/**
 * 🎬 DYNASTY UNIVERSAL VIDEO PLAYER
 *
 * Supports multiple video providers:
 * - YouTube (embedded API)
 * - Vimeo (embedded API)
 * - Cloudinary (direct video)
 * - Custom MP4/WebM files
 *
 * Features:
 * - Auto-resume from last position
 * - Progress tracking
 * - Custom controls
 * - Fullscreen support
 * - Keyboard shortcuts
 */
export function VideoPlayer({
  videoUrl,
  videoProvider,
  onProgress,
  onComplete,
  lastPosition = 0,
  autoPlay = false,
  courseId,
  lessonId,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [hasCompletedThreshold, setHasCompletedThreshold] = useState(false);

  // Auto-save progress every 5 seconds
  useEffect(() => {
    if (!courseId || !lessonId || !duration || duration === 0) return;

    const interval = setInterval(async () => {
      const progress = (currentTime / duration) * 100;
      const watchTime = Math.floor(currentTime);

      // Auto-complete at 95% watched
      const shouldComplete = progress >= 95 && !hasCompletedThreshold;

      try {
        await fetch(`/api/courses/${courseId}/lessons/${lessonId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchTime,
            lastPosition: Math.floor(currentTime),
            progress,
            completed: shouldComplete,
          }),
        });

        if (shouldComplete) {
          setHasCompletedThreshold(true);
          onComplete?.();
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [
    currentTime,
    duration,
    courseId,
    lessonId,
    hasCompletedThreshold,
    onComplete,
  ]);

  // Extract video ID from URL
  const getVideoId = () => {
    if (videoProvider === "youtube") {
      const match = videoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      return match ? match[1] : null;
    }
    if (videoProvider === "vimeo") {
      const match = videoUrl.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : null;
    }
    return videoUrl;
  };

  const videoId = getVideoId();

  // Custom video player (for Cloudinary and custom URLs)
  useEffect(() => {
    if (
      (videoProvider === "cloudinary" || videoProvider === "custom") &&
      videoRef.current
    ) {
      const video = videoRef.current;

      // Set initial position
      if (lastPosition > 0) {
        video.currentTime = lastPosition;
      }

      // Auto play if enabled
      if (autoPlay) {
        video.play().catch(console.error);
        setIsPlaying(true);
      }

      // Event listeners
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);

        // Report progress every 10 seconds
        if (onProgress && Math.floor(video.currentTime) % 10 === 0) {
          onProgress(video.currentTime, video.duration);
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (onComplete) {
          onComplete();
        }
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [videoProvider, lastPosition, autoPlay, onProgress, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 10
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + 10
          );
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // YouTube Player
  if (videoProvider === "youtube" && videoId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?start=${Math.floor(
            lastPosition
          )}&autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo Player
  if (videoProvider === "vimeo" && videoId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full"
          src={`https://player.vimeo.com/video/${videoId}?autoplay=${
            autoPlay ? 1 : 0
          }&title=0&byline=0&portrait=0#t=${Math.floor(lastPosition)}s`}
          title="Vimeo video player"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Custom/Cloudinary Player with Controls
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
        src={videoUrl}
        onClick={togglePlayPause}
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isLoading && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <button
            onClick={togglePlayPause}
            className="w-20 h-20 flex items-center justify-center bg-white/90 rounded-full hover:bg-white transition-all hover:scale-110"
          >
            <Play className="w-10 h-10 text-black ml-1" />
          </button>
        </div>
      )}

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 mb-3 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
        />

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-purple-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-purple-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Settings (placeholder) */}
            <button className="text-white hover:text-purple-400 transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-purple-400 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
