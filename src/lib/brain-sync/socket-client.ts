"use client";

import { io, Socket } from "socket.io-client";

// Types for Brain Sync events
export interface BrainSyncUser {
  id: string;
  name: string;
  image?: string;
  level: number;
  color: string;
  cursor?: { x: number; y: number };
  currentPage?: number;
  scrollPosition?: number;
  isTyping?: boolean;
  isSpeaking?: boolean;
  isFocused?: boolean;
  joinedAt: Date;
}

export interface BrainSyncMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userImage?: string;
  userColor: string;
  content: string;
  timestamp: Date;
  type: "text" | "highlight" | "reaction" | "system" | "ai-prompt" | "quiz";
  replyTo?: string;
}

export interface SharedHighlight {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
  pageNumber: number;
  text: string;
  startOffset: number;
  endOffset: number;
  note?: string;
  reactions: { emoji: string; userId: string; userName: string }[];
  createdAt: Date;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  x: number;
  timestamp: number;
}

export interface StudySession {
  id: string;
  roomId: string;
  startedAt: Date;
  duration: number; // minutes
  breakDuration: number; // minutes
  currentPhase: "study" | "break";
  phaseEndTime: Date;
  participants: string[];
}

export interface CollaborativeNote {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
  pageNumber: number;
  content: string;
  position: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface BrainSyncRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  hostImage?: string;
  contentId: string;
  contentTitle: string;
  contentType: "book" | "course" | "lesson";
  participants: BrainSyncUser[];
  messages: BrainSyncMessage[];
  highlights: SharedHighlight[];
  notes: CollaborativeNote[];
  session?: StudySession;
  isPrivate: boolean;
  maxParticipants: number;
  tags: string[];
  level: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  settings: {
    allowVoice: boolean;
    allowHighlights: boolean;
    allowNotes: boolean;
    syncPages: boolean;
    pomodoroEnabled: boolean;
  };
}

// Socket events
export type BrainSyncEvents = {
  // Client -> Server
  "room:join": (data: { roomId: string; user: Partial<BrainSyncUser> }) => void;
  "room:leave": (data: { roomId: string }) => void;
  "room:create": (data: Partial<BrainSyncRoom>) => void;
  "cursor:move": (data: {
    roomId: string;
    cursor: { x: number; y: number };
  }) => void;
  "page:change": (data: { roomId: string; page: number }) => void;
  "scroll:update": (data: { roomId: string; position: number }) => void;
  "message:send": (data: {
    roomId: string;
    content: string;
    type?: string;
    replyTo?: string;
  }) => void;
  "highlight:create": (data: {
    roomId: string;
    highlight: Partial<SharedHighlight>;
  }) => void;
  "highlight:react": (data: {
    roomId: string;
    highlightId: string;
    emoji: string;
  }) => void;
  "reaction:send": (data: { roomId: string; emoji: string }) => void;
  "note:create": (data: {
    roomId: string;
    note: Partial<CollaborativeNote>;
  }) => void;
  "note:update": (data: {
    roomId: string;
    noteId: string;
    content: string;
  }) => void;
  "typing:start": (data: { roomId: string }) => void;
  "typing:stop": (data: { roomId: string }) => void;
  "voice:join": (data: { roomId: string }) => void;
  "voice:leave": (data: { roomId: string }) => void;
  "voice:speaking": (data: { roomId: string; isSpeaking: boolean }) => void;
  "session:start": (data: {
    roomId: string;
    duration: number;
    breakDuration: number;
  }) => void;
  "session:pause": (data: { roomId: string }) => void;
  "session:resume": (data: { roomId: string }) => void;
  "focus:update": (data: { roomId: string; isFocused: boolean }) => void;

  // Server -> Client
  "room:joined": (room: BrainSyncRoom) => void;
  "room:updated": (room: Partial<BrainSyncRoom>) => void;
  "room:user-joined": (user: BrainSyncUser) => void;
  "room:user-left": (userId: string) => void;
  "cursor:updated": (data: {
    userId: string;
    cursor: { x: number; y: number };
  }) => void;
  "page:updated": (data: { userId: string; page: number }) => void;
  "scroll:updated": (data: { userId: string; position: number }) => void;
  "message:received": (message: BrainSyncMessage) => void;
  "highlight:created": (highlight: SharedHighlight) => void;
  "highlight:reacted": (data: {
    highlightId: string;
    emoji: string;
    userId: string;
    userName: string;
  }) => void;
  "reaction:received": (reaction: FloatingReaction) => void;
  "note:created": (note: CollaborativeNote) => void;
  "note:updated": (data: { noteId: string; content: string }) => void;
  "typing:updated": (data: { userId: string; isTyping: boolean }) => void;
  "voice:updated": (data: { userId: string; isSpeaking: boolean }) => void;
  "session:updated": (session: StudySession) => void;
  "focus:changed": (data: { userId: string; isFocused: boolean }) => void;
  "ai:suggestion": (data: { type: string; content: string }) => void;
  "achievement:unlocked": (data: {
    userId: string;
    achievement: string;
    xp: number;
  }) => void;
};

class BrainSyncSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string, token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

      this.socket = io(socketUrl, {
        path: "/api/brain-sync/socket",
        auth: { userId, token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on("connect", () => {
        console.log("🧠 Brain Sync connected!");
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🧠 Brain Sync disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("🧠 Brain Sync connection error:", error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(error);
        }
      });

      // Set up event forwarding
      this.setupEventForwarding();
    });
  }

  private setupEventForwarding() {
    const events = [
      "room:joined",
      "room:updated",
      "room:user-joined",
      "room:user-left",
      "cursor:updated",
      "page:updated",
      "scroll:updated",
      "message:received",
      "highlight:created",
      "highlight:reacted",
      "reaction:received",
      "note:created",
      "note:updated",
      "typing:updated",
      "voice:updated",
      "session:updated",
      "focus:changed",
      "ai:suggestion",
      "achievement:unlocked",
    ];

    events.forEach((event) => {
      this.socket?.on(event, (data: any) => {
        this.emit(event, data);
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  // Emit to server
  send<K extends keyof BrainSyncEvents>(
    event: K,
    data: Parameters<BrainSyncEvents[K]>[0]
  ) {
    if (!this.socket?.connected) {
      console.warn("🧠 Brain Sync not connected");
      return;
    }
    this.socket.emit(event, data);
  }

  // Local event emitter for components
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const brainSyncSocket = new BrainSyncSocketClient();

// React hook for Brain Sync
export function useBrainSync() {
  return brainSyncSocket;
}
