"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Award,
  User,
  Send,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  userId: string;
  user: {
    name: string;
    image?: string;
  };
  rating: number;
  title: string;
  content: string;
  helpfulVotes: number;
  hasVotedHelpful: boolean;
  instructorReply?: string;
  repliedAt?: string;
  completedCourse: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface CourseReviewsProps {
  courseId: string;
  userHasCompleted: boolean;
}

export function CourseReviews({
  courseId,
  userHasCompleted,
}: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">(
    "all"
  );
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const [reviewsRes, summaryRes] = await Promise.all([
          fetch(`/api/courses/${courseId}/reviews?filter=${filter}`),
          fetch(`/api/courses/${courseId}/reviews/summary`),
        ]);

        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(data.reviews);
        }

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, [courseId, filter]);

  const handleSubmitReview = async () => {
    if (!newReview.title || !newReview.content) return;

    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        const data = await response.json();
        setReviews([data.review, ...reviews]);
        setNewReview({ rating: 5, title: "", content: "" });
        setShowReviewForm(false);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const handleVoteHelpful = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, { method: "POST" });
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpfulVotes: r.hasVotedHelpful
                  ? r.helpfulVotes - 1
                  : r.helpfulVotes + 1,
                hasVotedHelpful: !r.hasVotedHelpful,
              }
            : r
        )
      );
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Overall Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div className="text-6xl font-bold text-gray-900">
                {summary.averageRating.toFixed(1)}
              </div>
              <div>
                {renderStars(Math.round(summary.averageRating), "lg")}
                <p className="text-sm text-gray-600 mt-1">
                  {summary.totalReviews} reviews
                </p>
              </div>
            </div>
            {userHasCompleted && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Right: Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count =
                summary.distribution[
                  stars as keyof typeof summary.distribution
                ];
              const percentage =
                summary.totalReviews > 0
                  ? (count / summary.totalReviews) * 100
                  : 0;

              return (
                <button
                  key={stars}
                  onClick={() => setFilter(stars.toString() as any)}
                  className="w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Reviews
          </button>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Write Your Review
              </h3>

              {/* Star Rating Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Review title..."
                value={newReview.title}
                onChange={(e) =>
                  setNewReview({ ...newReview, title: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <textarea
                placeholder="Share your experience with this course..."
                value={newReview.content}
                onChange={(e) =>
                  setNewReview({ ...newReview, content: e.target.value })
                }
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={!newReview.title || !newReview.content}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No reviews yet</p>
            <p className="text-sm mt-1">Be the first to review this course!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 transition-all"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {review.user.name}
                      </span>
                      {review.completedCourse && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(review.createdAt))} ago
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Review Content */}
              <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-4">{review.content}</p>

              {/* Instructor Reply */}
              {review.instructorReply && (
                <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-4">
                  <p className="text-sm font-semibold text-purple-900 mb-1">
                    Instructor Response:
                  </p>
                  <p className="text-sm text-gray-700">
                    {review.instructorReply}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleVoteHelpful(review.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                    review.hasVotedHelpful
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulVotes})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
