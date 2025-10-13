"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Edit2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Clock,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  published: boolean;
  publishedAt: Date;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

interface BookAIPostsManagerProps {
  bookId: string;
  bookTitle: string;
}

export default function BookAIPostsManager({
  bookId,
  bookTitle,
}: BookAIPostsManagerProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
  });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<
    "immediate" | "daily" | "weekly" | "staggered"
  >("daily");
  const [intervalDays, setIntervalDays] = useState(1);

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, [bookId]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/books/${bookId}/ai-posts`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load AI-generated posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/books/${bookId}/ai-posts?postId=${postId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      toast.success("Post deleted successfully");
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const startEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      tags: post.tags.join(", "),
    });
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditForm({ title: "", content: "", excerpt: "", tags: "" });
  };

  const saveEdit = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/books/${bookId}/ai-posts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          title: editForm.title,
          content: editForm.content,
          excerpt: editForm.excerpt,
          tags: editForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      const data = await response.json();
      toast.success("Post updated successfully");

      // Update local state
      setPosts(posts.map((p) => (p.id === postId ? data.post : p)));
      cancelEdit();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  };

  const togglePublished = async (postId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/books/${bookId}/ai-posts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          published: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle publish status");
      }

      const data = await response.json();
      toast.success(
        data.post.published ? "Post published" : "Post unpublished"
      );

      setPosts(posts.map((p) => (p.id === postId ? data.post : p)));
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Failed to update publish status");
    }
  };

  const regeneratePosts = async () => {
    if (!confirm("This will generate NEW posts for this book. Continue?")) {
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch("/api/admin/books/generate-feed-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          bookTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate posts");
      }

      const data = await response.json();
      toast.success(`Generated ${data.posts?.length || 0} new posts!`);
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error("Error regenerating posts:", error);
      toast.error("Failed to regenerate posts");
    } finally {
      setIsRegenerating(false);
    }
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const selectAllPosts = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map((p) => p.id));
    }
  };

  const handleSchedulePosts = async () => {
    if (selectedPosts.length === 0) {
      toast.error("Please select posts to schedule");
      return;
    }

    try {
      const response = await fetch("/api/admin/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: selectedPosts,
          scheduleType,
          startDate: new Date(),
          intervalDays,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule posts");
      }

      const data = await response.json();
      toast.success(`Scheduled ${data.posts?.length || 0} posts!`);
      setShowScheduler(false);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      console.error("Error scheduling posts:", error);
      toast.error("Failed to schedule posts");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI-Generated Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {posts.length} posts created for "{bookTitle}"
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPosts.length > 0 && (
            <Button
              onClick={() => setShowScheduler(!showScheduler)}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Clock className="w-4 h-4 mr-2" />
              Schedule ({selectedPosts.length})
            </Button>
          )}
          <Button
            onClick={regeneratePosts}
            disabled={isRegenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Posts
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Scheduler Panel */}
      {showScheduler && selectedPosts.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Schedule {selectedPosts.length} Posts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Schedule Type
              </Label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="immediate">Publish All Now</option>
                <option value="daily">One Per Day</option>
                <option value="weekly">One Per Week</option>
                <option value="staggered">Custom Interval</option>
              </select>
            </div>
            {scheduleType === "staggered" && (
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Days Between Posts
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={intervalDays}
                  onChange={(e) =>
                    setIntervalDays(parseInt(e.target.value) || 1)
                  }
                  className="w-full"
                />
              </div>
            )}
            <div className="flex items-end">
              <Button
                onClick={handleSchedulePosts}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Apply Schedule
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {scheduleType === "immediate" &&
              "All posts will be published immediately"}
            {scheduleType === "daily" &&
              `Posts will be published one per day over ${selectedPosts.length} days`}
            {scheduleType === "weekly" &&
              `Posts will be published one per week over ${selectedPosts.length} weeks`}
            {scheduleType === "staggered" &&
              `Posts will be published every ${intervalDays} day(s)`}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Posts
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {posts.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Likes
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {posts.reduce((sum, p) => sum + p.likeCount, 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Comments
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {posts.reduce((sum, p) => sum + p.commentCount, 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Views
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {posts.reduce((sum, p) => sum + p.viewCount, 0)}
          </div>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No AI Posts Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate engaging community posts automatically
          </p>
          <Button
            onClick={regeneratePosts}
            disabled={isRegenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Posts Now
          </Button>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPosts.length === posts.length}
                onChange={selectAllPosts}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select All ({posts.length})
              </span>
            </label>
            {selectedPosts.length > 0 && (
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {selectedPosts.length} selected
              </span>
            )}
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 transition-colors ${
                  selectedPosts.includes(post.id)
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {editingPostId === post.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <Input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      placeholder="Post title"
                      className="font-semibold text-lg"
                    />
                    <Textarea
                      value={editForm.excerpt}
                      onChange={(e) =>
                        setEditForm({ ...editForm, excerpt: e.target.value })
                      }
                      placeholder="Excerpt (optional)"
                      rows={2}
                    />
                    <Textarea
                      value={editForm.content}
                      onChange={(e) =>
                        setEditForm({ ...editForm, content: e.target.value })
                      }
                      placeholder="Post content"
                      rows={8}
                    />
                    <Input
                      value={editForm.tags}
                      onChange={(e) =>
                        setEditForm({ ...editForm, tags: e.target.value })
                      }
                      placeholder="Tags (comma separated)"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveEdit(post.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button onClick={cancelEdit} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => togglePostSelection(post.id)}
                          className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() =>
                            togglePublished(post.id, post.published)
                          }
                          variant="outline"
                          size="sm"
                          className={
                            post.published
                              ? "bg-green-50 dark:bg-green-900/20"
                              : ""
                          }
                        >
                          {post.published ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Published
                            </>
                          ) : (
                            "Unpublished"
                          )}
                        </Button>
                        <Button
                          onClick={() => startEdit(post)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(post.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none mb-4">
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.viewCount} views
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likeCount} likes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.commentCount} comments
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
