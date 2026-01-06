"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Zap,
  Crown,
  BookOpen,
  Users,
  Play,
  Star,
  ChevronRight,
  GraduationCap,
  Trophy,
  Flame,
} from "lucide-react";
import type { HomepageStats, FeaturedBook } from "@/lib/api/homepage-data";

interface HeroBillionProps {
  stats: HomepageStats;
  featuredBooks: FeaturedBook[];
}

export default function HeroBillion({
  stats,
  featuredBooks,
}: HeroBillionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Rotate through featured books
  useEffect(() => {
    if (featuredBooks.length > 0) {
      const interval = setInterval(() => {
        setCurrentBookIndex((prev) => (prev + 1) % featuredBooks.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredBooks.length]);

  const currentBook = featuredBooks[currentBookIndex];

  const handleCTA = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#030014]"
    >
      {/* 🌌 COSMIC BACKGROUND */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-[#030014] to-orange-950/30" />

        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Star Field */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 flex items-center min-h-screen px-4 sm:px-6 lg:px-8"
        style={{ y, opacity }}
      >
        <div className="max-w-7xl mx-auto w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Live Badge */}
              <motion.div
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 mb-8"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(34, 197, 94, 0.2)",
                    "0 0 40px rgba(34, 197, 94, 0.4)",
                    "0 0 20px rgba(34, 197, 94, 0.2)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-sm font-medium text-green-400">
                  {stats.activeToday.toLocaleString()}+ learners online now
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-white">Where</span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-transparent">
                  Knowledge
                </span>
                <br />
                <span className="text-white">Builds</span>{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Dynasties
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Join{" "}
                <span className="text-white font-semibold">
                  {stats.totalUsers.toLocaleString()}+
                </span>{" "}
                ambitious learners mastering{" "}
                <span className="text-orange-400 font-semibold">
                  {stats.totalBooks}+ books
                </span>{" "}
                and{" "}
                <span className="text-violet-400 font-semibold">
                  {stats.totalCourses}+ courses
                </span>{" "}
                with AI-powered learning tools.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  onClick={handleCTA}
                  className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-2xl font-bold text-white text-lg overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {session ? "Go to Dashboard" : "Start Free Trial"}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <Link href="/books">
                  <motion.button
                    className="group px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl font-bold text-white text-lg hover:bg-white/10 hover:border-orange-500/50 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Explore Library
                    </span>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                className="flex flex-wrap items-center gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  {
                    icon: Trophy,
                    value: `${(stats.totalBooksRead / 1000).toFixed(0)}K+`,
                    label: "Books Completed",
                    color: "text-amber-400",
                  },
                  {
                    icon: GraduationCap,
                    value: `${(stats.totalCertificates / 1000).toFixed(1)}K+`,
                    label: "Certificates Earned",
                    color: "text-violet-400",
                  },
                  {
                    icon: Flame,
                    value: "99%",
                    label: "Satisfaction",
                    color: "text-orange-400",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT: Featured Book Showcase */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-violet-500/20 blur-3xl rounded-full" />

                {/* Book Cards Stack */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {featuredBooks.slice(0, 3).map((book, index) => {
                    const isActive = index === currentBookIndex % 3;
                    const offset = (index - (currentBookIndex % 3) + 3) % 3;

                    return (
                      <motion.div
                        key={book.id}
                        className="absolute"
                        animate={{
                          scale: isActive ? 1 : 0.85 - offset * 0.05,
                          x: offset * 40,
                          y: offset * 20,
                          rotateY: offset * -5,
                          zIndex: 3 - offset,
                          opacity: 1 - offset * 0.3,
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <Link href={`/books/${book.slug}`}>
                          <motion.div
                            className="relative w-72 h-96 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                            whileHover={{ scale: 1.02, rotateY: 5 }}
                            style={{
                              transformStyle: "preserve-3d",
                              perspective: "1000px",
                            }}
                          >
                            {/* Book Cover */}
                            {book.coverImage ? (
                              <Image
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <div className="flex items-center gap-1 mb-2">
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
                                <span className="text-sm text-gray-400 ml-2">
                                  ({book.reviewCount})
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                                {book.title}
                              </h3>
                              <p className="text-sm text-gray-400">
                                by {book.author?.name || "Dynasty Academy"}
                              </p>

                              {/* Price Badge */}
                              <div className="flex items-center gap-2 mt-3">
                                {book.bookType === "free" ? (
                                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full">
                                    FREE
                                  </span>
                                ) : (
                                  <>
                                    {book.salePrice && (
                                      <span className="text-gray-500 line-through text-sm">
                                        ${book.price}
                                      </span>
                                    )}
                                    <span className="text-xl font-bold text-white">
                                      ${book.salePrice || book.price}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Shine Effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 3,
                              }}
                            />
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Book Indicators */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {featuredBooks.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentBookIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentBookIndex % 5
                          ? "w-8 bg-orange-500"
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-10 -right-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/30"
                  animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Crown className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-5 -left-5 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        AI Audio
                      </div>
                      <div className="text-xs text-gray-400">
                        Listen anywhere
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-gray-500">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-orange-500"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
