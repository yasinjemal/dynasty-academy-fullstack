"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Star,
  Zap,
  Crown,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads: string;
  premium: boolean;
  color: string;
}

const featuredBooks: Book[] = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    rating: 4.8,
    reads: "12.5K",
    premium: true,
    color: "from-orange-500 to-pink-500",
  },
  {
    id: "2",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Productivity",
    rating: 4.9,
    reads: "10.2K",
    premium: true,
    color: "from-purple-500 to-blue-500",
  },
  {
    id: "3",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finance",
    rating: 4.7,
    reads: "8.9K",
    premium: false,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "4",
    title: "Can't Hurt Me",
    author: "David Goggins",
    category: "Motivation",
    rating: 5.0,
    reads: "15.3K",
    premium: true,
    color: "from-red-500 to-orange-500",
  },
  {
    id: "5",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Psychology",
    rating: 4.6,
    reads: "9.1K",
    premium: false,
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "6",
    title: "The 48 Laws of Power",
    author: "Robert Greene",
    category: "Strategy",
    rating: 4.8,
    reads: "11.7K",
    premium: true,
    color: "from-yellow-500 to-red-500",
  },
];

interface BookPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookPickerModal({
  isOpen,
  onClose,
}: BookPickerModalProps) {
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const router = useRouter();

  const handleBookClick = (bookId: string) => {
    router.push("/books");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[10000] p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="relative max-w-6xl w-full bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a] rounded-3xl border border-white/10 p-8">
              {/* Close Button */}
              <motion.button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>

              {/* Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 px-4 py-1.5 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-orange-400">
                    Trending Now
                  </span>
                </div>

                <h2 className="text-4xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Choose Your Next Read
                  </span>
                </h2>

                <p className="text-white/60">
                  Handpicked books that will transform your life
                </p>
              </motion.div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    className="relative group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onHoverStart={() => setHoveredBook(book.id)}
                    onHoverEnd={() => setHoveredBook(null)}
                    onClick={() => handleBookClick(book.id)}
                  >
                    {/* Glow Effect */}
                    <motion.div
                      className={`absolute -inset-0.5 bg-gradient-to-r ${book.color} rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity`}
                      animate={{
                        opacity: hoveredBook === book.id ? 0.5 : 0,
                      }}
                    />

                    {/* Card */}
                    <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
                      {/* Premium Badge */}
                      {book.premium && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-1.5 rounded-lg">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Book Icon with Gradient */}
                      <motion.div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${book.color} p-0.5 mb-4`}
                        animate={{
                          rotateY: hoveredBook === book.id ? 180 : 0,
                        }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="w-full h-full bg-[#0A0E27] rounded-xl flex items-center justify-center">
                          <BookOpen
                            className={`w-8 h-8 bg-gradient-to-br ${book.color} bg-clip-text text-transparent`}
                          />
                        </div>
                      </motion.div>

                      {/* Category Badge */}
                      <div
                        className={`inline-block bg-gradient-to-r ${book.color} px-2 py-1 rounded-md mb-3`}
                      >
                        <span className="text-xs font-semibold text-white">
                          {book.category}
                        </span>
                      </div>

                      {/* Title & Author */}
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-white/60 mb-4">
                        {book.author}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-semibold">
                            {book.rating}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-white/60">
                          <TrendingUp className="w-4 h-4" />
                          <span>{book.reads} reads</span>
                        </div>
                      </div>

                      {/* Hover Effect - Read Now Button */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-2xl flex items-end justify-center pb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredBook === book.id ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className={`bg-gradient-to-r ${book.color} px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="w-4 h-4" />
                          Read Now
                        </motion.div>
                      </motion.div>

                      {/* Floating Particles */}
                      {hoveredBook === book.id &&
                        [...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${book.color}`}
                            style={{
                              left: `${20 + i * 30}%`,
                              top: `${20 + i * 20}%`,
                            }}
                            animate={{
                              y: [-10, 10, -10],
                              opacity: [0.2, 1, 0.2],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer CTA */}
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={() => {
                    router.push("/books");
                    onClose();
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-orange-500/50 transition-shadow"
                >
                  View All 500+ Books
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
