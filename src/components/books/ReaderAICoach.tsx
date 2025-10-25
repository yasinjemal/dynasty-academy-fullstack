/**
 * 🤖 READER AI COACH - CONTEXT-AWARE ASSISTANT
 *
 * Enhanced AI Coach specifically for book reading experience.
 * Receives full page context and user stats for contextual responses.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  RotateCcw,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ReaderCoachProps {
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  pageNumber: number;
  totalPages: number;
  pageText: string;
  userStats?: {
    wpm?: number;
    minutesToday?: number;
    progressPct?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function ReaderAICoach({
  bookId,
  bookSlug,
  bookTitle,
  pageNumber,
  totalPages,
  pageText,
  userStats,
  isOpen,
  onClose,
}: ReaderCoachProps) {
  const { data: session } = useSession();

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [lastContext, setLastContext] = useState<string>("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced context update
  useEffect(() => {
    const contextKey = `${bookId}-${pageNumber}`;
    if (contextKey === lastContext) return;

    const timer = setTimeout(() => {
      // Send context update to coach (optional: could pre-load context)
      setLastContext(contextKey);
    }, 500);

    return () => clearTimeout(timer);
  }, [bookId, pageNumber, lastContext]);

  // Send message to AI Coach
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isStreaming || !session) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setStreamingMessage("");

    try {
      // Create AbortController for cancellation
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            bookId,
            bookSlug,
            bookTitle,
            pageNumber,
            totalPages,
            pageText,
            userStats,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.details || "Failed to send message"
        );
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let fullMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk
          .split("\n")
          .filter((line) => line.trim().startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "");
          try {
            const parsed = JSON.parse(data);

            if (parsed.content) {
              fullMessage += parsed.content;
              setStreamingMessage(fullMessage);
            }

            if (parsed.done) {
              // Streaming complete
              const assistantMessage: Message = {
                role: "assistant",
                content: fullMessage,
                timestamp: new Date().toISOString(),
              };

              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingMessage("");
              setIsStreaming(false);
            }
          } catch (parseError) {
            console.error("Parse error:", parseError);
          }
        }
      }
    } catch (error: any) {
      console.error("❌ Send message error:", error);

      if (error.name !== "AbortError") {
        // Show error message
        const errorMessage: Message = {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}. Please try again or refresh the page.`,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }

      setStreamingMessage("");
      setIsStreaming(false);
    }
  };

  // Cancel streaming
  const cancelStreaming = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setStreamingMessage("");
  };

  // Reset conversation
  const resetConversation = () => {
    setMessages([]);
    setStreamingMessage("");
    setIsStreaming(false);
  };

  // Quick action buttons for reader context
  const quickActions = [
    { text: "Summarize this page", icon: "📝" },
    { text: "What are the key points here?", icon: "🎯" },
    { text: "Explain this concept", icon: "💡" },
    { text: "Quiz me on this section", icon: "✍️" },
  ];

  const handleQuickAction = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  // Welcome message - context-aware
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const progressText = userStats?.progressPct
        ? `You're ${userStats.progressPct}% through the book`
        : `You're on page ${pageNumber} of ${totalPages}`;

      const statsText = userStats?.wpm
        ? `\n\n📊 **Your Reading Stats:**\n- Reading Speed: ${userStats.wpm} WPM\n- Time Today: ${userStats.minutesToday} min\n- Progress: ${userStats.progressPct}%`
        : "";

      const welcomeMessage: Message = {
        role: "assistant",
        content: `👋 Welcome! I'm your Dynasty AI Coach.

I can see you're reading **"${bookTitle}"** - ${progressText}.${statsText}

I have full context of the current page you're reading, so I can help you with:
- 📝 Summarizing the content on this page
- 💡 Explaining concepts in simpler terms
- 🎯 Identifying key takeaways
- ✍️ Creating quizzes to test your understanding
- 🔍 Answering specific questions about what you're reading

**Try asking me:** "What's the main point on this page?" or use one of the quick action buttons below!

Let's make this reading session productive! 🚀`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, bookTitle, pageNumber, totalPages, userStats, messages.length]);

  if (!session) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-purple-900/95 backdrop-blur-xl shadow-2xl border-l border-purple-500/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                <div className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-white">Dynasty AI Coach</h3>
                <p className="text-xs text-purple-300">
                  Always here to help 🚀
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={resetConversation}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4 text-purple-300" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-purple-300" />
              </button>
            </div>
          </div>

          {/* Context Indicator */}
          <div className="px-4 py-2 bg-black/20 border-b border-purple-500/20">
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Zap className="w-3 h-3" />
              <span>
                Reading:{" "}
                <span className="text-white font-medium">{bookTitle}</span> ·
                Page {pageNumber}/{totalPages}
                {userStats?.progressPct &&
                  ` · ${userStats.progressPct}% complete`}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-280px)]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-black/40 text-white border border-purple-500/20"
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        code({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className="bg-purple-500/20 px-1 rounded"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-black/40 text-white border border-purple-500/20">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                  </div>
                  <Loader2 className="w-4 h-4 animate-spin inline-block ml-2 text-purple-400" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && !isStreaming && (
            <div className="px-4 py-2 border-t border-purple-500/20 bg-black/20">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.text)}
                    className="text-xs px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors text-left text-white"
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-purple-500/20 bg-black/20">
            <form onSubmit={sendMessage} className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask me anything about this page..."
                className="flex-1 px-4 py-3 bg-black/40 border border-purple-500/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 resize-none"
                rows={2}
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
