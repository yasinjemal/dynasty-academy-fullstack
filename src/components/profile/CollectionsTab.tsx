"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Lock, Eye } from "lucide-react";
import Link from "next/link";

interface CollectionsTabProps {
  userId: string;
  username: string;
  isOwner: boolean;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  itemCount: number;
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
}

export default function CollectionsTab({
  userId,
  username,
  isOwner,
}: CollectionsTabProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, [username]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${username}/collections`);
      if (res.ok) {
        const json = await res.json();
        setCollections(json.collections || []);
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <Bookmark className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No collections yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {isOwner
            ? "Create collections to organize your favorite books"
            : "No public collections to show"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Book Collections
        </h3>
        <span className="text-sm text-gray-500">
          {collections.length} collections
        </span>
      </div>

      {/* Masonry Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function CollectionCard({
  collection,
  index,
}: {
  collection: Collection;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/collections/${collection.slug}`}
        className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-purple-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950">
          {collection.coverImage ? (
            <img
              src={collection.coverImage}
              alt={collection.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Bookmark className="h-16 w-16 text-purple-300 dark:text-purple-700" />
            </div>
          )}

          {/* Private Badge */}
          {!collection.isPublic && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Lock className="h-3 w-3" />
              Private
            </div>
          )}

          {/* Item Count Badge */}
          <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900 backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-100">
            {collection.itemCount}{" "}
            {collection.itemCount === 1 ? "book" : "books"}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h4 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
            {collection.name}
          </h4>

          {collection.description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {collection.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Created {new Date(collection.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <Eye className="h-3 w-3" />
              View
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
