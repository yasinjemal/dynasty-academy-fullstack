"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Volume2,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleUser {
  id: string;
  name: string;
  image?: string;
  level: number;
  isSpeaking?: boolean;
  isTyping?: boolean;
  color?: string;
}

interface SimplePresenceBarProps {
  users: SimpleUser[];
  onOpenRoom?: () => void;
  // Mobile page navigation props
  currentPage?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

// Simple avatar
const SimpleAvatar = ({ user, index }: { user: SimpleUser; index: number }) => {
  const colors = [
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#EF4444",
    "#06B6D4",
    "#84CC16",
  ];
  const color = user.color || colors[index % colors.length];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
      style={{ marginLeft: index > 0 ? "-8px" : 0, zIndex: 10 - index }}
    >
      <div
        className="w-9 h-9 rounded-full border-2 border-slate-900 overflow-hidden shadow-lg"
        style={{ boxShadow: `0 0 10px ${color}40` }}
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
            style={{ backgroundColor: color }}
          >
            {user.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {user.isSpeaking && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
        >
          <Volume2 className="w-2.5 h-2.5 text-white" />
        </motion.div>
      )}

      {/* Typing indicator */}
      {user.isTyping && !user.isSpeaking && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <MessageCircle className="w-2.5 h-2.5 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default function SimplePresenceBar({
  users,
  onOpenRoom,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: SimplePresenceBarProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (users.length === 0) return null;

  const displayUsers = users.slice(0, 6);
  const mobileDisplayUsers = users.slice(0, 4);
  const remainingCount = Math.max(0, users.length - 6);
  const mobileRemainingCount = Math.max(0, users.length - 4);
  const speakingUsers = users.filter((u) => u.isSpeaking);
  const showPageNav = currentPage !== undefined && totalPages !== undefined;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] sm:w-auto max-w-[95vw]"
    >
      <motion.div
        layout
        className="bg-slate-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Expanded view */}
        <AnimatePresence mode="wait">
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-2 sm:p-4"
            >
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
                {/* Mobile Page Navigation - Only shows on mobile */}
                {showPageNav && (
                  <div className="flex md:hidden items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onPrevPage}
                      disabled={currentPage === 1}
                      className="w-8 h-8 p-0 text-slate-400 hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      <BookOpen className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-white font-medium">
                        {currentPage}/{totalPages}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onNextPage}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 p-0 text-slate-400 hover:text-white disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Live indicator */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/20 rounded-full border border-red-500/30">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                  <span className="text-[10px] sm:text-xs font-bold text-red-400">
                    {users.length} LIVE
                  </span>
                </div>

                {/* Avatars - Desktop */}
                <div className="hidden sm:flex items-center">
                  {displayUsers.map((user, i) => (
                    <SimpleAvatar key={user.id} user={user} index={i} />
                  ))}
                  {remainingCount > 0 && (
                    <div
                      className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs text-white font-bold"
                      style={{ marginLeft: "-8px" }}
                    >
                      +{remainingCount}
                    </div>
                  )}
                </div>

                {/* Avatars - Mobile (smaller, fewer) */}
                <div className="flex sm:hidden items-center">
                  {mobileDisplayUsers.map((user, i) => (
                    <div
                      key={user.id}
                      className="relative"
                      style={{ marginLeft: i > 0 ? "-6px" : 0, zIndex: 10 - i }}
                    >
                      <div
                        className="w-7 h-7 rounded-full border-2 border-slate-900 overflow-hidden"
                        style={{ backgroundColor: user.color || "#8B5CF6" }}
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {mobileRemainingCount > 0 && (
                    <div
                      className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ marginLeft: "-6px" }}
                    >
                      +{mobileRemainingCount}
                    </div>
                  )}
                </div>

                {/* Speaking indicator - Hidden on mobile */}
                {speakingUsers.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                    <Volume2 className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">
                      {speakingUsers
                        .map((u) => u.name.split(" ")[0])
                        .join(", ")}
                    </span>
                  </div>
                )}

                {/* View all button */}
                <Button
                  size="sm"
                  onClick={onOpenRoom}
                  className="h-7 sm:h-8 px-2 sm:px-3 bg-purple-600 hover:bg-purple-500"
                >
                  <Eye className="w-3 h-3 sm:mr-1" />
                  <span className="hidden sm:inline">Open Chat</span>
                </Button>

                {/* Minimize button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                  className="h-7 sm:h-8 w-7 sm:w-8 p-0 text-slate-400 hover:text-white"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized view */}
        {isMinimized && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors"
          >
            <div className="flex -space-x-2">
              {displayUsers.slice(0, 3).map((user, i) => (
                <div
                  key={user.id}
                  className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs text-white"
                  style={{
                    backgroundColor:
                      user.color || ["#8B5CF6", "#EC4899", "#F59E0B"][i % 3],
                  }}
                >
                  {user.name.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-xs text-slate-400">
              {users.length} studying
            </span>
            <ChevronUp className="w-4 h-4 text-slate-400" />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
