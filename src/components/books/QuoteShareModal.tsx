"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

interface QuoteCardProps {
  selectedText: string;
  bookTitle: string;
  authorName: string;
  onClose: () => void;
}

type TemplateStyle = "minimalist" | "bold" | "vintage" | "modern" | "elegant";

const templates: Record<TemplateStyle, {
  name: string;
  icon: string;
  bg: string;
  text: string;
  accent: string;
  border: string;
  font: string;
}> = {
  minimalist: {
    name: "✨ Minimalist",
    icon: "✨",
    bg: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    text: "#2d3748",
    accent: "#4a5568",
    border: "#e2e8f0",
    font: "font-serif",
  },
  bold: {
    name: "💥 Bold",
    icon: "💥",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    text: "#ffffff",
    accent: "#f6e05e",
    border: "#ffffff",
    font: "font-bold",
  },
  vintage: {
    name: "📜 Vintage",
    icon: "📜",
    bg: "linear-gradient(135deg, #f4ecd8 0%, #d4c5ad 100%)",
    text: "#5f4b32",
    accent: "#8b7355",
    border: "#d4c5ad",
    font: "font-serif",
  },
  modern: {
    name: "🎨 Modern",
    icon: "🎨",
    bg: "linear-gradient(135deg, #000000 0%, #434343 100%)",
    text: "#ffffff",
    accent: "#a855f7",
    border: "#a855f7",
    font: "font-sans",
  },
  elegant: {
    name: "👑 Elegant",
    icon: "👑",
    bg: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    text: "#4a5568",
    accent: "#ed8936",
    border: "#fed7d7",
    font: "font-serif italic",
  },
};

export default function QuoteShareModal({
  selectedText,
  bookTitle,
  authorName,
  onClose,
}: QuoteCardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>("minimalist");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const currentTemplate = templates[selectedTemplate];

  // Generate and download image
  const handleDownload = async () => {
    setIsGenerating(true);
    const cardElement = document.getElementById("quote-card");
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `quote-${bookTitle.slice(0, 20)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopyImage = async () => {
    setIsGenerating(true);
    const cardElement = document.getElementById("quote-card");
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }
      });
    } catch (error) {
      console.error("Error copying image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Share via Web Share API
  const handleShare = async () => {
    setIsGenerating(true);
    const cardElement = document.getElementById("quote-card");
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `quote-${bookTitle}.png`, {
            type: "image/png",
          });

          await navigator.share({
            title: `Quote from ${bookTitle}`,
            text: selectedText,
            files: [file],
          });
        }
      });
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy text only
  const handleCopyText = () => {
    navigator.clipboard.writeText(`"${selectedText}"\n\n— ${bookTitle} by ${authorName}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-3xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Share Your Favorite Quote</h2>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="p-6 space-y-6">
            {/* Template Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose a Style
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(Object.keys(templates) as TemplateStyle[]).map((template) => (
                  <motion.button
                    key={template}
                    onClick={() => setSelectedTemplate(template)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTemplate === template
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{templates[template].icon}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {templates[template].name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview Card */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview
              </h3>
              <div className="flex justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div
                  id="quote-card"
                  className={`relative w-full max-w-2xl aspect-square rounded-3xl shadow-2xl overflow-hidden ${currentTemplate.font}`}
                  style={{
                    background: currentTemplate.bg,
                  }}
                >
                  {/* Decorative Border */}
                  <div
                    className="absolute inset-4 rounded-2xl"
                    style={{
                      border: `3px solid ${currentTemplate.border}`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                    {/* Opening Quote */}
                    <div
                      className="text-6xl mb-6 opacity-30"
                      style={{ color: currentTemplate.accent }}
                    >
                      "
                    </div>

                    {/* Quote Text */}
                    <p
                      className="text-2xl md:text-3xl leading-relaxed mb-8"
                      style={{ color: currentTemplate.text }}
                    >
                      {selectedText}
                    </p>

                    {/* Closing Quote */}
                    <div
                      className="text-6xl mb-8 opacity-30"
                      style={{ color: currentTemplate.accent }}
                    >
                      "
                    </div>

                    {/* Book Info */}
                    <div className="space-y-2">
                      <div
                        className="text-xl font-bold"
                        style={{ color: currentTemplate.accent }}
                      >
                        {bookTitle}
                      </div>
                      <div
                        className="text-lg opacity-80"
                        style={{ color: currentTemplate.text }}
                      >
                        by {authorName}
                      </div>
                    </div>

                    {/* Watermark */}
                    <div
                      className="absolute bottom-6 right-6 text-sm opacity-50"
                      style={{ color: currentTemplate.text }}
                    >
                      Dynasty Academy
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <motion.button
                onClick={handleDownload}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Download className="w-5 h-5" />
                Download
              </motion.button>

              <motion.button
                onClick={handleCopyImage}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Image
                  </>
                )}
              </motion.button>

              {typeof navigator !== 'undefined' && navigator.share !== undefined && (
                <motion.button
                  onClick={handleShare}
                  disabled={isGenerating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </motion.button>
              )}

              <motion.button
                onClick={handleCopyText}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Copy className="w-5 h-5" />
                Copy Text
              </motion.button>
            </div>

            {/* Tips */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>💡 Pro Tips:</strong> Download and share on social media to spread wisdom! 
                  Use hashtags like #DynastyAcademy #{bookTitle.replace(/\s+/g, '')} to reach more readers.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
