"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  BarChart3,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsSummary {
  totalMessages: number;
  totalReactions: number;
  uniqueReaders: number;
  peakConcurrent: number;
  daysAnalyzed: number;
}

interface PopularPage {
  page: number;
  messageCount: number;
  reactionCount: number;
  readerCount: number;
  totalEngagement: number;
}

interface TimeSeriesData {
  date: string;
  messages: number;
  reactions: number;
  peakReaders: number;
}

interface CoReadingAnalyticsProps {
  bookId: string;
  bookTitle?: string;
}

export default function CoReadingAnalytics({
  bookId,
  bookTitle,
}: CoReadingAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [bookId, days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/co-reading/analytics?bookId=${bookId}&days=${days}`
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setSummary(data.summary);
      setPopularPages(data.popularPages || []);
      setTimeSeries(data.timeSeries || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ["Metric", "Value"],
      ["Total Messages", summary?.totalMessages || 0],
      ["Total Reactions", summary?.totalReactions || 0],
      ["Unique Readers", summary?.uniqueReaders || 0],
      ["Peak Concurrent", summary?.peakConcurrent || 0],
      [""],
      ["Top Pages by Engagement"],
      ["Page", "Messages", "Reactions", "Readers", "Total Engagement"],
      ...popularPages.map((p) => [
        p.page,
        p.messageCount,
        p.reactionCount,
        p.readerCount,
        p.totalEngagement,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `co-reading-analytics-${bookId}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Co-Reading Analytics
          </h2>
          {bookTitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {bookTitle}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button onClick={exportData} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {summary.totalMessages.toLocaleString()}
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">
            Total Messages
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-6 border border-pink-200 dark:border-pink-800"
        >
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            <TrendingUp className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="text-3xl font-bold text-pink-900 dark:text-pink-100">
            {summary.totalReactions.toLocaleString()}
          </div>
          <div className="text-sm text-pink-700 dark:text-pink-300">
            Total Reactions
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {summary.uniqueReaders.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Unique Readers
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
            {summary.peakConcurrent}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Peak Concurrent
          </div>
        </motion.div>
      </div>

      {/* Popular Pages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Most Popular Pages
        </h3>
        <div className="space-y-3">
          {popularPages.map((page, index) => (
            <div
              key={page.page}
              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Page {page.page}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {page.messageCount} messages • {page.reactionCount} reactions
                  • {page.readerCount} readers
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {page.totalEngagement} total
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Time Series Chart (Simple Bar Representation) */}
      {timeSeries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Over Time
          </h3>
          <div className="space-y-2">
            {timeSeries.map((data) => {
              const maxMessages = Math.max(
                ...timeSeries.map((d) => d.messages)
              );
              const width = (data.messages / maxMessages) * 100;

              return (
                <div key={data.date} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{new Date(data.date).toLocaleDateString()}</span>
                    <span>
                      {data.messages} msgs • {data.reactions} reactions •{" "}
                      {data.peakReaders} peak
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
