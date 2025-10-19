"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Brain,
  Sparkles,
  Globe,
  Volume2,
  Settings,
} from "lucide-react";
import AudioWaveform from "./AudioWaveform";
import NeuralNetworkBackground from "./NeuralNetworkBackground";
import VoiceActivationShockwave from "./VoiceActivationShockwave";
import CircularAudioSpectrum from "./CircularAudioSpectrum";
import dynamic from "next/dynamic";

// Dynamically import 3D component (avoid SSR issues)
const HolographicOrb3D = dynamic(() => import("./HolographicOrb3D"), {
  ssr: false,
});

// TypeScript declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface GPTResponse {
  route: string | null;
  response: string;
  action: "navigate" | "suggest" | "info" | "error";
  context?: string;
}

interface VoiceSettings {
  useAI: boolean;
  useElevenLabs: boolean;
  language: string;
  voiceId: string;
}

type PositionPreset =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "bottom-center";

export default function HeyDynastyUltimate() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [use3DOrb, setUse3DOrb] = useState(true);
  const [position, setPosition] = useState<PositionPreset>("bottom-right");
  const [settings, setSettings] = useState<VoiceSettings>({
    useAI: true,
    useElevenLabs: false, // Default to browser TTS for cost
    language: "en-US",
    voiceId: "Rachel",
  });

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const shouldKeepListeningRef = useRef<boolean>(false);
  const isRestartingRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commandHistoryRef = useRef<string[]>([]);
  const lastCommandTimeRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef<number>(0);
  const maxConsecutiveErrors = 3;

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after each command (auto-restart handles continuity)
        recognition.interimResults = true; // Show interim results
        recognition.lang = settings.language;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log("🎙️ Speech recognition started");
        };

        recognition.onresult = (event: any) => {
          // Clear silence timeout - user is speaking
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }

          // Get the last result
          const lastResultIndex = event.results.length - 1;
          const result = event.results[lastResultIndex];
          const text = result[0].transcript.toLowerCase().trim();
          const confidence = result[0].confidence || 0;

          console.log(
            "🗣️ Recognized:",
            text,
            "| Confidence:",
            (confidence * 100).toFixed(1) + "%",
            "| Final:",
            result.isFinal
          );

          // Show interim results
          setTranscript(text);

          // Only process when final result is received and confidence is acceptable
          if (result.isFinal) {
            // Confidence threshold (ignore low-confidence results)
            if (confidence < 0.5 && confidence > 0) {
              console.log("⚠️ Low confidence, ignoring:", text);
              return;
            }

            // Duplicate detection (prevent processing same command twice)
            const now = Date.now();
            const timeSinceLastCommand = now - lastCommandTimeRef.current;
            const lastCommand =
              commandHistoryRef.current[commandHistoryRef.current.length - 1];

            if (lastCommand === text && timeSinceLastCommand < 2000) {
              console.log("🔄 Duplicate command detected, skipping:", text);
              return;
            }

            console.log("✅ Final result, processing command...");

            // Update command history
            commandHistoryRef.current.push(text);
            if (commandHistoryRef.current.length > 10) {
              commandHistoryRef.current.shift(); // Keep last 10 commands
            }
            lastCommandTimeRef.current = now;

            // Reset error counter on successful recognition
            consecutiveErrorsRef.current = 0;

            processCommand(text);
            logCommand(text);

            // Don't stop - let user give more commands!
            // User can click orb again to stop
            console.log("🔄 Ready for next command...");
          }
        };

        recognition.onerror = (event: any) => {
          console.error("❌ Speech recognition error:", event.error);

          // Reset restarting flag on error
          isRestartingRef.current = false;

          // Increment consecutive errors
          consecutiveErrorsRef.current++;

          // Circuit breaker: Stop if too many consecutive errors
          if (consecutiveErrorsRef.current >= maxConsecutiveErrors) {
            console.error(
              "🚨 Too many consecutive errors, stopping voice assistant"
            );
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            setIsProcessing(false);
            alert(
              "Voice recognition is experiencing issues. Please check your microphone and try again."
            );

            if (mediaStream) {
              mediaStream.getTracks().forEach((track) => track.stop());
              setMediaStream(null);
            }
            return;
          }

          // Show user-friendly error messages
          if (event.error === "not-allowed") {
            alert(
              "Microphone access was denied. Please allow microphone access and try again."
            );
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            setIsProcessing(false);
          } else if (event.error === "no-speech") {
            console.log(
              "⚠️ No speech detected (attempt " +
                consecutiveErrorsRef.current +
                "/" +
                maxConsecutiveErrors +
                ")"
            );
            // Don't stop listening for no-speech errors, but track them
            return;
          } else if (event.error === "audio-capture") {
            alert(
              "No microphone found. Please connect a microphone and try again."
            );
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            setIsProcessing(false);
          } else if (event.error === "aborted") {
            console.log("🛑 Recognition aborted by user");
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            setIsProcessing(false);
          } else {
            console.error(`Voice recognition error: ${event.error}`);
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            setIsProcessing(false);
          }

          if (mediaStream && event.error !== "no-speech") {
            mediaStream.getTracks().forEach((track) => track.stop());
          }
        };

        recognition.onend = () => {
          console.log("🛑 Speech recognition ended");

          // Clear any pending restart timeout
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
          }

          // Auto-restart if user wants to keep listening
          if (
            shouldKeepListeningRef.current &&
            recognitionRef.current &&
            !isRestartingRef.current &&
            consecutiveErrorsRef.current < maxConsecutiveErrors
          ) {
            console.log("🔄 Auto-restarting recognition for more commands...");
            isRestartingRef.current = true;

            // Adaptive delay based on error count (exponential backoff)
            const baseDelay = 100;
            const delay =
              baseDelay *
              Math.pow(2, Math.min(consecutiveErrorsRef.current, 3));
            console.log(
              `⏱️ Restarting in ${delay}ms (error count: ${consecutiveErrorsRef.current})`
            );

            restartTimeoutRef.current = setTimeout(() => {
              try {
                if (shouldKeepListeningRef.current && recognitionRef.current) {
                  recognitionRef.current.start();
                  console.log("✅ Recognition restarted successfully");

                  // Set silence timeout (auto-stop after 30 seconds of no input)
                  silenceTimeoutRef.current = setTimeout(() => {
                    console.log("⏰ Silence timeout - pausing voice assistant");
                    if (recognitionRef.current) {
                      recognitionRef.current.stop();
                    }
                  }, 30000); // 30 seconds
                }
              } catch (error: any) {
                console.error("❌ Failed to restart recognition:", error);

                // Check if it's the "already started" error
                if (error.message?.includes("already started")) {
                  console.log(
                    "⚠️ Recognition already running, resetting state"
                  );
                  isRestartingRef.current = false;
                  return;
                }

                setIsListening(false);
                shouldKeepListeningRef.current = false;
                consecutiveErrorsRef.current++;

                if (mediaStream) {
                  mediaStream.getTracks().forEach((track) => track.stop());
                  setMediaStream(null);
                }
              } finally {
                isRestartingRef.current = false;
              }
            }, delay);
          } else {
            console.log("👋 User stopped listening, cleaning up...");
            setIsListening(false);
            if (mediaStream) {
              mediaStream.getTracks().forEach((track) => track.stop());
              setMediaStream(null);
            }
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      // Cleanup all timers
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // Stop recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Reset refs
      shouldKeepListeningRef.current = false;
      isRestartingRef.current = false;
      consecutiveErrorsRef.current = 0;
    };
  }, [mediaStream, settings.language]);

  // Log analytics (could be sent to backend)
  const logCommand = (command: string) => {
    const analytics = {
      command,
      timestamp: new Date().toISOString(),
      mode: settings.useAI ? "AI" : "keyword",
      language: settings.language,
      success: true,
    };

    // Store in localStorage for now (future: send to analytics API)
    const logs = JSON.parse(localStorage.getItem("voiceCommandLogs") || "[]");
    logs.push(analytics);
    // Keep last 100 commands
    if (logs.length > 100) logs.shift();
    localStorage.setItem("voiceCommandLogs", JSON.stringify(logs));
  };

  // Process command with AI
  const processCommand = async (text: string) => {
    setIsProcessing(true);
    console.log("🎤 Processing command:", text);

    try {
      if (settings.useAI) {
        // AI Mode - Use GPT-4
        console.log("🧠 Using AI mode");
        const response = await fetch("/api/voice/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text }),
        });

        const result: GPTResponse = await response.json();
        console.log("✅ AI Response:", result);
        setLastCommand(result.response);
        await speak(result.response);

        if (result.route && result.action === "navigate") {
          setTimeout(() => {
            router.push(result.route!);
            setIsProcessing(false);
          }, 1200);
        } else {
          setIsProcessing(false);
        }
      } else {
        // Keyword Mode - Simple pattern matching
        console.log("🔑 Using keyword mode");
        const processed = await processKeywordCommand(text);
        if (!processed) {
          await speak(
            "I didn't understand that. Try 'go to dashboard' or 'show courses'"
          );
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("❌ Command processing error:", error);
      await speak("Sorry, something went wrong");
      setIsProcessing(false);
    }
  };

  // Keyword-based command processing (fallback when AI is disabled)
  const processKeywordCommand = async (text: string): Promise<boolean> => {
    const lowerText = text.toLowerCase();

    // Navigation commands
    if (lowerText.includes("dashboard") || lowerText.includes("home")) {
      setLastCommand("Opening dashboard");
      await speak("Opening dashboard");
      setTimeout(() => router.push("/dashboard"), 500);
      return true;
    }

    if (lowerText.includes("course") || lowerText.includes("learn")) {
      setLastCommand("Showing courses");
      await speak("Opening courses");
      setTimeout(() => router.push("/courses"), 500);
      return true;
    }

    if (lowerText.includes("book") || lowerText.includes("read")) {
      setLastCommand("Opening books");
      await speak("Opening books");
      setTimeout(() => router.push("/books"), 500);
      return true;
    }

    if (lowerText.includes("community") || lowerText.includes("feed")) {
      setLastCommand("Opening community");
      await speak("Opening community");
      setTimeout(() => router.push("/community"), 500);
      return true;
    }

    if (lowerText.includes("profile") || lowerText.includes("account")) {
      setLastCommand("Opening profile");
      await speak("Opening profile");
      setTimeout(() => router.push("/profile"), 500);
      return true;
    }

    if (lowerText.includes("settings")) {
      setLastCommand("Opening settings");
      await speak("Opening settings");
      setTimeout(() => router.push("/settings"), 500);
      return true;
    }

    // Help commands
    if (lowerText.includes("help") || lowerText.includes("what can you do")) {
      const helpMessage =
        "I can help you navigate. Try saying: go to dashboard, show courses, open books, or view community";
      setLastCommand(helpMessage);
      await speak(helpMessage);
      return true;
    }

    return false;
  };

  // Text-to-speech with ElevenLabs or browser TTS
  const speak = async (text: string) => {
    try {
      if (settings.useElevenLabs) {
        // Use ElevenLabs for premium voice
        const response = await fetch("/api/voice/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: settings.voiceId,
          }),
        });

        const { audio } = await response.json();

        // Play audio
        const audioData = atob(audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }

        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();

        audioContextRef.current = audioContext;
      } else {
        // Use browser TTS (free)
        if ("speechSynthesis" in window) {
          // Cancel any ongoing speech first
          window.speechSynthesis.cancel();

          // Small delay to ensure cancellation is complete
          await new Promise((resolve) => setTimeout(resolve, 100));

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.1;
          utterance.pitch = 1.0;
          utterance.volume = 0.9;
          utterance.lang = settings.language;

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
      }
    } catch (error) {
      console.error("TTS error:", error);
      // Fallback to browser TTS
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Start/stop listening
  const toggleListening = async () => {
    console.log("🔘 Toggle listening clicked");

    if (!recognitionRef.current) {
      console.error("❌ Voice recognition not supported");
      alert("Voice recognition not supported. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      console.log("⏹️ Stopping listening");

      // Clear all timeouts
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      // Reset flags
      shouldKeepListeningRef.current = false;
      isRestartingRef.current = false;
      consecutiveErrorsRef.current = 0;

      // Stop recognition
      recognitionRef.current.stop();
      setIsListening(false);

      // Clean up microphone
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }

      console.log("✅ Voice assistant stopped cleanly");
    } else {
      console.log("▶️ Starting listening");
      try {
        console.log("🎤 Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        console.log("✅ Microphone access granted");
        setMediaStream(stream);

        setTranscript("");
        setLastCommand("");

        // Reset error counter
        consecutiveErrorsRef.current = 0;

        recognitionRef.current.lang = settings.language;
        console.log("🌍 Language set to:", settings.language);
        console.log("🎯 AI Mode:", settings.useAI ? "ON" : "OFF");

        shouldKeepListeningRef.current = true; // Tell onend to auto-restart
        recognitionRef.current.start();
        setIsListening(true);

        // Trigger shockwave effect
        setShowShockwave(true);
        setTimeout(() => setShowShockwave(false), 2000);

        console.log("👂 Listening for voice commands...");
      } catch (error: any) {
        console.error("❌ Microphone access error:", error);
        if (error.name === "NotAllowedError") {
          alert(
            "Microphone access denied. Please allow microphone access in your browser settings and try again."
          );
        } else if (error.name === "NotFoundError") {
          alert(
            "No microphone found. Please connect a microphone and try again."
          );
        } else {
          alert("Error accessing microphone: " + error.message);
        }
      }
    }
  };

  // Get position classes based on selected position
  const getPositionClasses = () => {
    switch (position) {
      case "bottom-right":
        return "bottom-6 right-6";
      case "bottom-left":
        return "bottom-6 left-6";
      case "top-right":
        return "top-6 right-6";
      case "top-left":
        return "top-6 left-6";
      case "bottom-center":
        return "bottom-6 left-1/2 -translate-x-1/2";
      default:
        return "bottom-6 right-6";
    }
  };

  const getSettingsButtonPosition = () => {
    switch (position) {
      case "bottom-right":
        return "bottom-6 right-28";
      case "bottom-left":
        return "bottom-6 left-28";
      case "top-right":
        return "top-6 right-28";
      case "top-left":
        return "top-6 left-28";
      case "bottom-center":
        return "bottom-6 left-1/2 -translate-x-1/2 ml-28";
      default:
        return "bottom-6 right-28";
    }
  };

  const getSettingsPanelPosition = () => {
    switch (position) {
      case "bottom-right":
        return "bottom-24 right-6";
      case "bottom-left":
        return "bottom-24 left-6";
      case "top-right":
        return "top-24 right-6";
      case "top-left":
        return "top-24 left-6";
      case "bottom-center":
        return "bottom-24 left-1/2 -translate-x-1/2";
      default:
        return "bottom-24 right-6";
    }
  };

  return (
    <>
      {/* Neural Network Background */}
      <NeuralNetworkBackground isActive={isListening || isProcessing} />

      {/* Voice Activation Shockwave */}
      <VoiceActivationShockwave
        trigger={showShockwave}
        onComplete={() => setShowShockwave(false)}
      />

      {/* Main Voice Orb - Black Hole Style */}
      <motion.button
        onClick={toggleListening}
        className={`fixed ${getPositionClasses()} z-50 w-24 h-24 cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Black Hole Container */}
        <div className="relative w-full h-full">
          {/* Gravitational Lensing Rings */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full"
              style={{
                border: isListening
                  ? `2px solid rgba(147, 51, 234, ${0.6 - i * 0.15})`
                  : `1px solid rgba(255, 255, 255, ${0.3 - i * 0.08})`,
                filter: "blur(1px)",
              }}
              animate={{
                scale: [1 + i * 0.2, 1 + i * 0.2 + 0.3, 1 + i * 0.2],
                opacity: isListening ? [0.8, 0.3, 0.8] : [0.4, 0.2, 0.4],
                rotate: isListening ? [0, 360] : [0, 180],
              }}
              transition={{
                scale: {
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 20 - i * 2,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
          ))}

          {/* Accretion Disk - Rotating Matter */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: isListening ? 360 : 180 }}
            transition={{
              duration: isListening ? 8 : 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(32)].map((_, i) => {
              const angle = (i * 360) / 32;
              const radius = 40 + Math.sin(i * 0.5) * 5;
              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-0.5 h-0.5 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    background: isListening
                      ? `linear-gradient(${angle}deg, rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.6))`
                      : `rgba(255, 255, 255, 0.4)`,
                    boxShadow: isListening
                      ? `0 0 ${2 + Math.random() * 3}px rgba(147, 51, 234, 0.8)`
                      : "0 0 2px rgba(255, 255, 255, 0.4)",
                  }}
                  animate={{
                    x: [
                      Math.cos((angle * Math.PI) / 180) * radius,
                      Math.cos((angle * Math.PI) / 180) * (radius + 5),
                      Math.cos((angle * Math.PI) / 180) * radius,
                    ],
                    y: [
                      Math.sin((angle * Math.PI) / 180) * radius,
                      Math.sin((angle * Math.PI) / 180) * (radius + 5),
                      Math.sin((angle * Math.PI) / 180) * radius,
                    ],
                    scale: isListening ? [1, 1.5, 1] : [0.8, 1, 0.8],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.05,
                  }}
                />
              );
            })}
          </motion.div>

          {/* Event Horizon - The Black Core */}
          <motion.div
            className="absolute inset-0 m-auto w-16 h-16 rounded-full overflow-hidden backdrop-blur-2xl"
            style={{
              background: isListening
                ? "radial-gradient(circle at center, rgba(0, 0, 0, 0.95) 0%, rgba(147, 51, 234, 0.3) 70%, transparent 100%)"
                : "radial-gradient(circle at center, rgba(0, 0, 0, 0.8) 0%, rgba(255, 255, 255, 0.1) 70%, transparent 100%)",
              boxShadow: isListening
                ? "inset 0 0 30px rgba(147, 51, 234, 0.6), 0 0 50px rgba(147, 51, 234, 0.4)"
                : "inset 0 0 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.5)",
            }}
            animate={{
              scale: isListening ? [1, 1.05, 1] : [1, 0.98, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Singularity - Ultra Dense Core */}
            <motion.div
              className="absolute inset-0 m-auto w-8 h-8 rounded-full"
              style={{
                background: isListening
                  ? "radial-gradient(circle, rgba(147, 51, 234, 0.8) 0%, rgba(0, 0, 0, 0.95) 60%)"
                  : "radial-gradient(circle, rgba(100, 100, 120, 0.6) 0%, rgba(0, 0, 0, 0.9) 60%)",
                boxShadow: isListening
                  ? "0 0 20px rgba(147, 51, 234, 0.8), inset 0 0 15px rgba(0, 0, 0, 0.9)"
                  : "0 0 10px rgba(100, 100, 120, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.9)",
              }}
              animate={{
                rotate: [0, 360],
                scale: isListening ? [1, 1.1, 1] : [1, 0.95, 1],
              }}
              transition={{
                rotate: {
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              {/* Microphone Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isListening ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Mic className="w-4 h-4 text-purple-300" />
                  </motion.div>
                ) : (
                  <MicOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </motion.div>

            {/* Hawking Radiation - Quantum Particles Escaping */}
            {isListening &&
              [...Array(12)].map((_, i) => (
                <motion.div
                  key={`hawking-${i}`}
                  className="absolute w-0.5 h-0.5 rounded-full bg-purple-400"
                  style={{
                    left: "50%",
                    top: "50%",
                    filter: "blur(0.5px)",
                  }}
                  animate={{
                    x: [
                      0,
                      Math.cos((i * Math.PI) / 6) * 25,
                      Math.cos((i * Math.PI) / 6) * 35,
                    ],
                    y: [
                      0,
                      Math.sin((i * Math.PI) / 6) * 25,
                      Math.sin((i * Math.PI) / 6) * 35,
                    ],
                    opacity: [1, 0.5, 0],
                    scale: [0, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeOut",
                  }}
                />
              ))}
          </motion.div>

          {/* Gravitational Waves - Space-Time Distortion */}
          {isProcessing && (
            <motion.div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`wave-${i}`}
                  className="absolute inset-0 rounded-full border border-purple-400/30"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 2.5],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.7,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Photon Ring - Light Bending Around */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: isListening
                ? "1px solid rgba(236, 72, 153, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.2)",
              filter: "blur(0.5px)",
            }}
            animate={{
              scale: [1.15, 1.25, 1.15],
              opacity: [0.8, 0.4, 0.8],
              rotate: [0, -360],
            }}
            transition={{
              scale: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />
        </div>

        {/* 3D Holographic Orb OR Standard Waveform (Hidden behind black hole) */}
        <div className="absolute inset-0 opacity-0">
          {use3DOrb && isListening ? (
            <HolographicOrb3D
              isListening={isListening}
              isProcessing={isProcessing}
            />
          ) : (
            <AudioWaveform
              isActive={isListening}
              stream={mediaStream || undefined}
            />
          )}
        </div>

        {/* Feature Indicators */}
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          {settings.useAI && (
            <motion.div
              className="w-3 h-3 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full shadow-lg shadow-purple-500/50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          {settings.useElevenLabs && (
            <motion.div
              className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-lg shadow-green-500/50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          )}
        </div>
      </motion.button>

      {/* Settings Button - Enhanced Futuristic Design */}
      <motion.button
        onClick={() => setShowSettings(!showSettings)}
        className={`fixed ${getSettingsButtonPosition()} z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-950/80 to-fuchsia-950/80 backdrop-blur-xl border-2 border-purple-500/30 hover:border-purple-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all group`}
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: showSettings
            ? "0 0 50px rgba(168, 85, 247, 0.6)"
            : "0 0 30px rgba(168, 85, 247, 0.3)",
        }}
      >
        <motion.div
          animate={{ rotate: showSettings ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Settings className="w-6 h-6 text-purple-300 group-hover:text-purple-200" />
        </motion.div>

        {/* Rotating ring effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400/50 border-r-fuchsia-400/50"
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className={`fixed ${getSettingsPanelPosition()} z-50 w-96 bg-gradient-to-br from-black/95 via-purple-950/30 to-black/95 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.4)]`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            {/* Futuristic Header */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-purple-500/20 rounded-2xl blur-xl" />
              <h3 className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 font-bold text-lg flex items-center gap-3 justify-center py-3">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Settings className="w-6 h-6" />
                </motion.div>
                VOICE SETTINGS
              </h3>
            </div>

            <div className="space-y-5">
              {/* Position Selector - Enhanced */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <label className="relative text-purple-300 text-xs font-semibold mb-2 block flex items-center gap-2">
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    📍
                  </motion.div>
                  POSITION
                </label>
                <select
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value as PositionPreset)
                  }
                  className="relative w-full bg-gradient-to-r from-purple-950/50 to-fuchsia-950/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer hover:border-purple-400/50"
                >
                  <option value="bottom-right" className="bg-black">
                    🔮 Bottom Right
                  </option>
                  <option value="bottom-left" className="bg-black">
                    🔮 Bottom Left
                  </option>
                  <option value="top-right" className="bg-black">
                    🔮 Top Right
                  </option>
                  <option value="top-left" className="bg-black">
                    🔮 Top Left
                  </option>
                  <option value="bottom-center" className="bg-black">
                    🔮 Bottom Center
                  </option>
                </select>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

              {/* AI Mode - Enhanced Toggle */}
              <motion.label
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-950/20 to-transparent border border-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm text-white font-medium flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Dynasty Intelligence</div>
                    <div className="text-xs text-purple-300/60">
                      Advanced AI navigation
                    </div>
                  </div>
                </span>
                <input
                  type="checkbox"
                  checked={settings.useAI}
                  onChange={(e) =>
                    setSettings({ ...settings, useAI: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="relative w-14 h-7 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-fuchsia-500" />
              </motion.label>

              {/* 3D Holographic Orb - Enhanced Toggle */}
              <motion.label
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-fuchsia-950/20 to-transparent border border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-all cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm text-white font-medium flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-fuchsia-500/20 group-hover:bg-fuchsia-500/30 transition-colors">
                    <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <div className="font-semibold">3D Holographic Orb</div>
                    <div className="text-xs text-fuchsia-300/60">
                      Immersive visual
                    </div>
                  </div>
                </span>
                <input
                  type="checkbox"
                  checked={use3DOrb}
                  onChange={(e) => setUse3DOrb(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-14 h-7 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-fuchsia-500 peer-checked:to-purple-500" />
              </motion.label>

              {/* Premium Voice - Enhanced Toggle */}
              <motion.label
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-950/20 to-transparent border border-green-500/10 hover:border-green-500/30 transition-all cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm text-white font-medium flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <Volume2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Dynasty Voice Pro</div>
                    <div className="text-xs text-green-300/60">
                      Premium audio synthesis
                    </div>
                  </div>
                </span>
                <input
                  type="checkbox"
                  checked={settings.useElevenLabs}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      useElevenLabs: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="relative w-14 h-7 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500" />
              </motion.label>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

              {/* Language - Enhanced */}
              <label className="flex flex-col gap-3">
                <span className="text-purple-300 text-xs font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  LANGUAGE
                </span>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full bg-gradient-to-r from-purple-950/50 to-fuchsia-950/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer hover:border-purple-400/50"
                >
                  <option value="en-US" className="bg-black">
                    🇺🇸 English (US)
                  </option>
                  <option value="en-GB" className="bg-black">
                    🇬🇧 English (UK)
                  </option>
                  <option value="es-ES" className="bg-black">
                    🇪🇸 Spanish
                  </option>
                  <option value="fr-FR" className="bg-black">
                    🇫🇷 French
                  </option>
                  <option value="de-DE" className="bg-black">
                    🇩🇪 German
                  </option>
                  <option value="it-IT" className="bg-black">
                    🇮🇹 Italian
                  </option>
                  <option value="pt-BR" className="bg-black">
                    🇧🇷 Portuguese
                  </option>
                  <option value="zh-CN" className="bg-black">
                    🇨🇳 Chinese
                  </option>
                  <option value="ja-JP" className="bg-black">
                    🇯🇵 Japanese
                  </option>
                  <option value="ko-KR" className="bg-black">
                    🇰🇷 Korean
                  </option>
                </select>
              </label>

              {/* Futuristic Footer */}
              <motion.div
                className="mt-4 pt-4 border-t border-purple-500/20 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-xs text-purple-300/40 flex items-center justify-center gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    ✨
                  </motion.div>
                  Powered by Dynasty AI
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1,
                    }}
                  >
                    ✨
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Overlay - Enhanced Futuristic Design */}
      <AnimatePresence>
        {(isListening || isProcessing || lastCommand) && (
          <motion.div
            className={`fixed z-50 ${
              position === "bottom-right"
                ? "bottom-32 right-6"
                : position === "bottom-left"
                ? "bottom-32 left-6"
                : position === "top-right"
                ? "top-32 right-6"
                : position === "top-left"
                ? "top-32 left-6"
                : "bottom-32 left-1/2 -translate-x-1/2"
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="relative px-6 py-4 rounded-2xl bg-gradient-to-br from-black/95 via-purple-950/20 to-black/95 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.3)] max-w-sm">
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-purple-500/20 blur-xl opacity-50" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className={`w-3 h-3 rounded-full ${
                      isListening
                        ? "bg-gradient-to-r from-purple-400 to-fuchsia-400"
                        : isProcessing
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                        : "bg-gradient-to-r from-green-400 to-emerald-400"
                    }`}
                    animate={{
                      scale: [1, 1.3, 1],
                      boxShadow: [
                        "0 0 10px rgba(168, 85, 247, 0.5)",
                        "0 0 20px rgba(168, 85, 247, 0.8)",
                        "0 0 10px rgba(168, 85, 247, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                  <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-300 uppercase tracking-wider flex items-center gap-2">
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Brain className="w-4 h-4 text-purple-400" />
                        </motion.div>
                        AI Processing
                      </>
                    ) : isListening ? (
                      <>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                          }}
                        >
                          <Mic className="w-4 h-4 text-purple-400" />
                        </motion.div>
                        Listening...
                      </>
                    ) : (
                      "Dynasty AI"
                    )}
                  </span>
                  {settings.useAI && (
                    <motion.span
                      className="ml-auto text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 border border-purple-400/40 text-purple-200 font-semibold shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      DYNASTY AI
                    </motion.span>
                  )}
                </div>

                <div className="space-y-2">
                  {transcript && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-white font-medium p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                    >
                      <span className="text-purple-300/60 text-xs">
                        You said:
                      </span>{" "}
                      <span className="text-white">"{transcript}"</span>
                    </motion.div>
                  )}

                  {lastCommand && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm font-semibold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent p-3 rounded-xl bg-gradient-to-r from-purple-500/5 to-fuchsia-500/5 border border-purple-400/20"
                    >
                      ✨ {lastCommand}
                    </motion.div>
                  )}

                  {isListening && !transcript && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-sm text-purple-300/70 italic p-3 rounded-xl bg-purple-500/5 border border-purple-500/10"
                    >
                      {settings.useAI
                        ? "💭 Say anything - I understand natural language..."
                        : "🎤 Say a command..."}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
