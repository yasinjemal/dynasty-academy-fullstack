"use client";

/**
 * 📊 AI INSIGHTS CLIENT COMPONENT
 *
 * Interactive UI for AI analytics
 */

import { useState } from "react";

interface Confusion {
  type: string;
  topic: string;
  frequency: number;
  priority: string;
  resolution: string | null;
  last_seen: Date;
}

interface FAQ {
  type: string;
  topic: string;
  frequency: number;
  last_seen: Date;
}

interface Stats {
  total_conversations?: bigint;
  total_messages?: bigint;
  avg_messages_per_conversation?: number;
  unique_users?: bigint;
  avg_cost_per_conversation?: number;
}

interface Activity {
  date: string;
  conversations: bigint;
  messages: bigint;
}

interface Props {
  insights: {
    confusions: Confusion[];
    faqs: FAQ[];
    stats: Stats;
    recentActivity: Activity[];
  };
}

export default function AiInsightsClient({ insights }: Props) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "confusions" | "faqs"
  >("overview");

  const { confusions, faqs, stats, recentActivity } = insights;

  // Convert BigInt to Number for display
  const totalConversations = Number(stats.total_conversations || 0);
  const totalMessages = Number(stats.total_messages || 0);
  const uniqueUsers = Number(stats.unique_users || 0);
  const avgMessages = Number(stats.avg_messages_per_conversation || 0).toFixed(
    1
  );
  const avgCost = Number(stats.avg_cost_per_conversation || 0).toFixed(4);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Conversations */}
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Conversations</div>
          <div className="text-4xl font-bold text-white mb-1">
            {totalConversations.toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs">All time</div>
        </div>

        {/* Total Messages */}
        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Messages</div>
          <div className="text-4xl font-bold text-white mb-1">
            {totalMessages.toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs">
            {avgMessages} avg per chat
          </div>
        </div>

        {/* Unique Users */}
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Active Users</div>
          <div className="text-4xl font-bold text-white mb-1">
            {uniqueUsers.toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs">Using AI Coach</div>
        </div>

        {/* Avg Cost */}
        <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Avg Cost</div>
          <div className="text-4xl font-bold text-white mb-1">${avgCost}</div>
          <div className="text-gray-500 text-xs">Per conversation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "overview"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          📈 Overview
        </button>
        <button
          onClick={() => setActiveTab("confusions")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "confusions"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          😕 Confusions ({confusions.length})
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "faqs"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          ❓ FAQs ({faqs.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              📅 Last 7 Days Activity
            </h2>
            <div className="space-y-2">
              {recentActivity.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No activity yet
                </div>
              ) : (
                recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div className="text-white">
                      {new Date(activity.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-gray-400">
                        💬 {Number(activity.messages)} messages
                      </div>
                      <div className="text-gray-400">
                        👥 {Number(activity.conversations)} conversations
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                😕 Top Confusions
              </h3>
              <div className="space-y-2">
                {confusions.slice(0, 5).map((confusion, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="text-gray-300">{confusion.topic}</div>
                    <div className="text-purple-400">
                      {confusion.frequency}×
                    </div>
                  </div>
                ))}
                {confusions.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    No confusions tracked yet
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">❓ Top FAQs</h3>
              <div className="space-y-2">
                {faqs.slice(0, 5).map((faq, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="text-gray-300">{faq.topic}</div>
                    <div className="text-blue-400">{faq.frequency}×</div>
                  </div>
                ))}
                {faqs.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    No FAQs tracked yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confusions Tab */}
      {activeTab === "confusions" && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            😕 Student Confusions
          </h2>
          <div className="space-y-3">
            {confusions.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No confusions tracked yet. They'll appear as students ask
                questions.
              </div>
            ) : (
              confusions.map((confusion, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-white font-medium">
                        {confusion.topic}
                      </div>
                      <div className="text-gray-500 text-sm">
                        Asked {confusion.frequency} times • {confusion.priority}{" "}
                        priority
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(confusion.last_seen).toLocaleDateString()}
                    </div>
                  </div>
                  {confusion.resolution && (
                    <div className="text-gray-400 text-sm mt-2 p-3 bg-gray-900/50 rounded">
                      💡 {confusion.resolution}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No FAQs tracked yet. They'll be detected automatically.
              </div>
            ) : (
              faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <div>
                    <div className="text-white font-medium">{faq.topic}</div>
                    <div className="text-gray-500 text-sm">
                      Last asked: {new Date(faq.last_seen).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {faq.frequency}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
