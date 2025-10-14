"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import ListenModeLuxury from "./ListenModeLuxury";
import ReflectionModal, { type ReflectionData } from "./ReflectionModal";
import { useLiveCoReading } from "@/hooks/useLiveCoReading";
import LivePresenceIndicator from "./LivePresenceIndicator";
import LiveChatWidget from "./LiveChatWidget";
import LiveReactions from "./LiveReactions";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
  Moon,
  Sun,
  Coffee,
  Bookmark,
  Share2,
  MessageCircle,
  Clock,
  Zap,
  Crown,
  Star,
  Eye,
  Target,
  TrendingUp,
  Award,
  Heart,
  Volume2,
  Headphones,
  PauseCircle,
  PlayCircle,
  SkipForward,
  Lightbulb,
  Users,
  Trophy,
  Flame,
  Download,
  Search,
  Menu,
  X,
  Check,
  Lock,
  Unlock,
  Gift,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Type,
  Palette,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  RotateCcw,
  FastForward,
  Rewind,
  Info,
  PlusCircle,
  MinusCircle,
  Compass,
  Map,
  Flag,
  Navigation,
} from "lucide-react";

interface BookReaderLuxuryProps {
  bookId: string;
  slug: string;
  bookTitle: string;
  totalPages: number;
  freePages: number;
  isPurchased: boolean;
  isPremium: boolean;
  price: number;
  salePrice?: number | null;
}

