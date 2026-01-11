"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
  Brain,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Loader2,
  Home,
  List,
  MessageSquare,
  FolderOpen,
  BarChart3,
  Star,
  Lock,
  Unlock,
  Trophy,
  Zap,
  Target,
  Sparkles,
} from "lucide-react";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { QuizComponent } from "@/components/courses/QuizComponent";
import { LessonDiscussion } from "@/components/courses/LessonDiscussion";
import { LessonResources } from "@/components/courses/LessonResources";
import { ProgressAnalytics } from "@/components/courses/ProgressAnalytics";
import { CourseReviews } from "@/components/courses/CourseReviews";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "pdf" | "article" | "quiz";
  duration: number;
  completed: boolean;
  videoUrl?: string;
  pdfUrl?: string;
  content?: string;
  order: number;
  isLocked?: boolean;
  requiresQuiz?: boolean;
  quizPassed?: boolean;
  quizAttempts?: number;
  lastQuizScore?: number;
  hasQuiz?: boolean;
  startTime?: number;
  endTime?: number;
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
  coverImage?: string;
}

type TabType = "lesson" | "curriculum" | "quiz" | "discuss" | "resources" | "progress";

export default function MobileCoursePagePro({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("lesson");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [lessonProgress, setLessonProgress] = useState({
    lastPosition: 0,
    progress: 0,
    completed: false,
  });
  const mainRef = useRef<HTMLDivElement>(null);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setCourseId(p.id));
  }, [params]);

  // Fetch course data
  useEffect(() => {
    if (!courseId) return;

    async function fetchCourse() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load course (${response.status})`);
        }

        const data = await response.json();
        if (!data || !data.sections) {
          setError("Course data is incomplete");
          setIsLoading(false);
          return;
        }

        setCourseData(data);

        // Set first available lesson
        let foundLesson = false;
        for (const section of data.sections || []) {
          const lesson = section.lessons?.find((l: Lesson) => !l.completed && !l.isLocked);
          if (lesson) {
            setCurrentLesson(lesson);
            setCurrentSection(section);
            setExpandedSections(new Set([section.id]));
            foundLesson = true;
            break;
          }
        }

        if (!foundLesson && data.sections?.[0]?.lessons?.[0]) {
          setCurrentLesson(data.sections[0].lessons[0]);
          setCurrentSection(data.sections[0]);
          setExpandedSections(new Set([data.sections[0].id]));
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError(error instanceof Error ? error.message : "Failed to load course");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  // Navigation functions
  const goToNextLesson = () => {
    if (!courseData || !currentSection || !currentLesson) return;

    const sectionIndex = courseData.sections.findIndex((s) => s.id === currentSection.id);
    const lessonIndex = currentSection.lessons.findIndex((l) => l.id === currentLesson.id);

    if (lessonIndex < currentSection.lessons.length - 1) {
      const nextLesson = currentSection.lessons[lessonIndex + 1];
      if (!nextLesson.isLocked) {
        setCurrentLesson(nextLesson);
        setActiveTab("lesson");
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (sectionIndex < courseData.sections.length - 1) {
      const nextSection = courseData.sections[sectionIndex + 1];
      const firstLesson = nextSection.lessons[0];
      if (!firstLesson?.isLocked) {
        setCurrentSection(nextSection);
        setCurrentLesson(firstLesson);
        setExpandedSections(new Set([nextSection.id]));
        setActiveTab("lesson");
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const goToPrevLesson = () => {
    if (!courseData || !currentSection || !currentLesson) return;

    const sectionIndex = courseData.sections.findIndex((s) => s.id === currentSection.id);
    const lessonIndex = currentSection.lessons.findIndex((l) => l.id === currentLesson.id);

    if (lessonIndex > 0) {
      setCurrentLesson(currentSection.lessons[lessonIndex - 1]);
      setActiveTab("lesson");
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else if (sectionIndex > 0) {
      const prevSection = courseData.sections[sectionIndex - 1];
      setCurrentSection(prevSection);
      setCurrentLesson(prevSection.lessons[prevSection.lessons.length - 1]);
      setExpandedSections(new Set([prevSection.id]));
      setActiveTab("lesson");
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const selectLesson = (lesson: Lesson, section: Section) => {
    if (lesson.isLocked) return;
    setCurrentLesson(lesson);
    setCurrentSection(section);
    setActiveTab("lesson");
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const completeLesson = async () => {
    if (!currentLesson || !courseData || !courseId) return;

    try {
      await fetch(`/api/courses/${courseId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          completed: true,
        }),
      });

      // Refresh course data
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourseData(data);
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <X className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/25"
          >
            <ChevronLeft className="w-4 h-4" />
            Browse Courses
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !courseData || !currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <Brain className="absolute inset-0 m-auto w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  const completedCount = courseData.sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.completed).length,
    0
  );
  const totalCount = courseData.sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex flex-col">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HEADER - Sticky with blur */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          {/* Top Row - Back & Progress */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <a
              href="/courses"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </a>

            {/* Progress Bar */}
            <div className="flex-1 max-w-xs sm:max-w-md">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-bold text-purple-400 min-w-[3rem] text-right">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* User Avatar */}
            {session?.user && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {session.user.name?.[0] || "U"}
              </div>
            )}
          </div>

          {/* Course Title */}
          <h1 className="text-sm sm:text-base font-bold text-white line-clamp-1">
            {courseData.title}
          </h1>
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
            {currentSection?.title} • {currentLesson.title}
          </p>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-20">
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* LESSON TAB */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {activeTab === "lesson" && (
          <div className="animate-in fade-in duration-300">
            {/* Video Player */}
            {currentLesson.type === "video" && currentLesson.videoUrl && (
              <div className="aspect-video bg-black relative">
                <VideoPlayer
                  videoUrl={currentLesson.videoUrl}
                  videoProvider={
                    currentLesson.videoUrl.includes("youtube") ? "youtube" :
                    currentLesson.videoUrl.includes("vimeo") ? "vimeo" : "custom"
                  }
                  onProgress={() => {}}
                  onComplete={completeLesson}
                  lastPosition={lessonProgress.lastPosition}
                  autoPlay={false}
                  courseId={courseId || undefined}
                  lessonId={currentLesson.id}
                  startTime={currentLesson.startTime}
                  endTime={currentLesson.endTime}
                />
              </div>
            )}

            {/* PDF Content */}
            {currentLesson.type === "pdf" && currentLesson.pdfUrl && (
              <div className="p-4 sm:p-6">
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 sm:p-8 text-center border border-purple-500/20">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">PDF Lesson</h3>
                  <p className="text-gray-400 text-sm mb-4">{currentLesson.title}</p>
                  <a
                    href={currentLesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                </div>
              </div>
            )}

            {/* Article Content */}
            {currentLesson.type === "article" && (
              <div className="p-4 sm:p-6">
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 sm:p-6 border border-purple-500/20">
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                    {currentLesson.content ? (
                      <div
                        className="text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: currentLesson.content.replace(/\n/g, "<br />"),
                        }}
                      />
                    ) : (
                      <p className="text-gray-500 italic">No content available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Info Card */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Lesson Title & Actions */}
              <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {currentLesson.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentLesson.duration} min
                      </span>
                      {currentLesson.hasQuiz && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <Brain className="w-4 h-4" />
                          Quiz {currentLesson.quizPassed && "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                  {currentLesson.completed ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Complete</span>
                    </div>
                  ) : (
                    <button
                      onClick={completeLesson}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark Complete</span>
                    </button>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevLesson}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={goToNextLesson}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-3 text-center border border-purple-500/20">
                  <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{completedCount}</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-3 text-center border border-purple-500/20">
                  <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{totalCount - completedCount}</p>
                  <p className="text-xs text-gray-400">Remaining</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-3 text-center border border-purple-500/20">
                  <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{progressPercent}%</p>
                  <p className="text-xs text-gray-400">Progress</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* CURRICULUM TAB */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {activeTab === "curriculum" && (
          <div className="p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Course Curriculum</h2>
              <span className="text-sm text-gray-400">
                {completedCount}/{totalCount} lessons
              </span>
            </div>

            <div className="space-y-3">
              {courseData.sections.map((section, sectionIndex) => {
                const sectionCompleted = section.lessons.filter((l) => l.completed).length;
                const isExpanded = expandedSections.has(section.id);

                return (
                  <div
                    key={section.id}
                    className="bg-gray-800/50 backdrop-blur rounded-xl border border-purple-500/20 overflow-hidden"
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                          {sectionIndex + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-white text-sm sm:text-base line-clamp-1">
                            {section.title}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {sectionCompleted}/{section.lessons.length} lessons
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sectionCompleted === section.lessons.length && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Section Lessons */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-purple-500/10"
                        >
                          {section.lessons.map((lesson, lessonIndex) => (
                            <button
                              key={lesson.id}
                              onClick={() => selectLesson(lesson, section)}
                              disabled={lesson.isLocked}
                              className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${
                                lesson.isLocked
                                  ? "opacity-50 cursor-not-allowed bg-gray-900/30"
                                  : currentLesson.id === lesson.id
                                  ? "bg-purple-500/20 border-l-2 border-purple-500"
                                  : "hover:bg-purple-500/10"
                              }`}
                            >
                              {/* Lesson Status */}
                              <div className="flex-shrink-0">
                                {lesson.isLocked ? (
                                  <Lock className="w-5 h-5 text-gray-500" />
                                ) : lesson.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-purple-400" />
                                )}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1 text-left min-w-0">
                                <p
                                  className={`text-sm font-medium line-clamp-1 ${
                                    lesson.isLocked
                                      ? "text-gray-500"
                                      : currentLesson.id === lesson.id
                                      ? "text-purple-300"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {lessonIndex + 1}. {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {lesson.type === "video" && (
                                    <Video className="w-3 h-3 text-cyan-400" />
                                  )}
                                  {lesson.type === "pdf" && (
                                    <FileText className="w-3 h-3 text-cyan-400" />
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {lesson.duration} min
                                  </span>
                                  {lesson.hasQuiz && (
                                    <span className="text-xs text-purple-400 flex items-center gap-0.5">
                                      <Brain className="w-3 h-3" />
                                      Quiz
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Playing Indicator */}
                              {currentLesson.id === lesson.id && (
                                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* QUIZ TAB */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {activeTab === "quiz" && (
          <div className="p-4 sm:p-6 animate-in fade-in duration-300">
            {currentLesson.hasQuiz ? (
              <QuizComponent
                courseId={courseId || ""}
                lessonId={currentLesson.id}
                lessonTitle={currentLesson.title}
                onComplete={(passed, score) => {
                  if (passed) {
                    // Refresh course data
                    fetch(`/api/courses/${courseId}`)
                      .then((res) => res.json())
                      .then((data) => setCourseData(data));
                  }
                }}
              />
            ) : (
              <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 sm:p-8 text-center border border-purple-500/20">
                <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Quiz Available</h3>
                <p className="text-gray-400 text-sm">
                  This lesson doesn't have a quiz. Continue with the lesson content!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* DISCUSSION TAB */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {activeTab === "discuss" && (
          <div className="p-4 sm:p-6 animate-in fade-in duration-300">
            <LessonDiscussion
              courseId={courseId || ""}
              lessonId={currentLesson.id}
              lessonTitle={currentLesson.title}
            />
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* RESOURCES TAB */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {activeTab === "resources" && (
          <div className="p-4 sm:p-6 animate-in fade-in duration-300">
            <LessonResources courseId={courseId || ""} lessonId={currentLesson.id} />
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* PROGRESS TAB */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {activeTab === "progress" && (
          <div className="p-4 sm:p-6 animate-in fade-in duration-300">
            <ProgressAnalytics courseId={courseId || ""} courseData={courseData} />
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM NAVIGATION - Mobile First */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-purple-500/20 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { id: "lesson" as TabType, icon: Play, label: "Lesson" },
            { id: "curriculum" as TabType, icon: List, label: "Content" },
            { id: "quiz" as TabType, icon: Brain, label: "Quiz" },
            { id: "discuss" as TabType, icon: MessageSquare, label: "Discuss" },
            { id: "resources" as TabType, icon: FolderOpen, label: "Files" },
            { id: "progress" as TabType, icon: BarChart3, label: "Progress" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "text-purple-400 bg-purple-500/20"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
