"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  BookOpen,
  Play,
  Sparkles,
  Crown,
  Zap,
  Clock,
  Filter,
  X,
  ArrowRight,
  Globe,
  Lock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncRoom {
  id: string;
  name: string;
  hostName: string;
  hostImage?: string;
  contentTitle: string;
  contentImage?: string;
  contentSlug?: string;
  contentType: "book" | "course" | "lesson";
  participants: number;
  maxParticipants: number;
  isPrivate: boolean;
  tags: string[];
  level: "beginner" | "intermediate" | "advanced" | "all";
  createdAt: Date;
  averageProgress: number;
}

interface BrainSyncDiscoveryProps {
  onJoinRoom: (
    roomId: string,
    contentSlug?: string,
    contentType?: string
  ) => void;
  onCreateRoom: () => void;
}

interface Stats {
  learnersOnline: number;
  activeSessions: number;
  knowledgeShared: number;
}

// Demo rooms for when no real sessions exist
const DEMO_ROOMS: SyncRoom[] = [
  {
    id: "1",
    name: "Python Deep Dive 🐍",
    hostName: "Alex Chen",
    contentTitle: "Advanced Python Patterns",
    contentType: "course",
    participants: 5,
    maxParticipants: 8,
    isPrivate: false,
    tags: ["python", "algorithms", "design-patterns"],
    level: "advanced",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    averageProgress: 45,
  },
  {
    id: "2",
    name: "React Study Group",
    hostName: "Sarah Johnson",
    contentTitle: "Building Modern UIs",
    contentType: "book",
    participants: 3,
    maxParticipants: 6,
    isPrivate: false,
    tags: ["react", "frontend", "hooks"],
    level: "intermediate",
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    averageProgress: 72,
  },
  {
    id: "3",
    name: "ML for Beginners",
    hostName: "James Wilson",
    hostImage: "/avatars/james.jpg",
    contentTitle: "Intro to Machine Learning",
    contentType: "lesson",
    participants: 7,
    maxParticipants: 10,
    isPrivate: false,
    tags: ["machine-learning", "python", "data-science"],
    level: "beginner",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    averageProgress: 23,
  },
  {
    id: "4",
    name: "System Design Club 🏗️",
    hostName: "Emily Brown",
    contentTitle: "Distributed Systems",
    contentType: "course",
    participants: 4,
    maxParticipants: 5,
    isPrivate: true,
    tags: ["system-design", "architecture", "scalability"],
    level: "advanced",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    averageProgress: 61,
  },
];

const LEVEL_COLORS = {
  beginner: "from-green-500 to-emerald-500",
  intermediate: "from-blue-500 to-cyan-500",
  advanced: "from-purple-500 to-pink-500",
  all: "from-slate-500 to-slate-400",
};

const CONTENT_ICONS = {
  book: BookOpen,
  course: Play,
  lesson: Sparkles,
};

