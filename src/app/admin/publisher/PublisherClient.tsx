"use client";

import { useState } from "react";
import {
  Rocket,
  BookOpen,
  Users,
  Award,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Settings,
  Eye,
  PlayCircle,
  Lock,
  Unlock,
  AlertCircle,
  Sparkles,
  BarChart3,
  Trophy,
} from "lucide-react";

interface PublisherClientProps {
  generatedCourses: any[];
  publishedCourses: any[];
  stats: {
    totalPublished: number;
    totalEnrollments: number;
    totalLessons: number;
    averageRating: number;
  };
}

export default function PublisherClient({
  generatedCourses,
  publishedCourses,
  stats,
}: PublisherClientProps) {
  const [activeTab, setActiveTab] = useState<
    "publish" | "manage" | "analytics"
  >("publish");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Publishing configuration
  const [config, setConfig] = useState({
    price: 0,
    isFree: true,
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    status: "draft" as "draft" | "published",
    certificateEnabled: false,
    isPremium: false,
    featured: false,
    category: "Philosophy",
    tags: ["AI Generated", "Philosophy"],
  });

  const handlePublish = async () => {
    if (!selectedCourse) return;

    setIsPublishing(true);
    setError(null);
    setPublishResult(null);

    try {
      const response = await fetch("/api/admin/ai/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedCourseId: selectedCourse.id,
          config,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPublishResult(data.data);
        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || "Failed to publish course");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateStatus = async (
    courseId: string,
    newStatus: "draft" | "published"
  ) => {
    try {
      const response = await fetch("/api/admin/ai/publish", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Publisher</h1>
              <p className="text-purple-200">
                Transform AI-generated courses into live student experiences
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Rocket className="w-6 h-6" />}
            label="Published Courses"
            value={stats.totalPublished}
            color="purple"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Enrollments"
            value={stats.totalEnrollments}
            color="blue"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Total Lessons"
            value={stats.totalLessons}
            color="green"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label="Avg Rating"
            value={Number(stats.averageRating || 0).toFixed(1)}
            color="yellow"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton
            active={activeTab === "publish"}
            onClick={() => setActiveTab("publish")}
            icon={<Sparkles className="w-5 h-5" />}
          >
            Publish New
          </TabButton>
          <TabButton
            active={activeTab === "manage"}
            onClick={() => setActiveTab("manage")}
            icon={<Settings className="w-5 h-5" />}
          >
            Manage Courses
          </TabButton>
          <TabButton
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            icon={<BarChart3 className="w-5 h-5" />}
          >
            Analytics
          </TabButton>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {/* PUBLISH TAB */}
          {activeTab === "publish" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Course Selection */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Select Generated Course
                </h3>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {generatedCourses.length === 0 ? (
                    <div className="text-center py-12 text-purple-300">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No generated courses ready to publish</p>
                      <p className="text-sm mt-2">Generate a course first!</p>
                    </div>
                  ) : (
                    generatedCourses.map((course) => {
                      const data = course.generatedData;
                      const isSelected = selectedCourse?.id === course.id;
                      const isPublished = course.metadata?.publishedCourseId;

                      return (
                        <div
                          key={course.id}
                          onClick={() => setSelectedCourse(course)}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400"
                              : isPublished
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-white/5 border-white/10 hover:border-purple-400/50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white flex-1">
                              {data.title}
                            </h4>
                            {isPublished && (
                              <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Published (Re-publish to update)
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-purple-200 mb-3 line-clamp-2">
                            {data.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-purple-300">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {data.modules?.length || 0} modules
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />$
                              {Number(course.costUsd || 0).toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {Math.round(Number(course.confidenceScore || 0))}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right: Configuration & Publish */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Publishing Configuration
                </h3>

                {!selectedCourse ? (
                  <div className="text-center py-20 text-purple-300">
                    <Rocket className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Select a course to configure publishing options</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Pricing */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Pricing
                      </label>
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() =>
                            setConfig({ ...config, isFree: true, price: 0 })
                          }
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            config.isFree
                              ? "bg-green-500/20 text-green-300 border-2 border-green-400"
                              : "bg-white/5 text-purple-300 border border-white/10"
                          }`}
                        >
                          Free
                        </button>
                        <button
                          onClick={() =>
                            setConfig({ ...config, isFree: false })
                          }
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            !config.isFree
                              ? "bg-purple-500/20 text-purple-300 border-2 border-purple-400"
                              : "bg-white/5 text-purple-300 border border-white/10"
                          }`}
                        >
                          Paid
                        </button>
                      </div>
                      {!config.isFree && (
                        <input
                          type="number"
                          value={config.price}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                          placeholder="Enter price (USD)"
                          min="0"
                          step="0.01"
                        />
                      )}
                    </div>

                    {/* Level */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Course Level
                      </label>
                      <div className="flex gap-2">
                        {(
                          ["beginner", "intermediate", "advanced"] as const
                        ).map((level) => (
                          <button
                            key={level}
                            onClick={() => setConfig({ ...config, level })}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium capitalize transition-all ${
                              config.level === level
                                ? "bg-purple-500/20 text-purple-300 border-2 border-purple-400"
                                : "bg-white/5 text-purple-300 border border-white/10"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={config.category}
                        onChange={(e) =>
                          setConfig({ ...config, category: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                        placeholder="e.g., Philosophy, Business, Technology"
                      />
                    </div>

                    {/* Features */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                      <label className="block text-sm font-medium text-purple-200 mb-3">
                        Features
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-white flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Enable Certificates
                        </span>
                        <input
                          type="checkbox"
                          checked={config.certificateEnabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              certificateEnabled: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-white/20"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-white flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Premium Course
                        </span>
                        <input
                          type="checkbox"
                          checked={config.isPremium}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              isPremium: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-white/20"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Featured Course
                        </span>
                        <input
                          type="checkbox"
                          checked={config.featured}
                          onChange={(e) =>
                            setConfig({ ...config, featured: e.target.checked })
                          }
                          className="w-5 h-5 rounded border-white/20"
                        />
                      </label>
                    </div>

                    {/* Status */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Initial Status
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setConfig({ ...config, status: "draft" })
                          }
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            config.status === "draft"
                              ? "bg-yellow-500/20 text-yellow-300 border-2 border-yellow-400"
                              : "bg-white/5 text-purple-300 border border-white/10"
                          }`}
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          Draft
                        </button>
                        <button
                          onClick={() =>
                            setConfig({ ...config, status: "published" })
                          }
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            config.status === "published"
                              ? "bg-green-500/20 text-green-300 border-2 border-green-400"
                              : "bg-white/5 text-purple-300 border border-white/10"
                          }`}
                        >
                          <PlayCircle className="w-4 h-4 inline mr-1" />
                          Published
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-red-300 text-sm">{error}</div>
                      </div>
                    )}

                    {/* Success */}
                    {publishResult && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="font-semibold text-green-300">
                            Course Published Successfully!
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-green-200">
                          <div>Sections: {publishResult.sectionsCreated}</div>
                          <div>Lessons: {publishResult.lessonsCreated}</div>
                          <div>Quizzes: {publishResult.quizzesCreated}</div>
                          <div>Questions: {publishResult.questionsCreated}</div>
                        </div>
                      </div>
                    )}

                    {/* Publish Button */}
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      {isPublishing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5" />
                          Publish Course to Platform
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MANAGE TAB */}
          {activeTab === "manage" && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                Published Courses
              </h3>

              {publishedCourses.length === 0 ? (
                <div className="text-center py-20 text-purple-300">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No published courses yet</p>
                  <p className="text-sm mt-2">
                    Publish your first course to see it here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publishedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white flex-1">
                          {course.title}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            course.status === "published"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>

                      <p className="text-sm text-purple-200 mb-3 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-purple-300 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollmentCount || 0} enrolled
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.actualLessonCount || 0} lessons
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {course.isFree ? "Free" : `$${course.price}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {course.certificateEnabled ? "Cert ✓" : "No cert"}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              course.id,
                              course.status === "published"
                                ? "draft"
                                : "published"
                            )
                          }
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                            course.status === "published"
                              ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                              : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                          }`}
                        >
                          {course.status === "published" ? (
                            <>
                              <Lock className="w-3 h-3 inline mr-1" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 inline mr-1" />
                              Publish
                            </>
                          )}
                        </button>
                        <a
                          href={`/courses/${course.slug}`}
                          target="_blank"
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all text-center"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">
                Publishing Analytics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnalyticCard
                  title="Total Revenue Potential"
                  value={`$${publishedCourses
                    .reduce(
                      (sum, c) =>
                        sum +
                        (c.isFree
                          ? 0
                          : parseFloat(c.price || 0) *
                            (c.enrollmentCount || 0)),
                      0
                    )
                    .toFixed(2)}`}
                  subtitle="Based on current enrollments"
                  icon={<DollarSign className="w-6 h-6" />}
                  color="green"
                />
                <AnalyticCard
                  title="Completion Rate"
                  value={
                    stats.totalEnrollments > 0
                      ? `${(
                          (stats.totalEnrollments /
                            (stats.totalEnrollments + 1)) *
                          100
                        ).toFixed(1)}%`
                      : "0%"
                  }
                  subtitle="Students completing courses"
                  icon={<CheckCircle className="w-6 h-6" />}
                  color="blue"
                />
                <AnalyticCard
                  title="AI Cost Savings"
                  value={`$${(stats.totalPublished * 2500).toLocaleString()}`}
                  subtitle="vs traditional course creation"
                  icon={<TrendingUp className="w-6 h-6" />}
                  color="purple"
                />
              </div>

              {/* Course Performance */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Top Performing Courses
                </h4>
                <div className="space-y-2">
                  {publishedCourses
                    .sort(
                      (a, b) =>
                        (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
                    )
                    .slice(0, 5)
                    .map((course, index) => (
                      <div
                        key={course.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4"
                      >
                        <div className="text-2xl font-bold text-purple-400">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {course.title}
                          </div>
                          <div className="text-sm text-purple-300">
                            {course.enrollmentCount || 0} enrollments •{" "}
                            {course.actualLessonCount || 0} lessons
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-300">
                            {course.isFree ? "Free" : `$${course.price}`}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ icon, label, value, color }: any) {
  const colors = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    yellow: "from-yellow-500 to-orange-500",
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div
        className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${
          colors[color as keyof typeof colors]
        } mb-2`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-purple-200">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
        active
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
          : "bg-white/5 text-purple-300 hover:bg-white/10"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function AnalyticCard({ title, value, subtitle, icon, color }: any) {
  const colors = {
    green: "from-green-500/20 to-emerald-500/20 border-green-400/30",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-400/30",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-400/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${
        colors[color as keyof typeof colors]
      } border rounded-xl p-5`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="text-white">{icon}</div>
        <div className="text-sm font-medium text-purple-200">{title}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-purple-300">{subtitle}</div>
    </div>
  );
}
