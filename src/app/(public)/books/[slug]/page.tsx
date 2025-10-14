"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BookActions from "@/components/books/BookActions";
import ReviewSection from "@/components/books/ReviewSection";
import Navigation from "@/components/shared/Navigation";
import {
  BookOpen,
  Star,
  Eye,
  Crown,
  Sparkles,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Lock,
  Zap,
  Award,
  Target,
  MessageSquare,
  Share2,
  Heart,
  ArrowRight,
  Play,
  Shield,
} from "lucide-react";

export default function BookDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBook();
    }
  }, [slug]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/books/${slug}`);
      if (!res.ok) {
        setBook(null);
        return;
      }
      const data = await res.json();
      setBook(data.book);
    } catch (error) {
      console.error("Error:", error);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading book...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Book Not Found
            </h1>
            <p className="text-white/60 mb-6">
              The book you're looking for doesn't exist
            </p>
            <Link href="/books">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                Browse Books
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628]">
      <Navigation />

      {/* 🌟 LUXURY HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-900/20" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/10 via-purple-500/5 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-orange-500/10 via-orange-500/5 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm mb-8"
          >
            <Link
              href="/"
              className="text-white/60 hover:text-purple-400 transition-colors"
            >
              Home
            </Link>
            <span className="text-white/40">/</span>
            <Link
              href="/books"
              className="text-white/60 hover:text-purple-400 transition-colors"
            >
              Books
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-medium">{book.title}</span>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* 📚 BOOK COVER SECTION */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Book Cover */}
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div
                      className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20"
                      style={{ aspectRatio: "2/3" }}
                    >
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-24 h-24 text-purple-400/50" />
                        </div>
                      )}

                      {/* Badges */}
                      {book.featured && (
                        <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-sm font-bold text-white shadow-lg flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Featured
                        </div>
                      )}

                      {book.salePrice && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          {Math.round(
                            ((book.price - book.salePrice) / book.price) * 100
                          )}
                          % OFF
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Read Now Button */}
                      {book.totalPages && book.totalPages > 0 && (
                        <Link href={`/books/${book.slug}/read`}>
                          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg shadow-lg shadow-green-500/30">
                            <Play className="w-5 h-5 mr-2" />
                            Read Now
                            {book.previewPages && (
                              <span className="ml-2 text-sm opacity-90">
                                (First {book.previewPages} pages free!)
                              </span>
                            )}
                          </Button>
                        </Link>
                      )}

                      <BookActions
                        bookId={book.id}
                        price={book.price}
                        salePrice={book.salePrice}
                      />

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                        <Button
                          variant="outline"
                          className="border-white/10 hover:bg-white/10"
                          onClick={() => setSaved(!saved)}
                        >
                          <Heart
                            className={`w-4 h-4 mr-2 ${
                              saved ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                          {saved ? "Saved" : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/10 hover:bg-white/10"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      {/* Trust Badges */}
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">
                              Secure Payment
                            </p>
                            <p className="text-white/60 text-xs">
                              256-bit SSL encryption
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">
                              Instant Access
                            </p>
                            <p className="text-white/60 text-xs">
                              Start reading immediately
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Award className="w-4 h-4 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">
                              Money-Back Guarantee
                            </p>
                            <p className="text-white/60 text-xs">
                              30-day refund policy
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 📖 BOOK INFO SECTION */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Title & Author */}
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                  {book.title}
                </h1>
                <p className="text-xl text-white/70 mb-6">
                  by{" "}
                  <span className="text-purple-400 font-semibold">
                    {book.author?.name || "Unknown Author"}
                  </span>
                </p>

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(book.rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-bold">
                      {book.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-white/60">
                      ({book.reviewCount || 0} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-white/60">
                    <Eye className="w-5 h-5" />
                    {book.views || 0} views
                  </div>

                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-5 h-5" />
                    {book.reviewCount || 0} readers
                  </div>
                </div>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-full text-sm font-semibold">
                    {book.category}
                  </span>
                  {book.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-full text-sm hover:bg-white/10 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* What You'll Learn */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-400" />
                    What You'll Gain From This Book
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Master advanced techniques used by industry leaders",
                      "Develop practical skills you can apply immediately",
                      "Gain insights from real-world case studies",
                      "Transform your mindset and approach to success",
                      "Join a community of like-minded achievers",
                    ].map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-white/80"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Description */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                  About This Book
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/80 text-lg leading-relaxed">
                    {book.description}
                  </p>

                  {book.content && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4">
                        Full Description
                      </h3>
                      <div
                        className="text-white/70 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: book.content }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Social Proof */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">Top 10%</p>
                  <p className="text-sm text-white/60">Most Popular</p>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    2-3 Hours
                  </p>
                  <p className="text-sm text-white/60">Average Read Time</p>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">98%</p>
                  <p className="text-sm text-white/60">Success Rate</p>
                </div>
              </div>

              {/* Reviews Section */}
              <ReviewSection bookId={book.id} reviews={book.reviews || []} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 🎯 RELATED BOOKS CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Join thousands of readers who've already started their journey to
              success
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/books">
                <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-8 py-6 text-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Explore More Books
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