// Room card component
const RoomCard = ({
  room,
  onJoin,
}: {
  room: SyncRoom;
  onJoin: (id: string, contentSlug?: string, contentType?: string) => void;
}) => {
  const Icon = CONTENT_ICONS[room.contentType];
  const isFull = room.participants >= room.maxParticipants;
  const timeSinceCreated = Math.floor(
    (Date.now() - room.createdAt.getTime()) / 1000 / 60
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`
        relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 
        rounded-2xl p-5 border transition-all cursor-pointer
        ${
          isFull
            ? "border-slate-700/50 opacity-60"
            : "border-purple-500/20 hover:border-purple-500/50"
        }
      `}
      onClick={() =>
        !isFull && onJoin(room.id, room.contentSlug, room.contentType)
      }
    >
      {/* Live indicator */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-4 right-4"
      >
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400">LIVE</span>
        </div>
      </motion.div>

      {/* Private badge */}
      {room.isPrivate && (
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20">
            <Lock className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-amber-400">Private</span>
          </div>
        </div>
      )}

      {/* Host */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          {room.hostImage ? (
            <img
              src={room.hostImage}
              alt={room.hostName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold">
              {room.hostName.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">{room.name}</h3>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" />
            {room.hostName}
          </p>
        </div>
      </div>

      {/* Content info */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800/50 rounded-xl">
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
            LEVEL_COLORS[room.level]
          } flex items-center justify-center`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{room.contentTitle}</p>
          <p className="text-xs text-slate-500 capitalize">
            {room.contentType}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Group Progress</span>
          <span>{room.averageProgress}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${room.averageProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${
              LEVEL_COLORS[room.level]
            } rounded-full`}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {room.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            <span>
              {room.participants}/{room.maxParticipants}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{timeSinceCreated}m ago</span>
          </div>
        </div>

        <Button
          size="sm"
          disabled={isFull}
          className={`
            ${
              isFull
                ? "bg-slate-700 text-slate-400"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            }
          `}
        >
          {isFull ? "Full" : "Join"}
          {!isFull && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </motion.div>
  );
};

export default function BrainSyncDiscovery({
  onJoinRoom,
  onCreateRoom,
}: BrainSyncDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [rooms, setRooms] = useState<SyncRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    learnersOnline: 0,
    activeSessions: 0,
    knowledgeShared: 0,
  });

  // Fetch live sessions from API
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedLevel) params.set("level", selectedLevel);
      if (selectedType) params.set("type", selectedType);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/brain-sync/sessions?${params}`);
      const data = await response.json();

      if (data.sessions && data.sessions.length > 0) {
        // Transform API data to match our SyncRoom interface
        const transformedRooms: SyncRoom[] = data.sessions.map((s: any) => ({
          id: s.id,
          name: s.name,
          hostName: s.hostName,
          hostImage: s.hostImage,
          contentTitle: s.contentTitle,
          contentImage: s.contentImage,
          contentSlug: s.contentSlug,
          contentType: s.contentType,
          participants: s.participantCount || s.participants?.length || 1,
          maxParticipants: s.maxParticipants || 10,
          isPrivate: s.isPrivate || false,
          tags: s.tags || [],
          level: s.level || "all",
          createdAt: new Date(s.createdAt),
          averageProgress: Math.floor(Math.random() * 60) + 20, // TODO: Track real progress
        }));
        setRooms(transformedRooms);
        setStats(
          data.stats || {
            learnersOnline: transformedRooms.reduce(
              (acc, r) => acc + r.participants,
              0
            ),
            activeSessions: transformedRooms.length,
            knowledgeShared: transformedRooms.length * 15,
          }
        );
      } else {
        // Show demo rooms if no live sessions
        setRooms(DEMO_ROOMS);
        setStats({
          learnersOnline: 19,
          activeSessions: 4,
          knowledgeShared: 127,
        });
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      // Fall back to demo rooms on error
      setRooms(DEMO_ROOMS);
      setStats({ learnersOnline: 19, activeSessions: 4, knowledgeShared: 127 });
    } finally {
      setIsLoading(false);
    }
  }, [selectedLevel, selectedType, searchQuery]);

  // Initial fetch and polling
  useEffect(() => {
    fetchSessions();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.contentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLevel = !selectedLevel || room.level === selectedLevel;
    const matchesType = !selectedType || room.contentType === selectedType;
    return matchesSearch && matchesLevel && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 mb-6 shadow-2xl shadow-purple-500/30"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 mb-4">
          Brain Sync Discovery
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Join live study sessions, learn together in real-time, and sync your
          brain with other learners around the world
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-3xl font-bold text-white">
              {stats.learnersOnline}
            </p>
            <p className="text-sm text-slate-400">Learners Online</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-3xl font-bold text-white">
              {stats.activeSessions}
            </p>
            <p className="text-sm text-slate-400">Active Sessions</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-3xl font-bold text-purple-400">∞</p>
            <p className="text-sm text-slate-400">Knowledge Shared</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto mb-8"
      >
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms, topics, or tags..."
            className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Level filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400">Level:</span>
            {["beginner", "intermediate", "advanced"].map((level) => (
              <button
                key={level}
                onClick={() =>
                  setSelectedLevel(selectedLevel === level ? null : level)
                }
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize
                  ${
                    selectedLevel === level
                      ? `bg-gradient-to-r ${
                          LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
                        } text-white`
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400">Type:</span>
            {["book", "course", "lesson"].map((type) => {
              const Icon = CONTENT_ICONS[type as keyof typeof CONTENT_ICONS];
              return (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedType(selectedType === type ? null : type)
                  }
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize flex items-center gap-1
                    ${
                      selectedType === type
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {type}
                </button>
              );
            })}
          </div>

          {/* Create room button */}
          <motion.div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSessions}
              disabled={isLoading}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={onCreateRoom}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start a Session
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Rooms Grid */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-slate-400">Finding live sessions...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🔍
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">
              No sessions found
            </h3>
            <p className="text-slate-400 mb-6">
              Be the first to start a session on this topic!
            </p>
            <Button
              onClick={onCreateRoom}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RoomCard room={room} onJoin={onJoinRoom} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating particles */}
      {typeof window !== "undefined" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
              initial={{
                x:
                  Math.random() *
                  (typeof window !== "undefined" ? window.innerWidth : 1000),
                y:
                  Math.random() *
                  (typeof window !== "undefined" ? window.innerHeight : 800),
              }}
              animate={{
                y: [
                  null,
                  Math.random() *
                    (typeof window !== "undefined" ? window.innerHeight : 800),
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
