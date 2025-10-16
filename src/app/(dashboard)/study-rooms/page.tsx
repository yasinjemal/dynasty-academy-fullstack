"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Video,
  Mic,
  MicOff,
  VideoOff,
  MessageSquare,
  Share2,
  UserPlus,
  Crown,
  Clock,
  BookOpen,
  Code,
  Pencil,
  X,
  Maximize2,
  Coffee,
  Zap,
  Trophy,
  LogOut,
} from "lucide-react";

interface StudyRoom {
  id: string;
  name: string;
  topic: string;
  creator: string;
  participants: Participant[];
  maxParticipants: number;
  isPublic: boolean;
  createdAt: Date;
  type: "study" | "coding" | "discussion" | "project";
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: "host" | "member";
  isOnline: boolean;
  isSpeaking: boolean;
}

export default function StudyRoomsPage() {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<"browse" | "in-room">("browse");
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const availableRooms: StudyRoom[] = [
    {
      id: "1",
      name: "React Masterclass",
      topic: "Learning React Hooks",
      creator: "Sarah Chen",
      participants: [
        {
          id: "1",
          name: "Sarah Chen",
          avatar: "👩‍💻",
          role: "host",
          isOnline: true,
          isSpeaking: true,
        },
        {
          id: "2",
          name: "Mike Ross",
          avatar: "👨‍💼",
          role: "member",
          isOnline: true,
          isSpeaking: false,
        },
        {
          id: "3",
          name: "Emma Watson",
          avatar: "👩‍🎓",
          role: "member",
          isOnline: true,
          isSpeaking: false,
        },
      ],
      maxParticipants: 6,
      isPublic: true,
      createdAt: new Date(),
      type: "study",
    },
    {
      id: "2",
      name: "JavaScript Deep Dive",
      topic: "Async/Await Patterns",
      creator: "David Kim",
      participants: [
        {
          id: "4",
          name: "David Kim",
          avatar: "👨‍🔬",
          role: "host",
          isOnline: true,
          isSpeaking: false,
        },
        {
          id: "5",
          name: "Lisa Park",
          avatar: "👩‍🎨",
          role: "member",
          isOnline: true,
          isSpeaking: true,
        },
      ],
      maxParticipants: 4,
      isPublic: true,
      createdAt: new Date(),
      type: "coding",
    },
    {
      id: "3",
      name: "Portfolio Project Sprint",
      topic: "Building Personal Websites",
      creator: "Alex Turner",
      participants: [
        {
          id: "6",
          name: "Alex Turner",
          avatar: "🎸",
          role: "host",
          isOnline: true,
          isSpeaking: false,
        },
      ],
      maxParticipants: 8,
      isPublic: true,
      createdAt: new Date(),
      type: "project",
    },
    {
      id: "4",
      name: "Morning Coffee Code",
      topic: "Casual Coding Session",
      creator: "Jamie Fox",
      participants: [
        {
          id: "7",
          name: "Jamie Fox",
          avatar: "☕",
          role: "host",
          isOnline: true,
          isSpeaking: false,
        },
        {
          id: "8",
          name: "Tom Hardy",
          avatar: "💪",
          role: "member",
          isOnline: true,
          isSpeaking: false,
        },
        {
          id: "9",
          name: "Zoe Adams",
          avatar: "🌸",
          role: "member",
          isOnline: true,
          isSpeaking: false,
        },
        {
          id: "10",
          name: "Chris Evans",
          avatar: "🛡️",
          role: "member",
          isOnline: true,
          isSpeaking: false,
        },
      ],
      maxParticipants: 6,
      isPublic: true,
      createdAt: new Date(),
      type: "discussion",
    },
  ];

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case "study":
        return BookOpen;
      case "coding":
        return Code;
      case "project":
        return Trophy;
      case "discussion":
        return Coffee;
      default:
        return Users;
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case "study":
        return "from-purple-500 to-blue-500";
      case "coding":
        return "from-green-500 to-emerald-500";
      case "project":
        return "from-orange-500 to-red-500";
      case "discussion":
        return "from-pink-500 to-purple-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  const joinRoom = (room: StudyRoom) => {
    setCurrentRoom(room);
    setActiveView("in-room");
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setActiveView("browse");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {activeView === "browse" ? (
        /* Browse Rooms View */
        <div className="max-w-7xl mx-auto p-6">
          {/* Hero */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
              Live Study Rooms
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Learn together with students from around the world! Join a room or
              create your own.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
            >
              <Users className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-3xl font-bold text-white">247</p>
              <p className="text-slate-400">Students Online</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
            >
              <Video className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-3xl font-bold text-white">32</p>
              <p className="text-slate-400">Active Rooms</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
            >
              <Zap className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-3xl font-bold text-white">1.2k</p>
              <p className="text-slate-400">Sessions Today</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30"
            >
              <Clock className="w-8 h-8 text-pink-400 mb-2" />
              <p className="text-3xl font-bold text-white">4.5h</p>
              <p className="text-slate-400">Avg Session</p>
            </motion.div>
          </div>

          {/* Create Room Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mb-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/50"
          >
            <UserPlus className="w-6 h-6" />
            Create Your Own Study Room
          </motion.button>

          {/* Available Rooms */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Video className="w-7 h-7 text-purple-400" />
              Join a Room
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {availableRooms.map((room, i) => {
                const TypeIcon = getRoomTypeIcon(room.type);
                const colorClass = getRoomTypeColor(room.type);

                return (
                  <motion.div
                    key={room.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => joinRoom(room)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}
                        >
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {room.name}
                          </h3>
                          <p className="text-sm text-slate-400">{room.topic}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                        LIVE
                      </span>
                    </div>

                    {/* Host */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-white/5 rounded-xl">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">
                        Hosted by <strong>{room.creator}</strong>
                      </span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {room.participants.slice(0, 4).map((p, idx) => (
                          <div
                            key={p.id}
                            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl -ml-2 first:ml-0 border-2 border-slate-900 relative"
                          >
                            {p.avatar}
                            {p.isSpeaking && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
                            )}
                          </div>
                        ))}
                        {room.participants.length > 4 && (
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-slate-300 -ml-2 border-2 border-slate-900">
                            +{room.participants.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-slate-400">
                        {room.participants.length} / {room.maxParticipants}{" "}
                        members
                      </span>
                    </div>

                    {/* Join Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      Join Room
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* In-Room View */
        <div className="h-screen flex flex-col">
          {/* Room Header */}
          <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {currentRoom?.name}
                  </h2>
                  <p className="text-sm text-slate-400">{currentRoom?.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {currentRoom?.participants.length} Online
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={leaveRoom}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Leave
                </motion.button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Video Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {currentRoom?.participants.map((participant) => (
                  <motion.div
                    key={participant.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border-2 ${
                      participant.isSpeaking
                        ? "border-green-500"
                        : "border-white/10"
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl">{participant.avatar}</div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {participant.role === "host" && (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          )}
                          <span className="text-white font-semibold">
                            {participant.name}
                          </span>
                        </div>
                        {participant.isSpeaking && (
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-3 bg-green-400 rounded animate-pulse" />
                            <div className="w-1 h-4 bg-green-400 rounded animate-pulse delay-75" />
                            <div className="w-1 h-2 bg-green-400 rounded animate-pulse delay-150" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Shared Whiteboard Area */}
              {showWhiteboard && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white rounded-2xl p-6 border-4 border-slate-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      Shared Whiteboard
                    </h3>
                    <button
                      onClick={() => setShowWhiteboard(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="h-96 bg-slate-50 rounded-xl flex items-center justify-center">
                    <p className="text-slate-400">
                      Drawing area coming soon...
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Sidebar */}
            {showChat && (
              <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                className="w-96 bg-slate-900/50 backdrop-blur-xl border-l border-white/10 flex flex-col"
              >
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Chat
                  </h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  <div className="text-sm text-slate-400 text-center py-2">
                    You joined the room
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Sarah Chen</p>
                    <p className="text-sm text-white">
                      Hey everyone! Let's learn React hooks together 🚀
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Mike Ross</p>
                    <p className="text-sm text-white">
                      Sounds great! I'm stuck on useEffect
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-white/10">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="bg-slate-900 border-t border-white/10 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isMuted ? "bg-red-600" : "bg-white/10 hover:bg-white/20"
                } transition-colors`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isVideoOff ? "bg-red-600" : "bg-white/10 hover:bg-white/20"
                } transition-colors`}
              >
                {isVideoOff ? (
                  <VideoOff className="w-6 h-6 text-white" />
                ) : (
                  <Video className="w-6 h-6 text-white" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowWhiteboard(!showWhiteboard)}
                className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Pencil className="w-6 h-6 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowChat(!showChat)}
                className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Share2 className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
