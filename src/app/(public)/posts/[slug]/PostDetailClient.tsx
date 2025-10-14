"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  Award,
  Users,
  Clock,
  ChevronLeft,
  Send,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2,
  CheckCircle,
  Sparkles,
  Zap,
} from "lucide-react";

interface Author {
  id: string;
  name: string;
  username: string;
  image: string | null;
  dynastyScore: number;
  level: number;
  _count: {
    posts: number;
    followers: number;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  hotScore: number;
  publishedAt: string;
  author: Author;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    level: number;
  };
  _count: {
    replies: number;
  };
}

interface PostDetailClientProps {
  initialPost: Post;
  initialComments: Comment[];
  initialLiked: boolean;
  initialSaved: boolean;
}

export default function PostDetailClient({
  initialPost,
  initialComments,
  initialLiked,
  initialSaved,
}: PostDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialComments);
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>(
    {}
  );

  // Show loading state if post is not loaded
  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-slate-600 text-lg">Loading post...</p>
        </div>
      </div>
    );
  }

  // Handle like toggle
  const handleLike = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const previousLiked = liked;
    const previousCount = post.likeCount;

    // Optimistic update
    setLiked(!liked);
    setPost((prev) => ({
      ...prev,
      likeCount: liked ? prev.likeCount - 1 : prev.likeCount + 1,
    }));

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await res.json();
      setPost((prev) => ({ ...prev, likeCount: data.likeCount }));
    } catch (error) {
      // Revert on error
      setLiked(previousLiked);
      setPost((prev) => ({ ...prev, likeCount: previousCount }));
      console.error("Error toggling like:", error);
    }
  };

  // Handle save toggle
  const handleSave = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const previousSaved = saved;
    const previousCount = post.saveCount;

    // Optimistic update
    setSaved(!saved);
    setPost((prev) => ({
      ...prev,
      saveCount: saved ? prev.saveCount - 1 : prev.saveCount + 1,
    }));

    try {
      const res = await fetch(`/api/posts/${post.id}/save`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle save");
      }

      const data = await res.json();
      setPost((prev) => ({ ...prev, saveCount: data.saveCount }));
    } catch (error) {
      // Revert on error
      setSaved(previousSaved);
      setPost((prev) => ({ ...prev, saveCount: previousCount }));
      console.error("Error toggling save:", error);
    }
  };

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      setShowShareMenu(true);
      setTimeout(() => setShowShareMenu(false), 2000);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!commentContent.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });

      if (!res.ok) {
        throw new Error("Failed to post comment");
      }

      const data = await res.json();

      // Add new comment to list
      setComments([data.comment, ...comments]);
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
      setCommentContent("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle comment like toggle
  const handleCommentLike = async (commentId: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const isLiked = commentLikes[commentId] || false;

    // Optimistic update
    setCommentLikes((prev) => ({ ...prev, [commentId]: !isLiked }));
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              likeCount: isLiked
                ? comment.likeCount - 1
                : comment.likeCount + 1,
            }
          : comment
      )
    );

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle comment like");
      }
    } catch (error) {
      // Revert on error
      setCommentLikes((prev) => ({ ...prev, [commentId]: isLiked }));
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likeCount: isLiked
                  ? comment.likeCount + 1
                  : comment.likeCount - 1,
              }
            : comment
        )
      );
      console.error("Error toggling comment like:", error);
    }
  };

  // Handle reply click
  const handleReplyClick = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyContent(""); // Clear reply content when toggling
  };

  // Handle reply submission
  const handleReplySubmit = async (parentId: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!replyContent.trim()) return;

    setIsReplySubmitting(true);

    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          parentId: parentId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to post reply");
      }

      const data = await res.json();

      // Update the parent comment's reply count
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                _count: {
                  ...comment._count,
                  replies: comment._count.replies + 1,
                },
              }
            : comment
        )
      );

      // Update post comment count
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));

      // Clear reply form
      setReplyContent("");
      setReplyingTo(null);

      // Auto-expand replies to show the new reply
      await fetchReplies(parentId);
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setIsReplySubmitting(false);
    }
  };

  // Fetch replies for a comment
  const fetchReplies = async (commentId: string) => {
    if (loadingReplies[commentId]) return; // Prevent duplicate requests

    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

    try {
      const res = await fetch(
        `/api/posts/${post.id}/comments?parentId=${commentId}&limit=50`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch replies");
      }

      const data = await res.json();
      setReplies((prev) => ({ ...prev, [commentId]: data.comments || [] }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Toggle replies visibility
  const toggleReplies = async (commentId: string) => {
    const isExpanded = expandedReplies[commentId];

    if (!isExpanded && !replies[commentId]) {
      // Fetch replies if not already loaded
      await fetchReplies(commentId);
    }

    setExpandedReplies((prev) => ({ ...prev, [commentId]: !isExpanded }));
  };

  // Format time ago
  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-purple-100/50"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Community</span>
          </Link>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Post Card */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 overflow-hidden border border-purple-100/50"
            >
              {/* Cover Image */}
              {post.coverImage && (
                <div className="relative h-80 w-full overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Floating Stats */}
                  <div className="absolute bottom-4 left-4 flex gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">
                        {post.viewCount} views
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">
                        Hot Score: {Math.round(post.hotScore)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Post Content */}
              <div className="p-8">
                {/* Title */}
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  {post.title}
                </h1>

                {/* Author & Meta */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white">
                        <Image
                          src={post.author.image || "/default-avatar.png"}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-white">
                        <span className="text-white text-xs font-bold">
                          {post.author.level}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {post.author.name}
                        </h3>
                        {post.author.level >= 5 && (
                          <CheckCircle className="w-4 h-4 text-purple-500 fill-purple-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>@{post.author.username}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            {post.author.dynastyScore.toLocaleString()} DS
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{timeAgo(post.publishedAt)}</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/community?topic=${tag}`}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-sm font-medium hover:from-purple-100 hover:to-pink-100 transition-all hover:scale-105"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Post Content */}
                <div className="prose prose-lg prose-slate max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      liked
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? "fill-white" : ""}`} />
                    <span>{post.likeCount}</span>
                  </motion.button>

                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium transition-all">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.commentCount}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium transition-all relative"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>

                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute -top-12 left-0 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg whitespace-nowrap"
                        >
                          Link copied! ✓
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ml-auto ${
                      saved
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${saved ? "fill-white" : ""}`}
                    />
                    <span>{saved ? "Saved" : "Save"}</span>
                  </motion.button>
                </div>
              </div>
            </motion.article>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 overflow-hidden border border-purple-100/50 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Discussion ({post.commentCount})
                </h2>
              </div>

              {/* Comment Form */}
              {session ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-200">
                        <Image
                          src={session.user?.image || "/default-avatar.png"}
                          alt={session.user?.name || "You"}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 resize-none transition-all text-slate-900 placeholder:text-slate-400 bg-white"
                        rows={3}
                      />

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-slate-500">
                          {commentContent.length}/2000
                        </span>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={!commentContent.trim() || isSubmitting}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg shadow-purple-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Posting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Post Comment (+3 DS)</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                  <p className="text-slate-700 mb-3">
                    Sign in to join the discussion and earn Dynasty Score!
                  </p>
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg shadow-purple-200 hover:shadow-xl transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                <AnimatePresence>
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-200 group-hover:ring-purple-200 transition-all">
                          <Image
                            src={comment.author.image || "/default-avatar.png"}
                            alt={comment.author.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-white">
                          <span className="text-white text-[10px] font-bold">
                            {comment.author.level}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${comment.author.username}`}
                              className="font-semibold text-slate-900 hover:text-purple-600 transition-colors"
                            >
                              {comment.author.name}
                            </Link>
                            <span className="text-sm text-slate-500">
                              @{comment.author.username}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-slate-500">
                              {timeAgo(comment.createdAt)}
                            </span>
                          </div>

                          <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 rounded-lg transition-all">
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>

                        <p className="text-slate-700 mb-3 leading-relaxed">
                          {comment.content}
                        </p>

                        <div className="flex items-center gap-4">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                              commentLikes[comment.id]
                                ? "text-pink-600"
                                : "text-slate-500 hover:text-pink-600"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                commentLikes[comment.id] ? "fill-pink-600" : ""
                              }`}
                            />
                            <span>{comment.likeCount}</span>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReplyClick(comment.id)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                              replyingTo === comment.id
                                ? "text-purple-600"
                                : "text-slate-500 hover:text-purple-600"
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Reply</span>
                          </motion.button>

                          {comment._count.replies > 0 && (
                            <button
                              onClick={() => toggleReplies(comment.id)}
                              disabled={loadingReplies[comment.id]}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {loadingReplies[comment.id] ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <>
                                  {expandedReplies[comment.id]
                                    ? "Hide"
                                    : "View"}{" "}
                                  {comment._count.replies}{" "}
                                  {comment._count.replies === 1
                                    ? "reply"
                                    : "replies"}
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Reply Form - Show when replying to this comment */}
                        <AnimatePresence>
                          {replyingTo === comment.id && session && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pl-4 border-l-2 border-purple-200"
                            >
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-purple-200 flex-shrink-0">
                                  <Image
                                    src={
                                      session.user?.image ||
                                      "/default-avatar.png"
                                    }
                                    alt={session.user?.name || "You"}
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                      setReplyContent(e.target.value)
                                    }
                                    placeholder={`Reply to ${comment.author.name}...`}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none text-sm text-slate-900 placeholder:text-slate-400 bg-white"
                                    rows={2}
                                    disabled={isReplySubmitting}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() =>
                                        handleReplySubmit(comment.id)
                                      }
                                      disabled={
                                        isReplySubmitting ||
                                        !replyContent.trim()
                                      }
                                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isReplySubmitting
                                        ? "Posting..."
                                        : "Reply"}
                                    </button>
                                    <button
                                      onClick={() => setReplyingTo(null)}
                                      disabled={isReplySubmitting}
                                      className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Nested Replies - Show when expanded */}
                        <AnimatePresence>
                          {expandedReplies[comment.id] &&
                            replies[comment.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pl-4 border-l-2 border-purple-200 space-y-3"
                              >
                                {replies[comment.id].map((reply) => (
                                  <motion.div
                                    key={reply.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-3 p-3 rounded-lg bg-gradient-to-br from-white to-purple-50/30 border border-purple-100"
                                  >
                                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-purple-200 flex-shrink-0">
                                      <Image
                                        src={
                                          reply.author.image ||
                                          "/default-avatar.png"
                                        }
                                        alt={reply.author.name}
                                        width={32}
                                        height={32}
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-slate-800 text-sm">
                                          {reply.author.name}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          @{reply.author.username}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          ·
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          {timeAgo(reply.createdAt)}
                                        </span>
                                        <div className="ml-auto px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                                          L{reply.author.level}
                                        </div>
                                      </div>
                                      <p className="text-slate-700 text-sm leading-relaxed break-words">
                                        {reply.content}
                                      </p>
                                      <div className="flex items-center gap-3 mt-2">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() =>
                                            handleCommentLike(reply.id)
                                          }
                                          className={`flex items-center gap-1 text-sm transition-colors ${
                                            commentLikes[reply.id]
                                              ? "text-pink-500"
                                              : "text-slate-500 hover:text-pink-500"
                                          }`}
                                        >
                                          <Heart
                                            className={`w-3.5 h-3.5 ${
                                              commentLikes[reply.id]
                                                ? "fill-current"
                                                : ""
                                            }`}
                                          />
                                          <span className="font-medium">
                                            {reply.likeCount}
                                          </span>
                                        </motion.button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {comments.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-slate-500 text-lg">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 overflow-hidden border border-purple-100/50 p-6"
            >
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50" />
                  <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-white">
                    <Image
                      src={post.author.image || "/default-avatar.png"}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                    <span className="text-white text-sm font-bold">
                      Level {post.author.level}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {post.author.name}
                </h3>
                <p className="text-slate-500 mb-4">@{post.author.username}</p>

                <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {post.author._count.posts}
                    </div>
                    <div className="text-xs text-slate-500">Posts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {post.author._count.followers}
                    </div>
                    <div className="text-xs text-slate-500">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      {post.author.dynastyScore.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">DS</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="block w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg shadow-purple-200 hover:shadow-xl transition-all"
                  >
                    View Profile
                  </Link>

                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`w-full px-4 py-2.5 rounded-xl font-medium transition-all ${
                      isFollowing
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 overflow-hidden border border-purple-100/50 p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                More from {post.author.name}
              </h3>

              <div className="text-sm text-slate-500">Coming soon...</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
