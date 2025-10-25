"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  FileText,
  Video,
  Download,
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Brain,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { CourseIntelligencePanel } from "@/components/intelligence/CourseIntelligencePanel";
import { AIDashboard } from "@/components/intelligence/AIDashboard";
import SciFiLearningDataChat from "@/components/intelligence/SciFiLearningDataChat";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { CertificateCard } from "@/components/courses/CertificateCard";
import { QuizComponent } from "@/components/courses/QuizComponent";
import { LessonDiscussion } from "@/components/courses/LessonDiscussion";
import { LessonResources } from "@/components/courses/LessonResources";
import { ProgressAnalytics } from "@/components/courses/ProgressAnalytics";
import { CourseReviews } from "@/components/courses/CourseReviews";
import { attentionTracker } from "@/lib/intelligence/DynastyIntelligenceEngine";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "pdf" | "article" | "quiz";
  duration: number; // minutes
  completed: boolean;
  videoUrl?: string;
  pdfUrl?: string;
  content?: string;
  order: number;
  // 🔒 Course Progression
  isLocked?: boolean;
  requiresQuiz?: boolean;
  quizPassed?: boolean;
  quizAttempts?: number;
  lastQuizScore?: number;
  hasQuiz?: boolean;
  // 🎬 YouTube section timestamps
  startTime?: number; // Start time in seconds
  endTime?: number; // End time in seconds
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  order: number;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  sections: Section[];
}

