// WebSocket Server for Live Co-Reading (Production-Grade)
// This runs on the Next.js API route with database persistence
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { NextApiResponse } from "next";
import { prisma } from "@/lib/db/prisma";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

// Reader presence tracking
interface ReaderPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  bookId: string;
  bookSlug: string;
  currentPage: number;
  timestamp: number;
}

// In-memory store (use Redis in production)
const activeReaders = new Map<string, ReaderPresence>();
const pageReaders = new Map<string, Set<string>>(); // bookSlug:page -> Set of userIds

// TTL Cleanup Job - Remove stale presence records older than 45s
async function cleanupStalePresence() {
  try {
    const ttlThreshold = new Date(Date.now() - 45 * 1000); // 45 seconds ago
    
    const deleted = await prisma.readingPresence.deleteMany({
      where: {
        lastSeenAt: {
          lt: ttlThreshold,
        },
      },
    });

    if (deleted.count > 0) {
      console.log(`🧹 Cleaned up ${deleted.count} stale presence records`);
    }
  } catch (error) {
    console.error("Error cleaning up stale presence:", error);
  }
}

export function initializeSocketIO(res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("🎭 Initializing Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    // Start TTL cleanup job (runs every 30 seconds)
    setInterval(cleanupStalePresence, 30000);
    console.log("🧹 Started presence TTL cleanup job (45s threshold)");

    io.on("connection", (socket) => {
      console.log(`👤 User connected: ${socket.id}`);

      // Join a book reading room
      socket.on(
        "join-book",
        (data: {
          bookId: string;
          bookSlug: string;
          userId: string;
          userName: string;
          userAvatar?: string;
        }) => {
          const { bookId, bookSlug, userId, userName, userAvatar } = data;

          socket.join(`book:${bookSlug}`);
          socket.data.bookSlug = bookSlug;
          socket.data.userId = userId;

          console.log(`📖 ${userName} joined book: ${bookSlug}`);

          // Notify others
          socket.to(`book:${bookSlug}`).emit("reader-joined", {
            userId,
            userName,
            userAvatar,
          });
        }
      );

      // Update reading position (with database presence tracking)
      socket.on(
        "update-page",
        async (data: {
          bookId: string;
          bookSlug: string;
          page: number;
          userId: string;
          userName: string;
          userAvatar?: string;
        }) => {
          const { bookId, bookSlug, page, userId, userName, userAvatar } = data;

          const readerKey = `${bookSlug}:${userId}`;
          const pageKey = `${bookSlug}:${page}`;

          // Remove from previous page
          if (activeReaders.has(readerKey)) {
            const oldReader = activeReaders.get(readerKey)!;
            const oldPageKey = `${bookSlug}:${oldReader.currentPage}`;
            if (pageReaders.has(oldPageKey)) {
              pageReaders.get(oldPageKey)!.delete(userId);
            }
          }

          // Update presence
          activeReaders.set(readerKey, {
            userId,
            userName,
            userAvatar,
            bookId,
            bookSlug,
            currentPage: page,
            timestamp: Date.now(),
          });

          // Add to new page
          if (!pageReaders.has(pageKey)) {
            pageReaders.set(pageKey, new Set());
          }
          pageReaders.get(pageKey)!.add(userId);

          // Persist presence to database
          try {
            await prisma.readingPresence.upsert({
              where: {
                userId_bookId: {
                  userId,
                  bookId,
                },
              },
              update: {
                page,
                socketId: socket.id,
                lastSeenAt: new Date(),
              },
              create: {
                userId,
                bookId,
                bookSlug,
                page,
                socketId: socket.id,
                lastSeenAt: new Date(),
              },
            });
          } catch (error) {
            console.error("Error updating presence:", error);
          }

          // Broadcast to everyone in the book
          io.to(`book:${bookSlug}`).emit("page-presence-updated", {
            page,
            readers: Array.from(pageReaders.get(pageKey) || [])
              .map((uid) => {
                const reader = activeReaders.get(`${bookSlug}:${uid}`);
                return reader
                  ? {
                      userId: reader.userId,
                      userName: reader.userName,
                      userAvatar: reader.userAvatar,
                    }
                  : null;
              })
              .filter(Boolean),
            count: pageReaders.get(pageKey)?.size || 0,
          });

          console.log(
            `📄 ${userName} on page ${page} (${
              pageReaders.get(pageKey)?.size || 0
            } readers) - PRESENCE SAVED`
          );
        }
      );

      // Send live chat message (with database persistence)
      socket.on(
        "send-message",
        async (data: {
          bookId: string;
          bookSlug: string;
          page: number;
          message: string;
          userId: string;
          userName: string;
          userAvatar?: string;
        }) => {
          const { bookId, bookSlug, page, message, userId, userName, userAvatar } =
            data;

          try {
            // Rate limiting: Check last minute's messages
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
            const recentMessages = await prisma.pageChat.count({
              where: {
                userId,
                createdAt: {
                  gte: oneMinuteAgo,
                },
              },
            });

            if (recentMessages >= 10) {
              socket.emit("rate-limit-exceeded", {
                message: "Rate limit exceeded. Please wait before sending more messages.",
                cooldown: 60,
              });
              return;
            }

            // Persist message to database
            const savedMessage = await prisma.pageChat.create({
              data: {
                bookId,
                bookSlug,
                page,
                userId,
                message,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            });

            const chatMessage = {
              id: savedMessage.id,
              userId: savedMessage.userId,
              userName: savedMessage.user.name || userName,
              userAvatar: savedMessage.user.image || userAvatar,
              message: savedMessage.message,
              page: savedMessage.page,
              timestamp: savedMessage.createdAt.getTime(),
              edited: savedMessage.edited,
            };

            // Broadcast to everyone on this page
            io.to(`book:${bookSlug}`).emit("new-message", chatMessage);

            console.log(`💬 ${userName}: ${message} (page ${page}) - SAVED TO DB`);
          } catch (error) {
            console.error("Error saving message:", error);
            socket.emit("message-error", {
              message: "Failed to send message. Please try again.",
            });
          }
        }
      );

      // Send reaction
      socket.on(
        "send-reaction",
        (data: {
          bookSlug: string;
          page: number;
          textIndex: number;
          emoji: string;
          userId: string;
          userName: string;
        }) => {
          const { bookSlug, page, textIndex, emoji, userId, userName } = data;

          const reaction = {
            id: `${Date.now()}-${Math.random()}`,
            userId,
            userName,
            emoji,
            page,
            textIndex,
            timestamp: Date.now(),
          };

          // Broadcast to everyone in the book
          io.to(`book:${bookSlug}`).emit("new-reaction", reaction);

          console.log(`⚡ ${userName} reacted ${emoji} on page ${page}`);
        }
      );

      // Typing indicator
      socket.on(
        "typing-start",
        (data: { bookSlug: string; userName: string }) => {
          socket
            .to(`book:${data.bookSlug}`)
            .emit("user-typing", { userName: data.userName });
        }
      );

      socket.on(
        "typing-stop",
        (data: { bookSlug: string; userName: string }) => {
          socket
            .to(`book:${data.bookSlug}`)
            .emit("user-stopped-typing", { userName: data.userName });
        }
      );

      // Disconnect
      socket.on("disconnect", () => {
        const bookSlug = socket.data.bookSlug;
        const userId = socket.data.userId;

        if (bookSlug && userId) {
          const readerKey = `${bookSlug}:${userId}`;
          const reader = activeReaders.get(readerKey);

          if (reader) {
            const pageKey = `${bookSlug}:${reader.currentPage}`;

            // Remove from page tracking
            if (pageReaders.has(pageKey)) {
              pageReaders.get(pageKey)!.delete(userId);
            }

            // Remove from active readers
            activeReaders.delete(readerKey);

            // Notify others
            socket.to(`book:${bookSlug}`).emit("reader-left", {
              userId,
              page: reader.currentPage,
            });

            console.log(`👋 ${reader.userName} left ${bookSlug}`);
          }
        }

        console.log(`❌ User disconnected: ${socket.id}`);
      });

      // Get current page readers
      socket.on(
        "get-page-readers",
        (data: { bookSlug: string; page: number }, callback) => {
          const pageKey = `${data.bookSlug}:${data.page}`;
          const readers = Array.from(pageReaders.get(pageKey) || [])
            .map((uid) => {
              const reader = activeReaders.get(`${data.bookSlug}:${uid}`);
              return reader
                ? {
                    userId: reader.userId,
                    userName: reader.userName,
                    userAvatar: reader.userAvatar,
                  }
                : null;
            })
            .filter(Boolean);

          callback({ readers, count: readers.length });
        }
      );
    });

    console.log("✅ Socket.IO server initialized!");
  } else {
    console.log("♻️ Socket.IO server already running");
  }

  return res.socket.server.io;
}
