"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Upload,
  Palette,
  Type,
  Sliders,
  Image as ImageIcon,
  Wand2,
} from "lucide-react";

interface QuoteCardProps {
  selectedText: string;
  bookTitle: string;
  authorName: string;
  onClose: () => void;
}

type TemplateStyle =
  | "minimalist"
  | "bold"
  | "vintage"
  | "modern"
  | "elegant"
  | "neon"
  | "gold"
  | "ocean"
  | "forest"
  | "sunset";

type ExportFormat = "square" | "story" | "twitter" | "linkedin" | "custom";

type FontFamily =
  | "serif"
  | "sans"
  | "mono"
  | "script"
  | "display"
  | "handwritten";

const templates: Record<
  TemplateStyle,
  {
    name: string;
    icon: string;
    bg: string;
    text: string;
    accent: string;
    border: string;
    font: string;
  }
> = {
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
  neon: {
    name: "⚡ Neon Cyber",
    icon: "⚡",
    bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    text: "#00ffff",
    accent: "#ff00ff",
    border: "#00ffff",
    font: "font-bold",
  },
  gold: {
    name: "💰 Gold Luxury",
    icon: "💰",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
    text: "#ffd700",
    accent: "#ffed4e",
    border: "#ffd700",
    font: "font-serif",
  },
  ocean: {
    name: "🌊 Ocean Wave",
    icon: "🌊",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    text: "#ffffff",
    accent: "#e0f7fa",
    border: "#80deea",
    font: "font-sans",
  },
  forest: {
    name: "🌲 Forest Zen",
    icon: "🌲",
    bg: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    text: "#ffffff",
    accent: "#a8e6cf",
    border: "#a8e6cf",
    font: "font-serif",
  },
  sunset: {
    name: "🌅 Sunset Glow",
    icon: "🌅",
    bg: "linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ee5a6f 100%)",
    text: "#ffffff",
    accent: "#ffe66d",
    border: "#ffffff",
    font: "font-sans",
  },
};

const exportFormats: Record<
  ExportFormat,
  { name: string; width: number; height: number; icon: string }
> = {
  square: {
    name: "📱 Instagram Square",
    width: 1080,
    height: 1080,
    icon: "📱",
  },
  story: { name: "📲 Instagram Story", width: 1080, height: 1920, icon: "📲" },
  twitter: { name: "🐦 Twitter Card", width: 1200, height: 675, icon: "🐦" },
  linkedin: { name: "💼 LinkedIn Post", width: 1200, height: 627, icon: "💼" },
  custom: { name: "⚙️ Custom Size", width: 1080, height: 1080, icon: "⚙️" },
};

const fontFamilies: Record<FontFamily, { name: string; className: string }> = {
  serif: { name: "Serif Classic", className: "font-serif" },
  sans: { name: "Sans Modern", className: "font-sans" },
  mono: { name: "Mono Code", className: "font-mono" },
  script: { name: "Script Elegant", className: "font-serif italic" },
  display: { name: "Display Bold", className: "font-bold" },
  handwritten: { name: "Handwritten", className: "font-serif" },
};

