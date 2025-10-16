"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Heart,
  Trash2,
  Edit2,
  Clock,
  Play,
  BookmarkPlus,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VideoBookmark {
  id: string;
  timestamp: number;
  title: string;
  note?: string;
  createdAt: string;
}

interface BookmarksManagerProps {
  lessonId: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onJumpToTimestamp?: (timestamp: number) => void;
}

export function BookmarksManager({
  lessonId,
  videoRef,
  isFavorite,
  onFavoriteToggle,
  onJumpToTimestamp,
}: BookmarksManagerProps) {
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    note: "",
    timestamp: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/bookmarks`);
        if (response.ok) {
          const data = await response.json();
          setBookmarks(data.bookmarks);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookmarks();
  }, [lessonId]);

  const formatTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentTimestamp = () => {
    if (videoRef?.current) {
      return Math.floor(videoRef.current.currentTime);
    }
    return 0;
  };

  const handleAddBookmark = async () => {
    if (!newBookmark.title) return;

    const timestamp = getCurrentTimestamp();

    try {
      const response = await fetch(`/api/lessons/${lessonId}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBookmark,
          timestamp,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarks([...bookmarks, data.bookmark]);
        setNewBookmark({ title: "", note: "", timestamp: 0 });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to add bookmark:", error);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
    }
  };

  const handleJumpTo = (timestamp: number) => {
    if (videoRef?.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
    }
    if (onJumpToTimestamp) {
      onJumpToTimestamp(timestamp);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-purple-600" />
            Bookmarks & Favorites
          </h2>
          <p className="text-gray-600 mt-1">
            {bookmarks.length} bookmarks saved
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onFavoriteToggle}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              isFavorite
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
          <button
            onClick={() => {
              setNewBookmark({
                ...newBookmark,
                timestamp: getCurrentTimestamp(),
              });
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold flex items-center gap-2"
          >
            <BookmarkPlus className="w-5 h-5" />
            Add Bookmark
          </button>
        </div>
      </div>

      {/* Add Bookmark Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6"
          >
            <h3 className="font-bold text-gray-900 mb-4">
              Add Bookmark at {formatTimestamp(getCurrentTimestamp())}
            </h3>
            <input
              type="text"
              placeholder="Bookmark title (e.g., 'Important concept')"
              value={newBookmark.title}
              onChange={(e) =>
                setNewBookmark({ ...newBookmark, title: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <textarea
              placeholder="Optional note..."
              value={newBookmark.note}
              onChange={(e) =>
                setNewBookmark({ ...newBookmark, note: e.target.value })
              }
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBookmark}
                disabled={!newBookmark.title}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Save Bookmark
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmarks List */}
      <div className="space-y-3">
        {bookmarks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No bookmarks yet</p>
            <p className="text-sm mt-1">
              Click "Add Bookmark" to save important moments
            </p>
          </div>
        ) : (
          bookmarks.map((bookmark, index) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-purple-300 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Timestamp */}
                <button
                  onClick={() => handleJumpTo(bookmark.timestamp)}
                  className="flex-shrink-0 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 font-mono font-semibold"
                >
                  <Play className="w-4 h-4" />
                  {formatTimestamp(bookmark.timestamp)}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {bookmark.title}
                  </h3>
                  {bookmark.note && (
                    <p className="text-gray-600 text-sm mb-2">
                      {bookmark.note}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(bookmark.createdAt))} ago
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingId(bookmark.id)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {bookmarks.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {bookmarks.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Bookmarks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatTimestamp(
                  bookmarks.reduce((sum, b) => sum + b.timestamp, 0) /
                    bookmarks.length
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">Average Position</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
