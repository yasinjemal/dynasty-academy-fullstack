// 🧠 Intelligence Insights Panel - Shows AI predictions and suggestions
"use client";

import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Lightbulb,
  Flame,
  Sun,
  Moon,
  Award,
} from "lucide-react";

interface ReadingPrediction {
  recommendedSpeed: number;
  recommendedAtmosphere: string;
  suggestedBreakInterval: number;
  predictedEngagement: "low" | "medium" | "high";
  completionProbability: number;
  suggestions: string[];
  // Advanced metrics from new algorithms
  cognitiveLoad?: number; // 0-100, how mentally demanding this content is
  retentionScore?: number; // 0-100, predicted knowledge retention
  focusWindowDetected?: string; // "morning-peak" | "afternoon-dip" | "evening-flow" | "night-owl"
  optimalSessionLength?: number; // minutes
  streakBonus?: number; // percentage boost from momentum
  atmosphereMatch?: number; // 0-100, how well current environment matches needs
}

interface IntelligenceInsightsPanelProps {
  predictions: ReadingPrediction | null;
  isLoading?: boolean;
}

export function IntelligenceInsightsPanel({
  predictions,
  isLoading = false,
}: IntelligenceInsightsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-100">
              Analyzing Your Reading Pattern...
            </h3>
            <p className="text-sm text-purple-300/60">
              AI is learning your preferences
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!predictions) return null;

  // Safety check for disabled intelligence features
  if (!predictions.predictedEngagement || !predictions.suggestions) {
    return null; // Don't render if data is incomplete
  }

  const engagementColor =
    predictions.predictedEngagement === "high"
      ? "text-green-400"
      : predictions.predictedEngagement === "medium"
      ? "text-yellow-400"
      : "text-orange-400";

  const completionColor =
    predictions.completionProbability > 70
      ? "text-green-400"
      : predictions.completionProbability > 40
      ? "text-yellow-400"
      : "text-orange-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-purple-100">
            AI Intelligence Insights
          </h3>
          <p className="text-sm text-purple-300/60">
            Personalized recommendations based on your patterns
          </p>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Engagement Prediction */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300/60 uppercase tracking-wide">
              Engagement
            </span>
          </div>
          <p className={`text-2xl font-bold ${engagementColor}`}>
            {predictions.predictedEngagement.charAt(0).toUpperCase() +
              predictions.predictedEngagement.slice(1)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Right now</p>
        </div>

        {/* Completion Probability */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300/60 uppercase tracking-wide">
              Completion
            </span>
          </div>
          <p className={`text-2xl font-bold ${completionColor}`}>
            {predictions.completionProbability}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Likely to finish</p>
        </div>

        {/* Recommended Speed */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300/60 uppercase tracking-wide">
              Optimal Speed
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {predictions.recommendedSpeed}x
          </p>
          <p className="text-xs text-slate-400 mt-1">For this content</p>
        </div>

        {/* Break Interval */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300/60 uppercase tracking-wide">
              Break Every
            </span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {predictions.suggestedBreakInterval}m
          </p>
          <p className="text-xs text-slate-400 mt-1">For best retention</p>
        </div>
      </div>

      {/* 🔥 ADVANCED METRICS - The algorithms no one sees coming */}
      {(predictions.cognitiveLoad ||
        predictions.retentionScore ||
        predictions.focusWindowDetected ||
        predictions.streakBonus) && (
        <div className="space-y-4 pt-2 border-t border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            <h4 className="text-xs font-semibold text-purple-300/80 uppercase tracking-wider">
              Advanced Intelligence
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cognitive Load (Algorithm #2) */}
            {predictions.cognitiveLoad !== undefined && (
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-blue-300/70">Mental Load</span>
                </div>
                <p className="text-lg font-bold text-blue-300">
                  {predictions.cognitiveLoad}%
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {predictions.cognitiveLoad > 70
                    ? "Deep focus needed"
                    : predictions.cognitiveLoad > 40
                    ? "Moderate effort"
                    : "Easy reading"}
                </p>
              </div>
            )}

            {/* Retention Score (Algorithm #2 + #3) */}
            {predictions.retentionScore !== undefined && (
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-3 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-green-300/70">Retention</span>
                </div>
                <p className="text-lg font-bold text-green-300">
                  {predictions.retentionScore}%
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Knowledge retention
                </p>
              </div>
            )}

            {/* Circadian Window (Algorithm #1) */}
            {predictions.focusWindowDetected && (
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg p-3 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1">
                  {predictions.focusWindowDetected.includes("morning") ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : predictions.focusWindowDetected.includes("night") ? (
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="text-xs text-amber-300/70">
                    Circadian State
                  </span>
                </div>
                <p className="text-sm font-bold text-amber-300 capitalize">
                  {predictions.focusWindowDetected.replace("-", " ")}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Your rhythm</p>
              </div>
            )}

            {/* Streak Bonus (Algorithm #3) */}
            {predictions.streakBonus !== undefined &&
              predictions.streakBonus > 0 && (
                <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-lg p-3 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs text-red-300/70">Momentum</span>
                  </div>
                  <p className="text-lg font-bold text-red-300">
                    +{predictions.streakBonus}%
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Streak bonus</p>
                </div>
              )}

            {/* Optimal Session (Algorithm #1 + #2) */}
            {predictions.optimalSessionLength && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-lg p-3 border border-indigo-500/20 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs text-indigo-300/70">
                    Optimal Session
                  </span>
                </div>
                <p className="text-lg font-bold text-indigo-300">
                  {predictions.optimalSessionLength} minutes
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Based on your circadian rhythm and cognitive capacity
                </p>
              </div>
            )}

            {/* Atmosphere Match (Algorithm #4) */}
            {predictions.atmosphereMatch !== undefined && (
              <div className="bg-gradient-to-br from-cyan-900/30 to-teal-900/30 rounded-lg p-3 border border-cyan-500/20 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-cyan-300/70">
                    Environment Match
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-cyan-300">
                    {predictions.atmosphereMatch}%
                  </p>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${predictions.atmosphereMatch}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {predictions.atmosphereMatch > 80
                    ? "Perfect conditions!"
                    : predictions.atmosphereMatch > 60
                    ? "Good setup"
                    : "Consider adjusting environment"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {predictions.suggestions && predictions.suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-semibold text-purple-200">
              AI Suggestions
            </h4>
          </div>
          <div className="space-y-2">
            {predictions.suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 bg-gradient-to-r from-purple-500/10 to-transparent p-3 rounded-lg border-l-2 border-purple-500/50"
              >
                <span className="text-purple-400 font-bold text-sm">→</span>
                <p className="text-sm text-purple-100/90 leading-relaxed">
                  {suggestion}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Indicator */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-purple-500/10">
        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse" />
        <p className="text-xs text-purple-300/60">
          <span className="font-semibold text-purple-200">
            5 Advanced Algorithms
          </span>{" "}
          learning from your behavior
        </p>
      </div>
    </motion.div>
  );
}
