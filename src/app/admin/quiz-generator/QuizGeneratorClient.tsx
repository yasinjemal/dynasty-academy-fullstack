/**
 * Quiz Generator Client Component
 * Beautiful UI for generating assessment quizzes
 */

"use client";

import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  Clock,
  DollarSign,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  Eye,
  PlayCircle,
  PauseCircle,
  ListChecks,
  FileQuestion,
} from "lucide-react";

interface GeneratedCourse {
  id: string;
  source_id: string;
  source_title: string | null;
  generatedData: any;
  status: string;
  confidence_score: number | null;
  created_at: Date;
}

interface GeneratedLesson {
  id: string;
  source_title: string | null;
  generatedData: any;
  status: string;
  metadata: any;
  created_at: Date;
}

interface GeneratedQuiz {
  id: string;
  source_type: string;
  source_id: string;
  source_title: string | null;
  generatedData: any;
  status: string;
  confidence_score: number | null;
  cost_usd: number | null;
  metadata: any;
  created_at: Date;
}

interface Stats {
  totalGenerated: number;
  totalCost: number;
  totalTokens: number;
  avgConfidence: number;
}

interface QuizGeneratorClientProps {
  generatedCourses: GeneratedCourse[];
  generatedLessons: GeneratedLesson[];
  generatedQuizzes: GeneratedQuiz[];
  stats: Stats;
}

type SourceType = "course" | "lesson";
type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay";
type Difficulty = "easy" | "medium" | "hard";