export default function BookReaderLuxury({
  bookId,
  slug,
  bookTitle,
  totalPages,
  freePages,
  isPurchased,
  isPremium,
  price,
  salePrice,
}: BookReaderLuxuryProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // ===========================================
  // CORE READING STATE
  // ===========================================
  const [currentPage, setCurrentPage] = useState(1);
  const [pageContent, setPageContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // ===========================================
  // LUXURY CUSTOMIZATION SETTINGS
  // ===========================================
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">(
    "serif"
  );
  const [theme, setTheme] = useState<
    "light" | "sepia" | "dark" | "nord" | "ocean"
  >("light");
  const [layout, setLayout] = useState<"standard" | "wide" | "narrow">(
    "standard"
  );
  const [columnMode, setColumnMode] = useState<1 | 2>(1);

  // ===========================================
  // ADVANCED READING FEATURES
  // ===========================================
  const [listenMode, setListenMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);

  // ===========================================
  // UI STATE & MODALS
  // ===========================================
  const [showSettings, setShowSettings] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showReadingStats, setShowReadingStats] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  // ===========================================
  // READING METRICS & ANALYTICS
  // ===========================================
  const [readingTime, setReadingTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState(250); // WPM
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(30); // minutes
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // ===========================================
  // 🔥 LIVE CO-READING (NEW!)
  // ===========================================
  const {
    isConnected,
    pageReaders,
    readerCount,
    messages,
    reactions,
    typingUsers,
    isLoadingMessages,
    hasMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    sendReaction,
    startTyping,
    loadMoreMessages,
  } = useLiveCoReading(slug, currentPage, bookId);

  // ===========================================
  // BOOKMARKS & HIGHLIGHTS
  // ===========================================
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [currentPageBookmarked, setCurrentPageBookmarked] = useState(false);

  // ===========================================
  // REFS
  // ===========================================
  const contentRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const canReadPage = isPurchased || currentPage <= freePages;
  const progressPercentage = (currentPage / totalPages) * 100;

  // ===========================================
  // THEME DEFINITIONS (ULTRA-LUXURY PRESETS)
  // ===========================================
  const themes = {
    light: {
      bg: "bg-white",
      text: "text-gray-900",
      accent: "from-purple-500 to-blue-500",
      secondary: "bg-gray-100",
      border: "border-gray-200",
      card: "bg-gray-50",
      gradient: "from-gray-50 via-white to-gray-50",
    },
    sepia: {
      bg: "bg-[#f4ecd8]",
      text: "text-[#5f4b32]",
      accent: "from-amber-600 to-orange-600",
      secondary: "bg-[#e8d7be]",
      border: "border-[#d4c5ad]",
      card: "bg-[#efe6d5]",
      gradient: "from-[#efe6d5] via-[#f4ecd8] to-[#efe6d5]",
    },
    dark: {
      bg: "bg-gray-900",
      text: "text-gray-100",
      accent: "from-purple-400 to-blue-400",
      secondary: "bg-gray-800",
      border: "border-gray-700",
      card: "bg-gray-800/50",
      gradient: "from-gray-900 via-gray-800 to-gray-900",
    },
    nord: {
      bg: "bg-[#2e3440]",
      text: "text-[#eceff4]",
      accent: "from-[#88c0d0] to-[#81a1c1]",
      secondary: "bg-[#3b4252]",
      border: "border-[#4c566a]",
      card: "bg-[#3b4252]/50",
      gradient: "from-[#2e3440] via-[#3b4252] to-[#2e3440]",
    },
    ocean: {
      bg: "bg-[#0a192f]",
      text: "text-[#ccd6f6]",
      accent: "from-[#64ffda] to-[#00d4ff]",
      secondary: "bg-[#112240]",
      border: "border-[#233554]",
      card: "bg-[#112240]/50",
      gradient: "from-[#0a192f] via-[#112240] to-[#0a192f]",
    },
  };

  const currentTheme = themes[theme];

  // ===========================================
  // FONT FAMILY OPTIONS
  // ===========================================
  const fontFamilies = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono",
  };

  // ===========================================
  // LAYOUT WIDTH OPTIONS
  // ===========================================
  const layouts = {
    standard: "max-w-4xl",
    wide: "max-w-6xl",
    narrow: "max-w-2xl",
  };

  // ===========================================
  // LOAD SAVED PREFERENCES
  // ===========================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedPrefs = localStorage.getItem(`reader-prefs-${bookId}`);
      if (savedPrefs && savedPrefs !== "") {
        try {
          const prefs = JSON.parse(savedPrefs);
          if (prefs.fontSize) setFontSize(prefs.fontSize);
          if (prefs.lineHeight) setLineHeight(prefs.lineHeight);
          if (prefs.fontFamily) setFontFamily(prefs.fontFamily);
          if (prefs.theme) setTheme(prefs.theme);
          if (prefs.layout) setLayout(prefs.layout);
          if (prefs.columnMode) setColumnMode(prefs.columnMode);
        } catch (e) {
          localStorage.removeItem(`reader-prefs-${bookId}`);
        }
      }

      const savedBookmark = localStorage.getItem(`bookmark-${bookId}`);
      if (savedBookmark && savedBookmark !== "") {
        const page = parseInt(savedBookmark);
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      }

      const savedBookmarks = localStorage.getItem(`bookmarks-${bookId}`);
      if (savedBookmarks && savedBookmarks !== "") {
        try {
          setBookmarks(JSON.parse(savedBookmarks));
        } catch (e) {
          localStorage.removeItem(`bookmarks-${bookId}`);
        }
      }

      const savedStats = localStorage.getItem(`reading-stats-${bookId}`);
      if (savedStats && savedStats !== "") {
        try {
          const stats = JSON.parse(savedStats);
          setTotalReadingTime(stats.totalTime || 0);
          setWordsRead(stats.wordsRead || 0);
          setStreak(stats.streak || 0);
        } catch (e) {
          localStorage.removeItem(`reading-stats-${bookId}`);
        }
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
    }
  }, [bookId, totalPages]);

  // ===========================================
  // SAVE PREFERENCES
  // ===========================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const prefs = {
        fontSize,
        lineHeight,
        fontFamily,
        theme,
        layout,
        columnMode,
      };
      localStorage.setItem(`reader-prefs-${bookId}`, JSON.stringify(prefs));
    } catch (err) {
      console.error("Error saving preferences:", err);
    }
  }, [fontSize, lineHeight, fontFamily, theme, layout, columnMode, bookId]);

  // ===========================================
  // TRACK READING TIME
  // ===========================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      try {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);
        setTotalReadingTime((prev) => prev + 1);

        // Save stats every minute
        const stats = {
          totalTime: totalReadingTime + 1,
          wordsRead,
          streak,
          lastRead: Date.now(),
        };
        localStorage.setItem(`reading-stats-${bookId}`, JSON.stringify(stats));
      } catch (err) {
        console.error("Error saving stats:", err);
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [sessionStartTime, totalReadingTime, wordsRead, streak, bookId]);

  // ===========================================
  // BOOKMARK CURRENT PAGE
  // ===========================================
  useEffect(() => {
    setCurrentPageBookmarked(bookmarks.includes(currentPage));
  }, [currentPage, bookmarks]);

  // ===========================================
  // AUTO-SCROLL FEATURE
  // ===========================================
  useEffect(() => {
    if (autoScroll && contentRef.current) {
      autoScrollIntervalRef.current = setInterval(() => {
        contentRef.current?.scrollBy({
          top: scrollSpeed / 10,
          behavior: "smooth",
        });
      }, 100);
    } else if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [autoScroll, scrollSpeed]);

  // ===========================================
  // LOAD PAGE CONTENT
  // ===========================================
  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage]);

  const loadPage = async (pageNum: number) => {
    if (!canReadPage && pageNum > freePages) {
      setShowPaywall(true);
      return;
    }

    setIsTransitioning(true);
    setLoading(true);

    try {
      const res = await fetch(`/api/books/${slug}/read?page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to load page");

      const data = await res.json();
      setPageContent(data.content);
      setShowPaywall(false);

      // Calculate reading time
      const wordCount = data.content
        .replace(/<[^>]*>/g, "")
        .split(/\s+/).length;
      setReadingTime(Math.ceil(wordCount / readingSpeed));
      setWordsRead((prev) => prev + wordCount);

      // Track progress
      trackReadingProgress(pageNum);
      setCompletionPercentage((pageNum / totalPages) * 100);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading page:", error);
      setPageContent(
        '<div class="text-center text-red-600"><h2>Error loading page content</h2></div>'
      );
    } finally {
      setLoading(false);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const trackReadingProgress = async (page: number) => {
    try {
      await fetch("/api/books/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          currentPage: page,
          totalPages,
        }),
      });
    } catch (error) {
      console.error("Error tracking progress:", error);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      localStorage.setItem(`bookmark-${bookId}`, (currentPage + 1).toString());
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      localStorage.setItem(`bookmark-${bookId}`, (currentPage - 1).toString());
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      localStorage.setItem(`bookmark-${bookId}`, page.toString());
    }
  };

  const toggleBookmark = () => {
    if (typeof window === "undefined") return;

    try {
      if (currentPageBookmarked) {
        const updated = bookmarks.filter((p) => p !== currentPage);
        setBookmarks(updated);
        localStorage.setItem(`bookmarks-${bookId}`, JSON.stringify(updated));
      } else {
        const updated = [...bookmarks, currentPage];
        setBookmarks(updated);
        localStorage.setItem(`bookmarks-${bookId}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Error saving bookmark:", err);
    }
  };

  const handleReflectionSubmit = async (reflection: ReflectionData) => {
    try {
      const res = await fetch("/api/community/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          bookTitle,
          chapterNumber: currentPage,
          content: reflection.content,
          postToCommunity: reflection.postToCommunity,
          category: reflection.category,
          isPublic: reflection.isPublic,
        }),
      });

      if (!res.ok) throw new Error("Failed to save reflection");

      // Track analytics
      console.log("[Reflection] Saved successfully");
    } catch (error) {
      console.error("Error submitting reflection:", error);
      throw error;
    }
  };

  const handlePurchase = async (type: "book" | "subscription" = "book") => {
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          type,
        }),
      });

      if (!res.ok) throw new Error("Failed to create checkout");

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to start checkout. Please try again.");
    }
  };

  // ===========================================
  // KEYBOARD SHORTCUTS
  // ===========================================
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "ArrowLeft":
          prevPage();
          break;
        case "ArrowRight":
          nextPage();
          break;
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setFocusMode((prev) => !prev);
          }
          break;
        case "b":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleBookmark();
          }
          break;
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSettings((prev) => !prev);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, totalPages]);

  return (
    <div
      className={`min-h-screen flex flex-col ${currentTheme.bg} ${currentTheme.text} transition-colors duration-500`}
    >
      {/* ===========================================
          ULTRA-LUXURY HEADER
          =========================================== */}
      {!zenMode && (
        <header
          className={`${currentTheme.secondary} border-b ${currentTheme.border} sticky top-0 z-50 backdrop-blur-xl bg-opacity-90 transition-all duration-300`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Back Button + Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="shrink-0 hover:scale-105 transition-transform"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen className="w-5 h-5 text-purple-500 shrink-0" />
                  <h1 className="text-base font-semibold truncate">
                    {bookTitle}
                  </h1>
                </div>
              </div>

              {/* Center: Progress */}
              <div className="hidden lg:flex items-center gap-4 px-8">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>

                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${currentTheme.accent} transition-all duration-300`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-1 justify-end">
                {/* Reading Stats */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReadingStats(!showReadingStats)}
                  className="hidden sm:flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">
                    {Math.floor(totalReadingTime)}m
                  </span>
                </Button>

                {/* Bookmark */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBookmark}
                  className={currentPageBookmarked ? "text-purple-500" : ""}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      currentPageBookmarked ? "fill-current" : ""
                    }`}
                  />
                </Button>

                {/* Listen Mode */}
                <Button
                  variant={listenMode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setListenMode(!listenMode)}
                  className={
                    listenMode
                      ? `bg-gradient-to-r ${currentTheme.accent} text-white`
                      : ""
                  }
                >
                  {listenMode ? (
                    <PlayCircle className="w-4 h-4" />
                  ) : (
                    <Headphones className="w-4 h-4" />
                  )}
                </Button>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sub-header: Quick Actions */}
            <div className="flex items-center justify-between pb-3 border-t border-gray-200/50 dark:border-gray-700/50 mt-2 pt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all ${
                    focusMode
                      ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg`
                      : `${currentTheme.secondary} hover:scale-105`
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Focus
                </button>

                <button
                  onClick={() => setZenMode(!zenMode)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all ${
                    zenMode
                      ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg`
                      : `${currentTheme.secondary} hover:scale-105`
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Zen
                </button>

                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all ${
                    autoScroll
                      ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg`
                      : `${currentTheme.secondary} hover:scale-105`
                  }`}
                >
                  <FastForward className="w-4 h-4" />
                  Auto
                </button>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {readingTime} min
                  </span>
                </div>

                {!isPurchased && currentPage <= freePages && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Gift className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {freePages - currentPage} free pages left
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ===========================================
          SETTINGS PANEL (SLIDE-OUT)
          =========================================== */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />

          {/* Settings Panel */}
          <div
            className={`relative ${currentTheme.bg} w-full max-w-md h-full overflow-y-auto shadow-2xl animate-slide-in-right`}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Palette className="w-6 h-6 text-purple-500" />
                  Reading Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-2 ${currentTheme.secondary} rounded-lg hover:scale-105 transition-transform`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
                  Theme
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(themes).map((themeKey) => (
                    <button
                      key={themeKey}
                      onClick={() => setTheme(themeKey as any)}
                      className={`relative aspect-square rounded-xl border-2 transition-all ${
                        theme === themeKey
                          ? "border-purple-500 scale-105"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-xl ${
                          themes[themeKey as keyof typeof themes].bg
                        }`}
                      />
                      {theme === themeKey && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-5 h-5 text-purple-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
                    Font Size
                  </h3>
                  <span className="text-sm font-bold">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className={`p-2 ${currentTheme.secondary} rounded-lg hover:scale-105 transition-transform`}
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                    className={`p-2 ${currentTheme.secondary} rounded-lg hover:scale-105 transition-transform`}
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Line Height */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
                    Line Height
                  </h3>
                  <span className="text-sm font-bold">
                    {lineHeight.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.4"
                  max="2.5"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Font Family */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
                  Font Family
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["serif", "sans", "mono"] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all ${
                        fontFamily === font
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : `border-gray-300 dark:border-gray-600 ${currentTheme.secondary}`
                      }`}
                    >
                      <div className={fontFamilies[font]}>Ag</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Width */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
                  Layout Width
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["narrow", "standard", "wide"] as const).map(
                    (layoutType) => (
                      <button
                        key={layoutType}
                        onClick={() => setLayout(layoutType)}
                        className={`px-4 py-3 rounded-xl border-2 capitalize transition-all ${
                          layout === layoutType
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : `border-gray-300 dark:border-gray-600 ${currentTheme.secondary}`
                        }`}
                      >
                        {layoutType}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Column Mode */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
                  Columns
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {([1, 2] as const).map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setColumnMode(cols)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all ${
                        columnMode === cols
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : `border-gray-300 dark:border-gray-600 ${currentTheme.secondary}`
                      }`}
                    >
                      {cols} Column{cols > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Scroll Speed */}
              {autoScroll && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
                      Scroll Speed
                    </h3>
                    <span className="text-sm font-bold">{scrollSpeed}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={() => {
                  setFontSize(18);
                  setLineHeight(1.8);
                  setFontFamily("serif");
                  setTheme("light");
                  setLayout("standard");
                  setColumnMode(1);
                }}
                className={`w-full px-4 py-3 ${currentTheme.secondary} rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2`}
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================
          READING STATS MODAL
          =========================================== */}
      {showReadingStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReadingStats(false)}
          />

          <div
            className={`relative ${currentTheme.bg} rounded-3xl p-8 max-w-md w-full shadow-2xl border ${currentTheme.border}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                Reading Stats
              </h2>
              <button
                onClick={() => setShowReadingStats(false)}
                className={`p-2 ${currentTheme.secondary} rounded-lg`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`${currentTheme.card} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-60">Total Reading Time</span>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {Math.floor(totalReadingTime)} min
                </div>
              </div>

              <div className={`${currentTheme.card} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-60">Words Read</span>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {wordsRead.toLocaleString()}
                </div>
              </div>

              <div className={`${currentTheme.card} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-60">Reading Streak</span>
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {streak} days
                </div>
              </div>

              <div className={`${currentTheme.card} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-60">Completion</span>
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {Math.round(completionPercentage)}%
                </div>
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Daily Goal</span>
                <span className="text-sm opacity-60">
                  {Math.floor(totalReadingTime)} / {dailyGoal} min
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (totalReadingTime / dailyGoal) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================
          MAIN READING CONTENT
          =========================================== */}
      <main className="flex-1 flex">
        <div className="flex-1">
          <div
            className={`${layouts[layout]} mx-auto px-4 sm:px-6 lg:px-8 ${
              zenMode ? "py-24" : "py-12"
            }`}
          >
            {/* Page Info (if not Zen mode) */}
            {!zenMode && (
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-medium opacity-60">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center gap-4">
                  {bookmarks.length > 0 && (
                    <button
                      onClick={() => setShowBookmarks(!showBookmarks)}
                      className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Bookmark className="w-4 h-4" />
                      {bookmarks.length} bookmarks
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400"></div>
                  <BookOpen className="absolute inset-0 m-auto w-6 h-6 text-purple-500 animate-pulse" />
                </div>
              </div>
            ) : showPaywall ? (
              <div className="text-center py-20">
                {/* Premium Paywall */}
                <div
                  className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-8 animate-pulse`}
                >
                  <Crown className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>

                <h3
                  className={`text-4xl font-bold mb-4 bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent`}
                >
                  🔒 Unlock Dynasty Premium
                </h3>

                <p className="text-xl font-medium mb-2">
                  You've completed the free preview!
                </p>
                <p className="text-lg opacity-70 mb-8">
                  Continue your journey through all {totalPages} pages
                </p>

                {/* Pricing Card */}
                <div
                  className={`${currentTheme.card} rounded-3xl p-8 mb-8 border-2 ${currentTheme.border} max-w-md mx-auto`}
                >
                  {salePrice ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <span
                          className={`text-6xl font-bold bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent`}
                        >
                          R{salePrice.toFixed(2)}
                        </span>
                        <div>
                          <span className="text-3xl line-through opacity-40">
                            R{price.toFixed(2)}
                          </span>
                          <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            Save{" "}
                            {Math.round(((price - salePrice) / price) * 100)}%
                            🔥
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        💎 Early Reader Discount - Limited Time!
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`text-6xl font-bold bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent`}
                    >
                      R{price.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
                  <div className={`${currentTheme.card} rounded-2xl p-4`}>
                    <Unlock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Full Access</p>
                  </div>
                  <div className={`${currentTheme.card} rounded-2xl p-4`}>
                    <Download className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Download</p>
                  </div>
                  <div className={`${currentTheme.card} rounded-2xl p-4`}>
                    <Headphones className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Audio TTS</p>
                  </div>
                  <div className={`${currentTheme.card} rounded-2xl p-4`}>
                    <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Lifetime</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                  <Button
                    size="lg"
                    onClick={() => handlePurchase("book")}
                    className={`w-full bg-gradient-to-r ${currentTheme.accent} hover:scale-105 text-white font-bold py-6 text-lg shadow-2xl transition-all duration-300`}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Purchase Book - Full Access
                  </Button>

                  <div className="text-sm opacity-50">or</div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handlePurchase("subscription")}
                    className={`w-full border-2 ${currentTheme.border} hover:scale-105 font-semibold transition-transform`}
                  >
                    📚 Subscribe for Unlimited Books
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Listen Mode */}
                {listenMode ? (
                  <ListenModeLuxury
                    bookSlug={slug}
                    chapterNumber={currentPage}
                    pageContent={pageContent}
                    isPremiumUser={isPremium}
                  />
                ) : (
                  <>
                    {/* Reading Content */}
                    <article
                      ref={contentRef}
                      className={`
                        prose prose-lg max-w-none leading-relaxed 
                        transition-all duration-500
                        ${
                          isTransitioning
                            ? "opacity-0 scale-95"
                            : "opacity-100 scale-100"
                        }
                        ${fontFamilies[fontFamily]}
                        ${
                          focusMode
                            ? "prose-p:opacity-50 hover:prose-p:opacity-100"
                            : ""
                        }
                        ${columnMode === 2 ? "columns-2 gap-8" : ""}
                      `}
                      style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                      }}
                      dangerouslySetInnerHTML={{ __html: pageContent }}
                    />

                    {/* Reflection CTA */}
                    {!isTransitioning && pageContent && !focusMode && (
                      <div
                        className={`mt-16 pt-12 border-t ${currentTheme.border}`}
                      >
                        <div
                          className={`bg-gradient-to-br ${currentTheme.gradient} rounded-3xl p-8 sm:p-12 border ${currentTheme.border}`}
                        >
                          <div className="text-center">
                            <div
                              className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${currentTheme.accent} rounded-full mb-6 shadow-lg`}
                            >
                              <Lightbulb className="w-8 h-8 text-white" />
                            </div>

                            <h3
                              className={`text-3xl font-bold bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent mb-3`}
                            >
                              ✨ Reflect on this Chapter
                            </h3>

                            <p className="text-base opacity-70 mb-8 max-w-lg mx-auto">
                              What was your biggest realization? Share your
                              insight with the Dynasty community and transform
                              reading into wisdom.
                            </p>

                            <button
                              onClick={() => setShowReflectionModal(true)}
                              className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${currentTheme.accent} hover:scale-105 text-white font-bold rounded-2xl transition-all shadow-xl`}
                            >
                              <MessageCircle className="w-5 h-5" />
                              Share Your Reflection
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-60">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                <span>Earn Dynasty Points</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                <span>"Chapter Contributor" badge</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===========================================
          REFLECTION MODAL
          =========================================== */}
      <ReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        bookId={bookId}
        bookTitle={bookTitle}
        chapterNumber={currentPage}
        onSubmit={handleReflectionSubmit}
      />

      {/* ===========================================
          FOOTER NAVIGATION
          =========================================== */}
      {!zenMode && (
        <footer
          className={`${currentTheme.secondary} border-t ${currentTheme.border} sticky bottom-0 z-50 backdrop-blur-xl bg-opacity-90`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Previous Button */}
              <Button
                variant="ghost"
                onClick={prevPage}
                disabled={currentPage === 1}
                className="disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              {/* Page Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => goToPage(Math.max(1, currentPage - 10))}
                  className={`${currentTheme.secondary} p-2 rounded-lg hover:scale-105 transition-transform`}
                  title="Jump back 10 pages"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-sm opacity-60">Page:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                    className={`w-20 px-3 py-2 border ${currentTheme.border} rounded-lg ${currentTheme.bg} text-center font-medium`}
                  />
                  <span className="text-sm opacity-60">of {totalPages}</span>
                </div>

                <button
                  onClick={() =>
                    goToPage(Math.min(totalPages, currentPage + 10))
                  }
                  className={`${currentTheme.secondary} p-2 rounded-lg hover:scale-105 transition-transform`}
                  title="Jump forward 10 pages"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </div>

              {/* Next Button */}
              <Button
                variant="ghost"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="disabled:opacity-30"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </footer>
      )}

      {/* ===========================================
          FLOATING ACTION BUTTON (Zen Mode Only)
          =========================================== */}
      {zenMode && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`w-14 h-14 rounded-full bg-gradient-to-r ${currentTheme.accent} text-white shadow-2xl hover:scale-110 transition-all disabled:opacity-30`}
          >
            <ChevronLeft className="w-6 h-6 mx-auto" />
          </button>

          <button
            onClick={() => setZenMode(false)}
            className={`w-14 h-14 rounded-full ${currentTheme.secondary} shadow-2xl hover:scale-110 transition-all`}
          >
            <Settings className="w-6 h-6 mx-auto" />
          </button>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`w-14 h-14 rounded-full bg-gradient-to-r ${currentTheme.accent} text-white shadow-2xl hover:scale-110 transition-all disabled:opacity-30`}
          >
            <ChevronRight className="w-6 h-6 mx-auto" />
          </button>
        </div>
      )}

      {/* ===========================================
          KEYBOARD SHORTCUTS HINT
          =========================================== */}
      {!zenMode && (
        <div className="fixed bottom-24 right-8 opacity-30 hover:opacity-100 transition-opacity">
          <div
            className={`${currentTheme.card} rounded-2xl p-4 text-xs space-y-2 border ${currentTheme.border}`}
          >
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 text-gray-100 rounded">
                ←
              </kbd>
              <kbd className="px-2 py-1 bg-gray-700 text-gray-100 rounded">
                →
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 text-gray-100 rounded">
                Ctrl
              </kbd>
              <kbd className="px-2 py-1 bg-gray-700 text-gray-100 rounded">
                F
              </kbd>
              <span>Focus Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 text-gray-100 rounded">
                Ctrl
              </kbd>
              <kbd className="px-2 py-1 bg-gray-700 text-gray-100 rounded">
                B
              </kbd>
              <span>Bookmark</span>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================
          🔥 LIVE CO-READING FEATURES (NEW!)
          =========================================== */}
      {!zenMode && (
        <>
          {/* Live Presence Indicator */}
          <LivePresenceIndicator
            readers={pageReaders}
            count={readerCount}
            isConnected={isConnected}
          />

          {/* Live Chat Widget */}
          <LiveChatWidget
            messages={messages}
            typingUsers={typingUsers}
            isLoadingMessages={isLoadingMessages}
            hasMoreMessages={hasMoreMessages}
            currentUserId={session?.user?.id}
            onSendMessage={sendMessage}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            onStartTyping={startTyping}
            onLoadMore={loadMoreMessages}
          />

          {/* Live Reactions */}
          <LiveReactions reactions={reactions} onReact={sendReaction} />
        </>
      )}
    </div>
  );
}
