"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Settings,
  Users,
  Headphones,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceParticipant {
  id: string;
  name: string;
  image?: string;
  color: string;
  isSpeaking: boolean;
  isMuted: boolean;
  volume: number; // 0-100
  audioLevel: number; // 0-1 for visualization
}

interface VoiceChatProps {
  participants: VoiceParticipant[];
  currentUserId: string;
  isConnected: boolean;
  isMicOn: boolean;
  isSpeakerOn: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onJoinVoice: () => void;
  onLeaveVoice: () => void;
  onSetVolume: (userId: string, volume: number) => void;
}

// Audio visualizer bars
const AudioVisualizer = ({
  level,
  color,
  size = "normal",
}: {
  level: number;
  color: string;
  size?: "normal" | "large";
}) => {
  const bars = size === "large" ? 12 : 5;

  return (
    <div
      className={`flex items-end gap-0.5 ${size === "large" ? "h-8" : "h-4"}`}
    >
      {[...Array(bars)].map((_, i) => {
        const barLevel = Math.min(1, level * 1.5 - i * 0.1);
        const height = Math.max(0.2, barLevel);

        return (
          <motion.div
            key={i}
            animate={{
              height: `${height * 100}%`,
              opacity: barLevel > 0 ? 1 : 0.3,
            }}
            transition={{ duration: 0.1 }}
            className={`rounded-full ${size === "large" ? "w-1.5" : "w-1"}`}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
};

// Individual participant card
const ParticipantVoiceCard = ({
  participant,
  isCurrentUser,
  onSetVolume,
}: {
  participant: VoiceParticipant;
  isCurrentUser: boolean;
  onSetVolume: (volume: number) => void;
}) => {
  const [showVolume, setShowVolume] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      className="relative"
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      {/* Avatar with glow effect when speaking */}
      <motion.div
        animate={
          participant.isSpeaking
            ? {
                boxShadow: [
                  `0 0 0px ${participant.color}00`,
                  `0 0 30px ${participant.color}80`,
                  `0 0 0px ${participant.color}00`,
                ],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: participant.isSpeaking ? Infinity : 0,
        }}
        className="relative"
      >
        {/* Ring animation */}
        {participant.isSpeaking && (
          <>
            <motion.div
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: participant.color }}
            />
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: participant.color }}
            />
          </>
        )}

        <div
          className={`
            w-16 h-16 rounded-full overflow-hidden border-3 transition-all
            ${participant.isSpeaking ? "border-green-500" : "border-slate-700"}
            ${participant.isMuted ? "opacity-50" : ""}
          `}
          style={{
            borderColor: participant.isSpeaking ? participant.color : undefined,
          }}
        >
          {participant.image ? (
            <img
              src={participant.image}
              alt={participant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: participant.color }}
            >
              {participant.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Muted indicator */}
        {participant.isMuted && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Speaking indicator */}
        {participant.isSpeaking && !participant.isMuted && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Volume2 className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.div>

      {/* Name and audio level */}
      <div className="mt-2 text-center">
        <p className="text-xs text-white truncate max-w-[64px]">
          {isCurrentUser ? "You" : participant.name.split(" ")[0]}
        </p>
        {participant.isSpeaking && (
          <div className="mt-1 flex justify-center">
            <AudioVisualizer
              level={participant.audioLevel}
              color={participant.color}
            />
          </div>
        )}
      </div>

      {/* Volume control (for others) */}
      {!isCurrentUser && showVolume && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl rounded-lg p-2 border border-white/10 shadow-xl"
        >
          <input
            type="range"
            min="0"
            max="100"
            value={participant.volume}
            onChange={(e) => onSetVolume(parseInt(e.target.value))}
            className="w-20 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <p className="text-xs text-center text-slate-400 mt-1">
            {participant.volume}%
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Mini voice chat (floating)
export function MiniVoiceChat({
  participants,
  isConnected,
  isMicOn,
  isSpeakerOn,
  onToggleMic,
  onToggleSpeaker,
  onLeaveVoice,
  onExpand,
}: {
  participants: VoiceParticipant[];
  isConnected: boolean;
  isMicOn: boolean;
  isSpeakerOn: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onLeaveVoice: () => void;
  onExpand: () => void;
}) {
  const speakingParticipants = participants.filter((p) => p.isSpeaking);

  if (!isConnected) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-3 flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-2 px-3 border-r border-white/10">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className="text-xs text-green-400">Connected</span>
        </div>

        {/* Speaking indicator */}
        <div className="flex items-center gap-2 min-w-[120px]">
          {speakingParticipants.length > 0 ? (
            <>
              <div className="flex -space-x-2">
                {speakingParticipants.slice(0, 3).map((p) => (
                  <motion.div
                    key={p.id}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-6 h-6 rounded-full border-2 border-green-500"
                    style={{ backgroundColor: p.color }}
                  >
                    <span className="text-xs text-white flex items-center justify-center h-full">
                      {p.name.charAt(0)}
                    </span>
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-slate-300">
                {speakingParticipants
                  .map((p) => p.name.split(" ")[0])
                  .join(", ")}
              </span>
            </>
          ) : (
            <span className="text-xs text-slate-500">No one speaking</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMic}
            className={`w-10 h-10 rounded-full ${
              isMicOn ? "bg-slate-800 text-white" : "bg-red-500/20 text-red-400"
            }`}
          >
            {isMicOn ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSpeaker}
            className={`w-10 h-10 rounded-full ${
              isSpeakerOn
                ? "bg-slate-800 text-white"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {isSpeakerOn ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="w-10 h-10 rounded-full bg-slate-800 text-white"
          >
            <Users className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaveVoice}
            className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>

        {/* Participant count */}
        <div className="flex items-center gap-1 px-3 border-l border-white/10">
          <Headphones className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white">{participants.length}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Full voice chat panel
export default function VoiceChat({
  participants,
  currentUserId,
  isConnected,
  isMicOn,
  isSpeakerOn,
  onToggleMic,
  onToggleSpeaker,
  onJoinVoice,
  onLeaveVoice,
  onSetVolume,
}: VoiceChatProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isConnected ? 360 : 0 }}
              transition={{
                duration: 2,
                repeat: isConnected ? Infinity : 0,
                ease: "linear",
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isConnected ? "bg-green-500/20" : "bg-slate-800"
              }`}
            >
              {isConnected ? (
                <Radio className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-slate-400" />
              )}
            </motion.div>
            <div>
              <h3 className="font-medium text-white text-sm">Voice Chat</h3>
              <p className="text-xs text-slate-400">
                {isConnected
                  ? `${participants.length} in call`
                  : "Not connected"}
              </p>
            </div>
          </div>

          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!isConnected ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4"
            >
              <Headphones className="w-10 h-10 text-purple-400" />
            </motion.div>
            <p className="text-slate-300 mb-2">Join voice chat?</p>
            <p className="text-xs text-slate-500 mb-4 max-w-[200px]">
              Talk with other learners while studying together
            </p>
            <Button
              onClick={onJoinVoice}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Phone className="w-4 h-4 mr-2" />
              Join Voice
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <AnimatePresence>
              {participants.map((participant) => (
                <ParticipantVoiceCard
                  key={participant.id}
                  participant={participant}
                  isCurrentUser={participant.id === currentUserId}
                  onSetVolume={(volume) => onSetVolume(participant.id, volume)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Controls */}
      {isConnected && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={onToggleMic}
              variant={isMicOn ? "default" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 ${
                isMicOn
                  ? "bg-purple-600 hover:bg-purple-500"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              {isMicOn ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              onClick={onToggleSpeaker}
              variant="ghost"
              size="lg"
              className="rounded-full w-14 h-14 bg-slate-800 hover:bg-slate-700"
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-red-400" />
              )}
            </Button>

            <Button
              onClick={onLeaveVoice}
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-500"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-3">
            {isMicOn ? "Your mic is on" : "Your mic is muted"}
          </p>
        </div>
      )}
    </div>
  );
}