export default function QuizGeneratorClient({
  generatedCourses,
  generatedLessons,
  generatedQuizzes,
  stats,
}: QuizGeneratorClientProps) {
  const [activeTab, setActiveTab] = useState<
    "generate" | "history" | "analytics"
  >("generate");
  const [sourceType, setSourceType] = useState<SourceType>("course");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [questionTypes, setQuestionTypes] = useState<Set<QuestionType>>(
    new Set(["multiple_choice", "true_false"])
  );
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [useRAG, setUseRAG] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sources = sourceType === "course" ? generatedCourses : generatedLessons;

  // Toggle question type
  const toggleQuestionType = (type: QuestionType) => {
    const newTypes = new Set(questionTypes);
    if (newTypes.has(type)) {
      if (newTypes.size > 1) {
        newTypes.delete(type);
      }
    } else {
      newTypes.add(type);
    }
    setQuestionTypes(newTypes);
  };

  // Calculate cost estimate
  const estimatedCost =
    questionCount *
    0.008 *
    (useRAG ? 1.2 : 1) *
    (includeExplanations ? 1.3 : 1);

  // Generate quiz
  const generateQuiz = async () => {
    if (!selectedSource) {
      setError("Please select a course or lesson");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedQuiz(null);

    try {
      const response = await fetch("/api/admin/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          sourceId: selectedSource,
          config: {
            questionTypes: Array.from(questionTypes),
            questionCount,
            difficulty,
            includeExplanations,
            useRAG,
            passingScore: 70,
          },
          saveToDatabase: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const result = await response.json();
      setGeneratedQuiz(result.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
            <FileQuestion className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Quiz Generator</h1>
            <p className="text-indigo-200">
              Create intelligent assessments with Bloom's Taxonomy
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <StatCard
            title="Quizzes Generated"
            value={stats.totalGenerated}
            icon={<ListChecks className="w-5 h-5" />}
            color="indigo"
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
            title="Avg Questions"
            value={Math.round(stats.totalGenerated > 0 ? questionCount : 0)}
            icon={<Brain className="w-5 h-5" />}
            color="purple"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <TabButton
          active={activeTab === "generate"}
          onClick={() => setActiveTab("generate")}
          icon={<Zap className="w-4 h-4" />}
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
          {/* Left: Source Selection */}
          <div className="space-y-6">
            {/* Source Type */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                1. Select Source
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    setSourceType("course");
                    setSelectedSource(null);
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    sourceType === "course"
                      ? "bg-indigo-500 text-white"
                      : "bg-white/10 text-indigo-200 hover:bg-white/20"
                  }`}
                >
                  📚 Course
                </button>
                <button
                  onClick={() => {
                    setSourceType("lesson");
                    setSelectedSource(null);
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    sourceType === "lesson"
                      ? "bg-indigo-500 text-white"
                      : "bg-white/10 text-indigo-200 hover:bg-white/20"
                  }`}
                >
                  📝 Lesson
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {sources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedSource === source.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        : "bg-white/5 text-indigo-100 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-medium">
                      {source.source_title ||
                        source.generatedData?.title ||
                        "Untitled"}
                    </div>
                    <div className="text-sm opacity-75 mt-1">
                      {sourceType === "course"
                        ? `${
                            source.generatedData?.modules?.length || 0
                          } modules`
                        : `${source.generatedData?.wordCount || 0} words`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Configuration */}
          <div className="space-y-6">
            {/* Question Types */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-400" />
                2. Question Types
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <QuestionTypeButton
                  active={questionTypes.has("multiple_choice")}
                  onClick={() => toggleQuestionType("multiple_choice")}
                >
                  ✓ Multiple Choice
                </QuestionTypeButton>
                <QuestionTypeButton
                  active={questionTypes.has("true_false")}
                  onClick={() => toggleQuestionType("true_false")}
                >
                  ⚖️ True/False
                </QuestionTypeButton>
                <QuestionTypeButton
                  active={questionTypes.has("short_answer")}
                  onClick={() => toggleQuestionType("short_answer")}
                >
                  ✍️ Short Answer
                </QuestionTypeButton>
                <QuestionTypeButton
                  active={questionTypes.has("essay")}
                  onClick={() => toggleQuestionType("essay")}
                >
                  📄 Essay
                </QuestionTypeButton>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                3. Configure
              </h2>

              {/* Question Count */}
              <div className="mb-4">
                <label className="text-white font-medium mb-2 block">
                  Number of Questions: {questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-indigo-200 mt-1">
                  <span>5 questions</span>
                  <span>25 questions</span>
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-4">
                <label className="text-white font-medium mb-2 block">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <DifficultyButton
                    active={difficulty === "easy"}
                    onClick={() => setDifficulty("easy")}
                  >
                    Easy
                  </DifficultyButton>
                  <DifficultyButton
                    active={difficulty === "medium"}
                    onClick={() => setDifficulty("medium")}
                  >
                    Medium
                  </DifficultyButton>
                  <DifficultyButton
                    active={difficulty === "hard"}
                    onClick={() => setDifficulty("hard")}
                  >
                    Hard
                  </DifficultyButton>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={includeExplanations}
                    onChange={(e) => setIncludeExplanations(e.target.checked)}
                    className="rounded"
                  />
                  Include Explanations
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={useRAG}
                    onChange={(e) => setUseRAG(e.target.checked)}
                    className="rounded"
                  />
                  Use RAG (Better accuracy)
                </label>
              </div>
            </div>

            {/* Cost Estimate */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-200 text-sm">Estimated Cost</div>
                  <div className="text-3xl font-bold text-white">
                    ${estimatedCost.toFixed(3)}
                  </div>
                  <div className="text-green-200 text-sm mt-1">
                    {questionCount} questions • ~
                    {Math.ceil(questionCount * 0.5)} minutes
                  </div>
                </div>
                <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateQuiz}
              disabled={isGenerating || !selectedSource}
              className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <PauseCircle className="w-5 h-5 animate-pulse" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Generate Quiz
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
            {generatedQuiz && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-300 font-semibold mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Quiz Generated Successfully!
                </div>
                <div className="text-green-200 text-sm space-y-1">
                  <div>
                    ✅ {generatedQuiz.quiz.questions.length} questions created
                  </div>
                  <div>
                    💰 Cost: ${generatedQuiz.metadata.costUSD.toFixed(4)}
                  </div>
                  <div>
                    ⏱️ Time:{" "}
                    {(generatedQuiz.metadata.generationTimeMs / 1000).toFixed(
                      1
                    )}
                    s
                  </div>
                  <div>📊 Confidence: {generatedQuiz.metadata.confidence}%</div>
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
            Generated Quizzes
          </h2>
          <div className="space-y-2">
            {generatedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {quiz.source_title}
                    </div>
                    <div className="text-sm text-indigo-200 mt-1">
                      {quiz.generatedData?.questions?.length || 0} questions • $
                      {Number(quiz.cost_usd || 0).toFixed(4)} •
                      {quiz.generatedData?.difficulty || "medium"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        quiz.status === "published"
                          ? "bg-green-500/20 text-green-300"
                          : quiz.status === "approved"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {quiz.status}
                    </span>
                    <button className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30">
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
            <div className="text-4xl font-bold text-indigo-400">
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
  color: "indigo" | "green" | "blue" | "purple";
}) {
  const colorClasses: Record<string, string> = {
    indigo: "from-indigo-500 to-purple-500",
    green: "from-green-500 to-emerald-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-indigo-200 text-sm">{title}</div>
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
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
          : "bg-white/5 text-indigo-200 hover:bg-white/10"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function QuestionTypeButton({
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
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-indigo-500 text-white ring-2 ring-indigo-300"
          : "bg-white/10 text-indigo-200 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function DifficultyButton({
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
          ? "bg-indigo-500 text-white"
          : "bg-white/10 text-indigo-200 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}