export default function QuoteShareModal({
  selectedText,
  bookTitle,
  authorName,
  onClose,
}: QuoteCardProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateStyle>("minimalist");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // New customization states
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState<FontFamily>("serif");
  const [textColor, setTextColor] = useState<string>("");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  const [blurIntensity, setBlurIntensity] = useState(0);
  const [shadowIntensity, setShadowIntensity] = useState(20);
  const [borderStyle, setBorderStyle] = useState<
    "none" | "solid" | "double" | "gradient"
  >("none");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("square");
  const [showCustomization, setShowCustomization] = useState(false);
  const [showFormatSelector, setShowFormatSelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTemplate = templates[selectedTemplate];
  const currentFormat = exportFormats[exportFormat];
  const displayTextColor = textColor || currentTemplate.text;

  // Handle custom background upload
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBg(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate and download image
  const handleDownload = async () => {
    setIsGenerating(true);
    const cardElement = document.getElementById("quote-card");
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 3, // Ultra-high quality
        logging: false,
        width: currentFormat.width,
        height: currentFormat.height,
      });

      const link = document.createElement("a");
      link.download = `dynasty-quote-${bookTitle.slice(
        0,
        20
      )}-${Date.now()}.png`;
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
        scale: 3,
        logging: false,
        width: currentFormat.width,
        height: currentFormat.height,
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
        scale: 3,
        logging: false,
        width: currentFormat.width,
        height: currentFormat.height,
      });

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `dynasty-quote-${bookTitle}.png`, {
            type: "image/png",
          });

          await navigator.share({
            title: `Quote from ${bookTitle}`,
            text: `"${selectedText}"\n\n— ${bookTitle} | Dynasty Academy`,
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
    navigator.clipboard.writeText(
      `"${selectedText}"\n\n— ${bookTitle} by ${authorName}`
    );
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
            {/* Template Selection - Now with 10 Templates! */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Choose a Style (10 Templates)
                </h3>
                <motion.button
                  onClick={() => setShowCustomization(!showCustomization)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold"
                >
                  <Sliders className="w-4 h-4" />
                  {showCustomization ? "Hide" : "Customize"}
                </motion.button>
              </div>
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
                    <div className="text-3xl mb-2">
                      {templates[template].icon}
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {templates[template].name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Advanced Customization Panel */}
            <AnimatePresence>
              {showCustomization && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-700 space-y-6">
                    {/* Custom Background Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Custom Background Image
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBgUpload}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => fileInputRef.current?.click()}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
                        >
                          Upload Image
                        </motion.button>
                        {customBg && (
                          <motion.button
                            onClick={() => setCustomBg(null)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                          >
                            Clear
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="48"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* Font Family */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">
                        Font Family
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(fontFamilies) as FontFamily[]).map(
                          (font) => (
                            <motion.button
                              key={font}
                              onClick={() => setFontFamily(font)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                fontFamily === font
                                  ? "bg-purple-500 text-white"
                                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {fontFamilies[font].name}
                            </motion.button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Text Color Picker */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Text Color (Optional - uses template default if empty)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={textColor || currentTemplate.text}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-16 h-10 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          placeholder={currentTemplate.text}
                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        />
                        {textColor && (
                          <motion.button
                            onClick={() => setTextColor("")}
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
                          >
                            Reset
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">
                        Text Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["left", "center", "right"] as const).map((align) => (
                          <motion.button
                            key={align}
                            onClick={() => setTextAlign(align)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                              textAlign === align
                                ? "bg-purple-500 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {align}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Effects */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Blur Intensity */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900 dark:text-white">
                          Blur: {blurIntensity}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={blurIntensity}
                          onChange={(e) =>
                            setBlurIntensity(Number(e.target.value))
                          }
                          className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>

                      {/* Shadow Intensity */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900 dark:text-white">
                          Shadow: {shadowIntensity}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={shadowIntensity}
                          onChange={(e) =>
                            setShadowIntensity(Number(e.target.value))
                          }
                          className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>
                    </div>

                    {/* Border Style */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">
                        Border Style
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["none", "solid", "double", "gradient"] as const).map(
                          (border) => (
                            <motion.button
                              key={border}
                              onClick={() => setBorderStyle(border)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                borderStyle === border
                                  ? "bg-purple-500 text-white"
                                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {border}
                            </motion.button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Export Format */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Export Format: {currentFormat.name}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(Object.keys(exportFormats) as ExportFormat[]).map(
                          (format) => (
                            <motion.button
                              key={format}
                              onClick={() => setExportFormat(format)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                exportFormat === format
                                  ? "bg-purple-500 text-white"
                                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {exportFormats[format].name}
                            </motion.button>
                          )
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {currentFormat.width} × {currentFormat.height}px
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Card - Now with ALL customizations */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview
              </h3>
              <div className="flex justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div
                  id="quote-card"
                  className={`relative rounded-3xl shadow-2xl overflow-hidden ${fontFamilies[fontFamily].className}`}
                  style={{
                    width: `${Math.min(currentFormat.width, 500)}px`,
                    height: `${Math.min(currentFormat.height, 500)}px`,
                    maxWidth: "100%",
                    aspectRatio: `${currentFormat.width} / ${currentFormat.height}`,
                  }}
                >
                  {/* Background Layer with Blur */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: customBg
                        ? `url(${customBg}) center/cover`
                        : currentTemplate.bg,
                      filter:
                        blurIntensity > 0 ? `blur(${blurIntensity}px)` : "none",
                    }}
                  />

                  {/* Background Overlay for Custom Images */}
                  {customBg && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "rgba(0, 0, 0, 0.4)",
                      }}
                    />
                  )}

                  {/* Decorative Border */}
                  {borderStyle !== "none" && (
                    <div
                      className="absolute inset-4 rounded-2xl"
                      style={{
                        border:
                          borderStyle === "solid"
                            ? `3px solid ${currentTemplate.border}`
                            : borderStyle === "double"
                            ? `6px double ${currentTemplate.border}`
                            : borderStyle === "gradient"
                            ? "3px solid transparent"
                            : "none",
                        backgroundImage:
                          borderStyle === "gradient"
                            ? `linear-gradient(white, white), ${currentTemplate.bg}`
                            : "none",
                        backgroundOrigin: "border-box",
                        backgroundClip:
                          borderStyle === "gradient"
                            ? "padding-box, border-box"
                            : "border-box",
                      }}
                    />
                  )}

                  {/* Content */}
                  <div
                    className="relative h-full flex flex-col items-center justify-center px-8 md:px-12 py-12"
                    style={{
                      textAlign: textAlign,
                      textShadow:
                        shadowIntensity > 0
                          ? `0 ${shadowIntensity}px ${
                              shadowIntensity * 2
                            }px rgba(0,0,0,0.3)`
                          : "none",
                    }}
                  >
                    {/* Opening Quote */}
                    <div
                      className="mb-4 opacity-30"
                      style={{
                        color: currentTemplate.accent,
                        fontSize: `${fontSize * 2.5}px`,
                      }}
                    >
                      "
                    </div>

                    {/* Quote Text */}
                    <p
                      className="leading-relaxed mb-6"
                      style={{
                        color: displayTextColor,
                        fontSize: `${fontSize}px`,
                        lineHeight: "1.6",
                      }}
                    >
                      {selectedText}
                    </p>

                    {/* Closing Quote */}
                    <div
                      className="mb-6 opacity-30"
                      style={{
                        color: currentTemplate.accent,
                        fontSize: `${fontSize * 2.5}px`,
                      }}
                    >
                      "
                    </div>

                    {/* Book Title */}
                    <div className="space-y-2">
                      <div
                        className="font-bold"
                        style={{
                          color: currentTemplate.accent,
                          fontSize: `${fontSize * 0.75}px`,
                        }}
                      >
                        {bookTitle}
                      </div>
                      <div
                        className="text-sm opacity-80"
                        style={{
                          color: displayTextColor,
                          fontSize: `${fontSize * 0.6}px`,
                        }}
                      >
                        {authorName}
                      </div>

                      {/* Dynasty Watermark */}
                      <div
                        className="mt-4 pt-4 border-t"
                        style={{ borderColor: currentTemplate.border }}
                      >
                        <div
                          className="font-semibold flex items-center justify-center gap-2"
                          style={{
                            color: currentTemplate.accent,
                            fontSize: `${fontSize * 0.65}px`,
                          }}
                        >
                          <Sparkles className="w-4 h-4" />
                          Dynasty Academy
                        </div>
                      </div>
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

              {typeof navigator !== "undefined" &&
                navigator.share !== undefined && (
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

            {/* Tips - Updated for ALL features */}
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-3">
                <Wand2 className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-bold text-lg text-purple-600 dark:text-purple-400 mb-3">
                    🎨 You Now Have a COMPLETE Content Creation Studio!
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">✨</span>
                      <span>
                        <strong>10 Luxury Templates:</strong> From Minimalist to
                        Neon Cyber - every aesthetic covered!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">🖼️</span>
                      <span>
                        <strong>Custom Backgrounds:</strong> Upload YOUR images
                        for ultimate personalization!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">🎭</span>
                      <span>
                        <strong>Full Typography Control:</strong> 6 fonts,
                        custom colors, sizes 16-48px!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">✨</span>
                      <span>
                        <strong>Professional Effects:</strong> Blur, shadows, 4
                        border styles - Hollywood quality!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">📱</span>
                      <span>
                        <strong>5 Export Formats:</strong> Instagram, Twitter,
                        LinkedIn - optimized for every platform!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">🚀</span>
                      <span>
                        <strong>Ultra-HD Export:</strong> 3x resolution
                        (3240×3240px) for crystal-clear quality!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">💎</span>
                      <span>
                        <strong>Pro Tip:</strong> Use #DynastyAcademy #
                        {bookTitle.replace(/\s+/g, "")} to go VIRAL!
                      </span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600">
                    <p className="font-semibold text-purple-600 dark:text-purple-400">
                      🎯 Every shared quote = FREE marketing for Dynasty
                      Academy!
                    </p>
                    <p className="text-xs mt-1">
                      Your readers become content creators. Their followers
                      become YOUR readers. Exponential growth! 📈🚀
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
