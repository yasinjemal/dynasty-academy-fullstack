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
import { VideoPlayer } from "@/components/course/VideoPlayer";

// Dynamically import PDFViewer to avoid SSR issues with pdfjs-dist
const PDFViewer = dynamic(() => import("@/components/course/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-slate-400">Loading PDF viewer...</p>
      </div>
    </div>
  ),
});

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

  // Fetch course data
  useEffect(() => {
    if (!courseId) return;

    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

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

    await trackProgress(currentLesson.id, true);

    // Update local state
    setCourseData({
      ...courseData,
      completedLessons: courseData.completedLessons + 1,
      progress:
        ((courseData.completedLessons + 1) / courseData.totalLessons) * 100,
    });

    // Move to next lesson
    goToNextLesson();
  };

  // Navigate to next lesson
  const goToNextLesson = () => {
    if (!courseData || !currentSection || !currentLesson) return;

    const currentSectionIndex = courseData.sections.findIndex(
      (s) => s.id === currentSection.id
    );
    const currentLessonIndex = currentSection.lessons.findIndex(
      (l) => l.id === currentLesson.id
    );

    // Try next lesson in current section
    if (currentLessonIndex < currentSection.lessons.length - 1) {
      const nextLesson = currentSection.lessons[currentLessonIndex + 1];
      setCurrentLesson(nextLesson);
    }
    // Try first lesson of next section
    else if (currentSectionIndex < courseData.sections.length - 1) {
      const nextSection = courseData.sections[currentSectionIndex + 1];
      setCurrentSection(nextSection);
      setCurrentLesson(nextSection.lessons[0]);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {courseData.title}
              </h1>
              <p className="text-sm text-gray-500">
                {currentSection?.title} • {currentLesson.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
              className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0"
            >
              <div className="p-4">
                <h2 className="text-lg font-bold mb-4">Course Content</h2>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs font-medium">Lessons</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {courseData.completedLessons}/{courseData.totalLessons}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-medium">Progress</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(courseData.progress)}%
                    </p>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-2">
                  {courseData.sections?.map((section, sectionIndex) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">
                            Section {sectionIndex + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {section.title}
                          </h3>
                        </div>
                        {collapsedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {!collapsedSections.has(section.id) && (
                        <div className="divide-y divide-gray-100">
                          {section.lessons?.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                setCurrentLesson(lesson);
                                setCurrentSection(section);
                              }}
                              className={`w-full p-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left ${
                                currentLesson.id === lesson.id
                                  ? "bg-purple-50 border-l-2 border-purple-600"
                                  : ""
                              }`}
                            >
                              {lesson.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                              )}

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    currentLesson.id === lesson.id
                                      ? "text-purple-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {lesson.type === "video" && (
                                    <Video className="w-3 h-3 text-gray-400" />
                                  )}
                                  {lesson.type === "pdf" && (
                                    <FileText className="w-3 h-3 text-gray-400" />
                                  )}
                                  {lesson.type === "article" && (
                                    <BookOpen className="w-3 h-3 text-gray-400" />
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {lesson.duration} min
                                  </span>
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
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lesson Content - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Professional Video Player */}
                {currentLesson.type === "video" && currentLesson.videoUrl && (
                  <VideoPlayer
                    videoUrl={currentLesson.videoUrl}
                    videoProvider={
                      currentLesson.videoUrl.includes("youtube.com") ||
                      currentLesson.videoUrl.includes("youtu.be")
                        ? "youtube"
                        : currentLesson.videoUrl.includes("vimeo.com")
                        ? "vimeo"
                        : currentLesson.videoUrl.includes("cloudinary.com")
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
                  />
                )}

                {/* Professional PDF Viewer */}
                {currentLesson.type === "pdf" && currentLesson.pdfUrl && (
                  <PDFViewer
                    pdfUrl={currentLesson.pdfUrl}
                    onProgress={(currentPage, totalPages) => {
                      // Track progress
                      const progress = (currentPage / totalPages) * 100;
                      if (progress > 80) {
                        trackProgress(currentLesson.id, false);
                      }
                    }}
                    lastPage={1}
                  />
                )}

                {/* Article Content */}
                {currentLesson.type === "article" && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 prose prose-purple max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          currentLesson.content || "<p>Article content...</p>",
                      }}
                    />
                  </div>
                )}

                {/* Lesson Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToPreviousLesson}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <button
                        onClick={goToNextLesson}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={completeLesson}
                      disabled={currentLesson.completed}
                      className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        currentLesson.completed
                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {currentLesson.completed ? "Completed" : "Mark Complete"}
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">
                        Lesson Notes
                      </h3>
                    </div>
                    {showNotes ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showNotes && (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Take notes about this lesson..."
                      className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    />
                  )}
                </div>
              </div>

              {/* Intelligence Panel - 1/3 width */}
              <div className="lg:col-span-1">
                {showIntelligence && courseId && (
                  <div className="sticky top-6">
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
