"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import {
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
  Save,
  FolderOpen,
  Video,
  Film,
  LayoutGrid,
  ArrowLeft,
  Plus,
  Trash2,
  Star,
  Heart,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

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
  | "sunset"
  | "cyberpunk"
  | "watercolor"
  | "filmnoir"
  | "marble"
  | "tokyo"
  | "retrofilm"
  | "rainbow"
  | "moonlight"
  | "fireice"
  | "holographic";

type ExportFormat = "square" | "story" | "twitter" | "linkedin" | "custom";
type FontFamily =
  | "serif"
  | "sans"
  | "mono"
  | "script"
  | "display"
  | "handwritten";

interface QuotePreset {
  id: string;
  name: string;
  quote: string;
  bookTitle: string;
  author: string;
  template: TemplateStyle;
  customBg: string | null;
  fontSize: number;
  fontFamily: FontFamily;
  textColor: string;
  textAlign: "left" | "center" | "right";
  blurIntensity: number;
  shadowIntensity: number;
  borderStyle: "none" | "solid" | "double" | "gradient";
  stickers: string[];
  createdAt: Date;
  isFavorite: boolean;
}

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
  cyberpunk: {
    name: "🌌 Cyberpunk",
    icon: "🌌",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    text: "#00d9ff",
    accent: "#ff00ff",
    border: "#00d9ff",
    font: "font-bold",
  },
  watercolor: {
    name: "🎨 Watercolor",
    icon: "🎨",
    bg: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 33%, #74b9ff 66%, #a29bfe 100%)",
    text: "#2d3436",
    accent: "#fd79a8",
    border: "#dfe6e9",
    font: "font-serif",
  },
  filmnoir: {
    name: "🎬 Film Noir",
    icon: "🎬",
    bg: "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)",
    text: "#ffffff",
    accent: "#cccccc",
    border: "#666666",
    font: "font-serif italic",
  },
  marble: {
    name: "💎 Marble",
    icon: "💎",
    bg: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #e8e8e8 100%)",
    text: "#2c3e50",
    accent: "#d4af37",
    border: "#d4af37",
    font: "font-serif",
  },
  tokyo: {
    name: "🗾 Neon Tokyo",
    icon: "🗾",
    bg: "linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)",
    text: "#ffffff",
    accent: "#ffbe0b",
    border: "#ff006e",
    font: "font-bold",
  },
  retrofilm: {
    name: "📸 Retro Film",
    icon: "📸",
    bg: "linear-gradient(135deg, #f4a261 0%, #e76f51 50%, #264653 100%)",
    text: "#f1faee",
    accent: "#a8dadc",
    border: "#f1faee",
    font: "font-serif",
  },
  rainbow: {
    name: "🌈 Rainbow",
    icon: "🌈",
    bg: "linear-gradient(135deg, #ff0844 0%, #ffb199 20%, #ffe066 40%, #93ff93 60%, #66b3ff 80%, #cc66ff 100%)",
    text: "#ffffff",
    accent: "#ffe066",
    border: "#ffffff",
    font: "font-bold",
  },
  moonlight: {
    name: "🌙 Moonlight",
    icon: "🌙",
    bg: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    text: "#e0f7fa",
    accent: "#80deea",
    border: "#4dd0e1",
    font: "font-serif",
  },
  fireice: {
    name: "🔥 Fire & Ice",
    icon: "🔥",
    bg: "linear-gradient(135deg, #ff4e50 0%, #fc913a 25%, #f9d423 50%, #00f2fe 75%, #4facfe 100%)",
    text: "#ffffff",
    accent: "#ffe66d",
    border: "#ffffff",
    font: "font-bold",
  },
  holographic: {
    name: "✨ Holographic",
    icon: "✨",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 40%, #4facfe 60%, #00f2fe 80%, #43e97b 100%)",
    text: "#ffffff",
    accent: "#f9f9f9",
    border: "#ffffff",
    font: "font-sans",
  },
};

