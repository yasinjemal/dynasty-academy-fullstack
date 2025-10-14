"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Flame,
  Award,
  Heart,
  MessageCircle,
  Eye,
} from "lucide-react";

interface OverviewTabProps {
  userId: string;
  username: string;
  isOwner: boolean;
}

interface ProfileData {
  readingStats: {
    booksCompleted: number;
    readingMinutesLifetime: number;
    currentStreak: number;
    currentBook?: {
      id: string;
      title: string;
      coverImage: string;
      currentPage: number;
      totalPages: number;
    };
  };
  recentPosts: Array<{
    id: string;
    content: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
  }>;
  recentReflections: Array<{
    id: string;
    content: string;
    createdAt: string;
    book: {
      id: string;
      title: string;
      coverImage: string;
    };
  }>;
  topAchievements: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    tier: string;
    iconUrl?: string;
  }>;
}

export default function OverviewTab({
  userId,
  username,
  isOwner,
}: OverviewTabProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, [userId]);

  const fetchOverviewData = async () => {
    try {
      const res = await fetch(`/api/users/${username}/overview`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Unable to load profile data
        </p>
      </div>
    );
  }

  const { readingStats, recentPosts, recentReflections, topAchievements } =
    data;

  return (
    <div className="space-y-8">
      {/* Reading Snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:border-gray-800 dark:from-purple-950/20 dark:via-gray-900 dark:to-blue-950/20"
      >
        <div className="p-6">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Reading Journey
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Books Finished"
              value={readingStats.booksCompleted}
              color="purple"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Minutes Read"
              value={readingStats.readingMinutesLifetime.toLocaleString()}
              color="blue"
            />
            <StatCard
              icon={<Flame className="h-5 w-5" />}
              label="Day Streak"
              value={readingStats.currentStreak}
              color="orange"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="This Week"
              value="+3h 24m"
              color="green"
            />
          </div>

          {/* Currently Reading */}
          {readingStats.currentBook && (
            <div className="mt-6 rounded-xl bg-white/60 p-4 backdrop-blur-sm dark:bg-gray-900/60">
              <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Currently Reading
              </p>
              <div className="flex gap-4">
                <img
                  src={readingStats.currentBook.coverImage}
                  alt={readingStats.currentBook.title}
                  className="h-20 w-14 rounded-lg object-cover shadow-md"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {readingStats.currentBook.title}
                  </h4>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        Page {readingStats.currentBook.currentPage} of{" "}
                        {readingStats.currentBook.totalPages}
                      </span>
                      <span>
                        {Math.round(
                          (readingStats.currentBook.currentPage /
                            readingStats.currentBook.totalPages) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{
                          width: `${(readingStats.currentBook.currentPage / readingStats.currentBook.totalPages) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Top Achievements */}
      {topAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Achievements
            </h3>
            <Link
              href={`/@${username}?tab=achievements`}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View All
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topAchievements.slice(0, 6).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Latest Posts */}
      {recentPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Latest Posts
            </h3>
            <Link
              href={`/@${username}?tab=posts`}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentPosts.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Latest Reflections */}
      {recentReflections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Eye className="h-5 w-5 text-purple-600" />
              Latest Reflections
            </h3>
            <Link
              href={`/@${username}?tab=reflections`}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentReflections.slice(0, 3).map((reflection) => (
              <ReflectionCard key={reflection.id} reflection={reflection} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {recentPosts.length === 0 &&
        recentReflections.length === 0 &&
        topAchievements.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isOwner ? "Your journey begins" : "Their journey begins"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isOwner
                ? "Start reading, posting, and earning achievements to build your profile"
                : "No activity yet. Check back later!"}
            </p>
          </div>
        )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    green: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  };

  return (
    <div className="rounded-xl bg-white/80 p-4 backdrop-blur-sm dark:bg-gray-900/80">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

// Achievement Card Component
function AchievementCard({ achievement }: { achievement: any }) {
  const tierColors = {
    BRONZE: "from-orange-400 to-orange-600",
    SILVER: "from-gray-300 to-gray-500",
    GOLD: "from-yellow-400 to-yellow-600",
    ELITE: "from-purple-500 to-pink-500",
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity group-hover:opacity-10 ${tierColors[achievement.tier as keyof typeof tierColors]}`}
      />
      <div className="relative">
        <div className="mb-2 text-3xl">{achievement.iconUrl || "🏆"}</div>
        <h4 className="font-semibold">{achievement.title}</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {achievement.description}
        </p>
        <span
          className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
            achievement.tier === "ELITE"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {achievement.tier}
        </span>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post }: { post: any }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-purple-300 hover:bg-white dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800">
      <p className="mb-3 line-clamp-3 text-gray-700 dark:text-gray-300">
        {post.content}
      </p>
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          {post.likesCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          {post.commentsCount}
        </span>
        <span className="ml-auto text-xs">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// Reflection Card Component
function ReflectionCard({ reflection }: { reflection: any }) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-purple-300 hover:bg-white dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800">
      <img
        src={reflection.book.coverImage}
        alt={reflection.book.title}
        className="h-20 w-14 rounded-lg object-cover shadow-sm"
      />
      <div className="flex-1">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          {reflection.book.title}
        </p>
        <p className="line-clamp-2 text-gray-700 dark:text-gray-300">
          {reflection.content}
        </p>
        <span className="mt-2 inline-block text-xs text-gray-500">
          {new Date(reflection.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
