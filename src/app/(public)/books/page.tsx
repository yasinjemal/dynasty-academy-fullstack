"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FuturisticButton from "@/components/ui/FuturisticButton";
import Navigation from "@/components/shared/Navigation";
import AddToCartButton from "@/components/books/AddToCartButton";
import {
  BookOpen,
  Crown,
  Star,
  Search,
  Sparkles,
  Filter,
  Grid,
  List,
  Users,
  Flame,
  Eye,
  ShoppingCart,
  ArrowRight,
  Award,
  Zap,
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  slug: string;
  author: { name: string } | null;
  description: string;
  coverImage: string | null;
  price: number;
  salePrice: number | null;
  featured: boolean;
  rating: number;
  reviewCount: number;
  category: string;
  bookType?: string; // 🚀 NEW
  source?: string; // 🚀 NEW
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [bookType, setBookType] = useState("all"); // 🚀 NEW: Filter by book type

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, sortBy, bookType]); // 🚀 NEW: Also refetch on bookType change

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (sortBy) params.set("sortBy", sortBy);
      if (bookType !== "all") params.set("bookType", bookType); // 🚀 NEW

      const res = await fetch(`/api/books?${params.toString()}`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error("Error:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All",
    "Self-Improvement",
    "Business",
    "Psychology",
    "Leadership",
    "Finance",
    "Philosophy",
  ];

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628]">
      <Navigation />

      {/* 💎 LUXURY HERO */}
      <section className="relative overflow-hidden py-16 sm:py-20 border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-900/20" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-purple-500/10 via-purple-500/5 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-orange-500/10 via-orange-500/5 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-full mb-6"
            >
              <Crown className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Premium Collection
              </span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Build Your Dynasty,
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                One Book at a Time
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8"
            >
              Curated by industry leaders. Designed for champions. Transform
              your life with premium knowledge.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-8"
            >
              {[
                { icon: BookOpen, value: "500+", label: "Books" },
                { icon: Users, value: "12.5K+", label: "Readers" },
                { icon: Star, value: "4.9", label: "Rating" },
                { icon: Award, value: "98%", label: "Success" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">{stat.value}</p>
                    <p className="text-white/60 text-xs">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-2xl blur-xl" />
              <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <Search className="absolute left-5 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
                />
                <Button className="m-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🎯 FILTERS */}
      <section className="sticky top-16 z-40 backdrop-blur-xl bg-[#0A0E27]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* 🚀 Book Type Filter - Enhanced */}
              <div className="relative">
                <select
                  value={bookType}
                  onChange={(e) => setBookType(e.target.value)}
                  className="px-4 py-2.5 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-purple-500/50 hover:border-purple-500/30 transition-all cursor-pointer appearance-none pr-10"
                >
                  <option value="all" className="bg-[#1a1f3a] text-white">📚 All Books</option>
                  <option value="premium" className="bg-[#1a1f3a] text-white">👑 Premium Books (Dynasty Curated)</option>
                  <option value="free" className="bg-[#1a1f3a] text-white">🎁 Free Books (Public Library)</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-purple-500 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-purple-500 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 📚 BOOKS GRID */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 🚀 NEW: Section Header Based on Filter */}
          {bookType !== "all" && filteredBooks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                {bookType === "premium" ? (
                  <>
                    <Crown className="w-6 h-6 text-orange-400" />
                    <h2 className="text-2xl font-bold text-white">
                      Dynasty Curated Collection
                    </h2>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-6 h-6 text-green-400" />
                    <h2 className="text-2xl font-bold text-white">
                      Free Public Library
                    </h2>
                  </>
                )}
              </div>
              <p className="text-white/60">
                {bookType === "premium"
                  ? "Hand-picked premium books from expert authors and industry leaders"
                  : "Free books imported from public libraries and open-source collections"}
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white/5 rounded-2xl h-96"
                />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold text-white mb-2">
                No Books Found
              </h3>
              <p className="text-white/60 mb-6">Try adjusting your filters</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setBookType("all"); // 🚀 NEW
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-6"
              }
            >
              {filteredBooks.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={index}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 👑 PREMIUM CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-3xl blur-2xl" />
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12">
              <Crown className="w-16 h-16 mx-auto mb-6 text-orange-400" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Unlock{" "}
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Premium Access
                </span>
              </h2>
              <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                Get unlimited access to our entire collection, exclusive
                content, and personalized recommendations
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/premium">
                  <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-8 py-6 text-lg">
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// 💎 LUXURY BOOK CARD
function BookCard({
  book,
  index,
  viewMode,
}: {
  book: Book;
  index: number;
  viewMode: "grid" | "list";
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
            <div className="flex gap-6">
              {/* Book Cover - Standard 2:3 ratio (width:height) */}
              <div
                className="relative w-36 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl"
                style={{ aspectRatio: "2/3" }}
              >
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-purple-400" />
                  </div>
                )}
                {book.featured && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full p-1.5 shadow-lg">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
                {/* 🚀 NEW: Book Type Badge for List View */}
                {book.bookType === "free" && !book.featured && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-2 py-1 text-[10px] font-bold text-white shadow-lg">
                    FREE
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      by {book.author?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    {book.salePrice ? (
                      <>
                        <p className="text-2xl font-bold text-orange-400">
                          ${book.salePrice}
                        </p>
                        <p className="text-sm text-white/40 line-through">
                          ${book.price}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-purple-400">
                        ${book.price}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-white/70 text-sm mb-4 line-clamp-2">
                  {book.description}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold">
                      {book.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-white/60 text-sm">
                      ({book.reviewCount || 0})
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/books/${book.slug}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <AddToCartButton bookId={book.id} bookTitle={book.title} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all">
          {/* Book Cover - Standard 2:3 ratio (width:height) */}
          <div
            className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20"
            style={{ aspectRatio: "2/3" }}
          >
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-purple-400/50" />
              </div>
            )}

            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute bottom-4 left-4 right-4">
                <Link href={`/books/${book.slug}`}>
                  <Button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                    <Eye className="w-4 h-4 mr-2" />
                    Quick View
                  </Button>
                </Link>
              </div>
            </div>

            {book.featured && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
                ⭐ Featured
              </div>
            )}

            {/* 🚀 NEW: Book Type Badge */}
            {book.bookType === "free" && !book.featured && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                FREE
              </div>
            )}

            {book.salePrice && (
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {Math.round(((book.price - book.salePrice) / book.price) * 100)}
                % OFF
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-purple-400 transition-colors">
                {book.title}
              </h3>
              <p className="text-white/60 text-sm">
                by {book.author?.name || "Unknown"}
              </p>
            </div>

            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {book.description}
            </p>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">
                  {book.rating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-white/60 text-sm">
                  ({book.reviewCount || 0})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                {book.salePrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-400">
                      ${book.salePrice}
                    </span>
                    <span className="text-sm text-white/40 line-through">
                      ${book.price}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-purple-400">
                    ${book.price}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/books/${book.slug}`} className="flex-1">
                <FuturisticButton
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Details
                </FuturisticButton>
              </Link>
              <AddToCartButton bookId={book.id} bookTitle={book.title} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
