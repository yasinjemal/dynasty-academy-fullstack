/**
 * 🎨 AI Course Generator Client Component
 *
 * Beautiful, interactive UI for generating courses from books
 * Features:
 * - Book selection with preview
 * - Generation configuration
 * - Real-time progress
 * - Course preview & editing
 * - Approval workflow
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Book,
  Zap,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Rocket,
  TrendingUp,
  BarChart3,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  category: string;
  totalPages: number | null;
  coverImage: string | null;
  description: string;
  createdAt: Date;
}

interface Generation {
  id: string;
  source_title: string;
  course_title: string;
  status: string;
  confidence_score: number;
  tokens_used: number;
  cost_usd: number;
  generation_time_ms: number;
  created_at: Date;
}

interface Stats {
  total_generated: number;
  draft_count: number;
  approved_count: number;
  published_count: number;
  total_cost: number;
  total_tokens: number;
}

export default function CourseGeneratorClient({
  books,
  recentGenerations,
  stats,
}: {
  books: Book[];
  recentGenerations: Generation[];
  stats: Stats;
}) {
  const [activeTab, setActiveTab] = useState<
    "generate" | "history" | "analytics"
  >("generate");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [mode, setMode] = useState<"fast" | "balanced" | "comprehensive">(
    "balanced"
  );
  const [targetAudience, setTargetAudience] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [useRAG, setUseRAG] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [generatedCourse, setGeneratedCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  // Generate course
  const handleGenerate = async () => {
    if (!selectedBook) {
      setError("Please select a book first");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCourse(null);

    try {
      setCurrentStep("🔍 Analyzing book content...");

      const response = await fetch("/api/admin/ai/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBook.id,
          mode,
          targetAudience,
          useRAG,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Generation failed"
        );
      }

      setCurrentStep("✨ Creating course structure...");
      const data = await response.json();

      setCurrentStep("✅ Complete!");
      setGeneratedCourse(data.data);

      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Generation error:", error);
      setError(error.message || "Failed to generate course");
    } finally {
      setIsGenerating(false);
      setCurrentStep("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                AI Course Generator
              </h1>
              <p className="text-slate-400 mt-1">
                Transform books into complete courses with AI magic ✨
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl px-4 py-2">
                <div className="text-xs text-slate-400">Generated</div>
                <div className="text-2xl font-bold text-purple-400">
                  {stats.total_generated}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl px-4 py-2">
                <div className="text-xs text-slate-400">Total Cost</div>
                <div className="text-2xl font-bold text-green-400">
                  ${Number(stats.total_cost || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: "generate", label: "Generate", icon: Sparkles },
              { id: "history", label: "History", icon: Clock },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* GENERATE TAB */}
        {activeTab === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Configuration */}
            <div className="space-y-6">
              {/* Book Selection */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Book className="w-5 h-5 text-purple-400" />
                  Select Book
                </h2>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        selectedBook?.id === book.id
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex gap-3">
                        {book.coverImage && (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-16 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-white">
                            {book.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span>{book.category}</span>
                            {book.totalPages && (
                              <span>• {book.totalPages} pages</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              {selectedBook && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Configuration
                  </h2>

                  <div className="space-y-4">
                    {/* Mode */}
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">
                        Generation Mode
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "fast", label: "Fast", time: "~2 min" },
                          {
                            value: "balanced",
                            label: "Balanced",
                            time: "~5 min",
                          },
                          {
                            value: "comprehensive",
                            label: "Deep",
                            time: "~10 min",
                          },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setMode(option.value as any)}
                            className={`p-3 rounded-lg text-sm font-medium transition-all ${
                              mode === option.value
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "bg-white/5 text-slate-400 hover:bg-white/10"
                            }`}
                          >
                            <div>{option.label}</div>
                            <div className="text-xs opacity-70">
                              {option.time}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">
                        Target Audience
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["beginner", "intermediate", "advanced"].map(
                          (level) => (
                            <button
                              key={level}
                              onClick={() => setTargetAudience(level as any)}
                              className={`p-3 rounded-lg text-sm font-medium transition-all capitalize ${
                                targetAudience === level
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                  : "bg-white/5 text-slate-400 hover:bg-white/10"
                              }`}
                            >
                              {level}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* RAG Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-white">
                          Use RAG System
                        </div>
                        <div className="text-xs text-slate-400">
                          Better context, more accurate
                        </div>
                      </div>
                      <button
                        onClick={() => setUseRAG(!useRAG)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          useRAG ? "bg-green-500" : "bg-slate-600"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            useRAG ? "translate-x-6" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full mt-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Course with AI
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Preview / Status */}
            <div className="space-y-6">
              {/* Selected Book Preview */}
              {selectedBook && !isGenerating && !generatedCourse && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Book Preview
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-slate-400">Title</div>
                      <div className="text-white font-medium">
                        {selectedBook.title}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Category</div>
                      <div className="text-white">{selectedBook.category}</div>
                    </div>
                    {selectedBook.totalPages && (
                      <div>
                        <div className="text-sm text-slate-400">Pages</div>
                        <div className="text-white">
                          {selectedBook.totalPages}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-slate-400">Description</div>
                      <div className="text-white text-sm line-clamp-3">
                        {selectedBook.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generation Progress */}
              {isGenerating && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-center flex-col gap-4">
                    <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
                    <div className="text-center">
                      <div className="text-lg font-medium text-white mb-2">
                        Generating Course...
                      </div>
                      <div className="text-sm text-slate-400">
                        {currentStep}
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full animate-pulse"
                        style={{ width: "70%" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Course Preview */}
              {generatedCourse && (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h2 className="text-xl font-bold text-white">
                      Course Generated!
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-slate-400">Course Title</div>
                      <div className="text-white font-medium">
                        {generatedCourse.course.title}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-slate-400">Modules</div>
                        <div className="text-white font-bold">
                          {generatedCourse.course.modules?.length || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Lessons</div>
                        <div className="text-white font-bold">
                          {generatedCourse.course.totalLessons}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Cost</div>
                        <div className="text-green-400 font-bold">
                          ${Number(generatedCourse.metadata.cost).toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Confidence</div>
                        <div className="text-purple-400 font-bold">
                          {generatedCourse.course.confidence?.score}%
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        (window.location.href = `/admin/course-generator?view=${generatedCourse.id}`)
                      }
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      View Full Course
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold">Error</h3>
                  </div>
                  <p className="text-sm text-slate-300">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Recent Generations
            </h2>

            <div className="space-y-3">
              {recentGenerations.map((gen) => (
                <div
                  key={gen.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {gen.course_title || gen.source_title}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        from "{gen.source_title}" •{" "}
                        {new Date(gen.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Cost</div>
                        <div className="text-green-400 font-medium">
                          ${Number(gen.cost_usd).toFixed(4)}
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          gen.status === "published"
                            ? "bg-green-500/20 text-green-400"
                            : gen.status === "approved"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {gen.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Generated"
              value={stats.total_generated}
              icon={<Sparkles className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="Draft"
              value={stats.draft_count}
              icon={<Edit className="w-6 h-6" />}
              color="yellow"
            />
            <StatCard
              title="Approved"
              value={stats.approved_count}
              icon={<CheckCircle className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Published"
              value={stats.published_count}
              icon={<Rocket className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Total Cost"
              value={`$${Number(stats.total_cost).toFixed(2)}`}
              icon={<DollarSign className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Avg Cost"
              value={`$${(
                Number(stats.total_cost) / (stats.total_generated || 1)
              ).toFixed(3)}`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="purple"
            />
          </div>
        )}
      </div>
    </div>
  );
}

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
    purple:
      "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400",
    green:
      "from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-400",
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400",
    yellow:
      "from-yellow-500/10 to-orange-500/10 border-yellow-500/20 text-yellow-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl border rounded-2xl p-6`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
