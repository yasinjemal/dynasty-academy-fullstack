-- Add Co-Reading Tables Migration
-- This adds the new tables without affecting existing data

-- ReadingPresence: Track real-time presence of readers
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reading_presence') THEN
    CREATE TABLE "reading_presence" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "bookId" TEXT NOT NULL,
        "bookSlug" TEXT NOT NULL,
        "page" INTEGER NOT NULL,
        "socketId" TEXT,
        "lastSeenAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "reading_presence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "reading_presence_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    CREATE UNIQUE INDEX "reading_presence_userId_bookId_key" ON "reading_presence"("userId", "bookId");
    CREATE INDEX "reading_presence_bookId_page_lastSeenAt_idx" ON "reading_presence"("bookId", "page", "lastSeenAt");
    CREATE INDEX "reading_presence_lastSeenAt_idx" ON "reading_presence"("lastSeenAt");
  END IF;
END $$;

-- PageChat: Store persistent chat messages per page
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'page_chats') THEN
    CREATE TABLE "page_chats" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookId" TEXT NOT NULL,
        "bookSlug" TEXT NOT NULL,
        "page" INTEGER NOT NULL,
        "userId" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "edited" BOOLEAN NOT NULL DEFAULT false,
        "editedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "page_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "page_chats_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    CREATE INDEX "page_chats_bookId_page_createdAt_idx" ON "page_chats"("bookId", "page", "createdAt");
    CREATE INDEX "page_chats_userId_createdAt_idx" ON "page_chats"("userId", "createdAt");
  END IF;
END $$;

-- PageReaction: Aggregate reactions per page
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'page_reactions') THEN
    CREATE TABLE "page_reactions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookId" TEXT NOT NULL,
        "bookSlug" TEXT NOT NULL,
        "page" INTEGER NOT NULL,
        "emote" TEXT NOT NULL,
        "count" INTEGER NOT NULL DEFAULT 0,
        "userIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "page_reactions_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    CREATE UNIQUE INDEX "page_reactions_bookId_page_emote_key" ON "page_reactions"("bookId", "page", "emote");
    CREATE INDEX "page_reactions_bookId_page_idx" ON "page_reactions"("bookId", "page");
  END IF;
END $$;

-- CoReadingAnalytics: Track engagement analytics
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'co_reading_analytics') THEN
    CREATE TABLE "co_reading_analytics" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookId" TEXT NOT NULL,
        "page" INTEGER NOT NULL,
        "date" DATE NOT NULL,
        "peakConcurrent" INTEGER NOT NULL DEFAULT 0,
        "avgConcurrent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalMessages" INTEGER NOT NULL DEFAULT 0,
        "totalReactions" INTEGER NOT NULL DEFAULT 0,
        "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
        "avgTimeToFirstMsg" DOUBLE PRECISION,
        
        CONSTRAINT "co_reading_analytics_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    CREATE UNIQUE INDEX "co_reading_analytics_bookId_page_date_key" ON "co_reading_analytics"("bookId", "page", "date");
    CREATE INDEX "co_reading_analytics_bookId_date_idx" ON "co_reading_analytics"("bookId", "date");
  END IF;
END $$;
