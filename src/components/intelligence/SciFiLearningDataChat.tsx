"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Mic, Send, Sparkles, Zap, Brain, Activity, Waves } from "lucide-react";
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

// Particle system for neural network effect
const NeuralParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number }> =
      [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139, 92, 246, 0.6)";
        ctx.fill();

        // Draw connections
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 * (1 - dist / 100)})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

// Floating AI Orb
const AIOrb = ({ isThinking }: { isThinking: boolean }) => {
  return (
    <div className="relative w-20 h-20 mx-auto">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"
        animate={{
          scale: isThinking ? [1, 1.5, 1] : 1,
          opacity: isThinking ? [0.5, 0.8, 0.5] : 0.3,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-purple-500/50"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner core */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-cyan-500"
        animate={{
          scale: isThinking ? [1, 1.1, 1] : 1,
          boxShadow: isThinking
            ? [
                "0 0 20px rgba(168, 85, 247, 0.4)",
                "0 0 40px rgba(168, 85, 247, 0.8)",
                "0 0 20px rgba(168, 85, 247, 0.4)",
              ]
            : "0 0 20px rgba(168, 85, 247, 0.4)",
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Particle effects */}
      {isThinking && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: [0, Math.cos((i * Math.PI) / 4) * 40],
                y: [0, Math.sin((i * Math.PI) / 4) * 40],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default function SciFiLearningDataChat({
  userId,
  courseId,
}: LearningDataChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
    // Check for voice support
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      setVoiceSupported(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleAsk = async (customQuestion?: string) => {
    const q = customQuestion || question;
    if (!q.trim()) return;

    setLoading(true);

    try {
      console.log("🚀 [Sci-Fi Chat] Fetching context...");
      const context = await getLearningContext(userId, courseId);

      const res = await fetch("/api/ai/chat-with-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, learningContext: context }),
      });

      let aiResponse = "⚠️ Unable to process request";

      if (res.ok) {
        const json = await res.json();
        aiResponse = json.message;
      }

      setMessages((prev) => [
        ...prev,
        { user: q, ai: aiResponse, timestamp: new Date() },
      ]);
      setQuestion("");
    } catch (err) {
      console.error("[Sci-Fi Chat] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecognition = () => {
    if (!voiceSupported) return;

    setIsListening(true);
    // Voice recognition implementation would go here
    setTimeout(() => {
      setIsListening(false);
      // Simulate voice input
      setQuestion("What topics should I review?");
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,20,60,0.95) 100%)",
      }}
    >
      {/* Neural network background */}
      <NeuralParticles />

      {/* Holographic border effect */}
      <div
        className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-fuchsia-500/30 bg-clip-border"
        style={{ padding: "2px" }}
      />

      {/* Cursor glow effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          x: smoothMouseX,
          y: smoothMouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 p-8 backdrop-blur-xl bg-black/20">
        {/* Header with AI Orb */}
        <div className="mb-6">
          <AIOrb isThinking={loading} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <h3
              className="text-2xl font-black bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2"
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              DYNASTY NEURAL INTERFACE
            </h3>
            <p className="text-cyan-400/70 text-sm font-mono">
              {loading ? "◉ ANALYZING NEURAL PATTERNS..." : "◉ READY FOR QUERY"}
            </p>
          </motion.div>
        </div>

        {/* Messages */}
        <div className="space-y-6 max-h-[400px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="space-y-4"
              >
                {/* User message */}
                <div className="flex justify-end">
                  <motion.div
                    whileHover={{ scale: 1.02, x: -5 }}
                    className="relative max-w-[85%]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-2xl blur-xl" />
                    <div className="relative px-6 py-4 rounded-2xl rounded-tr-sm border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-sm">
                      <div className="text-purple-300 font-mono text-xs mb-2">
                        USER_QUERY
                      </div>
                      <div className="text-white/90 font-medium">{m.user}</div>
                    </div>
                    <div className="absolute -right-1 top-4 w-8 h-8">
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full border-2 border-purple-400/50" />
                    </div>
                  </motion.div>
                </div>

                {/* AI response */}
                <div className="flex justify-start">
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="relative max-w-[85%]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-2xl blur-xl" />
                    <div className="relative px-6 py-4 rounded-2xl rounded-tl-sm border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <div className="text-cyan-300 font-mono text-xs">
                          DYNASTY_AI
                        </div>
                        <div className="flex gap-1 ml-auto">
                          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-75" />
                          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-150" />
                        </div>
                      </div>
                      <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {m.ai}
                      </div>
                      <div className="text-cyan-400/50 font-mono text-xs mt-3">
                        {m.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="absolute -left-1 top-4 w-8 h-8">
                      <motion.div
                        className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full border-2 border-cyan-400/50"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(34, 211, 238, 0.4)",
                            "0 0 0 8px rgba(34, 211, 238, 0)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Scan line effect */}
                <motion.div
                  className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                />
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
              <div className="relative px-6 py-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <div className="text-cyan-300 font-mono text-sm">
                    PROCESSING NEURAL DATA
                    <span className="animate-pulse">...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input area */}
        <div className="relative">
          {/* Holographic input border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/50 via-cyan-600/50 to-fuchsia-600/50 rounded-2xl blur opacity-50" />

          <div className="relative flex gap-3 p-2 rounded-2xl border border-cyan-500/30 bg-black/40 backdrop-blur-xl">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="ENTER NEURAL QUERY..."
              className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder-cyan-400/30 font-mono text-sm px-4"
              disabled={loading}
            />

            {/* Voice button */}
            {voiceSupported && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startVoiceRecognition}
                className={`p-3 rounded-xl transition-all ${
                  isListening
                    ? "bg-gradient-to-r from-red-600 to-pink-600"
                    : "bg-gradient-to-r from-purple-600/50 to-fuchsia-600/50 hover:from-purple-600 hover:to-fuchsia-600"
                }`}
              >
                <Mic
                  className={`w-5 h-5 text-white ${
                    isListening ? "animate-pulse" : ""
                  }`}
                />
              </motion.button>
            )}

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="relative p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              {loading ? (
                <Zap className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-between text-xs font-mono"
        >
          <div className="flex items-center gap-2 text-cyan-400/50">
            <Waves className="w-3 h-3" />
            <span>NEURAL LINK ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400/50">
            <Sparkles className="w-3 h-3" />
            <span>GPT-4O CORE</span>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #a78bfa 0%, #22d3ee 100%);
        }
      `}</style>
    </motion.div>
  );
}
