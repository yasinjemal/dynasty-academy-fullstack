import { useEffect, useCallback } from "react";

interface SyncProgressData {
  bookId: string;
  chapterNumber: number;
  position: number;
  duration: number;
  speed: number;
  voiceId: string;
  completed: boolean;
  deviceId?: string;
  deviceName?: string;
}

interface UseCloudSyncOptions {
  enabled: boolean;
  onSync?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useCloudSync(options: UseCloudSyncOptions = { enabled: true }) {
  const { enabled, onSync, onError } = options;

  // Generate device ID (persistent across sessions)
  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem("dynasty_device_id");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("dynasty_device_id", deviceId);
    }
    return deviceId;
  }, []);

  // Get device name
  const getDeviceName = useCallback(() => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return "Mobile";
    if (/tablet/i.test(ua)) return "Tablet";
    return "Desktop";
  }, []);

  // Save progress to cloud
  const saveProgress = useCallback(
    async (data: SyncProgressData) => {
      if (!enabled) return;

      try {
        const response = await fetch("/api/listening/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            deviceId: getDeviceId(),
            deviceName: getDeviceName(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save progress");
        }

        const result = await response.json();
        onSync?.(result);
        return result;
      } catch (error) {
        console.error("[Cloud Sync] Save failed:", error);
        onError?.(error as Error);
        throw error;
      }
    },
    [enabled, onSync, onError, getDeviceId, getDeviceName]
  );

  // Load progress from cloud
  const loadProgress = useCallback(
    async (bookId: string, chapterNumber: number) => {
      if (!enabled) return null;

      try {
        const response = await fetch(
          `/api/listening/progress?bookId=${bookId}&chapterNumber=${chapterNumber}`
        );

        if (!response.ok) {
          if (response.status === 404) return null; // No saved progress
          throw new Error("Failed to load progress");
        }

        const result = await response.json();
        return result.progress;
      } catch (error) {
        console.error("[Cloud Sync] Load failed:", error);
        onError?.(error as Error);
        return null;
      }
    },
    [enabled, onError]
  );

  return {
    saveProgress,
    loadProgress,
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
  };
}
