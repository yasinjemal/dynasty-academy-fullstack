"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Home,
  MessageSquare,
  FolderOpen,
  BarChart3,
  Star,
  Target,
  Volume2,
  VolumeX,
  Maximize,
  Share2,
  ArrowLeft,
  MoreVertical,
  Heart,
  HeartOff,
  Menu,
  X,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  List,
  Video,
} from "lucide-react";

// Dynamic imports for performance
const QuizComponent = dynamic(
  () => import("@/components/courses/QuizComponent"),
  {
    loading: () => <LoadingSpinner />,
  }
);
const LessonDiscussion = dynamic(
  () => import("@/components/courses/LessonDiscussion"),
  {
    loading: () => <LoadingSpinner />,
  }
);
const LessonResources = dynamic(
  () => import("@/components/courses/LessonResources"),
  {
    loading: () => <LoadingSpinner />,
  }
);
const ProgressAnalytics = dynamic(
  () => import("@/components/courses/ProgressAnalytics"),
  {
    loading: () => <LoadingSpinner />,
  }
);
const CourseReviews = dynamic(
  () => import("@/components/courses/CourseReviews"),
  {
    loading: () => <LoadingSpinner />,
  }
);

interface Lesson {
  id: string;
  title: string;
  duration: number;
  videoUrl?: string;
  content?: string;
  order: number;
  isCompleted?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  lessons: Lesson[];
}

type TabType =
  | "overview"
  | "quiz"
  | "discussion"
  | "resources"
  | "progress"
  | "reviews";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}

