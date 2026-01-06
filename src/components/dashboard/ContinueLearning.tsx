"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Clock, BookOpen, ChevronRight } from "lucide-react";
import type { LearningProgress } from "@/lib/api/dashboard-data";

interface ContinueLearningProps {
  courses: LearningProgress[];
}

export default function ContinueLearning({ courses }: ContinueLearningProps) {
  if (courses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-purple-100 dark:border-purple-900/50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Start Your Learning Journey
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enroll in a course to begin your path to mastery
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            Browse Courses
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Continue Learning 📚
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Pick up where you left off
          </p>
        </div>
        <Link
          href="/my-courses"
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <motion.div
            key={course.courseId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/courses/${course.courseId}/learn`}
              className="group block"
            >
              <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                {/* Course Cover */}
                <div className="relative w-24 h-24 md:w-32 md:h-24 flex-shrink-0">
                  {course.courseCover ? (
                    <img
                      src={course.courseCover}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-purple-600 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                    {course.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {course.instructor}
                  </p>

                  {/* Progress Bar */}
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {course.progress}% complete • {course.completedLessons}/
                      {course.totalLessons} lessons
                    </span>
                    {course.estimatedTimeLeft > 0 && (
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <Clock className="w-3 h-3" />
                        {course.estimatedTimeLeft < 60
                          ? `${course.estimatedTimeLeft}m left`
                          : `${Math.round(
                              course.estimatedTimeLeft / 60
                            )}h left`}
                      </span>
                    )}
                  </div>

                  {/* Next Lesson */}
                  {course.nextLesson && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Next:
                      </span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 truncate">
                        {course.nextLesson}
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
