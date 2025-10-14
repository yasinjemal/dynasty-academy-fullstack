"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Reader {
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  page: number;
  timestamp: number;
  edited?: boolean;
  editedAt?: string;
  createdAt?: string;
}

interface Reaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  page: number;
  textIndex: number;
  timestamp: number;
}

interface PagePresence {
  page: number;
  readers: Reader[];
  count: number;
}

interface MessageResponse {
  messages: ChatMessage[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export function useLiveCoReading(bookSlug: string, currentPage: number, bookId?: string) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pageReaders, setPageReaders] = useState<Reader[]>([]);
  const [readerCount, setReaderCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set()); // Prevent duplicates

  // Load messages from API
  const loadMessages = useCallback(async (cursor?: string) => {
    if (!bookId || !currentPage) return;

    setIsLoadingMessages(true);
    try {
      const params = new URLSearchParams({
        bookId,
        page: currentPage.toString(),
        limit: '50',
      });
      
      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/co-reading/messages?${params}`);
      if (!response.ok) throw new Error('Failed to load messages');

      const data: MessageResponse = await response.json();
      
      // Convert createdAt to timestamp for consistency
      const formattedMessages = data.messages.map(msg => ({
        ...msg,
        timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : msg.timestamp,
      }));

      // Merge with existing messages, avoiding duplicates
      setMessages(prev => {
        const newMessages = formattedMessages.filter(
          msg => !messageIdsRef.current.has(msg.id)
        );
        newMessages.forEach(msg => messageIdsRef.current.add(msg.id));
        
        // If loading more (cursor exists), prepend old messages
        if (cursor) {
          return [...newMessages, ...prev];
        }
        // Initial load, replace all
        return newMessages;
      });

      setHasMoreMessages(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load message history');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [bookId, currentPage]);

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user || !bookSlug) return;

    // Initialize socket
    const socketInstance = io({
      path: "/api/socketio",
      addTrailingSlash: false,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("🎭 Connected to live co-reading!");
      setIsConnected(true);

      // Join book room
      socketInstance.emit("join-book", {
        bookId: bookSlug,
        bookSlug,
        userId: session.user.id,
        userName: session.user.name || "Anonymous",
        userAvatar: session.user.image,
      });

      // Update current page
      socketInstance.emit("update-page", {
        bookSlug,
        page: currentPage,
        userId: session.user.id,
        userName: session.user.name || "Anonymous",
        userAvatar: session.user.image,
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("👋 Disconnected from live co-reading");
      setIsConnected(false);
    });

    // Listen for page presence updates
    socketInstance.on("page-presence-updated", (data: PagePresence) => {
      if (data.page === currentPage) {
        setPageReaders(data.readers);
        setReaderCount(data.count);
      }
    });

    // Listen for new messages
    socketInstance.on("new-message", (message: ChatMessage) => {
      if (message.page === currentPage) {
        // Avoid duplicates
        if (!messageIdsRef.current.has(message.id)) {
          messageIdsRef.current.add(message.id);
          setMessages((prev) => [...prev, message].slice(-100)); // Keep last 100
        }
      }
    });

    // Handle rate limit exceeded
    socketInstance.on("rate-limit-exceeded", ({ message: errorMsg, cooldown }: { message: string; cooldown: number }) => {
      toast.error(errorMsg, {
        description: `Please wait ${cooldown} seconds before sending more messages.`,
        duration: 5000,
      });
    });

    // Handle message errors
    socketInstance.on("message-error", ({ message: errorMsg }: { message: string }) => {
      toast.error(errorMsg);
    });

    // Listen for reactions
    socketInstance.on("new-reaction", (reaction: Reaction) => {
      if (reaction.page === currentPage) {
        setReactions((prev) => [...prev, reaction]);
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
        }, 5000);
      }
    });

    // Typing indicators
    socketInstance.on("user-typing", ({ userName }: { userName: string }) => {
      setTypingUsers((prev) => [...new Set([...prev, userName])]);
    });

    socketInstance.on(
      "user-stopped-typing",
      ({ userName }: { userName: string }) => {
        setTypingUsers((prev) => prev.filter((u) => u !== userName));
      }
    );

    // Reader joined/left
    socketInstance.on("reader-joined", (reader: Reader) => {
      console.log(`👤 ${reader.userName} joined`);
    });

    socketInstance.on(
      "reader-left",
      ({ userId, page }: { userId: string; page: number }) => {
        if (page === currentPage) {
          setPageReaders((prev) => prev.filter((r) => r.userId !== userId));
          setReaderCount((prev) => Math.max(0, prev - 1));
        }
      }
    );

    // Cleanup
    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [session?.user, bookSlug]);

  // Update page when it changes
  useEffect(() => {
    if (socket && isConnected && session?.user) {
      socket.emit("update-page", {
        bookId: bookId || bookSlug,
        bookSlug,
        page: currentPage,
        userId: session.user.id,
        userName: session.user.name || "Anonymous",
        userAvatar: session.user.image,
      });

      // Get current page readers
      socket.emit(
        "get-page-readers",
        { bookSlug, page: currentPage },
        (data: PagePresence) => {
          setPageReaders(data.readers);
          setReaderCount(data.count);
        }
      );

      // Clear messages and reactions when page changes
      setMessages([]);
      setReactions([]);
      messageIdsRef.current.clear();
      setNextCursor(null);
      setHasMoreMessages(false);

      // Load messages from API for this page
      loadMessages();
    }
  }, [currentPage, socket, isConnected, session?.user, bookSlug, bookId, loadMessages]);

  // Send message
  const sendMessage = useCallback(
    (message: string) => {
      if (socket && session?.user && message.trim()) {
        socket.emit("send-message", {
          bookId: bookId || bookSlug,
          bookSlug,
          page: currentPage,
          message: message.trim(),
          userId: session.user.id,
          userName: session.user.name || "Anonymous",
          userAvatar: session.user.image,
        });
      }
    },
    [socket, session?.user, bookSlug, bookId, currentPage]
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (nextCursor && !isLoadingMessages) {
      loadMessages(nextCursor);
    }
  }, [nextCursor, isLoadingMessages, loadMessages]);

  // Send reaction
  const sendReaction = useCallback(
    (emoji: string, textIndex: number) => {
      if (socket && session?.user) {
        socket.emit("send-reaction", {
          bookSlug,
          page: currentPage,
          textIndex,
          emoji,
          userId: session.user.id,
          userName: session.user.name || "Anonymous",
        });
      }
    },
    [socket, session?.user, bookSlug, currentPage]
  );

  // Typing indicator
  const startTyping = useCallback(() => {
    if (socket && session?.user) {
      socket.emit("typing-start", {
        bookSlug,
        userName: session.user.name || "Anonymous",
      });

      // Auto-stop after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing-stop", {
          bookSlug,
          userName: session.user.name || "Anonymous",
        });
      }, 3000);
    }
  }, [socket, session?.user, bookSlug]);

  return {
    isConnected,
    pageReaders,
    readerCount,
    messages,
    reactions,
    typingUsers,
    isLoadingMessages,
    hasMoreMessages,
    sendMessage,
    sendReaction,
    startTyping,
    loadMoreMessages,
  };
}
