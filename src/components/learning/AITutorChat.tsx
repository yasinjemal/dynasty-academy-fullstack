"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Code,
  Lightbulb,
  BookOpen,
  Zap,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AITutorProps {
  courseId?: string;
  lessonId?: string;
  currentContent?: string;
}

export default function AITutorChat({
  courseId,
  lessonId,
  currentContent,
}: AITutorProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI tutor 🤖 Ask me anything about this lesson, and I'll explain it in simple terms!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { icon: Code, text: "Explain this code", color: "purple" },
    { icon: Lightbulb, text: "Give me an example", color: "yellow" },
    { icon: BookOpen, text: "Simplify this concept", color: "blue" },
    { icon: Zap, text: "Show me practice", color: "green" },
  ];

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(messageText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question: string): string => {
    // Simulate AI responses based on keywords
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("explain") || lowerQuestion.includes("what")) {
      return `Great question! Let me break this down for you:\n\n1. **The Basics**: This concept is about understanding how components work together.\n\n2. **Key Points**:\n   - Components are reusable pieces of UI\n   - They can accept data through props\n   - They manage their own state\n\n3. **Think of it like**: Imagine components as LEGO blocks - each block has a specific purpose, but you can combine them to build something amazing!\n\nWould you like a code example? 😊`;
    }

    if (lowerQuestion.includes("example") || lowerQuestion.includes("show")) {
      return `Sure! Here's a simple example:\n\n\`\`\`javascript\nfunction Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>\n}\n\n// Usage:\n<Greeting name="Dynasty" />\n\`\`\`\n\nThis component:\n✅ Accepts a 'name' prop\n✅ Returns a greeting message\n✅ Can be reused anywhere!\n\nTry modifying it - what happens if you change the name? 🚀`;
    }

    if (
      lowerQuestion.includes("practice") ||
      lowerQuestion.includes("exercise")
    ) {
      return `Awesome! Let's practice together! 💪\n\n**Mini Challenge**:\nCreate a component that displays a user card with:\n- Name\n- Avatar\n- Bio\n\nSteps:\n1. Create a new component called 'UserCard'\n2. Accept props for name, avatar, and bio\n3. Style it with CSS or Tailwind\n\nNeed hints? Just ask! I'm here to help 😊`;
    }

    if (lowerQuestion.includes("stuck") || lowerQuestion.includes("error")) {
      return `Don't worry, we all get stuck! 🤗 Let's debug this together:\n\n**Common Issues**:\n1. Check your syntax (missing brackets, semicolons)\n2. Verify variable names (case-sensitive!)\n3. Console.log() is your friend\n4. Read error messages carefully\n\n**Pro Tip**: Copy the exact error message and share it with me. I'll help you fix it!\n\nWhat specific error are you seeing? 🔍`;
    }

    if (lowerQuestion.includes("why") || lowerQuestion.includes("how")) {
      return `Excellent question! Understanding the 'why' is key 🔑\n\n**Here's why this matters**:\n- It's a fundamental concept in web development\n- You'll use this in almost every project\n- It makes your code cleaner and more maintainable\n\n**Real-world application**:\nCompanies like Facebook, Netflix, and Airbnb use these patterns. Mastering this will make you a strong developer!\n\nKeep asking 'why' - curiosity is your superpower! 🌟`;
    }

    // Default response
    return `I understand you're asking about "${question}". Let me help you with that! 🤓\n\nCould you provide more context? For example:\n- What specific part are you confused about?\n- Have you tried anything yet?\n- What's your goal with this?\n\nThe more details you share, the better I can explain! I'm here to make learning easy and fun 🎉`;
  };

  if (!session) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-40 w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center group"
          >
            <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
            {/* Notification Dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{
                x: 0,
                opacity: 1,
                height: isMinimized ? "60px" : "auto",
              }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 right-6 z-50 w-full max-w-md"
            >
              <div className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">AI Tutor</h3>
                      <p className="text-white/80 text-xs">
                        Always here to help! 🤖
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {isMinimized ? (
                        <Maximize2 className="w-5 h-5 text-white" />
                      ) : (
                        <Minimize2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {!isMinimized && (
                  <>
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className={`flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-4 ${
                              message.role === "user"
                                ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                                : "bg-white/10 text-slate-200"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </p>
                            <span className="text-xs opacity-60 mt-2 block">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </motion.div>
                      ))}

                      {isTyping && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    <div className="px-4 pb-4">
                      <p className="text-xs text-slate-400 mb-2">
                        Quick actions:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickPrompts.map((prompt, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendMessage(prompt.text)}
                            className={`p-3 bg-${prompt.color}-500/10 hover:bg-${prompt.color}-500/20 border border-${prompt.color}-500/30 rounded-xl text-left transition-all`}
                          >
                            <prompt.icon
                              className={`w-4 h-4 text-${prompt.color}-400 mb-1`}
                            />
                            <span className="text-xs text-slate-300">
                              {prompt.text}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white/5 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          placeholder="Ask me anything..."
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSendMessage()}
                          disabled={!inputValue.trim() || isTyping}
                          className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5 text-white" />
                        </motion.button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Powered by AI • Instant help 24/7
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
