"use client";

import { motion } from "framer-motion";
import {
  Target,
  Clock,
  BarChart3,
  Zap,
  Award,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";

interface CoursePreviewProps {
  courseData: any;
  sections: any[];
}

export default function CoursePreview({
  courseData,
  sections,
}: CoursePreviewProps) {
  const getTotalDuration = () => {
    return sections.reduce(
      (acc, section) =>
        acc +
        section.lessons.reduce(
          (sum: number, lesson: any) => sum + (lesson.duration || 0),
          0
        ),
      0
    );
  };

  const getTotalLessons = () => {
    return sections.reduce(
      (acc, section) => acc + (section.lessons?.length || 0),
      0
    );
  };

  const calculateCompletionPotential = () => {
    const duration = getTotalDuration();
    if (duration < 60) return 95;
    if (duration < 180) return 85;
    if (duration < 360) return 75;
    return 65;
  };

  const calculateFocusEnergy = () => {
    const lessonCount = getTotalLessons();
    if (lessonCount < 10) return "Low";
    if (lessonCount < 30) return "Medium";
    if (lessonCount < 50) return "High";
    return "Intense";
  };

  const getRecommendedSession = () => {
    const duration = getTotalDuration();
    const avgLessonTime = duration / getTotalLessons() || 0;

    if (avgLessonTime < 10) return "Quick Bursts (15-20 min)";
    if (avgLessonTime < 20) return "Focused Sessions (30-45 min)";
    return "Deep Dives (60+ min)";
  };

  const getDifficultyBadge = () => {
    const level = courseData.level || "beginner";
    const colors: any = {
      beginner: "bg-green-500/20 text-green-400 border-green-500/30",
      intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      advanced: "bg-red-500/20 text-red-400 border-red-500/30",
      "all-levels": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };

    return colors[level] || colors.beginner;
  };

  return (
    <div className="space-y-6">
      {/* Course Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {courseData.title || "Untitled Course"}
            </h2>
            <p className="text-gray-400">
              {courseData.category || "Uncategorized"}
            </p>
          </div>
        </div>

        <p className="text-gray-300 mb-6">
          {courseData.description || "No description provided"}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Sections</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {sections.length}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Lessons</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {getTotalLessons()}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Duration</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Price</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${courseData.price || "Free"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course Intelligence Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Course Intelligence</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completion Potential */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">
                Completion Potential
              </span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold text-green-400">
                {calculateCompletionPotential()}%
              </div>
              <div className="text-gray-400 text-sm mb-1">
                High completion rate
              </div>
            </div>
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculateCompletionPotential()}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
          </div>

          {/* Focus Energy */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Focus Energy</span>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {calculateFocusEnergy()}
            </div>
            <div className="text-gray-400 text-sm">
              Engagement intensity level
            </div>
          </div>

          {/* Recommended Session */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Recommended Session</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-400 mb-2">
              {getRecommendedSession()}
            </div>
            <div className="text-gray-400 text-sm">Optimal learning pace</div>
          </div>

          {/* Difficulty Badge */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Difficulty Level</span>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div
              className={`inline-flex items-center px-4 py-2 rounded-xl font-bold border ${getDifficultyBadge()}`}
            >
              {courseData.level?.charAt(0).toUpperCase() +
                courseData.level?.slice(1).replace("-", " ") || "Beginner"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Learning Objectives */}
      {courseData.learningObjectives?.some((obj: string) => obj) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Target className="w-6 h-6 text-cyan-400" />
            What You'll Learn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courseData.learningObjectives
              ?.filter((obj: string) => obj)
              .map((objective: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{objective}</p>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
