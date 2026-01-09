"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Bookmark,
  Search,
  ZoomIn,
  ZoomOut,
  MoreVertical,
  Crown,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Import all Brain Sync components
import BrainSyncDiscovery from "./BrainSyncDiscovery";
import BrainSyncRoom from "./BrainSyncRoom";
import { MultiplayerCursors } from "./MultiplayerCursor";
import SimplePresenceBar from "./SimplePresenceBar";
import FloatingReactions, { REACTION_EMOJIS } from "./FloatingReactions";
import PomodoroTimer from "./PomodoroTimer";
import CollaborativeNotes from "./CollaborativeNotes";
import AIInsights from "./AIInsights";
import CreateSessionModal from "./CreateSessionModal";
import { useRouter } from "next/navigation";

// Types
interface BrainSyncUser {
  id: string;
  name: string;
  image?: string;
  level: number;
  cursor?: { x: number; y: number };
  currentPage?: number;
  scrollPosition?: number;
  isTyping?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  color: string;
  volume?: number;
  audioLevel?: number;
}

interface BrainSyncMessage {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  userColor?: string;
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

interface CollaborativeNote {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  userImage?: string;
  pageNumber: number;
  content: string;
  position: { x: number; y: number };
  isPinned: boolean;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  userName: string;
  x: number;
  timestamp: number;
}

// User colors
const USER_COLORS = [
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
];

// Sample book content for demo
const SAMPLE_BOOK_CONTENT = {
  title: "The Art of Learning",
  author: "Josh Waitzkin",
  totalPages: 12,
  pages: [
    {
      number: 1,
      title: "Chapter 1: The Beginning",
      content: `The moment I first sat down at a chess board, something clicked. I was six years old, watching my father play in Washington Square Park. The pieces seemed to dance before my eyes.

What fascinated me wasn't the complexity of the game—it was the simplicity within the complexity. Each piece had its purpose, its role in the grand symphony of moves and counter-moves.

This book is about learning how to learn. It's about the journey from novice to mastery, from unconscious incompetence to unconscious competence.`,
    },
    {
      number: 2,
      title: "The Learning Process",
      content: `True learning happens in layers. First, we must embrace the beginner's mind—that state of openness where every piece of information feels fresh and exciting.

The key insight is this: mastery isn't about memorizing techniques. It's about understanding principles so deeply that they become part of who you are.

When I transitioned from chess to Tai Chi, many people thought I was starting over. But I wasn't. I was applying the same learning principles to a new domain.

The meta-skill of learning how to learn is transferable across any discipline.`,
    },
    {
      number: 3,
      title: "Investment in Loss",
      content: `One of the most counterintuitive principles in learning is what I call "Investment in Loss." To truly grow, you must be willing to lose, to fail, to look foolish.

Every chess game I lost taught me more than ten victories. Every time I was thrown in Tai Chi practice, I learned about my weaknesses.

The ego is the enemy of learning. When we're focused on looking good, we stop taking the risks necessary for growth.

The greatest learners I've met share one trait: they embrace their mistakes as their greatest teachers.`,
    },
  ],
};

export default function BrainSyncPageClient() {
  const router = useRouter();

  // View state
  const [view, setView] = useState<"discovery" | "room">("discovery");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessionContent, setSessionContent] = useState<{
    title: string;
    type: string;
    id?: string;
    slug?: string;
    coverImage?: string;
  } | null>(null);

  // Book content state - can be real or demo
  const [bookContent, setBookContent] = useState<{
    title: string;
    author: string;
    totalPages: number;
    coverImage?: string;
    pages: Array<{ number: number; title: string; content: string }>;
  }>(SAMPLE_BOOK_CONTENT);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // User state
  const [currentUser] = useState<BrainSyncUser>({
    id: "current-user",
    name: "You",
    level: 15,
    color: USER_COLORS[0],
    volume: 100,
    audioLevel: 0,
  });

