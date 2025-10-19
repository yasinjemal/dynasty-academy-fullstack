"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  X,
  GripVertical,
  Video,
  FileText,
  CheckSquare,
  Code,
  MessageSquare,
  Wand2,
  Clock,
  Loader2,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: "video" | "article" | "quiz" | "code" | "reflection";
  videoUrl?: string;
  content?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface CurriculumBuilderProps {
  sections: Section[];
  setSections: (sections: Section[]) => void;
}

export default function CurriculumBuilder({
  sections,
  setSections,
}: CurriculumBuilderProps) {
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);

  const lessonTypes = [
    { value: "video", label: "📹 Video", icon: Video },
    { value: "article", label: "📝 Article", icon: FileText },
    { value: "quiz", label: "🎯 Quiz", icon: CheckSquare },
    { value: "code", label: "💻 Code", icon: Code },
    { value: "reflection", label: "💭 Reflection", icon: MessageSquare },
  ];

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: "",
        description: "",
        lessons: [],
      },
    ]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const updateSection = (
    sectionId: string,
    field: keyof Section,
    value: any
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  const addLesson = (sectionId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: [
              ...section.lessons,
              {
                id: Date.now().toString(),
                title: "",
                description: "",
                duration: 0,
                type: "video",
              },
            ],
          };
        }
        return section;
      })
    );
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.filter((l) => l.id !== lessonId),
          };
        }
        return section;
      })
    );
  };

  const updateLesson = (
    sectionId: string,
    lessonId: string,
    field: keyof Lesson,
    value: any
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            ),
          };
        }
        return section;
      })
    );
  };

  const generateAISummary = async (sectionId: string) => {
    setAiGenerating(sectionId);

    // Simulate AI generation
    setTimeout(() => {
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        updateSection(
          sectionId,
          "description",
          `AI-generated summary for "${section.title}": This section covers essential concepts and practical applications.`
        );
      }
      setAiGenerating(null);
    }, 2000);
  };

  const generateAILessons = async (sectionId: string) => {
    setAiGenerating(sectionId);

    // Simulate AI generation
    setTimeout(() => {
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        const newLessons: Lesson[] = [
          {
            id: `${Date.now()}-1`,
            title: `Introduction to ${section.title}`,
            description: "Overview and key concepts",
            duration: 10,
            type: "video",
          },
          {
            id: `${Date.now()}-2`,
            title: `Hands-on Practice`,
            description: "Practical exercises and examples",
            duration: 15,
            type: "article",
          },
          {
            id: `${Date.now()}-3`,
            title: `Quiz: Test Your Knowledge`,
            description: "Check your understanding",
            duration: 5,
            type: "quiz",
          },
        ];

        updateSection(sectionId, "lessons", [
          ...section.lessons,
          ...newLessons,
        ]);
      }
      setAiGenerating(null);
    }, 2000);
  };

  const getTotalDuration = () => {
    return sections.reduce(
      (acc, section) =>
        acc + section.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
      0
    );
  };

  const getTotalLessons = () => {
    return sections.reduce((acc, section) => acc + section.lessons.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {sections.length}
            </div>
            <div className="text-sm text-gray-400">Sections</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {getTotalLessons()}
            </div>
            <div className="text-sm text-gray-400">Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">
              {getTotalDuration()} min
            </div>
            <div className="text-sm text-gray-400">Total Duration</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, sectionIndex) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Section {sectionIndex + 1}
              </h3>
            </div>
            {sections.length > 1 && (
              <button
                onClick={() => removeSection(section.id)}
                className="p-2 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <input
              type="text"
              value={section.title}
              onChange={(e) =>
                updateSection(section.id, "title", e.target.value)
              }
              placeholder="Section title (e.g., Getting Started)"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />

            <div className="relative">
              <textarea
                value={section.description}
                onChange={(e) =>
                  updateSection(section.id, "description", e.target.value)
                }
                placeholder="Section description (optional)"
                rows={2}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <button
                onClick={() => generateAISummary(section.id)}
                disabled={aiGenerating === section.id}
                className="absolute top-2 right-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 border border-purple-500/50 rounded-lg text-purple-300 text-xs font-semibold transition-all flex items-center gap-1"
              >
                {aiGenerating === section.id ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3" />
                    AI Summary
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-3 mb-4">
            {section.lessons.map((lesson, lessonIndex) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded-2xl p-4 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-gray-500 mt-2" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <select
                        value={lesson.type}
                        onChange={(e) =>
                          updateLesson(
                            section.id,
                            lesson.id,
                            "type",
                            e.target.value as any
                          )
                        }
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                      >
                        {lessonTypes.map((type) => (
                          <option
                            key={type.value}
                            value={type.value}
                            className="bg-slate-900"
                          >
                            {type.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) =>
                          updateLesson(
                            section.id,
                            lesson.id,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Lesson title"
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />

                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={lesson.duration}
                          onChange={(e) =>
                            updateLesson(
                              section.id,
                              lesson.id,
                              "duration",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-16 bg-transparent text-white focus:outline-none"
                        />
                        <span className="text-gray-400 text-sm">min</span>
                      </div>

                      <button
                        onClick={() => removeLesson(section.id, lesson.id)}
                        className="p-2 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {lesson.type === "video" && (
                      <input
                        type="text"
                        value={lesson.videoUrl || ""}
                        onChange={(e) =>
                          updateLesson(
                            section.id,
                            lesson.id,
                            "videoUrl",
                            e.target.value
                          )
                        }
                        placeholder="Video URL (YouTube, Vimeo, or direct link)"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => addLesson(section.id)}
              className="flex-1 py-3 bg-purple-600/20 hover:bg-purple-600/30 border-2 border-dashed border-purple-500/50 rounded-xl text-purple-300 font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Lesson
            </button>

            <button
              onClick={() => generateAILessons(section.id)}
              disabled={aiGenerating === section.id}
              className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 border border-purple-500/50 rounded-xl text-purple-300 font-semibold transition-all flex items-center gap-2"
            >
              {aiGenerating === section.id ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  AI Generate
                </>
              )}
            </button>
          </div>
        </motion.div>
      ))}

      {/* Add Section Button */}
      <button
        onClick={addSection}
        className="w-full py-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border-2 border-dashed border-purple-500/50 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-6 h-6" />
        Add New Section
      </button>
    </div>
  );
}
