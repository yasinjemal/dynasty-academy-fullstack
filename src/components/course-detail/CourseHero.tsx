"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Play,
  Clock,
  BookOpen,
  Users,
  Star,
  Award,
  CheckCircle,
  Video,
  Download,
  Trophy,
  Sparkles,
  Zap,
} from "lucide-react";
import type { CourseDetail } from "@/lib/api/course-data";

interface CourseHeroProps {
  course: CourseDetail;
  isEnrolled: boolean;
  userProgress: number;
  onEnroll: () => void;
  onPreview: () => void;
}

export function CourseHero({
  course,
  isEnrolled,
  userProgress,
  onEnroll,
  onPreview,
}: CourseHeroProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const levelColors = {
    beginner: "from-green-500 to-emerald-500",
    intermediate: "from-yellow-500 to-orange-500",
    advanced: "from-red-500 to-pink-500",
  };

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={course.coverImage || "/images/courses/default.jpg"}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [null, "-100%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Course Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {course.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Featured
                </span>
              )}
              {course.isPremium && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium">
                  <Trophy className="w-4 h-4" />
                  Premium
                </span>
              )}
              <span
                className={`inline-flex items-center px-3 py-1.5 bg-gradient-to-r ${
                  levelColors[course.level]
                }/20 border border-white/10 rounded-full text-sm font-medium capitalize`}
              >
                {course.level}
              </span>
              <span className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-white/70 text-sm">
                {course.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {course.title}
            </h1>

            {/* Short Description */}
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              {course.shortDescription}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(course.stats.averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-yellow-400 font-semibold">
                  {course.stats.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-400">
                  ({course.stats.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-5 h-5 text-purple-400" />
                <span>
                  {course.stats.enrollmentCount.toLocaleString()} students
                </span>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{formatDuration(course.duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{course.lessonCount} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                <span>{course.stats.totalHours}h video</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>{course.stats.totalResources} resources</span>
              </div>
              {course.certificateEnabled && (
                <div className="flex items-center gap-2 text-cyan-400">
                  <Award className="w-5 h-5" />
                  <span>Certificate</span>
                </div>
              )}
            </div>

            {/* Instructor Mini */}
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl mb-8">
              <Image
                src={
                  course.instructor.image || "/images/instructors/default.jpg"
                }
                alt={course.instructor.name}
                width={56}
                height={56}
                className="rounded-full ring-2 ring-purple-500/50"
              />
              <div>
                <p className="text-sm text-gray-400">Created by</p>
                <p className="text-white font-semibold">
                  {course.instructor.name}
                </p>
                <p className="text-sm text-purple-400">
                  {course.instructor.title}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <p className="text-sm text-gray-500">
              Last updated:{" "}
              {new Date(course.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </motion.div>

          {/* Right: Enrollment Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:pl-8"
          >
            <div className="bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
              {/* Preview Video Button */}
              {course.previewVideo && (
                <button
                  onClick={onPreview}
                  className="relative w-full aspect-video mb-6 rounded-xl overflow-hidden group"
                >
                  <Image
                    src={course.coverImage || "/images/courses/default.jpg"}
                    alt="Preview"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
                    Preview Course
                  </span>
                </button>
              )}

              {/* Pricing */}
              <div className="mb-6">
                {course.isFree ? (
                  <div className="text-center">
                    <span className="text-4xl font-bold text-green-400">
                      FREE
                    </span>
                  </div>
                ) : (
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-white">
                      ${course.price}
                    </span>
                    {course.discount > 0 && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          ${Math.round(course.originalPrice)}
                        </span>
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded">
                          {course.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              {isEnrolled ? (
                <div className="space-y-4">
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Your Progress</span>
                      <span className="text-cyan-400 font-semibold">
                        {Math.round(userProgress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${userProgress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onEnroll}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                  >
                    <Play className="w-5 h-5" />
                    Continue Learning
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onEnroll}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
                  >
                    <Zap className="w-5 h-5" />
                    Enroll Now
                  </motion.button>
                  <button className="w-full py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
                    Add to Cart
                  </button>
                </div>
              )}

              {/* Money Back Guarantee */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Access on mobile and desktop</span>
                </div>
              </div>

              {/* Includes */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-white font-semibold mb-3">
                  This course includes:
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {course.highlights.slice(0, 6).map((highlight, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