export default function ProfessionalCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Drawer closed by default
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragDirection, setDragDirection] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );

  const courseId = params?.id as string;

  // Fetch course data
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
          if (data.lessons?.length > 0) {
            setCurrentLesson(data.lessons[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Tabs configuration
  const tabs = [
    {
      id: "overview" as TabType,
      label: "Overview",
      icon: Home,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "quiz" as TabType,
      label: "Quiz",
      icon: Target,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "discussion" as TabType,
      label: "Discussion",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "resources" as TabType,
      label: "Resources",
      icon: FolderOpen,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "progress" as TabType,
      label: "Analytics",
      icon: BarChart3,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "reviews" as TabType,
      label: "Reviews",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  // Swipe handlers for tab navigation
  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      if (direction === "left" && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      } else if (direction === "right" && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].id);
      }
    },
    [activeTab, tabs]
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        handleSwipe("right");
      } else {
        handleSwipe("left");
      }
    }
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLessonChange = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsSidebarOpen(false); // Close sidebar after selection
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!course || !currentLesson) {
    return <LoadingSpinner />;
  }

  const completedCount = course.lessons.filter((l) => l.isCompleted).length;
  const progressPercent = Math.round(
    (completedCount / course.lessons.length) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Premium Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Course Content Drawer Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors relative"
            >
              <List className="w-5 h-5 text-white" />
              {!isSidebarOpen && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {course.lessons.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 mx-4 truncate">
            <h1 className="text-sm font-bold text-white truncate">
              {course.title}
            </h1>
            <p className="text-xs text-gray-400 truncate">
              {currentLesson.title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {isFavorite ? (
                <Heart className="w-5 h-5 text-red-500 fill-current" />
              ) : (
                <HeartOff className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Sliding Course Content Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 mt-14"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-14 bottom-0 w-[90vw] max-w-md bg-slate-900/95 backdrop-blur-xl border-r border-white/10 z-50 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Course Content
                  </h2>
                  <p className="text-sm text-gray-400">
                    {completedCount}/{course.lessons.length} lessons •{" "}
                    {progressPercent}% complete
                  </p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-4 pt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Lessons List */}
              <div className="p-4 space-y-2">
                {course.lessons.map((lesson, index) => {
                  const isActive = lesson.id === currentLesson.id;

                  return (
                    <motion.button
                      key={lesson.id}
                      onClick={() => handleLessonChange(lesson)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-2xl transition-all flex items-center gap-3 group ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600/40 to-blue-600/40 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                          : "bg-white/5 hover:bg-white/10 border-2 border-transparent"
                      }`}
                    >
                      {/* Lesson Number/Status */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                          lesson.isCompleted
                            ? "bg-green-500/20 text-green-400"
                            : isActive
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-white/5 text-gray-400 group-hover:bg-white/10"
                        }`}
                      >
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 text-left min-w-0">
                        <h4
                          className={`font-semibold text-sm truncate ${
                            isActive ? "text-white" : "text-gray-300"
                          }`}
                        >
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <Video className="w-3 h-3" />
                          <span>{Math.floor(lesson.duration / 60)} min</span>
                        </div>
                      </div>

                      {/* Play Icon */}
                      {isActive && (
                        <div className="flex-shrink-0">
                          <Play className="w-5 h-5 text-purple-400 fill-current" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Video Player */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mt-14 aspect-video bg-black"
      >
        {currentLesson.videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={currentLesson.videoUrl}
              className="w-full h-full object-contain"
              onClick={togglePlay}
              onTimeUpdate={(e) => {
                const target = e.target as HTMLVideoElement;
                setProgress((target.currentTime / target.duration) * 100);
              }}
            />

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleMute}
                  className="p-3 bg-black/60 backdrop-blur-sm rounded-xl hover:bg-black/80 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-3 bg-black/60 backdrop-blur-sm rounded-xl hover:bg-black/80 transition-colors"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="p-6 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all hover:scale-110"
                >
                  {isPlaying ? (
                    <Pause className="w-12 h-12 text-white fill-current" />
                  ) : (
                    <Play className="w-12 h-12 text-white fill-current ml-1" />
                  )}
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            <div className="text-center p-8">
              <Video className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">
                No video available for this lesson
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modern Tab Navigation */}
      <div className="sticky top-14 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-shrink-0 px-4 py-4 flex flex-col items-center gap-1 min-w-[80px] transition-all"
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} shadow-lg shadow-purple-500/50`
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.color}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipeable Content Area */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="pb-20"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: dragDirection > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dragDirection > 0 ? -100 : 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="p-4"
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Course Info Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
                >
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {currentLesson.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor(currentLesson.duration / 60)} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>100 XP</span>
                    </div>
                  </div>
                  {currentLesson.content && (
                    <p className="text-gray-300 leading-relaxed">
                      {currentLesson.content}
                    </p>
                  )}
                </motion.div>

                {/* Course Overview Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-white mb-1">
                      {course.lessons.length}
                    </div>
                    <div className="text-xs text-gray-400">Lessons</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30">
                    <div className="text-2xl font-bold text-white mb-1">
                      {completedCount}
                    </div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-4 border border-pink-500/30">
                    <div className="text-2xl font-bold text-white mb-1">
                      {progressPercent}%
                    </div>
                    <div className="text-xs text-gray-400">Progress</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quiz" && currentLesson && (
              <QuizComponent lessonId={currentLesson.id} />
            )}

            {activeTab === "discussion" && currentLesson && (
              <LessonDiscussion lessonId={currentLesson.id} />
            )}

            {activeTab === "resources" && currentLesson && (
              <LessonResources lessonId={currentLesson.id} />
            )}

            {activeTab === "progress" && (
              <ProgressAnalytics
                courseId={courseId}
                userId={session?.user?.id}
              />
            )}

            {activeTab === "reviews" && <CourseReviews courseId={courseId} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 safe-area-bottom">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                const currentIndex = course.lessons.findIndex(
                  (l) => l.id === currentLesson.id
                );
                if (currentIndex > 0) {
                  handleLessonChange(course.lessons[currentIndex - 1]);
                }
              }}
              disabled={course.lessons[0]?.id === currentLesson.id}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={togglePlay}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl py-4 px-6 flex items-center justify-center gap-2 text-white font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Play Lesson</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                const currentIndex = course.lessons.findIndex(
                  (l) => l.id === currentLesson.id
                );
                if (currentIndex < course.lessons.length - 1) {
                  handleLessonChange(course.lessons[currentIndex + 1]);
                }
              }}
              disabled={
                course.lessons[course.lessons.length - 1]?.id ===
                currentLesson.id
              }
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
