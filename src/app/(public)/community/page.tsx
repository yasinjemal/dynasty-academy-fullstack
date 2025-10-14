"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Loader2,
  TrendingUp,
  Users,
  Hash,
  Flame,
  Trophy,
  Zap,
  Target,
  Award,
  Crown,
  Sparkles,
  MessageCircle,
  Eye,
  Bookmark,
  Share2,
  ArrowUp,
  MoreVertical,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedItem, type FeedItemData } from "@/components/community/FeedItem";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Tab = "hot" | "following" | "topic";

interface TopicCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface RecentActivity {
  id: string;
  action: string;
  points: number;
  time: string;
}

const TOPICS: TopicCategory[] = [
  { id: "mindset", name: "Mindset", icon: "🧠", color: "purple", count: 234 },
  { id: "business", name: "Business", icon: "💼", color: "blue", count: 189 },
  { id: "finance", name: "Finance", icon: "💰", color: "green", count: 156 },
  {
    id: "leadership",
    name: "Leadership",
    icon: "👑",
    color: "yellow",
    count: 145,
  },
  { id: "health", name: "Health", icon: "❤️", color: "red", count: 198 },
  {
    id: "relationships",
    name: "Relationships",
    icon: "💕",
    color: "pink",
    count: 134,
  },
  {
    id: "spirituality",
    name: "Spirituality",
    icon: "✨",
    color: "indigo",
    count: 112,
  },
  { id: "general", name: "General", icon: "☁️", color: "gray", count: 267 },
];

