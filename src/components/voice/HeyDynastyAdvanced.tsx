"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Zap, Sparkles, Brain } from "lucide-react";
import AudioWaveform from "./AudioWaveform";

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCommand {
  keywords: string[];
  route: string;
  response: string;
}

interface GPTResponse {
  route: string | null;
  response: string;
  action: "navigate" | "suggest" | "info" | "error";
  context?: string;
}

export default function HeyDynastyAdvanced() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [useAI, setUseAI] = useState(true); // Toggle AI vs keyword matching
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Simple keyword-based commands (fallback)
  const commands: VoiceCommand[] = [
    {
      keywords: ["dashboard", "home", "main"],
      route: "/dashboard",
      response: "Opening your dashboard",
    },
    {
      keywords: ["courses", "course", "learning", "lessons"],
      route: "/courses",
      response: "Taking you to courses",
    },
    {
      keywords: ["profile", "account", "settings"],
      route: "/profile",
      response: "Opening your profile",
    },
    {
      keywords: ["notifications", "notification", "alerts"],
      route: "/profile?tab=notifications",
      response: "Checking your notifications",
    },
    {
      keywords: ["books", "library", "reading"],
      route: "/books",
      response: "Opening your library",
    },
    {
      keywords: ["community", "feed", "social"],
      route: "/community",
      response: "Taking you to the community",
    },
    {
      keywords: ["achievements", "progress", "stats"],
      route: "/profile?tab=achievements",
      response: "Showing your achievements",
    },
    {
      keywords: ["certificates", "certificate"],
      route: "/profile?tab=certificates",
      response: "Viewing your certificates",
    },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript.toLowerCase();
          setTranscript(text);
          processCommand(text);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          setIsProcessing(false);
          if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [mediaStream]);

  // Process voice command with AI or keywords
  const processCommand = async (text: string) => {
    setIsProcessing(true);

    try {
      if (useAI) {
        // Use GPT for natural language understanding
        const response = await fetch("/api/voice/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text }),
        });

        const result: GPTResponse = await response.json();

        setLastCommand(result.response);
        speak(result.response);

        if (result.route && result.action === "navigate") {
          setTimeout(() => {
            router.push(result.route!);
            setIsProcessing(false);
          }, 1000);
        } else {
          setIsProcessing(false);
        }
      } else {
        // Fallback to keyword matching
        const matchedCommand = commands.find((cmd) =>
          cmd.keywords.some((keyword) => text.includes(keyword))
        );

        if (matchedCommand) {
          setLastCommand(matchedCommand.response);
          speak(matchedCommand.response);

          setTimeout(() => {
            router.push(matchedCommand.route);
            setIsProcessing(false);
          }, 1000);
        } else {
          speak("Sorry, I didn't understand that command");
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error("Command processing error:", error);
      speak("Sorry, something went wrong");
      setIsProcessing(false);
    }
  };

  // Text-to-speech
  const speak = async (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Small delay to ensure cancellation is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Google") || voice.name.includes("Microsoft")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Start/stop listening
  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert(
        "Voice recognition not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    } else {
      try {
        // Request microphone access for waveform visualization
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMediaStream(stream);

        setTranscript("");
        setLastCommand("");
        recognitionRef.current.start();
        setIsListening(true);
        // Removed "Listening" audio feedback - visual feedback is enough
      } catch (error) {
        console.error("Microphone access error:", error);
        alert("Please allow microphone access to use voice commands");
      }
    }
  };

  return (
    <>
      {/* Floating Voice Orb */}
      <motion.button
        onClick={toggleListening}
        className={`
          fixed bottom-6 right-6 z-50
          w-20 h-20 rounded-full
          backdrop-blur-xl
          border-2
          shadow-2xl
          cursor-pointer
          overflow-hidden
          ${
            isListening
              ? "bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border-purple-400"
              : "bg-white/10 border-white/20 hover:border-white/40"
          }
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={
          isListening
            ? {
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                  "0 0 60px rgba(168, 85, 247, 0.8)",
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                ],
              }
            : {}
        }
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Audio Waveform Visualization */}
        <AudioWaveform
          isActive={isListening}
          stream={mediaStream || undefined}
        />

        {/* Particle Effect Background */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-400 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                  animate={{
                    x: [
                      0,
                      Math.cos((i * Math.PI) / 8) * 40,
                      Math.cos((i * Math.PI) / 8) * 60,
                    ],
                    y: [
                      0,
                      Math.sin((i * Math.PI) / 8) * 40,
                      Math.sin((i * Math.PI) / 8) * 60,
                    ],
                    opacity: [1, 0.5, 0],
                    scale: [1, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="relative"
              >
                <Brain className="w-8 h-8 text-purple-300" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-fuchsia-300" />
                </motion.div>
              </motion.div>
            ) : isListening ? (
              <motion.div
                key="listening"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative"
              >
                <Mic className="w-8 h-8 text-purple-300" />
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <MicOff className="w-8 h-8 text-white/60" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Mode Indicator */}
        {useAI && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Status Overlay */}
      <AnimatePresence>
        {(isListening || isProcessing || lastCommand) && (
          <motion.div
            className="fixed bottom-32 right-6 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div
              className="
              px-6 py-4 rounded-2xl
              bg-gradient-to-br from-black/90 to-black/70
              backdrop-blur-xl
              border border-white/10
              shadow-2xl
              max-w-sm
            "
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`
                  w-2 h-2 rounded-full
                  ${
                    isListening
                      ? "bg-purple-400 animate-pulse"
                      : isProcessing
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-green-400"
                  }
                `}
                />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
                  {isProcessing ? (
                    <>
                      <Brain className="w-3 h-3" />
                      AI Processing
                    </>
                  ) : isListening ? (
                    "Listening..."
                  ) : (
                    "Dynasty AI"
                  )}
                </span>
                {useAI && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 border border-purple-400/30 text-purple-300">
                    GPT-4
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-white/80"
                  >
                    <span className="text-white/40">You said:</span>{" "}
                    <span className="font-medium">"{transcript}"</span>
                  </motion.div>
                )}

                {lastCommand && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
                  >
                    {lastCommand}
                  </motion.div>
                )}

                {isListening && !transcript && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-sm text-white/60"
                  >
                    {useAI
                      ? "Say anything - I understand natural language..."
                      : "Say a command..."}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Help Tooltip */}
      <AnimatePresence>
        {!isListening && !lastCommand && (
          <motion.div
            className="fixed bottom-32 right-6 z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 1 }}
          >
            <div
              className="
              px-4 py-3 rounded-xl
              bg-black/70 backdrop-blur-lg
              border border-purple-400/30
              shadow-lg
              text-xs
              max-w-xs
            "
            >
              <div className="font-semibold text-purple-300 mb-1 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Hey Dynasty - AI Voice Assistant
              </div>
              <div className="text-white/70">
                Tap to speak naturally:
                <div className="mt-1 space-y-0.5 text-[10px]">
                  <div>• "Go to my courses"</div>
                  <div>• "What should I study today?"</div>
                  <div>• "Show my progress"</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Mode Toggle (Hidden - for debugging) */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={() => setUseAI(!useAI)}
          className="fixed bottom-6 left-6 z-50 px-3 py-1 text-xs bg-black/50 backdrop-blur-lg border border-white/10 rounded-full text-white/60 hover:text-white/90"
        >
          {useAI ? "AI Mode" : "Keyword Mode"}
        </button>
      )}
    </>
  );
}
