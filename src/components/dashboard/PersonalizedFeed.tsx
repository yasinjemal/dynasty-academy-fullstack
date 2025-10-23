"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, TrendingUp, Clock, Star, ArrowRight } from "lucide-react";

interface Recommendation {
  courseId: string;
  score: number;
  reasons: string[];
  course: {
    id: string;
    title: string;
    coverImage?: string;
    instructor: {
      name: string;
      image?: string;
    };
    _count: {
      enrollments: number;
      lessons: number;
    };
    averageRating?: number;
    difficulty?: string;
    topics?: string[];
  };
}

interface ContinueLearning {
  id: string;
  completionPercentage: number;
  lastAccessedAt: string;
  course: {
    id: string;
    title: string;
    coverImage?: string;
    instructor: {
      name: string;
      image?: string;
    };
  };
}

export default function PersonalizedFeed() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [continueLearning, setContinueLearning] = useState<ContinueLearning[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      const [recommendationsRes, continueRes] = await Promise.all([
        fetch("/api/recommendations?limit=6"),
        fetch("/api/recommendations?type=continue"),
      ]);

      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        setRecommendations(data.recommendations || []);
      }

      if (continueRes.ok) {
        const data = await continueRes.json();
        setContinueLearning(data.recommendations || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-purple-200/50 dark:border-purple-800/50 animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Continue Learning */}
      {continueLearning.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 border border-purple-200/50 dark:border-purple-800/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600" />
              Continue Learning
            </h2>
            <Link
              href="/my-courses"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueLearning.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/courses/${enrollment.course.id}`}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  {enrollment.course.coverImage && (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={enrollment.course.coverImage}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-bold text-purple-600">
                        {enrollment.completionPercentage}%
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {enrollment.course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {enrollment.course.instructor.image && (
                        <img
                          src={enrollment.course.instructor.image}
                          alt={enrollment.course.instructor.name}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span>{enrollment.course.instructor.name}</span>
                    </div>
                    <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                        style={{ width: `${enrollment.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended for You */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 border border-purple-200/50 dark:border-purple-800/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Recommended for You
            </h2>
            <Link
              href="/courses"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
            >
              Explore All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <Link
                key={rec.courseId}
                href={`/courses/${rec.courseId}`}
                className="group"
              >
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  {rec.course.coverImage && (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={rec.course.coverImage}
                        alt={rec.course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {rec.course.averageRating && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-900">
                            {rec.course.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">
                        {Math.round(rec.score)}% Match
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {rec.course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rec.course.instructor.image && (
                        <img
                          src={rec.course.instructor.image}
                          alt={rec.course.instructor.name}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span>{rec.course.instructor.name}</span>
                    </div>
                    {rec.reasons.length > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        ✨ {rec.reasons[0]}
                      </p>
                    )}
                    {rec.course.topics && rec.course.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {rec.course.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading &&
        continueLearning.length === 0 &&
        recommendations.length === 0 && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-12 border border-purple-200/50 dark:border-purple-800/50 text-center">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Start Your Learning Journey
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enroll in your first course to get personalized recommendations
            </p>
            <Link href="/courses">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all">
                Browse Courses
              </button>
            </Link>
          </div>
        )}
    </div>
  );
}
