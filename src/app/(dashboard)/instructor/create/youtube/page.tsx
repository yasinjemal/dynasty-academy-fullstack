"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  Sparkles,
  Loader2,
  Check,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  Zap,
  AlertCircle,
} from "lucide-react";

interface Section {
  sectionTitle: string;
  startTime: string;
  endTime: string;
  duration: number;
  keyPoints: string[];
  summary: string;
}

export default function YouTubeToCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState<
    "input" | "processing" | "preview" | "generating"
  >("input");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [numSections, setNumSections] = useState(15);
  const [sections, setSections] = useState<Section[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const analyzeVideo = async () => {
    if (!youtubeUrl) {
      setError("Please enter a YouTube URL");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setStep("processing");
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await fetch("/api/courses/youtube-to-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: youtubeUrl,
          numSections: numSections,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Failed to analyze video");
      }

      const data = await response.json();
      setSections(data.sections);
      setCourseTitle(data.suggestedTitle || "");
      setCourseDescription(data.suggestedDescription || "");
      setTotalDuration(data.totalDuration || 0);

      console.log("✅ Video analyzed:", {
        sections: data.sections.length,
        duration: `${data.totalDuration} minutes`,
        hasTranscript: data.transcriptLength > 0,
      });

      setTimeout(() => {
        setStep("preview");
        setIsAnalyzing(false);
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "Failed to analyze video");
      setStep("input");
      setIsAnalyzing(false);
    }
  };

  const generateCourse = async () => {
    setStep("generating");

    // Prepare course data with all required fields
    const courseData = {
      title: courseTitle,
      description: courseDescription,
      category: "", // Will be selected in create-course form
      sourceUrl: youtubeUrl,
      sections: sections.map((section, index) => ({
        id: `section-${index}`,
        title: section.sectionTitle,
        description: section.summary,
        order: index + 1,
        lessons: [
          {
            id: `lesson-${index}-0`,
            title: section.sectionTitle,
            type: "video" as const,
            duration: section.duration,
            // Store the base YouTube URL
            videoUrl: youtubeUrl,
            // Store start/end times so player can seek to correct position
            startTime: timeToSeconds(section.startTime),
            endTime: timeToSeconds(section.endTime),
            content: section.summary,
            description: section.summary,
            // Add metadata for debugging
            metadata: {
              originalStartTime: section.startTime,
              originalEndTime: section.endTime,
              sectionIndex: index,
            },
          },
        ],
      })),
    };

    // Navigate to create course with prefilled data
    localStorage.setItem("prefillCourseData", JSON.stringify(courseData));
    console.log("📦 Saving course data to localStorage:", {
      totalSections: courseData.sections.length,
      sampleSection: courseData.sections[0],
    });
    router.push("/instructor/create-course");
  };

  const timeToSeconds = (time: string) => {
    const parts = time.split(":").map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const deleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        sectionTitle: "New Section",
        startTime: "00:00:00",
        endTime: "00:00:00",
        duration: 0,
        keyPoints: [],
        summary: "",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/instructor/create")}
            className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course Forge
          </button>

          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-600 to-purple-600 flex items-center justify-center">
                <Youtube className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  YouTube to Course Transformer
                </h1>
                <p className="text-gray-400">
                  Transform any YouTube video into a structured learning
                  experience
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
            >
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Paste Your YouTube URL
                  </h2>
                  <p className="text-gray-400">
                    Our AI will analyze the video and split it into structured
                    sections
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Target Number of Sections
                    </label>
                    <input
                      type="number"
                      value={numSections}
                      onChange={(e) =>
                        setNumSections(parseInt(e.target.value) || 15)
                      }
                      min="5"
                      max="30"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <p className="text-gray-500 text-sm mt-2">
                      Recommended: 12-20 sections for optimal learning
                      experience
                    </p>
                  </div>

                  <button
                    onClick={analyzeVideo}
                    disabled={isAnalyzing || !youtubeUrl}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-lg shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Analyze & Split Video
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10"
            >
              <div className="max-w-md mx-auto text-center">
                {/* Holographic Progress Ring */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 88 * (1 - progress / 100)
                      }`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-2" />
                      <p className="text-3xl font-bold text-white">
                        {progress}%
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  Analyzing Wisdom...
                </h2>
                <p className="text-gray-400 mb-6">
                  Our AI is extracting key concepts and creating your course
                  structure
                </p>

                <div className="space-y-3 text-left">
                  {[
                    { label: "Extracting transcript", done: progress > 30 },
                    { label: "Identifying key topics", done: progress > 60 },
                    { label: "Creating sections", done: progress > 85 },
                    { label: "Finalizing structure", done: progress >= 100 },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl"
                    >
                      {item.done ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      )}
                      <span
                        className={
                          item.done ? "text-green-400" : "text-gray-400"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview & Edit */}
          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Course Info */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Check className="w-8 h-8 text-green-400" />
                  Course Structure Ready!
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Course Title
                    </label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Course Description
                    </label>
                    <textarea
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Video Stats */}
              {totalDuration > 0 && (
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">
                        Total Video Duration
                      </p>
                      <p className="text-white text-2xl font-bold">
                        {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sections */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    Course Sections ({sections.length})
                  </h3>
                  <button
                    onClick={addSection}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-xl text-purple-300 font-semibold transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {sections.map((section, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>

                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={section.sectionTitle}
                            onChange={(e) =>
                              updateSection(
                                index,
                                "sectionTitle",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:border-purple-500 transition-colors"
                          />

                          <textarea
                            value={section.summary}
                            onChange={(e) =>
                              updateSection(index, "summary", e.target.value)
                            }
                            rows={2}
                            placeholder="Section summary..."
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                          />

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {section.startTime} - {section.endTime}
                            </div>
                            <div>Duration: {section.duration} min</div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteSection(index)}
                          className="flex-shrink-0 p-2 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep("input")}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-all"
                >
                  Start Over
                </button>
                <button
                  onClick={generateCourse}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white font-bold shadow-lg shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Course
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Generating */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10"
            >
              <div className="max-w-md mx-auto text-center">
                <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-white mb-3">
                  Creating Your Course...
                </h2>
                <p className="text-gray-400">
                  Preparing your course builder with all the sections
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
