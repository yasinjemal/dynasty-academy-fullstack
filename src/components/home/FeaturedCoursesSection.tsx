"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  Star,
  Clock,
  Users,
  Play,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Trophy,
  Zap,
  ArrowRight,
} from "lucide-react";
import type { FeaturedCourse } from "@/lib/api/homepage-data";

interface FeaturedCoursesSectionProps {
  courses: FeaturedCourse[];
}

export default function FeaturedCoursesSection({
  courses,
}: FeaturedCoursesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-[#030014] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-950/30 via-transparent to-transparent" />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-400">
              Premium Learning Paths
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-white">Master Skills That </span>
            <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Matter
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Structured courses designed by experts. Learn at your pace, earn
            certificates, build your dynasty.
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {courses.slice(0, 4).map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredCourse(course.id)}
              onMouseLeave={() => setHoveredCourse(null)}
            >
              <Link href={`/courses/${course.slug}`}>
                <motion.div
                  className="group relative h-full bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    {/* Course Thumbnail */}
                    <div className="relative w-full sm:w-2/5 aspect-video sm:aspect-auto sm:min-h-[280px]">
                      {course.coverImage ? (
                        <Image
                          src={course.coverImage}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-600 flex items-center justify-center">
                          <GraduationCap className="w-16 h-16 text-white/50" />
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={false}
                      >
                        <motion.div
                          className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Play className="w-7 h-7 text-violet-600 fill-violet-600 ml-1" />
                        </motion.div>
                      </motion.div>

                      {/* Level Badge */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            course.level === "Beginner"
                              ? "bg-green-500/90 text-white"
                              : course.level === "Intermediate"
                              ? "bg-amber-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }`}
                        >
                          {course.level || "All Levels"}
                        </span>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      {/* Category & Instructor */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                            {course.category || "Personal Development"}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
                          {course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {course.description ||
                            "Master this essential skill with expert guidance."}
                        </p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(course.rating || 0)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-400 ml-1">
                              {(course.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            {(
                              course.enrollmentCount || 0
                            ).toLocaleString()}{" "}
                            enrolled
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          {(course.lessonCount || 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400">
                              <Play className="w-3 h-3" />
                              {course.lessonCount} lessons
                            </span>
                          )}
                          {course.hasCertificate && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg text-xs text-amber-400">
                              <Trophy className="w-3 h-3" />
                              Certificate
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        {/* Instructor */}
                        <div className="flex items-center gap-2">
                          {course.instructor?.image ? (
                            <Image
                              src={course.instructor.image}
                              alt={course.instructor.name || "Instructor"}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {course.instructor?.name?.charAt(0) || "D"}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-400">
                            {course.instructor?.name || "Dynasty Academy"}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          {course.isFree ? (
                            <span className="text-xl font-black text-green-400">
                              FREE
                            </span>
                          ) : (
                            <>
                              {course.salePrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${course.price}
                                </span>
                              )}
                              <span className="text-xl font-black text-white">
                                ${course.salePrice || course.price}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Animated Border */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    animate={{
                      boxShadow:
                        hoveredCourse === course.id
                          ? "inset 0 0 30px rgba(139, 92, 246, 0.3)"
                          : "inset 0 0 0 rgba(139, 92, 246, 0)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/courses">
            <motion.button
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Browse All Courses</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
