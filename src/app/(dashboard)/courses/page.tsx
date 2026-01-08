"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import InstructorQuickAccess from "@/components/shared/InstructorQuickAccess";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Award,
  TrendingUp,
  Search,
  Filter,
  Loader2,
  Video,
  FileText,
  CheckCircle2,
  GraduationCap,
  PlusCircle,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  coverImage: string;
  level: string;
  category: string;
  price: number;
  duration: number; // in minutes
  lessonCount: number;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  status: string;
  featured: boolean;
  isPremium: boolean;
  isEnrolled?: boolean;
  progress?: number;
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "enrolled" | "featured">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    "All",
    "Web Development",
    "Business",
    "Design",
    "Marketing",
    "Personal Development",
  ];

  const filteredCourses = courses.filter((course) => {
    // Filter by enrollment status
    if (filter === "enrolled" && !course.isEnrolled) return false;
    if (filter === "featured" && !course.featured) return false;

    // Filter by category
    if (
      selectedCategory !== "all" &&
      course.category?.toLowerCase() !== selectedCategory.toLowerCase()
    )
      return false;

    // Filter by search query
    if (
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          <p className="text-slate-400 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-pink-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 py-8 xs:py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4 xs:mb-6">
              <Award className="w-3 h-3 xs:w-4 xs:h-4 text-purple-400" />
              <span className="text-xs xs:text-sm text-purple-300">
                Professional Courses
              </span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 xs:mb-4">
              Master New Skills
            </h1>

            <p className="text-sm xs:text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-4 xs:mb-6 sm:mb-8 px-2">
              Learn from expert instructors with video courses, PDF guides, and
              hands-on projects. Track your progress with AI-powered
              intelligence.
            </p>

            {/* Stats - Horizontal scroll on mobile */}
            <div className="flex items-center justify-start sm:justify-center gap-4 xs:gap-6 sm:gap-8 overflow-x-auto scrollbar-hide pb-2 px-2 sm:px-0 -mx-2 sm:mx-0">
              <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                <BookOpen className="w-4 h-4 xs:w-5 xs:h-5 text-purple-400" />
                <span className="text-xs xs:text-sm sm:text-base text-slate-300 whitespace-nowrap">
                  {courses.length} Courses
                </span>
              </div>
              <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                <Users className="w-4 h-4 xs:w-5 xs:h-5 text-blue-400" />
                <span className="text-xs xs:text-sm sm:text-base text-slate-300 whitespace-nowrap">
                  {courses.reduce((acc, c) => acc + c.enrollmentCount, 0)}{" "}
                  Students
                </span>
              </div>
              <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 text-pink-400" />
                <span className="text-xs xs:text-sm sm:text-base text-slate-300 whitespace-nowrap">
                  AI-Powered
                </span>
              </div>
            </div>

            {/* Instructor Portal CTA */}
            {session && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 xs:mt-8 flex flex-col xs:flex-row items-center justify-center gap-3 xs:gap-4 px-2"
              >
                <Link href="/instructor/courses" className="w-full xs:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full xs:w-auto group flex items-center justify-center gap-2 xs:gap-3 px-4 xs:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all text-sm xs:text-base touch-manipulation"
                  >
                    <GraduationCap className="w-4 h-4 xs:w-5 xs:h-5 group-hover:rotate-12 transition-transform" />
                    Instructor Dashboard
                  </motion.button>
                </Link>

                <Link
                  href="/instructor/create-course"
                  className="w-full xs:w-auto"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full xs:w-auto group flex items-center justify-center gap-2 xs:gap-3 px-4 xs:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-semibold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all text-sm xs:text-base touch-manipulation"
                  >
                    <PlusCircle className="w-4 h-4 xs:w-5 xs:h-5 group-hover:rotate-90 transition-transform" />
                    Create Course
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12">
        {/* Filters */}
        <div className="mb-6 xs:mb-8 space-y-3 xs:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 xs:pl-12 pr-4 py-2.5 xs:py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm xs:text-base"
            />
          </div>

          {/* Filter Tabs - Horizontal scroll */}
          <div className="flex items-center gap-2 xs:gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-all flex-shrink-0 text-sm xs:text-base touch-manipulation ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              All Courses
            </button>
            {session && (
              <button
                onClick={() => setFilter("enrolled")}
                className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-all flex-shrink-0 text-sm xs:text-base touch-manipulation ${
                  filter === "enrolled"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                }`}
              >
                My Courses
              </button>
            )}
            <button
              onClick={() => setFilter("featured")}
              className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-all flex-shrink-0 text-sm xs:text-base touch-manipulation ${
                filter === "featured"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Featured
            </button>
          </div>

          {/* Category Filter - Horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className={`px-3 xs:px-4 py-1 xs:py-1.5 rounded-full whitespace-nowrap text-xs xs:text-sm font-medium transition-all flex-shrink-0 touch-manipulation ${
                  selectedCategory === cat.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/30 text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-10 xs:py-16">
            <BookOpen className="w-12 h-12 xs:w-16 xs:h-16 text-slate-600 mx-auto mb-3 xs:mb-4" />
            <h3 className="text-lg xs:text-xl font-semibold text-slate-400 mb-2">
              No courses found
            </h3>
            <p className="text-sm xs:text-base text-slate-500">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/courses/${course.id}`}>
                  <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl xs:rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 h-full flex flex-col touch-manipulation active:scale-[0.98]">
                    {/* Course Image */}
                    <div className="relative h-32 xs:h-40 sm:h-48 overflow-hidden">
                      {course.coverImage ? (
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 text-slate-600" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2 xs:top-3 left-2 xs:left-3 flex gap-1.5 xs:gap-2">
                        {course.featured && (
                          <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-yellow-500/90 text-yellow-900 text-[10px] xs:text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        )}
                        {course.isEnrolled && (
                          <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-green-500/90 text-white text-[10px] xs:text-xs font-semibold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                            Enrolled
                          </span>
                        )}
                      </div>

                      {/* Progress Bar (if enrolled) */}
                      {course.isEnrolled && course.progress !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 xs:h-1.5 bg-slate-900/80">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="p-3 xs:p-4 sm:p-6 flex-1 flex flex-col">
                      {/* Category & Level */}
                      <div className="flex items-center gap-1.5 xs:gap-2 mb-2 xs:mb-3">
                        <span className="px-1.5 xs:px-2 py-0.5 xs:py-1 bg-purple-500/10 text-purple-300 text-[10px] xs:text-xs rounded">
                          {course.category}
                        </span>
                        <span className="px-1.5 xs:px-2 py-0.5 xs:py-1 bg-blue-500/10 text-blue-300 text-[10px] xs:text-xs rounded capitalize">
                          {course.level}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-1 xs:mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs xs:text-sm text-slate-400 mb-3 xs:mb-4 line-clamp-2 flex-1">
                        {course.shortDescription || course.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 text-[10px] xs:text-xs text-slate-400 mb-3 xs:mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 xs:w-4 xs:h-4" />
                          <span>{Math.round(course.duration / 60)}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3 xs:w-4 xs:h-4" />
                          <span>{course.lessonCount} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 xs:w-4 xs:h-4 text-yellow-500" />
                          <span>
                            {Number(course.averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Price & Enroll */}
                      <div className="flex items-center justify-between pt-3 xs:pt-4 border-t border-slate-700/50">
                        <div>
                          {course.price === 0 ? (
                            <span className="text-green-400 font-semibold text-sm xs:text-base">
                              Free
                            </span>
                          ) : (
                            <span className="text-white font-semibold text-base xs:text-lg">
                              ${course.price}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 xs:gap-2 text-purple-400 font-medium group-hover:text-purple-300 text-xs xs:text-sm">
                          {course.isEnrolled ? (
                            <>
                              Continue
                              <Play className="w-3 h-3 xs:w-4 xs:h-4" />
                            </>
                          ) : (
                            <>
                              Enroll Now
                              <Play className="w-3 h-3 xs:w-4 xs:h-4" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Instructor Quick Access */}
      <InstructorQuickAccess />
    </div>
  );
}
