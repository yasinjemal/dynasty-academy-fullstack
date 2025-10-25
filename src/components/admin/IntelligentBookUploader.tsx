"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Loader2,
  Brain,
  Wand2,
  Zap,
  Eye,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  Edit3,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface ProcessingStage {
  id: string;
  label: string;
  status: "pending" | "processing" | "complete" | "error";
  icon: any;
  result?: any;
}

interface IntelligentBookUploaderProps {
  onComplete: (bookData: any) => void;
}

export default function IntelligentBookUploader({
  onComplete,
}: IntelligentBookUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [stages, setStages] = useState<ProcessingStage[]>([
    {
      id: "upload",
      label: "Uploading Book File",
      status: "pending",
      icon: Upload,
    },
    {
      id: "extract",
      label: "Extracting Book Content",
      status: "pending",
      icon: FileText,
    },
    {
      id: "metadata",
      label: "Analyzing Metadata (Title, Author)",
      status: "pending",
      icon: BookOpen,
    },
    {
      id: "content",
      label: "AI Content Analysis (GPT-4)",
      status: "pending",
      icon: Brain,
    },
    {
      id: "description",
      label: "Generating Description",
      status: "pending",
      icon: Wand2,
    },
    {
      id: "category",
      label: "Smart Category Detection",
      status: "pending",
      icon: Tag,
    },
    {
      id: "tags",
      label: "Extracting Keywords & Tags",
      status: "pending",
      icon: Sparkles,
    },
    {
      id: "audience",
      label: "Identifying Target Audience",
      status: "pending",
      icon: Users,
    },
    {
      id: "pricing",
      label: "Calculating Optimal Price",
      status: "pending",
      icon: DollarSign,
    },
    {
      id: "cover",
      label: "Processing/Generating Cover",
      status: "pending",
      icon: ImageIcon,
    },
    {
      id: "seo",
      label: "Creating SEO Metadata",
      status: "pending",
      icon: TrendingUp,
    },
    {
      id: "finalize",
      label: "Finalizing Book Data",
      status: "pending",
      icon: CheckCircle2,
    },
  ]);
  const [bookData, setBookData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [newTag, setNewTag] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      toast.success(`📚 "${file.name}" ready to process!`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/epub+zip": [".epub"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    multiple: false,
    disabled: isProcessing,
  });

  const updateStage = (
    index: number,
    status: ProcessingStage["status"],
    result?: any
  ) => {
    setStages((prev) =>
      prev.map((stage, i) =>
        i === index ? { ...stage, status, result } : stage
      )
    );
  };

  const processBook = async () => {
    if (!file) {
      toast.error("Please select a book file first");
      return;
    }

    setIsProcessing(true);
    setShowPreview(false);

    try {
      // Stage 1: Upload File
      updateStage(0, "processing");
      await new Promise((resolve) => setTimeout(resolve, 800));

      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Uploading file:", file.name, file.type, file.size);

      const uploadRes = await fetch("/api/admin/books/intelligent-upload", {
        method: "POST",
        body: formData,
      });

      console.log("📡 Upload response status:", uploadRes.status);

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({ error: "Unknown error" }));
        console.error("❌ Upload failed:", errorData);
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      console.log("✅ Upload successful:", uploadData);
      
      updateStage(0, "complete", {
        fileUrl: uploadData.fileUrl,
        fileId: uploadData.fileId,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 2: Extract Content
      updateStage(1, "processing");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateStage(1, "complete", {
        totalPages: uploadData.totalPages,
        wordCount: uploadData.wordCount,
        contentPreview: uploadData.contentPreview,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 3: Analyze Metadata
      updateStage(2, "processing");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStage(2, "complete", {
        title: uploadData.extractedTitle,
        author: uploadData.extractedAuthor,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 4-11: AI Processing
      const aiRes = await fetch("/api/admin/books/ai-deep-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadData.fileId,
          title: uploadData.extractedTitle,
          author: uploadData.extractedAuthor,
          contentPreview: uploadData.contentPreview,
          totalPages: uploadData.totalPages,
          wordCount: uploadData.wordCount,
        }),
      });

      if (!aiRes.ok) {
        throw new Error("AI analysis failed");
      }

      const aiData = await aiRes.json();

      // Stage 4: Content Analysis
      updateStage(3, "processing");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateStage(3, "complete", {
        themes: aiData.themes,
        topics: aiData.topics,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 5: Description
      updateStage(4, "processing");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateStage(4, "complete", { description: aiData.description });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 6: Category
      updateStage(5, "processing");
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateStage(5, "complete", {
        category: aiData.category,
        confidence: aiData.categoryConfidence,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 7: Tags
      updateStage(6, "processing");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStage(6, "complete", { tags: aiData.tags });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 8: Audience
      updateStage(7, "processing");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      updateStage(7, "complete", {
        targetAudience: aiData.targetAudience,
        readingLevel: aiData.readingLevel,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 9: Pricing
      updateStage(8, "processing");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStage(8, "complete", {
        suggestedPrice: aiData.suggestedPrice,
        priceReasoning: aiData.priceReasoning,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 10: Cover
      updateStage(9, "processing");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateStage(9, "complete", {
        coverImage: aiData.coverImage || uploadData.extractedCover,
        coverSource: aiData.coverImage ? "ai-generated" : "extracted",
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 11: SEO
      updateStage(10, "processing");
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateStage(10, "complete", {
        metaTitle: aiData.metaTitle,
        metaDescription: aiData.metaDescription,
        slug: aiData.slug,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stage 12: Finalize
      updateStage(11, "processing");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const finalBookData = {
        title: uploadData.extractedTitle || aiData.title,
        author: uploadData.extractedAuthor || aiData.author,
        description: aiData.description,
        category: aiData.category,
        tags: aiData.tags,
        price: aiData.suggestedPrice,
        coverImage: aiData.coverImage || uploadData.extractedCover,
        fileUrl: uploadData.fileUrl,
        totalPages: uploadData.totalPages,
        wordCount: uploadData.wordCount,
        readingTime: Math.ceil(uploadData.wordCount / 200), // 200 words per minute
        targetAudience: aiData.targetAudience,
        readingLevel: aiData.readingLevel,
        themes: aiData.themes,
        topics: aiData.topics,
        metaTitle: aiData.metaTitle,
        metaDescription: aiData.metaDescription,
        slug: aiData.slug,
        priceReasoning: aiData.priceReasoning,
      };

      setBookData(finalBookData);
      setEditedData(finalBookData); // Initialize edited data
      updateStage(11, "complete", finalBookData);
      setShowPreview(true);

      toast.success("🎉 Book processed successfully! Review and publish.");

      // 🤖 AUTO-GENERATE FEED CONTENT IN BACKGROUND
      try {
        console.log("🤖 Triggering AI feed generation...");
        const feedResponse = await fetch(
          "/api/admin/books/generate-feed-content",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookId: uploadData.fileId,
              bookTitle: finalBookData.title,
              bookAuthor: finalBookData.author,
              bookDescription: finalBookData.description,
              contentPreview: uploadData.contentPreview,
              category: finalBookData.category,
            }),
          }
        );

        if (feedResponse.ok) {
          const feedData = await feedResponse.json();
          console.log(
            `✅ Generated ${feedData.posts?.length || 0} community posts!`
          );
          toast.success(
            `🔥 Bonus: ${
              feedData.posts?.length || 0
            } community posts auto-created!`
          );
        }
      } catch (feedError) {
        console.error("Feed generation error (non-critical):", feedError);
        // Don't fail the upload if feed generation fails
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process book. Please try again.");
      updateStage(currentStage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = () => {
    const dataToPublish = isEditing ? editedData : bookData;
    if (dataToPublish) {
      onComplete(dataToPublish);
      toast.success("📚 Book published successfully!");
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedData({ ...bookData });
    }
    setIsEditing(!isEditing);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && editedData) {
      setEditedData({
        ...editedData,
        tags: [...(editedData.tags || []), newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        tags: editedData.tags.filter((_: any, i: number) => i !== index),
      });
    }
  };

  const categories = [
    "Business",
    "Technology",
    "Self-Help",
    "Fiction",
    "Non-Fiction",
    "Science",
    "History",
    "Biography",
    "Health",
    "Cooking",
    "Art",
    "Travel",
    "Religion",
    "Philosophy",
    "Psychology",
    "Education",
    "Children",
    "Young Adult",
    "Romance",
    "Mystery",
    "Fantasy",
    "Science Fiction",
    "Horror",
  ];

  const progress = Math.round(
    (stages.filter((s) => s.status === "complete").length / stages.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!file && (
        <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700">
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={`
                cursor-pointer p-12 text-center rounded-lg transition-all
                ${
                  isDragActive
                    ? "bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-500"
                    : "bg-gray-50 dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-950/10"
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-16 w-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isDragActive
                  ? "📚 Drop your book here!"
                  : "🚀 Upload Your Book"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag & drop or click to select
                <br />
                <span className="text-sm">
                  Supports: PDF, DOCX, EPUB, TXT, MD
                </span>
              </p>
              <Button variant="outline" className="mt-2">
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Selected */}
      {file && !isProcessing && !showPreview && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              File Selected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="font-medium text-green-900 dark:text-green-100">
                {file.name}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={processBook}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                🚀 Process with AI
              </Button>
              <Button variant="outline" onClick={() => setFile(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Stages */}
      {isProcessing && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600 animate-pulse" />
              AI Processing Your Book...
            </CardTitle>
            <CardDescription>
              Sit back and relax! Our AI is doing all the heavy lifting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Stages */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.id}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg transition-all
                      ${
                        stage.status === "processing"
                          ? "bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-500"
                          : ""
                      }
                      ${
                        stage.status === "complete"
                          ? "bg-green-50 dark:bg-green-950/20"
                          : ""
                      }
                      ${
                        stage.status === "error"
                          ? "bg-red-50 dark:bg-red-950/20"
                          : ""
                      }
                      ${stage.status === "pending" ? "opacity-50" : ""}
                    `}
                  >
                    <div className="mt-0.5">
                      {stage.status === "pending" && (
                        <Icon className="h-5 w-5 text-gray-400" />
                      )}
                      {stage.status === "processing" && (
                        <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                      )}
                      {stage.status === "complete" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {stage.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          stage.status === "processing"
                            ? "text-purple-900 dark:text-purple-100"
                            : ""
                        }`}
                      >
                        {stage.label}
                      </p>
                      {stage.result && stage.status === "complete" && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {stage.id === "extract" &&
                            `${
                              stage.result.totalPages
                            } pages • ${stage.result.wordCount?.toLocaleString()} words`}
                          {stage.id === "metadata" &&
                            `${stage.result.title} by ${stage.result.author}`}
                          {stage.id === "category" &&
                            `${stage.result.category} (${stage.result.confidence}% confidence)`}
                          {stage.id === "tags" &&
                            stage.result.tags?.slice(0, 3).join(", ")}
                          {stage.id === "pricing" &&
                            `$${stage.result.suggestedPrice}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview & Publish */}
      {showPreview && bookData && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  🎉 Book Processed Successfully!
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Edit the AI-generated data below"
                    : "Review the AI-generated data below and publish your book"}
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={handleEditToggle}
                className={isEditing ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                {isEditing ? "Done Editing" : "✏️ Edit Details"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Mode */}
            {!isEditing && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  {/* Cover */}
                  {bookData.coverImage && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cover Image</label>
                      <img
                        src={bookData.coverImage}
                        alt="Book cover"
                        className="w-full rounded-lg shadow-lg"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Title
                      </label>
                      <p className="text-lg font-bold">{bookData.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Author
                      </label>
                      <p className="font-medium">{bookData.author}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Category
                      </label>
                      <p className="font-medium">{bookData.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Price
                      </label>
                      <p className="text-2xl font-bold text-green-600">
                        ${bookData.price}
                      </p>
                      {bookData.priceReasoning && (
                        <p className="text-xs text-gray-500 mt-1">
                          {bookData.priceReasoning}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Pages / Reading Time
                      </label>
                      <p>
                        {bookData.totalPages} pages • ~{bookData.readingTime}{" "}
                        min read
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </label>
                  <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {bookData.description}
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {bookData.tags?.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Target Audience
                  </label>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {bookData.targetAudience}
                  </p>
                </div>
              </>
            )}

            {/* Edit Mode */}
            {isEditing && editedData && (
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>

                {/* Author */}
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={editedData.author}
                    onChange={(e) =>
                      handleFieldChange("author", e.target.value)
                    }
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editedData.category}
                    onValueChange={(value) =>
                      handleFieldChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editedData.price}
                    onChange={(e) =>
                      handleFieldChange("price", parseFloat(e.target.value))
                    }
                    className="text-xl font-bold"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    rows={8}
                    className="font-normal"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editedData.tags?.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(index)}
                          className="hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    value={editedData.targetAudience}
                    onChange={(e) =>
                      handleFieldChange("targetAudience", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                {/* Pages & Reading Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalPages">Total Pages</Label>
                    <Input
                      id="totalPages"
                      type="number"
                      value={editedData.totalPages}
                      onChange={(e) =>
                        handleFieldChange(
                          "totalPages",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readingTime">Reading Time (min)</Label>
                    <Input
                      id="readingTime"
                      type="number"
                      value={editedData.readingTime}
                      onChange={(e) =>
                        handleFieldChange(
                          "readingTime",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handlePublish}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />✅ Publish Book
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setBookData(null);
                  setEditedData(null);
                  setShowPreview(false);
                  setIsEditing(false);
                  setStages(
                    stages.map((s) => ({
                      ...s,
                      status: "pending",
                      result: undefined,
                    }))
                  );
                }}
                size="lg"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
