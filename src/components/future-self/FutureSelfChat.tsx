"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  User,
  Loader2,
  Clock,
  Heart,
  Zap,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "future-self";
  content: string;
  timestamp: Date;
}

interface FutureSelfChatProps {
  prediction: any;
  userName: string;
  userImage?: string;
}

// Animated Avatar for Future Self
const FutureAvatar = () => {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 20px rgba(139, 92, 246, 0.5)",
          "0 0 40px rgba(236, 72, 153, 0.5)",
          "0 0 20px rgba(139, 92, 246, 0.5)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center"
    >
      {/* Holographic ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/50"
      />

      {/* Inner glow */}
      <motion.div
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"
      />

      {/* Icon */}
      <Sparkles className="w-5 h-5 text-white relative z-10" />
    </motion.div>
  );
};

// Typing indicator
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 rounded-2xl w-fit"
  >
    <FutureAvatar />
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          className="w-2 h-2 rounded-full bg-purple-400"
        />
      ))}
    </div>
  </motion.div>
);

// Suggested prompts
const suggestedPrompts = [
  "What was the hardest part of the journey?",
  "Did we actually make it?",
  "What should I focus on this week?",
  "What do you wish you knew back then?",
  "How did you stay motivated?",
  "What's our life like now?",
];

export default function FutureSelfChat({
  prediction,
  userName,
  userImage,
}: FutureSelfChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "future-self",
      content: `Hey ${userName || "Builder"}! 🌟 It's me... well, you... from ${
        prediction?.timeframe || "6 months"
      } in the future. I know this might seem strange, but I've been waiting to talk to you. There's so much I want to share about where we're headed. Ask me anything - about the journey, the struggles, the victories. I'm here.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/future-self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          prediction,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "future-self",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "future-self",
        content:
          "I'm having trouble connecting across time right now. Give me a moment and try again. The future is still bright! ✨",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 overflow-hidden h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="flex items-center gap-3">
          <FutureAvatar />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Future {userName || "You"}
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300"
              >
                LIVE CONNECTION
              </motion.span>
            </h3>
            <p className="text-xs text-purple-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {prediction?.timeframe || "6 months"} ahead
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-400 hover:bg-purple-500/20 h-8 w-8 p-0"
            onClick={() => setMessages(messages.slice(0, 1))}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              {message.role === "future-self" ? (
                <FutureAvatar />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center overflow-hidden">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`
                  max-w-[75%] px-4 py-3 rounded-2xl
                  ${
                    message.role === "future-self"
                      ? "bg-gradient-to-br from-purple-900/50 to-pink-900/30 border border-purple-500/20 text-white"
                      : "bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                  }
                `}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <span className="text-xs opacity-50 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length < 3 && !isLoading && (
        <div className="px-4 pb-2">
          <p className="text-xs text-purple-400 mb-2">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.slice(0, 3).map((prompt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors border border-purple-500/30"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your future self anything..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
            {/* Sparkle decoration */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute right-12 top-1/2 -translate-y-1/2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
          </div>

          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}
