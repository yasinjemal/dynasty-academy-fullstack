"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ArrowLeft,
  Eye,
  TrendingUp,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
    dynastyScore: number;
  };
  replies?: Comment[];
}

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: Date;
  viewCount: number;
  hotScore: number;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    username: string | null;
    dynastyScore: number;
    _count: {
      posts: number;
      followers: number;
    };
  };
  comments: Comment[];
  _count: {
    likes: number;
    comments: number;
  };
  userLiked: boolean;
  isAuthor: boolean;
}

export default function PostDetailClient({
  post,
  currentUser,
}: {
  post: Post;
  currentUser: any;
}) {
  const [liked, setLiked] = useState(post.userLiked);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        setLiked(!liked);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error("Please sign in to save posts");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/save`, {
        method: "POST",
      });

      if (response.ok) {
        setSaved(!saved);
        toast.success(saved ? "Removed from saved" : "Post saved!");
      }
    } catch (error) {
      toast.error("Failed to save post");
    }
  };

  const handleComment = async () => {
    if (!currentUser) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText,
          parentId: replyTo,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();

        if (replyTo) {
          // Add reply to parent comment
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === replyTo) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                };
              }
              return comment;
            })
          );
        } else {
          // Add new top-level comment
          setComments((prev) => [newComment, ...prev]);
        }

        setCommentText("");
        setReplyTo(null);
        toast.success("Comment posted!");
      }
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || "Check out this post!",
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back to Community</span>
      </Link>

      {/* Post Card */}
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        {/* Featured Image */}
        {post.coverImage && (
          <div className="relative w-full h-96">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-black mb-4 text-slate-900">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              {/* Author */}
              <Link
                href={`/profile/${post.author.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || "User"}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {post.author.name?.[0] || "U"}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900">{post.author.name}</p>
                  <p className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </p>
                </div>
              </Link>

              {/* Dynasty Score */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-900">
                  {post.author.dynastyScore.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount.toLocaleString()} views</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                liked
                  ? "bg-red-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-500 font-semibold transition-all">
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-green-50 hover:text-green-500 font-semibold transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                saved
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-500"
              }`}
            >
              <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-black mb-6">
          Comments ({comments.length})
        </h2>

        {/* Comment Input */}
        {currentUser ? (
          <div className="mb-8">
            {replyTo && (
              <div className="flex items-center justify-between mb-2 p-2 bg-purple-50 rounded-lg">
                <span className="text-sm text-purple-700">
                  Replying to comment
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <Image
                src={currentUser.image || "/default-avatar.png"}
                alt={currentUser.name || "You"}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || submitting}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-slate-600">
              <Link
                href="/auth/signin"
                className="text-purple-600 font-semibold hover:underline"
              >
                Sign in
              </Link>{" "}
              to join the conversation
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-slate-200 pl-4">
              <div className="flex gap-3 mb-3">
                <Image
                  src={comment.author.image || "/default-avatar.png"}
                  alt={comment.author.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                  </div>
                  <p className="text-slate-700 mb-2">{comment.content}</p>
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Image
                        src={reply.author.image || "/default-avatar.png"}
                        alt={reply.author.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-900">
                            {reply.author.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(reply.createdAt))} ago
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
