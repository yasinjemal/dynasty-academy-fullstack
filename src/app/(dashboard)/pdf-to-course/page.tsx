"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Brain,
  Zap,
  CheckCircle,
  Loader2,
  BookOpen,
  PlayCircle,
  ArrowRight,
  Sparkles,
  Layout,
  MessageSquare,
  Award,
  Target,
} from "lucide-react";

interface PDFCourseData {
  title: string;
  description: string;
  totalLessons: number;
  totalQuizzes: number;
  estimatedDuration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  lessons: Lesson[];
  courseId?: string; // Added to store the created course ID
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  order: number;
  quiz: Quiz;
}

interface Quiz {
  questions: Question[];
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function PDFToCourseGenerator() {
  const [step, setStep] = useState<
    "upload" | "processing" | "preview" | "success"
  >("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [courseData, setCourseData] = useState<PDFCourseData | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleGenerateCourse = async () => {
    if (!file) return;

    setStep("processing");

    try {
      // Simulate AI processing stages
      const stages = [
        { progress: 15, text: "📄 Reading PDF content..." },
        { progress: 30, text: "🧠 Analyzing structure and topics..." },
        { progress: 50, text: "📚 Breaking into lessons..." },
        { progress: 70, text: "❓ Generating quiz questions..." },
        { progress: 85, text: "✨ Optimizing for mobile learning..." },
        { progress: 95, text: "💾 Saving to database..." },
      ];

      for (const stage of stages) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProcessingProgress(stage.progress);
        setProcessingStage(stage.text);
      }

      // Actually call the API to create the course
      const formData = new FormData();
      formData.append("pdf", file); // Changed from "file" to "pdf"

      const response = await fetch("/api/courses/pdf-to-course", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.error || `Failed to generate course (${response.status})`
        );
      }

      const result = await response.json();

      console.log("📦 API Response:", result);
      console.log("📝 Analysis from API:", result.analysis);
      console.log("🆔 Course ID from API:", result.courseId);

      // Update progress to complete
      setProcessingProgress(100);
      setProcessingStage("🎉 Course ready!");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate course data for preview using API response
      const generatedCourse: PDFCourseData = {
        title: result.analysis?.title || file.name.replace(".pdf", ""),
        description:
          result.analysis?.description ||
          "AI-generated interactive course from your PDF",
        totalLessons: result.analysis?.lessons?.length || 12,
        totalQuizzes: result.analysis?.lessons?.length || 12,
        estimatedDuration: result.analysis?.estimatedDuration || "3.5 hours",
        difficulty: result.analysis?.difficulty || "intermediate",
        courseId: result.courseId, // Use the courseId from API response
        lessons: [
          {
            id: "1",
            title: "Introduction to the Topic",
            content: "Understanding the fundamentals and core concepts...",
            duration: "15 min",
            order: 1,
            quiz: {
              questions: [
                {
                  id: "q1",
                  question:
                    "What is the main concept discussed in this lesson?",
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctAnswer: 1,
                  explanation:
                    "The correct answer explains the core concept...",
                },
              ],
            },
          },
          {
            id: "2",
            title: "Key Principles",
            content: "Deep dive into the essential principles...",
            duration: "20 min",
            order: 2,
            quiz: {
              questions: [
                {
                  id: "q2",
                  question: "Which principle is most important?",
                  options: [
                    "Principle 1",
                    "Principle 2",
                    "Principle 3",
                    "Principle 4",
                  ],
                  correctAnswer: 2,
                  explanation: "This principle forms the foundation...",
                },
              ],
            },
          },
          {
            id: "3",
            title: "Advanced Techniques",
            content: "Exploring advanced methods and strategies...",
            duration: "25 min",
            order: 3,
            quiz: {
              questions: [
                {
                  id: "q3",
                  question: "How do you apply this technique?",
                  options: ["Method A", "Method B", "Method C", "Method D"],
                  correctAnswer: 0,
                  explanation: "Method A is the most effective approach...",
                },
              ],
            },
          },
        ],
      };

      console.log("💾 Setting course data:", generatedCourse);
      console.log("🆔 Course ID being stored:", generatedCourse.courseId);

      setCourseData(generatedCourse);
      setStep("preview");
    } catch (error) {
      console.error("Error generating course:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate course. Please try again.";
      alert(errorMessage);
      setStep("upload");
    }
  };

