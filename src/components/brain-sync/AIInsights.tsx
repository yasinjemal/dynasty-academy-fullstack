"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  MessageCircle,
  HelpCircle,
  Brain,
  Zap,
  X,
  Send,
  Bot,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIDiscussionPrompt {
  id: string;
  type: "question" | "insight" | "challenge" | "connection";
  content: string;
  context?: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface AIInsightsProps {
  currentContent: {
    title: string;
    topic: string;
    currentPage: number;
    selectedText?: string;
  };
  discussionHistory: string[];
  onAskAI: (question: string) => Promise<string>;
  onSharePrompt: (prompt: AIDiscussionPrompt) => void;
}

// Prompt type configurations
const PROMPT_TYPES = {
  question: {
    icon: HelpCircle,
    color: "from-blue-500 to-cyan-500",
    label: "Discussion Question",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  insight: {
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-500",
    label: "Key Insight",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  challenge: {
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    label: "Challenge",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  connection: {
    icon: Brain,
    color: "from-green-500 to-emerald-500",
    label: "Connection",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
};

// Sample AI-generated prompts
const generateSamplePrompts = (topic: string): AIDiscussionPrompt[] => [
  {
    id: "1",
    type: "question",
    content: `How does ${topic} relate to what you already know?`,
    difficulty: "easy",
  },
  {
    id: "2",
    type: "insight",
    content: `The key takeaway here is that ${topic} fundamentally changes how we think about learning.`,
  },
  {
    id: "3",
    type: "challenge",
    content: `Can anyone explain ${topic} in their own words?`,
    difficulty: "medium",
  },
  {
    id: "4",
    type: "connection",
    content: `This connects to the concept of metacognition - thinking about thinking.`,
  },
];

// Prompt card component
const PromptCard = ({
  prompt,
  onShare,
  onDismiss,
}: {
  prompt: AIDiscussionPrompt;
  onShare: () => void;
  onDismiss: () => void;
}) => {
  const config = PROMPT_TYPES[prompt.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        relative rounded-xl p-4 border
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-white p-1"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            bg-gradient-to-br ${config.color}
          `}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-400">
              {config.label}
            </span>
            {prompt.difficulty && (
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${
                    prompt.difficulty === "easy"
                      ? "bg-green-500/20 text-green-400"
                      : ""
                  }
                  ${
                    prompt.difficulty === "medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : ""
                  }
                  ${
                    prompt.difficulty === "hard"
                      ? "bg-red-500/20 text-red-400"
                      : ""
                  }
                `}
              >
                {prompt.difficulty}
              </span>
            )}
          </div>

          <p className="text-sm text-white leading-relaxed">{prompt.content}</p>

          {prompt.context && (
            <p className="text-xs text-slate-400 mt-2 italic">
              "{prompt.context}"
            </p>
          )}

          <Button
            onClick={onShare}
            size="sm"
            className="mt-3 h-8 bg-white/10 hover:bg-white/20 text-white"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Share with group
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// AI Chat interface
const AIChat = ({
  onAsk,
  isLoading,
}: {
  onAsk: (question: string) => void;
  isLoading: boolean;
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "ai"; content: string }>
  >([]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    onAsk(input);
  };

  return (
    <div className="space-y-3">
      {/* Messages */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              flex ${msg.role === "user" ? "justify-end" : "justify-start"}
            `}
          >
            <div
              className={`
                max-w-[85%] px-3 py-2 rounded-xl text-sm
                ${
                  msg.role === "user"
                    ? "bg-purple-500/30 text-white"
                    : "bg-slate-800 text-slate-200"
                }
              `}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask AI about this content..."
          className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default function AIInsights({
  currentContent,
  discussionHistory,
  onAskAI,
  onSharePrompt,
}: AIInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompts, setPrompts] = useState<AIDiscussionPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompts" | "chat">("prompts");

  // Generate prompts when content changes
  useEffect(() => {
    if (currentContent.topic) {
      setPrompts(generateSamplePrompts(currentContent.topic));
    }
  }, [currentContent.topic]);

  const handleDismissPrompt = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAskAI = async (question: string) => {
    setIsLoading(true);
    try {
      await onAskAI(question);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshPrompts = () => {
    setPrompts(generateSamplePrompts(currentContent.topic));
  };

  return (
    <>
      {/* Floating AI button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          fixed bottom-24 left-6 z-50 w-14 h-14 rounded-full
          bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500
          flex items-center justify-center shadow-lg shadow-purple-500/30
          hover:shadow-purple-500/50 transition-shadow
        `}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
        </motion.div>

        {/* Notification badge */}
        {prompts.length > 0 && !isExpanded && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
          >
            {prompts.length}
          </motion.div>
        )}
      </motion.button>

      {/* AI Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="fixed bottom-24 left-24 z-50 w-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      AI Study Assistant
                    </h3>
                    <p className="text-xs text-slate-400">
                      Powered by Dynasty Brain
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshPrompts}
                  className="text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("prompts")}
                  className={`
                    flex-1 py-2 rounded-md text-xs font-medium transition-all
                    ${
                      activeTab === "prompts"
                        ? "bg-purple-500/30 text-purple-300"
                        : "text-slate-400"
                    }
                  `}
                >
                  💡 Discussion Prompts
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`
                    flex-1 py-2 rounded-md text-xs font-medium transition-all
                    ${
                      activeTab === "chat"
                        ? "bg-purple-500/30 text-purple-300"
                        : "text-slate-400"
                    }
                  `}
                >
                  🤖 Ask AI
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {activeTab === "prompts" ? (
                <div className="space-y-3">
                  {prompts.length === 0 ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl mb-3"
                      >
                        🤔
                      </motion.div>
                      <p className="text-slate-400 text-sm">
                        No discussion prompts yet
                      </p>
                      <Button
                        onClick={handleRefreshPrompts}
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                      >
                        Generate prompts
                      </Button>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {prompts.map((prompt) => (
                        <PromptCard
                          key={prompt.id}
                          prompt={prompt}
                          onShare={() => onSharePrompt(prompt)}
                          onDismiss={() => handleDismissPrompt(prompt.id)}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              ) : (
                <AIChat onAsk={handleAskAI} isLoading={isLoading} />
              )}
            </div>

            {/* Selected text indicator */}
            {currentContent.selectedText && (
              <div className="p-3 border-t border-white/10 bg-slate-800/50">
                <p className="text-xs text-slate-400 mb-1">Selected text:</p>
                <p className="text-xs text-white line-clamp-2 italic">
                  "{currentContent.selectedText}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
