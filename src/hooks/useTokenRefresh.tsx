"use client";

/**
 * useTokenRefresh Hook
 *
 * Automatically refreshes NextAuth session before expiration
 * Shows notification when token is about to expire
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UseTokenRefreshOptions {
  /**
   * How many seconds before expiration to trigger refresh
   * Default: 5 minutes (300 seconds)
   */
  refreshThreshold?: number;

  /**
   * Show notification when token is about to expire
   * Default: true
   */
  showNotification?: boolean;

  /**
   * Redirect to login on expiration
   * Default: true
   */
  redirectOnExpiry?: boolean;

  /**
   * Callback when token is refreshed
   */
  onRefresh?: () => void;

  /**
   * Callback when token expires
   */
  onExpire?: () => void;
}

export function useTokenRefresh(options: UseTokenRefreshOptions = {}) {
  const {
    refreshThreshold = 300, // 5 minutes
    showNotification = true,
    redirectOnExpiry = true,
    onRefresh,
    onExpire,
  } = options;

  const { data: session, update } = useSession();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.expires) return;

    const checkExpiration = () => {
      const expiresAt = new Date(session.expires).getTime();
      const now = Date.now();
      const secondsUntilExpiry = Math.floor((expiresAt - now) / 1000);

      setTimeUntilExpiry(secondsUntilExpiry);

      // Token expired
      if (secondsUntilExpiry <= 0) {
        handleExpiration();
        return;
      }

      // Token needs refresh
      if (secondsUntilExpiry <= refreshThreshold && !isRefreshing) {
        handleRefresh();
      }
    };

    // Check immediately
    checkExpiration();

    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30000);

    return () => clearInterval(interval);
  }, [session, refreshThreshold, isRefreshing]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);

      if (showNotification) {
        console.log("🔄 Refreshing session token...");
      }

      // Trigger NextAuth session update
      await update();

      if (showNotification) {
        console.log("✅ Session refreshed successfully");
      }

      onRefresh?.();
    } catch (error) {
      console.error("❌ Failed to refresh session:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExpiration = () => {
    if (showNotification) {
      console.warn("⚠️ Session expired. Please log in again.");
    }

    onExpire?.();

    if (redirectOnExpiry) {
      router.push("/login?callbackUrl=" + window.location.pathname);
    }
  };

  const manualRefresh = async () => {
    await handleRefresh();
  };

  return {
    timeUntilExpiry,
    isRefreshing,
    manualRefresh,
  };
}

/**
 * SessionExpiryNotification Component
 * Shows a banner when session is about to expire
 */
export function SessionExpiryNotification() {
  const { timeUntilExpiry, manualRefresh, isRefreshing } = useTokenRefresh({
    refreshThreshold: 300, // 5 minutes
    showNotification: false,
  });

  // Don't show if more than 2 minutes remaining
  if (!timeUntilExpiry || timeUntilExpiry > 120) {
    return null;
  }

  const minutes = Math.floor(timeUntilExpiry / 60);
  const seconds = timeUntilExpiry % 60;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold">Session Expiring Soon</p>
            <p className="text-sm">
              Your session will expire in {minutes}:
              {seconds.toString().padStart(2, "0")}
            </p>
          </div>
        </div>
        <button
          onClick={manualRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors disabled:opacity-50"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Now"}
        </button>
      </div>
    </div>
  );
}

/**
 * SessionMonitor Component
 * Add this to your root layout to monitor all sessions
 */
export function SessionMonitor() {
  useTokenRefresh({
    refreshThreshold: 300, // Refresh 5 minutes before expiry
    showNotification: true,
    redirectOnExpiry: true,
  });

  return null; // This component doesn't render anything
}
