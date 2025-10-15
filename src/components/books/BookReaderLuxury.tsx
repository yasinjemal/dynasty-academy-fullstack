"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import ListenModeLuxury from "./ListenModeLuxury";
import ReflectionModal, { type ReflectionData } from "./ReflectionModal";
import { useLiveCoReading } from "@/hooks/useLiveCoReading";
import LivePresenceIndicator from "./LivePresenceIndicator";
import LiveChatWidget from "./LiveChatWidget";
import LiveReactions from "./LiveReactions";
import QuickReactionBar from "./QuickReactionBar";
import SharePageLink from "./SharePageLink";
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
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // ===========================================
  // CORE READING STATE
  // ===========================================
  const [currentPage, setCurrentPage] = useState(1);

  // Handle deep linking to specific page
  useEffect(() => {
    const pageParam = searchParams?.get("page");
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        setCurrentPage(page);
      }
    }
  }, [searchParams, totalPages]);
  const [pageContent, setPageContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // ===========================================
  // LUXURY CUSTOMIZATION SETTINGS
  // ===========================================
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState<
    "serif" | "sans" | "mono" | "dyslexic" | "typewriter" | "elegant" | "modern"
  >("serif");
  const [theme, setTheme] = useState<
    | "light"
    | "sepia"
    | "dark"
    | "nord"
    | "ocean"
    | "sunset"
    | "forest"
    | "lavender"
    | "mocha"
    | "midnight"
    | "cherry"
    | "royal"
    | "mint"
    | "cosmic"
    | "rose"
  >("light");
  const [layout, setLayout] = useState<"standard" | "wide" | "narrow">(
    "standard"
  );
  const [columnMode, setColumnMode] = useState<1 | 2>(1);

  // ===========================================
  // 🎨 NEW LUXURY FEATURES!
  // ===========================================
  const [pageTransition, setPageTransition] = useState<
    "fade" | "slide" | "flip" | "none"
  >("fade");
  const [accentColor, setAccentColor] = useState<
    "purple" | "blue" | "pink" | "orange" | "green"
  >("purple");
  const [showReadingSpeedLive, setShowReadingSpeedLive] = useState(true);
  const [showAchievementToast, setShowAchievementToast] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<string>("");

  // 🎨 CUSTOM TEXT COLOR MIXER - ULTIMATE PERSONALIZATION!
  const [customTextColor, setCustomTextColor] = useState<string>("");
  const [useCustomTextColor, setUseCustomTextColor] = useState(false);

  // 🎭🌟 IMMERSIVE READING REVOLUTION - THE GAME CHANGER!
  const [atmospherePreset, setAtmospherePreset] = useState<string | null>(null);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [backgroundType, setBackgroundType] = useState<
    "image" | "video" | "gradient"
  >("gradient");
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.15);
  const [backgroundBlur, setBackgroundBlur] = useState(8);
  
  // 🎵🔥 NEXT LEVEL: AUDIO ATMOSPHERE SYNC (REVOLUTIONARY!)
  const [audioAtmosphere, setAudioAtmosphere] = useState(false);
  const [audioAtmosphereUrl, setAudioAtmosphereUrl] = useState<string>("");
  const [audioVolume, setAudioVolume] = useState(0.3);
  
  // 🌊✨ PARALLAX MAGIC (SUBTLE MOVEMENT FOR DEPTH)
  const [parallaxEffect, setParallaxEffect] = useState(false);
  const [parallaxIntensity, setParallaxIntensity] = useState(5);
  
  // ⏰🌅 TIME-BASED AUTO-SWITCHING (AI-POWERED)
  const [autoTimeSwitch, setAutoTimeSwitch] = useState(false);
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<"dawn" | "day" | "dusk" | "night">("day");

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
  // THEME DEFINITIONS (ULTRA-LUXURY PRESETS) - 15 AMAZING THEMES!
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
      name: "☀️ Light",
      description: "Clean and bright",
    },
    sepia: {
      bg: "bg-[#f4ecd8]",
      text: "text-[#5f4b32]",
      accent: "from-amber-600 to-orange-600",
      secondary: "bg-[#e8d7be]",
      border: "border-[#d4c5ad]",
      card: "bg-[#efe6d5]",
      gradient: "from-[#efe6d5] via-[#f4ecd8] to-[#efe6d5]",
      name: "📜 Sepia",
      description: "Classic paper",
    },
    dark: {
      bg: "bg-gray-900",
      text: "text-gray-100",
      accent: "from-purple-400 to-blue-400",
      secondary: "bg-gray-800",
      border: "border-gray-700",
      card: "bg-gray-800/50",
      gradient: "from-gray-900 via-gray-800 to-gray-900",
      name: "🌙 Dark",
      description: "Night reading",
    },
    nord: {
      bg: "bg-[#2e3440]",
      text: "text-[#eceff4]",
      accent: "from-[#88c0d0] to-[#81a1c1]",
      secondary: "bg-[#3b4252]",
      border: "border-[#4c566a]",
      card: "bg-[#3b4252]/50",
      gradient: "from-[#2e3440] via-[#3b4252] to-[#2e3440]",
      name: "❄️ Nord",
      description: "Arctic aurora",
    },
    ocean: {
      bg: "bg-[#0a192f]",
      text: "text-[#ccd6f6]",
      accent: "from-[#64ffda] to-[#00d4ff]",
      secondary: "bg-[#112240]",
      border: "border-[#233554]",
      card: "bg-[#112240]/50",
      gradient: "from-[#0a192f] via-[#112240] to-[#0a192f]",
      name: "🌊 Ocean",
      description: "Deep sea calm",
    },
    sunset: {
      bg: "bg-[#fff5f0]",
      text: "text-[#442817]",
      accent: "from-[#ff6b6b] to-[#ee5a24]",
      secondary: "bg-[#ffe8e0]",
      border: "border-[#ffd4c8]",
      card: "bg-[#fff0eb]",
      gradient: "from-[#fff0eb] via-[#fff5f0] to-[#fff0eb]",
      name: "🌅 Sunset",
      description: "Warm glow",
    },
    forest: {
      bg: "bg-[#1a2f1a]",
      text: "text-[#e8f5e8]",
      accent: "from-[#52c41a] to-[#73d13d]",
      secondary: "bg-[#234023]",
      border: "border-[#2d5a2d]",
      card: "bg-[#234023]/50",
      gradient: "from-[#1a2f1a] via-[#234023] to-[#1a2f1a]",
      name: "🌲 Forest",
      description: "Nature fresh",
    },
    lavender: {
      bg: "bg-[#f8f4ff]",
      text: "text-[#3d2e5f]",
      accent: "from-[#b37feb] to-[#9254de]",
      secondary: "bg-[#f0e7ff]",
      border: "border-[#e6d7ff]",
      card: "bg-[#f4edff]",
      gradient: "from-[#f4edff] via-[#f8f4ff] to-[#f4edff]",
      name: "💜 Lavender",
      description: "Soft luxury",
    },
    mocha: {
      bg: "bg-[#3a2f2f]",
      text: "text-[#f5e6d3]",
      accent: "from-[#d4a574] to-[#b8936a]",
      secondary: "bg-[#4a3f3f]",
      border: "border-[#5a4f4f]",
      card: "bg-[#4a3f3f]/50",
      gradient: "from-[#3a2f2f] via-[#4a3f3f] to-[#3a2f2f]",
      name: "☕ Mocha",
      description: "Cozy coffee",
    },
    midnight: {
      bg: "bg-[#0d1117]",
      text: "text-[#c9d1d9]",
      accent: "from-[#f78166] to-[#ea6045]",
      secondary: "bg-[#161b22]",
      border: "border-[#21262d]",
      card: "bg-[#161b22]/50",
      gradient: "from-[#0d1117] via-[#161b22] to-[#0d1117]",
      name: "🌌 Midnight",
      description: "GitHub dark",
    },
    // 🎨 NEW LUXURY THEMES!
    cherry: {
      bg: "bg-[#fff0f5]",
      text: "text-[#5c1a3d]",
      accent: "from-[#ff69b4] to-[#ff1493]",
      secondary: "bg-[#ffe4ef]",
      border: "border-[#ffc9e0]",
      card: "bg-[#ffebf3]",
      gradient: "from-[#ffebf3] via-[#fff0f5] to-[#ffebf3]",
      name: "🍒 Cherry",
      description: "Sweet bloom",
    },
    royal: {
      bg: "bg-[#1a0f2e]",
      text: "text-[#e0d4ff]",
      accent: "from-[#7c3aed] to-[#c026d3]",
      secondary: "bg-[#2d1b4e]",
      border: "border-[#4c2e7a]",
      card: "bg-[#2d1b4e]/50",
      gradient: "from-[#1a0f2e] via-[#2d1b4e] to-[#1a0f2e]",
      name: "👑 Royal",
      description: "Majestic purple",
    },
    mint: {
      bg: "bg-[#f0fff4]",
      text: "text-[#1a4d2e]",
      accent: "from-[#10b981] to-[#34d399]",
      secondary: "bg-[#dcfce7]",
      border: "border-[#bbf7d0]",
      card: "bg-[#e8fdf2]",
      gradient: "from-[#e8fdf2] via-[#f0fff4] to-[#e8fdf2]",
      name: "🍃 Mint",
      description: "Fresh breeze",
    },
    cosmic: {
      bg: "bg-[#0c0a1d]",
      text: "text-[#e0e7ff]",
      accent: "from-[#8b5cf6] to-[#3b82f6]",
      secondary: "bg-[#1e1b3c]",
      border: "border-[#312e5a]",
      card: "bg-[#1e1b3c]/50",
      gradient: "from-[#0c0a1d] via-[#1e1b3c] to-[#0c0a1d]",
      name: "🌠 Cosmic",
      description: "Space odyssey",
    },
    rose: {
      bg: "bg-[#fff5f7]",
      text: "text-[#4a1e2c]",
      accent: "from-[#f43f5e] to-[#fb7185]",
      secondary: "bg-[#ffe4e9]",
      border: "border-[#fecdd3]",
      card: "bg-[#ffecf0]",
      gradient: "from-[#ffecf0] via-[#fff5f7] to-[#ffecf0]",
      name: "🌹 Rose",
      description: "Elegant pink",
    },
  };

  const currentTheme = themes[theme];

  // ===========================================
  // FONT FAMILY OPTIONS - 7 BEAUTIFUL FONTS!
  // ===========================================
  const fontFamilies = {
    serif: {
      class: "font-serif",
      name: "📖 Serif",
      description: "Classic book",
    },
    sans: { class: "font-sans", name: "🔤 Sans", description: "Modern clean" },
    mono: { class: "font-mono", name: "💻 Mono", description: "Code style" },
    dyslexic: {
      class: "font-[OpenDyslexic,Arial]",
      name: "👁️ Dyslexic",
      description: "Easy reading",
    },
    typewriter: {
      class: "font-['Courier_New',monospace]",
      name: "⌨️ Typewriter",
      description: "Vintage feel",
    },
    elegant: {
      class: "font-['Georgia',serif]",
      name: "✨ Elegant",
      description: "Sophisticated",
    },
    modern: {
      class: "font-['Inter',sans-serif]",
      name: "🎯 Modern",
      description: "Fresh minimal",
    },
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
  // 🎭 ATMOSPHERE PRESETS - ONE-CLICK MAGIC!
  // NOW WITH AUDIO ATMOSPHERE SYNC! 🎵🔥
  // ===========================================
  const atmospherePresets = {
    "focus-flow": {
      name: "🎯 Focus Flow",
      description: "Deep concentration mode",
      audioUrl: "https://assets.mixkit.co/music/preview/mixkit-ocean-waves-loop-1196.mp3", // Ocean waves
      settings: {
        theme: "ocean" as const,
        fontFamily: "serif" as const,
        fontSize: 18,
        lineHeight: 1.8,
        focusMode: true,
        pageTransition: "fade" as const,
        accentColor: "blue" as const,
        backgroundUrl:
          "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80",
        backgroundType: "image" as const,
      },
    },
    "night-owl": {
      name: "🌙 Night Owl",
      description: "Perfect for late reading",
      audioUrl: "https://assets.mixkit.co/music/preview/mixkit-night-ambient-947.mp3", // Night ambience
      settings: {
        theme: "midnight" as const,
        fontFamily: "elegant" as const,
        fontSize: 20,
        lineHeight: 2.0,
        zenMode: true,
        pageTransition: "fade" as const,
        accentColor: "purple" as const,
        backgroundUrl:
          "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80",
        backgroundType: "image" as const,
      },
    },
    "speed-reader": {
      name: "⚡ Speed Reader",
      description: "Maximum reading velocity",
      audioUrl: "", // Silence for speed
      settings: {
        theme: "light" as const,
        fontFamily: "sans" as const,
        fontSize: 16,
        lineHeight: 1.6,
        autoScroll: true,
        pageTransition: "none" as const,
        accentColor: "orange" as const,
        backgroundUrl: "",
        backgroundType: "gradient" as const,
      },
    },
    "vintage-study": {
      name: "📜 Vintage Study",
      description: "Classic scholarly atmosphere",
      audioUrl: "https://assets.mixkit.co/music/preview/mixkit-fireplace-crackle-1330.mp3", // Fireplace ambience
      settings: {
        theme: "sepia" as const,
        fontFamily: "typewriter" as const,
        fontSize: 18,
        lineHeight: 1.9,
        columnMode: 2 as const,
        pageTransition: "slide" as const,
        accentColor: "orange" as const,
        backgroundUrl:
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80",
        backgroundType: "image" as const,
      },
    },
    "zen-garden": {
      name: "🌸 Zen Garden",
      description: "Peaceful mindful reading",
      audioUrl: "https://assets.mixkit.co/music/preview/mixkit-zen-garden-958.mp3", // Zen meditation
      settings: {
        theme: "mint" as const,
        fontFamily: "elegant" as const,
        fontSize: 19,
        lineHeight: 2.2,
        zenMode: true,
        pageTransition: "fade" as const,
        accentColor: "green" as const,
        backgroundUrl:
          "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80",
        backgroundType: "image" as const,
      },
    },
    "luxury-lounge": {
      name: "💎 Luxury Lounge",
      description: "Premium reading experience",
      audioUrl: "https://assets.mixkit.co/music/preview/mixkit-jazz-lounge-547.mp3", // Smooth jazz
      settings: {
        theme: "royal" as const,
        fontFamily: "elegant" as const,
        fontSize: 20,
        lineHeight: 2.0,
        layout: "wide" as const,
        pageTransition: "flip" as const,
        accentColor: "purple" as const,
        backgroundUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80",
        backgroundType: "image" as const,
      },
    },
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

          // 🔥 STREAK ACHIEVEMENTS - LUXURY GAMIFICATION
          const currentStreak = stats.streak || 0;
          if (
            currentStreak === 3 &&
            !localStorage.getItem(`achievement-streak-3`)
          ) {
            setCurrentAchievement("🔥 3 Day Streak - Building Momentum!");
            setShowAchievementToast(true);
            localStorage.setItem(`achievement-streak-3`, "true");
            setTimeout(() => setShowAchievementToast(false), 4000);
          }
          if (
            currentStreak === 7 &&
            !localStorage.getItem(`achievement-streak-7`)
          ) {
            setCurrentAchievement("🔥 7 Day Streak - One Week Strong!");
            setShowAchievementToast(true);
            localStorage.setItem(`achievement-streak-7`, "true");
            setTimeout(() => setShowAchievementToast(false), 4000);
          }
          if (
            currentStreak === 30 &&
            !localStorage.getItem(`achievement-streak-30`)
          ) {
            setCurrentAchievement("🔥 30 Day Streak - Reading Habit Master!");
            setShowAchievementToast(true);
            localStorage.setItem(`achievement-streak-30`, "true");
            setTimeout(() => setShowAchievementToast(false), 5000);
          }
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
  // ⏰🌅 TIME-BASED AUTO-SWITCHING (AI-POWERED MAGIC!)
  // ===========================================
  useEffect(() => {
    if (!autoTimeSwitch) return;
    
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 8) {
        setCurrentTimeOfDay("dawn");
        // Auto-apply zen garden for peaceful morning
        if (atmospherePreset !== "zen-garden") {
          applyAtmospherePreset("zen-garden");
        }
      } else if (hour >= 8 && hour < 17) {
        setCurrentTimeOfDay("day");
        // Auto-apply focus flow for productive day
        if (atmospherePreset !== "focus-flow") {
          applyAtmospherePreset("focus-flow");
        }
      } else if (hour >= 17 && hour < 20) {
        setCurrentTimeOfDay("dusk");
        // Auto-apply vintage study for cozy evening
        if (atmospherePreset !== "vintage-study") {
          applyAtmospherePreset("vintage-study");
        }
      } else {
        setCurrentTimeOfDay("night");
        // Auto-apply night owl for late reading
        if (atmospherePreset !== "night-owl") {
          applyAtmospherePreset("night-owl");
        }
      }
    };
    
    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [autoTimeSwitch, atmospherePreset]);

  // ===========================================
  // 🌊✨ PARALLAX EFFECT (SUBTLE DEPTH MAGIC!)
  // ===========================================
  useEffect(() => {
    if (!parallaxEffect || !immersiveMode) return;
    
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const background = document.getElementById("immersive-background");
      if (background) {
        const offset = scrolled * (parallaxIntensity / 100);
        background.style.transform = `translateY(${offset}px) scale(1.1)`;
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parallaxEffect, immersiveMode, parallaxIntensity]);

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

      // 🏆 ACHIEVEMENT TRACKING - LUXURY GAMIFICATION
      const newCompletion = (pageNum / totalPages) * 100;

      // First page achievement
      if (
        pageNum === 1 &&
        !localStorage.getItem(`achievement-first-page-${bookId}`)
      ) {
        setCurrentAchievement("📖 Reading Journey Started!");
        setShowAchievementToast(true);
        localStorage.setItem(`achievement-first-page-${bookId}`, "true");
        setTimeout(() => setShowAchievementToast(false), 4000);
      }

      // 25% completion
      if (
        newCompletion >= 25 &&
        newCompletion < 26 &&
        !localStorage.getItem(`achievement-25-${bookId}`)
      ) {
        setCurrentAchievement("🎯 25% Complete - You're On Fire!");
        setShowAchievementToast(true);
        localStorage.setItem(`achievement-25-${bookId}`, "true");
        setTimeout(() => setShowAchievementToast(false), 4000);
      }

      // 50% completion
      if (
        newCompletion >= 50 &&
        newCompletion < 51 &&
        !localStorage.getItem(`achievement-50-${bookId}`)
      ) {
        setCurrentAchievement("🌟 Halfway There - Keep Going!");
        setShowAchievementToast(true);
        localStorage.setItem(`achievement-50-${bookId}`, "true");
        setTimeout(() => setShowAchievementToast(false), 4000);
      }

      // 75% completion
      if (
        newCompletion >= 75 &&
        newCompletion < 76 &&
        !localStorage.getItem(`achievement-75-${bookId}`)
      ) {
        setCurrentAchievement("💪 75% Done - Almost Finished!");
        setShowAchievementToast(true);
        localStorage.setItem(`achievement-75-${bookId}`, "true");
        setTimeout(() => setShowAchievementToast(false), 4000);
      }

      // 100% completion
      if (
        newCompletion >= 100 &&
        !localStorage.getItem(`achievement-100-${bookId}`)
      ) {
        setCurrentAchievement("🏆 Book Completed - Amazing Work!");
        setShowAchievementToast(true);
        localStorage.setItem(`achievement-100-${bookId}`, "true");
        setTimeout(() => setShowAchievementToast(false), 5000);
      }

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

  // ===========================================
  // 🎭 APPLY ATMOSPHERE PRESET - MAGIC TRANSFORMATION!
  // NOW WITH AUDIO SYNC! 🎵🔥
  // ===========================================
  const applyAtmospherePreset = (presetKey: string) => {
    const preset =
      atmospherePresets[presetKey as keyof typeof atmospherePresets];
    if (!preset) return;

    const settings = preset.settings;

    // Apply all settings with type-safe checks
    if (settings.theme) setTheme(settings.theme);
    if (settings.fontFamily) setFontFamily(settings.fontFamily);
    if (settings.fontSize) setFontSize(settings.fontSize);
    if (settings.lineHeight) setLineHeight(settings.lineHeight);
    if ("layout" in settings && settings.layout) setLayout(settings.layout);
    if ("columnMode" in settings && settings.columnMode)
      setColumnMode(settings.columnMode);
    if (settings.pageTransition) setPageTransition(settings.pageTransition);
    if (settings.accentColor) setAccentColor(settings.accentColor);

    // Apply modes with safe checks
    setFocusMode("focusMode" in settings ? settings.focusMode : false);
    setZenMode("zenMode" in settings ? settings.zenMode : false);
    setAutoScroll("autoScroll" in settings ? settings.autoScroll : false);

    // Apply immersive background
    if (settings.backgroundUrl) {
      setBackgroundUrl(settings.backgroundUrl);
      setBackgroundType(settings.backgroundType);
      setImmersiveMode(true);
    } else {
      setImmersiveMode(false);
    }
    
    // 🎵🔥 REVOLUTIONARY: Apply audio atmosphere!
    if (preset.audioUrl && audioAtmosphere) {
      setAudioAtmosphereUrl(preset.audioUrl);
      // Audio will auto-play via the audio element
    }

    setAtmospherePreset(presetKey);

    // Show success toast with audio indicator
    const audioStatus = audioAtmosphere && preset.audioUrl ? " + 🎵 Audio" : "";
    setCurrentAchievement(`${preset.name}${audioStatus} Activated!`);
    setShowAchievementToast(true);
    setTimeout(() => setShowAchievementToast(false), 3000);
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
      className={`min-h-screen flex flex-col ${currentTheme.bg} ${currentTheme.text} transition-colors duration-500 relative`}
    >
      {/* ===========================================
          🌟 IMMERSIVE BACKGROUND REVOLUTION 🌟
          Cinema-Quality Reading Atmosphere
          =========================================== */}
      {immersiveMode && backgroundUrl && (
        <div 
          id="immersive-background"
          className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
          style={{
            transition: parallaxEffect ? "transform 0.1s ease-out" : "none"
          }}
        >
          {backgroundType === "image" && (
            <div
              className="w-full h-full bg-cover bg-center transition-all duration-1000"
              style={{
                backgroundImage: `url(${backgroundUrl})`,
                filter: `blur(${backgroundBlur}px)`,
                opacity: backgroundOpacity,
              }}
            />
          )}
          {backgroundType === "video" && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-all duration-1000"
              style={{
                filter: `blur(${backgroundBlur}px)`,
                opacity: backgroundOpacity,
              }}
            >
              <source src={backgroundUrl} type="video/mp4" />
            </video>
          )}
          {backgroundType === "gradient" && (
            <div
              className="w-full h-full transition-all duration-1000"
              style={{
                background: backgroundUrl, // CSS gradient string
                filter: `blur(${backgroundBlur}px)`,
                opacity: backgroundOpacity,
              }}
            />
          )}
        </div>
      )}
      
      {/* 🎵🔥 AUDIO ATMOSPHERE (REVOLUTIONARY SYNC!) */}
      {audioAtmosphere && audioAtmosphereUrl && (
        <audio
          autoPlay
          loop
          src={audioAtmosphereUrl}
          style={{ display: "none" }}
          ref={(audio) => {
            if (audio) audio.volume = audioVolume;
          }}
        />
      )}

      {/* All content now sits above immersive background */}
      <div className="relative z-10">
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

                {/* Center: LUXURY Progress Ring + Live Stats */}
                <div className="hidden lg:flex items-center gap-6 px-8">
                  {/* Circular Progress Ring */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 28 * (1 - completionPercentage / 100)
                        }`}
                        className="transition-all duration-500"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            className="text-purple-500"
                            stopColor="currentColor"
                          />
                          <stop
                            offset="100%"
                            className="text-pink-500"
                            stopColor="currentColor"
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold">
                        {Math.round(completionPercentage)}%
                      </span>
                      <Target className="w-3 h-3 text-purple-500" />
                    </div>
                  </div>

                  {/* Live Reading Speed */}
                  {showReadingSpeedLive && (
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-orange-500">
                          {readingSpeed} WPM
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-60">
                        <Clock className="w-3 h-3" />
                        <span>{readingTime} min today</span>
                      </div>
                    </div>
                  )}
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

              {/* Sub-header: Quick Actions - Enhanced Visibility! */}
              <div className="flex items-center justify-between pb-3 border-t border-gray-200/50 dark:border-gray-700/50 mt-2 pt-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFocusMode(!focusMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 shadow-md ${
                      focusMode
                        ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg shadow-purple-500/30 border-transparent scale-105`
                        : `${currentTheme.secondary} border-gray-300 dark:border-gray-600 hover:scale-105 hover:border-purple-400 hover:shadow-lg`
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Focus
                  </button>

                  <button
                    onClick={() => setZenMode(!zenMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 shadow-md ${
                      zenMode
                        ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg shadow-purple-500/30 border-transparent scale-105`
                        : `${currentTheme.secondary} border-gray-300 dark:border-gray-600 hover:scale-105 hover:border-blue-400 hover:shadow-lg`
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Zen
                  </button>

                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 shadow-md ${
                      autoScroll
                        ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg shadow-purple-500/30 border-transparent scale-105`
                        : `${currentTheme.secondary} border-gray-300 dark:border-gray-600 hover:scale-105 hover:border-green-400 hover:shadow-lg`
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

                {/* Theme Selection - 10 LUXURY THEMES! */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Reading Theme
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(themes).map(([themeKey, themeData]) => (
                      <button
                        key={themeKey}
                        onClick={() => setTheme(themeKey as any)}
                        className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                          theme === themeKey
                            ? "border-purple-500 shadow-lg shadow-purple-500/30 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                        }`}
                        title={themeData.description}
                      >
                        <div
                          className={`w-full aspect-square rounded-lg ${themeData.bg} border-2 ${themeData.border} shadow-inner relative overflow-hidden`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${themeData.accent} opacity-20`}
                          />
                          {theme === themeKey && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-6 h-6 text-purple-600 dark:text-purple-400 drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold text-center ${
                            theme === themeKey
                              ? "text-purple-600 dark:text-purple-400"
                              : "opacity-70"
                          }`}
                        >
                          {themeData.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center opacity-60 italic">
                    ✨ Choose your perfect reading atmosphere
                  </p>
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
                    {(
                      [
                        "serif",
                        "sans",
                        "mono",
                        "dyslexic",
                        "typewriter",
                        "elegant",
                        "modern",
                      ] as const
                    ).map((font) => (
                      <button
                        key={font}
                        onClick={() => setFontFamily(font)}
                        className={`px-3 py-2.5 rounded-xl border-2 transition-all hover:scale-105 ${
                          fontFamily === font
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20"
                            : `border-gray-300 dark:border-gray-600 ${currentTheme.secondary}`
                        }`}
                      >
                        <div
                          className={`${fontFamilies[font].class} text-lg font-bold mb-1`}
                        >
                          Ag
                        </div>
                        <div className="text-xs opacity-60">
                          {fontFamilies[font].name}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center opacity-50">
                    ✍️ Choose your perfect reading font
                  </p>
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

                {/* 🎨 NEW! Page Transition Effect */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Luxury Effects
                  </h3>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold opacity-60">
                      Page Turn Animation
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {(["fade", "slide", "flip", "none"] as const).map(
                        (transition) => (
                          <button
                            key={transition}
                            onClick={() => setPageTransition(transition)}
                            className={`px-3 py-2 rounded-xl border-2 capitalize transition-all text-xs ${
                              pageTransition === transition
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                                : `border-gray-300 dark:border-gray-600 ${currentTheme.secondary} hover:border-purple-300`
                            }`}
                          >
                            {transition}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Accent Color Selector */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold opacity-60">
                      Accent Color
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                      {(
                        [
                          { name: "purple", color: "bg-purple-500" },
                          { name: "blue", color: "bg-blue-500" },
                          { name: "pink", color: "bg-pink-500" },
                          { name: "orange", color: "bg-orange-500" },
                          { name: "green", color: "bg-green-500" },
                        ] as const
                      ).map((accent) => (
                        <button
                          key={accent.name}
                          onClick={() => setAccentColor(accent.name)}
                          className={`relative w-full aspect-square rounded-xl border-2 transition-all hover:scale-110 ${
                            accentColor === accent.name
                              ? "border-purple-500 shadow-lg scale-105"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute inset-0 rounded-lg ${accent.color}`}
                          />
                          {accentColor === accent.name && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Reading Speed Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold">
                        Show Reading Speed
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setShowReadingSpeedLive(!showReadingSpeedLive)
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        showReadingSpeedLive
                          ? "bg-purple-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          showReadingSpeedLive
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* 🎨 CUSTOM TEXT COLOR MIXER - ULTIMATE PERSONALIZATION! */}
                  <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Custom Text Color
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customTextColor || "#000000"}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-purple-300"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={customTextColor}
                            onChange={(e) => setCustomTextColor(e.target.value)}
                            placeholder="#000000"
                            className="w-full px-3 py-2 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                        <span className="text-xs font-semibold">
                          Use Custom Color
                        </span>
                        <button
                          onClick={() =>
                            setUseCustomTextColor(!useCustomTextColor)
                          }
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            useCustomTextColor
                              ? "bg-purple-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                              useCustomTextColor
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      {useCustomTextColor && customTextColor && (
                        <div className="p-3 rounded-lg border-2 border-purple-300 bg-white dark:bg-gray-800">
                          <p
                            style={{ color: customTextColor }}
                            className="text-sm font-semibold"
                          >
                            Preview: This is how your text will look! 📖
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-center opacity-60">
                      🎨 Mix your perfect reading color
                    </p>
                  </div>

                  {/* 🎭🌟 ATMOSPHERE PRESETS - ONE-CLICK MOOD TRANSFORMATION! */}
                  <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30 rounded-xl border-2 border-purple-300 dark:border-purple-700 shadow-xl">
                    <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      🎭 Atmosphere Presets
                    </h3>
                    <p className="text-xs opacity-70 text-center">
                      ✨ Transform your reading experience in one click
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(atmospherePresets).map(
                        ([key, preset]) => (
                          <button
                            key={key}
                            onClick={() => applyAtmospherePreset(key)}
                            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${
                              atmospherePreset === key
                                ? "border-purple-500 bg-purple-100 dark:bg-purple-900/40 shadow-lg ring-2 ring-purple-300"
                                : "border-purple-200 dark:border-purple-700 bg-white/50 dark:bg-black/20 hover:border-purple-400"
                            }`}
                          >
                            <div className="text-3xl mb-2 filter drop-shadow">
                              {preset.name.split(" ")[0]}
                            </div>
                            <div className="font-bold text-sm">
                              {preset.name.split(" ").slice(1).join(" ")}
                            </div>
                            <div className="text-xs opacity-60 mt-1 line-clamp-2">
                              {preset.description}
                            </div>
                            {atmospherePreset === key && (
                              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                                <Check className="w-3 h-3" />
                                Active
                              </div>
                            )}
                          </button>
                        )
                      )}
                    </div>

                    {atmospherePreset && (
                      <button
                        onClick={() => {
                          setAtmospherePreset(null);
                          setImmersiveMode(false);
                        }}
                        className="w-full py-2 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-semibold"
                      >
                        Clear Preset
                      </button>
                    )}
                  </div>

                  {/* 🌟 IMMERSIVE BACKGROUND CONTROLS - CINEMA-QUALITY READING! */}
                  <div className="space-y-4 p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 shadow-xl">
                    <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      🌟 Immersive Backgrounds
                    </h3>
                    <p className="text-xs opacity-70 text-center">
                      🎬 Create your perfect reading atmosphere
                    </p>

                    {/* Immersive Mode Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-black/30 rounded-xl border border-indigo-200 dark:border-indigo-700">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-bold">
                          Immersive Mode
                        </span>
                      </div>
                      <button
                        onClick={() => setImmersiveMode(!immersiveMode)}
                        className={`relative w-14 h-7 rounded-full transition-all ${
                          immersiveMode
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                            immersiveMode ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {immersiveMode && (
                      <>
                        {/* Background Type Selector */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold opacity-70">
                            Background Type
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {(["image", "video", "gradient"] as const).map(
                              (type) => (
                                <button
                                  key={type}
                                  onClick={() => setBackgroundType(type)}
                                  className={`px-3 py-2 rounded-lg border-2 capitalize transition-all text-xs font-semibold ${
                                    backgroundType === type
                                      ? "border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 shadow-md"
                                      : "border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 hover:border-indigo-300"
                                  }`}
                                >
                                  {type}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Background URL Input */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold opacity-70">
                            Background URL
                          </h4>
                          <input
                            type="text"
                            value={backgroundUrl}
                            onChange={(e) => setBackgroundUrl(e.target.value)}
                            placeholder={
                              backgroundType === "gradient"
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : "https://images.unsplash.com/..."
                            }
                            className="w-full px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:outline-none text-sm"
                          />
                          <p className="text-xs opacity-60">
                            💡 Tip: Use Unsplash for stunning images!
                          </p>
                        </div>

                        {/* Background Opacity Slider */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold opacity-70">
                              Opacity
                            </h4>
                            <span className="text-xs font-mono bg-white dark:bg-black/40 px-2 py-1 rounded">
                              {Math.round(backgroundOpacity * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={backgroundOpacity}
                            onChange={(e) =>
                              setBackgroundOpacity(parseFloat(e.target.value))
                            }
                            className="w-full h-2 bg-gradient-to-r from-transparent to-indigo-500 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, transparent 0%, rgba(99, 102, 241, ${backgroundOpacity}) 100%)`,
                            }}
                          />
                        </div>

                        {/* Background Blur Slider */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold opacity-70">
                              Blur Amount
                            </h4>
                            <span className="text-xs font-mono bg-white dark:bg-black/40 px-2 py-1 rounded">
                              {backgroundBlur}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={backgroundBlur}
                            onChange={(e) =>
                              setBackgroundBlur(parseInt(e.target.value))
                            }
                            className="w-full h-2 bg-gradient-to-r from-indigo-200 to-indigo-500 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Quick Background Suggestions */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold opacity-70">
                            Quick Suggestions
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                name: "Beach",
                                url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                              },
                              {
                                name: "Mountains",
                                url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
                              },
                              {
                                name: "Forest",
                                url: "https://images.unsplash.com/photo-1511497584788-876760111969",
                              },
                              {
                                name: "City",
                                url: "https://images.unsplash.com/photo-1514565131-fce0801e5785",
                              },
                            ].map((suggestion) => (
                              <button
                                key={suggestion.name}
                                onClick={() => {
                                  setBackgroundUrl(suggestion.url);
                                  setBackgroundType("image");
                                }}
                                className="px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-xs font-semibold"
                              >
                                {suggestion.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preview */}
                        {backgroundUrl && (
                          <div className="p-3 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-white/50 dark:bg-black/30">
                            <p className="text-xs font-semibold mb-2 opacity-70">
                              Preview
                            </p>
                            <div className="relative h-24 rounded-lg overflow-hidden">
                              <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                  backgroundImage:
                                    backgroundType === "image"
                                      ? `url(${backgroundUrl})`
                                      : undefined,
                                  background:
                                    backgroundType === "gradient"
                                      ? backgroundUrl
                                      : undefined,
                                  filter: `blur(${backgroundBlur}px)`,
                                  opacity: backgroundOpacity,
                                }}
                              />
                              <div className="relative z-10 flex items-center justify-center h-full">
                                <p className="text-sm font-bold drop-shadow-lg">
                                  Your Reading Text
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* 🔥🎵 AUDIO ATMOSPHERE CONTROLS (REVOLUTIONARY!) */}
                    <div className="space-y-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎵</span>
                          <span className="text-sm font-bold">Audio Atmosphere</span>
                        </div>
                        <button
                          onClick={() => setAudioAtmosphere(!audioAtmosphere)}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            audioAtmosphere
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              audioAtmosphere ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      
                      {audioAtmosphere && (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-semibold opacity-70">
                                Audio Volume
                              </h4>
                              <span className="text-xs font-mono bg-white dark:bg-black/40 px-2 py-1 rounded">
                                {Math.round(audioVolume * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={audioVolume}
                              onChange={(e) =>
                                setAudioVolume(parseFloat(e.target.value))
                              }
                              className="w-full h-2 bg-gradient-to-r from-purple-300 to-pink-500 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <p className="text-xs opacity-60 text-center">
                            🎧 Ambient sounds sync with your atmosphere
                          </p>
                        </>
                      )}
                    </div>

                    {/* 🌊✨ PARALLAX EFFECT CONTROLS (DEPTH MAGIC!) */}
                    {immersiveMode && (
                      <div className="space-y-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🌊</span>
                            <span className="text-sm font-bold">Parallax Effect</span>
                          </div>
                          <button
                            onClick={() => setParallaxEffect(!parallaxEffect)}
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              parallaxEffect
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                parallaxEffect ? "translate-x-7" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        
                        {parallaxEffect && (
                          <>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold opacity-70">
                                  Intensity
                                </h4>
                                <span className="text-xs font-mono bg-white dark:bg-black/40 px-2 py-1 rounded">
                                  {parallaxIntensity}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="20"
                                step="1"
                                value={parallaxIntensity}
                                onChange={(e) =>
                                  setParallaxIntensity(parseInt(e.target.value))
                                }
                                className="w-full h-2 bg-gradient-to-r from-blue-300 to-cyan-500 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <p className="text-xs opacity-60 text-center">
                              ✨ Subtle background movement as you scroll
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {/* ⏰🌅 TIME-BASED AUTO-SWITCHING (AI-POWERED!) */}
                    <div className="space-y-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⏰</span>
                          <span className="text-sm font-bold">Smart Time Switching</span>
                        </div>
                        <button
                          onClick={() => setAutoTimeSwitch(!autoTimeSwitch)}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            autoTimeSwitch
                              ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              autoTimeSwitch ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      
                      {autoTimeSwitch && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={`p-2 rounded-lg ${currentTimeOfDay === "dawn" ? "bg-orange-200 dark:bg-orange-900/40 font-bold" : "bg-white/50 dark:bg-black/20"}`}>
                              🌅 Dawn (5-8am)
                            </div>
                            <div className={`p-2 rounded-lg ${currentTimeOfDay === "day" ? "bg-blue-200 dark:bg-blue-900/40 font-bold" : "bg-white/50 dark:bg-black/20"}`}>
                              ☀️ Day (8am-5pm)
                            </div>
                            <div className={`p-2 rounded-lg ${currentTimeOfDay === "dusk" ? "bg-purple-200 dark:bg-purple-900/40 font-bold" : "bg-white/50 dark:bg-black/20"}`}>
                              🌆 Dusk (5-8pm)
                            </div>
                            <div className={`p-2 rounded-lg ${currentTimeOfDay === "night" ? "bg-indigo-200 dark:bg-indigo-900/40 font-bold" : "bg-white/50 dark:bg-black/20"}`}>
                              🌙 Night (8pm-5am)
                            </div>
                          </div>
                          <p className="text-xs opacity-60 text-center">
                            🤖 AI automatically switches atmosphere based on time
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-center opacity-60 pt-2 border-t border-indigo-200 dark:border-indigo-700">
                      🎬 Cinema-quality reading experience
                    </p>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setFontSize(18);
                    setLineHeight(1.8);
                    setFontFamily("serif");
                    setTheme("light");
                    setPageTransition("fade");
                    setAccentColor("purple");
                    setShowReadingSpeedLive(true);
                    setCustomTextColor("");
                    setUseCustomTextColor(false);
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
                    <span className="text-sm opacity-60">
                      Total Reading Time
                    </span>
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
                      {/* Reading Content - LUXURY PAGE TRANSITIONS! */}
                      <article
                        ref={contentRef}
                        className={`
                        prose prose-lg max-w-none leading-relaxed 
                        transition-all duration-500
                        ${
                          // 🎨 LUXURY PAGE TURN ANIMATIONS!
                          pageTransition === "fade" && isTransitioning
                            ? "opacity-0"
                            : pageTransition === "slide" && isTransitioning
                            ? "opacity-0 translate-x-8"
                            : pageTransition === "flip" && isTransitioning
                            ? "opacity-0 scale-95 rotate-3"
                            : "opacity-100 translate-x-0 scale-100 rotate-0"
                        }
                        ${fontFamilies[fontFamily].class}
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
                          ...(useCustomTextColor && customTextColor
                            ? { color: customTextColor }
                            : {}),
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

            {/* Quick Reaction Bar */}
            <QuickReactionBar onReact={sendReaction} currentTextIndex={0} />

            {/* Share Page Link */}
            <SharePageLink
              bookSlug={slug}
              currentPage={currentPage}
              bookTitle={bookTitle}
            />
          </>
        )}
      </div>{" "}
      {/* End of z-10 content wrapper */}
      {/* ✨ ACHIEVEMENT TOAST NOTIFICATION - LUXURY GAMIFICATION */}
      {showAchievementToast && (
        <div className="fixed top-24 right-8 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-1 rounded-2xl shadow-2xl">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">
                    {currentAchievement}
                  </h4>
                  <p className="text-white/60 text-sm">
                    Keep up the great work!
                  </p>
                </div>
                <button
                  onClick={() => setShowAchievementToast(false)}
                  className="ml-4 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
