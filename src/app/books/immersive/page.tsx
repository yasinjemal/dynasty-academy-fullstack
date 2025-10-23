"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Book3DViewer from "@/components/books/Book3DViewer";
import AdvancedBook3D from "@/components/books/AdvancedBook3D";
import FuturisticBook3D from "@/components/books/FuturisticBook3D";
import ReadableFuturistic3D from "@/components/books/ReadableFuturistic3D";
import BookPortal from "@/components/books/BookPortal";
import { BookOpen, Sparkles, Zap, Loader2, AlertCircle } from "lucide-react";

interface BookData {
  id: string;
  title: string;
  author: string;
  authorImage?: string;
  coverImage?: string;
  totalPages: number;
  description: string;
  category: string;
  fileUrl?: string;
  contentType?: string;
  hasContent?: boolean;
  content?: string | null;
}

interface ProgressData {
  currentPage: number;
  progress: number;
  lastRead?: Date;
}

// Fallback sample content for books without text content yet
const SAMPLE_CONTENT = `What you can enjoy right now:
✅ Beautiful 3D page-turning animations
✅ Immersive ambient environments (Cosmic, Library, Nature)
✅ Progress tracking and bookmarks
✅ Reading statistics and goals
✅ All premium features

---

SAMPLE READING EXPERIENCE:

In the quiet hours before dawn, when the world still sleeps and possibilities stretch endless before us, we find our truest selves. This is the time when masters are made, not through talent or luck, but through the deliberate practice of excellence.

The path to mastery is not a straight line. It winds through valleys of doubt and climbs peaks of triumph. Each step forward is earned through persistence, patience, and an unwavering commitment to growth.

Consider the craftsman who spends years perfecting their art. They do not seek shortcuts or quick fixes. Instead, they embrace the process, finding joy in the small improvements that compound over time. This is the secret that separates the exceptional from the ordinary.

In our modern world, we are bombarded with messages of instant success and overnight transformation. But the truth is far more beautiful and profound. Mastery is built one day at a time, one practice session at a time, one deliberate choice at a time.

The greatest masters understand that the journey is the destination. They find fulfillment not in the accolades or recognition, but in the deep satisfaction of knowing they gave their best effort. They understand that true excellence is not about being better than others, but about being better than the person they were yesterday.

As you embark on your own journey of mastery, remember that every expert was once a beginner. Every master faced moments of doubt and frustration. What set them apart was not absence of struggle, but their response to it.

They chose to persist when others quit. They chose to learn when others blamed. They chose to grow when others stagnated. And in making these choices day after day, they transformed themselves from novices into masters.`.repeat(
  5
);

function ImmersiveBookDemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams?.get("bookId");

  const [bookData, setBookData] = useState<BookData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPortal, setShowPortal] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [useAdvancedMode, setUseAdvancedMode] = useState(true); // New: Advanced 3D mode toggle

  useEffect(() => {
    if (!bookId) {
      setError("No book selected");
      setIsLoading(false);
      return;
    }

    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/books/read/${bookId}`);

        if (!response.ok) {
          throw new Error("Failed to load book");
        }

        const data = await response.json();
        setBookData(data.book);
        setProgress(data.progress);
        setCurrentPage(data.progress.currentPage || 0);
        setError(null);
      } catch (err) {
        console.error("Error loading book:", err);
        setError(err instanceof Error ? err.message : "Failed to load book");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-300 text-lg">Loading your book...</p>
        </div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {error || "Book not found"}
          </h2>
          <p className="text-purple-300 mb-6">
            {bookId
              ? "We couldn't load this book. You may not have access to it."
              : "Please select a book from your library to read."}
          </p>
          <button
            onClick={() => router.push("/library")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const handleStartReading = () => {
    setShowPortal(true);
  };

  const handlePortalComplete = () => {
    setShowPortal(false);
    setShow3DViewer(true);
  };

  const handlePageTurn = (direction: "next" | "prev") => {
    setCurrentPage((prev) =>
      direction === "next" ? prev + 1 : Math.max(0, prev - 1)
    );
  };

  const handleCloseViewer = () => {
    setShow3DViewer(false);
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      {/* Book Portal */}
      {showPortal && (
        <BookPortal
          bookTitle={bookData.title}
          bookCover={bookData.coverImage || "/books/mastery.jpg"}
          onComplete={handlePortalComplete}
        />
      )}

      {/* 3D Book Viewer - READABLE FUTURISTIC MODE */}
      {show3DViewer && (
        <ReadableFuturistic3D
          bookId={bookData.id}
          title={bookData.title}
          author={bookData.author}
          currentPage={currentPage}
          totalPages={bookData.totalPages}
          content={
            bookData.content ||
            `Welcome to 3D Reading - Actually Readable Edition!\n\n"${bookData.title}" by ${bookData.author}\n\nThis combines the best of both worlds:\n✨ Beautiful 3D effects\n📖 Crystal-clear readability\n🎯 Comfortable reading experience\n\n` +
              SAMPLE_CONTENT
          }
          onPageTurn={handlePageTurn}
          onClose={handleCloseViewer}
        />
      )}

      {/* Main Demo Page */}
      {!showPortal && !show3DViewer && (
        <div className="container mx-auto px-6 py-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <BookOpen className="w-20 h-20 text-purple-400" />
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              Immersive
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Book Reading
              </span>
            </h1>

            <p className="text-xl text-purple-300 max-w-3xl mx-auto mb-12">
              Experience books like never before with 3D page-turning, portal
              transitions, and immersive reading modes
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartReading}
              className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all"
            >
              Start Reading Experience 📚
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "📚 Book Portal",
                description:
                  "Enter books through a dimensional gateway with floating 3D book icon",
                color: "from-purple-500 to-blue-500",
              },
              {
                icon: Sparkles,
                title: "✨ 3D Page Turning",
                description:
                  "Realistic page curl effects and physics-based book animations",
                color: "from-pink-500 to-purple-500",
              },
              {
                icon: Zap,
                title: "🎨 Ambient Modes",
                description:
                  "Cosmic, Library, or Nature themes with magical particle effects",
                color: "from-orange-500 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-purple-200 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Book Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20 relative overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />

              <div className="relative z-10 flex items-center gap-8">
                {/* Book Cover Mockup */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-white" />
                  </div>
                </div>

                {/* Book Info */}
                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {bookData.title}
                  </h2>
                  <p className="text-purple-300 text-lg mb-4">
                    {bookData.author}
                  </p>
                  <p className="text-purple-200 mb-6">
                    {bookData.description ||
                      "Experience this book in full 3D with realistic page-turning and immersive ambient effects."}
                  </p>
                  <div className="flex gap-4 text-sm text-purple-300">
                    <span>📖 {bookData.totalPages} pages</span>
                    <span>
                      ⏱️ ~{Math.ceil(bookData.totalPages / 10)} min read
                    </span>
                    {bookData.category && <span>📚 {bookData.category}</span>}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function ImmersiveBookDemo() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <ImmersiveBookDemoContent />
    </Suspense>
  );
}
