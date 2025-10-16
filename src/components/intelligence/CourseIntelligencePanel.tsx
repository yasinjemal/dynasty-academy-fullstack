"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sun,
  Moon,
  Lightbulb,
  Wind,
} from "lucide-react";

// UI-specific prediction type (matches API response)
interface UIPrediction {
  recommendedSessionMinutes: number;
  estimatedCompletionDate: string;
  difficultyLevel: string;
  confidenceScore: number;
  circadianState: {
    currentState: string;
    recommendation: string;
    energyLevel: number;
  };
  cognitiveLoad: {
    currentLoad: string;
    capacity: number;
  };
  momentum: {
    currentStreak: number;
    trend: "increasing" | "stable" | "declining";
    completionProbability: number;
  };
  optimalAtmosphere: {
    matchScore: number;
    recommended: string;
    reason: string;
  };
  nextLesson?: {
    title: string;
    estimatedMinutes: number;
    difficulty: string;
    readinessScore: number;
  };
  adaptiveSuggestions: string[];
}

interface CourseIntelligencePanelProps {
  courseId: string;
  currentLessonId?: string;
  lessonProgress?: number;
  totalLessons?: number;
  completedLessons?: number;
  averageSessionMinutes?: number;
  preferredLearningStyle?: "visual" | "auditory" | "kinesthetic" | "reading";
}

/**
 * 🎓 COURSE INTELLIGENCE PANEL
 *
 * This component proves the REUSABLE Intelligence OS:
 * - Same design patterns as BookIntelligencePanel
 * - Displays course-specific predictions
 * - Uses all 5 base algorithms (inherited)
 * - Built in ~1 hour (vs weeks for isolated UI)
 *
 * This is the user-facing proof that we own the field.
 */
export function CourseIntelligencePanel({
  courseId,
  currentLessonId,
  lessonProgress = 0,
  totalLessons = 1,
  completedLessons = 0,
  averageSessionMinutes = 30,
  preferredLearningStyle = "visual",
}: CourseIntelligencePanelProps) {
  const [prediction, setPrediction] = useState<UIPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch intelligence prediction
  useEffect(() => {
    async function fetchPrediction() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/courses/${courseId}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentLessonId,
            lessonProgress,
            totalLessons,
            completedLessons,
            averageSessionMinutes,
            preferredLearningStyle,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch course prediction");
        }

        const data = await response.json();
        setPrediction(data.prediction);
      } catch (err) {
        console.error("Course Intelligence Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrediction();
  }, [
    courseId,
    currentLessonId,
    lessonProgress,
    totalLessons,
    completedLessons,
    averageSessionMinutes,
    preferredLearningStyle,
  ]);

  // Track course activity helper
  const trackActivity = async (action: string, metadata?: any) => {
    try {
      await fetch(`/api/courses/${courseId}/predict`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          lessonId: currentLessonId,
          progress: lessonProgress,
          ...metadata,
        }),
      });
    } catch (err) {
      console.error("Failed to track activity:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-purple-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-purple-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="w-full p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Unable to load course intelligence</p>
        </div>
      </div>
    );
  }

  // Helper to get circadian icon
  const getCircadianIcon = () => {
    const currentState = prediction?.circadianState?.currentState || "good";
    switch (currentState) {
      case "peak":
        return <Sun className="w-5 h-5 text-amber-500" />;
      case "good":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "declining":
        return <Moon className="w-5 h-5 text-blue-400" />;
      case "low":
        return <Moon className="w-5 h-5 text-indigo-500" />;
      default:
        return <Sun className="w-5 h-5 text-gray-400" />;
    }
  };

  // Helper to get difficulty color
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-green-600 bg-green-50 border-green-200";
      case "intermediate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "advanced":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "expert":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full space-y-4"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Course Intelligence</h3>
              <p className="text-purple-100 text-sm">
                Powered by Dynasty OS •{" "}
                {Math.round(prediction.confidenceScore * 100)}% confidence
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Recommended Session</span>
              </div>
              <p className="text-2xl font-bold">
                {prediction.recommendedSessionMinutes} min
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Completion Target</span>
              </div>
              <p className="text-sm font-bold">
                {prediction.estimatedCompletionDate
                  ? new Date(
                      prediction.estimatedCompletionDate
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Circadian Rhythm */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getCircadianIcon()}
                <h4 className="font-semibold text-gray-800">Focus Energy</h4>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                {prediction.circadianState.currentState}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {prediction.circadianState.recommendation}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-amber-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${prediction.circadianState.energyLevel * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {Math.round(prediction.circadianState.energyLevel * 100)}%
              </span>
            </div>
          </motion.div>

          {/* Cognitive Load */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800">
                  Difficulty Level
                </h4>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full border ${getDifficultyColor(
                  prediction.difficultyLevel
                )}`}
              >
                {prediction.difficultyLevel}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Current load: {prediction.cognitiveLoad.currentLoad}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Capacity</span>
                <span>
                  {Math.round(prediction.cognitiveLoad.capacity * 100)}%
                </span>
              </div>
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${prediction.cognitiveLoad.capacity * 100}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Momentum */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-800">
                  Learning Momentum
                </h4>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {prediction.momentum.currentStreak} day streak
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {prediction.momentum.trend === "increasing" &&
                "📈 Building momentum"}
              {prediction.momentum.trend === "stable" && "➡️ Steady progress"}
              {prediction.momentum.trend === "declining" && "📉 Needs boost"}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-green-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      prediction.momentum.completionProbability * 100
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {Math.round(prediction.momentum.completionProbability * 100)}%
                likely to complete
              </span>
            </div>
          </motion.div>

          {/* Optimal Atmosphere */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-800">
                  Study Atmosphere
                </h4>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {Math.round(prediction.optimalAtmosphere.matchScore * 100)}%
                match
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Recommended:{" "}
              <span className="font-medium">
                {prediction.optimalAtmosphere.recommended}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {prediction.optimalAtmosphere.reason}
            </p>
          </motion.div>
        </div>

        {/* Next Lesson Recommendation */}
        {prediction.nextLesson && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ArrowRight className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">Up Next</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {prediction.nextLesson.title}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    ⏱️ {prediction.nextLesson.estimatedMinutes} minutes
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full ${getDifficultyColor(
                      prediction.nextLesson.difficulty
                    )}`}
                  >
                    {prediction.nextLesson.difficulty}
                  </span>
                  <span>🎯 {prediction.nextLesson.readinessScore}% ready</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Adaptive Suggestions */}
        {prediction.adaptiveSuggestions &&
          prediction.adaptiveSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-xl border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h4 className="font-semibold text-gray-800">
                  Smart Suggestions
                </h4>
              </div>
              <div className="space-y-2">
                {prediction.adaptiveSuggestions
                  .slice(0, 3)
                  .map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p>{suggestion}</p>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          Powered by Dynasty Intelligence OS • All predictions update in
          real-time
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