export default function CommunityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("hot");
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Mock Dynasty Score data (replace with real API call)
  const [dynastyScore] = useState(1450);
  const [level] = useState(4);
  const [streak] = useState(7);
  const [nextLevelPoints] = useState(150);
  const [recentActivity] = useState<RecentActivity[]>([
    { id: "1", action: "Post created", points: 10, time: "2 hours ago" },
    { id: "2", action: "Comment added", points: 3, time: "5 hours ago" },
    { id: "3", action: "Post liked", points: 2, time: "1 day ago" },
  ]);

  useEffect(() => {
    if (!searchParams) return;
    
    const tabParam = searchParams.get("tab") as Tab;
    const topicParam = searchParams.get("topic");

    if (tabParam && ["hot", "following", "topic"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (topicParam) {
      setTopic(topicParam);
      setActiveTab("topic");
    }
  }, [searchParams]);

  const fetchFeed = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        tab: activeTab,
      });

      if (activeTab === "topic" && topic) {
        params.append("topic", topic);
      }

      const response = await fetch(`/api/feed?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch feed");
      }

      if (append) {
        setFeedItems((prev) => [...prev, ...data.feedItems]);
      } else {
        setFeedItems(data.feedItems);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (error: any) {
      console.error("Error fetching feed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load feed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setFeedItems([]);
    setPage(1);
    setHasMore(true);
    fetchFeed(1, false);
  }, [activeTab, topic]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (tab === "topic" && topic) {
      params.set("topic", topic);
    }
    router.push(`/community?${params.toString()}`);
  };

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(topicId);
    setTopic(topicId);
    setActiveTab("topic");
    router.push(`/community?tab=topic&topic=${topicId}`);
  };

  const handleLike = async (itemId: string, type: "POST" | "REFLECTION") => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like content",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpoint =
        type === "POST"
          ? `/api/posts/${itemId}/like`
          : `/api/reflections/${itemId}/like`;
      const response = await fetch(endpoint, { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to like");
      }

      setFeedItems((prev) =>
        prev.map((item) => {
          if (type === "POST" && item.post?.id === itemId) {
            return {
              ...item,
              hasLiked: data.liked,
              post: {
                ...item.post!,
                likeCount: data.likeCount,
              },
            };
          }
          if (type === "REFLECTION" && item.reflection?.id === itemId) {
            return {
              ...item,
              hasLiked: data.liked,
              reflection: {
                ...item.reflection!,
                likeCount: data.likeCount,
              },
            };
          }
          return item;
        })
      );
    } catch (error: any) {
      console.error("Error liking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to like",
        variant: "destructive",
      });
    }
  };

  const handleComment = (itemId: string, type: "POST" | "REFLECTION") => {
    const item = feedItems.find((i) =>
      type === "POST" ? i.post?.id === itemId : i.reflection?.id === itemId
    );

    if (item) {
      const url =
        type === "POST"
          ? `/posts/${item.post!.slug}`
          : `/reflections/${itemId}`;
      router.push(url);
    }
  };

  const handleSave = async (itemId: string, type: "POST" | "REFLECTION") => {
    toast({
      title: "Coming Soon",
      description: "Collections feature is coming soon!",
    });
  };

  const handleShare = async (itemId: string, type: "POST" | "REFLECTION") => {
    const item = feedItems.find((i) =>
      type === "POST" ? i.post?.id === itemId : i.reflection?.id === itemId
    );

    if (item) {
      const url =
        type === "POST"
          ? `${window.location.origin}/posts/${item.post!.slug}`
          : `${window.location.origin}/reflections/${itemId}`;

      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchFeed(page + 1, true);
    }
  };

  const progressPercentage = Math.min((nextLevelPoints / 200) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-[#0F1C2E]/95 backdrop-blur-xl shadow-2xl">
        <div className="max-w-[1920px] mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-black text-white">
                  Dynasty Community
                </h1>
                <p className="text-xs text-gray-400 hidden md:block">
                  Share insights, earn Dynasty Points
                </p>
              </div>
            </Link>

            {/* Center Search - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, users, topics..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-slate-800/50 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              </Button>
              <Link href="/dashboard/leaderboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-slate-800/50"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 cursor-pointer transition-all group">
                  <Avatar className="w-8 h-8 ring-2 ring-orange-500/50 group-hover:ring-orange-500 transition-all">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold">
                      {session?.user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">
                      My Profile
                    </div>
                    <div className="text-xs text-gray-400">Level {level}</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Responsive Layout */}
      <div className="max-w-[1920px] mx-auto px-3 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* LEFT SIDEBAR - Hidden on mobile, shown on large screens */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Topics Section */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-white">Topics</h2>
                </div>
              </div>
              <div className="p-3">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                      selectedTopic === topic.id
                        ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50"
                        : "hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="text-2xl">{topic.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-white">
                        {topic.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {topic.count} posts
                      </div>
                    </div>
                    <ArrowUp className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Active Members</span>
                  <span className="text-lg font-bold text-white">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Posts Today</span>
                  <span className="text-lg font-bold text-green-400">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Dynasty Points Earned
                  </span>
                  <span className="text-lg font-bold text-orange-400">
                    45,678
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER - Main Feed - Full width on mobile, 6 cols on large */}
          <main className="col-span-1 lg:col-span-6">
            {/* Mobile Dynasty Score Banner - Only visible on mobile */}
            <div className="lg:hidden bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 mb-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-90 mb-1">
                    Your Dynasty Score
                  </div>
                  <div className="text-3xl font-black">
                    {dynastyScore.toLocaleString()}
                  </div>
                  <div className="text-xs flex items-center gap-2 mt-1">
                    <span>Level {level}</span>
                    {streak > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" /> {streak} days
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Link href="/dashboard/profile">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Feed Header with Tabs */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-xl md:rounded-2xl border border-slate-700/50 p-3 md:p-4 mb-4 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => handleTabChange("hot")}
                    className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                      activeTab === "hot"
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                        : "text-gray-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Flame className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">Hot</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("following")}
                    disabled={!session}
                    className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                      activeTab === "following"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                  >
                    <Users className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">Following</span>
                  </button>
                </div>

                {session && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-4 md:px-5 py-2 md:py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-105 w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base">Create Post</span>
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-md text-xs font-bold">
                      +10 DS
                    </span>
                  </Button>
                )}
              </div>
            </div>

            {/* Feed Content */}
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
                  <div className="absolute inset-0 blur-xl bg-orange-500/30 animate-pulse" />
                </div>
                <p className="mt-6 text-gray-400 text-lg">
                  Loading epic content...
                </p>
              </div>
            ) : feedItems.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 p-12 text-center backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/30 mb-6">
                  <MessageCircle className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Be the First!
                </h3>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  {activeTab === "following"
                    ? "Follow some amazing people to see their posts here!"
                    : "No posts yet. Share your wisdom and earn Dynasty Points!"}
                </p>
                {session && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-orange-500/30 text-lg"
                  >
                    <Plus className="mr-2 h-6 w-6" />
                    Create First Post
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {feedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <FeedItem
                      item={item}
                      onLike={handleLike}
                      onComment={handleComment}
                      onSave={handleSave}
                      onShare={handleShare}
                      currentUserId={session?.user?.id}
                    />
                  </div>
                ))}

                {hasMore && (
                  <div className="flex justify-center py-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold px-8 py-4 rounded-xl border border-slate-600 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Loading More...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-5 w-5" />
                          Load More Posts
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR - Hidden on mobile, shown on large screens */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Dynasty Score Widget */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-2xl shadow-orange-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Your Dynasty Score
                  </span>
                  <Sparkles className="w-5 h-5" />
                </div>

                <div className="text-5xl font-black mb-1">
                  {dynastyScore.toLocaleString()}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm opacity-90">Level {level}</span>
                  <Award className="w-4 h-4" />
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1 opacity-90">
                    <span>Level {level}</span>
                    <span>Level {level + 1}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-center mt-1 opacity-90">
                    {nextLevelPoints} points to next level
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                >
                  View Full Profile →
                </Button>
              </div>
            </div>

            {/* Streak Tracker */}
            {streak > 0 && (
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Daily Streak</h3>
                  <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-orange-500 mb-1">
                    {streak} Days
                  </div>
                  <p className="text-sm text-gray-400">
                    Keep it going! +2 DS daily
                  </p>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-white">
                    Recent Activity
                  </h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div>
                      <div className="text-sm text-white font-medium">
                        {activity.action}
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.time}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-400">
                      +{activity.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earn More Points */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-white">
                  Earn More Points
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Create Post</span>
                  <span className="font-bold text-orange-400">+10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Write Comment</span>
                  <span className="font-bold text-orange-400">+3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Get a Like</span>
                  <span className="font-bold text-orange-400">+2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Daily Login</span>
                  <span className="font-bold text-orange-400">+2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">7-Day Streak</span>
                  <span className="font-bold text-orange-400">+50</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Floating Action Button - Only visible on small screens */}
      {session && (
        <div className="lg:hidden fixed bottom-6 right-4 z-40">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-full w-14 h-14 shadow-2xl shadow-orange-500/50 hover:scale-110 transition-all flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setFeedItems([]);
          setPage(1);
          fetchFeed(1, false);
        }}
      />
    </div>
  );
}
