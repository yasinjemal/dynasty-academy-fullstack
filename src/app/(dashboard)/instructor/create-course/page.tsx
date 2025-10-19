"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Video,
  FileText,
  Settings,
  CheckCircle2,
  Upload,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Users,
  Target,
  Zap,
  Award,
  Tag,
  List,
} from "lucide-react";

interface CourseStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: "video" | "article" | "quiz";
  videoUrl?: string;
  content?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [promoVideoFile, setPromoVideoFile] = useState<File | null>(null);
  const [promoVideoPreview, setPromoVideoPreview] = useState<string>("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

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

  const [sections, setSections] = useState<Section[]>([
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
      description: "Add sections and lessons",
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

  // Load prefilled data from YouTube Transformer
  useEffect(() => {
    const prefillData = localStorage.getItem("prefillCourseData");
    if (prefillData) {
      try {
        const data = JSON.parse(prefillData);

        // Update course data
        setCourseData((prev) => ({
          ...prev,
          title: data.title || "",
          description: data.description || "",
        }));

        // Update sections - convert YouTube sections to create-course format
        if (data.sections && data.sections.length > 0) {
          const formattedSections = data.sections.map((section: any) => ({
            id: section.id || Math.random().toString(36).substr(2, 9),
            title: section.title,
            description: section.description || "",
            lessons: section.lessons.map((lesson: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              title: lesson.title,
              description: lesson.content || "",
              duration: lesson.duration || 0,
              type: lesson.type || "video",
              videoUrl: lesson.videoUrl || "",
              content: lesson.content || "",
            })),
          }));
          setSections(formattedSections);
        }

        // Clear the localStorage after loading
        localStorage.removeItem("prefillCourseData");

        console.log("✅ Loaded YouTube course data:", data);
      } catch (error) {
        console.error("Failed to parse prefill data:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

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
        const data = await response.json();
        alert("Course saved as draft!");
        router.push("/instructor/courses"); // Redirect to courses list
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
        router.push("/instructor/courses"); // Redirect to courses list instead of individual course
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Failed to publish course");
    } finally {
      setIsSaving(false);
    }
  };

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

  // Handle Thumbnail Upload
  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    setThumbnailFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
      setCourseData({ ...courseData, thumbnail: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Handle Video Upload
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file");
      return;
    }

    // Validate file size (max 50MB for 2 min video)
    if (file.size > 50 * 1024 * 1024) {
      alert("Video must be less than 50MB");
      return;
    }

    setPromoVideoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPromoVideoPreview(reader.result as string);
      setCourseData({ ...courseData, promoVideo: reader.result as string });
    };
    reader.readAsDataURL(file);

    // Validate video duration (optional - requires video element)
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      if (duration > 120) {
        // 120 seconds = 2 minutes
        alert("Video must be 2 minutes or less");
        setPromoVideoFile(null);
        setPromoVideoPreview("");
        setCourseData({ ...courseData, promoVideo: "" });
      }
    };
    video.src = URL.createObjectURL(file);
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

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Create New Course
              </h1>
              <p className="text-gray-400">
                Share your knowledge with the world
              </p>
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
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    placeholder="e.g., Complete React & Next.js Masterclass"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={courseData.subtitle}
                    onChange={(e) =>
                      setCourseData({ ...courseData, subtitle: e.target.value })
                    }
                    placeholder="e.g., Build modern web applications from scratch"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Description *
                  </label>
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
                  <label className="block text-white font-semibold mb-2">
                    Learning Objectives (What will students learn?)
                  </label>
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

            {/* Step 2: Curriculum */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">
                        Section {sectionIndex + 1}
                      </h3>
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
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sectionIndex].title = e.target.value;
                          setSections(newSections);
                        }}
                        placeholder="Section title (e.g., Getting Started)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />

                      <textarea
                        value={section.description}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sectionIndex].description =
                            e.target.value;
                          setSections(newSections);
                        }}
                        placeholder="Section description (optional)"
                        rows={2}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Lessons */}
                    <div className="space-y-3 mb-4">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="bg-white/5 rounded-2xl p-4 border border-white/10"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <select
                                  value={lesson.type}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[sectionIndex].lessons[
                                      lessonIndex
                                    ].type = e.target.value as any;
                                    setSections(newSections);
                                  }}
                                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                                >
                                  <option
                                    value="video"
                                    className="bg-slate-900"
                                  >
                                    📹 Video
                                  </option>
                                  <option
                                    value="article"
                                    className="bg-slate-900"
                                  >
                                    📝 Article
                                  </option>
                                  <option value="quiz" className="bg-slate-900">
                                    🎯 Quiz
                                  </option>
                                </select>

                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[sectionIndex].lessons[
                                      lessonIndex
                                    ].title = e.target.value;
                                    setSections(newSections);
                                  }}
                                  placeholder="Lesson title"
                                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />

                                <input
                                  type="number"
                                  value={lesson.duration}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[sectionIndex].lessons[
                                      lessonIndex
                                    ].duration = parseInt(e.target.value) || 0;
                                    setSections(newSections);
                                  }}
                                  placeholder="Duration (min)"
                                  className="w-32 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />

                                <button
                                  onClick={() =>
                                    removeLesson(section.id, lesson.id)
                                  }
                                  className="p-2 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>

                              {lesson.type === "video" && (
                                <input
                                  type="text"
                                  value={lesson.videoUrl || ""}
                                  onChange={(e) => {
                                    const newSections = [...sections];
                                    newSections[sectionIndex].lessons[
                                      lessonIndex
                                    ].videoUrl = e.target.value;
                                    setSections(newSections);
                                  }}
                                  placeholder="Video URL (YouTube, Vimeo, or direct link)"
                                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addLesson(section.id)}
                      className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 border-2 border-dashed border-purple-500/50 rounded-xl text-purple-300 font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Lesson
                    </button>
                  </div>
                ))}

                <button
                  onClick={addSection}
                  className="w-full py-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border-2 border-dashed border-purple-500/50 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  Add New Section
                </button>
              </div>
            )}

            {/* Step 3: Media */}
            {currentStep === 3 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 space-y-8">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-white font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Course Thumbnail *
                  </label>

                  {thumbnailPreview ? (
                    <div className="relative group">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-64 object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-4">
                        <label className="cursor-pointer px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-colors">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => {
                            setThumbnailFile(null);
                            setThumbnailPreview("");
                            setCourseData({ ...courseData, thumbnail: "" });
                          }}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-white mb-2">
                        Drop your image here, or click to browse
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        Recommended: 1280x720px, max 2MB (JPG, PNG, WebP)
                      </p>
                      <span className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-colors">
                        Choose File
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Promo Video Upload */}
                <div>
                  <label className="block text-white font-semibold mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Promo Video (Optional)
                  </label>

                  {promoVideoPreview ? (
                    <div className="relative group">
                      <video
                        src={promoVideoPreview}
                        controls
                        className="w-full h-64 rounded-2xl bg-black"
                      />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setPromoVideoFile(null);
                            setPromoVideoPreview("");
                            setCourseData({ ...courseData, promoVideo: "" });
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                      <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-white mb-2">
                        Upload a promotional video
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        Max 2 minutes, max 50MB (MP4, WebM, MOV)
                      </p>
                      <span className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-colors">
                        Upload Video
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-blue-300 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <strong>Tip:</strong> A great promo video increases
                      enrollments by 80%! Show what students will learn.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-4">
                    Course Price
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-xs">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={courseData.price}
                        onChange={(e) =>
                          setCourseData({
                            ...courseData,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => setCourseData({ ...courseData, price: 0 })}
                      className="px-6 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded-xl text-green-300 font-semibold transition-colors"
                    >
                      Make it Free
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Set to $0 to make this course free for everyone
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courseData.isPremium}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          isPremium: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded-lg border-2 border-white/20 bg-white/5 checked:bg-purple-600 checked:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
                    />
                    <div>
                      <span className="text-white font-semibold flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        Premium Course
                      </span>
                      <p className="text-gray-400 text-sm">
                        Only accessible to premium members
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 5: Publish */}
            {currentStep === 5 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Ready to Publish!
                  </h2>
                  <p className="text-gray-400">
                    Review your course details before publishing
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {courseData.title || "Untitled Course"}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {courseData.description || "No description"}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {sections.length}
                        </div>
                        <div className="text-sm text-gray-400">Sections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {sections.reduce(
                            (acc, s) => acc + s.lessons.length,
                            0
                          )}
                        </div>
                        <div className="text-sm text-gray-400">Lessons</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {sections.reduce(
                            (acc, s) =>
                              acc +
                              s.lessons.reduce((a, l) => a + l.duration, 0),
                            0
                          )}{" "}
                          min
                        </div>
                        <div className="text-sm text-gray-400">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          ${courseData.price || "Free"}
                        </div>
                        <div className="text-sm text-gray-400">Price</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save as Draft
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={isSaving}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white font-bold shadow-lg shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      {isSaving ? "Publishing..." : "Publish Course"}
                    </button>
                  </div>
                </div>
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
