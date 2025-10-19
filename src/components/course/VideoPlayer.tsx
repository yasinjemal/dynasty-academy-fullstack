"use client";

import { useRef, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Loader2,
} from "lucide-react";
import { dynastyAI } from "@/lib/intelligence/DynastyIntelligenceEngine";

interface VideoPlayerProps {
  videoUrl: string;
  videoProvider: "youtube" | "vimeo" | "cloudinary" | "custom";
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  lastPosition?: number; // Resume from last position
  autoPlay?: boolean;
  courseId?: string;
  lessonId?: string;
  // 🎬 NEW: Section timestamps for YouTube videos
  startTime?: number; // Start time in seconds
  endTime?: number; // End time in seconds
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
  startTime,
  endTime,
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

  // 🧠 Dynasty Intelligence tracking
  const { data: session } = useSession();
  const [watchStartTime, setWatchStartTime] = useState<number>(0);
  const [totalWatchTime, setTotalWatchTime] = useState<number>(0);
  const [pauseCount, setPauseCount] = useState<number>(0);
  const [seekCount, setSeekCount] = useState<number>(0);

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

  // 🧠 Dynasty Intelligence Tracking Functions
  const calculateEngagement = (
    watchDuration: number,
    videoTime: number
  ): number => {
    // High engagement: watched continuously without too many pauses
    if (pauseCount === 0 && watchDuration > 0) return 1.0;
    if (pauseCount <= 2 && watchDuration > videoTime * 0.8) return 0.9;
    if (pauseCount <= 5 && watchDuration > videoTime * 0.6) return 0.7;
    if (pauseCount > 10) return 0.4; // Many pauses = low engagement
    return 0.5; // Default moderate engagement
  };

  const trackPlayEvent = async () => {
    if (!session?.user || !courseId || !lessonId) return;

    setWatchStartTime(Date.now());

    // Track play event
    try {
      await dynastyAI.trackEvent({
        userId: session.user.id,
        courseId: courseId,
        lessonId: lessonId,
        type: "video_watch",
        duration: 0,
        engagement: 0.8, // Starting engagement
        metadata: {
          action: "play",
          videoTime: currentTime,
          videoProvider,
        },
      });
    } catch (error) {
      console.error("Failed to track play event:", error);
    }
  };

  const trackPauseEvent = async () => {
    if (!session?.user || !courseId || !lessonId || watchStartTime === 0)
      return;

    const watchDuration = (Date.now() - watchStartTime) / 1000; // seconds
    setTotalWatchTime((prev) => prev + watchDuration);
    setPauseCount((prev) => prev + 1);

    // Track pause event with engagement calculation
    try {
      await dynastyAI.trackEvent({
        userId: session.user.id,
        courseId: courseId,
        lessonId: lessonId,
        type: "video_watch",
        duration: watchDuration,
        engagement: calculateEngagement(watchDuration, currentTime),
        metadata: {
          action: "pause",
          videoTime: currentTime,
          totalWatchTime: totalWatchTime + watchDuration,
          pauseCount: pauseCount + 1,
          videoProvider,
        },
      });
    } catch (error) {
      console.error("Failed to track pause event:", error);
    }
  };

  const trackSeekEvent = async (oldTime: number, newTime: number) => {
    if (!session?.user || !courseId || !lessonId) return;

    setSeekCount((prev) => prev + 1);

    // Detect replay (seeking backward)
    const isReplay = newTime < oldTime;

    try {
      await dynastyAI.trackEvent({
        userId: session.user.id,
        courseId: courseId,
        lessonId: lessonId,
        type: "video_watch",
        duration: 0,
        engagement: isReplay ? 0.5 : 0.7, // Replay = struggling, skip = moderate
        metadata: {
          action: isReplay ? "replay" : "seek",
          oldTime,
          newTime,
          seekDistance: Math.abs(newTime - oldTime),
          seekCount: seekCount + 1,
          videoProvider,
        },
      });
    } catch (error) {
      console.error("Failed to track seek event:", error);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        await trackPauseEvent();
      } else {
        videoRef.current.play();
        await trackPlayEvent();
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

  const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const oldTime = currentTime;

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      // Track seek event
      if (Math.abs(newTime - oldTime) > 2) {
        // Only track significant seeks
        await trackSeekEvent(oldTime, newTime);
      }
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
    // Use startTime if provided, otherwise use lastPosition
    const seekToTime =
      startTime !== undefined ? startTime : Math.floor(lastPosition);

    // Build YouTube URL with parameters
    const youtubeParams = new URLSearchParams({
      start: seekToTime.toString(),
      autoplay: autoPlay ? "1" : "0",
      rel: "0",
      modestbranding: "1",
    });

    // Add end time if provided (for sectioned videos)
    if (endTime !== undefined) {
      youtubeParams.append("end", Math.floor(endTime).toString());
    }

    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        {/* Section Info Badge */}
        {startTime !== undefined && endTime !== undefined && (
          <div className="absolute top-4 left-4 z-10 bg-purple-600/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-400/30">
            <div className="text-white text-sm font-semibold flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Section: {formatTime(startTime)} - {formatTime(endTime)}
              </span>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?${youtubeParams.toString()}`}
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