  // Room state
  const [users, setUsers] = useState<BrainSyncUser[]>([]);
  const [messages, setMessages] = useState<BrainSyncMessage[]>([]);
  const [highlights, setHighlights] = useState<SharedHighlight[]>([]);
  const [notes, setNotes] = useState<CollaborativeNote[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<
    FloatingReaction[]
  >([]);

  // Book/content state
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  // Audio state
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  // Timer state
  const [timerPhase, setTimerPhase] = useState<"study" | "break" | "idle">(
    "idle"
  );
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [studyDuration, setStudyDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  // UI state
  const [isRoomPanelOpen, setIsRoomPanelOpen] = useState(true);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isHost, setIsHost] = useState(true);

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);

  // Timer logic
  useEffect(() => {
    if (timerPhase === "idle" || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Switch phases
          if (timerPhase === "study") {
            setTimerPhase("break");
            return breakDuration * 60;
          } else {
            setTimerPhase("study");
            return studyDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerPhase, timeRemaining, studyDuration, breakDuration]);

  // Simulate other users' cursor movement
  useEffect(() => {
    if (view !== "room") return;

    const interval = setInterval(() => {
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === currentUser.id) return user;

          const newCursor = user.cursor
            ? {
                x: Math.max(
                  100,
                  Math.min(800, user.cursor.x + (Math.random() - 0.5) * 30)
                ),
                y: Math.max(
                  100,
                  Math.min(600, user.cursor.y + (Math.random() - 0.5) * 30)
                ),
              }
            : undefined;

          // Random speaking simulation
          const isSpeaking = Math.random() > 0.9;
          const audioLevel = isSpeaking ? Math.random() * 0.8 + 0.2 : 0;

          return {
            ...user,
            cursor: newCursor,
            isSpeaking,
            audioLevel,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [view, currentUser.id]);

  // Fetch real book content when joining a session
  const fetchBookContent = useCallback(async (bookSlug: string) => {
    console.log("🔍 Fetching book content for slug:", bookSlug);
    setIsLoadingContent(true);
    try {
      // Fetch book details
      const response = await fetch(`/api/books/${bookSlug}`);
      console.log("📚 Book API response status:", response.status);
      if (!response.ok) throw new Error("Failed to fetch book");

      const data = await response.json();
      const book = data.book; // API returns { book: {...} }
      console.log("📖 Book data:", book?.title, book?.totalPages);

      // Fetch book pages/content
      const contentResponse = await fetch(`/api/books/${bookSlug}/pages`);
      console.log("📄 Pages API response status:", contentResponse.status);
      let pages = SAMPLE_BOOK_CONTENT.pages;

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        console.log("📑 Content data:", {
          pagesCount: contentData.pages?.length,
          totalPages: contentData.totalPages,
          hasFullAccess: contentData.hasFullAccess,
          message: contentData.message,
        });

        if (contentData.pages && contentData.pages.length > 0) {
          pages = contentData.pages.map((p: any) => ({
            number: p.number || p.pageNumber,
            title: p.title || `Page ${p.number || p.pageNumber}`,
            content: p.content || p.text || "",
          }));
          console.log("✅ Loaded", pages.length, "pages from API");
        } else {
          console.log("⚠️ No pages returned from API, using sample content");
          // Keep using sample content but update totalPages if available
          if (contentData.totalPages) {
            pages = SAMPLE_BOOK_CONTENT.pages;
          }
        }
      } else {
        console.log("⚠️ Pages API failed, using sample content");
      }

      setBookContent({
        title: book?.title || "Untitled",
        author: book?.author?.name || "Unknown Author",
        totalPages: book?.totalPages || pages.length,
        coverImage: book?.coverImage,
        pages,
      });
      console.log("✅ Book content set:", book?.title);
    } catch (error) {
      console.error("❌ Error fetching book content:", error);
      // Keep demo content as fallback
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  // Join room handler
  const handleJoinRoom = useCallback(
    (roomId: string, contentSlug?: string, contentType?: string) => {
      console.log("🚀 handleJoinRoom called:", {
        roomId,
        contentSlug,
        contentType,
      });
      setCurrentRoomId(roomId);
      setView("room");
      setIsHost(roomId === "new-room");

      // If we have content info, fetch the real book
      if (contentSlug && contentType === "book") {
        console.log("📚 Will fetch book content for:", contentSlug);
        fetchBookContent(contentSlug);
      } else {
        console.log("⚠️ No contentSlug or not a book, using sample content");
      }

      // Simulate users
      const simulatedUsers: BrainSyncUser[] = [
        { ...currentUser, currentPage: 1 },
        {
          id: "user-1",
          name: "Alex Chen",
          level: 23,
          color: USER_COLORS[1],
          cursor: { x: 400, y: 300 },
          currentPage: 1,
          volume: 100,
          audioLevel: 0,
        },
        {
          id: "user-2",
          name: "Sarah Johnson",
          level: 18,
          color: USER_COLORS[2],
          cursor: { x: 600, y: 450 },
          currentPage: 2,
          isSpeaking: true,
          volume: 100,
          audioLevel: 0.6,
        },
        {
          id: "user-3",
          name: "Mike Wilson",
          level: 31,
          color: USER_COLORS[3],
          currentPage: 1,
          isTyping: true,
          volume: 100,
          audioLevel: 0,
        },
        {
          id: "user-4",
          name: "Emma Davis",
          level: 27,
          color: USER_COLORS[4],
          cursor: { x: 350, y: 500 },
          currentPage: 1,
          volume: 100,
          audioLevel: 0,
        },
      ];

      setUsers(simulatedUsers);

      // Welcome messages
      setMessages([
        {
          id: "msg-0",
          userId: "system",
          userName: "System",
          content: "Welcome to the study session! 🎉",
          timestamp: new Date(),
          type: "system",
        },
        {
          id: "msg-1",
          userId: "user-1",
          userName: "Alex Chen",
          userColor: USER_COLORS[1],
          content: "Hey everyone! Ready to learn together?",
          timestamp: new Date(Date.now() - 120000),
          type: "text",
        },
        {
          id: "msg-2",
          userId: "user-2",
          userName: "Sarah Johnson",
          userColor: USER_COLORS[2],
          content: "This chapter is 🔥",
          timestamp: new Date(Date.now() - 60000),
          type: "text",
        },
        {
          id: "msg-3",
          userId: "user-3",
          userName: "Mike Wilson",
          userColor: USER_COLORS[3],
          content: "Can someone explain the Investment in Loss concept?",
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
          pageNumber: 1,
          text: "True learning happens in layers",
          note: "This is the core concept!",
          reactions: [
            { emoji: "🔥", userId: "user-2" },
            { emoji: "💡", userId: "user-3" },
          ],
        },
        {
          id: "h-2",
          userId: "user-2",
          userName: "Sarah Johnson",
          userColor: USER_COLORS[2],
          pageNumber: 2,
          text: "The meta-skill of learning how to learn is transferable",
          note: "This changed my perspective",
          reactions: [{ emoji: "❤️", userId: "user-1" }],
        },
      ]);

      // Sample notes
      setNotes([
        {
          id: "note-1",
          userId: "user-1",
          userName: "Alex Chen",
          userColor: USER_COLORS[1],
          pageNumber: 1,
          content:
            "Key insight: Learning is about understanding principles, not memorizing techniques.",
          position: { x: 50, y: 150 },
          isPinned: false,
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    },
    [currentUser]
  );

  // Send message
  const handleSendMessage = (content: string) => {
    const newMessage: BrainSyncMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      content,
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate response
    setTimeout(() => {
      const responses = [
        "That's a great point! 👍",
        "I was thinking the same thing!",
        "Can you elaborate on that?",
        "Interesting perspective 🤔",
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          userId: "user-1",
          userName: "Alex Chen",
          userColor: USER_COLORS[1],
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: "text",
        },
      ]);
    }, 2000 + Math.random() * 2000);
  };

  // Send floating reaction
  const handleSendReaction = (emoji: string) => {
    const reaction: FloatingReaction = {
      id: `reaction-${Date.now()}`,
      emoji,
      userName: currentUser.name,
      x: 30 + Math.random() * 40, // 30-70% from left
      timestamp: Date.now(),
    };
    setFloatingReactions((prev) => [...prev, reaction]);

    // Simulate others reacting
    setTimeout(() => {
      const otherUser = users.find((u) => u.id !== currentUser.id);
      if (otherUser && Math.random() > 0.5) {
        setFloatingReactions((prev) => [
          ...prev,
          {
            id: `reaction-${Date.now()}-other`,
            emoji:
              REACTION_EMOJIS[
                Math.floor(Math.random() * REACTION_EMOJIS.length)
              ],
            userName: otherUser.name,
            x: 30 + Math.random() * 40,
            timestamp: Date.now(),
          },
        ]);
      }
    }, 500 + Math.random() * 1000);
  };

  // Timer controls
  const handleStartTimer = (study: number, breakTime: number) => {
    setStudyDuration(study);
    setBreakDuration(breakTime);
    setTimerPhase("study");
    setTimeRemaining(study * 60);
  };

  // Voice controls
  const handleJoinVoice = () => {
    setIsVoiceConnected(true);
  };

  const handleLeaveVoice = () => {
    setIsVoiceConnected(false);
    setIsMicOn(false);
  };

  // Note controls
  const handleCreateNote = (note: Partial<CollaborativeNote>) => {
    const newNote: CollaborativeNote = {
      id: `note-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      pageNumber: note.pageNumber || currentPage,
      content: note.content || "",
      position: note.position || { x: 100, y: 100 },
      isPinned: note.isPinned || false,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
  };

  // Leave room
  const handleLeaveRoom = () => {
    setView("discovery");
    setCurrentRoomId(null);
    setUsers([]);
    setMessages([]);
    setHighlights([]);
    setNotes([]);
    setIsVoiceConnected(false);
    setTimerPhase("idle");
  };

  // Highlight reaction
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

  // Copy invite link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/brain-sync?room=${currentRoomId}`
    );
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  // Get current page content
  const currentPageContent = bookContent.pages.find(
    (p) => p.number === currentPage
  ) ||
    bookContent.pages[0] || {
      number: 1,
      title: "Loading...",
      content: "Loading content...",
    };

  // Voice participants for voice chat
  const voiceParticipants = users.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    color: u.color,
    isSpeaking: u.isSpeaking || false,
    isMuted: u.id === currentUser.id ? !isMicOn : false,
    volume: u.volume || 100,
    audioLevel: u.audioLevel || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Discovery View */}
      {view === "discovery" && (
        <>
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
            onCreateRoom={() => setShowCreateModal(true)}
          />
        </>
      )}

      {/* Room View */}
      {view === "room" && (
        <div className="min-h-screen flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
              {/* Left section */}
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLeaveRoom}
                  className="text-slate-400 hover:text-white flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
                        {sessionContent?.title || bookContent.title}
                      </h1>
                      {isHost && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-amber-500/20 text-amber-400 rounded-full flex items-center gap-1 flex-shrink-0">
                          <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden sm:inline">Host</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                      <span className="hidden sm:inline">
                        {bookContent.author} •{" "}
                      </span>
                      Page {currentPage} of {bookContent.totalPages}
                    </p>
                  </div>
                </div>
              </div>

              {/* Center - Page navigation */}
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="text-slate-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-1 px-3">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white font-medium">
                    {currentPage} / {bookContent.totalPages}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(bookContent.totalPages, currentPage + 1)
                    )
                  }
                  disabled={currentPage === bookContent.totalPages}
                  className="text-slate-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Right section */}
              <div className="flex items-center gap-1 sm:gap-3">
                {/* Connection status */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/30">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">Connected</span>
                </div>
                {/* Mobile connection indicator */}
                <div className="flex sm:hidden items-center justify-center w-8 h-8 bg-green-500/10 rounded-full border border-green-500/30">
                  <Wifi className="w-4 h-4 text-green-400" />
                </div>

                {/* Users online */}
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-slate-800/50 rounded-full">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs sm:text-sm text-white">
                    {users.length}
                  </span>
                </div>

                {/* Invite - hidden on mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="hidden sm:flex text-slate-400 hover:text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite
                </Button>

                {/* Audio controls - simplified on mobile */}
                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${
                      isMicOn
                        ? "text-green-400 bg-green-500/20"
                        : "text-slate-400"
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
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${
                      isSpeakerOn
                        ? "text-green-400 bg-green-500/20"
                        : "text-slate-400"
                    }`}
                  >
                    {isSpeakerOn ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Zoom controls - hidden on mobile */}
                <div className="hidden md:flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    className="w-9 h-9 rounded-lg text-slate-400 hover:text-white"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-slate-400 w-10 text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom(Math.min(150, zoom + 10))}
                    className="w-9 h-9 rounded-lg text-slate-400 hover:text-white"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                {/* Open panel */}
                {!isRoomPanelOpen && (
                  <Button
                    onClick={() => setIsRoomPanelOpen(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500 px-2 sm:px-4"
                  >
                    <Users className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Open Chat</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Page sync indicator */}
            <div className="px-2 sm:px-4 pb-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 hidden sm:inline">
                  Others on this page:
                </span>
                <div className="flex -space-x-1">
                  {users
                    .filter(
                      (u) =>
                        u.currentPage === currentPage && u.id !== currentUser.id
                    )
                    .slice(0, 5)
                    .map((u) => (
                      <div
                        key={u.id}
                        className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs text-white"
                        style={{ backgroundColor: u.color }}
                        title={u.name}
                      >
                        {u.name.charAt(0)}
                      </div>
                    ))}
                </div>
                {users.filter((u) => u.currentPage !== currentPage).length >
                  0 && (
                  <span className="text-slate-500">
                    •{" "}
                    {users.filter((u) => u.currentPage !== currentPage).length}{" "}
                    on other pages
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 relative pb-20 md:pb-0" ref={contentRef}>
            {/* Book content */}
            <div
              className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-12"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-800/30 rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-8 md:p-12 shadow-2xl"
              >
                {/* Loading state */}
                {isLoadingContent && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-400">Loading book content...</p>
                  </div>
                )}

                {/* Page header */}
                {!isLoadingContent && (
                  <>
                    <div className="mb-4 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10">
                      <span className="text-xs sm:text-sm text-purple-400 font-medium">
                        Page {currentPageContent.number}
                      </span>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-1 sm:mt-2">
                        {currentPageContent.title}
                      </h2>
                    </div>

                    {/* Page content */}
                    <div
                      className="prose prose-invert prose-sm sm:prose-lg max-w-none"
                      onMouseUp={() => {
                        const selection = window.getSelection();
                        if (selection && selection.toString().trim()) {
                          setSelectedText(selection.toString());
                        }
                      }}
                    >
                      {currentPageContent.content
                        .split("\n\n")
                        .map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-slate-300 leading-relaxed mb-6"
                          >
                            {paragraph}
                          </p>
                        ))}
                    </div>

                    {/* Page footer */}
                    <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-500">
                          {
                            highlights.filter(
                              (h) => h.pageNumber === currentPage
                            ).length
                          }{" "}
                          highlights on this page
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {bookContent.title} • {bookContent.author}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Multiplayer Cursors */}
            <MultiplayerCursors
              cursors={users
                .filter(
                  (u) =>
                    u.cursor &&
                    u.id !== currentUser.id &&
                    u.currentPage === currentPage
                )
                .map((u) => ({
                  userId: u.id,
                  userName: u.name,
                  color: u.color,
                  x: u.cursor!.x,
                  y: u.cursor!.y,
                  isTyping: u.isTyping,
                }))}
              currentUserId={currentUser.id}
            />

            {/* Collaborative Notes */}
            <CollaborativeNotes
              notes={notes}
              currentUserId={currentUser.id}
              currentPage={currentPage}
              onCreateNote={handleCreateNote}
              onUpdateNote={(id, content) => {
                setNotes((prev) =>
                  prev.map((n) =>
                    n.id === id ? { ...n, content, updatedAt: new Date() } : n
                  )
                );
              }}
              onDeleteNote={(id) =>
                setNotes((prev) => prev.filter((n) => n.id !== id))
              }
              onPinNote={(id) => {
                setNotes((prev) =>
                  prev.map((n) =>
                    n.id === id ? { ...n, isPinned: !n.isPinned } : n
                  )
                );
              }}
              onAddComment={(noteId, comment) => {
                setNotes((prev) =>
                  prev.map((n) =>
                    n.id === noteId
                      ? {
                          ...n,
                          comments: [
                            ...n.comments,
                            {
                              id: `comment-${Date.now()}`,
                              userId: currentUser.id,
                              userName: currentUser.name,
                              content: comment,
                              timestamp: new Date(),
                            },
                          ],
                        }
                      : n
                  )
                );
              }}
            />
          </main>

          {/* Presence bar */}
          <SimplePresenceBar
            users={users.map((u) => ({
              id: u.id,
              name: u.name,
              image: u.image,
              level: u.level,
              isSpeaking: u.isSpeaking,
              isTyping: u.isTyping,
            }))}
            onOpenRoom={() => setIsRoomPanelOpen(true)}
            currentPage={currentPage}
            totalPages={bookContent.totalPages}
            onPrevPage={() => setCurrentPage(Math.max(1, currentPage - 1))}
            onNextPage={() =>
              setCurrentPage(Math.min(bookContent.totalPages, currentPage + 1))
            }
          />

          {/* Room Panel */}
          <BrainSyncRoom
            roomId={currentRoomId || ""}
            contentTitle={sessionContent?.title || bookContent.title}
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

          {/* Floating Reactions */}
          <FloatingReactions
            reactions={floatingReactions}
            onSendReaction={handleSendReaction}
          />

          {/* Pomodoro Timer */}
          <PomodoroTimer
            isHost={isHost}
            studyDuration={studyDuration}
            breakDuration={breakDuration}
            currentPhase={timerPhase}
            timeRemaining={timeRemaining}
            participants={users.length}
            onStart={handleStartTimer}
            onPause={() => setTimerPhase("idle")}
            onResume={() => setTimerPhase("study")}
            onReset={() => {
              setTimerPhase("idle");
              setTimeRemaining(0);
            }}
          />

          {/* AI Insights */}
          <AIInsights
            currentContent={{
              title: bookContent.title,
              topic: currentPageContent.title,
              currentPage,
              selectedText,
            }}
            discussionHistory={messages.map((m) => m.content)}
            onAskAI={async (question) => {
              // Simulate AI response
              await new Promise((r) => setTimeout(r, 1500));
              return "That's a great question! Based on the content...";
            }}
            onSharePrompt={(prompt) => {
              handleSendMessage(`💡 ${prompt.content}`);
            }}
          />

          {/* Mini Voice Chat (when connected) */}
          {isVoiceConnected && !showVoicePanel && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed bottom-20 right-4 z-50 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-3 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {voiceParticipants.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className={`w-8 h-8 rounded-full border-2 border-slate-900 ${
                        p.isSpeaking ? "ring-2 ring-green-500" : ""
                      }`}
                    >
                      <img
                        src={
                          p.image ||
                          `https://ui-avatars.com/api/?name=${p.name}`
                        }
                        alt={p.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-slate-300">
                  {voiceParticipants.length} in call
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`w-8 h-8 rounded-full ${
                      isMicOn ? "text-green-400" : "text-red-400"
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
                    onClick={() => setShowVoicePanel(true)}
                    className="w-8 h-8 rounded-full text-slate-400"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

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
                Invite link copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Create Room Modal - Real Content Selection */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSession={async (sessionData) => {
          try {
            // Create the session via API
            const response = await fetch("/api/brain-sync/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(sessionData),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error(
                "Session creation failed:",
                response.status,
                errorData
              );
              throw new Error("Failed to create session");
            }

            const data = await response.json();
            const session = data.session;
            console.log("✅ Session created:", session);

            setSessionContent({
              title: session?.name || sessionData.name,
              type: sessionData.contentType,
              id: session?.contentId,
              slug: session?.contentSlug,
              coverImage: session?.contentImage,
            });

            // Pass content slug to load real book content
            handleJoinRoom(
              session?.id || "new-room",
              session?.contentSlug,
              sessionData.contentType
            );
          } catch (error) {
            console.error("Error creating session:", error);
            // Still join local room and use the contentSlug from sessionData
            setSessionContent({
              title: sessionData.name,
              type: sessionData.contentType,
              id: sessionData.contentId,
              slug: sessionData.contentSlug,
            });
            // Use the slug directly from sessionData
            handleJoinRoom(
              "new-room",
              sessionData.contentSlug,
              sessionData.contentType
            );
          }
        }}
      />
    </div>
  );
}
