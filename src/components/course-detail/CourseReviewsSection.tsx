"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Star,
  ThumbsUp,
  ChevronDown,
  CheckCircle2,
  Filter,
} from "lucide-react";
import type { CourseReview } from "@/lib/api/course-data";

interface CourseReviewsProps {
  reviews: CourseReview[];
  averageRating: number;
  totalReviews: number;
}

export function CourseReviewsSection({
  reviews,
  averageRating,
  totalReviews,
}: CourseReviewsProps) {
  const [filter, setFilter] = useState<"all" | number>("all");
  const [showAll, setShowAll] = useState(false);

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => Math.round(r.rating) === rating).length,
    percentage:
      totalReviews > 0
        ? (reviews.filter((r) => Math.round(r.rating) === rating).length / totalReviews) * 100
        : 0,
  }));

  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((r) => Math.round(r.rating) === filter);

  const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, 4);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900/50 to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Student Reviews</h2>
          <p className="text-gray-400">See what our students are saying</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* Rating Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-1 bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/10 rounded-2xl p-6 text-center"
          >
            <div className="mb-4">
              <span className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.round(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              Based on {totalReviews.toLocaleString()} reviews
            </p>
          </motion.div>

          {/* Rating Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/10 rounded-2xl p-6"
          >
            <div className="space-y-3">
              {ratingCounts.map(({ rating, count, percentage }) => (
                <button
                  key={rating}
                  onClick={() => setFilter(filter === rating ? "all" : rating)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    filter === rating
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-white font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-gray-500 text-sm w-16 text-right">
                    {count.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-purple-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilter(filter === rating ? "all" : rating)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                filter === rating
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {rating}
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-gray-900/60 to-black/60 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <Image
                  src={review.userImage || "/images/users/default.jpg"}
                  alt={review.userName}
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-white/10 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold">{review.userName}</h4>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">{formatDate(review.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h5 className="text-white font-medium mb-2">{review.title}</h5>
                  )}

                  {/* Review Content */}
                  <p className="text-gray-300 leading-relaxed">{review.content}</p>

                  {/* Helpful */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors text-sm">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show More */}
        {filteredReviews.length > 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
            >
              {showAll ? "Show Less" : `Show All ${filteredReviews.length} Reviews`}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
              />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
