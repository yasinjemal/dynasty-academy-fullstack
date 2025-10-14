"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, BookOpen, Quote } from "lucide-react";
import Link from "next/link";

interface ReflectionsTabProps {
  userId: string;
  username: string;
  isOwner: boolean;
}

interface Reflection {
  id: string;
  content: string;
  createdAt: string;
  page?: number;
  book: {
    id: string;
    title: string;
    slug: string;
    author: string;
    coverImage: string;
  };
}

export default function ReflectionsTab({
  userId,
  username,
  isOwner,
}: ReflectionsTabProps) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReflections();
  }, [username]);

  const fetchReflections = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/users/${username}/reflections?page=${page}&limit=10`
      );
      if (res.ok) {
        const json = await res.json();
        setReflections(
          page === 1 ? json.reflections : [...reflections, ...json.reflections]
        );
        setHasMore(json.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch reflections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <Eye className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No reflections yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {isOwner
            ? "Start reading and reflecting to share your insights"
            : "Check back later for their reading reflections"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Reading Reflections
        </h3>
        <span className="text-sm text-gray-500">
          {reflections.length} reflections
        </span>
      </div>

      <div className="space-y-6">
        {reflections.map((reflection, index) => (
          <ReflectionCard
            key={reflection.id}
            reflection={reflection}
            index={index}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => {
            setPage((p) => p + 1);
            fetchReflections();
          }}
          disabled={loading}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

function ReflectionCard({
  reflection,
  index,
}: {
  reflection: Reflection;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-purple-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex gap-6 p-6">
        {/* Book Cover */}
        <Link href={`/books/${reflection.book.slug}`}>
          <img
            src={reflection.book.coverImage}
            alt={reflection.book.title}
            className="h-32 w-24 rounded-lg object-cover shadow-md transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Content */}
        <div className="flex-1">
          {/* Book Info */}
          <Link
            href={`/books/${reflection.book.slug}`}
            className="mb-2 block hover:text-purple-600"
          >
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {reflection.book.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {reflection.book.author}
            </p>
          </Link>

          {/* Page Number */}
          {reflection.page && (
            <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <BookOpen className="h-3 w-3" />
              Page {reflection.page}
            </div>
          )}

          {/* Reflection Content */}
          <div className="relative">
            <Quote className="absolute -left-2 -top-1 h-6 w-6 text-gray-200 dark:text-gray-700" />
            <p className="pl-6 italic text-gray-700 dark:text-gray-300">
              "{reflection.content}"
            </p>
          </div>

          {/* Date */}
          <div className="mt-4 text-xs text-gray-500">
            {new Date(reflection.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
