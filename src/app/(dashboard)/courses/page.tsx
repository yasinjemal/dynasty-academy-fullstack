"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
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
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">
                Professional Courses
              </span>
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
              Master New Skills
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Learn from expert instructors with video courses, PDF guides, and
              hands-on projects. Track your progress with AI-powered
              intelligence.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">{courses.length} Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">
                  {courses.reduce((acc, c) => acc + c.enrollmentCount, 0)}{" "}
                  Students
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-400" />
                <span className="text-slate-300">AI-Powered Learning</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "featured"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Featured
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
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
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              No courses found
            </h3>
            <p className="text-slate-500">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/courses/${course.id}`}>
                  <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 h-full flex flex-col">
                    {/* Course Image */}
                    <div className="relative h-48 overflow-hidden">
                      {course.coverImage ? (
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-slate-600" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {course.featured && (
                          <span className="px-3 py-1 bg-yellow-500/90 text-yellow-900 text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        )}
                        {course.isEnrolled && (
                          <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Enrolled
                          </span>
                        )}
                      </div>

                      {/* Progress Bar (if enrolled) */}
                      {course.isEnrolled && course.progress !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/80">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Category & Level */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded">
                          {course.category}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded capitalize">
                          {course.level}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
                        {course.shortDescription || course.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{Math.round(course.duration / 60)}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          <span>{course.lessonCount} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>
                            {Number(course.averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Price & Enroll */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div>
                          {course.price === 0 ? (
                            <span className="text-green-400 font-semibold">
                              Free
                            </span>
                          ) : (
                            <span className="text-white font-semibold text-lg">
                              ${course.price}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:text-purple-300">
                          {course.isEnrolled ? (
                            <>
                              Continue
                              <Play className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Enroll Now
                              <Play className="w-4 h-4" />
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
    </div>
  );
}