const fontFamilies: Record<FontFamily, { name: string; className: string }> = {
  serif: { name: "Serif Classic", className: "font-serif" },
  sans: { name: "Sans Modern", className: "font-sans" },
  mono: { name: "Mono Code", className: "font-mono" },
  script: { name: "Script Elegant", className: "font-serif italic" },
  display: { name: "Display Bold", className: "font-bold" },
  handwritten: { name: "Handwritten", className: "font-serif" },
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

export default function QuoteStudioPage() {
  // Quote Content
  const [quote, setQuote] = useState(
    "The only way to do great work is to love what you do."
  );
  const [bookTitle, setBookTitle] = useState("Steve Jobs");
  const [author, setAuthor] = useState("Walter Isaacson");

  // Template & Style
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateStyle>("minimalist");
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState<FontFamily>("serif");
  const [textColor, setTextColor] = useState<string>("");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center"
  );

  // Effects
  const [blurIntensity, setBlurIntensity] = useState(0);
  const [shadowIntensity, setShadowIntensity] = useState(20);
  const [borderStyle, setBorderStyle] = useState<
    "none" | "solid" | "double" | "gradient"
  >("none");

  // Export
  const [exportFormat, setExportFormat] = useState<ExportFormat>("square");

  // Stickers
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<
    "content" | "style" | "effects" | "stickers" | "export"
  >("content");
  const [savedPresets, setSavedPresets] = useState<QuotePreset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stickerLibrary = {
    decorative: ["✨", "💫", "⭐", "🌟", "💎", "👑", "🏆", "🎯"],
    nature: ["🌸", "🌺", "🌻", "🌹", "🍃", "🌿", "🌱", "🦋"],
    hearts: ["❤️", "💕", "💖", "💗", "💙", "💚", "💛", "🧡"],
    symbols: ["🔥", "⚡", "💥", "🎨", "📚", "✍️", "🎭", "🎪"],
  };

  const currentTemplate = templates[selectedTemplate];
  const currentFormat = exportFormats[exportFormat];
  const displayTextColor = textColor || currentTemplate.text;

  // Load saved presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dynasty-quote-presets");
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading presets:", e);
      }
    }
  }, []);

  // Save preset
  const savePreset = () => {
    const preset: QuotePreset = {
      id: Date.now().toString(),
      name: `${bookTitle} - ${new Date().toLocaleDateString()}`,
      quote,
      bookTitle,
      author,
      template: selectedTemplate,
      customBg,
      fontSize,
      fontFamily,
      textColor,
      textAlign,
      blurIntensity,
      shadowIntensity,
      borderStyle,
      stickers: selectedStickers,
      createdAt: new Date(),
      isFavorite: false,
    };

    const updated = [preset, ...savedPresets];
    setSavedPresets(updated);
    localStorage.setItem("dynasty-quote-presets", JSON.stringify(updated));
  };

  // Load preset
  const loadPreset = (preset: QuotePreset) => {
    setQuote(preset.quote);
    setBookTitle(preset.bookTitle);
    setAuthor(preset.author);
    setSelectedTemplate(preset.template);
    setCustomBg(preset.customBg);
    setFontSize(preset.fontSize);
    setFontFamily(preset.fontFamily);
    setTextColor(preset.textColor);
    setTextAlign(preset.textAlign);
    setBlurIntensity(preset.blurIntensity);
    setShadowIntensity(preset.shadowIntensity);
    setBorderStyle(preset.borderStyle);
    setSelectedStickers(preset.stickers);
  };

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
    const cardElement = document.getElementById("quote-card-preview");
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 3,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-6 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                Quote Studio
              </h1>
              <p className="text-sm opacity-90">
                Create viral-worthy quote cards in seconds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={savePreset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Preset
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-6 h-6" />
              Controls
            </h2>

            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "content", icon: Type, label: "Content" },
                { id: "style", icon: Palette, label: "Style" },
                { id: "effects", icon: Wand2, label: "Effects" },
                { id: "stickers", icon: Sparkles, label: "Stickers" },
                { id: "export", icon: Download, label: "Export" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Quote Text
                    </label>
                    <textarea
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your favorite quote..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Book Title
                    </label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === "style" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Template (20 Options)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {(Object.keys(templates) as TemplateStyle[]).map(
                        (template) => (
                          <motion.button
                            key={template}
                            onClick={() => setSelectedTemplate(template)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedTemplate === template
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="text-2xl mb-1">
                              {templates[template].icon}
                            </div>
                            <div className="text-[10px] font-medium text-gray-900 dark:text-white">
                              {templates[template].name}
                            </div>
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {(Object.keys(fontFamilies) as FontFamily[]).map(
                        (font) => (
                          <option key={font} value={font}>
                            {fontFamilies[font].name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => setTextAlign(align)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${
                            textAlign === align
                              ? "bg-purple-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "effects" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Blur: {blurIntensity}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blurIntensity}
                      onChange={(e) => setBlurIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Border Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["none", "solid", "double", "gradient"] as const).map(
                        (border) => (
                          <button
                            key={border}
                            onClick={() => setBorderStyle(border)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${
                              borderStyle === border
                                ? "bg-purple-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            {border}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Custom Background
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBgUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium"
                      >
                        Upload Image
                      </button>
                      {customBg && (
                        <button
                          onClick={() => setCustomBg(null)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "stickers" && (
                <div className="space-y-4">
                  {Object.entries(stickerLibrary).map(([category, stickers]) => (
                    <div key={category}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                        {category}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {stickers.map((sticker) => (
                          <button
                            key={sticker}
                            onClick={() => {
                              if (selectedStickers.includes(sticker)) {
                                setSelectedStickers(
                                  selectedStickers.filter((s) => s !== sticker)
                                );
                              } else {
                                setSelectedStickers([
                                  ...selectedStickers,
                                  sticker,
                                ]);
                              }
                            }}
                            className={`text-2xl p-2 rounded-lg ${
                              selectedStickers.includes(sticker)
                                ? "bg-purple-500 ring-2 ring-purple-300"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            {sticker}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {selectedStickers.length > 0 && (
                    <button
                      onClick={() => setSelectedStickers([])}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold"
                    >
                      Clear All ({selectedStickers.length})
                    </button>
                  )}
                </div>
              )}

              {activeTab === "export" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Export Format
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(exportFormats) as ExportFormat[]).map(
                        (format) => (
                          <button
                            key={format}
                            onClick={() => setExportFormat(format)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              exportFormat === format
                                ? "bg-purple-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            {exportFormats[format].name}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button
                      onClick={handleDownload}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      Download PNG
                    </button>

                    <button
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>

                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold opacity-50"
                    >
                      <Video className="w-5 h-5" />
                      Export MP4 (Coming Soon!)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Preview */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Live Preview
            </h2>
            <div className="flex justify-center">
              <div
                id="quote-card-preview"
                className={`relative rounded-3xl shadow-2xl overflow-hidden ${fontFamilies[fontFamily].className}`}
                style={{
                  width: `${Math.min(currentFormat.width, 600)}px`,
                  height: `${Math.min(currentFormat.height, 600)}px`,
                  maxWidth: "100%",
                  aspectRatio: `${currentFormat.width} / ${currentFormat.height}`,
                }}
              >
                {/* Background Layer */}
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

                {/* Overlay for custom images */}
                {customBg && (
                  <div
                    className="absolute inset-0"
                    style={{ background: "rgba(0, 0, 0, 0.4)" }}
                  />
                )}

                {/* Border */}
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
                    }}
                  />
                )}

                {/* Content */}
                <div
                  className="relative h-full flex flex-col items-center justify-center px-12 py-12"
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
                  <div
                    className="mb-4 opacity-30"
                    style={{
                      color: currentTemplate.accent,
                      fontSize: `${fontSize * 2.5}px`,
                    }}
                  >
                    "
                  </div>

                  <p
                    className="leading-relaxed mb-6"
                    style={{
                      color: displayTextColor,
                      fontSize: `${fontSize}px`,
                      lineHeight: "1.6",
                    }}
                  >
                    {quote}
                  </p>

                  <div
                    className="mb-6 opacity-30"
                    style={{
                      color: currentTemplate.accent,
                      fontSize: `${fontSize * 2.5}px`,
                    }}
                  >
                    "
                  </div>

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
                      {author}
                    </div>

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

                {/* Stickers */}
                {selectedStickers.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {selectedStickers.map((sticker, index) => {
                      const positions = [
                        { top: "10%", left: "10%" },
                        { top: "10%", right: "10%" },
                        { bottom: "10%", left: "10%" },
                        { bottom: "10%", right: "10%" },
                        { top: "50%", left: "5%" },
                        { top: "50%", right: "5%" },
                        { top: "5%", left: "50%" },
                        { bottom: "5%", left: "50%" },
                      ];
                      const position = positions[index % positions.length];

                      return (
                        <div
                          key={`${sticker}-${index}`}
                          className="absolute text-3xl"
                          style={{
                            ...position,
                            transform: "translate(-50%, -50%)",
                            opacity: 0.9,
                          }}
                        >
                          {sticker}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Presets */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FolderOpen className="w-6 h-6" />
              Saved Presets
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {savedPresets.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No saved presets yet. Create your first quote card and save
                  it!
                </p>
              ) : (
                savedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => loadPreset(preset)}
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {preset.quote.substring(0, 50)}...
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(preset.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-3">🎯 Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Saved Presets:</span>
                <span className="font-bold">{savedPresets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Templates Available:</span>
                <span className="font-bold">20</span>
              </div>
              <div className="flex justify-between">
                <span>Stickers Added:</span>
                <span className="font-bold">{selectedStickers.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
