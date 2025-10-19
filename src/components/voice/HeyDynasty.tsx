"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Zap } from "lucide-react";

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

export default function HeyDynasty() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const recognitionRef = useRef<any>(null);

  // Voice command mappings
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
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Process voice command
  const processCommand = (text: string) => {
    setIsProcessing(true);

    // Find matching command
    const matchedCommand = commands.find((cmd) =>
      cmd.keywords.some((keyword) => text.includes(keyword))
    );

    if (matchedCommand) {
      setLastCommand(matchedCommand.response);
      speak(matchedCommand.response);

      // Navigate after a brief delay for voice feedback
      setTimeout(() => {
        router.push(matchedCommand.route);
        setIsProcessing(false);
      }, 1000);
    } else {
      speak("Sorry, I didn't understand that command");
      setIsProcessing(false);
    }
  };

  // Text-to-speech
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start/stop listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setLastCommand("");
      recognitionRef.current.start();
      setIsListening(true);
      speak("Listening");
    }
  };

  return (
    <>
      {/* Floating Voice Orb */}
      <motion.button
        onClick={toggleListening}
        className={`
          fixed bottom-6 right-6 z-50
          w-16 h-16 rounded-full
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
                  "0 0 40px rgba(168, 85, 247, 0.6)",
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
        {/* Particle Effect Background */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(12)].map((_, i) => (
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
                      Math.cos((i * Math.PI) / 6) * 30,
                      Math.cos((i * Math.PI) / 6) * 50,
                    ],
                    y: [
                      0,
                      Math.sin((i * Math.PI) / 6) * 30,
                      Math.sin((i * Math.PI) / 6) * 50,
                    ],
                    opacity: [1, 0.5, 0],
                    scale: [1, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
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
              >
                <Zap className="w-7 h-7 text-purple-300" />
              </motion.div>
            ) : isListening ? (
              <motion.div
                key="listening"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative"
              >
                <Mic className="w-7 h-7 text-purple-300" />
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
                <MicOff className="w-7 h-7 text-white/60" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Status Overlay */}
      <AnimatePresence>
        {(isListening || isProcessing || lastCommand) && (
          <motion.div
            className="fixed bottom-28 right-6 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div
              className="
              px-6 py-4 rounded-2xl
              bg-gradient-to-br from-black/80 to-black/60
              backdrop-blur-xl
              border border-white/10
              shadow-2xl
              max-w-xs
            "
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`
                  w-2 h-2 rounded-full
                  ${
                    isListening ? "bg-purple-400 animate-pulse" : "bg-green-400"
                  }
                `}
                />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  {isProcessing
                    ? "Processing"
                    : isListening
                    ? "Listening..."
                    : "Dynasty AI"}
                </span>
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
                    Say a command...
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Tooltip (on first visit) */}
      <AnimatePresence>
        {!isListening && !lastCommand && (
          <motion.div
            className="fixed bottom-28 right-6 z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 1 }}
          >
            <div
              className="
              px-4 py-2 rounded-xl
              bg-black/60 backdrop-blur-lg
              border border-purple-400/30
              shadow-lg
              text-xs text-white/70
              whitespace-nowrap
            "
            >
              <span className="font-semibold text-purple-300">Hey Dynasty</span>{" "}
              - Tap to speak 🎙️
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