export default function AdvancedCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "quiz" | "discussion" | "resources" | "progress" | "reviews"
  >("overview");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const [lessonProgress, setLessonProgress] = useState<{
    lastPosition: number;
    progress: number;
    completed: boolean;
  }>({
    lastPosition: 0,
    progress: 0,
    completed: false,
  });

  // Unwrap params
  useEffect(() => {
    params.then((p) => setCourseId(p.id));
  }, [params]);

  // Initialize Dynasty Attention Tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("👀 [Dynasty AI] Starting attention tracking...");
    attentionTracker.startTracking();

    return () => {
      console.log("👀 [Dynasty AI] Attention tracking stopped");
    };
  }, []);

  // Fetch course data
  useEffect(() => {
    if (!courseId) return;

    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        console.log("📦 Frontend Received Data:");
        console.log("- totalLessons:", data.totalLessons);
        console.log("- lessonCount:", data.lessonCount);
        console.log("- completedLessons:", data.completedLessons);
        console.log("- sections:", data.sections?.length);

        // Check if we got valid data
        if (!data || !data.sections) {
          console.error("Invalid course data received:", data);
          return;
        }

        setCourseData(data);

        // Set first incomplete lesson as current
        for (const section of data.sections || []) {
          const incompleteLesson = section.lessons?.find(
            (l: Lesson) => !l.completed
          );
          if (incompleteLesson) {
            setCurrentLesson(incompleteLesson);
            setCurrentSection(section);
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    }

    fetchCourse();
  }, [courseId]);

  // Load lesson progress when lesson changes
  useEffect(() => {
    if (!courseId || !currentLesson?.id) return;

    async function loadProgress() {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/lessons/${currentLesson!.id}/progress`
        );
        const data = await response.json();

        if (data.exists && data.progress) {
          setLessonProgress({
            lastPosition: data.progress.lastPosition || 0,
            progress: data.progress.progress || 0,
            completed: data.progress.completed || false,
          });
        } else {
          setLessonProgress({
            lastPosition: 0,
            progress: 0,
            completed: false,
          });
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    }

    loadProgress();
  }, [courseId, currentLesson]);

  // Track lesson progress
  const trackProgress = async (
    lessonId: string,
    completed: boolean = false
  ) => {
    if (!courseId) return;

    try {
      await fetch(`/api/courses/${courseId}/predict`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: completed ? "complete" : "progress",
          lessonId,
          timeSpent: currentLesson?.duration || 0,
          completed,
        }),
      });
    } catch (error) {
      console.error("Error tracking progress:", error);
    }
  };

  // Mark lesson as complete
  const completeLesson = async () => {
    if (!currentLesson || !courseData) return;

    // Check if quiz is required and not passed
    if (currentLesson.hasQuiz && !currentLesson.quizPassed) {
      alert(
        "⚠️ Please complete and pass the quiz before marking this lesson as complete!"
      );
      setActiveTab("quiz"); // Switch to quiz tab
      return;
    }

    await trackProgress(currentLesson.id, true);

    // Update local state
    setCourseData({
      ...courseData,
      completedLessons: courseData.completedLessons + 1,
      progress:
        ((courseData.completedLessons + 1) / courseData.totalLessons) * 100,
    });

    // If quiz was passed, automatically go to next lesson
    if (currentLesson.quizPassed) {
      goToNextLesson();
    }
  };

  // Navigate to next lesson
  const goToNextLesson = () => {
    if (!courseData || !currentSection || !currentLesson) return;

    // If lesson has quiz and not passed, go to quiz tab instead
    if (currentLesson.hasQuiz && !currentLesson.quizPassed) {
      setActiveTab("quiz");
      return;
    }

    const currentSectionIndex = courseData.sections.findIndex(
      (s) => s.id === currentSection.id
    );
    const currentLessonIndex = currentSection.lessons.findIndex(
      (l) => l.id === currentLesson.id
    );

    // Try next lesson in current section
    if (currentLessonIndex < currentSection.lessons.length - 1) {
      const nextLesson = currentSection.lessons[currentLessonIndex + 1];

      // Check if next lesson is locked
      if (nextLesson.isLocked) {
        alert(
          `🔒 "${nextLesson.title}" is locked. Complete the current lesson and pass its quiz first!`
        );
        return;
      }

      setCurrentLesson(nextLesson);
      setActiveTab("overview"); // Reset to overview for new lesson
    }
    // Try first lesson of next section
    else if (currentSectionIndex < courseData.sections.length - 1) {
      const nextSection = courseData.sections[currentSectionIndex + 1];
      const firstLesson = nextSection.lessons[0];

      // Check if next lesson is locked
      if (firstLesson.isLocked) {
        alert(
          `🔒 "${firstLesson.title}" is locked. Complete the current lesson and pass its quiz first!`
        );
        return;
      }

      setCurrentSection(nextSection);
      setCurrentLesson(firstLesson);
      setActiveTab("overview"); // Reset to overview for new lesson
    }
  };

  // Handle quiz completion - refresh course data when quiz is passed
  const handleQuizComplete = async (passed: boolean, score: number) => {
    if (!courseId) return;

    // If quiz was passed, refresh course data to get updated lock states
    if (passed) {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourseData(data);

          // Update current lesson with new quiz status
          const updatedSection = data.sections.find((s: Section) =>
            s.lessons.some((l: Lesson) => l.id === currentLesson?.id)
          );
          if (updatedSection) {
            const updatedLesson = updatedSection.lessons.find(
              (l: Lesson) => l.id === currentLesson?.id
            );
            if (updatedLesson) {
              setCurrentLesson(updatedLesson);
            }
          }

          // Show success message
          alert(
            `🎉 Congratulations! You passed with ${score}%! The next lesson is now unlocked.`
          );

          // Switch to overview tab
          setActiveTab("overview");
        }
      } catch (error) {
        console.error("Error refreshing course data:", error);
      }
    }
  };

  // Navigate to previous lesson
  const goToPreviousLesson = () => {
    if (!courseData || !currentSection || !currentLesson) return;

    const currentSectionIndex = courseData.sections.findIndex(
      (s) => s.id === currentSection.id
    );
    const currentLessonIndex = currentSection.lessons.findIndex(
      (l) => l.id === currentLesson.id
    );

    // Try previous lesson in current section
    if (currentLessonIndex > 0) {
      const prevLesson = currentSection.lessons[currentLessonIndex - 1];
      setCurrentLesson(prevLesson);
    }
    // Try last lesson of previous section
    else if (currentSectionIndex > 0) {
      const prevSection = courseData.sections[currentSectionIndex - 1];
      setCurrentSection(prevSection);
      setCurrentLesson(prevSection.lessons[prevSection.lessons.length - 1]);
    }
  };

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  if (!courseData || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* 🌌 NEURAL PARTICLE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/20 to-black" />
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40 relative">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-cyan-400" />
              ) : (
                <Menu className="w-5 h-5 text-cyan-400" />
              )}
            </button>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                {courseData.title}
              </h1>
              <p className="text-sm text-gray-400 font-mono">
                {currentSection?.title} • {currentLesson.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Status Indicator */}
            {session?.user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-cyan-400 font-mono">
                  {session.user.name ||
                    session.user.email ||
                    "NEURAL LINK ACTIVE"}
                </span>
              </div>
            )}

            {!session?.user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="text-xs font-medium text-red-400 font-mono">
                  Not Signed In
                </span>
              </div>
            )}

            {/* Progress */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                  style={{ width: `${courseData.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(courseData.progress)}%
              </span>
            </div>

            {/* Intelligence Toggle */}
            <button
              onClick={() => setShowIntelligence(!showIntelligence)}
              className={`p-2 rounded-lg transition-colors ${
                showIntelligence
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Brain className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Course Content */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="w-80 bg-black/40 backdrop-blur-xl border-r border-purple-500/20 overflow-y-auto flex-shrink-0"
            >
              <div className="p-4">
                <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Course Content
                </h2>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-purple-500/10 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs font-medium font-mono">
                        LESSONS
                      </span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {courseData.completedLessons}/{courseData.totalLessons}
                    </p>
                  </div>
                  <div className="bg-cyan-500/10 backdrop-blur-sm p-3 rounded-lg border border-cyan-500/30">
                    <div className="flex items-center gap-2 text-cyan-400 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-medium font-mono">
                        PROGRESS
                      </span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {Math.round(courseData.progress)}%
                    </p>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-2">
                  {courseData.sections?.map((section, sectionIndex) => (
                    <div
                      key={section.id}
                      className="border border-purple-500/20 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-3 flex items-center justify-between bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-purple-400 font-mono">
                            SECTION {sectionIndex + 1}
                          </span>
                          <h3 className="font-semibold text-white text-sm">
                            {section.title}
                          </h3>
                        </div>
                        {collapsedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>

                      {!collapsedSections.has(section.id) && (
                        <div className="divide-y divide-purple-500/10">
                          {section.lessons?.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                if (lesson.isLocked) {
                                  alert(
                                    `🔒 "${lesson.title}" is locked. Complete previous lessons and pass their quizzes first!`
                                  );
                                  return;
                                }
                                setCurrentLesson(lesson);
                                setCurrentSection(section);
                                setActiveTab("overview"); // Reset to overview when changing lessons
                                setIsSidebarOpen(false); // Close sidebar on mobile
                              }}
                              disabled={lesson.isLocked}
                              className={`w-full p-3 flex items-center gap-3 transition-colors text-left ${
                                lesson.isLocked
                                  ? "opacity-50 cursor-not-allowed bg-gray-500/5"
                                  : "hover:bg-purple-500/10"
                              } ${
                                currentLesson.id === lesson.id
                                  ? "bg-purple-500/20 border-l-2 border-cyan-400"
                                  : ""
                              }`}
                            >
                              {lesson.isLocked ? (
                                <div className="w-5 h-5 text-gray-500 flex-shrink-0">
                                  🔒
                                </div>
                              ) : lesson.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                              ) : lesson.quizPassed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                              )}

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    lesson.isLocked
                                      ? "text-gray-500"
                                      : currentLesson.id === lesson.id
                                      ? "text-cyan-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {lesson.type === "video" && (
                                    <Video className="w-3 h-3 text-cyan-400" />
                                  )}
                                  {lesson.type === "pdf" && (
                                    <FileText className="w-3 h-3 text-cyan-400" />
                                  )}
                                  {lesson.type === "article" && (
                                    <BookOpen className="w-3 h-3 text-cyan-400" />
                                  )}
                                  <span className="text-xs text-gray-400 font-mono">
                                    {lesson.duration} min
                                  </span>
                                  {lesson.hasQuiz && (
                                    <span className="text-xs text-purple-400 font-mono flex items-center gap-1">
                                      <Brain className="w-3 h-3" />
                                      Quiz
                                      {lesson.quizPassed && (
                                        <span className="text-green-400">
                                          ✓
                                        </span>
                                      )}
                                      {(lesson.quizAttempts || 0) > 0 &&
                                        !lesson.quizPassed && (
                                          <span className="text-orange-400">
                                            ({lesson.quizAttempts})
                                          </span>
                                        )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
            {/* Feature Tabs - Mobile Optimized */}
            <div className="mb-4 md:mb-6 bg-black/40 backdrop-blur-xl rounded-lg md:rounded-xl border border-purple-500/20 p-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 min-w-max md:min-w-0">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap flex items-center gap-1.5 font-mono ${
                    activeTab === "overview"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-base md:text-lg">📚</span>
                  <span className="hidden sm:inline">Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "quiz"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-base md:text-lg">🎯</span>
                  <span className="hidden sm:inline">Quiz</span>
                </button>
                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap flex items-center gap-1.5 font-mono ${
                    activeTab === "discussion"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/50"
                      : "text-gray-300 hover:bg-purple-500/20 hover:text-cyan-400"
                  }`}
                >
                  <span className="text-base md:text-lg">💬</span>
                  <span className="hidden sm:inline">Discussion</span>
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap flex items-center gap-1.5 font-mono ${
                    activeTab === "resources"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/50"
                      : "text-gray-300 hover:bg-purple-500/20 hover:text-cyan-400"
                  }`}
                >
                  <span className="text-base md:text-lg">📁</span>
                  <span className="hidden sm:inline">Resources</span>
                </button>
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap flex items-center gap-1.5 font-mono ${
                    activeTab === "progress"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/50"
                      : "text-gray-300 hover:bg-purple-500/20 hover:text-cyan-400"
                  }`}
                >
                  <span className="text-base md:text-lg">📈</span>
                  <span className="hidden sm:inline">Progress</span>
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap flex items-center gap-1.5 font-mono ${
                    activeTab === "reviews"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/50"
                      : "text-gray-300 hover:bg-purple-500/20 hover:text-cyan-400"
                  }`}
                >
                  <span className="text-base md:text-lg">⭐</span>
                  <span className="hidden sm:inline">Reviews</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Lesson Content - 2/3 width */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <>
                    {/* Professional Video Player */}
                    {currentLesson.type === "video" &&
                      currentLesson.videoUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/20 bg-black/40 backdrop-blur-xl p-2">
                          <VideoPlayer
                            videoUrl={currentLesson.videoUrl}
                            videoProvider={
                              currentLesson.videoUrl.includes("youtube.com") ||
                              currentLesson.videoUrl.includes("youtu.be")
                                ? "youtube"
                                : currentLesson.videoUrl.includes("vimeo.com")
                                ? "vimeo"
                                : currentLesson.videoUrl.includes(
                                    "cloudinary.com"
                                  )
                                ? "cloudinary"
                                : "custom"
                            }
                            onProgress={(currentTime, duration) => {
                              // Progress is auto-saved in VideoPlayer component
                            }}
                            onComplete={() => {
                              completeLesson();
                            }}
                            lastPosition={lessonProgress.lastPosition}
                            autoPlay={false}
                            courseId={courseId || undefined}
                            lessonId={currentLesson.id}
                            // 🎬 YouTube section timestamps
                            startTime={currentLesson.startTime}
                            endTime={currentLesson.endTime}
                          />
                        </div>
                      )}

                    {/* Professional PDF Viewer */}
                    {currentLesson.type === "pdf" && currentLesson.pdfUrl && (
                      <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-8">
                        <div className="flex flex-col items-center gap-4">
                          <FileText className="w-16 h-16 text-cyan-400" />
                          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                            PDF Lesson
                          </h3>
                          <a
                            href={currentLesson.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 font-mono"
                          >
                            <Download className="w-5 h-5" />
                            Download PDF
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Text/Article Content */}
                    {currentLesson.type === "article" && (
                      <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-8">
                        <div className="prose prose-lg prose-purple max-w-none">
                          {currentLesson.content ? (
                            <div
                              className="whitespace-pre-wrap text-gray-300 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: currentLesson.content.replace(
                                  /\n/g,
                                  "<br />"
                                ),
                              }}
                            />
                          ) : (
                            <p className="text-gray-500 italic font-mono">
                              No content available for this lesson.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lesson Actions */}
                    <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={goToPreviousLesson}
                            className="px-4 py-2 bg-purple-500/20 text-gray-300 rounded-lg hover:bg-purple-500/30 hover:text-cyan-400 transition-all flex items-center gap-2 font-mono"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </button>

                          <button
                            onClick={goToNextLesson}
                            className="px-4 py-2 bg-purple-500/20 text-gray-300 rounded-lg hover:bg-purple-500/30 hover:text-cyan-400 transition-all flex items-center gap-2 font-mono"
                          >
                            {currentLesson.hasQuiz &&
                            !currentLesson.quizPassed ? (
                              <>
                                Take Quiz
                                <Brain className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                Next
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          onClick={completeLesson}
                          disabled={
                            currentLesson.completed ||
                            (currentLesson.hasQuiz && !currentLesson.quizPassed)
                          }
                          className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 font-mono ${
                            currentLesson.completed
                              ? "bg-cyan-500/20 text-cyan-400 cursor-not-allowed border border-cyan-500/30"
                              : currentLesson.hasQuiz &&
                                !currentLesson.quizPassed
                              ? "bg-gray-500/20 text-gray-500 cursor-not-allowed border border-gray-500/30"
                              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
                          }`}
                          title={
                            currentLesson.hasQuiz && !currentLesson.quizPassed
                              ? "Pass the quiz first to complete this lesson"
                              : ""
                          }
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          {currentLesson.completed
                            ? "Completed"
                            : currentLesson.hasQuiz && !currentLesson.quizPassed
                            ? "Complete Quiz First 🔒"
                            : "Mark Complete"}
                        </button>
                      </div>
                    </div>

                    {/* Certificate Card - Show when course is completed */}
                    {courseId && courseData && (
                      <CertificateCard
                        courseId={courseId}
                        courseTitle={courseData.title}
                        courseCompleted={courseData.progress >= 100}
                        progress={courseData.progress}
                      />
                    )}

                    {/* Notes Section */}
                    <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4">
                      <button
                        onClick={() => setShowNotes(!showNotes)}
                        className="w-full flex items-center justify-between mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <StickyNote className="w-5 h-5 text-cyan-400" />
                          <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-mono">
                            Lesson Notes
                          </h3>
                        </div>
                        {showNotes ? (
                          <ChevronUp className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>

                      {showNotes && (
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Take notes about this lesson..."
                          className="w-full h-32 p-3 bg-black/40 border border-purple-500/20 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none text-gray-300 placeholder:text-gray-500 font-mono backdrop-blur-xl"
                        />
                      )}
                    </div>
                  </>
                )}

                {/* Quiz Tab */}
                {activeTab === "quiz" && currentLesson && (
                  <QuizComponent
                    lessonId={currentLesson.id}
                    onComplete={handleQuizComplete}
                  />
                )}

                {/* Discussion Tab */}
                {activeTab === "discussion" && currentLesson && courseId && (
                  <LessonDiscussion
                    lessonId={currentLesson.id}
                    courseId={courseId}
                  />
                )}

                {/* Resources Tab */}
                {activeTab === "resources" && currentLesson && (
                  <LessonResources lessonId={currentLesson.id} />
                )}

                {/* Progress Tab */}
                {activeTab === "progress" && courseId && session?.user && (
                  <ProgressAnalytics
                    userId={session.user.email || ""}
                    courseId={courseId}
                  />
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && courseId && (
                  <CourseReviews
                    courseId={courseId}
                    userHasCompleted={courseData.progress >= 100}
                  />
                )}
              </div>

              {/* Intelligence Panel - 1/3 width */}
              <div className="lg:col-span-1 space-y-6">
                {showIntelligence && courseId && session?.user?.id && (
                  <div className="sticky top-6 space-y-6">
                    {/* 💬 Chat with Your Learning Data - SCI-FI EDITION! */}
                    <SciFiLearningDataChat
                      userId={session.user.id}
                      courseId={courseId}
                    />

                    {/* 🧠 Dynasty AI Dashboard */}
                    <AIDashboard courseId={courseId} />

                    {/* Original Course Intelligence Panel */}
                    {currentLesson && courseData && (
                      <CourseIntelligencePanel
                        courseId={courseId}
                        currentLessonId={currentLesson.id}
                        lessonProgress={
                          (courseData.completedLessons /
                            courseData.totalLessons) *
                          100
                        }
                        totalLessons={courseData.totalLessons}
                        completedLessons={courseData.completedLessons}
                        averageSessionMinutes={currentLesson.duration}
                        preferredLearningStyle="visual"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
