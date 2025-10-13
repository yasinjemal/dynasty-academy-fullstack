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
import { useAchievementToasts, triggerAchievement } from "@/hooks/useAchievementToasts";
import { useMobileGestures } from "@/hooks/useMobileGestures";

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

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasShownGateRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Storage keys
  const storageKey = `listen_${bookSlug}_${chapterNumber}_${selectedVoice}`;

  // 🎯 PHASE 2 HOOKS: Cloud Sync + Achievements + Mobile Gestures
  const { saveProgress, loadProgress } = useCloudSync({ enabled: isPremiumUser });
  const { showAchievementToast } = useAchievementToasts();

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
      document.body.style.fontSize = 
        `${Math.max(12, parseInt(getComputedStyle(document.body).fontSize) - 1)}px`;
    },
    onPinchOut: () => {
      // Increase font size
      document.body.style.fontSize = 
        `${Math.min(24, parseInt(getComputedStyle(document.body).fontSize) + 1)}px`;
    },
    onShake: () => {
      // Random chapter (placeholder)
      console.log('🎲 Shake detected! Random chapter feature');
    },
    onLongPress: (x, y) => {
      // Show context menu
      console.log('📱 Long press detected at', x, y);
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
    { value: 0.75, label: "Meditative", icon: "🧘" },
    { value: 1.0, label: "Natural", icon: "✨" },
    { value: 1.25, label: "Focused", icon: "🎯" },
    { value: 1.5, label: "Power", icon: "⚡" },
    { value: 2.0, label: "Lightning", icon: "🚀" },
  ];

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

      if (followText && sentenceRefs.current[activeIndex]) {
        sentenceRefs.current[activeIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [currentTime, isPlaying, sentences, activeSentenceIndex, followText]);

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
  useEffect(() => {
    if (!audioRef.current || !audioUrl || typeof window === "undefined") return;

    try {
      // Create audio context only once
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // 32 frequency bands
        analyserRef.current.smoothingTimeConstant = 0.8; // Smooth animation

        const source = audioContextRef.current.createMediaElementSource(
          audioRef.current
        );
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);

        console.log("[Visualizer] Web Audio API initialized");
      }

      // Animate visualizer
      const updateVisualizer = () => {
        if (analyserRef.current && isPlaying) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioFrequencies(dataArray);
        }
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      if (isPlaying) {
        updateVisualizer();
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } catch (err) {
      console.warn("[Visualizer] Web Audio API not supported:", err);
    }
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
          console.log('✅ Progress restored from cloud:', savedProgress);
        }
      } catch (error) {
        console.error('[Cloud Sync] Failed to load progress:', error);
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
        console.error('[Cloud Sync] Auto-save failed:', error);
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
        fetch('/api/listening/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: bookSlug,
            chapterNumber,
            startTime: sessionStartTime.toISOString(),
            endTime: new Date().toISOString(),
            duration: sessionDuration,
            speed: playbackRate,
            voiceId: selectedVoice,
            completionRate: Math.round((currentTime / duration) * 100),
            deviceType: /mobile/i.test(navigator.userAgent) ? 'mobile' : 
                       /tablet/i.test(navigator.userAgent) ? 'tablet' : 'desktop',
          }),
        }).catch((error) => console.error('[Analytics] Track failed:', error));
      }

      setSessionStartTime(null);
    }
  }, [isPlaying, sessionStartTime, bookSlug, chapterNumber, playbackRate, selectedVoice, currentTime, duration]);

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
        throw new Error("Failed to generate audio");
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
      console.log("Audio URL set successfully, cached:", data.cached);
    } catch (err) {
      setError("Failed to generate audio. Please try again.");
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
      } else {
        await audioRef.current.play();
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
    if (!audioUrl || !isPremiumUser) return;

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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated background particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
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
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Streak Updated!</p>
                  <p className="text-lg font-bold text-white">{currentStreak} Days</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* 📱 PHASE 2: Mobile Gesture Hints (first 5 seconds) */}
        {isPremiumUser && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl px-6 py-3 text-center shadow-2xl animate-in fade-in duration-1000">
              <p className="text-xs text-gray-400 mb-1">Mobile Gestures Active</p>
              <div className="flex items-center gap-4 text-xs text-gray-300">
                <span>↔️ Swipe: Skip 15s</span>
                <span>👆👆 Double-tap: Sentence</span>
                <span>🤏 Pinch: Font size</span>
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
                <span className="text-orange-400 font-bold text-sm">{currentStreak} Day Streak</span>
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

              <button
                onClick={generateAudio}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:via-violet-500 hover:to-purple-500 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed group"
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
              {isPremiumUser && (
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
            </div>
          )}
        </div>

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
            {/* Premium Blur Overlay for Non-Premium Users */}
            {!isPremiumUser && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm rounded-3xl z-10 flex items-center justify-center">
                <div className="text-center p-8">
                  <Star className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Premium Feature
                  </h3>
                  <p className="text-purple-300 mb-4">
                    Unlock sentence-by-sentence highlighting & auto-scroll
                  </p>
                  <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105">
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            )}

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

      {/* 3-Minute Paywall Gate Modal */}
      {showPaywallGate && !isPremiumUser && (
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