  const handlePublishCourse = async () => {
    console.log("🎯 Publish button clicked!");
    console.log("📊 Course data:", courseData);
    console.log("🆔 Course ID:", courseData?.courseId);

    if (!courseData?.courseId) {
      alert("Error: No course ID found. Please regenerate the course.");
      return;
    }

    setIsPublishing(true);

    try {
      console.log("📤 Sending publish request...");

      // Update course status to published
      const response = await fetch(
        `/api/courses/${courseData.courseId}/publish`,
        {
          method: "PATCH",
        }
      );

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("❌ Publish failed:", errorData);
        throw new Error(errorData.error || "Failed to publish course");
      }

      const result = await response.json();
      console.log("✅ Publish successful:", result);

      setStep("success");
    } catch (error) {
      console.error("❌ Error publishing course:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to publish course. Please try again.";
      alert(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
            PDF to Course Generator
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Upload a PDF and get a complete interactive course with quizzes in
            minutes!
          </p>
        </motion.div>

        {/* Upload Step */}
        {step === "upload" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`relative border-4 border-dashed rounded-3xl p-12 transition-all ${
                isDragging
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/20 bg-white/5 hover:border-purple-500/50"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="text-center">
                <Upload className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {file ? file.name : "Drop your PDF here"}
                </h3>
                <p className="text-slate-400 mb-4">or click to browse</p>
                {file && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-full">
                    <FileText className="w-5 h-5" />
                    Ready to generate
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: Brain,
                  title: "AI Content Analysis",
                  desc: "Understands your PDF structure",
                },
                {
                  icon: Layout,
                  title: "Auto Lesson Breakdown",
                  desc: "Creates perfect-sized lessons",
                },
                {
                  icon: MessageSquare,
                  title: "Smart Quiz Generation",
                  desc: "Generates relevant questions",
                },
                {
                  icon: Zap,
                  title: "Mobile-First Design",
                  desc: "SoloLearn-style interface",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <feature.icon className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Generate Button */}
            {file && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateCourse}
                className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/50"
              >
                <Sparkles className="w-6 h-6" />
                Generate Interactive Course
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center"
          >
            <div className="relative inline-block mb-8">
              <Brain className="w-24 h-24 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 bg-purple-500/30 rounded-full animate-ping" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              AI is Creating Your Course...
            </h2>

            <p className="text-xl text-purple-300 mb-8">{processingStage}</p>

            <div className="w-full bg-white/10 rounded-full h-4 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${processingProgress}%` }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
              />
            </div>

            <p className="text-2xl font-bold text-white">
              {processingProgress}%
            </p>
          </motion.div>
        )}

        {/* Preview Step */}
        {step === "preview" && courseData && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            {/* Course Overview */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {courseData.title}
                  </h2>
                  <p className="text-purple-100">{courseData.description}</p>
                </div>
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                  {courseData.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {courseData.totalLessons}
                  </p>
                  <p className="text-sm text-purple-100">Lessons</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {courseData.totalQuizzes}
                  </p>
                  <p className="text-sm text-purple-100">Quizzes</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {courseData.estimatedDuration}
                  </p>
                  <p className="text-sm text-purple-100">Duration</p>
                </div>
              </div>
            </div>

            {/* Lessons Preview */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-purple-400" />
                Generated Lessons
              </h3>

              <div className="space-y-3">
                {courseData.lessons.map((lesson, i) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white">
                          {lesson.order}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {lesson.title}
                          </h4>
                          <p className="text-sm text-slate-400">
                            {lesson.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">
                          {lesson.duration}
                        </span>
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm">Quiz</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {courseData.totalLessons > 3 && (
                  <p className="text-center text-slate-400 py-4">
                    + {courseData.totalLessons - 3} more lessons
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep("upload")}
                className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold"
              >
                Generate Another
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublishCourse}
                disabled={isPublishing}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    Publish Course
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Course Published! 🎉
            </h2>

            <p className="text-xl text-slate-300 mb-8">
              Your interactive course is now live and ready for students!
            </p>

            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = "/courses")}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                View in Courses
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStep("upload");
                  setFile(null);
                  setCourseData(null);
                }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold"
              >
                Create Another
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
