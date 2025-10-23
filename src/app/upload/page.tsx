"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  BookOpen,
  Check,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadedBook {
  id: string;
  title: string;
  author: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  coverUrl?: string;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
}

export default function BookUploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedBooks, setUploadedBooks] = useState<UploadedBook[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to API
      const response = await fetch("/api/books/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(90);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      setUploadProgress(100);

      // Add uploaded book to the list
      const newBook: UploadedBook = {
        id: result.book.id,
        title: result.book.title,
        author: result.book.author,
        fileName: result.book.fileName,
        fileSize: result.book.fileSize,
        pageCount: result.book.totalPages,
        coverUrl: result.book.coverImage,
        uploadedAt: new Date(),
        status: "ready",
      };

      setUploadedBooks((prev) => [newBook, ...prev]);

      // Show success for a moment, then reset
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload book. Please try again."
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/epub+zip" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword" ||
        file.type === "text/plain" ||
        file.type === "text/markdown" ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".epub") ||
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".doc") ||
        file.name.toLowerCase().endsWith(".md") ||
        file.name.toLowerCase().endsWith(".markdown") ||
        file.name.toLowerCase().endsWith(".txt")
    );

    if (validFiles.length > 0) {
      await processFile(validFiles[0]);
    }
  }, []);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    },
    []
  );

  const handleReadBook = (bookId: string) => {
    // Navigate to library where user can read their uploaded book
    router.push(`/library`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Upload className="w-10 h-10 text-purple-400" />
            Upload Your Books
          </h1>
          <p className="text-purple-300">
            Upload any document format and read them in stunning 3D! 📚✨
          </p>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 mb-8"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Your Books. Our 3D Magic. 🪄
              </h3>
              <p className="text-purple-300 text-sm leading-relaxed">
                Upload your personal library and experience them like never
                before! Get 3D page-turning, ambient modes, AI summaries, and
                all premium features for YOUR books. This feature alone is worth{" "}
                <span className="text-green-400 font-semibold">$50/month</span>{" "}
                — included FREE! 🎁
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-3xl p-12 transition-all ${
              isDragging
                ? "border-purple-500 bg-purple-500/10 scale-105"
                : "border-purple-500/30 bg-white/5 hover:border-purple-500/50"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.epub,.docx,.doc,.md,.markdown,.txt"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />

            <div className="text-center pointer-events-none">
              {isUploading ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
                  <p className="text-white font-semibold mb-2">
                    Processing your book...
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
                      />
                    </div>
                    <p className="text-purple-300 text-sm mt-2">
                      {uploadProgress}% complete
                    </p>
                  </div>
                </motion.div>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {isDragging ? "Drop your book here!" : "Upload Your Book"}
                  </h3>
                  <p className="text-purple-300 mb-4">
                    Drag & drop or click to browse
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-purple-400">
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full">
                      PDF
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full">
                      EPUB
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full">
                      DOCX
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full">
                      MD
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full">
                      TXT
                    </span>
                  </div>
                  <p className="text-purple-400/60 text-xs mt-4">
                    Max file size: 50MB • Supports PDF, EPUB, DOCX, DOC,
                    Markdown & TXT
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Uploaded Books Library */}
        {uploadedBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-purple-400" />
              Your Uploaded Library ({uploadedBooks.length})
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group"
                >
                  {/* Book Cover Placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                    <FileText className="w-16 h-16 text-purple-300/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-sm truncate">
                        {book.title}
                      </p>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">
                      {book.title}
                    </h3>
                    <p className="text-purple-300 text-sm mb-2">
                      {book.author}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-purple-400">
                      <span>{book.pageCount} pages</span>
                      <span>•</span>
                      <span>{formatFileSize(book.fileSize)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    {book.status === "ready" ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <Check className="w-4 h-4" />
                        <span className="font-semibold">Ready to read</span>
                      </div>
                    ) : book.status === "processing" ? (
                      <div className="flex items-center gap-2 text-amber-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-semibold">Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold">Upload failed</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReadBook(book.id)}
                      disabled={book.status !== "ready"}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        book.status === "ready"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                          : "bg-white/10 text-purple-400 cursor-not-allowed"
                      }`}
                    >
                      Read in 3D ✨
                    </button>
                  </div>

                  {/* Uploaded Date */}
                  <p className="text-xs text-purple-400/60 mt-3 text-center">
                    Uploaded {new Date(book.uploadedAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {uploadedBooks.length === 0 && !isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
            <p className="text-purple-300">
              No books uploaded yet. Start by uploading your first book! 📖
            </p>
          </motion.div>
        )}

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            What You Get With Uploaded Books 🚀
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">3D Reading</h4>
              <p className="text-purple-300 text-sm">
                Physics-based page turning in 3D space
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-pink-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">AI Summaries</h4>
              <p className="text-purple-300 text-sm">
                Auto-generated chapter summaries
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">
                Smart Highlights
              </h4>
              <p className="text-purple-300 text-sm">
                AI suggests important passages
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">All Features</h4>
              <p className="text-purple-300 text-sm">
                Ambient modes, analytics, & more!
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-purple-300 text-sm">
              <span className="text-green-400 font-semibold">
                $50/month value
              </span>{" "}
              included FREE in your Premium subscription! 🎁
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
