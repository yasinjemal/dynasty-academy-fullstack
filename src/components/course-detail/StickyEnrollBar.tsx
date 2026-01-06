"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, Play } from "lucide-react";
import type { CourseDetail } from "@/lib/api/course-data";

interface StickyEnrollBarProps {
  course: CourseDetail;
  isEnrolled: boolean;
  onEnroll: () => void;
}

export function StickyEnrollBar({
  course,
  isEnrolled,
  onEnroll,
}: StickyEnrollBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3 gap-4">
              {/* Course Info */}
              <div className="flex-1 min-w-0 hidden sm:block">
                <h3 className="text-white font-semibold truncate">
                  {course.title}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-medium">
                      {course.stats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({course.stats.reviewCount.toLocaleString()})
                    </span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">
                    {course.stats.enrollmentCount.toLocaleString()} students
                  </span>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="flex items-center gap-4">
                {!isEnrolled && (
                  <div className="text-right hidden md:block">
                    {course.isFree ? (
                      <span className="text-2xl font-bold text-green-400">
                        FREE
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                          ${course.price}
                        </span>
                        {course.discount > 0 && (
                          <span className="text-gray-500 line-through">
                            ${Math.round(course.originalPrice)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onEnroll}
                  className={`px-6 py-2.5 font-semibold rounded-lg flex items-center gap-2 shadow-lg transition-shadow ${
                    isEnrolled
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                  }`}
                >
                  {isEnrolled ? (
                    <>
                      <Play className="w-4 h-4" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Enroll Now
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
