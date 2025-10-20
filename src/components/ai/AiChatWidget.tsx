/**
 * 🤖 DYNASTY AI COACH - FLOATING CHAT WIDGET
 *
 * Beautiful ChatGPT-style interface that floats on all pages.
 * Context-aware, streaming responses, conversation history.
 *
 * Features:
 * - Floating bubble (bottom-right)
 * - Expandable chat window
 * - Streaming responses with typing indicator
 * - Markdown support
 * - Code syntax highlighting
 * - Conversation history
 * - Context tracking
 * - Mobile responsive
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AiChatWidgetProps {
  defaultOpen?: boolean;
}

export default function AiChatWidget({
  defaultOpen = false,
}: AiChatWidgetProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // UI State
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");

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
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Get page context
  const getContext = () => {
    const currentPath = pathname || "/";
    return {
      page: currentPath,
      courseId: currentPath.includes("/courses/")
        ? currentPath.split("/courses/")[1]?.split("/")[0]
        : undefined,
      lessonId: currentPath.includes("/lessons/")
        ? currentPath.split("/lessons/")[1]?.split("/")[0]
        : undefined,
      bookId: currentPath.includes("/books/")
        ? currentPath.split("/books/")[1]?.split("/")[0]
        : undefined,
    };
  };

  // Send message
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

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          context: getContext(),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
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

              // Save conversation ID
              if (parsed.conversationId && !conversationId) {
                setConversationId(parsed.conversationId);
              }
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
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
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
    setConversationId(null);
    setStreamingMessage("");
    setIsStreaming(false);
  };

  // Quick action buttons
  const quickActions = [
    { text: "Help me understand this lesson", icon: "📚" },
    { text: "Quiz me on this topic", icon: "✍️" },
    { text: "Explain this concept simply", icon: "💡" },
    { text: "Give me study tips", icon: "🎯" },
  ];

  const handleQuickAction = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  if (!session) return null;

  return (
    <>
      {/* Floating Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

              {/* Button */}
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl">
                <MessageCircle className="w-6 h-6" />
              </div>

              {/* Sparkle indicator */}
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 animate-pulse">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Ask Dynasty AI Coach
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 ${
              isMinimized
                ? "bottom-6 right-6 w-80"
                : "bottom-6 right-6 w-96 h-[600px]"
            } flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-bold">Dynasty AI Coach</h3>
                  <p className="text-xs text-white/80">
                    Always here to help 🚀
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={resetConversation}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="New conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Welcome Message */}
                  {messages.length === 0 && !streamingMessage && (
                    <div className="text-center py-8 space-y-4">
                      <div className="text-6xl">🤖</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          Hi! I'm your AI Coach 👋
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ask me anything about your courses, books, or learning
                          journey!
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-6">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action.text)}
                            className="p-3 text-left text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <span>{action.icon}</span>
                              <span className="text-xs">{action.text}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat Messages */}
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              code({
                                node,
                                className,
                                children,
                                ...props
                              }: any) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                const inline = !match;
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={vscDarkPlus as any}
                                    language={match[1]}
                                    PreTag="div"
                                  >
                                    {String(children).replace(/\n$/, "")}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
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

                  {/* Streaming Message */}
                  {streamingMessage && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                        </div>
                        <div className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {isStreaming && !streamingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={sendMessage} className="flex items-end gap-2">
                    <div className="flex-1">
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
                        placeholder="Ask me anything..."
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        rows={1}
                        disabled={isStreaming}
                      />
                    </div>

                    {isStreaming ? (
                      <button
                        type="button"
                        onClick={cancelStreaming}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim() || isStreaming}
                        className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    )}
                  </form>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                    AI can make mistakes. Verify important information.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
