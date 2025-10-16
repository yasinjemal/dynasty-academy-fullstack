"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  CheckCircle2,
  BarChart3,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface EnrolledCourse {
  id: string;
  title: string;
  coverImage: string;
  instructor: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  status: "active" | "completed" | "dropped";
  enrolledAt: string;
  lastAccessedAt: string;
  currentLessonId?: string;
  currentLessonTitle?: string;
  totalWatchTime: number; // minutes
  certificateIssued: boolean;
}

interface CourseStats {
  totalEnrolled: number;
  totalCompleted: number;
  totalInProgress: number;
  totalWatchTime: number; // hours
  averageProgress: number;
  streak: number; // days
}

export default function MyCoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        const response = await fetch("/api/users/me/courses");
        const data = await response.json();

        setCourses(data.courses || []);
        setStats(data.stats || null);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchMyCourses();
    }
  }, [session]);

  const filteredCourses = courses.filter((course) => {
    if (filter === "all") return true;
    if (filter === "active") return course.status === "active";
    if (filter === "completed") return course.status === "completed";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Learning Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Track your progress and continue learning
              </p>
            </div>

            {stats && stats.streak > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full">
                <Zap className="w-5 h-5" />
                <span className="font-bold">{stats.streak} day streak!</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Enrolled
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalEnrolled}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Completed
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalCompleted}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">
                  In Progress
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalInProgress}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Watch Time
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalWatchTime}h
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Avg Progress
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {Math.round(stats.averageProgress)}%
              </p>
            </motion.div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "active"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "completed"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/50">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No courses yet
            </h3>
            <p className="text-slate-600 mb-6">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Course Cover */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-500">
                  {course.coverImage ? (
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/30" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {course.status === "completed" ? (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        {Math.round(course.progress)}% Complete
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    by {course.instructor}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{course.totalWatchTime} min watched</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(course.lastAccessedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Continue/Resume Button */}
                  <Link
                    href={`/courses/${course.id}${
                      course.currentLessonId
                        ? `?lesson=${course.currentLessonId}`
                        : ""
                    }`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {course.status === "completed"
                        ? "Review Course"
                        : course.currentLessonTitle
                        ? `Continue: ${course.currentLessonTitle}`
                        : "Continue Learning"}
                    </span>
                  </Link>

                  {/* Certificate Badge */}
                  {course.certificateIssued && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">Certificate earned!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
