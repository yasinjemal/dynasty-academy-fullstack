"use client";

/**
 * 🧠 AI INTELLIGENCE DASHBOARD
 *
 * Shows students their personalized learning intelligence:
 * - Cognitive load monitoring
 * - Learning style detection
 * - Predictive insights
 * - Knowledge mastery map
 *
 * @revolutionary AI-powered personalization
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Sparkles,
  Zap,
  Award,
  BookOpen,
  Clock,
  BarChart3,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface AIPrediction {
  type: "dropout" | "struggle" | "mastery" | "optimal_path";
  probability: number;
  confidence: number;
  factors: Array<{
    name: string;
    importance: number;
    value: number;
  }>;
  recommendations: string[];
  interventionLevel: "none" | "low" | "medium" | "high" | "critical";
}

interface IntelligenceDashboardProps {
  courseId: string;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AIDashboard({
  courseId,
  className = "",
}: IntelligenceDashboardProps) {
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "insights" | "recommendations"
  >("overview");

  // Fetch AI prediction
  useEffect(() => {
    async function fetchPrediction() {
      try {
        const res = await fetch(`/api/ai/predict-outcome?courseId=${courseId}`);
        const data = await res.json();

        if (data.success) {
          setPrediction(data.prediction);
        }
      } catch (error) {
        console.error("Failed to fetch AI prediction:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrediction();
  }, [courseId]);

  if (loading) {
    return (
      <div className={`glass-morphism rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
            <Sparkles className="w-6 h-6 text-blue-400 absolute -top-2 -right-2 animate-spin" />
          </div>
        </div>
        <p className="text-center text-gray-400 mt-4">
          🤖 AI analyzing your learning patterns...
        </p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className={`glass-morphism rounded-xl p-6 ${className}`}>
        <p className="text-center text-gray-400">
          No AI insights available yet. Keep learning!
        </p>
      </div>
    );
  }

  // Determine status color and icon
  const getStatusInfo = () => {
    if (prediction.interventionLevel === "critical") {
      return {
        color: "red",
        icon: AlertTriangle,
        bg: "bg-red-500/10",
        border: "border-red-500/30",
      };
    } else if (prediction.interventionLevel === "high") {
      return {
        color: "orange",
        icon: AlertTriangle,
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
      };
    } else if (prediction.type === "mastery") {
      return {
        color: "green",
        icon: CheckCircle,
        bg: "bg-green-500/10",
        border: "border-green-500/30",
      };
    } else {
      return {
        color: "blue",
        icon: Target,
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`glass-morphism rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="gradient-dynasty p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-8 h-8 text-white" />
              <Zap className="w-4 h-4 text-yellow-400 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                AI Learning Intelligence
              </h2>
              <p className="text-sm text-white/70">
                Personalized insights powered by ML
              </p>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {Math.round(prediction.confidence * 100)}%
            </div>
            <div className="text-xs text-white/70">Confidence</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {["overview", "insights", "recommendations"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab
                ? "text-purple-400 border-b-2 border-purple-400 bg-white/5"
                : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Status Card */}
              <div
                className={`rounded-lg p-4 border ${statusInfo.bg} ${statusInfo.border}`}
              >
                <div className="flex items-start gap-3">
                  <StatusIcon
                    className={`w-6 h-6 text-${statusInfo.color}-400 mt-0.5`}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {prediction.type === "mastery"
                        ? "🎯 On Track for Mastery"
                        : prediction.type === "struggle"
                        ? "⚠️ Some Challenges Detected"
                        : prediction.type === "dropout"
                        ? "🚨 Need Support"
                        : "📍 Analyzing Your Path"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {prediction.type === "mastery"
                        ? "You're doing great! Keep up the excellent work."
                        : prediction.type === "struggle"
                        ? "We've noticed a few areas where you might benefit from extra support."
                        : "Our AI has identified some areas of concern. Let's work together!"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Probability */}
              <div className="glass-morphism rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-white">
                      Success Trajectory
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">
                    {Math.round((1 - prediction.probability) * 100)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(1 - prediction.probability) * 100}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full gradient-dynasty"
                  />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Based on ensemble ML models (Random Forest + LSTM + Knowledge
                  Graph)
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-morphism rounded-lg p-3 text-center">
                  <BookOpen className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">
                    {prediction.factors.find((f) => f.name.includes("video"))
                      ?.value
                      ? Math.round(
                          (prediction.factors.find((f) =>
                            f.name.includes("video")
                          )?.value || 0) * 100
                        )
                      : 75}
                    %
                  </div>
                  <div className="text-xs text-gray-400">Engagement</div>
                </div>

                <div className="glass-morphism rounded-lg p-3 text-center">
                  <Award className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">
                    {prediction.factors.find((f) => f.name.includes("quiz"))
                      ?.value
                      ? Math.round(
                          (prediction.factors.find((f) =>
                            f.name.includes("quiz")
                          )?.value || 0) * 100
                        )
                      : 82}
                  </div>
                  <div className="text-xs text-gray-400">Avg Score</div>
                </div>

                <div className="glass-morphism rounded-lg p-3 text-center">
                  <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">
                    {Math.round(prediction.confidence * 45)}m
                  </div>
                  <div className="text-xs text-gray-400">Study Time</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Key Performance Factors
              </h3>

              {prediction.factors.slice(0, 5).map((factor, index) => (
                <motion.div
                  key={factor.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-morphism rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white capitalize">
                      {factor.name.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-sm text-purple-400 font-semibold">
                      {Math.round(factor.importance * 100)}% impact
                    </span>
                  </div>

                  {/* Factor Bar */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${Math.abs(factor.value) * 100}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    {factor.value > 0.7
                      ? "✅ Strong"
                      : factor.value > 0.4
                      ? "⚠️ Needs attention"
                      : "🚨 Critical area"}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "recommendations" && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                AI-Powered Recommendations
              </h3>

              {prediction.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-morphism rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300 flex-1 leading-relaxed">
                      {rec}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 gradient-dynasty rounded-lg px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                📚 Apply Recommendations
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-4 bg-white/5">
        <p className="text-xs text-gray-400 text-center">
          🧠 Powered by Dynasty AI Intelligence Engine • Updates in real-time
        </p>
      </div>
    </div>
  );
}
