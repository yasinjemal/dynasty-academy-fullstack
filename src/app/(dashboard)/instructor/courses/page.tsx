"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Book,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Eye,
  Trash2,
  BarChart3,
  Star,
  Clock,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  status: string;
  price: number;
  lessonCount: number;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  publishedAt?: string;
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses/create");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);

        // Calculate stats
        const totalStudents = data.reduce(
          (acc: number, course: any) =>
            acc + (course._count?.course_enrollments || 0),
          0
        );
        const totalRevenue = data.reduce(
          (acc: number, course: any) =>
            acc + course.price * (course._count?.course_enrollments || 0),
          0
        );
        const avgRating =
          data.reduce(
            (acc: number, course: any) => acc + (course.averageRating || 0),
            0
          ) / (data.length || 1);

        setStats({
          totalCourses: data.length,
          totalStudents,
          totalRevenue,
          averageRating: avgRating,
        });
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchCourses();
        }
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
              <p className="text-gray-400">
                Manage and track your course performance
              </p>
            </div>
            <Link href="/instructor/create">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white font-semibold shadow-lg shadow-purple-500/50 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Course
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <Book className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalCourses}
          </div>
          <div className="text-sm text-gray-400">Courses</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-400" />
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalStudents}
          </div>
          <div className="text-sm text-gray-400">Students</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Revenue</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-pink-400" />
            <span className="text-sm text-gray-400">Average</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Rating</div>
        </motion.div>
      </div>

      {/* Courses List */}
      <div className="max-w-7xl mx-auto">
        {courses.length === 0 ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No courses yet
            </h2>
            <p className="text-gray-400 mb-6">
              Start by creating your first course
            </p>
            <Link href="/instructor/create-course">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white font-bold shadow-lg shadow-purple-500/50 transition-all">
                Create Your First Course
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group"
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                  {course.coverImage ? (
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        course.status === "published"
                          ? "bg-green-500/20 text-green-300 border border-green-500/50"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{course.averageRating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.lessonCount} lessons</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-purple-400">
                      {course.price > 0 ? `$${course.price}` : "Free"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/instructor/courses/${course.id}/edit`}
                      className="flex-1"
                    >
                      <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </Link>
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-xl text-purple-300 text-sm font-semibold transition-all flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-300 text-sm font-semibold transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
