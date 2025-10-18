"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
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
  Settings,
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
  | "holographic"
  // NEW INSANE TEMPLATES
  | "aurora"
  | "galaxy"
  | "diamond"
  | "velvet"
  | "champagne"
  | "sapphire"
  | "emerald"
  | "ruby"
  | "platinum"
  | "obsidian"
  | "cosmic"
  | "ethereal"
  | "neonpink"
  | "midnight"
  | "rose"
  | "thunder"
  | "lava"
  | "arctic"
  | "tropical"
  | "desert"
  | "electric"
  | "poison"
  | "crystal"
  | "nebula"
  | "prism"
  | "vaporwave"
  | "synthwave"
  | "retrowave"
  | "darkmode"
  | "pastel"
  | "cotton"
  | "metallica"
  | "unicorn"
  | "phoenix"
  | "dragon"
  | "lotus"
  | "zen"
  | "matrix"
  | "blade"
  | "ghost"
  | "royal"
  | "imperial"
  | "divine"
  | "celestial"
  | "quantum"
  | "noire"
  | "crimson"
  | "azure"
  | "jade"
  | "amber"
  // DARK FANTASY & VIRAL TIKTOK (30 NEW!)
  | "bloodmoon"
  | "darkangel"
  | "gothicrose"
  | "nightmare"
  | "shadowrealm"
  | "crimsonnight"
  | "darkmatter"
  | "witchhour"
  | "voidwalker"
  | "brokensouls"
  | "midnightcry"
  | "hauntedmemories"
  | "darkromance"
  | "abyssaldeep"
  | "eternaldarkness"
  | "reaperscall"
  | "toxiclove"
  | "frostbite"
  | "silentscream"
  | "emberashes"
  | "veiledtears"
  | "demonswhisper"
  | "brokenchain"
  | "ravenwing"
  | "forgottendream"
  | "poisonheart"
  | "cursedlands"
  | "twilightzone"
  | "shatteredillusions"
  | "lostsoul";

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
  // 🔥 NEW INSANE LUXURY TEMPLATES 🔥
  aurora: {
    name: "🌌 Aurora Borealis",
    icon: "🌌",
    bg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 25%, #d299c2 50%, #667eea 75%, #764ba2 100%)",
    text: "#ffffff",
    accent: "#ffd6e8",
    border: "#a8edea",
    font: "font-serif",
  },
  galaxy: {
    name: "🌠 Deep Galaxy",
    icon: "🌠",
    bg: "linear-gradient(135deg, #000428 0%, #004e92 50%, #000428 100%)",
    text: "#ffffff",
    accent: "#00d4ff",
    border: "#ff00ff",
    font: "font-bold",
  },
  diamond: {
    name: "💎 Diamond Luxury",
    icon: "💎",
    bg: "linear-gradient(135deg, #e0e0e0 0%, #ffffff 25%, #f5f5f5 50%, #ffffff 75%, #e8e8e8 100%)",
    text: "#1a1a1a",
    accent: "#00bcd4",
    border: "#00bcd4",
    font: "font-serif",
  },
  velvet: {
    name: "🎭 Velvet Night",
    icon: "🎭",
    bg: "linear-gradient(135deg, #2c003e 0%, #512b58 50%, #2c003e 100%)",
    text: "#ffd700",
    accent: "#ff6b9d",
    border: "#ffd700",
    font: "font-serif italic",
  },
  champagne: {
    name: "🥂 Champagne",
    icon: "🥂",
    bg: "linear-gradient(135deg, #f7f0e3 0%, #f3d9b0 50%, #d4af37 100%)",
    text: "#5f4b32",
    accent: "#d4af37",
    border: "#c9a961",
    font: "font-serif",
  },
  sapphire: {
    name: "💠 Sapphire Dream",
    icon: "💠",
    bg: "linear-gradient(135deg, #0f2027 0%, #0575e6 50%, #021b79 100%)",
    text: "#ffffff",
    accent: "#4dd0e1",
    border: "#00bcd4",
    font: "font-bold",
  },
  emerald: {
    name: "💚 Emerald Forest",
    icon: "💚",
    bg: "linear-gradient(135deg, #134e4a 0%, #059669 50%, #10b981 100%)",
    text: "#ffffff",
    accent: "#6ee7b7",
    border: "#34d399",
    font: "font-serif",
  },
  ruby: {
    name: "❤️ Ruby Fire",
    icon: "❤️",
    bg: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #991b1b 100%)",
    text: "#ffffff",
    accent: "#fecaca",
    border: "#f87171",
    font: "font-bold",
  },
  platinum: {
    name: "⚪ Platinum Elite",
    icon: "⚪",
    bg: "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 25%, #ffffff 50%, #e8e8e8 75%, #c0c0c0 100%)",
    text: "#1f2937",
    accent: "#6366f1",
    border: "#4f46e5",
    font: "font-sans",
  },
  obsidian: {
    name: "⚫ Obsidian Dark",
    icon: "⚫",
    bg: "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
    text: "#ffffff",
    accent: "#ff0080",
    border: "#ff0080",
    font: "font-bold",
  },
  cosmic: {
    name: "🪐 Cosmic Energy",
    icon: "🪐",
    bg: "linear-gradient(135deg, #4a00e0 0%, #8e2de2 25%, #ff00ff 50%, #8e2de2 75%, #4a00e0 100%)",
    text: "#ffffff",
    accent: "#00ffff",
    border: "#ff00ff",
    font: "font-bold",
  },
  ethereal: {
    name: "👻 Ethereal Mist",
    icon: "👻",
    bg: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 50%, #d7e1ec 100%)",
    text: "#4b5563",
    accent: "#8b5cf6",
    border: "#a78bfa",
    font: "font-serif",
  },
  neonpink: {
    name: "💗 Neon Pink",
    icon: "💗",
    bg: "linear-gradient(135deg, #ff0080 0%, #ff0099 50%, #ff00cc 100%)",
    text: "#ffffff",
    accent: "#ffff00",
    border: "#00ffff",
    font: "font-bold",
  },
  midnight: {
    name: "🌃 Midnight Blue",
    icon: "🌃",
    bg: "linear-gradient(135deg, #191970 0%, #000080 50%, #00008b 100%)",
    text: "#ffffff",
    accent: "#ffd700",
    border: "#87ceeb",
    font: "font-serif",
  },
  rose: {
    name: "🌹 Rose Garden",
    icon: "🌹",
    bg: "linear-gradient(135deg, #fff1f2 0%, #fecdd3 50%, #fb7185 100%)",
    text: "#881337",
    accent: "#be123c",
    border: "#fb7185",
    font: "font-serif italic",
  },
  thunder: {
    name: "⚡ Thunder Storm",
    icon: "⚡",
    bg: "linear-gradient(135deg, #232526 0%, #414345 50%, #232526 100%)",
    text: "#ffff00",
    accent: "#00ffff",
    border: "#ffff00",
    font: "font-bold",
  },
  lava: {
    name: "🌋 Lava Flow",
    icon: "🌋",
    bg: "linear-gradient(135deg, #ff4500 0%, #ff6347 25%, #ff7f50 50%, #ff8c00 75%, #ffa500 100%)",
    text: "#ffffff",
    accent: "#ffff00",
    border: "#ffffff",
    font: "font-bold",
  },
  arctic: {
    name: "❄️ Arctic Ice",
    icon: "❄️",
    bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)",
    text: "#0c4a6e",
    accent: "#0284c7",
    border: "#0ea5e9",
    font: "font-sans",
  },
  tropical: {
    name: "🏝️ Tropical Paradise",
    icon: "🏝️",
    bg: "linear-gradient(135deg, #06b6d4 0%, #14b8a6 33%, #10b981 66%, #84cc16 100%)",
    text: "#ffffff",
    accent: "#fef3c7",
    border: "#fde68a",
    font: "font-sans",
  },
  desert: {
    name: "🏜️ Desert Sand",
    icon: "🏜️",
    bg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 33%, #fcd34d 66%, #fde68a 100%)",
    text: "#78350f",
    accent: "#92400e",
    border: "#b45309",
    font: "font-serif",
  },
  electric: {
    name: "⚡ Electric Blue",
    icon: "⚡",
    bg: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0891b2 100%)",
    text: "#ffffff",
    accent: "#fde047",
    border: "#facc15",
    font: "font-bold",
  },
  poison: {
    name: "☠️ Poison Green",
    icon: "☠️",
    bg: "linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%)",
    text: "#bbf7d0",
    accent: "#86efac",
    border: "#4ade80",
    font: "font-bold",
  },
  crystal: {
    name: "💠 Crystal Clear",
    icon: "💠",
    bg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 33%, #bae6fd 66%, #7dd3fc 100%)",
    text: "#0c4a6e",
    accent: "#0284c7",
    border: "#0ea5e9",
    font: "font-sans",
  },
  nebula: {
    name: "🌌 Space Nebula",
    icon: "🌌",
    bg: "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 33%, #c026d3 66%, #db2777 100%)",
    text: "#ffffff",
    accent: "#fde047",
    border: "#fbbf24",
    font: "font-bold",
  },
  prism: {
    name: "🔮 Prism Light",
    icon: "🔮",
    bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 14%, #fcd34d 28%, #fbbf24 42%, #f59e0b 57%, #d97706 71%, #b45309 85%, #92400e 100%)",
    text: "#1c1917",
    accent: "#78350f",
    border: "#92400e",
    font: "font-serif",
  },
  vaporwave: {
    name: "🌸 Vaporwave",
    icon: "🌸",
    bg: "linear-gradient(135deg, #ff6ad5 0%, #c774e8 25%, #ad8cff 50%, #8795e8 75%, #94d0ff 100%)",
    text: "#ffffff",
    accent: "#ffff00",
    border: "#00ffff",
    font: "font-bold",
  },
  synthwave: {
    name: "🎹 Synthwave",
    icon: "🎹",
    bg: "linear-gradient(135deg, #2e1065 0%, #7c3aed 33%, #ec4899 66%, #fbbf24 100%)",
    text: "#ffffff",
    accent: "#fde047",
    border: "#facc15",
    font: "font-bold",
  },
  retrowave: {
    name: "📼 Retrowave",
    icon: "📼",
    bg: "linear-gradient(135deg, #f43f5e 0%, #f97316 33%, #fbbf24 66%, #a3e635 100%)",
    text: "#ffffff",
    accent: "#fef3c7",
    border: "#fde68a",
    font: "font-bold",
  },
  darkmode: {
    name: "🌑 Dark Mode",
    icon: "🌑",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    text: "#e2e8f0",
    accent: "#38bdf8",
    border: "#0ea5e9",
    font: "font-sans",
  },
  pastel: {
    name: "🎀 Pastel Dream",
    icon: "🎀",
    bg: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 25%, #f9a8d4 50%, #f472b6 75%, #ec4899 100%)",
    text: "#831843",
    accent: "#be185d",
    border: "#ec4899",
    font: "font-serif",
  },
  cotton: {
    name: "☁️ Cotton Candy",
    icon: "☁️",
    bg: "linear-gradient(135deg, #e0f2fe 0%, #fce7f3 33%, #fbcfe8 66%, #f9a8d4 100%)",
    text: "#831843",
    accent: "#be185d",
    border: "#ec4899",
    font: "font-sans",
  },
  metallica: {
    name: "🤘 Metallic",
    icon: "🤘",
    bg: "linear-gradient(135deg, #525252 0%, #737373 25%, #a3a3a3 50%, #d4d4d4 75%, #e5e5e5 100%)",
    text: "#171717",
    accent: "#0a0a0a",
    border: "#404040",
    font: "font-bold",
  },
  unicorn: {
    name: "🦄 Unicorn Magic",
    icon: "🦄",
    bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 16%, #fcd34d 33%, #f9a8d4 50%, #f472b6 66%, #c084fc 83%, #a78bfa 100%)",
    text: "#ffffff",
    accent: "#fef3c7",
    border: "#fbbf24",
    font: "font-bold",
  },
  phoenix: {
    name: "🔥 Phoenix Rising",
    icon: "🔥",
    bg: "linear-gradient(135deg, #7c2d12 0%, #c2410c 25%, #ea580c 50%, #fb923c 75%, #fdba74 100%)",
    text: "#ffffff",
    accent: "#fef3c7",
    border: "#fcd34d",
    font: "font-bold",
  },
  dragon: {
    name: "🐉 Dragon Scale",
    icon: "🐉",
    bg: "linear-gradient(135deg, #14532d 0%, #166534 25%, #15803d 50%, #16a34a 75%, #22c55e 100%)",
    text: "#ffffff",
    accent: "#86efac",
    border: "#4ade80",
    font: "font-bold",
  },
  lotus: {
    name: "🪷 Lotus Blossom",
    icon: "🪷",
    bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 33%, #fbcfe8 66%, #f9a8d4 100%)",
    text: "#831843",
    accent: "#be185d",
    border: "#ec4899",
    font: "font-serif italic",
  },
  zen: {
    name: "🧘 Zen Garden",
    icon: "🧘",
    bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 33%, #a7f3d0 66%, #6ee7b7 100%)",
    text: "#064e3b",
    accent: "#047857",
    border: "#059669",
    font: "font-serif",
  },
  matrix: {
    name: "💚 Matrix Code",
    icon: "💚",
    bg: "linear-gradient(135deg, #000000 0%, #001100 50%, #002200 100%)",
    text: "#00ff00",
    accent: "#00ff00",
    border: "#00ff00",
    font: "font-mono",
  },
  blade: {
    name: "⚔️ Blade Runner",
    icon: "⚔️",
    bg: "linear-gradient(135deg, #1a0505 0%, #330a0a 33%, #4d0f0f 66%, #661414 100%)",
    text: "#ff6b6b",
    accent: "#ffd93d",
    border: "#ff6b6b",
    font: "font-bold",
  },
  ghost: {
    name: "👻 Ghost White",
    icon: "👻",
    bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
    text: "#0f172a",
    accent: "#6366f1",
    border: "#818cf8",
    font: "font-sans",
  },
  royal: {
    name: "👑 Royal Purple",
    icon: "👑",
    bg: "linear-gradient(135deg, #4c1d95 0%, #5b21b6 33%, #6d28d9 66%, #7c3aed 100%)",
    text: "#ffffff",
    accent: "#fbbf24",
    border: "#f59e0b",
    font: "font-serif",
  },
  imperial: {
    name: "🏛️ Imperial Gold",
    icon: "🏛️",
    bg: "linear-gradient(135deg, #713f12 0%, #854d0e 33%, #a16207 66%, #ca8a04 100%)",
    text: "#ffffff",
    accent: "#fef3c7",
    border: "#fde68a",
    font: "font-serif",
  },
  divine: {
    name: "✨ Divine Light",
    icon: "✨",
    bg: "linear-gradient(135deg, #fef9c3 0%, #fef08a 25%, #fde047 50%, #facc15 75%, #eab308 100%)",
    text: "#713f12",
    accent: "#854d0e",
    border: "#a16207",
    font: "font-serif",
  },
  celestial: {
    name: "⭐ Celestial",
    icon: "⭐",
    bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #6d28d9 75%, #a78bfa 100%)",
    text: "#ffffff",
    accent: "#fef3c7",
    border: "#fbbf24",
    font: "font-serif",
  },
  quantum: {
    name: "⚛️ Quantum",
    icon: "⚛️",
    bg: "linear-gradient(135deg, #0c4a6e 0%, #075985 25%, #0369a1 50%, #0284c7 75%, #0ea5e9 100%)",
    text: "#ffffff",
    accent: "#fef3c7",
    border: "#fbbf24",
    font: "font-bold",
  },
  noire: {
    name: "🕶️ Film Noire",
    icon: "🕶️",
    bg: "linear-gradient(135deg, #171717 0%, #262626 50%, #171717 100%)",
    text: "#fafafa",
    accent: "#ef4444",
    border: "#dc2626",
    font: "font-serif italic",
  },
  crimson: {
    name: "🔴 Crimson Tide",
    icon: "🔴",
    bg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 33%, #991b1b 66%, #b91c1c 100%)",
    text: "#ffffff",
    accent: "#fecaca",
    border: "#f87171",
    font: "font-bold",
  },
  azure: {
    name: "🔵 Azure Sky",
    icon: "🔵",
    bg: "linear-gradient(135deg, #082f49 0%, #0c4a6e 33%, #075985 66%, #0369a1 100%)",
    text: "#ffffff",
    accent: "#bae6fd",
    border: "#7dd3fc",
    font: "font-sans",
  },
  jade: {
    name: "🟢 Jade Emperor",
    icon: "🟢",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 33%, #047857 66%, #059669 100%)",
    text: "#ffffff",
    accent: "#a7f3d0",
    border: "#6ee7b7",
    font: "font-serif",
  },
  amber: {
    name: "🟠 Amber Glow",
    icon: "🟠",
    bg: "linear-gradient(135deg, #78350f 0%, #92400e 33%, #b45309 66%, #d97706 100%)",
    text: "#ffffff",
    accent: "#fef3c7",
    border: "#fde68a",
    font: "font-serif",
  },
  // 🔥 DARK FANTASY & VIRAL TIKTOK TEMPLATES (30 NEW!)
  bloodmoon: {
    name: "🌙 Blood Moon",
    icon: "🌙",
    bg: "linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #8b0000 100%)",
    text: "#ff4444",
    accent: "#8b0000",
    border: "#8b0000",
    font: "font-bold",
  },
  darkangel: {
    name: "😈 Dark Angel",
    icon: "😈",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f3460 100%)",
    text: "#ffffff",
    accent: "#e94560",
    border: "#e94560",
    font: "font-serif italic",
  },
  gothicrose: {
    name: "🥀 Gothic Rose",
    icon: "🥀",
    bg: "linear-gradient(135deg, #000000 0%, #2c0d0d 50%, #4a0f0f 100%)",
    text: "#ffb3ba",
    accent: "#8b0000",
    border: "#ff6b6b",
    font: "font-serif",
  },
  nightmare: {
    name: "💀 Nightmare",
    icon: "💀",
    bg: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #000000 100%)",
    text: "#8b8b8b",
    accent: "#ff0000",
    border: "#333333",
    font: "font-mono",
  },
  shadowrealm: {
    name: "🌑 Shadow Realm",
    icon: "🌑",
    bg: "linear-gradient(135deg, #000000 0%, #1c1c1c 25%, #2d2d2d 50%, #1c1c1c 75%, #000000 100%)",
    text: "#c0c0c0",
    accent: "#8b00ff",
    border: "#4b0082",
    font: "font-sans",
  },
  crimsonnight: {
    name: "🩸 Crimson Night",
    icon: "🩸",
    bg: "linear-gradient(135deg, #1a0505 0%, #330a0a 50%, #660000 100%)",
    text: "#ffcccc",
    accent: "#ff1744",
    border: "#8b0000",
    font: "font-bold",
  },
  darkmatter: {
    name: "⚫ Dark Matter",
    icon: "⚫",
    bg: "linear-gradient(135deg, #000000 0%, #0a0a0f 50%, #1a1a2e 100%)",
    text: "#b8b8b8",
    accent: "#6200ea",
    border: "#311b92",
    font: "font-sans",
  },
  witchhour: {
    name: "🕯️ Witch Hour",
    icon: "🕯️",
    bg: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 50%, #2d1b4e 100%)",
    text: "#d4a5ff",
    accent: "#ff6b9d",
    border: "#9c27b0",
    font: "font-serif italic",
  },
  voidwalker: {
    name: "👤 Voidwalker",
    icon: "👤",
    bg: "linear-gradient(135deg, #000000 0%, #0d0d0d 100%)",
    text: "#666666",
    accent: "#ffffff",
    border: "#1a1a1a",
    font: "font-mono",
  },
  brokensouls: {
    name: "💔 Broken Souls",
    icon: "💔",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    text: "#e4e4e4",
    accent: "#ff4757",
    border: "#ff6348",
    font: "font-serif",
  },
  midnightcry: {
    name: "😢 Midnight Cry",
    icon: "😢",
    bg: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
    text: "#a8dadc",
    accent: "#457b9d",
    border: "#1d3557",
    font: "font-serif italic",
  },
  hauntedmemories: {
    name: "👻 Haunted Memories",
    icon: "👻",
    bg: "linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 50%, #1a1a1a 100%)",
    text: "#9e9e9e",
    accent: "#00bcd4",
    border: "#424242",
    font: "font-sans",
  },
  darkromance: {
    name: "🖤 Dark Romance",
    icon: "🖤",
    bg: "linear-gradient(135deg, #2c0d0d 0%, #4a0f0f 50%, #1a0000 100%)",
    text: "#ffc0cb",
    accent: "#ff1744",
    border: "#c2185b",
    font: "font-serif italic",
  },
  abyssaldeep: {
    name: "🌊 Abyssal Deep",
    icon: "🌊",
    bg: "linear-gradient(135deg, #001529 0%, #002a4a 50%, #003d5c 100%)",
    text: "#b3d9ff",
    accent: "#0077b6",
    border: "#023e8a",
    font: "font-sans",
  },
  eternaldarkness: {
    name: "🌌 Eternal Darkness",
    icon: "🌌",
    bg: "linear-gradient(135deg, #000000 0%, #0a0015 50%, #1a002e 100%)",
    text: "#8b8bff",
    accent: "#6200ea",
    border: "#4a148c",
    font: "font-mono",
  },
  reaperscall: {
    name: "⚰️ Reaper's Call",
    icon: "⚰️",
    bg: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #000000 100%)",
    text: "#d4d4d4",
    accent: "#ff0000",
    border: "#4d4d4d",
    font: "font-bold",
  },
  toxiclove: {
    name: "☠️ Toxic Love",
    icon: "☠️",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #2d1b2e 50%, #4a004a 100%)",
    text: "#ff94d3",
    accent: "#c2185b",
    border: "#7b1fa2",
    font: "font-serif italic",
  },
  frostbite: {
    name: "❄️ Frostbite",
    icon: "❄️",
    bg: "linear-gradient(135deg, #0a192f 0%, #1a2332 50%, #2d3e50 100%)",
    text: "#b8e4f0",
    accent: "#00d4ff",
    border: "#0984e3",
    font: "font-sans",
  },
  silentscream: {
    name: "😱 Silent Scream",
    icon: "😱",
    bg: "linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)",
    text: "#ff8b8b",
    accent: "#ff0000",
    border: "#8b0000",
    font: "font-bold",
  },
  emberashes: {
    name: "🔥 Ember & Ashes",
    icon: "🔥",
    bg: "linear-gradient(135deg, #1a0f00 0%, #331f00 50%, #4d2e00 100%)",
    text: "#ffb366",
    accent: "#ff6600",
    border: "#cc5200",
    font: "font-serif",
  },
  veiledtears: {
    name: "💧 Veiled Tears",
    icon: "💧",
    bg: "linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #253345 100%)",
    text: "#a8c5da",
    accent: "#5dade2",
    border: "#2980b9",
    font: "font-serif italic",
  },
  demonswhisper: {
    name: "😈 Demon's Whisper",
    icon: "😈",
    bg: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #660000 100%)",
    text: "#ff9999",
    accent: "#ff3333",
    border: "#990000",
    font: "font-mono",
  },
  brokenchain: {
    name: "⛓️ Broken Chain",
    icon: "⛓️",
    bg: "linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 50%, #3d3d3d 100%)",
    text: "#c0c0c0",
    accent: "#ff4444",
    border: "#606060",
    font: "font-bold",
  },
  ravenwing: {
    name: "🦅 Raven Wing",
    icon: "🦅",
    bg: "linear-gradient(135deg, #000000 0%, #0f0f1a 50%, #1a1a2e 100%)",
    text: "#9999cc",
    accent: "#6666ff",
    border: "#333366",
    font: "font-serif",
  },
  forgottendream: {
    name: "💭 Forgotten Dream",
    icon: "💭",
    bg: "linear-gradient(135deg, #0a0a1e 0%, #1a1a3e 50%, #2d2d5e 100%)",
    text: "#b8b8e8",
    accent: "#7b68ee",
    border: "#483d8b",
    font: "font-serif italic",
  },
  poisonheart: {
    name: "💚 Poison Heart",
    icon: "💚",
    bg: "linear-gradient(135deg, #0d1f0d 0%, #1a3d1a 50%, #2d5c2d 100%)",
    text: "#90ee90",
    accent: "#00ff00",
    border: "#228b22",
    font: "font-sans",
  },
  cursedlands: {
    name: "🏚️ Cursed Lands",
    icon: "🏚️",
    bg: "linear-gradient(135deg, #1a1a0f 0%, #2d2d1a 50%, #3d3d2d 100%)",
    text: "#d4d4b8",
    accent: "#8b8b00",
    border: "#5c5c00",
    font: "font-serif",
  },
  twilightzone: {
    name: "🌆 Twilight Zone",
    icon: "🌆",
    bg: "linear-gradient(135deg, #2d1b4e 0%, #4a2d6e 50%, #6b3f8e 100%)",
    text: "#e8d4ff",
    accent: "#b388ff",
    border: "#7c4dff",
    font: "font-sans",
  },
  shatteredillusions: {
    name: "🪞 Shattered Illusions",
    icon: "🪞",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #2d2d2d 75%, #1a1a1a 100%)",
    text: "#b8b8b8",
    accent: "#00e5ff",
    border: "#006064",
    font: "font-mono",
  },
  lostsoul: {
    name: "👁️ Lost Soul",
    icon: "👁️",
    bg: "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #333333 100%)",
    text: "#888888",
    accent: "#ffffff",
    border: "#4d4d4d",
    font: "font-serif italic",
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
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);

  // 🎬 VIDEO ANIMATION SETTINGS
  const [videoAnimationType, setVideoAnimationType] = useState<
    | "fade"
    | "slide"
    | "zoom"
    | "typewriter"
    | "particles"
    | "wave"
    | "glow"
    | "bounce"
  >("fade");
  const [videoDuration, setVideoDuration] = useState(5); // seconds
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  // Stickers
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<
    "content" | "style" | "effects" | "stickers" | "export"
  >("content");
  const [savedPresets, setSavedPresets] = useState<QuotePreset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stickerLibrary = {
    decorative: ["✨", "💫", "⭐", "🌟", "💎", "👑", "🏆", "🎯"],
    nature: ["🌸", "🌺", "🌻", "🌹", "🍃", "🌿", "🌱", "🦋"],
    hearts: ["❤️", "💕", "💖", "💗", "💙", "💚", "💛", "🧡"],
    symbols: ["🔥", "⚡", "💥", "🎨", "📚", "✍️", "🎭", "🎪"],
  };

  const currentTemplate = templates[selectedTemplate];
  const currentFormat =
    exportFormat === "custom"
      ? {
          name: "⚙️ Custom Size",
          width: customWidth,
          height: customHeight,
          icon: "⚙️",
        }
      : exportFormats[exportFormat];
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

    // Show success message
    setSuccessMessage("✅ Preset saved successfully!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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

  // Generate and download image at FULL 3x HD resolution
  const handleDownload = async () => {
    setIsGenerating(true);
    const cardElement = document.getElementById("quote-card-preview");
    if (!cardElement) return;

    try {
      // 🔥 FULL 3x HD EXPORT - No size constraints!
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 3, // 3x resolution multiplier
        logging: false,
        useCORS: true,
        allowTaint: true,
        // Remove width/height to let scale do its magic at full resolution
      });

      const link = document.createElement("a");
      link.download = `dynasty-quote-${bookTitle.slice(
        0,
        20
      )}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0); // Maximum quality
      link.click();

      // Show success message with actual dimensions
      setSuccessMessage(
        `🎉 Downloaded ${canvas.width}×${canvas.height}px (3x HD)!`
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating image:", error);
      setSuccessMessage("❌ Error generating image. Please try again.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  // 🎬 GENERATE ANIMATED VIDEO WITH MP4 EXPORT - THE VIRAL MAKER! 🔥
  const handleVideoExport = async () => {
    setIsGeneratingVideo(true);
    setSuccessMessage("🎬 Creating your viral video...");
    setShowSuccess(true);

    try {
      const cardElement = document.getElementById("quote-card-preview");
      if (!cardElement) throw new Error("Card element not found");

      // Create video canvas
      const videoCanvas = document.createElement("canvas");
      const ctx = videoCanvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Set dimensions
      videoCanvas.width = currentFormat.width;
      videoCanvas.height = currentFormat.height;

      // Frame rate and duration
      const fps = 30;
      const totalFrames = videoDuration * fps;
      const frames: Blob[] = [];

      // STEP 1: Generate frames with animation
      setSuccessMessage("🎬 Step 1/3: Generating frames...");
      for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;

        // Clear canvas
        ctx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);

        // Capture current state
        const canvas = await html2canvas(cardElement, {
          backgroundColor: null,
          scale: 1,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        // Apply animation based on type
        ctx.save();

        switch (videoAnimationType) {
          case "fade":
            ctx.globalAlpha = Math.min(progress * 1.5, 1);
            break;

          case "slide":
            const slideOffset = (1 - progress) * videoCanvas.width;
            ctx.translate(-slideOffset, 0);
            break;

          case "zoom":
            const scale = 0.5 + progress * 0.5;
            ctx.translate(videoCanvas.width / 2, videoCanvas.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-videoCanvas.width / 2, -videoCanvas.height / 2);
            break;

          case "bounce":
            const bounceY = Math.sin(progress * Math.PI) * 100;
            ctx.translate(0, -bounceY);
            break;

          case "wave":
            const waveOffset = Math.sin(progress * Math.PI * 2) * 50;
            ctx.translate(waveOffset, 0);
            break;

          case "glow":
            ctx.shadowColor = currentTemplate.accent;
            ctx.shadowBlur = 50 * Math.sin(progress * Math.PI);
            break;

          case "typewriter":
            // Typewriter effect: Reveal text character by character
            // Create a clipping mask that reveals from left to right
            const revealWidth = progress * videoCanvas.width;
            ctx.beginPath();
            ctx.rect(0, 0, revealWidth, videoCanvas.height);
            ctx.clip();
            // Add cursor blink effect
            if (progress < 0.95 && Math.floor(frame / 15) % 2 === 0) {
              ctx.shadowColor = currentTemplate.accent;
              ctx.shadowBlur = 20;
            }
            break;

          case "particles":
            // Particles effect: Floating particles with opacity fade
            // Draw main content with fade-in
            ctx.globalAlpha = Math.min(progress * 1.2, 1);

            // Add particle overlay effect
            ctx.filter = `brightness(${
              1 + Math.sin(progress * Math.PI) * 0.3
            })`;

            // Subtle scale pulsing for depth
            const particleScale = 1 + Math.sin(progress * Math.PI * 2) * 0.02;
            ctx.translate(videoCanvas.width / 2, videoCanvas.height / 2);
            ctx.scale(particleScale, particleScale);
            ctx.translate(-videoCanvas.width / 2, -videoCanvas.height / 2);
            break;
        }

        // Draw the image
        ctx.drawImage(canvas, 0, 0, videoCanvas.width, videoCanvas.height);
        ctx.restore();

        // Convert to blob and store
        const blob = await new Promise<Blob>((resolve) => {
          videoCanvas.toBlob((b) => resolve(b!), "image/png");
        });
        frames.push(blob);

        // Update progress
        if (frame % 5 === 0 || frame === totalFrames - 1) {
          setSuccessMessage(
            `🎬 Step 1/3: Generating frames... ${Math.round(progress * 100)}%`
          );
        }
      }

      // STEP 2: Initialize FFmpeg
      setSuccessMessage("🎬 Step 2/3: Loading video encoder...");
      const ffmpeg = new FFmpeg();

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      // STEP 3: Convert frames to MP4
      setSuccessMessage("🎬 Step 3/3: Converting to MP4...");

      // Write frames to FFmpeg virtual filesystem
      for (let i = 0; i < frames.length; i++) {
        const frameData = await fetchFile(frames[i]);
        ffmpeg.writeFile(
          `frame${i.toString().padStart(5, "0")}.png`,
          frameData
        );

        if (i % 10 === 0) {
          setSuccessMessage(
            `� Step 3/3: Processing frames... ${Math.round(
              (i / frames.length) * 100
            )}%`
          );
        }
      }

      // Run FFmpeg to create MP4
      await ffmpeg.exec([
        "-framerate",
        String(fps),
        "-i",
        "frame%05d.png",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "medium",
        "-crf",
        "23",
        "output.mp4",
      ]);

      // Read the output video
      const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
      const videoBlob = new Blob([new Uint8Array(Array.from(data))], {
        type: "video/mp4",
      });
      const videoUrl = URL.createObjectURL(videoBlob);

      // Download the video
      const link = document.createElement("a");
      link.download = `dynasty-viral-quote-${Date.now()}.mp4`;
      link.href = videoUrl;
      link.click();

      // Cleanup
      URL.revokeObjectURL(videoUrl);

      setSuccessMessage(
        `🎉 VIRAL VIDEO CREATED! ${frames.length} frames → MP4 (${(
          videoBlob.size /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Error generating video:", error);
      setSuccessMessage(
        "❌ Error creating video. Try a shorter duration or different animation!"
      );
      setTimeout(() => setShowSuccess(false), 4000);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-blue-900/40 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-6 px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 group"
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </Link>
            <div>
              <motion.h1
                className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                </motion.div>
                Quote Studio
              </motion.h1>
              <p className="text-sm text-purple-200 font-medium">
                ✨ Create viral-worthy quote cards with AI-powered luxury
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={savePreset}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-gray-900 rounded-xl font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/70 transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              Save Preset
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-3 space-y-4">
          <div
            className="bg-gradient-to-br from-gray-900/90 via-purple-900/50 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-6 space-y-4"
            style={{
              boxShadow:
                "0 0 40px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.1)",
            }}
          >
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
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-gray-900 shadow-lg shadow-amber-500/50"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400"
                      style={{ borderRadius: "0.75rem" }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <tab.icon
                    className={`w-5 h-5 relative z-10 ${
                      activeTab === tab.id ? "drop-shadow-sm" : ""
                    }`}
                  />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text mb-2">
                      ✍️ Quote Text
                    </label>
                    <textarea
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-purple-500/30 rounded-xl bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all shadow-lg shadow-purple-500/10"
                      placeholder="Enter your inspirational quote..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text mb-2">
                      📚 Book Title
                    </label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-500/30 rounded-xl bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all shadow-lg shadow-blue-500/10"
                      placeholder="The Alchemist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-transparent bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text mb-2">
                      ✒️ Author Name
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-500/30 rounded-xl bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all shadow-lg shadow-green-500/10"
                      placeholder="Paulo Coelho"
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
                      onChange={(e) =>
                        setFontFamily(e.target.value as FontFamily)
                      }
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
                  {Object.entries(stickerLibrary).map(
                    ([category, stickers]) => (
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
                                    selectedStickers.filter(
                                      (s) => s !== sticker
                                    )
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
                    )
                  )}
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

                  {/* Custom Size Inputs */}
                  {exportFormat === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-300 dark:border-purple-600"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Custom Dimensions
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Width (px)
                          </label>
                          <input
                            type="number"
                            min="200"
                            max="4000"
                            value={customWidth}
                            onChange={(e) =>
                              setCustomWidth(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Height (px)
                          </label>
                          <input
                            type="number"
                            min="200"
                            max="4000"
                            value={customHeight}
                            onChange={(e) =>
                              setCustomHeight(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setCustomWidth(1080);
                            setCustomHeight(1080);
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Square
                        </button>
                        <button
                          onClick={() => {
                            setCustomWidth(1080);
                            setCustomHeight(1920);
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Portrait
                        </button>
                        <button
                          onClick={() => {
                            setCustomWidth(1920);
                            setCustomHeight(1080);
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Landscape
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        💡 Aspect ratio:{" "}
                        <strong>
                          {customWidth}:{customHeight}
                        </strong>{" "}
                        ({(customWidth / customHeight).toFixed(2)})
                      </p>
                    </motion.div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <motion.button
                      onClick={handleDownload}
                      disabled={isGenerating}
                      whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                      whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Download className="w-5 h-5" />
                          </motion.div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download PNG (3x HD)
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      disabled={isGenerating}
                      whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                      whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Share2 className="w-5 h-5" />
                      Share to Social
                    </motion.button>

                    {/* 🎬 ANIMATED VIDEO EXPORT - THE VIRAL MAKER! */}
                    <div className="mt-4 p-6 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-purple-900/50 backdrop-blur-sm rounded-2xl border-2 border-purple-400/50 shadow-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Video className="w-6 h-6 text-pink-400" />
                        </motion.div>
                        <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text">
                          🔥 ANIMATED VIDEO (Go Viral!)
                        </h3>
                      </div>

                      {/* Animation Style Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-bold text-purple-200 mb-2">
                          Choose Animation Style (8 Professional Styles!):
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "fade", label: "✨ Fade In", icon: "✨" },
                            {
                              value: "slide",
                              label: "➡️ Slide In",
                              icon: "➡️",
                            },
                            { value: "zoom", label: "🔍 Zoom In", icon: "🔍" },
                            { value: "bounce", label: "⬆️ Bounce", icon: "⬆️" },
                            { value: "wave", label: "🌊 Wave", icon: "🌊" },
                            {
                              value: "glow",
                              label: "💫 Glow Pulse",
                              icon: "💫",
                            },
                            {
                              value: "typewriter",
                              label: "⌨️ Typewriter",
                              icon: "⌨️",
                            },
                            {
                              value: "particles",
                              label: "✨ Particles",
                              icon: "✨",
                            },
                          ].map((anim) => (
                            <motion.button
                              key={anim.value}
                              onClick={() =>
                                setVideoAnimationType(anim.value as any)
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                                videoAnimationType === anim.value
                                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-800"
                              }`}
                            >
                              {anim.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Duration Slider */}
                      <div className="mb-4">
                        <label className="block text-sm font-bold text-purple-200 mb-2">
                          Video Duration: {videoDuration}s
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="10"
                          value={videoDuration}
                          onChange={(e) =>
                            setVideoDuration(Number(e.target.value))
                          }
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>3s (Quick)</span>
                          <span>10s (Cinematic)</span>
                        </div>
                      </div>

                      {/* Animation Description */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-400/20">
                        <p className="text-xs text-purple-200">
                          {videoAnimationType === "fade" &&
                            "✨ Smooth opacity fade-in. Perfect for elegant, professional reveals."}
                          {videoAnimationType === "slide" &&
                            "➡️ Dynamic slide from right. Great for attention-grabbing entrances."}
                          {videoAnimationType === "zoom" &&
                            "🔍 Cinematic zoom from 50%. Creates depth and focus on your message."}
                          {videoAnimationType === "bounce" &&
                            "⬆️ Playful bouncing motion. Fun and energetic for motivational quotes."}
                          {videoAnimationType === "wave" &&
                            "🌊 Mesmerizing wave motion. Unique and eye-catching for viral content."}
                          {videoAnimationType === "glow" &&
                            "💫 Pulsing glow effect. Magical and mysterious, perfect for wisdom quotes."}
                          {videoAnimationType === "typewriter" &&
                            "⌨️ Text reveals left-to-right. Classic typewriter effect with cursor blink!"}
                          {videoAnimationType === "particles" &&
                            "✨ Floating particles with brightness. Ethereal and dreamy atmosphere."}
                        </p>
                      </div>

                      {/* Generate Video Button */}
                      <motion.button
                        onClick={handleVideoExport}
                        disabled={isGeneratingVideo}
                        whileHover={{ scale: isGeneratingVideo ? 1 : 1.05 }}
                        whileTap={{ scale: isGeneratingVideo ? 1 : 0.95 }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white rounded-xl font-black text-lg shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          boxShadow: isGeneratingVideo
                            ? "0 0 30px rgba(236, 72, 153, 0.6)"
                            : "0 0 20px rgba(168, 85, 247, 0.4)",
                        }}
                      >
                        {isGeneratingVideo ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Film className="w-6 h-6" />
                            </motion.div>
                            Creating Magic...
                          </>
                        ) : (
                          <>
                            <Video className="w-6 h-6" />
                            Generate Viral Video! 🚀
                          </>
                        )}
                      </motion.button>

                      {/* Pro Tips */}
                      <div className="mt-4 p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-400/30">
                        <p className="text-xs text-purple-200">
                          <strong>🔥 Phase 2 Complete!</strong> Now with 8
                          professional animations including Typewriter &
                          Particles! Perfect for TikTok, Instagram Reels,
                          YouTube Shorts! Try all styles and go VIRAL! 🚀
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-lg border border-orange-300 dark:border-orange-600">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>💡 Pro Tip:</strong> Ultra-HD export (
                        {currentFormat.width * 3}×{currentFormat.height * 3}px)
                        perfect for printing or social media!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Preview */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div
            className="bg-gradient-to-br from-gray-900/90 via-purple-900/50 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-8 w-full"
            style={{
              boxShadow:
                "0 0 40px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text flex items-center gap-3">
                <ImageIcon className="w-7 h-7 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                Live Preview
              </h2>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-6 h-6 text-amber-400" />
              </motion.div>
            </div>

            {/* Format Info Display */}
            <motion.div
              className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl border border-purple-400/30"
              whileHover={{ scale: 1.02 }}
              style={{
                boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
              }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-purple-200">
                  {currentFormat.name}
                </span>
                <span className="text-amber-300 font-semibold">
                  {currentFormat.width} × {currentFormat.height}px
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-300 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Aspect Ratio:{" "}
                {(currentFormat.width / currentFormat.height).toFixed(2)} •
                Export: {currentFormat.width * 3} × {currentFormat.height * 3}px
                (3x HD)
              </div>
            </motion.div>

            <div className="flex justify-center items-center min-h-[400px]">
              <motion.div
                id="quote-card-preview"
                className={`relative rounded-3xl overflow-hidden ${fontFamilies[fontFamily].className}`}
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  aspectRatio: `${currentFormat.width} / ${currentFormat.height}`,
                  boxShadow:
                    "0 0 60px rgba(251, 191, 36, 0.4), 0 0 100px rgba(168, 85, 247, 0.3)",
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
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

                {/* Stickers - IMPROVED: Better positioning to avoid text */}
                {selectedStickers.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {selectedStickers.map((sticker, index) => {
                      // Better positioning - corners only, further from center
                      const positions = [
                        { top: "5%", left: "5%" }, // Top-left corner
                        { top: "5%", right: "5%" }, // Top-right corner
                        { bottom: "5%", left: "5%" }, // Bottom-left corner
                        { bottom: "5%", right: "5%" }, // Bottom-right corner
                        {
                          top: "2%",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }, // Top center
                        {
                          bottom: "2%",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }, // Bottom center
                        { top: "15%", left: "2%" }, // Left side top
                        { top: "15%", right: "2%" }, // Right side top
                      ];
                      const position = positions[index % positions.length];

                      return (
                        <motion.div
                          key={`${sticker}-${index}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: index * 0.1,
                          }}
                          className="absolute text-3xl md:text-4xl"
                          style={{
                            ...position,
                            opacity: 0.85,
                            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                            zIndex: 10,
                          }}
                        >
                          {sticker}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Presets */}
        <div className="lg:col-span-3 space-y-4">
          <div
            className="bg-gradient-to-br from-gray-900/90 via-purple-900/50 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-6"
            style={{
              boxShadow:
                "0 0 40px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.1)",
            }}
          >
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text mb-4 flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
              Saved Presets
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {savedPresets.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-purple-300 font-medium">
                    No saved presets yet. Create your first quote card and save
                    it!
                  </p>
                </motion.div>
              ) : (
                savedPresets.map((preset, index) => (
                  <motion.div
                    key={preset.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, x: 5 }}
                    className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-purple-400/30 hover:border-amber-400/50 transition-all cursor-pointer group"
                    onClick={() => loadPreset(preset)}
                    style={{
                      boxShadow: "0 0 15px rgba(168, 85, 247, 0.2)",
                    }}
                  >
                    <div className="font-bold text-sm text-amber-300 mb-1 group-hover:text-amber-200 transition-colors">
                      {preset.name}
                    </div>
                    <div className="text-xs text-purple-200 truncate">
                      {preset.quote.substring(0, 50)}...
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(preset.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <motion.div
            className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl shadow-2xl p-6 text-gray-900 border-2 border-amber-300"
            whileHover={{ scale: 1.02, y: -5 }}
            style={{
              boxShadow:
                "0 0 40px rgba(251, 191, 36, 0.6), 0 20px 60px rgba(251, 191, 36, 0.4)",
            }}
          >
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Quick Stats
            </h3>
            <div className="space-y-3 text-sm font-semibold">
              <motion.div
                className="flex justify-between items-center p-2 bg-white/30 backdrop-blur-sm rounded-lg"
                whileHover={{ x: 5 }}
              >
                <span>Saved Presets:</span>
                <motion.span
                  className="font-black text-lg"
                  key={savedPresets.length}
                  initial={{ scale: 1.5, color: "#ef4444" }}
                  animate={{ scale: 1, color: "#000000" }}
                >
                  {savedPresets.length}
                </motion.span>
              </motion.div>
              <motion.div
                className="flex justify-between items-center p-2 bg-white/30 backdrop-blur-sm rounded-lg"
                whileHover={{ x: 5 }}
              >
                <span>Templates Available:</span>
                <span className="font-black text-lg">100</span>
              </motion.div>
              <motion.div
                className="flex justify-between items-center p-2 bg-white/30 backdrop-blur-sm rounded-lg"
                whileHover={{ x: 5 }}
              >
                <span>Stickers Added:</span>
                <motion.span
                  className="font-black text-lg"
                  key={selectedStickers.length}
                  initial={{ scale: 1.5, color: "#ef4444" }}
                  animate={{ scale: 1, color: "#000000" }}
                >
                  {selectedStickers.length}
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Luxury Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.div
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-green-300"
              style={{
                boxShadow:
                  "0 0 60px rgba(34, 197, 94, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)",
              }}
              animate={{
                boxShadow: [
                  "0 0 60px rgba(34, 197, 94, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)",
                  "0 0 80px rgba(34, 197, 94, 1), 0 20px 40px rgba(0, 0, 0, 0.3)",
                  "0 0 60px rgba(34, 197, 94, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <p className="font-bold text-lg">{successMessage}</p>
                <Check className="w-6 h-6" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
