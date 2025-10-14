"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced username check
  useEffect(() => {
    if (!username) {
      setIsAvailable(null);
      setError("");
      return;
    }

    // Validation
    const usernameRegex = /^(?!_)(?!.*__)[a-z0-9_]{3,20}(?<!_)$/;
    if (!usernameRegex.test(username)) {
      setIsAvailable(false);
      setError("3-20 chars, lowercase, numbers, underscore only");
      return;
    }

    setError("");
    setIsChecking(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/users/check-username?username=${username}`
        );
        const data = await response.json();
        setIsAvailable(data.available);
        if (!data.available) {
          setError(data.reason || "Username taken");
        }
      } catch (err) {
        console.error("Error checking username:", err);
        setIsAvailable(false);
        setError("Error checking availability");
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleClaim = async () => {
    if (!isAvailable || !username) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome to Dynasty Academy! 🎉", {
          description: `Your profile is ready @${username}`,
        });
        onComplete();
      } else {
        toast.error("Error", { description: data.error });
        setError(data.error);
      }
    } catch (error) {
      console.error("Error claiming username:", error);
      toast.error("Error", { description: "Failed to claim username" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast.info("You can set your username later in Profile Settings");
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-purple-900/90 via-gray-900/90 to-pink-900/90 rounded-2xl shadow-2xl max-w-md w-full border border-purple-500/20 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Welcome to Dynasty!
              </h2>
              <p className="text-purple-100 text-sm">
                Choose your username to get started
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    @
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="yourname"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                  {/* Status Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isChecking && (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {!isChecking && isAvailable === true && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {!isChecking && isAvailable === false && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              {/* Info */}
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  Username Rules:
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 3-20 characters</li>
                  <li>• Lowercase letters, numbers, underscore</li>
                  <li>• Cannot start or end with underscore</li>
                  <li>• Can change later (30-day cooldown)</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleClaim}
                  disabled={!isAvailable || isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600 shadow-lg shadow-purple-500/25"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Let's Go! 🚀"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
