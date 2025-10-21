"use client";

import { useState, useEffect } from "react";
import { useFastBookReader } from "@/hooks/useFastBookReader";
import { motion } from "framer-motion";
import { Zap, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { bookCache } from "@/lib/bookCache/bookCache";

/**
 * 🚀 CACHE DEMO PAGE - See Offline-Speed in Action!
 *
 * This demo shows the dramatic difference between cached and uncached pages.
 * Open console to see cache logs!
 */

export default function CacheDemoPage() {
  const [stats, setStats] = useState({
    totalPages: 0,
    totalSize: 0,
    oldestCache: Date.now(),
  });

  // Demo with a real book (change these to match your data)
  const bookId = "demo-book";
  const slug = "the-power-of-a-thousand-days"; // Use your actual book slug
  const totalPages = 125;

  const {
    currentPage,
    pageContent,
    loading,
    error,
    wordCount,
    estimatedReadTime,
    goToPage,
    nextPage,
    previousPage,
    cacheStats,
  } = useFastBookReader({
    bookId,
    slug,
    totalPages,
    initialPage: 1,
    readingSpeed: 250,
    onPageChange: (page) => {
      console.log(`📖 Navigated to page ${page}`);
    },
    onContentLoad: (content, words) => {
      console.log(`✅ Loaded ${words} words`);
    },
  });

  // Load cache stats
  useEffect(() => {
    const loadStats = async () => {
      const cacheStats = await bookCache.getStats();
      setStats(cacheStats);
    };
    loadStats();

    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearCache = async () => {
    await bookCache.clearBook(bookId);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Zap className="w-12 h-12 text-yellow-400" />
            Offline-Speed Cache Demo
            <Zap className="w-12 h-12 text-yellow-400" />
          </h1>
          <p className="text-xl text-purple-300">
            Watch pages load INSTANTLY after the first read! 🚀
          </p>
        </motion.div>

        {/* Cache Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Cached Pages */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Download className="w-6 h-6 text-purple-400" />
              {cacheStats.cacheReady && (
                <span className="text-green-400 text-sm">✓ Ready</span>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {cacheStats.cachedPages}
            </div>
            <div className="text-sm text-purple-300">Pages Cached</div>
          </motion.div>

          {/* Current Page */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📖</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {currentPage}
            </div>
            <div className="text-sm text-blue-300">Current Page</div>
          </motion.div>

          {/* Load Time Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {loading ? "⏳" : "⚡"}
            </div>
            <div className="text-sm text-green-300">
              {loading ? "Loading..." : "Instant!"}
            </div>
          </motion.div>

          {/* Total Cache Size */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💾</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {(stats.totalSize / 1024 / 1024).toFixed(1)}
            </div>
            <div className="text-sm text-orange-300">MB Cached</div>
          </motion.div>
        </div>

        {/* Book Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 min-h-[500px]"
            >
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg p-4 mb-4">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">⏳</div>
                    <div className="text-xl text-purple-300">
                      Loading page...
                    </div>
                  </div>
                </div>
              )}

              {!loading && pageContent && (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
              )}

              {!loading && !pageContent && !error && (
                <div className="flex items-center justify-center h-full text-purple-300">
                  Select a book to begin reading
                </div>
              )}

              {/* Page Info */}
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm text-purple-300">
                <div>
                  {wordCount > 0 && (
                    <span>
                      {wordCount} words • {estimatedReadTime} min read
                    </span>
                  )}
                </div>
                <div>
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={previousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-400/30 text-purple-300 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      goToPage(page);
                    }
                  }}
                  className="w-20 px-3 py-2 bg-white/5 border border-white/10 text-white text-center rounded-lg"
                />
                <span className="text-purple-300">/ {totalPages}</span>
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-400/30 text-purple-300 rounded-lg transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sidebar - Instructions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                How It Works
              </h2>

              <div className="space-y-4 text-sm text-purple-200">
                <div className="bg-purple-500/10 rounded-lg p-4">
                  <div className="font-bold text-purple-300 mb-2">
                    1️⃣ First Page Load
                  </div>
                  <div>
                    Takes ~800ms (normal). Page is fetched from server and
                    cached in IndexedDB.
                  </div>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4">
                  <div className="font-bold text-green-300 mb-2">
                    2️⃣ Second Page Load
                  </div>
                  <div>
                    Takes ~20ms (⚡INSTANT!). Already preloaded and cached. Zero
                    network calls!
                  </div>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4">
                  <div className="font-bold text-blue-300 mb-2">
                    3️⃣ All Other Pages
                  </div>
                  <div>
                    System preloads next 5 pages automatically. All navigation
                    feels instant!
                  </div>
                </div>

                <div className="bg-orange-500/10 rounded-lg p-4">
                  <div className="font-bold text-orange-300 mb-2">
                    🎯 Pro Tip
                  </div>
                  <div>
                    Open your browser console (F12) to see real-time cache logs!
                  </div>
                </div>

                <button
                  onClick={clearCache}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-lg transition-all mt-6"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cache & Restart Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Console Log Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 text-center"
        >
          <div className="text-yellow-300 font-bold mb-2">
            👀 Open Browser Console (F12) to see the magic!
          </div>
          <div className="text-sm text-yellow-200">
            Watch for: "⚡ Page X loaded from cache (INSTANT!)" and "🎯
            Preloading Y pages"
          </div>
        </motion.div>
      </div>
    </div>
  );
}
