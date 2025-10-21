/**
 * Lesson Generator Client Component
 * Beautiful UI for generating lesson content from courses
 */

"use client";

import { useState } from "react";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  DollarSign,
  Zap,
  FileText,
  Target,
  TrendingUp,
  AlertCircle,
  Eye,
  Download,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

interface GeneratedCourse {
  id: string;
  sourceId: string;
  sourceTitle: string | null;
  generatedData: any;
  status: string;
  confidenceScore: number | null;
  publishedTo: string | null;
  createdAt: Date;
}

interface GeneratedLesson {
  id: string;
  sourceTitle: string | null;
  generatedData: any;
  status: string;
  confidenceScore: number | null;
  costUsd: number | null;
  metadata: any;
  createdAt: Date;
}

interface Stats {
  totalGenerated: number;
  totalCost: number;
  totalTokens: number;
  avgConfidence: number;
}

interface LessonGeneratorClientProps {
  generatedCourses: GeneratedCourse[];
  generatedLessons: GeneratedLesson[];
  stats: Stats;
}

type ContentStyle = "conversational" | "academic" | "practical";
type Difficulty = "beginner" | "intermediate" | "advanced";

export default function LessonGeneratorClient({
  generatedCourses,
  generatedLessons,
  stats,
}: LessonGeneratorClientProps) {
  const [activeTab, setActiveTab] = useState<
    "generate" | "history" | "analytics"
  >("generate");
  const [selectedCourse, setSelectedCourse] = useState<GeneratedCourse | null>(
    null
  );
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(
    new Set()
  );
  const [contentStyle, setContentStyle] =
    useState<ContentStyle>("conversational");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [wordCount, setWordCount] = useState(800);
  const [useRAG, setUseRAG] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeExercises, setIncludeExercises] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get lessons from selected course
  const courseLessons =
    selectedCourse?.generatedData?.modules?.flatMap((module: any) =>
      module.lessons.map((lesson: any) => ({
        ...lesson,
        moduleTitle: module.title,
      }))
    ) || [];

  // Toggle lesson selection
  const toggleLessonSelection = (lessonId: string) => {
    const newSelection = new Set(selectedLessons);
    if (newSelection.has(lessonId)) {
      newSelection.delete(lessonId);
    } else {
      newSelection.add(lessonId);
    }
    setSelectedLessons(newSelection);
  };

  // Select all lessons
  const selectAllLessons = () => {
    setSelectedLessons(new Set(courseLessons.map((l: any) => l.id || l.title)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedLessons(new Set());
  };

  // Generate lessons
  const generateLessons = async () => {
    if (!selectedCourse || selectedLessons.size === 0) {
      setError("Please select a course and at least one lesson");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);
    setProgress({ current: 0, total: selectedLessons.size });

    try {
      const lessonsToGenerate = courseLessons.filter((l: any) =>
        selectedLessons.has(l.id || l.title)
      );

      const response = await fetch("/api/admin/ai/batch-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          bookId: selectedCourse.sourceId,
          lessons: lessonsToGenerate.map((l: any) => ({
            id: l.id || l.title,
            title: l.title,
            objective:
              l.learningObjective || l.description || "Master this lesson",
            pageReferences: l.pages,
          })),
          config: {
            contentStyle,
            difficulty,
            targetWordCount: wordCount,
            useRAG,
            includeExamples,
            includeExercises,
          },
          saveToDatabase: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate lessons");
      }

      const result = await response.json();
      setGeneratedContent(result.data);
      setProgress({
        current: result.data.results.length,
        total: selectedLessons.size,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate cost estimate
  const estimatedCost = selectedLessons.size * (wordCount / 800) * 0.12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              AI Lesson Content Generator
            </h1>
            <p className="text-purple-200">
              Transform course outlines into rich, engaging lessons
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <StatCard
            title="Lessons Generated"
            value={stats.totalGenerated}
            icon={<FileText className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            title="Total Cost"
            value={`$${stats.totalCost.toFixed(2)}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Avg Confidence"
            value={`${Math.round(stats.avgConfidence)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Tokens Used"
            value={stats.totalTokens.toLocaleString()}
            icon={<Zap className="w-5 h-5" />}
            color="yellow"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <TabButton
          active={activeTab === "generate"}
          onClick={() => setActiveTab("generate")}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Generate
        </TabButton>
        <TabButton
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          icon={<Clock className="w-4 h-4" />}
        >
          History
        </TabButton>
        <TabButton
          active={activeTab === "analytics"}
          onClick={() => setActiveTab("analytics")}
          icon={<TrendingUp className="w-4 h-4" />}
        >
          Analytics
        </TabButton>
      </div>

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Course & Lesson Selection */}
          <div className="space-y-6">
            {/* Select Course */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                1. Select Course
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedLessons(new Set());
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedCourse?.id === course.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/5 text-purple-100 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-medium">
                      {course.generatedData?.title || "Untitled Course"}
                    </div>
                    <div className="text-sm opacity-75 mt-1">
                      {course.generatedData?.modules?.length || 0} modules •{" "}
                      {course.generatedData?.modules?.reduce(
                        (sum: number, m: any) => sum + (m.lessons?.length || 0),
                        0
                      ) || 0}{" "}
                      lessons
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Lessons */}
            {selectedCourse && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    2. Select Lessons ({selectedLessons.size}/
                    {courseLessons.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllLessons}
                      className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {courseLessons.map((lesson: any) => {
                    const lessonId = lesson.id || lesson.title;
                    const isSelected = selectedLessons.has(lessonId);
                    return (
                      <label
                        key={lessonId}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "bg-purple-500/20 border-purple-500 border"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleLessonSelection(lessonId)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {lesson.title}
                          </div>
                          <div className="text-sm text-purple-200 opacity-75">
                            {lesson.moduleTitle}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Configuration & Generation */}
          <div className="space-y-6">
            {/* Configuration */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                3. Configure Content
              </h2>

              {/* Content Style */}
              <div className="mb-4">
                <label className="text-white font-medium mb-2 block">
                  Content Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <StyleButton
                    active={contentStyle === "conversational"}
                    onClick={() => setContentStyle("conversational")}
                  >
                    Conversational
                  </StyleButton>
                  <StyleButton
                    active={contentStyle === "academic"}
                    onClick={() => setContentStyle("academic")}
                  >
                    Academic
                  </StyleButton>
                  <StyleButton
                    active={contentStyle === "practical"}
                    onClick={() => setContentStyle("practical")}
                  >
                    Practical
                  </StyleButton>
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-4">
                <label className="text-white font-medium mb-2 block">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <StyleButton
                    active={difficulty === "beginner"}
                    onClick={() => setDifficulty("beginner")}
                  >
                    Beginner
                  </StyleButton>
                  <StyleButton
                    active={difficulty === "intermediate"}
                    onClick={() => setDifficulty("intermediate")}
                  >
                    Intermediate
                  </StyleButton>
                  <StyleButton
                    active={difficulty === "advanced"}
                    onClick={() => setDifficulty("advanced")}
                  >
                    Advanced
                  </StyleButton>
                </div>
              </div>

              {/* Word Count */}
              <div className="mb-4">
                <label className="text-white font-medium mb-2 block">
                  Target Word Count: {wordCount}
                </label>
                <input
                  type="range"
                  min="500"
                  max="2000"
                  step="100"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-purple-200 mt-1">
                  <span>500 words</span>
                  <span>2000 words</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={useRAG}
                    onChange={(e) => setUseRAG(e.target.checked)}
                    className="rounded"
                  />
                  Use RAG (Better accuracy)
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={includeExamples}
                    onChange={(e) => setIncludeExamples(e.target.checked)}
                    className="rounded"
                  />
                  Include Examples
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={includeExercises}
                    onChange={(e) => setIncludeExercises(e.target.checked)}
                    className="rounded"
                  />
                  Include Exercises
                </label>
              </div>
            </div>

            {/* Cost Estimate */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-200 text-sm">Estimated Cost</div>
                  <div className="text-3xl font-bold text-white">
                    ${estimatedCost.toFixed(2)}
                  </div>
                  <div className="text-green-200 text-sm mt-1">
                    {selectedLessons.size} lesson
                    {selectedLessons.size !== 1 ? "s" : ""} • ~
                    {Math.ceil(selectedLessons.size * 2)} minutes
                  </div>
                </div>
                <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateLessons}
              disabled={isGenerating || selectedLessons.size === 0}
              className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <PauseCircle className="w-5 h-5 animate-pulse" />
                  Generating... ({progress.current}/{progress.total})
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Generate {selectedLessons.size} Lesson
                  {selectedLessons.size !== 1 ? "s" : ""}
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-200 text-sm">{error}</div>
              </div>
            )}

            {/* Success */}
            {generatedContent && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-300 font-semibold mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Generation Complete!
                </div>
                <div className="text-green-200 text-sm space-y-1">
                  <div>
                    ✅ {generatedContent.summary.successCount} lessons generated
                  </div>
                  <div>
                    💰 Total cost: $
                    {generatedContent.summary.totalCost.toFixed(4)}
                  </div>
                  <div>
                    ⏱️ Time:{" "}
                    {(generatedContent.summary.totalTimeMs / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Generated Lessons
          </h2>
          <div className="space-y-2">
            {generatedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {lesson.sourceTitle}
                    </div>
                    <div className="text-sm text-purple-200 mt-1">
                      {lesson.generatedData?.wordCount || 0} words •{" "}
                      {lesson.generatedData?.estimatedReadingTime || 0} min read
                      • ${Number(lesson.costUsd || 0).toFixed(4)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lesson.status === "published"
                          ? "bg-green-500/20 text-green-300"
                          : lesson.status === "approved"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {lesson.status}
                    </span>
                    <button className="p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-2">Total Generated</h3>
            <div className="text-4xl font-bold text-purple-400">
              {stats.totalGenerated}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-2">Total Spent</h3>
            <div className="text-4xl font-bold text-green-400">
              ${stats.totalCost.toFixed(2)}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-2">Avg Quality</h3>
            <div className="text-4xl font-bold text-blue-400">
              {Math.round(stats.avgConfidence)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "purple" | "green" | "blue" | "yellow";
}) {
  const colorClasses: Record<string, string> = {
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    blue: "from-blue-500 to-cyan-500",
    yellow: "from-yellow-500 to-orange-500",
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-purple-200 text-sm">{title}</div>
          <div className="text-2xl font-bold text-white mt-1">{value}</div>
        </div>
        <div
          className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
        active
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
          : "bg-white/5 text-purple-200 hover:bg-white/10"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function StyleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-purple-500 text-white"
          : "bg-white/10 text-purple-200 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}
