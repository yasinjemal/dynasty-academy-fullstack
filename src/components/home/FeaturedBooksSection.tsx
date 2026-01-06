"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Star,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  Headphones,
  Trophy,
  Flame,
  ArrowRight,
} from "lucide-react";
import type { FeaturedBook } from "@/lib/api/homepage-data";

interface FeaturedBooksSectionProps {
  featuredBooks: FeaturedBook[];
  popularBooks: FeaturedBook[];
}

export default function FeaturedBooksSection({
  featuredBooks,
  popularBooks,
}: FeaturedBooksSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<"featured" | "popular">(
    "featured"
  );

  const displayBooks = activeTab === "featured" ? featuredBooks : popularBooks;

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-[#030014] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-orange-950/20" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at center, white 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <BookOpen className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">
              Curated Knowledge Library
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-white">Transform Your </span>
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-transparent">
              Mind
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover books that build empires. Each title handpicked to
            accelerate your growth.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { id: "featured", label: "Editor's Choice", icon: Sparkles },
            { id: "popular", label: "Most Popular", icon: Flame },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "featured" | "popular")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Books Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {displayBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/books/${book.slug}`}>
                <motion.div
                  className="group relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all"
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/50" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {book.bookType === "free" && (
                        <span className="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full">
                          FREE
                        </span>
                      )}
                      {book.salePrice && (
                        <span className="px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                          SALE
                        </span>
                      )}
                    </div>

                    {/* Quick Actions on Hover */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    >
                      <motion.div
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-bold text-white flex items-center gap-2 shadow-xl"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Start Reading
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">
                        {book.category || "Self-Growth"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-orange-300 transition-colors">
                      {book.title}
                    </h3>

                    {/* Author */}
                    <p className="text-sm text-gray-400 mb-3">
                      by {book.author?.name || "Dynasty Academy"}
                    </p>

                    {/* Rating & Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(book.rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-400 ml-1">
                          {book.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        {book.reviewCount.toLocaleString()}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {book.bookType === "free" ? (
                          <span className="text-2xl font-black text-green-400">
                            FREE
                          </span>
                        ) : (
                          <>
                            {book.salePrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${book.price}
                              </span>
                            )}
                            <span className="text-2xl font-black text-white">
                              ${book.salePrice || book.price}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        30 min
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-violet-500/10" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/books">
            <motion.button
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 hover:border-orange-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>
                Explore All {featuredBooks.length + popularBooks.length}+ Books
              </span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
