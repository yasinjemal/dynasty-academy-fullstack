// 🧠 Client Hook: Contextual Intelligence
"use client";

import { useState, useEffect, useRef } from "react";

interface BehaviorMetrics {
  pauseCount: number;
  pauseDuration: number;
  rereadCount: number;
  scrollbackCount: number;
  playbackSpeedChanges: number;
  atmosphereChanges: number;
  bookmarksCreated: number;
  sessionStartTime: number;
}

interface ReadingPrediction {
  recommendedSpeed: number;
  recommendedAtmosphere: string;
  suggestedBreakInterval: number;
  predictedEngagement: "low" | "medium" | "high";
  completionProbability: number;
  suggestions: string[];
}

export function useContextualIntelligence(
  bookId: string,
  chapterId: number,
  enabled: boolean = true
) {
  const [metrics, setMetrics] = useState<BehaviorMetrics>({
    pauseCount: 0,
    pauseDuration: 0,
    rereadCount: 0,
    scrollbackCount: 0,
    playbackSpeedChanges: 0,
    atmosphereChanges: 0,
    bookmarksCreated: 0,
    sessionStartTime: Date.now(),
  });

  const [predictions, setPredictions] = useState<ReadingPrediction | null>(
    null
  );
  const [isTracking, setIsTracking] = useState(false);

  const pauseStartRef = useRef<number | null>(null);
  const lastPositionRef = useRef<number>(0);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch predictions on mount
  useEffect(() => {
    if (!enabled) return;

    async function fetchPredictions() {
      try {
        const res = await fetch(
          `/api/intelligence/predict?bookId=${bookId}&chapterId=${chapterId}`
        );
        if (res.ok) {
          const data = await res.json();
          setPredictions(data.predictions);
          console.log(
            "🔮 [Intelligence] Predictions loaded:",
            data.predictions
          );
        }
      } catch (error) {
        console.error("❌ [Intelligence] Failed to fetch predictions:", error);
      }
    }

    fetchPredictions();
  }, [bookId, chapterId, enabled]);

  // Track behavior periodically
  useEffect(() => {
    if (!enabled || !isTracking) return;

    // Track every 30 seconds
    trackingIntervalRef.current = setInterval(() => {
      trackBehavior(false);
    }, 30000);

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [enabled, isTracking, metrics]);

  // Track pause events
  const onPause = () => {
    pauseStartRef.current = Date.now();
    setMetrics((prev) => ({
      ...prev,
      pauseCount: prev.pauseCount + 1,
    }));
  };

  const onResume = () => {
    if (pauseStartRef.current) {
      const pauseDuration = (Date.now() - pauseStartRef.current) / 1000;
      setMetrics((prev) => ({
        ...prev,
        pauseDuration: prev.pauseDuration + pauseDuration,
      }));
      pauseStartRef.current = null;
    }
  };

  // Track position changes (for re-reading detection)
  const onPositionChange = (currentPosition: number) => {
    if (currentPosition < lastPositionRef.current - 10) {
      // User scrolled back significantly
      setMetrics((prev) => ({
        ...prev,
        scrollbackCount: prev.scrollbackCount + 1,
      }));
    }
    lastPositionRef.current = currentPosition;
  };

  // Track speed changes
  const onSpeedChange = () => {
    setMetrics((prev) => ({
      ...prev,
      playbackSpeedChanges: prev.playbackSpeedChanges + 1,
    }));
  };

  // Track atmosphere changes
  const onAtmosphereChange = () => {
    setMetrics((prev) => ({
      ...prev,
      atmosphereChanges: prev.atmosphereChanges + 1,
    }));
  };

  // Track bookmark creation
  const onBookmarkCreated = () => {
    setMetrics((prev) => ({
      ...prev,
      bookmarksCreated: prev.bookmarksCreated + 1,
    }));
  };

  // Calculate reading speed (WPM)
  const calculateReadingSpeed = (
    wordsRead: number,
    sessionDuration: number
  ): number => {
    if (sessionDuration === 0) return 150; // Default
    const minutes = sessionDuration / 60;
    return Math.round(wordsRead / minutes);
  };

  // Send tracking data to API
  const trackBehavior = async (completed: boolean = false) => {
    const sessionDuration = (Date.now() - metrics.sessionStartTime) / 1000;

    try {
      await fetch("/api/intelligence/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          chapterId,
          readingSpeed: calculateReadingSpeed(1000, sessionDuration), // You can calculate actual words
          pauseCount: metrics.pauseCount,
          pauseDuration: Math.round(metrics.pauseDuration),
          rereadCount: metrics.rereadCount,
          scrollbackCount: metrics.scrollbackCount,
          playbackSpeedChanges: metrics.playbackSpeedChanges,
          atmosphereChanges: metrics.atmosphereChanges,
          bookmarksCreated: metrics.bookmarksCreated,
          sessionDuration: Math.round(sessionDuration),
          completed,
          completionPercentage: completed ? 100 : 50, // You can calculate actual %
        }),
      });

      console.log("✅ [Intelligence] Behavior tracked");
    } catch (error) {
      console.error("❌ [Intelligence] Failed to track:", error);
    }
  };

  // Start tracking session
  const startTracking = () => {
    setIsTracking(true);
    setMetrics((prev) => ({
      ...prev,
      sessionStartTime: Date.now(),
    }));
  };

  // End tracking session
  const endTracking = async (completed: boolean = false) => {
    setIsTracking(false);
    await trackBehavior(completed);
  };

  return {
    // Metrics
    metrics,

    // Predictions
    predictions,

    // Controls
    startTracking,
    endTracking,

    // Event handlers
    onPause,
    onResume,
    onPositionChange,
    onSpeedChange,
    onAtmosphereChange,
    onBookmarkCreated,
  };
}
