"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import ListenModeLuxury from "./ListenModeLuxury";
import ReflectionModal, { type ReflectionData } from "./ReflectionModal";
import { useLiveCoReading } from "@/hooks/useLiveCoReading";
import LivePresenceIndicator from "./LivePresenceIndicator";
import LiveChatWidget from "./LiveChatWidget";
import LiveReactions from "./LiveReactions";
import { useContextualIntelligence } from "@/hooks/useContextualIntelligence";
import { IntelligenceInsightsPanel } from "@/components/intelligence/IntelligenceInsightsPanel";
import ParticleEffect from "./ParticleEffect";
import QuoteShareModal from "./QuoteShareModal";
import VideoBackground from "./VideoBackground";
import VideoControls from "./VideoControls";
import ReaderAICoach from "./ReaderAICoach";
import { ContentFormatter } from "@/lib/bookContent/contentFormatter";
import { useFastBookReader } from "@/hooks/useFastBookReader";
import InsanePageFlip from "./InsanePageFlip";
import { useIsMobile, useScreenSize } from "@/hooks/useMediaQuery";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
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
  Mic,
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
  // 📱 MOBILE-FIRST RESPONSIVE STATE
  // ===========================================
  const isMobile = useIsMobile();
  const { isTablet, isDesktop, isTouchDevice } = useScreenSize();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);

  // ===========================================
  // CORE READING STATE
  // ===========================================
  const [currentPage, setCurrentPage] = useState(1);
  const [readingSpeed, setReadingSpeed] = useState(250); // WPM - Moved here for cache hook

  // 🚀 BLAZING FAST CACHE - Instant Page Loads (30-40x faster!)
  const {
    pageContent: cachedContent,
    loading: cacheLoading,
    error: cacheError,
    wordCount: cachedWordCount,
    estimatedReadTime: cachedReadTime,
    goToPage,
    nextPage: goNextPage,
    previousPage: goPreviousPage,
    cacheStats,
  } = useFastBookReader({
    bookId,
    slug,
    totalPages,
    initialPage: currentPage,
    readingSpeed,
    onPageChange: (page) => {
      setCurrentPage(page);
    },
  });

  // Handle deep linking to specific page
  useEffect(() => {
    const pageParam = searchParams?.get("page");
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        setCurrentPage(page);
        goToPage(page); // Use cached navigation
      }
    }
  }, [searchParams, totalPages, goToPage]);

  // Sync cached content to local state
  const [pageContent, setPageContent] = useState<string>("");
  useEffect(() => {
    if (cachedContent) {
      setPageContent(cachedContent);
    }
  }, [cachedContent]);

  const [loading, setLoading] = useState(false);
  // Sync cache loading state
  useEffect(() => {
    setLoading(cacheLoading);
  }, [cacheLoading]);

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

  // 🎬 PAGE FLIP ANIMATION INTENSITY - USER CONTROL!
  const [animationIntensity, setAnimationIntensity] = useState<
    "off" | "subtle" | "normal" | "insane"
  >("normal");
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

  // 🔊 PRO-LEVEL BROWSER NARRATOR (FREE FOR ALL USERS!)
  const [isNarrating, setIsNarrating] = useState(false);
  const [narratorPaused, setNarratorPaused] = useState(false);
  const [narratorVoice, setNarratorVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [narratorRate, setNarratorRate] = useState(1.0);
  const [narratorPitch, setNarratorPitch] = useState(1.0);
  const [narratorVolume, setNarratorVolume] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [autoAdvancePage, setAutoAdvancePage] = useState(true);
  const [narratorProgress, setNarratorProgress] = useState(0);
  const [showNarratorControls, setShowNarratorControls] = useState(false);
  const narratorUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 🎤 LIP SYNC / WORD HIGHLIGHTING MAGIC!
  const [currentReadingWord, setCurrentReadingWord] = useState<number>(-1);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [highlightColor, setHighlightColor] = useState<
    "yellow" | "green" | "blue" | "purple" | "pink"
  >("yellow");
  const narratorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🎙️ COMMUNITY NARRATOR - USERS RECORD & SHARE! 🔥
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [communityNarrations, setCommunityNarrations] = useState<any[]>([]);
  const [showCommunityPanel, setShowCommunityPanel] = useState(false);
  const [playingCommunityAudio, setPlayingCommunityAudio] = useState<
    string | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const communityAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const [parallaxIntensity, setParallaxIntensity] = useState(5);

  // ⏰🌅 TIME-BASED AUTO-SWITCHING (AI-POWERED)
  const [autoTimeSwitch, setAutoTimeSwitch] = useState(false);
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<
    "dawn" | "day" | "dusk" | "night"
  >("day");

  // ✨📤 PHASE 4: QUOTE SHARING SYSTEM
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuoteText, setSelectedQuoteText] = useState("");

  // ✨🌟 PARTICLE EFFECTS - MAGICAL ATMOSPHERE (PHASE 2)
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [particleType, setParticleType] = useState<
    "stars" | "fireflies" | "snow" | "sakura" | "sparkles" | "none"
  >("stars");
  const [particleDensity, setParticleDensity] = useState(50); // 0-100

  // 🎥✨ PHASE 5: AMBIENT BACKGROUND VIDEOS - CINEMATIC IMMERSION
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string>("none");
  const [customVideo, setCustomVideo] = useState<string | null>(null);
  const [videoOpacity, setVideoOpacity] = useState(30); // 0-100
  const [videoBlur, setVideoBlur] = useState(0); // 0-20
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);

  // ===========================================
  // 🔥💎 INSANE LUXURY FEATURES - NEVER SEEN BEFORE! 🔥💎
  // ===========================================

  // 🧠 BINAURAL BEATS - Brain Wave Optimization
  const [binauralBeats, setBinauralBeats] = useState(false);
  const [brainWaveType, setBrainWaveType] = useState<
    "alpha" | "beta" | "theta" | "gamma"
  >("alpha");
  const [binauralVolume, setBinauralVolume] = useState(0.2);

  // 🎭 VOICE-SYNCED TEXT ANIMATION - Karaoke Reading
  const [voiceSync, setVoiceSync] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [highlightedText, setHighlightedText] = useState<string>("");

  // 🤖 AI READING COMPANION - ChatGPT for Every Book
  const [aiCompanionOpen, setAICompanionOpen] = useState(false);
  const [aiMessages, setAIMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [aiInputText, setAIInputText] = useState("");
  const [aiLoading, setAILoading] = useState(false);

  // 🎨 DYNAMIC CHAPTER ILLUSTRATIONS - AI Generated Art
  const [chapterIllustrations, setChapterIllustrations] = useState<
    Record<number, string>
  >({});
  const [showChapterArt, setShowChapterArt] = useState(true);
  const [illustrationStyle, setIllustrationStyle] = useState<
    "watercolor" | "oil-painting" | "sketch" | "3d" | "anime"
  >("watercolor");

  // 🎵 SMART SOUNDTRACK - AI Music Generation
  const [smartSoundtrack, setSmartSoundtrack] = useState(false);
  const [currentMoodMusic, setCurrentMoodMusic] = useState<string>("");
  const [musicMood, setMusicMood] = useState<
    "calm" | "intense" | "mysterious" | "joyful" | "melancholic"
  >("calm");

  // 👁️ EYE-TRACKING OPTIMIZATION (Future: WebGazer.js)
  const [eyeTracking, setEyeTracking] = useState(false);
  const [optimalWordSpacing, setOptimalWordSpacing] = useState(0);
  const [readingHeatmap, setReadingHeatmap] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // 🏆 ADVANCED GAMIFICATION
  const [dynastyLevel, setDynastyLevel] = useState(1);
  const [prestigeRank, setPrestigeRank] = useState(0);
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(1000);
  const [readerClass, setReaderClass] = useState<
    "warrior" | "mage" | "scholar" | "ninja"
  >("scholar");

  // 🎯 PREDICTIVE PAGE LOADING - AI learns your reading patterns
  const [predictiveLoading, setPredictiveLoading] = useState(true);
  const [preloadedPages, setPreloadedPages] = useState<Record<number, string>>(
    {}
  );
  const [readingPattern, setReadingPattern] = useState<
    "linear" | "skip-ahead" | "random"
  >("linear");

  // 🌈 INFINITE COLOR THEMES - AI Generated
  const [aiGeneratedTheme, setAIGeneratedTheme] = useState(false);
  const [themeMood, setThemeMood] = useState("");
  const [generatedColors, setGeneratedColors] = useState<{
    bg: string;
    text: string;
    accent: string;
  } | null>(null);

  // 📊 KNOWLEDGE GRAPH - Connected Learning
  const [knowledgeGraph, setKnowledgeGraph] = useState(false);
  const [conceptNodes, setConceptNodes] = useState<
    Array<{ id: string; label: string; connections: string[] }>
  >([]);

  // 🎬 CINEMATIC MODE - Movie-like reading
  const [cinematicMode, setCinematicMode] = useState(false);
  const [sceneTransitions, setSceneTransitions] = useState(true);
  const [characterVoices, setCharacterVoices] = useState(true);

  // 🧘 EMOTION DETECTION (Future: TensorFlow.js)
  const [emotionDetection, setEmotionDetection] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<
    "neutral" | "stressed" | "bored" | "excited" | "tired"
  >("neutral");
  const [autoModeSwitch, setAutoModeSwitch] = useState(false);

  // 🧠 AI INTELLIGENCE INSIGHTS TOGGLE
  const [showIntelligenceInsights, setShowIntelligenceInsights] =
    useState(false);

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
  // readingSpeed moved earlier for cache hook
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
  // 🤖 AI STUDY BUDDY - REVOLUTIONARY READING ASSISTANT!
  // ===========================================
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatMessages, setAIChatMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: number;
    }>
  >([]);
  const [aiChatInput, setAIChatInput] = useState("");

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
  const prevPageRef = useRef<number>(1); // Track previous page for animation direction

  // ===========================================
  // 🧠 CONTEXTUAL INTELLIGENCE ENGINE: AI Reading Intelligence for Read Mode
  // ===========================================
  const readingIntelligence = useContextualIntelligence(
    slug,
    currentPage,
    isPremium // Only track for premium users
  );

  // Cleanup: End tracking when component unmounts
  useEffect(() => {
    return () => {
      if (isPremium) {
        readingIntelligence.endTracking(false);
      }
    };
  }, [isPremium, readingIntelligence]);

  const canReadPage = isPurchased || currentPage <= freePages;
  const progressPercentage = (currentPage / totalPages) * 100;

  // 🔊 LOAD AVAILABLE VOICES FOR BROWSER NARRATOR
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !narratorVoice) {
          // Set default to first English voice or first available
          const englishVoice = voices.find((v) => v.lang.startsWith("en"));
          setNarratorVoice(englishVoice || voices[0]);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 🔊 PRO-LEVEL NARRATOR CONTROLS
  const startNarration = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Get text content without HTML tags
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = pageContent;
      const textToRead = tempDiv.textContent || tempDiv.innerText || "";

      if (textToRead.trim()) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        if (narratorVoice) {
          utterance.voice = narratorVoice;
        }
        utterance.rate = narratorRate;
        utterance.pitch = narratorPitch;
        utterance.volume = narratorVolume;

        // 🎤 LIP SYNC: Track word-by-word reading with highlighting!
        const words = textToRead.split(/\s+/).filter((w) => w.length > 0);
        const wordDuration = (60 / (200 * narratorRate)) * 1000; // Approx time per word
        let currentWord = 0;

        const progressInterval = setInterval(() => {
          const progress = Math.min((currentWord / words.length) * 100, 100);
          setNarratorProgress(progress);

          // 🔥 HIGHLIGHT CURRENT WORD!
          if (highlightEnabled) {
            setCurrentReadingWord(currentWord);
          }

          currentWord++;

          if (currentWord >= words.length) {
            clearInterval(progressInterval);
            setCurrentReadingWord(-1);
          }
        }, wordDuration);

        narratorIntervalRef.current = progressInterval;

        utterance.onend = () => {
          setIsNarrating(false);
          setNarratorPaused(false);
          setNarratorProgress(0);
          setCurrentReadingWord(-1);
          clearInterval(progressInterval);

          // 🚀 AUTO-ADVANCE TO NEXT PAGE!
          if (autoAdvancePage && currentPage < totalPages) {
            setTimeout(() => {
              nextPage();
            }, 1000); // Small delay before next page
          }
        };

        utterance.onerror = () => {
          setIsNarrating(false);
          setNarratorPaused(false);
          setNarratorProgress(0);
          setCurrentReadingWord(-1);
          clearInterval(progressInterval);
        };

        narratorUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsNarrating(true);
        setNarratorPaused(false);
        setShowNarratorControls(true);
      }
    }
  };

  const pauseNarration = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setNarratorPaused(true);
      }
    }
  };

  const resumeNarration = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setNarratorPaused(false);
      }
    }
  };

  const stopNarration = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      setNarratorPaused(false);
      setNarratorProgress(0);
      setCurrentReadingWord(-1);
      setShowNarratorControls(false);

      // Clear interval
      if (narratorIntervalRef.current) {
        clearInterval(narratorIntervalRef.current);
        narratorIntervalRef.current = null;
      }
    }
  };

  // Quick speed presets
  const setQuickSpeed = (speed: number) => {
    setNarratorRate(speed);
    // If currently playing, restart with new speed
    if (isNarrating) {
      stopNarration();
      setTimeout(() => startNarration(), 100);
    }
  };

  // Stop narration when page changes
  useEffect(() => {
    stopNarration();
  }, [currentPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ===========================================
  // 🎙️ COMMUNITY NARRATOR - RECORDING FUNCTIONS 🚀
  // ===========================================

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording completion
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordedBlob(audioBlob);

        // Stop all tracks to turn off microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert(
        "Could not access microphone. Please allow microphone permission and try again."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playPreview = () => {
    if (!recordedBlob) return;

    // Create object URL from blob
    const url = URL.createObjectURL(recordedBlob);
    setPreviewAudioUrl(url);

    // Create and play audio
    const audio = new Audio(url);
    previewAudioRef.current = audio;

    audio.onplay = () => setIsPlayingPreview(true);
    audio.onended = () => {
      setIsPlayingPreview(false);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setIsPlayingPreview(false);
      URL.revokeObjectURL(url);
      alert("Failed to play preview");
    };

    audio.play();
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setIsPlayingPreview(false);
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl);
        setPreviewAudioUrl(null);
      }
    }
  };

  const deleteRecording = () => {
    stopPreview();
    setRecordedBlob(null);
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
  };

  const uploadRecording = async () => {
    if (!recordedBlob || !bookId) return;

    try {
      // Extract paragraph text from current page content
      const contentElement = document.querySelector(".reader-content");
      const paragraphText =
        contentElement?.textContent?.trim() || "Unknown paragraph";

      const formData = new FormData();
      formData.append("audio", recordedBlob, "narration.webm");
      formData.append("bookId", bookId);
      formData.append("pageNumber", String(currentPage));
      formData.append("paragraphText", paragraphText.substring(0, 500)); // First 500 chars
      formData.append("language", "en"); // Default to English
      formData.append("readingStyle", "narrative"); // Default style

      const response = await fetch("/api/narrations", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCommunityNarrations((prev) => [result.narration, ...prev]);

        // Clean up recording and preview
        deleteRecording();

        // Show moderation status
        if (result.moderation?.autoApproved) {
          alert("🎉 Auto-approved! Your narration is live with the community!");
        } else {
          alert(
            "✅ Uploaded! Your narration is under review and will be live soon."
          );
        }
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Failed to upload recording:", error);
      alert(
        `Failed to upload: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  const likeNarration = async (narrationId: string) => {
    try {
      const response = await fetch(`/api/narrations/${narrationId}/like`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update the narration in the list
        setCommunityNarrations((prev) =>
          prev.map((n) =>
            n.id === narrationId
              ? {
                  ...n,
                  likeCount:
                    (n.likeCount || 0) + (result.action === "liked" ? 1 : -1),
                }
              : n
          )
        );
      } else if (response.status === 401) {
        alert("Please sign in to like narrations");
      } else if (response.status === 429) {
        alert("Too many likes! Please slow down.");
      }
    } catch (error) {
      console.error("Failed to like narration:", error);
    }
  };

  const deleteCommunityNarration = async (narrationId: string) => {
    if (!confirm("Delete this narration? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/narrations/${narrationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove from list
        setCommunityNarrations((prev) =>
          prev.filter((n) => n.id !== narrationId)
        );
        alert("Narration deleted successfully!");
      } else if (response.status === 401) {
        alert("You can only delete your own narrations");
      } else {
        alert("Failed to delete narration");
      }
    } catch (error) {
      console.error("Failed to delete narration:", error);
      alert("Failed to delete narration");
    }
  };

  const playCommunityNarration = (narrationId: string, audioUrl: string) => {
    // Stop any playing narration
    if (communityAudioRef.current) {
      communityAudioRef.current.pause();
      communityAudioRef.current = null;
    }

    // Stop browser narrator if playing
    if (isNarrating) {
      stopNarration();
    }

    // Count the play (fire and forget)
    fetch(`/api/narrations/${narrationId}/play`, {
      method: "POST",
    }).catch((err) => console.error("Failed to count play:", err));

    // Play new narration
    const audio = new Audio(audioUrl);
    communityAudioRef.current = audio;

    audio.onplay = () => {
      setPlayingCommunityAudio(narrationId);
    };

    audio.onended = () => {
      setPlayingCommunityAudio(null);
      communityAudioRef.current = null;
    };

    audio.onerror = () => {
      alert("Failed to play audio");
      setPlayingCommunityAudio(null);
      communityAudioRef.current = null;
    };

    audio.play();
  };

  const stopCommunityNarration = () => {
    if (communityAudioRef.current) {
      communityAudioRef.current.pause();
      communityAudioRef.current = null;
      setPlayingCommunityAudio(null);
    }
  };

  // Load current user ID
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data?.user?.id || null))
      .catch((err) => console.error("Failed to load user:", err));
  }, []);

  // Load community narrations for current page
  useEffect(() => {
    if (bookId) {
      fetch(`/api/narrations/book/${bookId}/${currentPage}`)
        .then((res) => res.json())
        .then((data) => setCommunityNarrations(data))
        .catch((err) => console.error("Failed to load narrations:", err));
    }
  }, [bookId, currentPage]);

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
  // ✨ AUTO-SELECT PARTICLES BASED ON THEME - Phase 2 Magic!
  // ===========================================
  useEffect(() => {
    if (!particlesEnabled) return;

    const themeParticleMap: Record<
      string,
      "stars" | "fireflies" | "snow" | "sakura" | "sparkles" | "none"
    > = {
      light: "sparkles",
      sepia: "none",
      dark: "stars",
      coffee: "fireflies",
      ocean: "sparkles",
      forest: "fireflies",
      sunset: "sparkles",
      midnight: "stars",
      lavender: "sakura",
      mint: "sparkles",
      rose: "sakura",
      slate: "stars",
      amber: "fireflies",
      sapphire: "stars",
      emerald: "sparkles",
    };

    const newParticleType = themeParticleMap[theme] || "stars";
    setParticleType(newParticleType);
  }, [theme, particlesEnabled]);

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
      audioUrl:
        "https://assets.mixkit.co/music/preview/mixkit-ocean-waves-loop-1196.mp3", // Ocean waves
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
      audioUrl:
        "https://assets.mixkit.co/music/preview/mixkit-night-ambient-947.mp3", // Night ambience
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
      audioUrl:
        "https://assets.mixkit.co/music/preview/mixkit-fireplace-crackle-1330.mp3", // Fireplace ambience
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
      audioUrl:
        "https://assets.mixkit.co/music/preview/mixkit-zen-garden-958.mp3", // Zen meditation
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
      audioUrl:
        "https://assets.mixkit.co/music/preview/mixkit-jazz-lounge-547.mp3", // Smooth jazz
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
  // 🧠💎 BINAURAL BEATS - BRAIN WAVE OPTIMIZATION (INSANE!)
  // Scientifically Proven Frequencies for Enhanced Focus
  // ===========================================
  const binauralBeatsLibrary = {
    alpha: {
      name: "🧘 Alpha Waves (8-12Hz)",
      description: "Relaxed focus & creative thinking",
      benefits: "Perfect for reading & light learning",
      audioUrl:
        "https://cdn.pixabay.com/download/audio/2022/05/13/audio_1808fbf07a.mp3", // Relaxing ambient
      color: "from-green-500 to-emerald-500",
    },
    beta: {
      name: "⚡ Beta Waves (12-30Hz)",
      description: "Active concentration & alertness",
      benefits: "Best for complex material & deep study",
      audioUrl:
        "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c6c4c85e07.mp3", // Focus sounds
      color: "from-blue-500 to-cyan-500",
    },
    theta: {
      name: "🌊 Theta Waves (4-8Hz)",
      description: "Deep relaxation & creativity",
      benefits: "Ideal for meditation & imagination",
      audioUrl:
        "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3", // Deep meditation
      color: "from-purple-500 to-violet-500",
    },
    gamma: {
      name: "🚀 Gamma Waves (30-100Hz)",
      description: "Peak performance & high processing",
      benefits: "Maximum cognitive power & memory",
      audioUrl:
        "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3", // High energy
      color: "from-orange-500 to-red-500",
    },
  };

  // ===========================================
  // 🎨💎 AI THEME GENERATOR - INFINITE CUSTOMIZATION
  // ===========================================
  const generateAITheme = (mood: string) => {
    // AI-powered color generation based on mood
    const moodThemes: {
      [key: string]: { bg: string; text: string; accent: string };
    } = {
      cyberpunk: {
        bg: "from-black via-purple-900 to-pink-900",
        text: "#00ffff",
        accent: "#ff00ff",
      },
      "sunset beach": {
        bg: "from-orange-400 via-pink-400 to-purple-500",
        text: "#fff",
        accent: "#fbbf24",
      },
      "medieval castle": {
        bg: "from-stone-700 via-stone-600 to-stone-800",
        text: "#e5e7eb",
        accent: "#d97706",
      },
      "space odyssey": {
        bg: "from-indigo-950 via-purple-950 to-black",
        text: "#e0e7ff",
        accent: "#818cf8",
      },
      "enchanted forest": {
        bg: "from-green-900 via-emerald-800 to-teal-900",
        text: "#d1fae5",
        accent: "#34d399",
      },
      "arctic ice": {
        bg: "from-cyan-100 via-blue-100 to-indigo-100",
        text: "#0c4a6e",
        accent: "#06b6d4",
      },
      "molten lava": {
        bg: "from-red-900 via-orange-600 to-yellow-600",
        text: "#fff",
        accent: "#fbbf24",
      },
      "deep ocean": {
        bg: "from-blue-950 via-cyan-950 to-teal-950",
        text: "#cffafe",
        accent: "#22d3ee",
      },
    };

    return (
      moodThemes[mood.toLowerCase()] || {
        bg: "from-purple-900 to-indigo-900",
        text: "#e0e7ff",
        accent: "#a78bfa",
      }
    );
  };

  // ===========================================
  // 🏆💎 GAMIFICATION SYSTEM - RPG LEVEL UP!
  // ===========================================
  const getRankInfo = (level: number) => {
    if (level <= 10)
      return { rank: "Bronze Reader", icon: "🥉", color: "text-orange-700" };
    if (level <= 25)
      return { rank: "Silver Scholar", icon: "🥈", color: "text-gray-400" };
    if (level <= 50)
      return { rank: "Gold Genius", icon: "🥇", color: "text-yellow-500" };
    if (level <= 75)
      return {
        rank: "Platinum Philosopher",
        icon: "💎",
        color: "text-cyan-400",
      };
    return { rank: "Diamond Dynasty", icon: "👑", color: "text-purple-500" };
  };

  const calculateXP = (action: "page" | "chapter" | "book" | "streak") => {
    const xpValues = {
      page: 10,
      chapter: 100,
      book: 1000,
      streak: 50,
    };
    return xpValues[action];
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
          // Phase 5: Load video preferences
          if (prefs.videoEnabled !== undefined)
            setVideoEnabled(prefs.videoEnabled);
          if (prefs.selectedVideo) setSelectedVideo(prefs.selectedVideo);
          if (prefs.videoOpacity !== undefined)
            setVideoOpacity(prefs.videoOpacity);
          if (prefs.videoBlur !== undefined) setVideoBlur(prefs.videoBlur);
          if (prefs.videoMuted !== undefined) setVideoMuted(prefs.videoMuted);
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
        // Phase 5: Video preferences
        videoEnabled,
        selectedVideo,
        videoOpacity,
        videoBlur,
        videoMuted,
      };
      localStorage.setItem(`reader-prefs-${bookId}`, JSON.stringify(prefs));
    } catch (err) {
      console.error("Error saving preferences:", err);
    }
  }, [
    fontSize,
    lineHeight,
    fontFamily,
    theme,
    layout,
    columnMode,
    bookId,
    videoEnabled,
    selectedVideo,
    videoOpacity,
    videoBlur,
    videoMuted,
  ]);

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

    let lastScrollPosition = 0;
    let scrollPauseTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;

      // Parallax effect
      const background = document.getElementById("immersive-background");
      if (background) {
        const offset = scrolled * (parallaxIntensity / 100);
        background.style.transform = `translateY(${offset}px) scale(1.1)`;
      }

      // 🧠 Intelligence: Track scroll behavior (read mode engagement)
      if (isPremium) {
        // Detect scroll direction
        const scrollingDown = scrolled > lastScrollPosition;
        lastScrollPosition = scrolled;

        // Track position changes (similar to Listen Mode position tracking)
        const scrollPercent =
          (scrolled / (document.body.scrollHeight - window.innerHeight)) * 100;
        readingIntelligence.onPositionChange(scrollPercent);

        // Detect reading pauses (when user stops scrolling)
        clearTimeout(scrollPauseTimeout);
        scrollPauseTimeout = setTimeout(() => {
          readingIntelligence.onPause(); // User stopped scrolling = reading pause
        }, 3000); // 3 seconds of no scroll = pause
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollPauseTimeout);
    };
  }, [
    parallaxEffect,
    immersiveMode,
    parallaxIntensity,
    isPremium,
    readingIntelligence,
  ]);

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
  // LOAD PAGE CONTENT (Now powered by cache! 🚀)
  // ===========================================
  // Navigation is handled by useFastBookReader hook
  // Pages load INSTANTLY from IndexedDB cache (10-50ms vs 800ms!)

  // Track achievements and progress when page changes
  useEffect(() => {
    if (!cachedContent) return;

    // 🔥 Update prevPageRef for animation direction
    prevPageRef.current = currentPage;

    // Check paywall for non-purchased books
    if (!canReadPage && currentPage > freePages) {
      setShowPaywall(true);
      return;
    }

    setShowPaywall(false);

    // Calculate reading time from cached word count
    if (cachedWordCount) {
      setReadingTime(Math.ceil(cachedWordCount / readingSpeed));
      setWordsRead((prev) => prev + cachedWordCount);
    }

    // Track progress
    trackReadingProgress(currentPage);
    setCompletionPercentage((currentPage / totalPages) * 100);

    // 🏆 ACHIEVEMENT TRACKING - LUXURY GAMIFICATION
    const newCompletion = (currentPage / totalPages) * 100;

    // First page achievement
    if (
      currentPage === 1 &&
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
  }, [
    cachedContent,
    currentPage,
    canReadPage,
    freePages,
    bookId,
    totalPages,
    cachedWordCount,
    readingSpeed,
  ]);

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

  // ===========================================
  // 🤖 AI STUDY BUDDY - ASK QUESTIONS WHILE READING!
  // ===========================================
  const askAIStudyBuddy = async (question: string) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage = {
      role: "user" as const,
      content: question,
      timestamp: Date.now(),
    };
    setAIChatMessages((prev) => [...prev, userMessage]);
    setAIChatInput("");

    try {
      // Get context from current page content
      const textContent = pageContent.replace(/<[^>]*>/g, "");
      const contextWords = textContent.split(/\s+/);
      const context = contextWords.slice(0, 500).join(" "); // First 500 words as context

      const response = await fetch("/api/ai/study-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context,
          currentPage,
          bookId: bookId,
          bookTitle: bookTitle,
          chapterId: currentPage,
          chatHistory: aiChatMessages.slice(-10), // Last 10 messages for context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          role: "assistant" as const,
          content: data.answer,
          timestamp: Date.now(),
        };
        setAIChatMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("AI Study Buddy failed");
      }
    } catch (error) {
      console.error("[AI Study Buddy] Error:", error);
      const errorMessage = {
        role: "assistant" as const,
        content: "Sorry, I couldn't process that question. Please try again!",
        timestamp: Date.now(),
      };
      setAIChatMessages((prev) => [...prev, errorMessage]);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      goNextPage(); // Use cached navigation for instant load
      localStorage.setItem(`bookmark-${bookId}`, newPage.toString());

      // 🏆💎 GAMIFICATION: Gain XP for reading pages!
      const xpGain = calculateXP("page");

      // Calculate new values
      const potentialNewXP = experiencePoints + xpGain;

      if (potentialNewXP >= nextLevelXP) {
        // Level up!
        const newLevel = dynastyLevel + 1;
        const overflow = potentialNewXP - nextLevelXP;
        const newNextLevel = Math.floor(nextLevelXP * 1.5);

        setDynastyLevel(newLevel);
        setNextLevelXP(newNextLevel);
        setExperiencePoints(overflow);
        setCurrentAchievement(`🎉 Level Up! You're now Level ${newLevel}!`);
        setShowAchievementToast(true);
        setTimeout(() => setShowAchievementToast(false), 3000);
      } else {
        // Just add XP
        setExperiencePoints(potentialNewXP);
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      goPreviousPage(); // Use cached navigation for instant load
      localStorage.setItem(`bookmark-${bookId}`, newPage.toString());
    }
  };

  const goToPageLocal = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      goToPage(page); // Use cached navigation for instant load
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
  // ✨ PHASE 4: QUOTE SHARING - TEXT SELECTION HANDLER
  // ===========================================
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 10 && text.length < 500) {
      setSelectedQuoteText(text);
      setShowQuoteModal(true);
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

  // ===========================================
  // 📱 MOBILE SWIPE GESTURE HANDLING
  // ===========================================
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
    setIsSwipeActive(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwipeActive) return;

    const swipeDistance = touchStartX - touchEndX;
    const minSwipeDistance = 50; // Minimum swipe distance to trigger

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && currentPage < totalPages) {
        // Swipe left - next page
        nextPage();
      } else if (swipeDistance < 0 && currentPage > 1) {
        // Swipe right - previous page
        prevPage();
      }
    }

    setIsSwipeActive(false);
  }, [
    isSwipeActive,
    touchStartX,
    touchEndX,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
  ]);

  // ===========================================
  // 📱 MOBILE NAV AUTO-HIDE ON SCROLL
  // ===========================================
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide nav
        setShowMobileNav(false);
      } else {
        // Scrolling up - show nav
        setShowMobileNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile, lastScrollY]);

  return (
    <div
      className={`min-h-screen flex flex-col ${currentTheme.bg} ${currentTheme.text} transition-colors duration-500 relative`}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* 🎥✨ PHASE 5: AMBIENT BACKGROUND VIDEOS */}
      {videoEnabled && (
        <>
          {/* Only show video background if a video is selected */}
          {selectedVideo !== "none" && (
            <VideoBackground
              opacity={videoOpacity}
              blur={videoBlur}
              isPlaying={videoPlaying}
              isMuted={videoMuted}
              selectedVideo={selectedVideo}
              customVideo={customVideo}
              onOpacityChange={setVideoOpacity}
              onBlurChange={setVideoBlur}
              onPlayToggle={() => setVideoPlaying(!videoPlaying)}
              onMuteToggle={() => setVideoMuted(!videoMuted)}
              onVideoSelect={setSelectedVideo}
              onCustomVideoUpload={setCustomVideo}
              onRemoveCustomVideo={() => setCustomVideo(null)}
            />
          )}
          {/* Always show controls when video is enabled */}
          <VideoControls
            opacity={videoOpacity}
            blur={videoBlur}
            isPlaying={videoPlaying}
            isMuted={videoMuted}
            selectedVideo={selectedVideo}
            customVideo={customVideo}
            onOpacityChange={setVideoOpacity}
            onBlurChange={setVideoBlur}
            onPlayToggle={() => setVideoPlaying(!videoPlaying)}
            onMuteToggle={() => setVideoMuted(!videoMuted)}
            onVideoSelect={setSelectedVideo}
            onCustomVideoUpload={setCustomVideo}
            onRemoveCustomVideo={() => setCustomVideo(null)}
          />
        </>
      )}
      {/* ✨ PARTICLE EFFECTS - Phase 2 Luxury UI */}
      <ParticleEffect
        type={particleType}
        density={particleDensity}
        enabled={particlesEnabled}
      />
      {/* 🏆💎 ACHIEVEMENT TOAST NOTIFICATION (GAMIFICATION!) */}
      {showAchievementToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-4 border-yellow-300">
            <Trophy className="w-8 h-8 animate-spin" />
            <div>
              <div className="font-bold text-lg">{currentAchievement}</div>
              <div className="text-xs opacity-90">
                Keep reading to level up!
              </div>
            </div>
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      )}
      {/* ===========================================
          🌟 IMMERSIVE BACKGROUND REVOLUTION 🌟
          Cinema-Quality Reading Atmosphere
          =========================================== */}
      {immersiveMode && backgroundUrl && (
        <div
          id="immersive-background"
          className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
          style={{
            transition: parallaxEffect ? "transform 0.1s ease-out" : "none",
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
      {/* 🧠💎 BINAURAL BEATS - BRAIN WAVE OPTIMIZATION (INSANE!) */}
      {binauralBeats && binauralBeatsLibrary[brainWaveType] && (
        <audio
          autoPlay
          loop
          src={binauralBeatsLibrary[brainWaveType].audioUrl}
          style={{ display: "none" }}
          ref={(audio) => {
            if (audio) audio.volume = binauralVolume;
          }}
        />
      )}
      {/* 🤖💎 AI READING COMPANION SIDEBAR (WORLD'S FIRST!) */}
      {aiCompanionOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-l-2 border-cyan-300 dark:border-cyan-700 z-50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold">AI Reading Companion</h3>
            </div>
            <button
              onClick={() => setAICompanionOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiMessages.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-6xl">🤖</div>
                <p className="text-sm opacity-70">
                  Hi! I'm your AI companion for "{bookTitle}".
                  <br />
                  Ask me anything!
                </p>
                <div className="space-y-2 text-xs opacity-60">
                  <p>💡 "Explain this chapter simply"</p>
                  <p>🎓 "Create a quiz for me"</p>
                  <p>🤔 "Why did the author say..."</p>
                  <p>📝 "Summarize the last 3 pages"</p>
                </div>
              </div>
            ) : (
              aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${
                    msg.role === "user"
                      ? "bg-cyan-500 text-white ml-8"
                      : "bg-white dark:bg-black/20 mr-8"
                  }`}
                >
                  <div className="text-xs font-bold mb-1">
                    {msg.role === "user" ? "You" : "AI Companion"}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex items-center gap-2 text-sm opacity-70">
                <div className="animate-spin">⏳</div>
                <span>AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t-2 border-cyan-300 dark:border-cyan-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInputText}
                onChange={(e) => setAIInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && aiInputText.trim() && !aiLoading) {
                    // Send message to AI
                    const userMsg = aiInputText.trim();
                    setAIMessages([
                      ...aiMessages,
                      { role: "user", content: userMsg },
                    ]);
                    setAIInputText("");
                    setAILoading(true);

                    // Simulate AI response (replace with actual API call)
                    setTimeout(() => {
                      setAIMessages((prev) => [
                        ...prev,
                        {
                          role: "assistant",
                          content: `Great question about "${bookTitle}"! Based on what you've read so far, here's my analysis...\n\n(This is a demo response. Connect to OpenAI API for real answers!)`,
                        },
                      ]);
                      setAILoading(false);
                    }, 2000);
                  }
                }}
                placeholder="Ask me anything about this book..."
                className="flex-1 px-3 py-2 rounded-lg border-2 border-cyan-300 dark:border-cyan-700 bg-white dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={() => {
                  if (aiInputText.trim() && !aiLoading) {
                    const userMsg = aiInputText.trim();
                    setAIMessages([
                      ...aiMessages,
                      { role: "user", content: userMsg },
                    ]);
                    setAIInputText("");
                    setAILoading(true);

                    setTimeout(() => {
                      setAIMessages((prev) => [
                        ...prev,
                        {
                          role: "assistant",
                          content: `Great question! Here's what I think about "${userMsg}"...\n\n(Demo mode - Connect OpenAI API!)`,
                        },
                      ]);
                      setAILoading(false);
                    }, 2000);
                  }
                }}
                disabled={!aiInputText.trim() || aiLoading}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      {/* All content now sits above immersive background */}
      <div className="relative z-10">
        {/* ===========================================
            📱 MOBILE-OPTIMIZED HEADER
            =========================================== */}
        {!zenMode && (
          <header
            className={`${currentTheme.secondary} border-b ${currentTheme.border} sticky top-0 z-50 backdrop-blur-xl bg-opacity-95 transition-all duration-300 safe-area-top`}
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
              {/* Main Header Row */}
              <div className="flex items-center justify-between h-14 md:h-16">
                {/* Left: Back Button + Title */}
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="shrink-0 hover:scale-105 transition-transform p-2 md:px-3"
                  >
                    <ArrowLeft className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline ml-2">Back</span>
                  </Button>

                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-purple-500 shrink-0" />
                    <h1 className="text-sm md:text-base font-semibold truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
                      {bookTitle}
                    </h1>
                  </div>
                </div>

                {/* Mobile: Compact Progress + Menu */}
                {isMobile && (
                  <div className="flex items-center gap-2">
                    {/* Mini Progress Circle */}
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="url(#mobileGradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 16}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 16 * (1 - completionPercentage / 100)
                          }`}
                          className="transition-all duration-500"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient
                            id="mobileGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {Math.round(completionPercentage)}%
                      </span>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2.5 rounded-xl transition-all ${
                        mobileMenuOpen
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-white/10 backdrop-blur-sm border border-white/20"
                      }`}
                    >
                      {mobileMenuOpen ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                )}

                {/* Desktop: Full Progress Ring + Live Stats */}
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

                {/* Right: Desktop Control Bar - Hidden on Mobile */}
                <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
                  {/* 🔖 Bookmark */}
                  <motion.button
                    onClick={toggleBookmark}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      currentPageBookmarked
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                    }`}
                    title={
                      currentPageBookmarked
                        ? "Bookmarked"
                        : "Bookmark this page"
                    }
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        currentPageBookmarked ? "fill-current" : ""
                      }`}
                    />
                    <span className="text-xs font-medium hidden sm:inline">
                      Mark
                    </span>
                  </motion.button>

                  {/* 🎧 Listen Mode */}
                  <motion.button
                    onClick={() => setListenMode(!listenMode)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      listenMode
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                        : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                    }`}
                    title={listenMode ? "Listening..." : "Listen mode"}
                  >
                    {listenMode ? (
                      <PlayCircle className="w-4 h-4" />
                    ) : (
                      <Headphones className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium hidden sm:inline">
                      Listen
                    </span>
                  </motion.button>

                  {/* 🔊 Narrator */}
                  <div className="relative">
                    <motion.button
                      onClick={() =>
                        isNarrating ? stopNarration() : startNarration()
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative overflow-hidden ${
                        isNarrating
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                          : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                      }`}
                      title={isNarrating ? "Stop narrator" : "Start narrator"}
                    >
                      {/* Pulse animation when active */}
                      {isNarrating && (
                        <motion.div
                          className="absolute inset-0 bg-green-400 rounded-lg"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      <motion.div
                        className="relative z-10 flex items-center gap-1.5"
                        animate={isNarrating ? { scale: [1, 1.05, 1] } : {}}
                        transition={{
                          duration: 0.5,
                          repeat: isNarrating ? Infinity : 0,
                        }}
                      >
                        <Volume2
                          className={`w-4 h-4 ${
                            isNarrating ? "animate-pulse" : ""
                          }`}
                        />
                        <span className="text-xs font-medium hidden sm:inline">
                          Read
                        </span>
                      </motion.div>
                    </motion.button>

                    {/* Progress indicator */}
                    {isNarrating && narratorProgress > 0 && (
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${narratorProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 🎙️ Record */}
                  <div className="relative">
                    <motion.button
                      onClick={() => {
                        if (isRecording) {
                          stopRecording();
                        } else {
                          startRecording();
                        }
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative overflow-hidden ${
                        isRecording
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                          : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                      }`}
                      title={isRecording ? "Stop recording" : "Record yourself"}
                    >
                      {/* Pulse animation when recording */}
                      {isRecording && (
                        <motion.div
                          className="absolute inset-0 bg-red-400 rounded-lg"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      <motion.div
                        className="relative z-10 flex items-center gap-1.5"
                        animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                        transition={{
                          duration: 0.5,
                          repeat: isRecording ? Infinity : 0,
                        }}
                      >
                        <Mic
                          className={`w-4 h-4 ${
                            isRecording ? "animate-pulse" : ""
                          }`}
                        />
                        <span className="text-xs font-medium hidden sm:inline">
                          Record
                        </span>
                      </motion.div>
                    </motion.button>

                    {/* Recording indicator dot */}
                    {isRecording && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* 👥 Community */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowCommunityPanel(!showCommunityPanel)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        showCommunityPanel
                          ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                          : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                      }`}
                      title="Community narrations"
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:inline">
                        Community
                      </span>
                    </motion.button>

                    {/* Badge showing count */}
                    {communityNarrations.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                      >
                        {communityNarrations.length}
                      </motion.div>
                    )}
                  </div>

                  {/* 🤖 AI Chat */}
                  <motion.button
                    onClick={() => setShowAIChat(!showAIChat)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      showAIChat
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                        : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                    }`}
                    title="AI Study Buddy"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">
                      AI
                    </span>
                  </motion.button>

                  {/* 📤 Share */}
                  <motion.button
                    onClick={handleTextSelection}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                    title="Share a quote"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">
                      Share
                    </span>
                  </motion.button>

                  {/* ⚙️ Settings */}
                  <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      showSettings
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                    }`}
                    title="Reading settings"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">
                      Settings
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Sub-header: Compact Quick Actions - Hidden on Mobile */}
              <div className="hidden md:flex items-center justify-between pb-2 border-t border-gray-200/50 dark:border-gray-700/50 mt-1 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFocusMode(!focusMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      focusMode
                        ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-md`
                        : `${currentTheme.secondary} hover:scale-105`
                    }`}
                    title="Focus mode - Minimal distractions"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Focus
                  </button>

                  <button
                    onClick={() => setZenMode(!zenMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      zenMode
                        ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-md`
                        : `${currentTheme.secondary} hover:scale-105`
                    }`}
                    title="Zen mode - Distraction-free"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Zen
                  </button>

                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      autoScroll
                        ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-md`
                        : `${currentTheme.secondary} hover:scale-105`
                    }`}
                    title="Auto-scroll mode"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    Auto
                  </button>

                  {/* Stats Button */}
                  <button
                    onClick={() => setShowReadingStats(!showReadingStats)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentTheme.secondary} hover:scale-105`}
                    title="View reading statistics"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {Math.floor(totalReadingTime)}m
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {readingTime} min
                    </span>
                  </div>

                  {!isPurchased && currentPage <= freePages && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-md">
                      <Gift className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {freePages - currentPage} free
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* ===========================================
          📱 MOBILE SLIDE-DOWN MENU
          =========================================== */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-14 left-0 right-0 z-40 safe-area-inset"
            >
              <div
                className={`mx-3 rounded-2xl ${currentTheme.card} border ${currentTheme.border} shadow-2xl overflow-hidden`}
                style={{
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                }}
              >
                {/* Quick Stats Row */}
                <div className="flex items-center justify-around py-3 px-4 border-b border-gray-200/20 dark:border-gray-700/20">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-500">
                      {currentPage}
                    </div>
                    <div className="text-[10px] opacity-60">Page</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-500">
                      {readingSpeed}
                    </div>
                    <div className="text-[10px] opacity-60">WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-500">
                      {readingTime}
                    </div>
                    <div className="text-[10px] opacity-60">Min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-500">
                      {bookmarks.length}
                    </div>
                    <div className="text-[10px] opacity-60">Marks</div>
                  </div>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-4 gap-1 p-3">
                  {[
                    {
                      icon: Bookmark,
                      label: "Bookmark",
                      active: currentPageBookmarked,
                      onClick: toggleBookmark,
                      color: "purple",
                    },
                    {
                      icon: Headphones,
                      label: "Listen",
                      active: listenMode,
                      onClick: () => setListenMode(!listenMode),
                      color: "blue",
                    },
                    {
                      icon: Volume2,
                      label: "Narrate",
                      active: isNarrating,
                      onClick: () =>
                        isNarrating ? stopNarration() : startNarration(),
                      color: "green",
                    },
                    {
                      icon: Sparkles,
                      label: "AI",
                      active: showAIChat,
                      onClick: () => setShowAIChat(!showAIChat),
                      color: "cyan",
                    },
                    {
                      icon: Eye,
                      label: "Focus",
                      active: focusMode,
                      onClick: () => setFocusMode(!focusMode),
                      color: "amber",
                    },
                    {
                      icon: Moon,
                      label: "Zen",
                      active: zenMode,
                      onClick: () => setZenMode(!zenMode),
                      color: "indigo",
                    },
                    {
                      icon: Share2,
                      label: "Share",
                      active: false,
                      onClick: handleTextSelection,
                      color: "pink",
                    },
                    {
                      icon: Settings,
                      label: "Settings",
                      active: showSettings,
                      onClick: () => {
                        setShowSettings(!showSettings);
                        setMobileMenuOpen(false);
                      },
                      color: "gray",
                    },
                  ].map((item, idx) => (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        item.onClick();
                        if (item.label !== "Settings") setMobileMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
                        item.active
                          ? `bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 text-white shadow-lg`
                          : "bg-white/5 hover:bg-white/10 active:bg-white/20"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 mb-1 ${
                          item.active ? "" : "opacity-70"
                        }`}
                      />
                      <span className="text-[10px] font-medium">
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Theme Quick Switch */}
                <div className="px-3 pb-3">
                  <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
                    {["light", "dark", "sepia", "midnight", "forest"].map(
                      (t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTheme(t as any);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all ${
                            theme === t
                              ? "border-purple-500 scale-110"
                              : "border-transparent"
                          }`}
                          style={{
                            background:
                              t === "light"
                                ? "#ffffff"
                                : t === "dark"
                                ? "#1a1a2e"
                                : t === "sepia"
                                ? "#f4ecd8"
                                : t === "midnight"
                                ? "#0f0f23"
                                : "#1a2f1a",
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===========================================
          SETTINGS PANEL (SLIDE-OUT) - 🎨 GLASSMORPHISM UI + ✨ PHASE 3 ANIMATIONS
          =========================================== */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-end"
            >
              {/* Backdrop - Enhanced Blur with Motion */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setShowSettings(false)}
              />

              {/* Settings Panel - Glassmorphism with Spring Slide */}
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
                className="relative w-full max-w-md h-full overflow-y-auto shadow-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                }}
              >
                <div className="p-6 space-y-6">
                  {/* Header - Glass Card */}
                  <div
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white drop-shadow-lg">
                      <Palette className="w-6 h-6 text-purple-400" />
                      Reading Settings
                    </h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 rounded-xl hover:scale-110 active:scale-95 transition-all duration-200"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Theme Selection - Glass Cards */}
                  <div
                    className="space-y-4 p-4 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2 text-white">
                      <Palette className="w-5 h-5 text-purple-400" />
                      Reading Theme
                    </h3>
                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(themes).map(([themeKey, themeData]) => (
                        <button
                          key={themeKey}
                          onClick={() => setTheme(themeKey as any)}
                          className="group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-110 active:scale-95"
                          style={{
                            background:
                              theme === themeKey
                                ? "rgba(168, 85, 247, 0.2)"
                                : "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(5px)",
                            border:
                              theme === themeKey
                                ? "2px solid rgba(168, 85, 247, 0.5)"
                                : "1px solid rgba(255, 255, 255, 0.1)",
                            boxShadow:
                              theme === themeKey
                                ? "0 8px 32px rgba(168, 85, 247, 0.3)"
                                : "0 4px 16px rgba(0, 0, 0, 0.1)",
                          }}
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
                                <Check className="w-6 h-6 text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-center text-white">
                            {themeData.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-white/60 italic">
                      ✨ Choose your perfect reading atmosphere
                    </p>
                  </div>

                  {/* Font Size - Glass Card */}
                  <div
                    className="space-y-3 p-4 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                        Font Size
                      </h3>
                      <span className="text-sm font-bold text-white">
                        {fontSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                        className="p-2 rounded-xl hover:scale-110 active:scale-95 transition-all"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(5px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <MinusCircle className="w-5 h-5 text-white" />
                      </button>
                      <input
                        type="range"
                        min="12"
                        max="32"
                        step="2"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(168, 85, 247, 0.5), rgba(59, 130, 246, 0.5))",
                        }}
                      />
                      <button
                        onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                        className="p-2 rounded-xl hover:scale-110 active:scale-95 transition-all"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(5px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <PlusCircle className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Line Height - Glass Card */}
                  <div
                    className="space-y-3 p-4 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                        Line Height
                      </h3>
                      <span className="text-sm font-bold text-white">
                        {lineHeight.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.4"
                      max="2.5"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) =>
                        setLineHeight(parseFloat(e.target.value))
                      }
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(168, 85, 247, 0.5), rgba(59, 130, 246, 0.5))",
                      }}
                    />
                  </div>

                  {/* Font Family - Glass Cards */}
                  <div
                    className="space-y-3 p-4 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
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
                          className="px-3 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                          style={{
                            background:
                              fontFamily === font
                                ? "rgba(168, 85, 247, 0.3)"
                                : "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(5px)",
                            border:
                              fontFamily === font
                                ? "2px solid rgba(168, 85, 247, 0.5)"
                                : "1px solid rgba(255, 255, 255, 0.1)",
                            boxShadow:
                              fontFamily === font
                                ? "0 4px 16px rgba(168, 85, 247, 0.3)"
                                : "none",
                          }}
                        >
                          <div
                            className={`${fontFamilies[font].class} text-lg font-bold mb-1 text-white`}
                          >
                            Ag
                          </div>
                          <div className="text-xs text-white/60">
                            {fontFamilies[font].name}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-white/60 italic">
                      ✍️ Choose your perfect reading font
                    </p>
                  </div>

                  {/* ✨ PARTICLE EFFECTS CONTROLS - Phase 2 Luxury UI */}
                  <div
                    className="space-y-3 p-4 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                        ✨ Particle Effects
                      </h3>
                      <button
                        onClick={() => setParticlesEnabled(!particlesEnabled)}
                        className={`px-3 py-1 rounded-lg text-xs transition-all ${
                          particlesEnabled
                            ? "bg-purple-500/30 text-white"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {particlesEnabled ? "ON" : "OFF"}
                      </button>
                    </div>

                    {particlesEnabled && (
                      <>
                        {/* Particle Type Selection */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              type: "stars" as const,
                              icon: "⭐",
                              label: "Stars",
                            },
                            {
                              type: "fireflies" as const,
                              icon: "🔥",
                              label: "Fireflies",
                            },
                            {
                              type: "snow" as const,
                              icon: "❄️",
                              label: "Snow",
                            },
                            {
                              type: "sakura" as const,
                              icon: "🌸",
                              label: "Sakura",
                            },
                            {
                              type: "sparkles" as const,
                              icon: "✨",
                              label: "Sparkles",
                            },
                            {
                              type: "none" as const,
                              icon: "⛔",
                              label: "None",
                            },
                          ].map(({ type, icon, label }) => (
                            <button
                              key={type}
                              onClick={() => setParticleType(type)}
                              className="px-2 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                              style={{
                                background:
                                  particleType === type
                                    ? "rgba(168, 85, 247, 0.3)"
                                    : "rgba(255, 255, 255, 0.05)",
                                backdropFilter: "blur(5px)",
                                border:
                                  particleType === type
                                    ? "2px solid rgba(168, 85, 247, 0.5)"
                                    : "1px solid rgba(255, 255, 255, 0.1)",
                                boxShadow:
                                  particleType === type
                                    ? "0 4px 16px rgba(168, 85, 247, 0.3)"
                                    : "none",
                              }}
                            >
                              <div className="text-2xl mb-1">{icon}</div>
                              <div className="text-xs text-white/80">
                                {label}
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Particle Density Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-white/70">
                              Density
                            </label>
                            <span className="text-xs text-purple-300">
                              {particleDensity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="10"
                            value={particleDensity}
                            onChange={(e) =>
                              setParticleDensity(Number(e.target.value))
                            }
                            className="w-full h-2 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, rgba(168, 85, 247, 0.6) 0%, rgba(168, 85, 247, 0.6) ${particleDensity}%, rgba(255, 255, 255, 0.1) ${particleDensity}%, rgba(255, 255, 255, 0.1) 100%)`,
                            }}
                          />
                        </div>
                      </>
                    )}

                    <p className="text-xs text-center text-white/60 italic">
                      ✨ Add magical atmosphere to your reading
                    </p>
                  </div>

                  {/* 🎥 AMBIENT VIDEO BACKGROUND CONTROLS - Phase 5 Luxury UI */}
                  <div
                    className="space-y-3 p-4 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                        🎥 Ambient Videos
                      </h3>
                      <button
                        onClick={() => setVideoEnabled(!videoEnabled)}
                        className={`px-3 py-1 rounded-lg text-xs transition-all ${
                          videoEnabled
                            ? "bg-blue-500/30 text-white"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {videoEnabled ? "ON" : "OFF"}
                      </button>
                    </div>

                    {videoEnabled && (
                      <div className="space-y-2">
                        <p className="text-xs text-white/70">
                          🎬 Click the <strong>Video</strong> button at the
                          bottom-left to:
                        </p>
                        <ul className="text-xs text-white/60 space-y-1 pl-4">
                          <li>• Select from 10 cinematic backgrounds</li>
                          <li>• Adjust opacity & blur for perfect ambiance</li>
                          <li>• Upload your own custom videos</li>
                          <li>• Control playback & audio</li>
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-center text-white/60 italic">
                      🎥 Cinematic reading experience
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
                        onChange={(e) =>
                          setScrollSpeed(parseInt(e.target.value))
                        }
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

                    {/* 🎬 Animation Intensity Control */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold opacity-60">
                        Animation Intensity 🔥
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {(["off", "subtle", "normal", "insane"] as const).map(
                          (intensity) => (
                            <button
                              key={intensity}
                              onClick={() => setAnimationIntensity(intensity)}
                              className={`px-3 py-2 rounded-xl border-2 capitalize transition-all text-xs ${
                                animationIntensity === intensity
                                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                                  : `border-gray-300 dark:border-gray-600 ${currentTheme.secondary} hover:border-purple-300`
                              }`}
                            >
                              {intensity === "off" && "❌"}
                              {intensity === "subtle" && "✨"}
                              {intensity === "normal" && "🎨"}
                              {intensity === "insane" && "🔥"} {intensity}
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

                    {/* 🎙️ PRO NARRATOR SETTINGS - FREE FOR ALL! 🚀 */}
                    <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-xl border-2 border-green-300 dark:border-green-600 shadow-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-green-600" />
                          PRO Narrator (FREE) 🔥
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full">
                          <Zap className="w-3 h-3" />
                          PRO
                        </div>
                      </div>

                      {/* Voice Selection with search-like styling */}
                      {availableVoices.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold opacity-80 flex items-center gap-1">
                            🎭 Select Voice ({availableVoices.length} available)
                          </label>
                          <select
                            value={narratorVoice?.name || ""}
                            onChange={(e) => {
                              const voice = availableVoices.find(
                                (v) => v.name === e.target.value
                              );
                              if (voice) setNarratorVoice(voice);
                            }}
                            className="w-full px-3 py-2 rounded-lg border-2 border-green-300 dark:border-green-600 focus:border-green-500 focus:outline-none text-sm bg-white dark:bg-gray-800 font-medium"
                          >
                            {availableVoices.map((voice) => (
                              <option key={voice.name} value={voice.name}>
                                {voice.name} • {voice.lang}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Quick Speed Presets */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold opacity-80">
                          ⚡ Quick Speed
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => setQuickSpeed(speed)}
                              className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                Math.abs(narratorRate - speed) < 0.1
                                  ? "bg-green-600 text-white shadow-lg scale-105"
                                  : "bg-white dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/20 border-2 border-green-200 dark:border-green-700"
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Speed Fine Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold opacity-80">
                            🎚️ Fine-tune Speed
                          </label>
                          <span className="text-xs font-mono bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded font-bold text-green-700 dark:text-green-300">
                            {narratorRate.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={narratorRate}
                          onChange={(e) =>
                            setNarratorRate(parseFloat(e.target.value))
                          }
                          className="w-full accent-green-600"
                        />
                      </div>

                      {/* Volume Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold opacity-80">
                            🔊 Volume
                          </label>
                          <span className="text-xs font-mono bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded font-bold text-green-700 dark:text-green-300">
                            {Math.round(narratorVolume * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={narratorVolume}
                          onChange={(e) =>
                            setNarratorVolume(parseFloat(e.target.value))
                          }
                          className="w-full accent-green-600"
                        />
                      </div>

                      {/* Pitch Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold opacity-80">
                            🎵 Pitch
                          </label>
                          <span className="text-xs font-mono bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded font-bold text-green-700 dark:text-green-300">
                            {narratorPitch.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={narratorPitch}
                          onChange={(e) =>
                            setNarratorPitch(parseFloat(e.target.value))
                          }
                          className="w-full accent-green-600"
                        />
                      </div>

                      {/* Auto-advance toggle */}
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FastForward className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold">
                            Auto-advance pages
                          </span>
                        </div>
                        <button
                          onClick={() => setAutoAdvancePage(!autoAdvancePage)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            autoAdvancePage
                              ? "bg-green-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              autoAdvancePage
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex gap-2">
                        {!isNarrating ? (
                          <Button
                            onClick={startNarration}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                            size="sm"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start Reading
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() =>
                                narratorPaused
                                  ? resumeNarration()
                                  : pauseNarration()
                              }
                              variant="outline"
                              className="flex-1 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              size="sm"
                            >
                              {narratorPaused ? (
                                <>
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Resume
                                </>
                              ) : (
                                <>
                                  <PauseCircle className="w-4 h-4 mr-2" />
                                  Pause
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={stopNarration}
                              variant="outline"
                              className="flex-1 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              size="sm"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Stop
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Status indicator */}
                      {isNarrating && (
                        <div className="flex items-center justify-center gap-2 p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 h-3 bg-green-600 rounded-full"
                                animate={{
                                  height: narratorPaused
                                    ? "12px"
                                    : ["12px", "20px", "12px"],
                                }}
                                transition={{
                                  duration: 0.6,
                                  repeat: narratorPaused ? 0 : Infinity,
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                            {narratorPaused ? "Paused" : "Playing..."}
                          </span>
                        </div>
                      )}

                      {/* 🎤 LIP SYNC HIGHLIGHT SETTINGS */}
                      <div className="space-y-3 p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                        <h5 className="text-xs font-bold flex items-center gap-1">
                          🎤 Lip Sync Highlighting
                        </h5>

                        {/* Enable/Disable */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold opacity-80">
                            Highlight words as read
                          </span>
                          <button
                            onClick={() =>
                              setHighlightEnabled(!highlightEnabled)
                            }
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              highlightEnabled
                                ? "bg-green-600"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                highlightEnabled
                                  ? "translate-x-7"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Color Selection */}
                        {highlightEnabled && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold opacity-80">
                              Highlight Color
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                              {(
                                [
                                  "yellow",
                                  "green",
                                  "blue",
                                  "purple",
                                  "pink",
                                ] as const
                              ).map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setHighlightColor(color)}
                                  className={`aspect-square rounded-lg transition-all ${
                                    highlightColor === color
                                      ? "ring-2 ring-green-600 scale-110 shadow-lg"
                                      : "opacity-60 hover:opacity-100 hover:scale-105"
                                  }`}
                                  style={{
                                    backgroundColor:
                                      color === "yellow"
                                        ? "#fde047"
                                        : color === "green"
                                        ? "#4ade80"
                                        : color === "blue"
                                        ? "#60a5fa"
                                        : color === "purple"
                                        ? "#a78bfa"
                                        : "#f472b6",
                                  }}
                                  title={
                                    color.charAt(0).toUpperCase() +
                                    color.slice(1)
                                  }
                                >
                                  {highlightColor === color && (
                                    <Check className="w-4 h-4 mx-auto text-white drop-shadow" />
                                  )}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs opacity-60 italic">
                              See exactly what word is being read in real-time!
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-xs opacity-60 italic text-center">
                        🎙️ Pro-level features • Works offline • Free forever! 🚀
                      </p>
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
                              onChange={(e) =>
                                setCustomTextColor(e.target.value)
                              }
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

                      {/* 🔥 QUICK DEMO BUTTON - One-Click Magic! */}
                      {!immersiveMode && (
                        <button
                          onClick={() => {
                            setImmersiveMode(true);
                            setBackgroundType("image");
                            setBackgroundUrl(
                              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
                            );
                            setBackgroundOpacity(0.15);
                            setBackgroundBlur(8);
                          }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <Sparkles className="w-5 h-5" />✨ Try Demo - Beach
                          Sunset
                        </button>
                      )}

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

                            {/* Image Suggestions */}
                            {backgroundType === "image" && (
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  {
                                    name: "🏖️ Beach",
                                    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
                                  },
                                  {
                                    name: "🏔️ Mountains",
                                    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
                                  },
                                  {
                                    name: "🌲 Forest",
                                    url: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80",
                                  },
                                  {
                                    name: "🌃 City",
                                    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80",
                                  },
                                  {
                                    name: "🌌 Space",
                                    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80",
                                  },
                                  {
                                    name: "🌊 Ocean",
                                    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80",
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
                            )}

                            {/* Video Suggestions */}
                            {backgroundType === "video" && (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    {
                                      name: "🌊 Ocean Waves",
                                      url: "https://cdn.coverr.co/videos/coverr-ocean-waves-5048/1080p.mp4",
                                    },
                                    {
                                      name: "☁️ Clouds",
                                      url: "https://cdn.coverr.co/videos/coverr-clouds-time-lapse-6323/1080p.mp4",
                                    },
                                    {
                                      name: "🔥 Fireplace",
                                      url: "https://cdn.coverr.co/videos/coverr-fireplace-5669/1080p.mp4",
                                    },
                                    {
                                      name: "🌧️ Rain",
                                      url: "https://cdn.coverr.co/videos/coverr-rain-on-leaves-5093/1080p.mp4",
                                    },
                                  ].map((suggestion) => (
                                    <button
                                      key={suggestion.name}
                                      onClick={() => {
                                        setBackgroundUrl(suggestion.url);
                                        setBackgroundType("video");
                                      }}
                                      className="px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-xs font-semibold"
                                    >
                                      {suggestion.name}
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs opacity-60 text-center">
                                  🎬 Videos loop automatically & are muted
                                </p>
                              </div>
                            )}

                            {/* Gradient Suggestions */}
                            {backgroundType === "gradient" && (
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  {
                                    name: "🌅 Sunset",
                                    url: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  },
                                  {
                                    name: "🌊 Ocean",
                                    url: "linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%)",
                                  },
                                  {
                                    name: "🔥 Fire",
                                    url: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                  },
                                  {
                                    name: "🌲 Forest",
                                    url: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                  },
                                ].map((suggestion) => (
                                  <button
                                    key={suggestion.name}
                                    onClick={() => {
                                      setBackgroundUrl(suggestion.url);
                                      setBackgroundType("gradient");
                                    }}
                                    className="px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-xs font-semibold"
                                  >
                                    {suggestion.name}
                                  </button>
                                ))}
                              </div>
                            )}
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
                                    ...(backgroundType === "image"
                                      ? {
                                          backgroundImage: `url(${backgroundUrl})`,
                                        }
                                      : { background: backgroundUrl }),
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
                            <span className="text-sm font-bold">
                              Audio Atmosphere
                            </span>
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
                                audioAtmosphere
                                  ? "translate-x-7"
                                  : "translate-x-1"
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
                              <span className="text-sm font-bold">
                                Parallax Effect
                              </span>
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
                                  parallaxEffect
                                    ? "translate-x-7"
                                    : "translate-x-1"
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
                                    setParallaxIntensity(
                                      parseInt(e.target.value)
                                    )
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
                            <span className="text-sm font-bold">
                              Smart Time Switching
                            </span>
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
                                autoTimeSwitch
                                  ? "translate-x-7"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        {autoTimeSwitch && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div
                                className={`p-2 rounded-lg ${
                                  currentTimeOfDay === "dawn"
                                    ? "bg-orange-200 dark:bg-orange-900/40 font-bold"
                                    : "bg-white/50 dark:bg-black/20"
                                }`}
                              >
                                🌅 Dawn (5-8am)
                              </div>
                              <div
                                className={`p-2 rounded-lg ${
                                  currentTimeOfDay === "day"
                                    ? "bg-blue-200 dark:bg-blue-900/40 font-bold"
                                    : "bg-white/50 dark:bg-black/20"
                                }`}
                              >
                                ☀️ Day (8am-5pm)
                              </div>
                              <div
                                className={`p-2 rounded-lg ${
                                  currentTimeOfDay === "dusk"
                                    ? "bg-purple-200 dark:bg-purple-900/40 font-bold"
                                    : "bg-white/50 dark:bg-black/20"
                                }`}
                              >
                                🌆 Dusk (5-8pm)
                              </div>
                              <div
                                className={`p-2 rounded-lg ${
                                  currentTimeOfDay === "night"
                                    ? "bg-indigo-200 dark:bg-indigo-900/40 font-bold"
                                    : "bg-white/50 dark:bg-black/20"
                                }`}
                              >
                                🌙 Night (8pm-5am)
                              </div>
                            </div>
                            <p className="text-xs opacity-60 text-center">
                              🤖 AI automatically switches atmosphere based on
                              time
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-center opacity-60 pt-2 border-t border-indigo-200 dark:border-indigo-700">
                        🎬 Cinema-quality reading experience
                      </p>
                    </div>
                  </div>

                  {/* 🔥💎 INSANE LUXURY FEATURES - NEVER SEEN BEFORE! 🔥💎 */}
                  <div className="space-y-4">
                    {/* 🧠 BINAURAL BEATS - BRAIN WAVE OPTIMIZATION */}
                    <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30 rounded-xl border-2 border-purple-300 dark:border-purple-700 shadow-xl">
                      <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-500" />
                        🧠 Binaural Beats
                      </h3>
                      <p className="text-xs opacity-70 text-center">
                        🔬 Scientifically-proven brain wave frequencies for
                        enhanced focus
                      </p>

                      {/* Binaural Beats Toggle */}
                      <div className="space-y-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🧠</span>
                            <span className="text-sm font-bold">
                              Brain Wave Audio
                            </span>
                          </div>
                          <button
                            onClick={() => setBinauralBeats(!binauralBeats)}
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              binauralBeats
                                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                binauralBeats
                                  ? "translate-x-7"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        {binauralBeats && (
                          <>
                            {/* Brain Wave Type Selector */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold opacity-70">
                                Select Brain Wave Type
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {(
                                  Object.keys(binauralBeatsLibrary) as Array<
                                    keyof typeof binauralBeatsLibrary
                                  >
                                ).map((wave) => (
                                  <button
                                    key={wave}
                                    onClick={() => setBrainWaveType(wave)}
                                    className={`p-3 rounded-lg border-2 transition-all text-xs ${
                                      brainWaveType === wave
                                        ? `border-purple-500 bg-gradient-to-r ${binauralBeatsLibrary[wave].color}/20`
                                        : "border-gray-300 dark:border-gray-600 hover:border-purple-400"
                                    }`}
                                  >
                                    <div className="font-bold mb-1">
                                      {binauralBeatsLibrary[wave].name}
                                    </div>
                                    <div className="text-xs opacity-70">
                                      {binauralBeatsLibrary[wave].benefits}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Volume Control */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold opacity-70">
                                  Binaural Volume
                                </h4>
                                <span className="text-xs font-mono bg-white dark:bg-black/40 px-2 py-1 rounded">
                                  {Math.round(binauralVolume * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={binauralVolume}
                                onChange={(e) =>
                                  setBinauralVolume(parseFloat(e.target.value))
                                }
                                className="w-full h-2 bg-gradient-to-r from-purple-300 to-pink-500 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <p className="text-xs opacity-60 text-center">
                              🎧 Use headphones for full binaural effect!
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 🤖 AI READING COMPANION */}
                    <div className="space-y-4 p-4 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 rounded-xl border-2 border-cyan-300 dark:border-cyan-700 shadow-xl">
                      <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-cyan-500" />
                        🤖 AI Reading Companion
                      </h3>
                      <p className="text-xs opacity-70 text-center">
                        💬 ChatGPT trained on this book - Ask anything!
                      </p>

                      <button
                        onClick={() => setAICompanionOpen(!aiCompanionOpen)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {aiCompanionOpen
                          ? "Close AI Chat"
                          : "Open AI Companion"}
                      </button>

                      <div className="text-xs opacity-70 space-y-1">
                        <p>✨ Ask questions about the book</p>
                        <p>💡 Get explanations of complex concepts</p>
                        <p>🎓 Generate study materials</p>
                        <p>🗣️ Discuss and debate ideas</p>
                      </div>
                    </div>

                    {/* 🏆 GAMIFICATION STATS */}
                    <div className="space-y-4 p-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-red-900/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 shadow-xl">
                      <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        🏆 Dynasty Level System
                      </h3>

                      <div className="space-y-3">
                        {/* Current Rank */}
                        <div className="text-center p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                          <div className="text-3xl mb-2">
                            {getRankInfo(dynastyLevel).icon}
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              getRankInfo(dynastyLevel).color
                            }`}
                          >
                            Level {dynastyLevel}
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {getRankInfo(dynastyLevel).rank}
                          </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>XP: {experiencePoints}</span>
                            <span>Next: {nextLevelXP}</span>
                          </div>
                          <div className="w-full h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                              style={{
                                width: `${
                                  (experiencePoints / nextLevelXP) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Quick XP Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-white dark:bg-black/20 rounded">
                            📄 Page: +10 XP
                          </div>
                          <div className="p-2 bg-white dark:bg-black/20 rounded">
                            📖 Chapter: +100 XP
                          </div>
                          <div className="p-2 bg-white dark:bg-black/20 rounded">
                            📚 Book: +1000 XP
                          </div>
                          <div className="p-2 bg-white dark:bg-black/20 rounded">
                            🔥 Streak: +50 XP
                          </div>
                        </div>

                        <p className="text-xs text-center opacity-70">
                          🎮 Level up by reading! Unlock achievements, badges,
                          and exclusive content
                        </p>
                      </div>
                    </div>

                    {/* 🎨 AI THEME GENERATOR */}
                    <div className="space-y-4 p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 rounded-xl border-2 border-pink-300 dark:border-pink-700 shadow-xl">
                      <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                        <Palette className="w-5 h-5 text-pink-500" />
                        🎨 AI Theme Generator
                      </h3>
                      <p className="text-xs opacity-70 text-center">
                        🌈 Type ANY mood - AI creates matching theme instantly
                      </p>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={themeMood}
                          onChange={(e) => setThemeMood(e.target.value)}
                          placeholder="Try: cyberpunk, sunset beach, space..."
                          className="w-full px-3 py-2 rounded-lg border-2 border-pink-300 dark:border-pink-700 bg-white dark:bg-black/20 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && themeMood) {
                              setGeneratedColors(generateAITheme(themeMood));
                              setAIGeneratedTheme(true);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (themeMood) {
                              setGeneratedColors(generateAITheme(themeMood));
                              setAIGeneratedTheme(true);
                            }
                          }}
                          disabled={!themeMood}
                          className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                        >
                          ✨ Generate Theme
                        </button>
                      </div>

                      {/* Quick Mood Suggestions */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "cyberpunk",
                          "sunset beach",
                          "medieval castle",
                          "space odyssey",
                          "enchanted forest",
                          "arctic ice",
                        ].map((mood) => (
                          <button
                            key={mood}
                            onClick={() => {
                              setThemeMood(mood);
                              setGeneratedColors(generateAITheme(mood));
                              setAIGeneratedTheme(true);
                            }}
                            className="px-2 py-1 text-xs bg-white dark:bg-black/20 hover:bg-pink-100 dark:hover:bg-pink-900/20 rounded capitalize transition-all"
                          >
                            {mood}
                          </button>
                        ))}
                      </div>

                      {generatedColors && aiGeneratedTheme && (
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            background: `linear-gradient(to right, ${generatedColors.bg})`,
                          }}
                        >
                          <p
                            className="text-center font-bold"
                            style={{ color: generatedColors.text }}
                          >
                            ✨ Theme Preview ✨
                          </p>
                        </div>
                      )}
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
        <main className={`flex-1 flex ${isMobile ? "pb-36" : ""}`}>
          <div className="flex-1">
            <div
              className={`${
                layouts[layout]
              } mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${
                zenMode ? "py-16 md:py-24" : isMobile ? "py-4" : "py-12"
              }`}
            >
              {/* Page Info (if not Zen mode) - Simplified on Mobile */}
              {!zenMode && (
                <div
                  className={`flex items-center justify-between mb-4 md:mb-8 ${
                    isMobile ? "sticky top-14 z-10 py-2 -mx-3 px-3" : ""
                  }`}
                  style={
                    isMobile
                      ? {
                          background: "rgba(0,0,0,0.3)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }
                      : {}
                  }
                >
                  <span
                    className={`text-xs md:text-sm font-medium opacity-60 ${
                      isMobile ? "bg-white/10 px-2 py-1 rounded-md" : ""
                    }`}
                  >
                    {isMobile
                      ? `${currentPage}/${totalPages}`
                      : `Page ${currentPage} of ${totalPages}`}
                  </span>

                  <div className="flex items-center gap-2 md:gap-4">
                    {bookmarks.length > 0 && (
                      <button
                        onClick={() => setShowBookmarks(!showBookmarks)}
                        className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm opacity-60 hover:opacity-100 transition-opacity ${
                          isMobile ? "bg-white/10 px-2 py-1 rounded-md" : ""
                        }`}
                      >
                        <Bookmark className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">
                          {bookmarks.length} bookmarks
                        </span>
                        <span className="sm:hidden">{bookmarks.length}</span>
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
                      {/* 🔥 INSANE PAGE FLIP ANIMATION - GOES VIRAL! */}
                      <InsanePageFlip
                        pageNumber={currentPage}
                        direction={
                          currentPage > (prevPageRef.current || 0)
                            ? "next"
                            : "prev"
                        }
                        isTransitioning={isTransitioning}
                        theme={theme}
                        intensity={animationIntensity}
                      >
                        {/* Reading Content - ✨ PHASE 3: BUTTER-SMOOTH PAGE TRANSITIONS! */}
                        <AnimatePresence mode="wait">
                          <motion.article
                            key={currentPage}
                            ref={contentRef}
                            initial={{
                              opacity: 0,
                              x: pageTransition === "slide" ? 100 : 0,
                              scale: pageTransition === "flip" ? 0.95 : 1,
                              rotateY: pageTransition === "flip" ? 20 : 0,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              scale: 1,
                              rotateY: 0,
                            }}
                            exit={{
                              opacity: 0,
                              x: pageTransition === "slide" ? -100 : 0,
                              scale: pageTransition === "flip" ? 0.95 : 1,
                              rotateY: pageTransition === "flip" ? -20 : 0,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              mass: 0.8,
                            }}
                            className={`
                        prose prose-lg max-w-none leading-relaxed
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
                          >
                            {/* 🎤 LIP SYNC HIGHLIGHTED CONTENT */}
                            {isNarrating && highlightEnabled ? (
                              <HighlightedContent
                                htmlContent={pageContent}
                                currentWordIndex={currentReadingWord}
                                highlightColor={highlightColor}
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: pageContent,
                                }}
                              />
                            )}
                          </motion.article>
                        </AnimatePresence>
                      </InsanePageFlip>

                      {/* 🎙️ FLOATING PRO NARRATOR CONTROLS - Appears when narrating */}
                      <AnimatePresence>
                        {showNarratorControls && isNarrating && (
                          <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
                          >
                            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl p-4 backdrop-blur-xl border-2 border-white/20">
                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="font-semibold">
                                    🎙️ Narrator Playing
                                  </span>
                                  <span className="font-mono">
                                    {Math.round(narratorProgress)}%
                                  </span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-white rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${narratorProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-2">
                                {/* Pause/Resume */}
                                <Button
                                  onClick={() =>
                                    narratorPaused
                                      ? resumeNarration()
                                      : pauseNarration()
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
                                >
                                  {narratorPaused ? (
                                    <PlayCircle className="w-4 h-4" />
                                  ) : (
                                    <PauseCircle className="w-4 h-4" />
                                  )}
                                </Button>

                                {/* Quick Speed Buttons */}
                                <div className="flex gap-1">
                                  {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                    <button
                                      key={speed}
                                      onClick={() => setQuickSpeed(speed)}
                                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                                        Math.abs(narratorRate - speed) < 0.1
                                          ? "bg-white text-green-600 shadow-lg scale-110"
                                          : "bg-white/10 hover:bg-white/20"
                                      }`}
                                    >
                                      {speed}x
                                    </button>
                                  ))}
                                </div>

                                {/* Stop */}
                                <Button
                                  onClick={stopNarration}
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-500/20 hover:bg-red-500/30 border-red-300/30 text-white"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Toggles Row 1 */}
                              <div className="mt-2 space-y-1">
                                {/* Auto-advance toggle */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="opacity-80">
                                    Auto-advance pages
                                  </span>
                                  <button
                                    onClick={() =>
                                      setAutoAdvancePage(!autoAdvancePage)
                                    }
                                    className={`relative w-10 h-5 rounded-full transition-colors ${
                                      autoAdvancePage
                                        ? "bg-white"
                                        : "bg-white/20"
                                    }`}
                                  >
                                    <div
                                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                                        autoAdvancePage
                                          ? "translate-x-5 bg-green-600"
                                          : "translate-x-0.5 bg-white"
                                      }`}
                                    />
                                  </button>
                                </div>

                                {/* 🎤 Highlight words toggle */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="opacity-80 flex items-center gap-1">
                                    🎤 Highlight words
                                  </span>
                                  <button
                                    onClick={() =>
                                      setHighlightEnabled(!highlightEnabled)
                                    }
                                    className={`relative w-10 h-5 rounded-full transition-colors ${
                                      highlightEnabled
                                        ? "bg-white"
                                        : "bg-white/20"
                                    }`}
                                  >
                                    <div
                                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                                        highlightEnabled
                                          ? "translate-x-5 bg-green-600"
                                          : "translate-x-0.5 bg-white"
                                      }`}
                                    />
                                  </button>
                                </div>

                                {/* Highlight color picker */}
                                {highlightEnabled && (
                                  <div className="flex items-center justify-between text-xs pt-1">
                                    <span className="opacity-80">Color:</span>
                                    <div className="flex gap-1">
                                      {(
                                        [
                                          "yellow",
                                          "green",
                                          "blue",
                                          "purple",
                                          "pink",
                                        ] as const
                                      ).map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            setHighlightColor(color)
                                          }
                                          className={`w-5 h-5 rounded-full transition-all ${
                                            highlightColor === color
                                              ? "ring-2 ring-white scale-110"
                                              : "opacity-60 hover:opacity-100"
                                          }`}
                                          style={{
                                            backgroundColor:
                                              color === "yellow"
                                                ? "#fde047"
                                                : color === "green"
                                                ? "#4ade80"
                                                : color === "blue"
                                                ? "#60a5fa"
                                                : color === "purple"
                                                ? "#a78bfa"
                                                : "#f472b6",
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Sound wave animation */}
                              {!narratorPaused && (
                                <div className="mt-2 flex items-center justify-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="w-1 bg-white/60 rounded-full"
                                      animate={{
                                        height: ["4px", "16px", "4px"],
                                      }}
                                      transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

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
          ✨ PHASE 4: QUOTE SHARE MODAL
          =========================================== */}
        {showQuoteModal && selectedQuoteText && (
          <QuoteShareModal
            selectedText={selectedQuoteText}
            bookTitle={bookTitle}
            authorName="Dynasty Academy"
            onClose={() => {
              setShowQuoteModal(false);
              setSelectedQuoteText("");
            }}
          />
        )}

        {/* ===========================================
          🎙️ COMMUNITY NARRATOR PANELS - RECORD & LISTEN! 🚀
          =========================================== */}

        {/* RECORDING PREVIEW - Show after recording */}
        <AnimatePresence>
          {recordedBlob && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 right-8 z-50 w-96 p-6 rounded-2xl shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(59, 130, 246, 0.95))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Recording Complete!
                  </h3>
                  <button
                    onClick={() => setRecordedBlob(null)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm opacity-90 mb-4">
                  Your narration is ready to share with the community!
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={uploadRecording}
                    className="flex-1 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-opacity-90 transition-all hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Share with Community
                    </div>
                  </button>
                  <button
                    onClick={() => setRecordedBlob(null)}
                    className="px-4 py-3 bg-white/20 rounded-xl font-bold hover:bg-white/30 transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMMUNITY NARRATIONS PANEL - Browse & Listen */}
        <AnimatePresence>
          {showCommunityPanel && (
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-20 right-8 z-50 w-96 max-h-[70vh] overflow-hidden rounded-2xl shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(59, 130, 246, 0.95))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="p-6 text-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Community Narrations
                  </h2>
                  <button
                    onClick={() => setShowCommunityPanel(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm opacity-90 mb-4">
                  Page {currentPage} - {communityNarrations.length} narrations
                  available
                </p>

                {/* Narrations List */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  {communityNarrations.length === 0 ? (
                    <div className="text-center py-12 opacity-70">
                      <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">
                        Be the first narrator!
                      </p>
                      <p className="text-sm">
                        Record yourself reading this page and share with the
                        community.
                      </p>
                    </div>
                  ) : (
                    communityNarrations.map((narration: any) => (
                      <motion.div
                        key={narration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl transition-all cursor-pointer ${
                          playingCommunityAudio === narration.id
                            ? "bg-white/30 shadow-lg"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                        onClick={() => {
                          if (playingCommunityAudio === narration.id) {
                            stopCommunityNarration();
                          } else {
                            playCommunityNarration(
                              narration.id,
                              narration.audioUrl
                            );
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                            {narration.user?.name?.[0] || "U"}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">
                              {narration.user?.name ||
                                narration.user?.username ||
                                "Anonymous"}
                            </div>
                            <div className="text-xs opacity-70">
                              {narration.durationSec ? (
                                <>
                                  {Math.floor(narration.durationSec / 60)}:
                                  {String(
                                    Math.floor(narration.durationSec % 60)
                                  ).padStart(2, "0")}{" "}
                                </>
                              ) : null}
                              {narration.playCount || 0} plays
                            </div>
                          </div>

                          {/* Play Button */}
                          <div className="shrink-0">
                            {playingCommunityAudio === narration.id ? (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              >
                                <PauseCircle className="w-8 h-8" />
                              </motion.div>
                            ) : (
                              <PlayCircle className="w-8 h-8" />
                            )}
                          </div>
                        </div>

                        {/* Likes, Date & Delete */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                likeNarration(narration.id);
                              }}
                              className="flex items-center gap-1 text-sm hover:scale-110 transition-transform"
                            >
                              <Heart className="w-4 h-4" />
                              <span>{narration.likeCount || 0}</span>
                            </button>
                            <div className="text-xs opacity-60">
                              {new Date(
                                narration.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Delete button - only for your narrations */}
                          {currentUserId &&
                            narration.userId === currentUserId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCommunityNarration(narration.id);
                                }}
                                className="text-xs text-red-300 hover:text-red-100 hover:bg-red-500/20 px-2 py-1 rounded transition-all flex items-center gap-1"
                                title="Delete your narration"
                              >
                                <X className="w-3 h-3" />
                                Delete
                              </button>
                            )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Call to Action */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <button
                    onClick={() => {
                      setShowCommunityPanel(false);
                      startRecording();
                    }}
                    className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    Record Your Narration
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===========================================
          RECORDING PREVIEW MODAL - 🎙️ REVIEW YOUR NARRATION
          =========================================== */}
        <AnimatePresence>
          {recordedBlob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={deleteRecording}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-900 to-pink-900 text-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Recording Complete!</h3>
                    <p className="text-sm opacity-80">
                      Preview before uploading
                    </p>
                  </div>
                </div>

                {/* Preview Controls */}
                <div className="space-y-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={isPlayingPreview ? stopPreview : playPreview}
                    className="w-full py-4 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-3"
                  >
                    {isPlayingPreview ? (
                      <>
                        <PauseCircle className="w-6 h-6" />
                        Playing Preview...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-6 h-6" />
                        Play Preview
                      </>
                    )}
                  </button>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={uploadRecording}
                      className="py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Upload
                    </button>
                    <button
                      onClick={deleteRecording}
                      className="py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Delete
                    </button>
                  </div>

                  <p className="text-xs text-center opacity-70">
                    Your narration will be reviewed before going live
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===========================================
          📱 MOBILE BOTTOM NAVIGATION - PRO APP FEEL
          =========================================== */}
        {!zenMode && isMobile && (
          <motion.footer
            initial={{ y: 100 }}
            animate={{ y: showMobileNav ? 0 : 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Progress Bar at Top of Footer */}
            <div className="h-1 bg-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="px-4 py-2">
              {/* Main Navigation Row */}
              <div className="flex items-center justify-between">
                {/* Previous Page - Large Touch Target */}
                <motion.button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
                    currentPage === 1 ? "opacity-30" : "active:bg-white/10"
                  }`}
                >
                  <ChevronLeft className="w-7 h-7 text-white" />
                  <span className="text-[10px] text-white/60 mt-0.5">Prev</span>
                </motion.button>

                {/* Page Info - Center */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => goToPage(Math.max(1, currentPage - 10))}
                      whileTap={{ scale: 0.85 }}
                      className="p-2 rounded-lg bg-white/5 active:bg-white/15"
                    >
                      <Rewind className="w-4 h-4 text-white/70" />
                    </motion.button>

                    <div className="flex items-center bg-white/10 rounded-xl px-3 py-1.5">
                      <span className="text-lg font-bold text-white">
                        {currentPage}
                      </span>
                      <span className="text-white/40 mx-1">/</span>
                      <span className="text-sm text-white/60">
                        {totalPages}
                      </span>
                    </div>

                    <motion.button
                      onClick={() =>
                        goToPage(Math.min(totalPages, currentPage + 10))
                      }
                      whileTap={{ scale: 0.85 }}
                      className="p-2 rounded-lg bg-white/5 active:bg-white/15"
                    >
                      <FastForward className="w-4 h-4 text-white/70" />
                    </motion.button>
                  </div>

                  {/* Page Slider */}
                  <input
                    type="range"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => goToPage(parseInt(e.target.value))}
                    className="w-full mt-2 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${completionPercentage}%, rgba(255,255,255,0.2) ${completionPercentage}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                  />
                </div>

                {/* Next Page - Large Touch Target */}
                <motion.button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
                    currentPage === totalPages
                      ? "opacity-30"
                      : "active:bg-white/10"
                  }`}
                >
                  <ChevronRight className="w-7 h-7 text-white" />
                  <span className="text-[10px] text-white/60 mt-0.5">Next</span>
                </motion.button>
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center justify-around mt-2 pt-2 border-t border-white/10">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleBookmark}
                  className="flex flex-col items-center p-2"
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      currentPageBookmarked
                        ? "text-purple-400 fill-purple-400"
                        : "text-white/60"
                    }`}
                  />
                  <span className="text-[9px] text-white/50 mt-1">Mark</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setListenMode(!listenMode)}
                  className="flex flex-col items-center p-2"
                >
                  <Headphones
                    className={`w-5 h-5 ${
                      listenMode ? "text-blue-400" : "text-white/60"
                    }`}
                  />
                  <span className="text-[9px] text-white/50 mt-1">Listen</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    isNarrating ? stopNarration() : startNarration()
                  }
                  className="flex flex-col items-center p-2"
                >
                  <Volume2
                    className={`w-5 h-5 ${
                      isNarrating ? "text-green-400" : "text-white/60"
                    }`}
                  />
                  <span className="text-[9px] text-white/50 mt-1">Read</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAIChat(!showAIChat)}
                  className="flex flex-col items-center p-2"
                >
                  <Sparkles
                    className={`w-5 h-5 ${
                      showAIChat ? "text-cyan-400" : "text-white/60"
                    }`}
                  />
                  <span className="text-[9px] text-white/50 mt-1">AI</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileSettingsOpen(true)}
                  className="flex flex-col items-center p-2"
                >
                  <Settings className="w-5 h-5 text-white/60" />
                  <span className="text-[9px] text-white/50 mt-1">More</span>
                </motion.button>
              </div>
            </div>
          </motion.footer>
        )}

        {/* ===========================================
          DESKTOP FOOTER NAVIGATION - 🎨 GLASSMORPHISM
          =========================================== */}
        {!zenMode && !isMobile && (
          <footer
            className="sticky bottom-0 z-50"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderTop: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Previous Button - Glass + ✨ Phase 3 Spring Animation */}
                <motion.button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="disabled:opacity-30 px-4 py-2 rounded-xl text-white flex items-center gap-2"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </motion.button>

                {/* Page Navigation - Glass Controls + ✨ Phase 3 Micro-Interactions */}
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => goToPage(Math.max(1, currentPage - 10))}
                    whileHover={{ scale: 1.15, rotate: -15 }}
                    whileTap={{ scale: 0.9, rotate: -30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="p-2 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    title="Jump back 10 pages"
                  >
                    <Rewind className="w-4 h-4 text-white" />
                  </motion.button>

                  <div
                    className="flex items-center gap-3 px-4 py-2 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <span className="text-sm text-white/80">Page:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 rounded-lg text-center font-medium text-white bg-white/10 border border-white/20"
                      style={{
                        backdropFilter: "blur(5px)",
                      }}
                    />
                    <span className="text-sm text-white/80">
                      of {totalPages}
                    </span>
                  </div>

                  <motion.button
                    onClick={() =>
                      goToPage(Math.min(totalPages, currentPage + 10))
                    }
                    whileHover={{ scale: 1.15, rotate: 15 }}
                    whileTap={{ scale: 0.9, rotate: 30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="p-2 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    title="Jump forward 10 pages"
                  >
                    <FastForward className="w-4 h-4 text-white" />
                  </motion.button>
                </div>

                {/* Next Button - Glass + ✨ Phase 3 Spring Animation */}
                <motion.button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="disabled:opacity-30 px-4 py-2 rounded-xl text-white flex items-center gap-2"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </footer>
        )}

        {/* ===========================================
          📱 MOBILE SETTINGS BOTTOM SHEET
          =========================================== */}
        <AnimatePresence>
          {mobileSettingsOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60"
              onClick={() => setMobileSettingsOpen(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-gray-900 rounded-t-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Handle Bar */}
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-white">
                    Reading Settings
                  </h3>
                  <button
                    onClick={() => setMobileSettingsOpen(false)}
                    className="p-2 rounded-full bg-gray-800 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Settings Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-5 py-4 space-y-6">
                  {/* Font Size */}
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-3 block">
                      Font Size
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                        className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-white"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-white">
                          {fontSize}px
                        </span>
                      </div>
                      <button
                        onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                        className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-white"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-3 block">
                      Theme
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { name: "light", bg: "#ffffff", text: "#000" },
                        { name: "sepia", bg: "#f4ecd8", text: "#5c4b37" },
                        { name: "dark", bg: "#1a1a2e", text: "#fff" },
                        { name: "midnight", bg: "#0f0f23", text: "#e0e0ff" },
                        { name: "forest", bg: "#1a2f1a", text: "#c8e6c9" },
                      ].map((t) => (
                        <button
                          key={t.name}
                          onClick={() => setTheme(t.name as any)}
                          className={`aspect-square rounded-xl border-2 transition-all ${
                            theme === t.name
                              ? "border-purple-500 scale-105"
                              : "border-transparent"
                          }`}
                          style={{ background: t.bg }}
                        >
                          <span
                            style={{ color: t.text }}
                            className="text-xs font-medium capitalize"
                          >
                            {t.name.charAt(0)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-3 block">
                      Font Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "serif", label: "Serif" },
                        { name: "sans", label: "Sans" },
                        { name: "mono", label: "Mono" },
                        { name: "elegant", label: "Elegant" },
                      ].map((f) => (
                        <button
                          key={f.name}
                          onClick={() => setFontFamily(f.name as any)}
                          className={`py-3 px-4 rounded-xl border transition-all ${
                            fontFamily === f.name
                              ? "bg-purple-500/20 border-purple-500 text-purple-400"
                              : "bg-gray-800 border-gray-700 text-white/70"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line Height */}
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-3 block">
                      Line Spacing
                    </label>
                    <input
                      type="range"
                      min="1.4"
                      max="2.4"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) =>
                        setLineHeight(parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-white/50 mt-1">
                      <span>Compact</span>
                      <span>{lineHeight.toFixed(1)}</span>
                      <span>Spacious</span>
                    </div>
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-3">
                    {[
                      {
                        label: "Focus Mode",
                        value: focusMode,
                        onChange: () => setFocusMode(!focusMode),
                        icon: Eye,
                      },
                      {
                        label: "Auto Scroll",
                        value: autoScroll,
                        onChange: () => setAutoScroll(!autoScroll),
                        icon: FastForward,
                      },
                      {
                        label: "Particles",
                        value: particlesEnabled,
                        onChange: () => setParticlesEnabled(!particlesEnabled),
                        icon: Sparkles,
                      },
                    ].map((toggle) => (
                      <div
                        key={toggle.label}
                        className="flex items-center justify-between py-3 px-4 bg-gray-800 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <toggle.icon className="w-5 h-5 text-white/60" />
                          <span className="text-white">{toggle.label}</span>
                        </div>
                        <button
                          onClick={toggle.onChange}
                          className={`w-12 h-7 rounded-full transition-all ${
                            toggle.value ? "bg-purple-500" : "bg-gray-600"
                          }`}
                        >
                          <motion.div
                            className="w-5 h-5 bg-white rounded-full shadow-md"
                            animate={{ x: toggle.value ? 24 : 4 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===========================================
          FLOATING ACTION BUTTON (Zen Mode Only)
          =========================================== */}
        {zenMode && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
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
      </div>{" "}
      {/* End of z-10 content wrapper */}
      {/* ===========================================
        🤖 READER AI COACH - CONTEXT-AWARE ASSISTANT
        =========================================== */}
      <ReaderAICoach
        bookId={bookId}
        bookSlug={slug}
        bookTitle={bookTitle}
        pageNumber={currentPage}
        totalPages={totalPages}
        pageText={pageContent}
        userStats={{
          wpm: readingSpeed,
          minutesToday: Math.round(totalReadingTime),
          progressPct: Math.round((currentPage / totalPages) * 100),
        }}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
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

// 🎤 LIP SYNC HIGHLIGHTED CONTENT COMPONENT
interface HighlightedContentProps {
  htmlContent: string;
  currentWordIndex: number;
  highlightColor: "yellow" | "green" | "blue" | "purple" | "pink";
}

function HighlightedContent({
  htmlContent,
  currentWordIndex,
  highlightColor,
}: HighlightedContentProps) {
  const highlightColors = {
    yellow: "bg-yellow-300/60 dark:bg-yellow-400/40",
    green: "bg-green-300/60 dark:bg-green-400/40",
    blue: "bg-blue-300/60 dark:bg-blue-400/40",
    purple: "bg-purple-300/60 dark:bg-purple-400/40",
    pink: "bg-pink-300/60 dark:bg-pink-400/40",
  };

  const animationColors = {
    yellow: "shadow-yellow-400",
    green: "shadow-green-400",
    blue: "shadow-blue-400",
    purple: "shadow-purple-400",
    pink: "shadow-pink-400",
  };

  // Extract text from HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const plainText = tempDiv.textContent || tempDiv.innerText || "";
  const words = plainText.split(/\s+/).filter((w) => w.length > 0);

  // Create a version with highlighted words
  const createHighlightedHTML = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    let wordCount = 0;

    const processNode = (node: Node): Node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const nodeWords = text.split(/(\s+)/); // Keep whitespace

        const span = document.createElement("span");
        nodeWords.forEach((word, index) => {
          if (word.trim().length > 0) {
            const wordSpan = document.createElement("span");
            wordSpan.textContent = word;

            if (wordCount === currentWordIndex) {
              wordSpan.className = `${highlightColors[highlightColor]} ${animationColors[highlightColor]} rounded px-1 transition-all duration-200 scale-110 shadow-lg font-bold inline-block animate-pulse`;
            }

            span.appendChild(wordSpan);
            wordCount++;
          } else {
            span.appendChild(document.createTextNode(word));
          }
        });

        return span;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const cloned = element.cloneNode(false) as Element;

        Array.from(node.childNodes).forEach((child) => {
          cloned.appendChild(processNode(child));
        });

        return cloned;
      }

      return node.cloneNode(true);
    };

    const body = doc.body;
    const processed = document.createElement("div");

    Array.from(body.childNodes).forEach((child) => {
      processed.appendChild(processNode(child));
    });

    return processed.innerHTML;
  };

  return (
    <div
      dangerouslySetInnerHTML={{ __html: createHighlightedHTML() }}
      className="lip-sync-content"
    />
  );
}
