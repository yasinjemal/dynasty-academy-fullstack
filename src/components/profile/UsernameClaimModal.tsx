"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Loader2, Clock, AtSign } from "lucide-react";
import { toast } from "sonner";

interface UsernameClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername?: string | null;
  onSuccess: (newUsername: string) => void;
}

export default function UsernameClaimModal({
  isOpen,
  onClose,
  currentUsername,
  onSuccess,
}: UsernameClaimModalProps) {
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCooldown();
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.length >= 3) {
        checkAvailability();
      } else {
        setAvailable(null);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const fetchCooldown = async () => {
    try {
      const res = await fetch("/api/users/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.usernameChangedAt) {
          const changedAt = new Date(data.usernameChangedAt);
          const cooldownEnd = new Date(
            changedAt.getTime() + 30 * 24 * 60 * 60 * 1000
          ); // 30 days
          if (cooldownEnd > new Date()) {
            setCooldown(cooldownEnd);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch cooldown:", error);
    }
  };

  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-z0-9_]+$/.test(value))
      return "Only lowercase letters, numbers, and underscores";
    if (value.startsWith("_") || value.endsWith("_"))
      return "Cannot start or end with underscore";
    return null;
  };

  const checkAvailability = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      setAvailable(false);
      return;
    }

    if (username === currentUsername) {
      setError("This is already your username");
      setAvailable(false);
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/users/check-username?username=${encodeURIComponent(username)}`
      );
      const data = await res.json();

      if (data.available) {
        setAvailable(true);
        setError(null);
      } else {
        setAvailable(false);
        setError("Username is already taken");
      }
    } catch (error) {
      console.error("Failed to check username:", error);
      setError("Failed to check availability");
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleClaim = async () => {
    if (!available || cooldown) return;

    setClaiming(true);

    try {
      const res = await fetch("/api/users/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Username @${username} claimed successfully! 🎉`);
        onSuccess(username);
        onClose();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to claim username");
      }
    } catch (error) {
      console.error("Failed to claim username:", error);
      toast.error("Something went wrong");
    } finally {
      setClaiming(false);
    }
  };

  const getDaysUntilCooldownEnd = () => {
    if (!cooldown) return 0;
    const now = new Date();
    const diff = cooldown.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        >
          {/* Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:border-gray-800 dark:from-purple-950/20 dark:to-blue-950/20">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 transition-colors hover:bg-white/50 hover:text-gray-700 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <AtSign className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Claim Username
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your unique @handle
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {cooldown ? (
              // Cooldown Warning
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/20">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-100">
                      Username Change Cooldown
                    </p>
                    <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                      You can change your username again in{" "}
                      <strong>{getDaysUntilCooldownEnd()} days</strong>
                    </p>
                    <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                      Cooldown ends: {cooldown.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Current Username */}
                {currentUsername && (
                  <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current username
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      @{currentUsername}
                    </p>
                  </div>
                )}

                {/* Input */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().trim())
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-8 pr-12 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="username"
                      maxLength={20}
                      autoFocus
                    />
                    {checking && (
                      <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
                    )}
                    {!checking && available === true && (
                      <Check className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
                    )}
                    {!checking && available === false && (
                      <AlertCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
                    )}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}
                    {available && !error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-green-600 dark:text-green-400"
                      >
                        ✓ Username is available!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Rules */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username Rules:
                  </p>
                  <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <li>• 3-20 characters</li>
                    <li>• Lowercase letters, numbers, underscores only</li>
                    <li>• Cannot start or end with underscore</li>
                    <li>• Can be changed once every 30 days</li>
                    <li>
                      • Old username redirects to new one for 14 days
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!cooldown && (
            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaim}
                  disabled={!available || claiming}
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    "Claim Username"
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
