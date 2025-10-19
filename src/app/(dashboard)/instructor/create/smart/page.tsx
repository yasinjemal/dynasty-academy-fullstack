"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Loader2,
  Plus,
  X,
  Target,
  BookOpen,
  Image as ImageIcon,
  DollarSign,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  List,
  Video,
  FileText,
  Settings,
  Zap,
} from "lucide-react";

// Import the advanced curriculum builder
import CurriculumBuilder from "@/components/course/CurriculumBuilder";
import CoursePreview from "@/components/course/CoursePreview";

interface CourseStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

export default function SmartBuilderPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Course Data
  const [courseData, setCourseData] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "beginner",
    language: "English",
    thumbnail: "",
    promoVideo: "",
    price: 0,
    isPremium: false,
    tags: [] as string[],
    learningObjectives: ["", "", "", ""],
    requirements: [""],
    targetAudience: [""],
  });

  const [sections, setSections] = useState<any[]>([
    {
      id: "1",
      title: "",
      description: "",
      lessons: [],
    },
  ]);

  const steps: CourseStep[] = [
    {
      id: 1,
      title: "Basic Info",
      description: "Course title, description & category",
      icon: BookOpen,
    },
    {
      id: 2,
      title: "Curriculum",
      description: "AI-powered curriculum builder",
      icon: List,
    },
    {
      id: 3,
      title: "Media",
      description: "Upload thumbnail & promo video",
      icon: ImageIcon,
    },
    {
      id: 4,
      title: "Pricing",
      description: "Set price & accessibility",
      icon: DollarSign,
    },
    {
      id: 5,
      title: "Publish",
      description: "Review & publish your course",
      icon: Sparkles,
    },
  ];

  const categories = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Design",
    "Business",
    "Marketing",
    "Photography",
    "Music",
    "Health & Fitness",
    "Personal Development",
  ];

  const levels = ["beginner", "intermediate", "advanced", "all-levels"];

  // AI Content Generation
  const generateWithAI = async (type: string) => {
    setIsGeneratingAI(true);

    try {
      const response = await fetch(`/api/ai/generate-${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (type === "outline") {
          setSections(data.sections);
        } else if (type === "objectives") {
          setCourseData({
            ...courseData,
            learningObjectives: data.objectives,
          });
        } else if (type === "description") {
          setCourseData({
            ...courseData,
            description: data.description,
          });
        }
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseData,
          sections,
          status: "draft",
          instructorId: session?.user?.id,
        }),
      });

      if (response.ok) {
        alert("Course saved as draft!");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseData,
          sections,
          status: "published",
          instructorId: session?.user?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Course published successfully!");
        router.push(`/instructor/courses/${data.id}`);
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Failed to publish course");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push("/instructor/create")}
          className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Forge
        </button>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Smart Course Builder
                </h1>
                <p className="text-gray-400">
                  AI-assisted creation for extraordinary results
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Draft
              </button>
              <button
                onClick={() => router.push("/instructor/courses")}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50"
                          : isCompleted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      ) : (
                        <Icon
                          className={`w-8 h-8 ${
                            isActive ? "text-white" : "text-gray-400"
                          }`}
                        />
                      )}
                    </motion.div>
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 text-center hidden md:block">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 rounded-full ${
                        isCompleted ? "bg-green-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Basic Info with AI */}
            {currentStep === 1 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                  <p className="text-purple-300 font-semibold">
                    AI will help enhance your content as you type
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white font-semibold">
                      Course Title *
                    </label>
                  </div>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    placeholder="e.g., Master React in 2025 – From Zero to Expert"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white font-semibold">
                      Description *
                    </label>
                    <button
                      onClick={() => generateWithAI("description")}
                      disabled={isGeneratingAI || !courseData.title}
                      className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/50 rounded-lg text-purple-300 font-semibold transition-all flex items-center gap-2 text-sm"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          AI Enhance
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={courseData.description}
                    onChange={(e) =>
                      setCourseData({
                        ...courseData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe what students will learn in your course..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Category *
                    </label>
                    <select
                      value={courseData.category}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Level *
                    </label>
                    <select
                      value={courseData.level}
                      onChange={(e) =>
                        setCourseData({ ...courseData, level: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {levels.map((level) => (
                        <option
                          key={level}
                          value={level}
                          className="bg-slate-900"
                        >
                          {level.charAt(0).toUpperCase() +
                            level.slice(1).replace("-", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white font-semibold">
                      Learning Objectives (What will students learn?)
                    </label>
                    <button
                      onClick={() => generateWithAI("objectives")}
                      disabled={isGeneratingAI || !courseData.title}
                      className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/50 rounded-lg text-purple-300 font-semibold transition-all flex items-center gap-2 text-sm"
                    >
                      <Wand2 className="w-4 h-4" />
                      AI Generate
                    </button>
                  </div>
                  <div className="space-y-3">
                    {courseData.learningObjectives.map((obj, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => {
                            const newObjectives = [
                              ...courseData.learningObjectives,
                            ];
                            newObjectives[index] = e.target.value;
                            setCourseData({
                              ...courseData,
                              learningObjectives: newObjectives,
                            });
                          }}
                          placeholder={`Learning objective ${index + 1}`}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Advanced Curriculum Builder */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-purple-400 animate-pulse" />
                      <p className="text-purple-300 font-semibold">
                        AI-Powered Curriculum Builder
                      </p>
                    </div>
                    <button
                      onClick={() => generateWithAI("outline")}
                      disabled={isGeneratingAI}
                      className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 border border-purple-500/50 rounded-lg text-purple-300 font-semibold transition-all flex items-center gap-2"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate Full Outline
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <CurriculumBuilder
                  sections={sections}
                  setSections={setSections}
                />
              </div>
            )}

            {/* Steps 3, 4, 5 - Use existing implementation */}
            {currentStep > 2 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <p className="text-white text-center">
                  Step {currentStep} content (use existing implementation)
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === step.id
                    ? "w-8 bg-purple-500"
                    : currentStep > step.id
                    ? "bg-green-500"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
