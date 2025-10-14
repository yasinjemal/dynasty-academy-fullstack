"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Eye,
  Trophy,
  UserPlus,
  BookOpen,
  Heart,
  Bookmark,
  Star,
} from "lucide-react";
import Link from "next/link";

interface ActivityTabProps {
  userId: string;
  username: string;
  isOwner: boolean;
}

type ActivityType =
  | "POST"
  | "REFLECTION"
  | "ACHIEVEMENT"
  | "FOLLOW"
  | "BOOK_START"
  | "BOOK_FINISH"
  | "COLLECTION_CREATE";

interface ActivityItem {
  id: string;
  type: ActivityType;
  createdAt: string;
  data: any;
}

export default function ActivityTab({
  userId,
  username,
  isOwner,
}: ActivityTabProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [username, page]);

  const fetchActivities = async () => {
    try {
      const res = await fetch(
        `/api/users/${username}/activity?page=${page}&limit=20`
      );
      if (res.ok) {
        const json = await res.json();
        setActivities((prev) =>
          page === 1 ? json.activities : [...prev, ...json.activities]
        );
        setHasMore(json.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No activity yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {isOwner
            ? "Start reading, posting, and engaging to see your activity here"
            : "Check back later for updates"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-blue-200 to-transparent dark:from-purple-900 dark:via-blue-900" />

        {/* Activity Items */}
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              index={index}
              username={username}
            />
          ))}
        </div>
      </div>

      {/* Load More */}
      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

// Activity Card Component
function ActivityCard({
  activity,
  index,
  username,
}: {
  activity: ActivityItem;
  index: number;
  username: string;
}) {
  const config = getActivityConfig(activity.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative pl-16"
    >
      {/* Icon Circle */}
      <div
        className={`absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br shadow-lg dark:border-gray-950 ${config.gradient}`}
      >
        {config.icon}
      </div>

      {/* Content Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4">
          {/* Header */}
          <div className="mb-2 flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {config.title}
            </h4>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(activity.createdAt)}
            </span>
          </div>

          {/* Activity Content */}
          {renderActivityContent(activity, username)}
        </div>
      </div>
    </motion.div>
  );
}

// Get activity config (icon, color, title)
function getActivityConfig(type: ActivityType) {
  const configs = {
    POST: {
      icon: <MessageCircle className="h-5 w-5 text-white" />,
      gradient: "from-blue-500 to-blue-600",
      title: "Posted",
    },
    REFLECTION: {
      icon: <Eye className="h-5 w-5 text-white" />,
      gradient: "from-purple-500 to-purple-600",
      title: "Reflected",
    },
    ACHIEVEMENT: {
      icon: <Trophy className="h-5 w-5 text-white" />,
      gradient: "from-yellow-500 to-yellow-600",
      title: "Unlocked Achievement",
    },
    FOLLOW: {
      icon: <UserPlus className="h-5 w-5 text-white" />,
      gradient: "from-green-500 to-green-600",
      title: "Followed",
    },
    BOOK_START: {
      icon: <BookOpen className="h-5 w-5 text-white" />,
      gradient: "from-indigo-500 to-indigo-600",
      title: "Started Reading",
    },
    BOOK_FINISH: {
      icon: <Star className="h-5 w-5 text-white" />,
      gradient: "from-pink-500 to-pink-600",
      title: "Finished Book",
    },
    COLLECTION_CREATE: {
      icon: <Bookmark className="h-5 w-5 text-white" />,
      gradient: "from-orange-500 to-orange-600",
      title: "Created Collection",
    },
  };

  return configs[type] || configs.POST;
}

// Render activity content based on type
function renderActivityContent(activity: ActivityItem, username: string) {
  switch (activity.type) {
    case "POST":
      return (
        <div>
          <p className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
            {activity.data.content}
          </p>
          {activity.data.likesCount > 0 && (
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {activity.data.likesCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {activity.data.commentsCount}
              </span>
            </div>
          )}
        </div>
      );

    case "REFLECTION":
      return (
        <div className="flex gap-3">
          <img
            src={activity.data.book.coverImage}
            alt={activity.data.book.title}
            className="h-16 w-12 rounded-lg object-cover shadow-sm"
          />
          <div className="flex-1">
            <p className="mb-1 text-xs text-gray-500">
              {activity.data.book.title}
            </p>
            <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
              {activity.data.content}
            </p>
          </div>
        </div>
      );

    case "ACHIEVEMENT":
      return (
        <div className="flex items-center gap-3">
          <div className="text-3xl">{activity.data.iconUrl || "🏆"}</div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {activity.data.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activity.data.description}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                activity.data.tier === "ELITE"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {activity.data.tier}
            </span>
          </div>
        </div>
      );

    case "FOLLOW":
      return (
        <div className="flex items-center gap-3">
          <img
            src={activity.data.user.image || "/default-avatar.png"}
            alt={activity.data.user.name}
            className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
          />
          <div>
            <Link
              href={`/@${activity.data.user.username}`}
              className="font-semibold hover:text-purple-600 dark:hover:text-purple-400"
            >
              {activity.data.user.name}
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              @{activity.data.user.username}
            </p>
          </div>
        </div>
      );

    case "BOOK_START":
    case "BOOK_FINISH":
      return (
        <div className="flex gap-3">
          <img
            src={activity.data.book.coverImage}
            alt={activity.data.book.title}
            className="h-20 w-14 rounded-lg object-cover shadow-sm"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {activity.data.book.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {activity.data.book.author}
            </p>
            {activity.type === "BOOK_FINISH" && (
              <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                <Star className="h-4 w-4 fill-current" />
                <span>Completed!</span>
              </div>
            )}
          </div>
        </div>
      );

    case "COLLECTION_CREATE":
      return (
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {activity.data.collection.name}
          </p>
          {activity.data.collection.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {activity.data.collection.description}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}

// Format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
