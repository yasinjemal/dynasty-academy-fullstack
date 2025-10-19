"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BookOpen,
  Download,
  Sparkles,
  Check,
  X,
  Loader2,
  AlertCircle,
  Library,
  Globe,
  Search,
  Filter,
  BarChart3,
  Crown,
  Zap,
} from "lucide-react";

export default function BookImportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedSource, setSelectedSource] = useState("openlibrary");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [importing, setImporting] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Check admin access with useEffect to avoid hydration mismatch
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/60 mb-4">Admin access required</p>
          <Button
            onClick={() => router.push("/admin/books")}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            Back to Books
          </Button>
        </div>
      </div>
    );
  }

  const sources = [
    {
      id: "openlibrary",
      name: "Open Library",
      icon: Library,
      description: "Millions of books with rich metadata",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "gutenberg",
      name: "Project Gutenberg",
      icon: BookOpen,
      description: "70,000+ classic literature books",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "google",
      name: "Google Books",
      icon: Globe,
      description: "Modern catalog with previews",
      color: "from-orange-500 to-red-500",
    },
  ];

  const categories = [
    "Business",
    "Self-Improvement",
    "Psychology",
    "Leadership",
    "Finance",
    "Philosophy",
    "Science",
    "History",
    "Fiction",
    "Technology",
  ];

  const handleImport = async (preview: boolean = false) => {
    try {
      setImporting(true);
      setDryRun(preview);
      setResults(null);

      const response = await fetch("/api/admin/books/import-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: selectedSource,
          category: category || undefined,
          search: search || undefined,
          limit,
          dryRun: preview,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResults(data);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setImporting(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/books/import-public");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Download className="w-8 h-8 text-purple-400" />
                Book Import System
              </h1>
              <p className="text-white/60">
                Import thousands of free public domain books
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/books")}
              className="border-white/10"
            >
              Back to Books
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Import Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Source Selection */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Select Source
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(source.id)}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        selectedSource === source.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${source.color} flex items-center justify-center mb-3`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold mb-1">
                        {source.name}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {source.description}
                      </p>
                      {selectedSource === source.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-400" />
                Filters & Options
              </h2>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Query (optional)
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g., leadership, business, philosophy..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Category Filter
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Limit */}
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Number of Books: {limit}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-white/60 text-sm mt-1">
                    <span>10</span>
                    <span>200</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => handleImport(true)}
                  disabled={importing}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  {importing && dryRun ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 mr-2" />
                  )}
                  Preview (Dry Run)
                </Button>

                <Button
                  onClick={() => handleImport(false)}
                  disabled={importing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {importing && !dryRun ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  Import Now
                </Button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">
                  {results.dryRun ? "Preview Results" : "Import Results"}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-400 text-sm mb-1">Total Found</p>
                    <p className="text-3xl font-bold text-white">
                      {results.found || results.results?.total || 0}
                    </p>
                  </div>
                  {results.results && (
                    <>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <p className="text-green-400 text-sm mb-1">Imported</p>
                        <p className="text-3xl font-bold text-white">
                          {results.results.imported}
                        </p>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm mb-1">Skipped</p>
                        <p className="text-3xl font-bold text-white">
                          {results.results.skipped}
                        </p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="text-red-400 text-sm mb-1">Failed</p>
                        <p className="text-3xl font-bold text-white">
                          {results.results.failed}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {results.preview && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">
                      Preview (First 10):
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {results.preview.map((book: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3"
                        >
                          {book.coverImage && (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">
                              {book.title}
                            </p>
                            <p className="text-white/60 text-sm">
                              {book.author} • {book.category}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Library Stats
              </h3>

              {stats?.stats && (
                <div className="space-y-3">
                  {stats.stats.map((stat: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-sm">
                          {stat.bookType === "premium"
                            ? "👑 Premium"
                            : "📖 Free"}
                        </span>
                        <span className="text-white font-bold">
                          {stat._count}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs">
                        Source: {stat.source}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Start with{" "}
                    <strong className="text-white">Open Library</strong> for the
                    best metadata
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Use dry run to preview before importing</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Your premium books will always show first</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Free books attract users to your platform</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
