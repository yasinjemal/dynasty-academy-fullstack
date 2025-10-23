"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Book,
  Upload,
  Sparkles,
  Target,
  ChevronRight,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  TrendingUp,
  Zap,
  Award,
  Brain,
  Headphones,
  Gamepad2,
  Loader2,
} from "lucide-react";

interface LibraryBook {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorImage?: string;
  cover: string;
  progress: number;
  pages: number;
  currentPage: number;
  rating: number;
  category: string;
  timeLeft: string;
  lastRead: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch library books
  useEffect(() => {
    if (status === "authenticated") {
      fetchLibrary();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, searchQuery, selectedCategory, router]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(`/api/library?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch library");

      const data = await response.json();
      setBooks(data.books || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching library:", err);
      setError("Failed to load your library. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories from books
  const categories = [
    "all",
    ...Array.from(new Set(books.map((book) => book.category))),
  ];

  // Loading state
  if (loading && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your library...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  ← Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  📚 My 3D Library
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {books.length} books • Read in revolutionary 3D
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                variant="outline"
                size="sm"
              >
                {viewMode === "grid" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid className="w-4 h-4" />
                )}
              </Button>
              <Link href="/upload">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Book
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Features Banner */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/summaries" className="group">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all cursor-pointer shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">AI Summaries</p>
                  <p className="text-xs text-white/80">Save 10+ hours</p>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>

          <Link href="/goals" className="group">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-all cursor-pointer shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">Reading Goals</p>
                  <p className="text-xs text-white/80">Track progress</p>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>

          <Link href="/books/immersive" className="group">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white transform hover:scale-105 transition-all cursor-pointer shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">3D Reading</p>
                  <p className="text-xs text-white/80">Immersive mode</p>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">Level 12</p>
                <p className="text-xs text-white/80">2,450 XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 focus:border-purple-500 dark:focus:border-purple-500 outline-none transition-colors"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {category === "all" ? "All Books" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() =>
                  router.push(`/books/immersive?bookId=${book.id}`)
                }
              >
                {/* Book Cover */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors">
                      <Brain className="w-4 h-4 text-purple-600" />
                    </button>
                    <button className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors">
                      <Headphones className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>

                  {/* Progress Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {book.progress}%
                    </div>
                  </div>

                  {/* Last Read */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{book.lastRead}</span>
                    </div>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {book.author}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0 ml-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold">
                        {book.rating}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>
                        Page {book.currentPage} of {book.pages}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {book.timeLeft}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg">
                      {book.category}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() =>
                        router.push(`/books/immersive?bookId=${book.id}`)
                      }
                    >
                      Read Now →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                onClick={() =>
                  router.push(`/books/immersive?bookId=${book.id}`)
                }
              >
                <div className="flex gap-6">
                  {/* Cover Thumbnail */}
                  <div className="relative w-32 h-48 flex-shrink-0 rounded-xl overflow-hidden">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full">
                        {book.progress}%
                      </div>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          by {book.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-semibold">{book.rating}</span>
                      </div>
                    </div>

                    {/* Progress Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>
                          Page {book.currentPage} of {book.pages}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {book.timeLeft} remaining
                        </span>
                        <span>Last read {book.lastRead}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                        Continue Reading
                      </Button>
                      <Button variant="outline" size="sm">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Summary
                      </Button>
                      <Button variant="outline" size="sm">
                        <Headphones className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                      <Button variant="outline" size="sm">
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Quiz
                      </Button>
                      <span className="ml-auto px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-lg">
                        {book.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {books.length === 0 && !loading && (
          <div className="text-center py-20">
            <Book className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error
                ? "Failed to load library"
                : "No books in your library yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error
                ? error
                : "Purchase books from the marketplace or upload your own"}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/books">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <Book className="w-4 h-4 mr-2" />
                  Browse Books
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Book
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
