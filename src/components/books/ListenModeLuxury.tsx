"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Sparkles,
  Zap,
  Star,
  Wind,
  Music,
  Waves,
  Clock,
  BookOpen,
  Headphones,
  Crown,
  Flame,
  TrendingUp,
} from "lucide-react";
import { useCloudSync } from "@/hooks/useCloudSync";
import {
  useAchievementToasts,
  triggerAchievement,
} from "@/hooks/useAchievementToasts";
import { useMobileGestures } from "@/hooks/useMobileGestures";
import { useContextualIntelligence } from "@/hooks/useContextualIntelligence";
import { IntelligenceInsightsPanel } from "@/components/intelligence/IntelligenceInsightsPanel";

// Spotify Web Playback SDK types
declare global {
  interface Window {
    Spotify: {
      Player: new (options: any) => any;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface ListenModeLuxuryProps {
  bookSlug: string;
  chapterNumber: number;
  pageContent: string;
  isPremiumUser: boolean;
}

interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  wordCount: number;
}

export default function ListenModeLuxury({
  bookSlug,
  chapterNumber,
  pageContent,
  isPremiumUser,
}: ListenModeLuxuryProps) {
  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Voice selection
  const [selectedVoice, setSelectedVoice] = useState("EXAVITQu4vr4xnSDxMaL");
  const [hasGenerated, setHasGenerated] = useState(false);

  // Luxury features
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [followText, setFollowText] = useState(true);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [visualizerStyle, setVisualizerStyle] = useState<
    "wave" | "pulse" | "bars"
  >("wave");
  const [showPaywallGate, setShowPaywallGate] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // 🎨 NEW: Real Audio Visualizer State
  const [audioFrequencies, setAudioFrequencies] = useState<Uint8Array>(
    new Uint8Array(32)
  );

  // 🎵 NEW: Audio Enhancement Suite
  const [sleepTimer, setSleepTimer] = useState<number>(0); // Minutes (0 = off)
  const [bassBoost, setBassBoost] = useState<number>(0); // -10 to +10
  const [trebleBoost, setTrebleBoost] = useState<number>(0); // -10 to +10

  // 💾 NEW: Interactive Sentence Features
  const [highlightedSentences, setHighlightedSentences] = useState<Set<number>>(
    new Set()
  );
  const [showSentenceMenu, setShowSentenceMenu] = useState<number | null>(null);

  // 🌐 PHASE 2: Cloud Sync & Gamification
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [showStreakBadge, setShowStreakBadge] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // 🔥 REVOLUTIONARY: Listening Atmosphere Presets (WORLD'S FIRST!)
  const [listenAtmosphere, setListenAtmosphere] = useState<string>("none");
  const [backgroundMusicUrl, setBackgroundMusicUrl] = useState<string>("");
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(0.15); // 15% default
  const [musicDucking, setMusicDucking] = useState(true); // Auto-lower music when voice speaks

  // 🎨 REVOLUTIONARY: Voice Mood Sync (Visual matches voice personality)
  const [voiceMoodSync, setVoiceMoodSync] = useState(true);
  const [backgroundGradient, setBackgroundGradient] = useState("");

  // ⏰ REVOLUTIONARY: Time-Based Listening Rituals
  const [autoListeningRitual, setAutoListeningRitual] = useState(false);
  const [currentListeningPeriod, setCurrentListeningPeriod] = useState<
    "morning" | "afternoon" | "evening" | "night"
  >("afternoon");

  // 🌊 REVOLUTIONARY: Audio-Reactive Visuals
  const [audioReactiveIntensity, setAudioReactiveIntensity] = useState(50); // 0-100
  const [particleReactivity, setParticleReactivity] = useState(true);

  // 🧠 PANDORA'S BOX #1: Emotional Intelligence AI (WORLD'S FIRST!)
  const [emotionalMode, setEmotionalMode] = useState(true); // Auto-detect emotions
  const [currentEmotion, setCurrentEmotion] = useState<
    "neutral" | "tension" | "joy" | "wisdom" | "suspense"
  >("neutral");
  const [emotionIntensity, setEmotionIntensity] = useState(50); // 0-100

  // 💡 PANDORA'S BOX #2: Smart Bookmarks with AI
  const [smartBookmarks, setSmartBookmarks] = useState<
    Map<
      number,
      {
        timestamp: number;
        aiSummary?: string;
        keyInsight?: string;
        actionable?: string;
      }
    >
  >(new Map());
  const [showBookmarkMenu, setShowBookmarkMenu] = useState<number | null>(null);

  // 🤖 PANDORA'S BOX #3: AI Study Buddy (Sidebar Chat)
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatMessages, setAIChatMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: number;
    }>
  >([]);
  const [aiChatInput, setAIChatInput] = useState("");

  // 🎭 PANDORA'S BOX #4: Multi-Voice Character Detection
  const [multiVoiceMode, setMultiVoiceMode] = useState(false);
  const [detectedCharacters, setDetectedCharacters] = useState<
    Map<string, string>
  >(new Map()); // character name -> voice ID

  // 🎙️ PANDORA'S BOX #5: Voice Cloning (YOUR VOICE!)
  const [showVoiceCloning, setShowVoiceCloning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  // 🎧 PANDORA'S BOX #7: 3D Spatial Audio (Headphone Magic!)
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(false);
  const pannerNodeRef = useRef<PannerNode | null>(null);
  const musicPannerNodeRef = useRef<PannerNode | null>(null);

  // 🎮 PANDORA'S BOX #8: Learning Mode with Quizzes (Duolingo meets Audiobooks!)
  const [learningModeEnabled, setLearningModeEnabled] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  } | null>(null);
  const [quizXP, setQuizXP] = useState(0);
  const [lastQuizTime, setLastQuizTime] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // 👥 PANDORA'S BOX #9: Social Listening Rooms (Netflix Party for Books!)
  const [socialRoomEnabled, setSocialRoomEnabled] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<
    Array<{
      id: string;
      name: string;
      avatar: string;
    }>
  >([]);
  const [showRoomChat, setShowRoomChat] = useState(false);

  // 👁️ PANDORA'S BOX #10: Biometric Focus Detection (Never Zone Out!)
  const [focusDetectionEnabled, setFocusDetectionEnabled] = useState(false);
  const [isUserFocused, setIsUserFocused] = useState(true);
  const [focusLostTime, setFocusLostTime] = useState(0);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // 🎵 PANDORA'S BOX #11: Spotify Integration (YOUR Music as Background!)
  const [spotifyEnabled, setSpotifyEnabled] = useState(false);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(
    null
  );
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<
    Array<{
      id: string;
      name: string;
      images: Array<{ url: string }>;
    }>
  >([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const spotifyPlayerRef = useRef<any>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasShownGateRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 REVOLUTIONARY: Background music audio ref for atmosphere layering
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Storage keys
  const storageKey = `listen_${bookSlug}_${chapterNumber}_${selectedVoice}`;

  // 🎯 PHASE 2 HOOKS: Cloud Sync + Achievements + Mobile Gestures
  const { saveProgress, loadProgress } = useCloudSync({
    enabled: isPremiumUser,
  });
  const { showAchievementToast } = useAchievementToasts();

  // 🧠 CONTEXTUAL INTELLIGENCE ENGINE: World's First AI Reading Intelligence
  const intelligence = useContextualIntelligence(
    bookSlug,
    chapterNumber,
    isPremiumUser // Only track for premium users
  );

  // Cleanup: End tracking when component unmounts
  useEffect(() => {
    return () => {
      if (isPremiumUser) {
        intelligence.endTracking(false); // false = not completed
      }
    };
  }, [isPremiumUser, intelligence]);

  // 🤖 AUTO-APPLY AI RECOMMENDATIONS: Smart suggestions based on predictions
  useEffect(() => {
    if (!isPremiumUser || !intelligence.predictions || !isPlaying) return;

    const predictions = intelligence.predictions;

    // Suggest speed change if significantly different from recommendation
    if (
      predictions.recommendedSpeed &&
      Math.abs(playbackRate - predictions.recommendedSpeed) > 0.2
    ) {
      const speedDiff = predictions.recommendedSpeed - playbackRate;
      const suggestion =
        speedDiff > 0
          ? `🧠 AI suggests speeding up to ${predictions.recommendedSpeed}x for this chapter`
          : `🧠 AI suggests slowing down to ${predictions.recommendedSpeed}x for this chapter`;

      showAchievementToast({
        id: `ai-speed-${Date.now()}`,
        key: "ai_speed_recommendation",
        name: "AI Reading Coach",
        description: suggestion,
        icon: "🧠",
        category: "intelligence",
        rarity: "EPIC",
        dynastyPoints: 0,
      });
    }

    // Break reminder based on AI prediction
    if (predictions.suggestedBreakInterval) {
      const breakTimer = setTimeout(() => {
        if (isPlaying) {
          showAchievementToast({
            id: `ai-break-${Date.now()}`,
            key: "ai_break_recommendation",
            name: "Take a Break",
            description: `AI recommends a ${predictions.suggestedBreakInterval} minute break for optimal retention`,
            icon: "☕",
            category: "intelligence",
            rarity: "RARE",
            dynastyPoints: 0,
          });
        }
      }, predictions.suggestedBreakInterval * 60 * 1000);

      return () => clearTimeout(breakTimer);
    }
  }, [
    intelligence.predictions,
    isPremiumUser,
    isPlaying,
    playbackRate,
    showAchievementToast,
  ]);

  // 📱 Mobile gesture handlers
  useMobileGestures(containerRef, {
    enabled: true,
    onSwipeLeft: () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(duration, currentTime + 15);
      }
    },
    onSwipeRight: () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, currentTime - 15);
      }
    },
    onDoubleTapLeft: () => {
      if (activeSentenceIndex > 0) {
        const prevSentence = sentences[activeSentenceIndex - 1];
        if (audioRef.current && prevSentence) {
          audioRef.current.currentTime = prevSentence.startTime;
        }
      }
    },
    onDoubleTapRight: () => {
      if (activeSentenceIndex < sentences.length - 1) {
        const nextSentence = sentences[activeSentenceIndex + 1];
        if (audioRef.current && nextSentence) {
          audioRef.current.currentTime = nextSentence.startTime;
        }
      }
    },
    onPinchIn: () => {
      // Decrease font size
      document.body.style.fontSize = `${Math.max(
        12,
        parseInt(getComputedStyle(document.body).fontSize) - 1
      )}px`;
    },
    onPinchOut: () => {
      // Increase font size
      document.body.style.fontSize = `${Math.min(
        24,
        parseInt(getComputedStyle(document.body).fontSize) + 1
      )}px`;
    },
    onShake: () => {
      // Random chapter (placeholder)
      console.log("🎲 Shake detected! Random chapter feature");
    },
    onLongPress: (x, y) => {
      // Show context menu
      console.log("📱 Long press detected at", x, y);
    },
  });

  // Analytics helper
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    try {
      console.log("[Analytics]", eventName, properties);
      // TODO: Replace with your analytics provider (PostHog, Amplitude, Mixpanel)
      // window.analytics?.track(eventName, properties)
      // posthog.capture(eventName, properties)
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  // Premium voices with luxury metadata
  const voices = [
    {
      id: "pNInz6obpgDQGcFmaJgB",
      name: "Adam",
      description: "Deep, authoritative presence",
      icon: "👔",
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      personality: "Executive",
      premium: false,
    },
    {
      id: "21m00Tcm4TlvDq8ikWAM",
      name: "Rachel",
      description: "Serene, meditation-quality tone",
      icon: "🎭",
      gradient: "from-pink-500 via-rose-500 to-red-500",
      personality: "Calming",
      premium: false,
    },
    {
      id: "AZnzlk1XvdvUeBnXmlld",
      name: "Domi",
      description: "Commanding, powerful delivery",
      icon: "⚡",
      gradient: "from-purple-600 via-violet-600 to-fuchsia-600",
      personality: "Leader",
      premium: true,
    },
    {
      id: "EXAVITQu4vr4xnSDxMaL",
      name: "Bella",
      description: "Warm, storytelling excellence",
      icon: "🌟",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      personality: "Narrator",
      premium: true,
    },
    {
      id: "ErXwobaYiN019PkySvjV",
      name: "Josh",
      description: "Dynamic, engaging energy",
      icon: "🚀",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      personality: "Energetic",
      premium: false,
    },
  ];

  // Playback speeds with luxury labels
  const speeds = [
    { value: 0.95, label: "Meditative", icon: "🧘" },
    { value: 1.0, label: "Natural", icon: "✨" },
    { value: 1.25, label: "Focused", icon: "🎯" },
    { value: 1.5, label: "Power", icon: "⚡" },
    { value: 2.0, label: "Lightning", icon: "🚀" },
  ];

  // 🔥 REVOLUTIONARY: Listening Atmosphere Presets (NO APP HAS THIS!)
  // Each preset combines background music + visual theme + optimal settings
  const listeningAtmospheres = {
    "deep-focus": {
      name: "🎧 Deep Focus",
      description: "Binaural beats for concentration",
      musicUrl:
        "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
      gradient: "from-slate-900 via-blue-900 to-slate-900",
      particleColor: "blue-400",
      recommendedSpeed: 1.0,
      visualizerStyle: "bars" as const,
    },
    "night-session": {
      name: "🌙 Night Session",
      description: "Dark ambience for late reading",
      musicUrl:
        "https://assets.mixkit.co/music/preview/mixkit-night-ambient-947.mp3",
      gradient: "from-slate-950 via-purple-950 to-indigo-950",
      particleColor: "purple-400",
      recommendedSpeed: 1.0,
      visualizerStyle: "wave" as const,
    },
    "coffee-shop": {
      name: "☕ Coffee Shop",
      description: "Ambient café atmosphere",
      musicUrl:
        "https://assets.mixkit.co/music/preview/mixkit-coffee-shop-ambience-1711.mp3",
      gradient: "from-amber-950 via-orange-900 to-amber-950",
      particleColor: "amber-400",
      recommendedSpeed: 1.0,
      visualizerStyle: "pulse" as const,
    },
    "ocean-vibes": {
      name: "🌊 Ocean Vibes",
      description: "Waves and seagulls blend",
      musicUrl:
        "https://assets.mixkit.co/music/preview/mixkit-ocean-waves-loop-1196.mp3",
      gradient: "from-cyan-950 via-blue-900 to-cyan-950",
      particleColor: "cyan-400",
      recommendedSpeed: 1.0,
      visualizerStyle: "wave" as const,
    },
    "fireplace-study": {
      name: "🔥 Fireplace Study",
      description: "Crackling fire warmth",
      musicUrl:
        "https://assets.mixkit.co/music/preview/mixkit-fireplace-crackle-1330.mp3",
      gradient: "from-orange-950 via-red-900 to-orange-950",
      particleColor: "orange-400",
      recommendedSpeed: 1.0,
      visualizerStyle: "bars" as const,
    },
    "classical-background": {
      name: "🎼 Classical Elegance",
      description: "Soft piano undertone",
      musicUrl:
        "https://assets.mixkit.co/music/preview/mixkit-piano-reflections-666.mp3",
      gradient: "from-violet-950 via-purple-900 to-violet-950",
      particleColor: "violet-400",
      recommendedSpeed: 1.0,
      visualizerStyle: "pulse" as const,
    },
  };

  // Split content into sentences with timestamps
  const sentences = useMemo((): Sentence[] => {
    if (!pageContent || duration === 0) return [];

    const cleanText = pageContent.replace(/<[^>]*>/g, "").trim();
    const sentenceTexts = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

    const sentencesWithWords = sentenceTexts.map((text) => ({
      text: text.trim(),
      wordCount: text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length,
    }));

    const totalWords = sentencesWithWords.reduce(
      (sum, s) => sum + s.wordCount,
      0
    );
    if (totalWords === 0) return [];

    // ============================================================================
    // ADVANCED TIMING ALGORITHM - Character-based with punctuation awareness
    // ============================================================================

    // Calculate total characters (more accurate than words for TTS timing)
    const totalChars = sentencesWithWords.reduce(
      (sum, s) => sum + s.text.length,
      0
    );

    // Base timing: distribute duration by character count
    const baseCharSpeed = duration / totalChars; // seconds per character

    // Punctuation pause weights (relative to character speed)
    const pauseWeights: Record<string, number> = {
      ".": 8, // Period: longer pause
      "!": 8, // Exclamation: longer pause
      "?": 8, // Question: longer pause
      ",": 3, // Comma: medium pause
      ";": 4, // Semicolon: medium-long pause
      ":": 4, // Colon: medium-long pause
      "-": 2, // Dash: short pause
      "—": 2, // Em dash: short pause
      "\n": 5, // Newline: medium pause
    };

    // Calculate punctuation pauses for each sentence
    const sentenceTimings = sentencesWithWords.map((sentence) => {
      let pauseTime = 0;
      for (const char of sentence.text) {
        if (pauseWeights[char]) {
          pauseTime += pauseWeights[char] * baseCharSpeed;
        }
      }
      return {
        charCount: sentence.text.length,
        pauseTime,
      };
    });

    // Calculate total time including pauses
    const totalBaseTime = totalChars * baseCharSpeed;
    const totalPauseTime = sentenceTimings.reduce(
      (sum, t) => sum + t.pauseTime,
      0
    );
    const totalCalculatedTime = totalBaseTime + totalPauseTime;

    // Apply calibration to match actual audio duration
    const calibrationFactor = duration / totalCalculatedTime;

    // Build sentence timeline with realistic timing
    let cumulativeTime = 0;
    return sentencesWithWords.map((sentence, index) => {
      const timing = sentenceTimings[index];

      // Calculate sentence duration: (chars * char_speed + pauses) * calibration
      const baseDuration =
        (timing.charCount * baseCharSpeed + timing.pauseTime) *
        calibrationFactor;

      // Apply slight lookahead (50ms) for better perceived sync
      const lookahead = 0.05; // 50ms early feels more natural to users
      const startTime = Math.max(0, cumulativeTime - lookahead);
      const endTime = cumulativeTime + baseDuration - lookahead;

      cumulativeTime += baseDuration;

      return {
        text: sentence.text,
        startTime,
        endTime,
        wordCount: sentence.wordCount,
      };
    });
  }, [pageContent, duration]);

  // Auto-resume: Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.position && audioRef.current && audioUrl) {
          audioRef.current.currentTime = state.position;
          setCurrentTime(state.position);
          if (state.speed) setPlaybackRate(state.speed);
          console.log("[Auto-resume] Restored position:", state.position);
        }
      }
    } catch (err) {
      console.error("[Auto-resume] Error:", err);
    }
  }, [audioUrl, storageKey]);

  // Save progress periodically
  useEffect(() => {
    if (!audioUrl || !isPlaying) return;

    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            position: currentTime,
            speed: playbackRate,
            voiceId: selectedVoice,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.error("[Save progress] Error:", err);
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [
    currentTime,
    playbackRate,
    selectedVoice,
    audioUrl,
    isPlaying,
    storageKey,
  ]);

  // Update active sentence with debouncing
  useEffect(() => {
    if (!isPlaying || sentences.length === 0) return;

    // Debounce: only update if enough time has passed
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 200) return;
    lastUpdateTimeRef.current = now;

    const activeIndex = sentences.findIndex((sentence) => {
      // Highlight sentence as soon as it starts (0% threshold)
      // This provides immediate visual feedback with audio
      return (
        currentTime >= sentence.startTime && currentTime < sentence.endTime
      );
    });

    if (activeIndex !== -1 && activeIndex !== activeSentenceIndex) {
      setActiveSentenceIndex(activeIndex);

      // 🧠 PANDORA'S BOX: Analyze emotional context as sentences play
      if (emotionalMode && sentences[activeIndex]) {
        const { emotion, intensity } = analyzeEmotionalContext(
          sentences[activeIndex].text
        );
        applyEmotionalContext(emotion, intensity);
      }

      if (followText && sentenceRefs.current[activeIndex]) {
        sentenceRefs.current[activeIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [
    currentTime,
    isPlaying,
    sentences,
    activeSentenceIndex,
    followText,
    emotionalMode,
  ]);

  // Paywall enforcement: 3-minute gate for free users
  useEffect(() => {
    if (isPremiumUser || !isPlaying) return;

    const FREE_LIMIT = 180; // 3 minutes exactly

    if (currentTime >= FREE_LIMIT && !hasShownGateRef.current) {
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setShowPaywallGate(true);
      hasShownGateRef.current = true;

      // Track event
      trackEvent("listen_180s_gate_shown", {
        bookId: bookSlug,
        chapterId: chapterNumber,
        currentTime,
        duration,
      });

      console.log("[Paywall] 3-minute gate triggered at", currentTime);
    }
  }, [
    currentTime,
    isPlaying,
    isPremiumUser,
    bookSlug,
    chapterNumber,
    duration,
  ]);

  // Screen lock prevention for mobile (audio continues playing with screen off)
  useEffect(() => {
    if (!isPlaying || typeof window === "undefined") return;

    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
          console.log("[Wake Lock] Screen lock prevented");
        }
      } catch (err) {
        console.log("[Wake Lock] Not supported or denied:", err);
      }
    };

    const releaseWakeLock = () => {
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
        console.log("[Wake Lock] Released");
      }
    };

    requestWakeLock();

    return () => {
      releaseWakeLock();
    };
  }, [isPlaying]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleTimeUpdate = () => {
      const newTime = audio.currentTime;

      // Enforce 3-minute limit for free users
      if (!isPremiumUser && newTime > 180) {
        audio.currentTime = 178; // Snap back to 2:58
        audio.pause();
        setShowPaywallGate(true);

        trackEvent("seek_blocked_free", {
          attemptedTime: newTime,
          bookId: bookSlug,
          chapterId: chapterNumber,
        });

        return;
      }

      setCurrentTime(newTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      console.log("Audio loaded, duration:", audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      trackEvent("listen_complete", {
        bookId: bookSlug,
        chapterId: chapterNumber,
        durationSec: duration,
        progressPct: 100,
      });
    };
    const handlePlay = () => {
      setIsPlaying(true);
      if (!hasGenerated) {
        trackEvent("listen_start", {
          bookId: bookSlug,
          chapterId: chapterNumber,
          voiceId: selectedVoice,
          speed: playbackRate,
          cached: isCached,
        });
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setError("Failed to load audio. Please try regenerating.");
    };
    const handleCanPlay = () => {
      console.log("Audio can play");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    // Load the audio
    audio.load();

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioUrl]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // 🎨 NEW: Real Audio Visualizer with Web Audio API
  // DISABLED: Causing infinite loop with requestAnimationFrame
  useEffect(() => {
    // Visualizer temporarily disabled to prevent infinite loop
    // TODO: Implement visualizer with canvas/WebGL instead of React state
    return;

    /* COMMENTED OUT TO FIX INFINITE LOOP
    if (!audioRef.current || !audioUrl || typeof window === "undefined") return;

    try {
      // Create audio context only once
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // 32 frequency bands
        analyserRef.current.smoothingTimeConstant = 0.8; // Smooth animation

        // Only create source if not already connected
        if (!audioSourceRef.current) {
          const source = audioContextRef.current.createMediaElementSource(
            audioRef.current
          );
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
          audioSourceRef.current = source;

          console.log("[Visualizer] Web Audio API initialized");
        }
      }

      // Cancel any existing animation frame before starting new one
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Animate visualizer - use ref to avoid re-renders
      const updateVisualizer = () => {
        if (!analyserRef.current || !isPlaying) {
          return;
        }
        
        const dataArray = new Uint8Array(
          analyserRef.current.frequencyBinCount
        );
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioFrequencies(dataArray);
        
        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      if (isPlaying) {
        updateVisualizer();
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    } catch (err) {
      console.warn("[Visualizer] Web Audio API not supported:", err);
    }
    */
  }, [audioUrl, isPlaying]);

  // � PHASE 2: Load progress from cloud on mount
  useEffect(() => {
    async function restoreProgress() {
      if (!isPremiumUser || !audioUrl) return;

      try {
        const savedProgress = await loadProgress(bookSlug, chapterNumber);
        if (savedProgress && audioRef.current) {
          audioRef.current.currentTime = savedProgress.position;
          setPlaybackRate(savedProgress.speed);
          setSelectedVoice(savedProgress.voiceId);
          console.log("✅ Progress restored from cloud:", savedProgress);
        }
      } catch (error) {
        console.error("[Cloud Sync] Failed to load progress:", error);
      }
    }

    restoreProgress();
  }, [isPremiumUser, audioUrl, bookSlug, chapterNumber, loadProgress]);

  // 🌐 PHASE 2: Auto-save progress every 10 seconds + track analytics
  useEffect(() => {
    if (!isPremiumUser || !isPlaying || !audioUrl) return;

    const syncInterval = setInterval(async () => {
      try {
        // Save progress to cloud
        const result = await saveProgress({
          bookId: bookSlug,
          chapterNumber,
          position: currentTime,
          duration,
          speed: playbackRate,
          voiceId: selectedVoice,
          completed: currentTime >= duration - 5,
        });

        // Check for newly unlocked achievements
        if (result?.achievements) {
          result.achievements.forEach((achievement: any) => {
            showAchievementToast(achievement);
          });
        }

        // Update streak if returned
        if (result?.streak) {
          setCurrentStreak(result.streak.currentStreak);
          if (result.streak.isNewStreak) {
            setShowStreakBadge(true);
            setTimeout(() => setShowStreakBadge(false), 5000);
          }
        }
      } catch (error) {
        console.error("[Cloud Sync] Auto-save failed:", error);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(syncInterval);
  }, [
    isPremiumUser,
    isPlaying,
    audioUrl,
    bookSlug,
    chapterNumber,
    currentTime,
    duration,
    playbackRate,
    selectedVoice,
    saveProgress,
    showAchievementToast,
  ]);

  // 🌐 PHASE 2: Track session start/end for analytics
  useEffect(() => {
    if (isPlaying && !sessionStartTime) {
      setSessionStartTime(new Date());
    } else if (!isPlaying && sessionStartTime) {
      // Session ended - track analytics
      const sessionDuration = (Date.now() - sessionStartTime.getTime()) / 1000;

      if (sessionDuration > 5) {
        // Only track if listened for more than 5 seconds
        fetch("/api/listening/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: bookSlug,
            chapterNumber,
            startTime: sessionStartTime.toISOString(),
            endTime: new Date().toISOString(),
            duration: sessionDuration,
            speed: playbackRate,
            voiceId: selectedVoice,
            completionRate: Math.round((currentTime / duration) * 100),
            deviceType: /mobile/i.test(navigator.userAgent)
              ? "mobile"
              : /tablet/i.test(navigator.userAgent)
              ? "tablet"
              : "desktop",
          }),
        }).catch((error) => console.error("[Analytics] Track failed:", error));
      }

      setSessionStartTime(null);
    }
  }, [
    isPlaying,
    sessionStartTime,
    bookSlug,
    chapterNumber,
    playbackRate,
    selectedVoice,
    currentTime,
    duration,
  ]);

  // �🎵 NEW: Sleep Timer
  useEffect(() => {
    if (sleepTimer > 0 && isPlaying) {
      const timeoutMs = sleepTimer * 60 * 1000;
      sleepTimerRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          trackEvent("sleep_timer_triggered", {
            minutes: sleepTimer,
            bookId: bookSlug,
            chapterId: chapterNumber,
          });
        }
      }, timeoutMs);

      return () => {
        if (sleepTimerRef.current) {
          clearTimeout(sleepTimerRef.current);
        }
      };
    }
  }, [sleepTimer, isPlaying, bookSlug, chapterNumber]);

  // 🔥 REVOLUTIONARY: Voice Mood Sync - Visual background matches voice personality
  useEffect(() => {
    if (!voiceMoodSync || !selectedVoice) return;

    const selectedVoiceData = voices.find((v) => v.id === selectedVoice);
    if (selectedVoiceData) {
      // Apply voice-specific gradient to background
      setBackgroundGradient(selectedVoiceData.gradient);

      trackEvent("voice_mood_sync_applied", {
        voiceId: selectedVoice,
        voiceName: selectedVoiceData.name,
        gradient: selectedVoiceData.gradient,
      });
    }
  }, [voiceMoodSync, selectedVoice]);

  // ⏰ REVOLUTIONARY: Time-Based Listening Rituals - Auto-optimize for time of day
  useEffect(() => {
    if (!autoListeningRitual) return;

    const updateListeningRitual = () => {
      const hour = new Date().getHours();

      // Morning (6-9am): Energetic, bright, faster speed
      if (hour >= 6 && hour < 9) {
        setCurrentListeningPeriod("morning");
        if (listenAtmosphere === "none") {
          applyListenAtmosphere("coffee-shop"); // Energizing café vibes
        }
      }
      // Afternoon (12-5pm): Focus mode
      else if (hour >= 12 && hour < 17) {
        setCurrentListeningPeriod("afternoon");
        if (listenAtmosphere === "none") {
          applyListenAtmosphere("deep-focus"); // Concentration mode
        }
      }
      // Evening (6-8pm): Relaxing transition
      else if (hour >= 18 && hour < 20) {
        setCurrentListeningPeriod("evening");
        if (listenAtmosphere === "none") {
          applyListenAtmosphere("fireplace-study"); // Cozy evening
        }
      }
      // Night (8pm+): Calm, slow, dark
      else {
        setCurrentListeningPeriod("night");
        if (listenAtmosphere === "none") {
          applyListenAtmosphere("night-session"); // Peaceful night
        }
        // Auto-enable sleep timer at night (30 minutes default)
        if (sleepTimer === 0) {
          setSleepTimer(30);
        }
      }
    };

    updateListeningRitual();
    const interval = setInterval(updateListeningRitual, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoListeningRitual, listenAtmosphere, sleepTimer]);

  // 🎧 PANDORA'S BOX: Setup 3D Spatial Audio when enabled
  useEffect(() => {
    if (spatialAudioEnabled && audioRef.current && hasGenerated) {
      setup3DSpatialAudio();
    }
  }, [spatialAudioEnabled, hasGenerated]);

  // � PANDORA'S BOX: Learning Mode - Generate quiz every 5 minutes
  useEffect(() => {
    if (!learningModeEnabled || !isPlaying) return;

    const checkQuizTime = () => {
      if (currentTime - lastQuizTime >= 300) {
        // 5 minutes = 300 seconds
        generateQuiz();
      }
    };

    const interval = setInterval(checkQuizTime, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [learningModeEnabled, isPlaying, currentTime, lastQuizTime]);

  // �🎨 REVOLUTIONARY: Audio-Reactive Background - Changes color with voice intensity
  useEffect(() => {
    if (!audioReactiveIntensity || !isPlaying) return;

    const updateBackgroundReactivity = () => {
      if (analyserRef.current && audioFrequencies.length > 0) {
        // Calculate average frequency intensity
        const avgIntensity =
          audioFrequencies.reduce((a, b) => a + b, 0) / audioFrequencies.length;
        const normalizedIntensity = avgIntensity / 255; // 0-1

        // Apply intensity to background brightness
        if (containerRef.current) {
          const brightness = 100 + normalizedIntensity * audioReactiveIntensity;
          containerRef.current.style.filter = `brightness(${brightness}%)`;
        }

        // Pulse particles with audio
        if (particleReactivity && normalizedIntensity > 0.3) {
          // Trigger particle burst on loud sounds
          const event = new CustomEvent("audioPulse", {
            detail: { intensity: normalizedIntensity },
          });
          window.dispatchEvent(event);
        }
      }

      animationFrameRef.current = requestAnimationFrame(
        updateBackgroundReactivity
      );
    };

    if (isPlaying) {
      updateBackgroundReactivity();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current) {
        containerRef.current.style.filter = "brightness(100%)";
      }
    };
  }, [audioReactiveIntensity, isPlaying, audioFrequencies, particleReactivity]);

  // 🔥 REVOLUTIONARY: Apply Listening Atmosphere Preset
  const applyListenAtmosphere = (atmosphereKey: string) => {
    const atmosphere =
      listeningAtmospheres[atmosphereKey as keyof typeof listeningAtmospheres];
    if (!atmosphere) return;

    // Apply all atmosphere settings
    setListenAtmosphere(atmosphereKey);
    setBackgroundMusicUrl(atmosphere.musicUrl);
    setBackgroundGradient(atmosphere.gradient);
    setVisualizerStyle(atmosphere.visualizerStyle);
    setPlaybackRate(atmosphere.recommendedSpeed);

    // Track atmosphere change with intelligence
    if (isPremiumUser) {
      intelligence.onAtmosphereChange();
    }

    // Track event
    trackEvent("listening_atmosphere_applied", {
      atmosphere: atmosphereKey,
      name: atmosphere.name,
      musicUrl: atmosphere.musicUrl,
      bookId: bookSlug,
      chapterId: chapterNumber,
    });

    console.log(`🎧 Atmosphere applied: ${atmosphere.name}`);
  };

  // 🧠 PANDORA'S BOX: Emotional Intelligence AI - Detects emotion from text and adapts EVERYTHING
  const analyzeEmotionalContext = (
    text: string
  ): { emotion: typeof currentEmotion; intensity: number } => {
    const lowerText = text.toLowerCase();

    // Tension keywords
    const tensionWords = [
      "danger",
      "warning",
      "threat",
      "conflict",
      "battle",
      "fight",
      "attack",
      "fear",
      "panic",
      "urgent",
    ];
    const tensionScore = tensionWords.filter((word) =>
      lowerText.includes(word)
    ).length;

    // Joy keywords
    const joyWords = [
      "happy",
      "celebrate",
      "victory",
      "success",
      "laugh",
      "smile",
      "joy",
      "delight",
      "triumph",
      "wonderful",
    ];
    const joyScore = joyWords.filter((word) => lowerText.includes(word)).length;

    // Wisdom keywords
    const wisdomWords = [
      "understand",
      "realize",
      "insight",
      "truth",
      "wisdom",
      "lesson",
      "learn",
      "discover",
      "reveal",
      "knowledge",
    ];
    const wisdomScore = wisdomWords.filter((word) =>
      lowerText.includes(word)
    ).length;

    // Suspense keywords
    const suspenseWords = [
      "mysterious",
      "secret",
      "hidden",
      "unknown",
      "wonder",
      "curious",
      "strange",
      "unexpected",
      "surprise",
    ];
    const suspenseScore = suspenseWords.filter((word) =>
      lowerText.includes(word)
    ).length;

    // Punctuation intensity
    const hasExclamation = (text.match(/!/g) || []).length;
    const hasQuestion = (text.match(/\?/g) || []).length;
    const hasEllipsis = text.includes("...");

    // Determine dominant emotion
    const scores = {
      tension: tensionScore,
      joy: joyScore,
      wisdom: wisdomScore,
      suspense: suspenseScore,
    };
    const maxScore = Math.max(...Object.values(scores));

    if (maxScore === 0) {
      return { emotion: "neutral", intensity: 50 };
    }

    let emotion: typeof currentEmotion = "neutral";
    if (scores.tension === maxScore) emotion = "tension";
    else if (scores.joy === maxScore) emotion = "joy";
    else if (scores.wisdom === maxScore) emotion = "wisdom";
    else if (scores.suspense === maxScore) emotion = "suspense";

    // Calculate intensity (0-100)
    const intensity = Math.min(
      100,
      50 +
        maxScore * 15 +
        hasExclamation * 10 +
        hasQuestion * 5 +
        (hasEllipsis ? 15 : 0)
    );

    return { emotion, intensity };
  };

  // 🎨 Apply emotional context to UI/Audio
  const applyEmotionalContext = (
    emotion: typeof currentEmotion,
    intensity: number
  ) => {
    if (!emotionalMode) return;

    setCurrentEmotion(emotion);
    setEmotionIntensity(intensity);

    // Adjust background gradient based on emotion
    switch (emotion) {
      case "tension":
        setBackgroundGradient("from-red-950 via-orange-950 to-red-950");
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.volume = Math.min(0.3, intensity / 200); // Increase music for tension
        }
        break;
      case "joy":
        setBackgroundGradient("from-yellow-950 via-amber-900 to-yellow-950");
        setPlaybackRate(Math.min(1.3, 1.0 + intensity / 500)); // Speed up slightly for joy
        break;
      case "wisdom":
        setBackgroundGradient("from-blue-950 via-indigo-900 to-purple-950");
        setPlaybackRate(Math.max(0.85, 1.0 - intensity / 500)); // Slow down for wisdom
        break;
      case "suspense":
        setBackgroundGradient("from-purple-950 via-violet-950 to-purple-950");
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.volume = Math.max(0.05, intensity / 400); // Lower music for suspense
        }
        break;
      default:
        // Neutral - restore defaults
        break;
    }

    trackEvent("emotional_context_applied", {
      emotion,
      intensity,
      bookId: bookSlug,
      chapterId: chapterNumber,
    });
  };

  // 💡 Smart Bookmark with AI Analysis
  const createSmartBookmark = async (sentenceIndex: number) => {
    const sentence = sentences[sentenceIndex];
    if (!sentence) return;

    // Add to bookmarks immediately (optimistic UI)
    setSmartBookmarks((prev) =>
      new Map(prev).set(sentenceIndex, {
        timestamp: Date.now(),
      })
    );

    // Fetch AI analysis in background
    try {
      const response = await fetch("/api/ai/analyze-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence: sentence.text,
          context: sentences
            .slice(Math.max(0, sentenceIndex - 2), sentenceIndex + 3)
            .map((s) => s.text)
            .join(" "),
          bookId: bookSlug,
          chapterId: chapterNumber,
        }),
      });

      if (response.ok) {
        const analysis = await response.json();
        setSmartBookmarks((prev) =>
          new Map(prev).set(sentenceIndex, {
            timestamp: Date.now(),
            aiSummary: analysis.aiSummary,
            keyInsight: analysis.keyInsight,
            actionable: analysis.actionable,
          })
        );
      }
    } catch (error) {
      console.error("[Smart Bookmark] AI analysis failed:", error);
    }

    trackEvent("smart_bookmark_created", {
      sentenceIndex,
      sentenceText: sentence.text.substring(0, 100),
      bookId: bookSlug,
      chapterId: chapterNumber,
    });
  };

  // 🤖 AI Study Buddy - Chat about what you're hearing
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
      // Get context: current sentence + surrounding text
      const context = sentences
        .slice(Math.max(0, activeSentenceIndex - 5), activeSentenceIndex + 5)
        .map((s) => s.text)
        .join(" ");

      const response = await fetch("/api/ai/study-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context,
          currentSentence: sentences[activeSentenceIndex]?.text,
          bookId: bookSlug,
          chapterId: chapterNumber,
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

    trackEvent("ai_study_buddy_question", {
      question: question.substring(0, 100),
      contextSentenceIndex: activeSentenceIndex,
      bookId: bookSlug,
      chapterId: chapterNumber,
    });
  };

  // 🎙️ PANDORA'S BOX #5: Voice Cloning - Record YOUR voice!
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 30-second countdown
      const interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            clearInterval(interval);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

      trackEvent("voice_cloning_started", {
        bookId: bookSlug,
        chapterId: chapterNumber,
      });
    } catch (error) {
      console.error("[Voice Cloning] Microphone access denied:", error);
      alert("Microphone access is required for voice cloning.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cloneVoice = async () => {
    if (!audioBlob) return;

    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-sample.webm");
      formData.append("name", `${bookSlug}_user_voice`);

      const response = await fetch("/api/ai/clone-voice", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setClonedVoiceId(data.voiceId);
        setSelectedVoice(data.voiceId); // Auto-select cloned voice
        setShowVoiceCloning(false);
        setAudioBlob(null);

        trackEvent("voice_cloning_success", {
          voiceId: data.voiceId,
          bookId: bookSlug,
          chapterId: chapterNumber,
        });

        alert(
          "🎉 Voice cloned successfully! Now generating audio in YOUR voice..."
        );
      } else {
        throw new Error("Voice cloning failed");
      }
    } catch (error) {
      console.error("[Voice Cloning] Error:", error);
      alert("Failed to clone voice. Please try again.");
    } finally {
      setIsCloning(false);
    }
  };

  // 🎭 PANDORA'S BOX #6: Multi-Voice Character Detection
  const detectDialogue = (
    text: string
  ): { speaker: "narrator" | "male" | "female"; text: string } => {
    // Detect quoted dialogue
    const hasQuotes = /"([^"]+)"|'([^']+)'/.test(text);

    if (!hasQuotes) {
      return { speaker: "narrator", text };
    }

    // Analyze surrounding context for gender indicators
    const maleIndicators =
      /\b(he|him|his|man|boy|male|gentleman|sir|mr\.|father|brother|son)\b/i;
    const femaleIndicators =
      /\b(she|her|hers|woman|girl|female|lady|madam|mrs\.|ms\.|mother|sister|daughter)\b/i;

    const lowerText = text.toLowerCase();

    if (femaleIndicators.test(lowerText)) {
      return { speaker: "female", text };
    } else if (maleIndicators.test(lowerText)) {
      return { speaker: "male", text };
    }

    // Default to narrator for ambiguous dialogue
    return { speaker: "narrator", text };
  };

  const getVoiceForSpeaker = (
    speaker: "narrator" | "male" | "female"
  ): string => {
    if (!multiVoiceMode) return selectedVoice;

    const voiceMap = {
      narrator: "21m00Tcm4TlvDq8ikWAM", // Rachel - Professional Female
      male: "pNInz6obpgDQGcFmaJgB", // Adam - Deep Male
      female: "EXAVITQu4vr4xnSDxMaL", // Bella - Warm Female
    };

    return voiceMap[speaker] || selectedVoice;
  };

  // 🎧 PANDORA'S BOX #7: 3D Spatial Audio - Narrator front, music behind, immersion MAX
  const setup3DSpatialAudio = () => {
    if (!audioRef.current || !spatialAudioEnabled) return;

    // NOTE: Disabled to prevent conflict with visualizer audio context
    // The visualizer already uses Web Audio API and connects to the audio element
    console.log(
      "[3D Spatial Audio] Currently disabled - using visualizer audio context"
    );
    return;

    /* DISABLED - CONFLICTS WITH VISUALIZER
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioRef.current);

      // Create panner for narrator voice (FRONT CENTER)
      const pannerNode = audioContext.createPanner();
      pannerNode.panningModel = "HRTF"; // Head-Related Transfer Function for realistic 3D
      pannerNode.distanceModel = "inverse";
      pannerNode.refDistance = 1;
      pannerNode.maxDistance = 10000;
      pannerNode.rolloffFactor = 1;
      pannerNode.coneInnerAngle = 360;
      pannerNode.coneOuterAngle = 0;
      pannerNode.coneOuterGain = 0;

      // Position: Front center (0, 0, -1) = straight ahead
      pannerNode.setPosition(0, 0, -1);
      pannerNode.setOrientation(0, 0, -1);

      source.connect(pannerNode);
      pannerNode.connect(audioContext.destination);
      pannerNodeRef.current = pannerNode;

      // Setup background music panner (BEHIND)
      if (backgroundMusicRef.current) {
        const musicSource = audioContext.createMediaElementSource(
          backgroundMusicRef.current
        );
        const musicPanner = audioContext.createPanner();
        musicPanner.panningModel = "HRTF";
        musicPanner.setPosition(0, 0, 1); // Behind listener

        musicSource.connect(musicPanner);
        musicPanner.connect(audioContext.destination);
        musicPannerNodeRef.current = musicPanner;
      }

      console.log(
        "[3D Spatial Audio] Setup complete - Use headphones for full immersion!"
      );
    } catch (error) {
      console.error("[3D Spatial Audio] Setup failed:", error);
    }
    */
  };

  // 🎮 PANDORA'S BOX #8: Learning Mode - Generate AI quiz from listening section
  const generateQuiz = async () => {
    if (!learningModeEnabled || showQuiz) return;

    // Get last 5 minutes of content (approx 10-15 sentences)
    const recentSentences = sentences
      .slice(Math.max(0, activeSentenceIndex - 15), activeSentenceIndex)
      .map((s) => s.text)
      .join(" ");

    if (recentSentences.length < 100) return; // Not enough content

    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: recentSentences,
          bookId: bookSlug,
          chapterId: chapterNumber,
        }),
      });

      if (response.ok) {
        const quiz = await response.json();
        setCurrentQuiz(quiz);
        setShowQuiz(true);
        setLastQuizTime(currentTime);

        // Pause playback for quiz
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
        }

        trackEvent("learning_mode_quiz_generated", {
          sentenceIndex: activeSentenceIndex,
          bookId: bookSlug,
          chapterId: chapterNumber,
        });
      }
    } catch (error) {
      console.error("[Learning Mode] Quiz generation failed:", error);
    }
  };

  const submitQuizAnswer = (selectedAnswer: number) => {
    if (!currentQuiz) return;

    setQuizAnswer(selectedAnswer);
    setShowQuizResult(true);

    const isCorrect = selectedAnswer === currentQuiz.correctAnswer;
    const xpEarned = isCorrect ? 10 : 5;
    setQuizXP((prev) => prev + xpEarned);

    trackEvent("learning_mode_quiz_answered", {
      isCorrect,
      xpEarned,
      totalXP: quizXP + xpEarned,
      bookId: bookSlug,
      chapterId: chapterNumber,
    });

    // Auto-close quiz after 3 seconds and resume playback
    setTimeout(() => {
      setShowQuiz(false);
      setShowQuizResult(false);
      setQuizAnswer(null);
      if (audioRef.current && !isPlaying) {
        audioRef.current.play();
      }
    }, 3000);
  };

  // 👥 PANDORA'S BOX #9: Social Listening - Create/Join room
  const createSocialRoom = () => {
    const newRoomId = `room_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    setRoomId(newRoomId);
    setSocialRoomEnabled(true);
    setShowRoomChat(true);

    trackEvent("social_room_created", {
      roomId: newRoomId,
      bookId: bookSlug,
      chapterId: chapterNumber,
    });

    // Copy room link to clipboard
    const roomLink = `${window.location.origin}/listen-together/${newRoomId}`;
    navigator.clipboard.writeText(roomLink);
    alert(`🎉 Room created! Link copied to clipboard:\n${roomLink}`);
  };

  // 👁️ PANDORA'S BOX #10: Biometric Focus Detection
  const startFocusDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      videoStreamRef.current = stream;
      setFocusDetectionEnabled(true);

      // TODO: Integrate TensorFlow.js FaceMesh for eye tracking
      // For now, use basic visibility API
      document.addEventListener("visibilitychange", handleVisibilityChange);

      trackEvent("focus_detection_started", {
        bookId: bookSlug,
        chapterId: chapterNumber,
      });
    } catch (error) {
      console.error("[Focus Detection] Camera access denied:", error);
      alert("Camera access required for focus detection.");
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setIsUserFocused(false);
      setFocusLostTime(Date.now());
    } else {
      setIsUserFocused(true);

      // If user was unfocused for more than 5 seconds, rewind
      if (focusLostTime && Date.now() - focusLostTime > 5000) {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, currentTime - 30);
        }
        trackEvent("focus_lost_rewind", {
          lostDuration: Date.now() - focusLostTime,
          rewoundSeconds: 30,
          bookId: bookSlug,
        });
      }
    }
  };

  const stopFocusDetection = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    setFocusDetectionEnabled(false);
  };

  // Spotify Integration Functions
  const authenticateSpotify = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/spotify/callback`;
    const scopes = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-library-read",
      "user-library-modify",
      "playlist-read-private",
      "playlist-read-collaborative",
    ].join(" ");

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;

    // Open popup for OAuth
    const popup = window.open(authUrl, "Spotify Auth", "width=600,height=800");

    // Listen for callback
    const messageListener = (event: MessageEvent) => {
      if (event.data.type === "spotify-auth-success") {
        setSpotifyAccessToken(event.data.token);
        fetchUserPlaylists(event.data.token);
        popup?.close();
        window.removeEventListener("message", messageListener);
      }
    };

    window.addEventListener("message", messageListener);
  };

  const fetchUserPlaylists = async (token: string) => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/playlists?limit=50",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch playlists");

      const data = await response.json();
      setSpotifyPlaylists(
        data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          images: item.images,
        }))
      );
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const initializeSpotifyPlayer = async () => {
    if (!spotifyAccessToken) return;

    // Load Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Dynasty Academy Listen Mode",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(spotifyAccessToken!);
        },
        volume: 0.3, // Start at 30% for background
      });

      // Error handling
      player.addListener("initialization_error", ({ message }: any) =>
        console.error("Spotify Init Error:", message)
      );
      player.addListener("authentication_error", ({ message }: any) =>
        console.error("Spotify Auth Error:", message)
      );
      player.addListener("account_error", ({ message }: any) =>
        console.error("Spotify Account Error:", message)
      );
      player.addListener("playback_error", ({ message }: any) =>
        console.error("Spotify Playback Error:", message)
      );

      // Ready
      player.addListener("ready", ({ device_id }: any) => {
        console.log("Spotify Player Ready!", device_id);
        spotifyPlayerRef.current = { player, deviceId: device_id };
      });

      // Connect
      player.connect();
    };
  };

  const playSpotifyPlaylist = async (playlistId: string) => {
    if (!spotifyPlayerRef.current || !spotifyAccessToken) return;

    try {
      const { deviceId } = spotifyPlayerRef.current;

      // Transfer playback to our player
      await fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: true,
        }),
      });

      // Play the playlist
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context_uri: `spotify:playlist:${playlistId}`,
          }),
        }
      );

      setSelectedPlaylist(playlistId);
      setupAutoDucking();
    } catch (error) {
      console.error("Error playing Spotify playlist:", error);
    }
  };

  const setupAutoDucking = () => {
    if (!spotifyPlayerRef.current) return;

    const { player } = spotifyPlayerRef.current;

    // Monitor narrator audio element
    const checkNarratorPlaying = setInterval(() => {
      const audioElement = document.querySelector("audio") as HTMLAudioElement;

      if (audioElement && !audioElement.paused) {
        // Narrator is speaking - duck Spotify to 15%
        player.setVolume(0.15);
      } else {
        // Narrator paused - restore Spotify to 30%
        player.setVolume(0.3);
      }
    }, 200);

    // Cleanup on component unmount
    return () => clearInterval(checkNarratorPlaying);
  };

  const disconnectSpotify = () => {
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.player.disconnect();
      spotifyPlayerRef.current = null;
    }
    setSpotifyEnabled(false);
    setSpotifyAccessToken(null);
    setSpotifyPlaylists([]);
    setSelectedPlaylist(null);
  };

  const generateAudio = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Generating audio for chapter:", chapterNumber);
      const response = await fetch(`/api/books/${bookSlug}/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterNumber,
          content: pageContent.replace(/<[^>]*>/g, ""),
          voiceId: selectedVoice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        const errorMessage =
          errorData.details || errorData.error || "Failed to generate audio";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Audio API response:", data);

      if (!data.audioUrl) {
        console.error("No audioUrl in response:", data);
        throw new Error("No audio data received");
      }

      // The API returns the full data URL already
      setAudioUrl(data.audioUrl);
      setHasGenerated(true);
      setIsCached(data.cached || false);
      console.log("Audio URL set successfully, cached:", data.cached);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate audio. Please try again.";
      setError(errorMessage);
      console.error("Audio generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) {
      console.error("Audio ref not available");
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        // Track pause with intelligence
        if (isPremiumUser) {
          intelligence.onPause();
        }
      } else {
        await audioRef.current.play();
        // Start tracking when playback begins
        if (isPremiumUser) {
          intelligence.startTracking();
          intelligence.onResume();
        }
      }
    } catch (err) {
      console.error("Playback error:", err);
      setError("Failed to play audio. Please try regenerating.");
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(currentTime - 10, 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);

    // Block seek beyond 3 minutes for free users
    if (!isPremiumUser && newTime > 180) {
      setShowPaywallGate(true);
      trackEvent("seek_blocked_free", {
        fromSec: currentTime,
        toSec: newTime,
        bookId: bookSlug,
        chapterId: chapterNumber,
      });
      console.log("[Paywall] Seek blocked: attempted", newTime, "seconds");
      return; // Don't allow the seek
    }

    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return; // 🔥 OPEN ACCESS: Download available to all

    trackEvent("audio_download", {
      bookId: bookSlug,
      chapterId: chapterNumber,
      voiceId: selectedVoice,
      durationSec: duration,
    });

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${bookSlug}-chapter-${chapterNumber}.mp3`;
    link.click();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 💾 NEW: Highlight sentence toggle
  const toggleHighlight = (index: number) => {
    setHighlightedSentences((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
        trackEvent("sentence_unhighlighted", {
          sentenceIndex: index,
          bookId: bookSlug,
          chapterId: chapterNumber,
        });
      } else {
        newSet.add(index);
        trackEvent("sentence_highlighted", {
          sentenceIndex: index,
          sentenceText: sentences[index]?.text.substring(0, 50) + "...",
          bookId: bookSlug,
          chapterId: chapterNumber,
        });
      }
      return newSet;
    });
  };

  // 📱 NEW: Share sentence as image
  const shareSentence = async (index: number) => {
    const sentence = sentences[index];
    if (!sentence) return;

    try {
      await navigator.share({
        title: "Dynasty Academy",
        text: `"${sentence.text}"\n\n— via Dynasty Academy`,
        url: window.location.href,
      });
      trackEvent("sentence_shared", {
        sentenceIndex: index,
        method: "native_share",
        bookId: bookSlug,
        chapterId: chapterNumber,
      });
    } catch (err) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `"${sentence.text}"\n\n— via Dynasty Academy`
      );
      trackEvent("sentence_shared", {
        sentenceIndex: index,
        method: "clipboard",
        bookId: bookSlug,
        chapterId: chapterNumber,
      });
    }
  };

  // 🤖 NEW: AI Explain sentence (placeholder for future AI Study Buddy integration)
  const explainSentence = (index: number) => {
    const sentence = sentences[index];
    if (!sentence) return;

    // TODO: Integrate with AI Study Buddy API
    alert(
      `AI Explain coming soon!\n\nSentence: "${sentence.text.substring(
        0,
        100
      )}..."`
    );
    trackEvent("sentence_explain_requested", {
      sentenceIndex: index,
      bookId: bookSlug,
      chapterId: chapterNumber,
    });
  };

  // 📝 NEW: Create reflection from sentence
  const reflectOnSentence = (index: number) => {
    const sentence = sentences[index];
    if (!sentence) return;

    // TODO: Open reflection modal pre-filled with sentence
    alert(
      `Reflection modal coming soon!\n\nSentence: "${sentence.text.substring(
        0,
        100
      )}..."`
    );
    trackEvent("sentence_reflect_clicked", {
      sentenceIndex: index,
      bookId: bookSlug,
      chapterId: chapterNumber,
    });
  };

  const selectedVoiceData =
    voices.find((v) => v.id === selectedVoice) || voices[0];
  const currentSpeed =
    speeds.find((s) => s.value === playbackRate) || speeds[1];

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen bg-gradient-to-br transition-all duration-1000 ${
        backgroundGradient || "from-slate-950 via-purple-950 to-slate-950"
      }`}
    >
      {/* Animated background particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full animate-float ${
                listenAtmosphere !== "none"
                  ? `bg-${
                      listeningAtmospheres[
                        listenAtmosphere as keyof typeof listeningAtmospheres
                      ]?.particleColor || "purple-400"
                    }/40`
                  : "bg-purple-400/30"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 🔥 PHASE 2: Streak Badge (animated on update) */}
        {showStreakBadge && isPremiumUser && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-500">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-1 rounded-2xl shadow-2xl">
              <div className="bg-gray-900 rounded-xl px-6 py-3 flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-400 animate-bounce" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Streak Updated!
                  </p>
                  <p className="text-lg font-bold text-white">
                    {currentStreak} Days
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-semibold">
              Dynasty Listen Mode™
            </span>
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            {isPremiumUser && currentStreak > 0 && (
              <>
                <span className="text-gray-500">•</span>
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-orange-400 font-bold text-sm">
                  {currentStreak} Day Streak
                </span>
              </>
            )}
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Immersive Audio Experience
          </h1>
          <p className="text-xl text-purple-300/80 max-w-2xl mx-auto">
            Every sentence illuminates. Every word resonates. Transform reading
            into ritual.
          </p>
        </div>

        {/* Main Player Card */}
        <div className="bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-500/10 overflow-hidden mb-8">
          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              crossOrigin="anonymous"
            />
          )}

          {/* 🔥 REVOLUTIONARY: Background Music Layer (World's First Audio Layering in Reading App!) */}
          {backgroundMusicUrl && (
            <audio
              ref={backgroundMusicRef}
              src={backgroundMusicUrl}
              loop
              autoPlay
              style={{ display: "none" }}
              onCanPlay={() => {
                if (backgroundMusicRef.current) {
                  backgroundMusicRef.current.volume = backgroundMusicVolume;
                }
              }}
            />
          )}

          {/* Voice Selection (Before Generation) */}
          {!hasGenerated && (
            <div className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <Headphones className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  Choose Your Voice
                </h2>
                <p className="text-purple-300/70">
                  Select the perfect narrator for your journey
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoice(voice.id);
                      trackEvent("voice_selected", {
                        voiceId: voice.id,
                        voiceName: voice.name,
                        isPremiumVoice: voice.premium,
                        bookId: bookSlug,
                        chapterId: chapterNumber,
                      });
                    }}
                    className={`relative group p-6 rounded-2xl transition-all duration-300 ${
                      selectedVoice === voice.id
                        ? `bg-gradient-to-br ${voice.gradient} shadow-lg shadow-purple-500/30 scale-105`
                        : "bg-slate-800/50 hover:bg-slate-800/80 hover:scale-102"
                    }`}
                  >
                    {voice.premium && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 inline mr-1" />
                        PREMIUM
                      </div>
                    )}
                    <div className="text-4xl mb-3">{voice.icon}</div>
                    <h3 className="text-white font-bold mb-1">{voice.name}</h3>
                    <p className="text-xs text-purple-300/70 mb-2">
                      {voice.personality}
                    </p>
                    <p className="text-xs text-purple-300/50">
                      {voice.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* 🎙️ PANDORA'S BOX: Clone Your Voice Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowVoiceCloning(true)}
                  className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-500 hover:via-rose-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 flex items-center justify-center gap-3 group"
                >
                  <span className="text-2xl">🎙️</span>
                  <span>Clone YOUR Voice</span>
                  <span className="px-2 py-0.5 bg-white/20 text-xs rounded-full">
                    WORLD'S FIRST
                  </span>
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <p className="text-xs text-center text-purple-300/60 mt-2">
                  Hear books in your own voice • Takes 30 seconds • Powered by
                  ElevenLabs
                </p>
              </div>

              <button
                onClick={generateAudio}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:via-violet-500 hover:to-purple-500 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <Wind className="w-6 h-6 animate-spin" />
                    Crafting Your Experience...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Generate Audio
                    <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </span>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                  {error}
                </div>
              )}

              {/* Premium Instant Delivery Indicator (Cached) */}
              {isCached && hasGenerated && !error && (
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 rounded-xl text-center backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-lg shadow-amber-500/20">
                  <div className="flex items-center justify-center gap-2 text-amber-300 font-bold mb-2">
                    <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
                    <span className="text-lg bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
                      Premium Instant Access
                    </span>
                    <svg
                      className="w-6 h-6 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <p className="text-sm text-amber-200/90 font-medium">
                    ⚡{" "}
                    <span className="font-bold text-amber-100">
                      VIP Priority Delivery
                    </span>{" "}
                    • Pre-optimized for you
                  </p>
                  <p className="text-xs text-amber-300/70 mt-1">
                    Your audio is ready instantly—no waiting! ✨
                  </p>
                </div>
              )}

              {/* Premium First-Generation Success */}
              {!isCached && hasGenerated && !error && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-purple-500/20 border border-purple-400/50 rounded-xl text-center backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-lg shadow-purple-500/20">
                  <div className="flex items-center justify-center gap-2 text-purple-300 font-bold mb-2">
                    <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                    <span className="text-lg bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
                      Masterfully Crafted Audio
                    </span>
                    <svg
                      className="w-6 h-6 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <p className="text-sm text-purple-200/90 font-medium">
                    🎙️{" "}
                    <span className="font-bold text-purple-100">
                      Studio-Quality Narration
                    </span>{" "}
                    • AI-powered perfection
                  </p>
                  <p className="text-xs text-purple-300/70 mt-1">
                    Professionally optimized for your listening pleasure ✨
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Player Interface (After Generation) */}
          {hasGenerated && audioUrl && (
            <div className="p-8 sm:p-12">
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                  {error}
                </div>
              )}

              {/* 🎨 ENHANCED: Real Audio Visualizer with Web Audio API */}
              <div className="mb-8 h-32 flex items-center justify-center gap-1.5">
                {visualizerStyle === "wave" && (
                  <>
                    {[...Array(32)].map((_, i) => {
                      const frequency = audioFrequencies[i] || 0;
                      const height = isPlaying
                        ? Math.max(20, (frequency / 255) * 120)
                        : 20;
                      return (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full transition-all duration-100 ${
                            isPlaying
                              ? "bg-gradient-to-t from-purple-600 via-violet-500 to-blue-500"
                              : "bg-slate-700"
                          }`}
                          style={{
                            height: `${height}px`,
                            opacity: isPlaying
                              ? 0.8 + (frequency / 255) * 0.2
                              : 0.5,
                          }}
                        />
                      );
                    })}
                  </>
                )}
                {visualizerStyle === "bars" && (
                  <>
                    {[...Array(24)].map((_, i) => {
                      const frequency =
                        audioFrequencies[Math.floor(i * 1.33)] || 0;
                      const height = isPlaying
                        ? Math.max(15, (frequency / 255) * 100)
                        : 15;
                      return (
                        <div
                          key={i}
                          className="relative w-2"
                          style={{ height: "100px" }}
                        >
                          <div
                            className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-75 ${
                              isPlaying
                                ? "bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-500"
                                : "bg-slate-700"
                            }`}
                            style={{
                              height: `${height}%`,
                              boxShadow: isPlaying
                                ? `0 0 ${
                                    frequency / 10
                                  }px rgba(20, 184, 166, 0.5)`
                                : "none",
                            }}
                          />
                        </div>
                      );
                    })}
                  </>
                )}
                {visualizerStyle === "pulse" && (
                  <div className="relative w-48 h-48">
                    {[...Array(5)].map((_, i) => {
                      const avgFrequency =
                        audioFrequencies.reduce((sum, val) => sum + val, 0) /
                        audioFrequencies.length;
                      const scale = isPlaying
                        ? 0.5 + (avgFrequency / 255) * (1 + i * 0.2)
                        : 0.5;
                      return (
                        <div
                          key={i}
                          className={`absolute inset-0 rounded-full border-4 transition-all duration-200 ${
                            isPlaying ? "border-purple-500" : "border-slate-700"
                          }`}
                          style={{
                            transform: `scale(${scale})`,
                            opacity: isPlaying ? 0.8 - i * 0.15 : 0.3,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Now Playing Info */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className={`text-5xl animate-bounce-slow`}>
                    {selectedVoiceData.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white">
                      {selectedVoiceData.name}
                    </h3>
                    <p className="text-sm text-purple-300/70">
                      {selectedVoiceData.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Controls */}
              <div className="space-y-6 mb-8">
                {/* Play/Pause Button with Pulse Effect - Mobile-friendly */}
                <button
                  onClick={togglePlayPause}
                  className={`w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 active:from-purple-700 active:to-violet-700 text-white font-bold py-6 px-8 min-h-[56px] rounded-2xl transition-all duration-300 shadow-lg hover:scale-102 group relative overflow-hidden touch-manipulation ${
                    isPlaying
                      ? "shadow-purple-500/60 animate-glow"
                      : "shadow-purple-500/30 hover:shadow-purple-500/50"
                  }`}
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying && (
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 animate-pulse-slow" />
                  )}
                  <span className="relative flex items-center justify-center gap-3 text-xl">
                    {isPlaying ? (
                      <>
                        <Pause className="w-7 h-7" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-7 h-7" />
                        Play
                      </>
                    )}
                  </span>
                </button>

                {/* Skip Controls - Mobile-friendly touch targets (min-height: 44px) */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={skipBackward}
                    className="p-4 min-w-[44px] min-h-[44px] bg-slate-800/50 hover:bg-slate-700/50 active:bg-slate-700/70 rounded-full transition-all duration-200 group touch-manipulation"
                    aria-label="Skip backward 10 seconds"
                  >
                    <SkipBack className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                  </button>

                  {/* 💾 Download Button */}
                  <button
                    onClick={downloadAudio}
                    disabled={!audioUrl}
                    className={`p-4 min-w-[44px] min-h-[44px] rounded-full transition-all duration-200 group touch-manipulation ${
                      audioUrl
                        ? "bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 shadow-lg shadow-emerald-500/30"
                        : "bg-slate-800/30 cursor-not-allowed opacity-50"
                    }`}
                    aria-label="Download audio"
                    title="Download audio (MP3)"
                  >
                    <Download
                      className={`w-6 h-6 ${
                        audioUrl ? "text-white" : "text-slate-500"
                      } group-hover:scale-110 transition-transform`}
                    />
                  </button>

                  <button
                    onClick={skipForward}
                    className="p-4 min-w-[44px] min-h-[44px] bg-slate-800/50 hover:bg-slate-700/50 active:bg-slate-700/70 rounded-full transition-all duration-200 group touch-manipulation"
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3 mb-8">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="w-full h-3 bg-slate-800/50 rounded-full appearance-none cursor-pointer luxury-slider touch-manipulation"
                    style={{
                      background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(139 92 246) ${
                        (currentTime / duration) * 100
                      }%, rgb(30 41 59 / 0.5) ${
                        (currentTime / duration) * 100
                      }%, rgb(30 41 59 / 0.5) 100%)`,
                      minHeight: "44px", // Touch-friendly height
                    }}
                    aria-label="Audio progress"
                    aria-valuemin={0}
                    aria-valuemax={duration}
                    aria-valuenow={currentTime}
                  />
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-purple-300 font-medium">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-purple-300/50">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Premium Lock Message */}
                {!isPremiumUser && duration > 180 && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg px-4 py-2 text-sm">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300">
                        🔒 Unlock full-length audio & premium voices —
                        <button className="ml-1 underline font-semibold hover:text-amber-200 transition-colors">
                          Go Premium
                        </button>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Controls Row */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Volume Control */}
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-purple-300">
                      Volume
                    </span>
                    <button
                      onClick={toggleMute}
                      className="text-purple-400 hover:text-purple-300 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer touch-manipulation"
                    style={{ minHeight: "44px" }}
                    aria-label="Volume control"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={volume}
                  />
                  <div className="text-xs text-purple-300/50 mt-2 text-center">
                    {volume}%
                  </div>
                </div>

                {/* Speed Control */}
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-purple-300">
                      Speed
                    </span>
                    <span className="text-xl">{currentSpeed.icon}</span>
                  </div>
                  <select
                    value={playbackRate}
                    onChange={(e) => {
                      const newSpeed = parseFloat(e.target.value);
                      setPlaybackRate(newSpeed);

                      // Track speed change with intelligence
                      if (isPremiumUser) {
                        intelligence.onSpeedChange();
                      }

                      trackEvent("speed_changed", {
                        fromSpeed: playbackRate,
                        toSpeed: newSpeed,
                        bookId: bookSlug,
                        chapterId: chapterNumber,
                      });
                    }}
                    className="w-full bg-slate-700/50 text-purple-300 rounded-lg p-2 text-sm border border-purple-500/20 focus:border-purple-500/50 focus:outline-none touch-manipulation min-h-[44px]"
                    aria-label="Playback speed"
                  >
                    {speeds.map((speed) => (
                      <option key={speed.value} value={speed.value}>
                        {speed.icon} {speed.label} ({speed.value}x)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Premium Features - Mobile-friendly */}
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                <button
                  onClick={() => {
                    const newState = !followText;
                    setFollowText(newState);
                    trackEvent("follow_along_toggle", {
                      enabled: newState,
                      bookId: bookSlug,
                      chapterId: chapterNumber,
                    });
                  }}
                  className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg transition-all duration-200 touch-manipulation ${
                    followText
                      ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                      : "bg-slate-800/30 text-slate-400 border border-slate-700/50"
                  }`}
                  aria-label="Toggle auto-scroll"
                  aria-pressed={followText}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Auto-Scroll</span>
                </button>

                <button
                  onClick={() => setShowParticles(!showParticles)}
                  className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg transition-all duration-200 touch-manipulation ${
                    showParticles
                      ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                      : "bg-slate-800/30 text-slate-400 border border-slate-700/50"
                  }`}
                  aria-label="Toggle visual effects"
                  aria-pressed={showParticles}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Effects</span>
                </button>

                {isPremiumUser && (
                  <button
                    onClick={downloadAudio}
                    className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-gradient-to-r from-amber-600/30 to-orange-600/30 text-amber-300 border border-amber-500/50 rounded-lg hover:from-amber-600/40 hover:to-orange-600/40 active:from-amber-600/50 active:to-orange-600/50 transition-all duration-200 touch-manipulation"
                    aria-label="Download audio file"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                )}
              </div>

              {/* 🎵 NEW: Audio Enhancement Suite */}
              {/* 🎉 OPEN ACCESS: Available to everyone until launch! */}
              {true && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Sleep Timer */}
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-purple-300">
                        Sleep Timer
                      </span>
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <select
                      value={sleepTimer}
                      onChange={(e) => {
                        const minutes = parseInt(e.target.value);
                        setSleepTimer(minutes);
                        trackEvent("sleep_timer_set", {
                          minutes,
                          bookId: bookSlug,
                          chapterId: chapterNumber,
                        });
                      }}
                      className="w-full bg-slate-700/50 text-purple-300 rounded-lg p-2 text-sm border border-purple-500/20 focus:border-purple-500/50 focus:outline-none touch-manipulation min-h-[44px]"
                    >
                      <option value={0}>Off</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                    </select>
                  </div>

                  {/* Visualizer Style */}
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-purple-300">
                        Visualizer
                      </span>
                      <Music className="w-5 h-5 text-purple-400" />
                    </div>
                    <select
                      value={visualizerStyle}
                      onChange={(e) => {
                        const style = e.target.value as
                          | "wave"
                          | "pulse"
                          | "bars";
                        setVisualizerStyle(style);
                        trackEvent("visualizer_changed", {
                          style,
                          bookId: bookSlug,
                          chapterId: chapterNumber,
                        });
                      }}
                      className="w-full bg-slate-700/50 text-purple-300 rounded-lg p-2 text-sm border border-purple-500/20 focus:border-purple-500/50 focus:outline-none touch-manipulation min-h-[44px]"
                    >
                      <option value="wave">🌊 Wave</option>
                      <option value="bars">📊 Bars</option>
                      <option value="pulse">⭕ Pulse</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 🔥 REVOLUTIONARY: Listening Atmosphere Presets (WORLD'S FIRST!) */}
              {/* 🎉 OPEN ACCESS: Available to everyone until launch! */}
              {hasGenerated && (
                <div className="space-y-4 mb-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                      <Music className="w-5 h-5 text-purple-400" />
                      🎧 Listening Atmospheres
                      <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    </h3>
                    <p className="text-purple-300/70 text-sm mb-4">
                      One-click audio environments that blend music with
                      narration
                    </p>
                  </div>

                  {/* Atmosphere Preset Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(listeningAtmospheres).map(
                      ([key, atmosphere]) => (
                        <button
                          key={key}
                          onClick={() => applyListenAtmosphere(key)}
                          className={`p-4 rounded-xl transition-all duration-300 border-2 ${
                            listenAtmosphere === key
                              ? "border-purple-500 bg-gradient-to-br from-purple-600/30 to-violet-600/30 shadow-lg shadow-purple-500/30"
                              : "border-slate-700/50 bg-slate-800/30 hover:border-purple-500/50 hover:bg-slate-700/30"
                          }`}
                        >
                          <div className="text-2xl mb-2">
                            {atmosphere.name.split(" ")[0]}
                          </div>
                          <div className="text-xs font-bold text-white mb-1">
                            {atmosphere.name.split(" ").slice(1).join(" ")}
                          </div>
                          <div className="text-xs text-purple-300/70">
                            {atmosphere.description}
                          </div>
                        </button>
                      )
                    )}
                  </div>

                  {/* Background Music Volume Control */}
                  {listenAtmosphere !== "none" && backgroundMusicUrl && (
                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-purple-300">
                          🎵 Background Music Volume
                        </span>
                        <span className="text-xs text-purple-400">
                          {Math.round(backgroundMusicVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.01"
                        value={backgroundMusicVolume}
                        onChange={(e) => {
                          const newVolume = parseFloat(e.target.value);
                          setBackgroundMusicVolume(newVolume);
                          if (backgroundMusicRef.current) {
                            backgroundMusicRef.current.volume = newVolume;
                          }
                        }}
                        className="w-full h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer luxury-slider"
                      />
                      <p className="text-xs text-purple-300/60 mt-2">
                        🎧 Music layers behind narration for immersive
                        experience
                      </p>
                    </div>
                  )}

                  {/* Advanced Atmosphere Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Voice Mood Sync */}
                    <div className="bg-slate-800/30 rounded-xl p-3 border border-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-purple-300">
                            🎨 Voice Mood Sync
                          </span>
                          <p className="text-xs text-purple-300/50 mt-1">
                            Visual matches voice
                          </p>
                        </div>
                        <button
                          onClick={() => setVoiceMoodSync(!voiceMoodSync)}
                          className={`w-12 h-6 rounded-full transition-all duration-300 ${
                            voiceMoodSync ? "bg-purple-600" : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              voiceMoodSync
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Time-Based Rituals */}
                    <div className="bg-slate-800/30 rounded-xl p-3 border border-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-purple-300">
                            ⏰ Smart Time Switching
                          </span>
                          <p className="text-xs text-purple-300/50 mt-1">
                            Auto-optimize for time
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setAutoListeningRitual(!autoListeningRitual)
                          }
                          className={`w-12 h-6 rounded-full transition-all duration-300 ${
                            autoListeningRitual
                              ? "bg-purple-600"
                              : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              autoListeningRitual
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      {autoListeningRitual && (
                        <div className="mt-2 text-xs text-purple-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Currently: {currentListeningPeriod}
                        </div>
                      )}
                    </div>

                    {/* Audio Reactivity */}
                    <div className="bg-slate-800/30 rounded-xl p-3 border border-purple-500/10 sm:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-300">
                          🌊 Audio-Reactive Intensity
                        </span>
                        <span className="text-xs text-purple-400">
                          {audioReactiveIntensity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={audioReactiveIntensity}
                        onChange={(e) =>
                          setAudioReactiveIntensity(parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer luxury-slider"
                      />
                      <p className="text-xs text-purple-300/60 mt-2">
                        ✨ Background brightness pulses with narrator's voice
                      </p>
                    </div>

                    {/* 🧠 PANDORA'S BOX: Emotional Intelligence AI */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-4 border-2 border-purple-400/50 sm:col-span-2 shadow-xl shadow-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
                          <span className="text-sm font-bold text-purple-200">
                            🧠 Emotional Intelligence AI
                          </span>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full">
                            WORLD'S FIRST
                          </span>
                        </div>
                        <button
                          onClick={() => setEmotionalMode(!emotionalMode)}
                          className={`w-12 h-6 rounded-full transition-all duration-300 ${
                            emotionalMode
                              ? "bg-gradient-to-r from-purple-600 to-pink-600"
                              : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              emotionalMode
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      {emotionalMode && (
                        <div className="space-y-2">
                          <p className="text-xs text-purple-300/80">
                            AI reads emotional context and auto-adjusts voice
                            speed, background music, and visuals in real-time
                          </p>
                          {currentEmotion !== "neutral" && (
                            <div className="flex items-center gap-3 mt-3 p-3 bg-black/30 rounded-lg border border-purple-500/30">
                              <div className="flex-1">
                                <div className="text-xs text-purple-400 mb-1">
                                  Current Emotion:
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {currentEmotion === "tension" && "⚡"}
                                    {currentEmotion === "joy" && "✨"}
                                    {currentEmotion === "wisdom" && "💡"}
                                    {currentEmotion === "suspense" && "🎭"}
                                  </span>
                                  <span className="text-sm font-bold text-white capitalize">
                                    {currentEmotion}
                                  </span>
                                  <span className="text-xs text-purple-300">
                                    ({emotionIntensity}% intensity)
                                  </span>
                                </div>
                              </div>
                              <div
                                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse"
                                style={{ opacity: emotionIntensity / 100 }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 🤖 PANDORA'S BOX: AI Study Buddy Toggle */}
                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-4 border-2 border-blue-400/50 shadow-xl shadow-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-200">
                              🤖 AI Study Buddy
                            </span>
                            <Crown className="w-4 h-4 text-yellow-400" />
                          </div>
                          <p className="text-xs text-blue-300/70 mt-1">
                            Chat about what you're hearing
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAIChat(!showAIChat)}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            showAIChat
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          {showAIChat ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* 💡 PANDORA'S BOX: Smart Bookmarks Info */}
                    <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-xl p-4 border-2 border-emerald-400/50 shadow-xl shadow-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-300" />
                        <div>
                          <div className="text-sm font-bold text-emerald-200">
                            💡 Smart Bookmarks
                          </div>
                          <p className="text-xs text-emerald-300/70 mt-1">
                            Click sentences to get AI insights •{" "}
                            {smartBookmarks.size} saved
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 🎭 PANDORA'S BOX: Multi-Voice Character Dialogues */}
                    <div className="bg-gradient-to-br from-orange-900/40 to-amber-900/40 rounded-xl p-4 border-2 border-orange-400/50 shadow-xl shadow-orange-500/20 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎭</span>
                          <div>
                            <div className="text-sm font-bold text-orange-200">
                              Multi-Voice Dialogues
                            </div>
                            <p className="text-xs text-orange-300/70 mt-1">
                              Different voice for each character • Radio drama
                              mode
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setMultiVoiceMode(!multiVoiceMode)}
                          className={`w-12 h-6 rounded-full transition-all duration-300 ${
                            multiVoiceMode
                              ? "bg-gradient-to-r from-orange-600 to-amber-600"
                              : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              multiVoiceMode
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      {multiVoiceMode && (
                        <div className="mt-3 p-3 bg-black/30 rounded-lg border border-orange-500/20">
                          <p className="text-xs text-orange-200/80 mb-2">
                            <strong>Voice Assignment:</strong>
                          </p>
                          <div className="space-y-1 text-xs">
                            <p className="text-orange-300/70">
                              📖 Narrator → Rachel (Professional Female)
                            </p>
                            <p className="text-orange-300/70">
                              👨 Male Characters → Adam (Deep Male)
                            </p>
                            <p className="text-orange-300/70">
                              👩 Female Characters → Bella (Warm Female)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 🎧 PANDORA'S BOX: 3D Spatial Audio */}
                    <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-xl p-4 border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-5 h-5 text-cyan-300" />
                          <div>
                            <div className="text-sm font-bold text-cyan-200">
                              🎧 3D Spatial Audio
                            </div>
                            <p className="text-xs text-cyan-300/70 mt-1">
                              Headphone immersion • Sound moves around you
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setSpatialAudioEnabled(!spatialAudioEnabled)
                          }
                          className={`w-12 h-6 rounded-full transition-all duration-300 ${
                            spatialAudioEnabled
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600"
                              : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              spatialAudioEnabled
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      {spatialAudioEnabled && (
                        <div className="mt-3 p-3 bg-black/30 rounded-lg border border-cyan-500/20">
                          <p className="text-xs text-cyan-200/80 mb-2 flex items-center gap-2">
                            <Headphones className="w-4 h-4" />
                            <strong>Use headphones for full effect!</strong>
                          </p>
                          <div className="space-y-1 text-xs">
                            <p className="text-cyan-300/70">
                              🎙️ Narrator voice → Front (straight ahead)
                            </p>
                            <p className="text-cyan-300/70">
                              🎵 Background music → Behind you
                            </p>
                            <p className="text-cyan-300/70">
                              ✨ Sound effects → Sides (L/R)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 🎮 PANDORA'S BOX: Learning Mode with Quizzes */}
                    <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-4 border-2 border-green-400/50 shadow-xl shadow-green-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎮</span>
                          <div>
                            <div className="text-sm font-bold text-green-200 flex items-center gap-2">
                              Learning Mode
                              <span className="text-xs bg-green-500/30 px-2 py-0.5 rounded-full">
                                {quizXP} XP
                              </span>
                            </div>
                            <p className="text-xs text-green-300/70 mt-1">
                              Quiz every 5 min • Gamified retention
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setLearningModeEnabled(!learningModeEnabled)
                          }
                          className={`w-12 h-6 rounded-full transition-all duration-300 ${
                            learningModeEnabled
                              ? "bg-gradient-to-r from-green-600 to-emerald-600"
                              : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              learningModeEnabled
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* 👥 PANDORA'S BOX: Social Listening Rooms */}
                    <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 rounded-xl p-4 border-2 border-pink-400/50 shadow-xl shadow-pink-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">👥</span>
                          <div>
                            <div className="text-sm font-bold text-pink-200">
                              Social Listening
                            </div>
                            <p className="text-xs text-pink-300/70 mt-1">
                              Listen with friends • Real-time sync
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={createSocialRoom}
                          disabled={socialRoomEnabled}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            socialRoomEnabled
                              ? "bg-pink-600/50 text-pink-200"
                              : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white"
                          }`}
                        >
                          {socialRoomEnabled ? "In Room" : "Create Room"}
                        </button>
                      </div>
                    </div>

                    {/* 👁️ PANDORA'S BOX: Biometric Focus Detection */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 rounded-xl p-4 border-2 border-indigo-400/50 shadow-xl shadow-indigo-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">👁️</span>
                          <div>
                            <div className="text-sm font-bold text-indigo-200">
                              Focus Detection
                            </div>
                            <p className="text-xs text-indigo-300/70 mt-1">
                              Never zone out • Auto-rewind
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            focusDetectionEnabled
                              ? stopFocusDetection()
                              : startFocusDetection()
                          }
                          className={`w-12 h-6 rounded-full transition-all duration-300 ${
                            focusDetectionEnabled
                              ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                              : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              focusDetectionEnabled
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      {focusDetectionEnabled && !isUserFocused && (
                        <div className="mt-3 p-3 bg-red-500/20 rounded-lg border border-red-500/30 animate-pulse">
                          <p className="text-xs text-red-200 font-bold text-center">
                            ⚠️ Focus lost! Rewinding in 5s...
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 🎵 PANDORA'S BOX #10: Spotify Integration */}
                    <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-4 border-2 border-green-400/50 shadow-xl shadow-green-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎵</span>
                          <div>
                            <div className="text-sm font-bold text-green-200">
                              Spotify Integration
                            </div>
                            <div className="text-xs text-green-300/60">
                              {spotifyAccessToken
                                ? selectedPlaylist
                                  ? "Playing your music"
                                  : `${spotifyPlaylists.length} playlists`
                                : "Use YOUR music"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowSpotifyModal(true)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg"
                        >
                          {spotifyAccessToken ? "Browse" : "Connect"}
                        </button>
                      </div>
                      {spotifyAccessToken && selectedPlaylist && (
                        <div className="mt-3 p-3 bg-black/30 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4 text-green-400" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-green-200 truncate">
                                {
                                  spotifyPlaylists.find(
                                    (p) => p.id === selectedPlaylist
                                  )?.name
                                }
                              </div>
                              <div className="text-xs text-green-300/60 mt-0.5">
                                Auto-ducking when narrator speaks
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🤖 AI STUDY BUDDY SIDEBAR */}
        {showAIChat && hasGenerated && (
          <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 border-l-2 border-blue-500/30 shadow-2xl z-50 flex flex-col">
            <div className="p-6 border-b border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      AI Study Buddy
                    </h3>
                    <p className="text-xs text-blue-300/70">
                      Ask anything about the book
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiChatMessages.length === 0 && (
                <div className="text-center text-blue-300/50 mt-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400/50" />
                  <p className="text-sm">
                    Ask me anything about what you're hearing!
                  </p>
                  <div className="mt-4 space-y-2 text-xs">
                    <p className="text-blue-400">
                      "Explain that concept simply"
                    </p>
                    <p className="text-blue-400">"Give me an example"</p>
                    <p className="text-blue-400">"How can I apply this?"</p>
                  </div>
                </div>
              )}
              {aiChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                        : "bg-slate-800/50 text-slate-200 border border-blue-500/20"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-blue-500/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAIChatInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && askAIStudyBuddy(aiChatInput)
                  }
                  placeholder="Ask a question..."
                  className="flex-1 bg-slate-800/50 border border-blue-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60"
                />
                <button
                  onClick={() => askAIStudyBuddy(aiChatInput)}
                  disabled={!aiChatInput.trim()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Text Display with Sentence Highlighting */}
        {hasGenerated && sentences.length > 0 && (
          <div
            className={`bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-500/10 p-8 sm:p-12 transition-all duration-1000 ${
              !isPremiumUser && "relative"
            }`}
            style={{
              filter: isPlaying
                ? `hue-rotate(${(currentTime / duration) * 30}deg)`
                : "none",
            }}
          >
            {/* 🔥 OPEN ACCESS: Sentence highlighting available to everyone until launch! */}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Waves className="w-6 h-6 text-purple-400 animate-pulse" />
                Follow Along
                {isPlaying && (
                  <span className="text-sm font-normal text-purple-400 animate-pulse">
                    ● Live
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-purple-300/70">
                  <Clock className="w-4 h-4" />
                  <span>{sentences.length} sentences</span>
                </div>
                {activeSentenceIndex >= 0 && (
                  <div className="text-sm text-purple-400 font-medium">
                    {activeSentenceIndex + 1} / {sentences.length}
                  </div>
                )}
              </div>
            </div>

            <div
              ref={containerRef}
              className="prose prose-lg prose-invert max-w-none overflow-y-auto max-h-[600px] leading-relaxed luxury-scrollbar"
              style={{ scrollBehavior: "smooth" }}
            >
              {sentences.map((sentence, index) => {
                const isHighlighted = highlightedSentences.has(index);
                return (
                  <span
                    key={index}
                    ref={(el) => {
                      sentenceRefs.current[index] = el;
                    }}
                    onClick={() => {
                      if (
                        isPremiumUser &&
                        audioRef.current &&
                        sentences[index]
                      ) {
                        audioRef.current.currentTime =
                          sentences[index].startTime;
                        setActiveSentenceIndex(index);

                        trackEvent("sentence_seek", {
                          sentenceIndex: index,
                          sentenceText: sentence.text.substring(0, 50) + "...",
                          seekTo: sentences[index].startTime,
                          bookId: bookSlug,
                          chapterId: chapterNumber,
                        });
                      }
                    }}
                    onContextMenu={(e) => {
                      if (isPremiumUser) {
                        e.preventDefault();
                        setShowSentenceMenu(index);
                      }
                    }}
                    onDoubleClick={() => {
                      if (isPremiumUser) {
                        toggleHighlight(index);
                      }
                    }}
                    className={`inline transition-all duration-500 ${
                      index === activeSentenceIndex
                        ? "relative bg-gradient-to-r from-purple-500/40 via-violet-500/40 to-blue-500/40 text-white font-semibold border-l-4 border-purple-400 pl-4 pr-2 py-2 rounded-r-lg shadow-lg shadow-purple-500/30 scale-105 animate-glow-text"
                        : isHighlighted
                        ? "bg-amber-500/20 text-amber-100 border-l-2 border-amber-400 pl-2 pr-1 py-1 rounded"
                        : index < activeSentenceIndex
                        ? "text-purple-300/40 line-through decoration-purple-500/30"
                        : "text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 rounded px-1"
                    } ${isPremiumUser ? "cursor-pointer" : ""}`}
                    style={{
                      textShadow:
                        index === activeSentenceIndex
                          ? "0 0 20px rgba(168, 85, 247, 0.5)"
                          : "none",
                    }}
                  >
                    {sentence.text}{" "}
                    {index === activeSentenceIndex && followText && (
                      <span className="inline-flex items-center gap-1 ml-2 animate-bounce-gentle">
                        <span className="relative inline-flex">
                          {/* Outer glow ring */}
                          <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 opacity-75 animate-ping-slow"></span>
                          {/* Inner glow ring */}
                          <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 opacity-50 animate-pulse"></span>
                          {/* Core icon */}
                          <span className="relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 shadow-2xl shadow-purple-500/50">
                            <svg
                              className="w-3 h-3 text-white animate-scroll-bounce"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                              />
                            </svg>
                          </span>
                        </span>
                        {/* Sparkle trail */}
                        <span className="text-purple-400 text-xs animate-sparkle">
                          ✨
                        </span>
                      </span>
                    )}
                    {isHighlighted && (
                      <span className="ml-1 text-amber-400 text-xs">★</span>
                    )}
                  </span>
                );
              })}

              {/* 💡 NEW: Interactive Sentence Context Menu */}
              {showSentenceMenu !== null && isPremiumUser && (
                <div
                  className="fixed z-50 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/20 py-2 min-w-[200px]"
                  style={{
                    top: sentenceRefs.current[
                      showSentenceMenu
                    ]?.getBoundingClientRect().bottom,
                    left: sentenceRefs.current[
                      showSentenceMenu
                    ]?.getBoundingClientRect().left,
                  }}
                  onMouseLeave={() => setShowSentenceMenu(null)}
                >
                  <button
                    onClick={() => {
                      toggleHighlight(showSentenceMenu);
                      setShowSentenceMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-purple-200 hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    {highlightedSentences.has(showSentenceMenu)
                      ? "Remove Highlight"
                      : "Highlight"}
                  </button>

                  {/* 💡 PANDORA'S BOX: Smart Bookmark with AI */}
                  <button
                    onClick={() => {
                      createSmartBookmark(showSentenceMenu);
                      setShowSentenceMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 border-t border-purple-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>💡 Smart Bookmark</span>
                      {smartBookmarks.has(showSentenceMenu) && (
                        <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                  {smartBookmarks.has(showSentenceMenu) &&
                    smartBookmarks.get(showSentenceMenu)?.aiSummary && (
                      <div className="px-4 py-3 bg-emerald-900/20 border-t border-emerald-500/20 text-xs space-y-1">
                        <p className="text-emerald-200">
                          <strong>Summary:</strong>{" "}
                          {smartBookmarks.get(showSentenceMenu)?.aiSummary}
                        </p>
                        <p className="text-emerald-200">
                          <strong>Insight:</strong>{" "}
                          {smartBookmarks.get(showSentenceMenu)?.keyInsight}
                        </p>
                        <p className="text-emerald-200">
                          <strong>Action:</strong>{" "}
                          {smartBookmarks.get(showSentenceMenu)?.actionable}
                        </p>
                      </div>
                    )}

                  <button
                    onClick={() => {
                      shareSentence(showSentenceMenu);
                      setShowSentenceMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-purple-200 hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Share Sentence
                  </button>
                  <button
                    onClick={() => {
                      reflectOnSentence(showSentenceMenu);
                      setShowSentenceMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-purple-200 hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Create Reflection
                  </button>
                  <button
                    onClick={() => {
                      explainSentence(showSentenceMenu);
                      setShowSentenceMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-purple-200 hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    AI Explain
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Premium Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-purple-400/60">
            <Sparkles className="w-4 h-4" />
            <span>
              Powered by DynastyBuilt AI — Turning knowledge into ritual.
            </span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* � LEARNING MODE QUIZ MODAL */}
      {showQuiz && currentQuiz && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 border-2 border-green-500/30 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Learning Mode Quiz
              </h2>
              <p className="text-green-300/70">
                Test your retention • Earn XP!
              </p>
            </div>

            {!showQuizResult ? (
              <div className="space-y-6">
                <div className="bg-black/30 rounded-xl p-6 border border-green-500/20">
                  <p className="text-lg text-white font-medium">
                    {currentQuiz.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => submitQuizAnswer(index)}
                      className="text-left p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border-2 border-green-500/20 hover:border-green-500/50 transition-all text-white"
                    >
                      <span className="font-bold text-green-400 mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div
                  className={`text-center p-6 rounded-xl ${
                    quizAnswer === currentQuiz.correctAnswer
                      ? "bg-green-500/20 border-2 border-green-500/50"
                      : "bg-red-500/20 border-2 border-red-500/50"
                  }`}
                >
                  <div className="text-6xl mb-3">
                    {quizAnswer === currentQuiz.correctAnswer ? "✅" : "❌"}
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    {quizAnswer === currentQuiz.correctAnswer
                      ? "Correct! +10 XP"
                      : "Not quite! +5 XP"}
                  </p>
                  <p className="text-sm text-white/70">Total XP: {quizXP}</p>
                </div>

                <div className="bg-black/30 rounded-xl p-6 border border-green-500/20">
                  <p className="text-sm font-bold text-green-400 mb-2">
                    Explanation:
                  </p>
                  <p className="text-white/80">{currentQuiz.explanation}</p>
                </div>

                <p className="text-center text-green-300/60 text-sm">
                  Resuming playback in 3 seconds...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* �🎙️ VOICE CLONING MODAL */}
      {showVoiceCloning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-950 via-pink-950 to-slate-950 border-2 border-pink-500/30 rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎙️</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Clone Your Voice
              </h2>
              <p className="text-pink-300/70">
                Record 30 seconds and hear books in YOUR voice
              </p>
            </div>

            {!audioBlob ? (
              <div className="space-y-6">
                <div className="bg-black/30 rounded-xl p-6 border border-pink-500/20">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    How it works:
                  </h3>
                  <ol className="space-y-2 text-sm text-pink-200/80">
                    <li>1. Click record and read any text for 30 seconds</li>
                    <li>2. We analyze your voice using AI</li>
                    <li>3. Your cloned voice appears in voice selection</li>
                    <li>4. Listen to ANY book in YOUR voice forever!</li>
                  </ol>
                </div>

                <div className="text-center">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-6 px-8 rounded-xl transition-all shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 flex items-center justify-center gap-3 group"
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-lg">Start Recording</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-pink-400 mb-2">
                          {recordingTime}s
                        </div>
                        <p className="text-pink-300/70">
                          Recording... (30s max)
                        </p>
                      </div>
                      <div className="flex gap-1 justify-center">
                        {[...Array(30)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-8 rounded-full transition-all ${
                              i < recordingTime ? "bg-pink-500" : "bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={stopRecording}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all"
                      >
                        Stop Recording
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-emerald-200 font-bold mb-2">
                    Recording Complete!
                  </p>
                  <p className="text-sm text-emerald-300/70">
                    {recordingTime} seconds recorded
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setAudioBlob(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all"
                  >
                    Re-record
                  </button>
                  <button
                    onClick={cloneVoice}
                    disabled={isCloning}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCloning ? (
                      <span className="flex items-center justify-center gap-2">
                        <Wind className="w-5 h-5 animate-spin" />
                        Cloning...
                      </span>
                    ) : (
                      "Clone Voice"
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowVoiceCloning(false);
                setAudioBlob(null);
                setIsRecording(false);
                setRecordingTime(0);
              }}
              className="mt-6 w-full text-pink-300/60 hover:text-pink-300 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Spotify Integration Modal */}
      {showSpotifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 border-2 border-green-500/30 rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎵</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Spotify Integration
              </h2>
              <p className="text-green-300/70">
                Use YOUR music as the perfect atmosphere
              </p>
            </div>

            {!spotifyAccessToken ? (
              <div className="space-y-6">
                <div className="bg-black/30 rounded-xl p-6 border border-green-500/20">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    Why Spotify?
                  </h3>
                  <ul className="space-y-2 text-sm text-green-200/80">
                    <li>• Browse YOUR playlists</li>
                    <li>• Pick ANY song you love</li>
                    <li>• Auto-ducking when narrator speaks</li>
                    <li>• Ultimate personalization</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    authenticateSpotify();
                    initializeSpotifyPlayer();
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Music className="w-5 h-5" />
                    Connect Spotify
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Music className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Connected</div>
                      <div className="text-green-300/60 text-sm">
                        {spotifyPlaylists.length} playlists available
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={disconnectSpotify}
                    className="text-red-400/60 hover:text-red-400 text-sm transition-colors"
                  >
                    Disconnect
                  </button>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-4">Your Playlists</h3>
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {spotifyPlaylists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => {
                          playSpotifyPlaylist(playlist.id);
                          setShowSpotifyModal(false);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          selectedPlaylist === playlist.id
                            ? "bg-green-500/20 border-green-500/50"
                            : "bg-black/20 border-green-500/10 hover:border-green-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {playlist.images[0] ? (
                            <img
                              src={playlist.images[0].url}
                              alt={playlist.name}
                              className="w-12 h-12 rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <Music className="w-6 h-6 text-green-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm truncate">
                              {playlist.name}
                            </div>
                            {selectedPlaylist === playlist.id && (
                              <div className="text-green-400 text-xs mt-1">
                                ✓ Playing
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowSpotifyModal(false)}
              className="mt-6 w-full text-green-300/60 hover:text-green-300 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-float {
          animation: float linear infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
          }
        }

        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.6),
              0 0 40px rgba(168, 85, 247, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.8),
              0 0 60px rgba(168, 85, 247, 0.5);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        .animate-glow-text {
          animation: glow-text 2s ease-in-out infinite;
        }

        @keyframes glow-text {
          0%,
          100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        .luxury-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
          transition: all 0.3s ease;
        }

        .luxury-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.8);
          transform: scale(1.1);
        }

        .luxury-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
          border: none;
          transition: all 0.3s ease;
        }

        .luxury-slider::-moz-range-thumb:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.8);
          transform: scale(1.1);
        }

        .scale-102 {
          transform: scale(1.02);
        }

        /* Beautiful Scroll Indicator Animations */
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-scroll-bounce {
          animation: scroll-bounce 1.5s ease-in-out infinite;
        }

        @keyframes scroll-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }

        /* ============================================ */
        /* LUXURY SCROLLBAR DESIGN */
        /* ============================================ */
        .luxury-scrollbar::-webkit-scrollbar {
          width: 12px;
          background: transparent;
        }

        .luxury-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(
            180deg,
            rgba(30, 27, 75, 0.3) 0%,
            rgba(88, 28, 135, 0.2) 50%,
            rgba(30, 27, 75, 0.3) 100%
          );
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
          margin: 4px 0;
        }

        .luxury-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            #a855f7 0%,
            #8b5cf6 25%,
            #7c3aed 50%,
            #8b5cf6 75%,
            #a855f7 100%
          );
          border-radius: 10px;
          border: 2px solid rgba(168, 85, 247, 0.3);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6),
            0 0 40px rgba(168, 85, 247, 0.3),
            inset 0 0 10px rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .luxury-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            #c084fc 0%,
            #a855f7 25%,
            #9333ea 50%,
            #a855f7 75%,
            #c084fc 100%
          );
          border-color: rgba(192, 132, 252, 0.5);
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.9),
            0 0 60px rgba(168, 85, 247, 0.5),
            inset 0 0 15px rgba(255, 255, 255, 0.3);
          transform: scaleX(1.2);
        }

        .luxury-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(
            180deg,
            #e9d5ff 0%,
            #c084fc 25%,
            #a855f7 50%,
            #c084fc 75%,
            #e9d5ff 100%
          );
          box-shadow: 0 0 40px rgba(168, 85, 247, 1),
            0 0 80px rgba(168, 85, 247, 0.6),
            inset 0 0 20px rgba(255, 255, 255, 0.4);
        }

        /* Scrollbar corner */
        .luxury-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Firefox scrollbar */
        .luxury-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 rgba(30, 27, 75, 0.3);
        }
      `}</style>

      {/* 🔥 OPEN ACCESS: No paywall gates until launch! All features free! */}
      {false && showPaywallGate && !isPremiumUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 p-8 sm:p-12 rounded-3xl border border-purple-500/30 max-w-md w-full shadow-2xl shadow-purple-500/20">
            <Star className="w-16 h-16 text-amber-400 mx-auto mb-6 animate-pulse" />

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">
              Transform Reading Into Ritual
            </h3>

            <p className="text-purple-200/80 mb-2 text-center text-sm sm:text-base">
              You've experienced Dynasty Listen Mode for 3 minutes.
            </p>

            <p className="text-purple-300/90 mb-6 text-center font-medium">
              Unlock synced highlighting & full-length audio.
              <br />
              <span className="text-amber-400">
                {Math.floor((duration - 180) / 60)} more minutes await.
              </span>
            </p>

            <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 border border-purple-500/20">
              <div className="flex items-start gap-3 mb-3">
                <Zap className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">
                    Premium Features
                  </h4>
                  <ul className="text-purple-200/70 text-xs space-y-1">
                    <li>• Full-length audio (no limits)</li>
                    <li>• Sentence-by-sentence highlighting</li>
                    <li>• Click-to-seek any sentence</li>
                    <li>• Download for offline listening</li>
                    <li>• 5 luxury AI voices</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                trackEvent("upgrade_click_from_gate", {
                  location: "listen_gate",
                  bookId: bookSlug,
                  chapterId: chapterNumber,
                  timeListened: currentTime,
                });
                // TODO: Navigate to pricing page or checkout
                window.location.href = "/checkout";
              }}
              className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:via-orange-500 hover:to-amber-500 active:from-amber-700 active:via-orange-700 active:to-amber-700 text-white font-bold py-4 px-8 min-h-[56px] rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-102 touch-manipulation mb-3"
              aria-label="Upgrade to premium"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" />
                Unlock Dynasty Listen Mode
              </span>
            </button>

            <button
              onClick={() => {
                setShowPaywallGate(false);
                trackEvent("gate_dismissed", {
                  bookId: bookSlug,
                  chapterId: chapterNumber,
                });
              }}
              className="w-full text-purple-300/70 hover:text-purple-200 transition-colors text-sm py-2 min-h-[44px] touch-manipulation"
              aria-label="Dismiss modal"
            >
              Not Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
