"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, BookOpen, Users } from "lucide-react";
import type { RelatedCourse } from "@/lib/api/course-data";

interface RelatedCoursesProps {
  courses: RelatedCourse[];
}

export function RelatedCourses({ courses }: RelatedCoursesProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}m`;
  };

  if (!courses.length) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Related Courses
          </h2>
          <p className="text-gray-400">Continue your learning journey</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/course/${course.slug}`}>
                <div className="group bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 h-full flex flex-col">
                  {/* Course Image */}
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={course.coverImage || "/images/courses/default.jpg"}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* Price Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white font-semibold text-sm">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
                    </div>

                    {/* Level Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs text-white/80 capitalize">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Instructor */}
                    <p className="text-gray-500 text-sm mb-4">
                      {course.instructor}
                    </p>

                    {/* Stats */}
                    <div className="mt-auto flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-medium">
                          {course.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({course.enrollmentCount.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDuration(course.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{course.lessonCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
