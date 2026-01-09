"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Sparkles,
  Radio,
  Eye,
  MessageCircle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronRight,
  Crown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrainSyncUser {
  id: string;
  name: string;
  image?: string;
  level: number;
  cursor?: { x: number; y: number };
  currentPage?: number;
  isTyping?: boolean;
  isSpeaking?: boolean;
  color: string;
}

interface LivePresenceBarProps {
  users: BrainSyncUser[];
  currentUserId: string;
  onUserClick?: (user: BrainSyncUser) => void;
  onJoinRoom?: () => void;
  contentTitle: string;
}

// Animated Avatar with Presence
const PresenceAvatar = ({
  user,
  isCurrentUser,
  onClick,
  index,
}: {
  user: BrainSyncUser;
  isCurrentUser: boolean;
  onClick?: () => void;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ scale: 0, x: -20 }}
      animate={{ scale: 1, x: 0 }}
      exit={{ scale: 0, x: 20 }}
      transition={{ delay: index * 0.05, type: "spring" }}
      className="relative group"
    >
      <motion.button
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="relative"
        style={{
          marginLeft: index > 0 ? "-8px" : "0",
          zIndex: 10 - index,
        }}
      >
        {/* Avatar */}
        <div
          className={`
            w-10 h-10 rounded-full border-2 overflow-hidden
            ${isCurrentUser ? "border-yellow-400" : "border-slate-800"}
            shadow-lg transition-all
          `}
          style={{
            boxShadow: `0 0 12px ${user.color}50`,
          }}
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Speaking indicator */}
        {user.isSpeaking && (
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
          >
            <Volume2 className="w-2.5 h-2.5 text-white" />
          </motion.div>
        )}

        {/* Typing indicator */}
        {user.isTyping && !user.isSpeaking && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"
          >
            <MessageCircle className="w-2.5 h-2.5 text-white" />
          </motion.div>
        )}

        {/* Level badge */}
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ backgroundColor: user.color }}
        >
          {user.level}
        </div>
      </motion.button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap border border-white/10">
          <span className="font-semibold">{user.name}</span>
          {isCurrentUser && <span className="text-yellow-400 ml-1">(You)</span>}
          {user.currentPage && (
            <span className="text-purple-400 ml-1">
              • Page {user.currentPage}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Pulsing "Live" indicator
const LiveIndicator = ({ count }: { count: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30"
  >
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{ duration: 1, repeat: Infinity }}
      className="w-2 h-2 rounded-full bg-red-500"
    />
    <span className="text-xs font-semibold text-red-400">{count} LIVE</span>
  </motion.div>
);

export default function LivePresenceBar({
  users,
  currentUserId,
  onUserClick,
  onJoinRoom,
  contentTitle,
}: LivePresenceBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const currentUser = users.find((u) => u.id === currentUserId);

  if (users.length <= 1) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-4 z-50"
      >
        <div className="bg-gradient-to-br from-slate-900/95 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              🧠
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-white">Brain Sync</p>
              <p className="text-xs text-purple-300">
                No one else is studying this right now
              </p>
            </div>
          </div>

          <Button
            onClick={onJoinRoom}
            size="sm"
            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs"
          >
            <Radio className="w-3 h-3 mr-1" />
            Start Study Session
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 z-50"
    >
      <motion.div
        layout
        className="bg-gradient-to-br from-slate-900/95 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          className="p-3 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0px rgba(139, 92, 246, 0.5)",
                  "0 0 20px rgba(139, 92, 246, 0.5)",
                  "0 0 0px rgba(139, 92, 246, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-white">Brain Sync</p>
              <p className="text-xs text-purple-300 truncate max-w-[150px]">
                {contentTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LiveIndicator count={users.length} />
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ type: "spring" }}
            >
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </motion.div>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Users */}
              <div className="px-3 pb-3">
                <div className="flex items-center mb-3">
                  <AnimatePresence mode="popLayout">
                    {users.slice(0, 8).map((user, i) => (
                      <PresenceAvatar
                        key={user.id}
                        user={user}
                        isCurrentUser={user.id === currentUserId}
                        onClick={() => onUserClick?.(user)}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>

                  {users.length > 8 && (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs text-white font-bold ml-[-8px]">
                      +{users.length - 8}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-8 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                    onClick={onJoinRoom}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-8 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-300"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div className="px-3 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300">
                    <Users className="w-3 h-3 inline mr-1" />
                    {otherUsers.length} studying with you
                  </span>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-green-400"
                  >
                    ● Connected
                  </motion.span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
