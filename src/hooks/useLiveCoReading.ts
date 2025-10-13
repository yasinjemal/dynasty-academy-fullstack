'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

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

export function useLiveCoReading(bookSlug: string, currentPage: number) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pageReaders, setPageReaders] = useState<Reader[]>([]);
  const [readerCount, setReaderCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user || !bookSlug) return;

    // Initialize socket
    const socketInstance = io({
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🎭 Connected to live co-reading!');
      setIsConnected(true);

      // Join book room
      socketInstance.emit('join-book', {
        bookId: bookSlug,
        bookSlug,
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
        userAvatar: session.user.image,
      });

      // Update current page
      socketInstance.emit('update-page', {
        bookSlug,
        page: currentPage,
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
        userAvatar: session.user.image,
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('👋 Disconnected from live co-reading');
      setIsConnected(false);
    });

    // Listen for page presence updates
    socketInstance.on('page-presence-updated', (data: PagePresence) => {
      if (data.page === currentPage) {
        setPageReaders(data.readers);
        setReaderCount(data.count);
      }
    });

    // Listen for new messages
    socketInstance.on('new-message', (message: ChatMessage) => {
      if (message.page === currentPage) {
        setMessages((prev) => [...prev, message].slice(-50)); // Keep last 50
      }
    });

    // Listen for reactions
    socketInstance.on('new-reaction', (reaction: Reaction) => {
      if (reaction.page === currentPage) {
        setReactions((prev) => [...prev, reaction]);
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
        }, 5000);
      }
    });

    // Typing indicators
    socketInstance.on('user-typing', ({ userName }: { userName: string }) => {
      setTypingUsers((prev) => [...new Set([...prev, userName])]);
    });

    socketInstance.on('user-stopped-typing', ({ userName }: { userName: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== userName));
    });

    // Reader joined/left
    socketInstance.on('reader-joined', (reader: Reader) => {
      console.log(`👤 ${reader.userName} joined`);
    });

    socketInstance.on('reader-left', ({ userId, page }: { userId: string; page: number }) => {
      if (page === currentPage) {
        setPageReaders((prev) => prev.filter((r) => r.userId !== userId));
        setReaderCount((prev) => Math.max(0, prev - 1));
      }
    });

    // Cleanup
    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [session?.user, bookSlug]);

  // Update page when it changes
  useEffect(() => {
    if (socket && isConnected && session?.user) {
      socket.emit('update-page', {
        bookSlug,
        page: currentPage,
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
        userAvatar: session.user.image,
      });

      // Get current page readers
      socket.emit('get-page-readers', { bookSlug, page: currentPage }, (data: PagePresence) => {
        setPageReaders(data.readers);
        setReaderCount(data.count);
      });

      // Clear messages and reactions when page changes
      setMessages([]);
      setReactions([]);
    }
  }, [currentPage, socket, isConnected, session?.user, bookSlug]);

  // Send message
  const sendMessage = useCallback((message: string) => {
    if (socket && session?.user && message.trim()) {
      socket.emit('send-message', {
        bookSlug,
        page: currentPage,
        message: message.trim(),
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
        userAvatar: session.user.image,
      });
    }
  }, [socket, session?.user, bookSlug, currentPage]);

  // Send reaction
  const sendReaction = useCallback((emoji: string, textIndex: number) => {
    if (socket && session?.user) {
      socket.emit('send-reaction', {
        bookSlug,
        page: currentPage,
        textIndex,
        emoji,
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
      });
    }
  }, [socket, session?.user, bookSlug, currentPage]);

  // Typing indicator
  const startTyping = useCallback(() => {
    if (socket && session?.user) {
      socket.emit('typing-start', {
        bookSlug,
        userName: session.user.name || 'Anonymous',
      });

      // Auto-stop after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', {
          bookSlug,
          userName: session.user.name || 'Anonymous',
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
    sendMessage,
    sendReaction,
    startTyping,
  };
}
