"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  X,
  Video,
  Sliders,
  Eye,
  Droplets,
} from "lucide-react";
import { ambientVideos, VideoKey } from "./VideoBackground";

interface VideoControlsProps {
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

export default function VideoControls({
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
}: VideoControlsProps) {
  const [showVideoSelector, setShowVideoSelector] = useState(false);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "video/mp4" || file.type === "video/webm")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCustomVideoUpload(event.target?.result as string);
        setShowVideoSelector(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
      {/* Main Control Bar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Video Icon Button */}
        <motion.button
          onClick={() => setShowVideoSelector(!showVideoSelector)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-lg transition-all ${
            showVideoSelector
              ? "bg-purple-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title="Select Video"
        >
          <Video className="w-5 h-5" />
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          onClick={onPlayToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </motion.button>

        {/* Mute/Unmute */}
        <motion.button
          onClick={onMuteToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </motion.button>

        {/* Opacity Slider */}
        <div className="flex items-center gap-2 px-3">
          <Eye className="w-4 h-4 text-white/60" />
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
            title={`Opacity: ${opacity}%`}
          />
          <span className="text-xs text-white/80 font-medium w-8">
            {opacity}%
          </span>
        </div>

        {/* Blur Slider */}
        <div className="flex items-center gap-2 px-3 border-l border-white/10">
          <Droplets className="w-4 h-4 text-white/60" />
          <input
            type="range"
            min="0"
            max="20"
            value={blur}
            onChange={(e) => onBlurChange(Number(e.target.value))}
            className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
            title={`Blur: ${blur}px`}
          />
          <span className="text-xs text-white/80 font-medium w-8">
            {blur}px
          </span>
        </div>

        {/* Current Video Name */}
        {selectedVideo !== "none" && (
          <div className="px-3 py-1 bg-white/10 rounded-lg border-l border-white/10">
            <p className="text-xs text-white/80 font-medium">
              {customVideo
                ? "Custom Video"
                : ambientVideos[selectedVideo as VideoKey]?.name || ""}
            </p>
          </div>
        )}
      </motion.div>

      {/* Video Selector Panel */}
      <AnimatePresence>
        {showVideoSelector && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="p-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5" />
                Ambient Videos
              </h3>
              <motion.button
                onClick={() => setShowVideoSelector(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {Object.entries(ambientVideos).map(([key, video]) => (
                <motion.button
                  key={key}
                  onClick={() => {
                    onVideoSelect(key);
                    if (customVideo && key !== "none") {
                      onRemoveCustomVideo();
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedVideo === key && !customVideo
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="text-3xl mb-2">{video.icon}</div>
                  <div className="text-sm font-semibold text-white mb-1">
                    {video.name}
                  </div>
                  <div className="text-xs text-white/60">
                    {video.description}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Custom Video Upload */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Upload Custom Video
                  </h4>
                </div>
                {customVideo && (
                  <motion.button
                    onClick={onRemoveCustomVideo}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded-lg transition-all"
                  >
                    Remove
                  </motion.button>
                )}
              </div>
              <p className="text-xs text-white/60 mb-3">
                Upload your own MP4 or WebM video as background
              </p>
              <label className="block">
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-3 rounded-lg text-center cursor-pointer transition-all ${
                    customVideo
                      ? "bg-green-500/20 border-2 border-green-500/50 text-green-300"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  }`}
                >
                  {customVideo ? (
                    <span className="text-sm font-semibold">
                      ✅ Custom Video Loaded
                    </span>
                  ) : (
                    <span className="text-sm font-semibold">
                      Choose Video File
                    </span>
                  )}
                </motion.div>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
