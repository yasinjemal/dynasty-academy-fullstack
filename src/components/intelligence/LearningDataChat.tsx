"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Sparkles, Loader2 } from "lucide-react";
import { getLearningContext } from "@/lib/intelligence/DataQueryService";

interface Message {
  user: string;
  ai: string;
  timestamp: Date;
}

interface LearningDataChatProps {
  userId: string;
  courseId?: string;
}

const SUGGESTED_QUESTIONS = [
  "Why did I fail that quiz?",
  "When should I study?",
  "Will I pass this course?",
  "What topics do I need to review?",
  "How can I improve my quiz scores?",
];

export default function LearningDataChat({
  userId,
  courseId,
}: LearningDataChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (customQuestion?: string) => {
    const q = customQuestion || question;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Get user's learning context from IndexedDB
      console.log(
        "📊 [Learning Data Chat] Fetching context for:",
        userId,
        courseId
      );
      const context = await getLearningContext(userId, courseId);
      console.log("📊 [Learning Data Chat] Context:", context);

      // Send to AI endpoint
      const res = await fetch("/api/ai/chat-with-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, learningContext: context }),
      });

      let aiResponse = "Sorry, I couldn't analyze that.";

      if (res.ok) {
        const json = await res.json();
        aiResponse = json.message;
        console.log("✅ [Learning Data Chat] AI Response:", aiResponse);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to get response");
        aiResponse = `Error: ${errorData.message || "Unknown error"}`;
      }

      // Add to message history
      setMessages((prev) => [
        ...prev,
        { user: q, ai: aiResponse, timestamp: new Date() },
      ]);
      setQuestion(""); // Clear input
    } catch (err: any) {
      console.error("[Learning Data Chat] Error:", err);
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-purple-200/50 p-6 bg-gradient-to-br from-white/90 to-purple-50/30 backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">
            Chat with Your Learning Data
          </h3>
          <p className="text-xs text-gray-600">
            Ask questions about your progress
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4 max-h-96 overflow-auto mb-4 pr-2">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  <div className="font-semibold text-xs mb-1">You</div>
                  <div className="text-sm">{m.user}</div>
                </div>
              </div>

              {/* AI response */}
              <div className="flex justify-start">
                <div className="bg-white border-2 border-purple-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <div className="font-semibold text-xs text-purple-600">
                      Dynasty Mentor
                    </div>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {m.ai}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {m.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border-2 border-purple-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-sm text-gray-600">
                  Analyzing your data...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Suggested questions (show only if no messages yet) */}
      {messages.length === 0 && !loading && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full border border-purple-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder="Ask about your learning progress..."
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
          disabled={loading}
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="rounded-xl px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Stats footer */}
      {messages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Powered by Dynasty Intelligence Engine
          </p>
        </div>
      )}
    </div>
  );
}
