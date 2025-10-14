"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Heart,
  Bookmark,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface PostsTabProps {
  userId: string;
  username: string;
  isOwner: boolean;
}

type FilterType = "new" | "top" | "discussed";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function PostsTab({ userId, username, isOwner }: PostsTabProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FilterType>("new");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [username, filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/users/${username}/posts?filter=${filter}&page=${page}&limit=10`
      );
      if (res.ok) {
        const json = await res.json();
        setPosts(page === 1 ? json.posts : [...posts, ...json.posts]);
        setHasMore(json.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
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
            className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex gap-2">
          <FilterButton
            active={filter === "new"}
            onClick={() => setFilter("new")}
            icon={<Clock className="h-4 w-4" />}
            label="New"
          />
          <FilterButton
            active={filter === "top"}
            onClick={() => setFilter("top")}
            icon={<TrendingUp className="h-4 w-4" />}
            label="Top"
          />
          <FilterButton
            active={filter === "discussed"}
            onClick={() => setFilter("discussed")}
            icon={<MessageCircle className="h-4 w-4" />}
            label="Most Discussed"
          />
        </div>
        <span className="text-sm text-gray-500">{posts.length} posts</span>
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              index={index}
              username={username}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            {isOwner ? "You haven't posted yet" : "No posts yet"}
          </p>
        </div>
      )}

      {/* Load More */}
      {hasMore && posts.length > 0 && (
        <button
          onClick={() => {
            setPage((p) => p + 1);
            fetchPosts();
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

function FilterButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-purple-600 text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PostCard({
  post,
  index,
  username,
}: {
  post: Post;
  index: number;
  username: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <Link href={`/community/posts/${post.id}`}>
        <p className="mb-4 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
          {post.content}
        </p>
      </Link>

      {/* Post Meta */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <button className="flex items-center gap-1.5 transition-colors hover:text-red-500">
            <Heart
              className={`h-4 w-4 ${
                post.isLiked ? "fill-red-500 text-red-500" : ""
              }`}
            />
            <span>{post.likesCount}</span>
          </button>
          <Link
            href={`/community/posts/${post.id}`}
            className="flex items-center gap-1.5 transition-colors hover:text-blue-500"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </Link>
          <button className="flex items-center gap-1.5 transition-colors hover:text-purple-500">
            <Bookmark
              className={`h-4 w-4 ${
                post.isBookmarked ? "fill-purple-500 text-purple-500" : ""
              }`}
            />
            <span>{post.bookmarksCount}</span>
          </button>
        </div>

        <span className="text-xs text-gray-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}
