"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Play,
  FileText,
  BookOpen,
  HelpCircle,
  Lock,
  Clock,
  Eye,
} from "lucide-react";
import type { CurriculumSection, CurriculumLesson } from "@/lib/api/course-data";

interface CourseCurriculumProps {
  sections: CurriculumSection[];
  isEnrolled: boolean;
  onPreviewLesson?: (lessonId: string) => void;
}

export function CourseCurriculum({
  sections,
  isEnrolled,
  onPreviewLesson,
}: CourseCurriculumProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([sections[0]?.id])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const getLessonIcon = (type: CurriculumLesson["type"]) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />;
      case "article":
        return <BookOpen className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const totalLessons = sections.reduce((acc, s) => acc + s.lessonCount, 0);
  const totalDuration = sections.reduce((acc, s) => acc + s.duration, 0);
  const freeLessons = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.isFree).length,
    0
  );

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Course Curriculum</h2>
            <p className="text-gray-400">
              {sections.length} sections • {totalLessons} lessons • {formatDuration(totalDuration)} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Expand All
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Free Preview Notice */}
        {freeLessons > 0 && !isEnrolled && (
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-3">
            <Eye className="w-5 h-5 text-purple-400" />
            <p className="text-purple-300 text-sm">
              <span className="font-semibold">{freeLessons} lessons</span> are available for free preview
            </p>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(section.id);

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.05 }}
                className="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 font-bold">{sectionIndex + 1}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold text-lg">{section.title}</h3>
                      {section.description && (
                        <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm hidden sm:block">
                      {section.lessonCount} lessons • {formatDuration(section.duration)}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                </button>

                {/* Lessons */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5">
                        {section.lessons.map((lesson, lessonIndex) => {
                          const canAccess = isEnrolled || lesson.isFree;

                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0 ${
                                canAccess
                                  ? "hover:bg-white/5 cursor-pointer"
                                  : "opacity-60"
                              } transition-colors`}
                              onClick={() => {
                                if (canAccess && onPreviewLesson) {
                                  onPreviewLesson(lesson.id);
                                }
                              }}
                            >
                              {/* Lesson Icon */}
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  lesson.type === "quiz"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : lesson.type === "pdf"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : lesson.type === "article"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-purple-500/20 text-purple-400"
                                }`}
                              >
                                {getLessonIcon(lesson.type)}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-sm font-medium truncate">
                                    {lesson.title}
                                  </span>
                                  {lesson.isFree && !isEnrolled && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-medium">
                                      Preview
                                    </span>
                                  )}
                                  {lesson.hasQuiz && (
                                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded font-medium">
                                      Quiz
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Duration & Lock */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-gray-500 text-sm flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {lesson.duration}min
                                </span>
                                {!canAccess && (
                                  <Lock className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
