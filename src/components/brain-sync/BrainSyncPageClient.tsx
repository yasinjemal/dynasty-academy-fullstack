"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Settings,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Share2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BrainSyncDiscovery from "@/components/brain-sync/BrainSyncDiscovery";
import BrainSyncRoom from "@/components/brain-sync/BrainSyncRoom";
import { MultiplayerCursors } from "@/components/brain-sync/MultiplayerCursor";
import SimplePresenceBar from "@/components/brain-sync/SimplePresenceBar";

// Random colors for users
const USER_COLORS = [
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

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

interface BrainSyncMessage {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  timestamp: Date;
  type: "text" | "highlight" | "reaction" | "system";
}

interface SharedHighlight {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  pageNumber: number;
  text: string;
  note?: string;
  reactions: { emoji: string; userId: string }[];
}

export default function BrainSyncPageClient() {
  const [view, setView] = useState<"discovery" | "room">("discovery");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<BrainSyncUser>({
    id: "current-user",
    name: "You",
    level: 15,
    color: USER_COLORS[0],
  });

  // Room state
  const [users, setUsers] = useState<BrainSyncUser[]>([]);
  const [messages, setMessages] = useState<BrainSyncMessage[]>([]);
  const [highlights, setHighlights] = useState<SharedHighlight[]>([]);
  const [cursors, setCursors] = useState<BrainSyncUser[]>([]);

  // Audio state
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // UI state
  const [isRoomPanelOpen, setIsRoomPanelOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Simulate joining a room
  const handleJoinRoom = useCallback(
    (roomId: string) => {
      setCurrentRoomId(roomId);
      setView("room");

      // Simulate users joining
      const simulatedUsers: BrainSyncUser[] = [
        currentUser,
        {
          id: "user-1",
          name: "Alex Chen",
          level: 23,
          color: USER_COLORS[1],
          cursor: { x: 400, y: 300 },
        },
        {
          id: "user-2",
          name: "Sarah Johnson",
          level: 18,
          color: USER_COLORS[2],
          cursor: { x: 600, y: 450 },
          isSpeaking: true,
        },
        {
          id: "user-3",
          name: "Mike Wilson",
          level: 31,
          color: USER_COLORS[3],
          isTyping: true,
        },
      ];

      setUsers(simulatedUsers);
      setCursors(simulatedUsers.filter((u) => u.cursor));

      // Welcome message
      setMessages([
        {
          id: "msg-0",
          userId: "system",
          userName: "System",
          content: "You joined the session! 🎉",
          timestamp: new Date(),
          type: "system",
        },
        {
          id: "msg-1",
          userId: "user-1",
          userName: "Alex Chen",
          content: "Hey everyone! Ready to learn together?",
          timestamp: new Date(Date.now() - 60000),
          type: "text",
        },
        {
          id: "msg-2",
          userId: "user-2",
          userName: "Sarah Johnson",
          content: "This chapter is 🔥",
          timestamp: new Date(Date.now() - 30000),
          type: "text",
        },
      ]);

      // Sample highlights
      setHighlights([
        {
          id: "h-1",
          userId: "user-1",
          userName: "Alex Chen",
          userColor: USER_COLORS[1],
          pageNumber: 42,
          text: "The key insight is that neural networks learn representations, not rules.",
          note: "This changed how I think about ML!",
          reactions: [
            { emoji: "🔥", userId: "user-2" },
            { emoji: "💡", userId: "user-3" },
          ],
        },
      ]);
    },
    [currentUser]
  );

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: BrainSyncMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userImage: currentUser.image,
      content,
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          userId: "user-1",
          userName: "Alex Chen",
          content: "Great point! 👍",
          timestamp: new Date(),
          type: "text",
        },
      ]);
    }, 2000);
  };

  const handleLeaveRoom = () => {
    setView("discovery");
    setCurrentRoomId(null);
    setUsers([]);
    setMessages([]);
    setHighlights([]);
  };

  const handleHighlightReaction = (highlightId: string, emoji: string) => {
    setHighlights((prev) =>
      prev.map((h) => {
        if (h.id === highlightId) {
          const existingReaction = h.reactions.find(
            (r) => r.userId === currentUser.id && r.emoji === emoji
          );
          if (existingReaction) {
            return {
              ...h,
              reactions: h.reactions.filter(
                (r) => !(r.userId === currentUser.id && r.emoji === emoji)
              ),
            };
          }
          return {
            ...h,
            reactions: [...h.reactions, { emoji, userId: currentUser.id }],
          };
        }
        return h;
      })
    );
  };

  // Simulate cursor movement from other users
  useEffect(() => {
    if (view !== "room") return;

    const interval = setInterval(() => {
      setCursors((prev) =>
        prev.map((cursor) => ({
          ...cursor,
          cursor: cursor.cursor
            ? {
                x: cursor.cursor.x + (Math.random() - 0.5) * 50,
                y: cursor.cursor.y + (Math.random() - 0.5) * 50,
              }
            : undefined,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [view]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/brain-sync?room=${currentRoomId}`
    );
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Discovery View */}
      {view === "discovery" && (
        <>
          {/* Back button */}
          <div className="fixed top-6 left-6 z-50">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>

          <BrainSyncDiscovery
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />
        </>
      )}

      {/* Room View */}
      {view === "room" && (
        <div className="min-h-screen relative">
          {/* Top bar */}
          <div className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLeaveRoom}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="font-bold text-white">Brain Sync Session</h1>
                    <p className="text-xs text-slate-400">
                      Learning together in real-time
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Invite link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-slate-400 hover:text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite
                </Button>

                {/* Quick audio controls */}
                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={isMicOn ? "text-green-400" : "text-slate-400"}
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
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={
                      isSpeakerOn ? "text-green-400" : "text-slate-400"
                    }
                  >
                    {isSpeakerOn ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area (where the book/course content would go) */}
          <div className="pt-20 pb-8 px-6">
            <div className="max-w-4xl mx-auto">
              {/* Placeholder for actual content */}
              <div className="bg-slate-800/30 rounded-2xl border border-white/10 p-8 min-h-[70vh]">
                <div className="text-center py-20">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-6"
                  >
                    📖
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Study Content Area
                  </h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    This is where your book, course, or lesson content would
                    appear. Everyone in the session sees the same content and
                    can highlight, comment, and discuss in real-time!
                  </p>

                  {/* Demo instruction */}
                  <div className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 max-w-md mx-auto">
                    <p className="text-sm text-purple-300">
                      💡 Tip: Open the Brain Sync panel on the right to chat
                      with other learners, see shared highlights, and join voice
                      chat!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Multiplayer Cursors */}
          <MultiplayerCursors
            cursors={cursors.map((u) => ({
              userId: u.id,
              userName: u.name,
              color: u.color,
              x: u.cursor?.x || 0,
              y: u.cursor?.y || 0,
              isTyping: u.isTyping,
            }))}
            currentUserId={currentUser.id}
          />

          {/* Presence bar */}
          <SimplePresenceBar
            users={users.map((u) => ({
              id: u.id,
              name: u.name,
              image: u.image,
              level: u.level,
              color: u.color,
              isSpeaking: u.isSpeaking,
              isTyping: u.isTyping,
            }))}
            onOpenRoom={() => setIsRoomPanelOpen(true)}
          />

          {/* Room Panel */}
          <BrainSyncRoom
            roomId={currentRoomId || ""}
            contentTitle="Advanced Python Patterns"
            users={users}
            messages={messages}
            highlights={highlights}
            currentUserId={currentUser.id}
            currentUserColor={currentUser.color}
            onSendMessage={handleSendMessage}
            onToggleMic={() => setIsMicOn(!isMicOn)}
            onToggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
            onLeaveRoom={handleLeaveRoom}
            onHighlightReaction={handleHighlightReaction}
            isMicOn={isMicOn}
            isSpeakerOn={isSpeakerOn}
            isOpen={isRoomPanelOpen}
            onClose={() => setIsRoomPanelOpen(false)}
          />

          {/* Copy toast */}
          <AnimatePresence>
            {showCopyToast && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Link copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Start a Brain Sync Session
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Session Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Python Deep Dive 🐍"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    What will you study?
                  </label>
                  <select className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="">Select content...</option>
                    <option value="course-1">Advanced Python Patterns</option>
                    <option value="course-2">React Fundamentals</option>
                    <option value="book-1">Clean Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    defaultValue={8}
                    min={2}
                    max={20}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-white/10 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-300">
                    Private session (invite only)
                  </span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    handleJoinRoom("new-room");
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
