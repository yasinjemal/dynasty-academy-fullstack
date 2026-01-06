-- Add Community Narrator System Tables
-- Run this in your Supabase SQL editor

-- 1. Add NarrationStatus enum
DO $$ BEGIN
  CREATE TYPE "NarrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Update CommunityNarration table (keep existing columns, add new ones)
-- Note: This attempts to ALTER the table if it exists, CREATE if it doesn't
CREATE TABLE IF NOT EXISTS "community_narrations" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "pageNumber" INTEGER NOT NULL,
  "paragraphHash" TEXT,
  "paragraphText" TEXT,
  "language" TEXT DEFAULT 'en',
  "readingStyle" TEXT DEFAULT 'narrative',
  "audioUrl" TEXT NOT NULL,
  "waveformUrl" TEXT,
  "format" TEXT DEFAULT 'webm',
  "durationSec" DOUBLE PRECISION,
  "sizeBytes" INTEGER,
  "transcript" TEXT,
  "asrConfidence" DOUBLE PRECISION,
  "wordErrorRate" DOUBLE PRECISION,
  "qualityScore" DOUBLE PRECISION,
  "status" "NarrationStatus" DEFAULT 'PENDING',
  "moderationReason" TEXT,
  "moderatedBy" TEXT,
  "moderatedAt" TIMESTAMP(3),
  "license" TEXT DEFAULT 'CC-BY-NC',
  "playCount" INTEGER DEFAULT 0,
  "likeCount" INTEGER DEFAULT 0,
  "contentHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "duration" INTEGER,
  "plays" INTEGER,
  "likes" INTEGER,
  
  CONSTRAINT "community_narrations_pkey" PRIMARY KEY ("id")
);

-- Add columns that might be missing (will fail silently if they exist)
DO $$ 
BEGIN
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "paragraphHash" TEXT;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "paragraphText" TEXT;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'en';
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "readingStyle" TEXT DEFAULT 'narrative';
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "waveformUrl" TEXT;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "format" TEXT DEFAULT 'webm';
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "durationSec" DOUBLE PRECISION;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "sizeBytes" INTEGER;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "transcript" TEXT;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "asrConfidence" DOUBLE PRECISION;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "wordErrorRate" DOUBLE PRECISION;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "qualityScore" DOUBLE PRECISION;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "status" "NarrationStatus" DEFAULT 'PENDING';
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "moderationReason" TEXT;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "moderatedBy" TEXT;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3);
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "license" TEXT DEFAULT 'CC-BY-NC';
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "playCount" INTEGER DEFAULT 0;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "likeCount" INTEGER DEFAULT 0;
  ALTER TABLE "community_narrations" ADD COLUMN IF NOT EXISTS "contentHash" TEXT;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Create NarrationLike table
CREATE TABLE IF NOT EXISTS "narration_likes" (
  "id" TEXT NOT NULL,
  "narrationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "narration_likes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "narration_likes_narrationId_userId_unique" UNIQUE("narrationId", "userId")
);

-- 4. Create NarrationPlay table
CREATE TABLE IF NOT EXISTS "narration_plays" (
  "id" TEXT NOT NULL,
  "narrationId" TEXT NOT NULL,
  "userId" TEXT,
  "ipHash" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "narration_plays_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "narration_plays_narrationId_userId_ipHash_day_unique" UNIQUE("narrationId", "userId", "ipHash", "day")
);

-- 5. Create NarrationFlag table
CREATE TABLE IF NOT EXISTS "narration_flags" (
  "id" TEXT NOT NULL,
  "narrationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" TEXT DEFAULT 'PENDING',
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "narration_flags_pkey" PRIMARY KEY ("id")
);

-- 6. Create BookPermission table
CREATE TABLE IF NOT EXISTS "book_permissions" (
  "id" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "allowCommunityNarrations" BOOLEAN DEFAULT true,
  "allowRevenueShare" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "book_permissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "book_permissions_bookId_unique" UNIQUE("bookId")
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS "community_narrations_userId_idx" ON "community_narrations"("userId");
CREATE INDEX IF NOT EXISTS "community_narrations_bookId_idx" ON "community_narrations"("bookId");
CREATE INDEX IF NOT EXISTS "community_narrations_bookId_pageNumber_idx" ON "community_narrations"("bookId", "pageNumber");
CREATE INDEX IF NOT EXISTS "community_narrations_paragraphHash_idx" ON "community_narrations"("paragraphHash");
CREATE INDEX IF NOT EXISTS "community_narrations_contentHash_idx" ON "community_narrations"("contentHash");
CREATE INDEX IF NOT EXISTS "community_narrations_status_idx" ON "community_narrations"("status");
CREATE INDEX IF NOT EXISTS "community_narrations_status_bookId_pageNumber_idx" ON "community_narrations"("status", "bookId", "pageNumber");

CREATE INDEX IF NOT EXISTS "narration_likes_narrationId_idx" ON "narration_likes"("narrationId");
CREATE INDEX IF NOT EXISTS "narration_likes_userId_idx" ON "narration_likes"("userId");

CREATE INDEX IF NOT EXISTS "narration_plays_narrationId_idx" ON "narration_plays"("narrationId");
CREATE INDEX IF NOT EXISTS "narration_plays_day_idx" ON "narration_plays"("day");

CREATE INDEX IF NOT EXISTS "narration_flags_narrationId_idx" ON "narration_flags"("narrationId");
CREATE INDEX IF NOT EXISTS "narration_flags_status_idx" ON "narration_flags"("status");

-- 8. Add foreign key constraints
DO $$ 
BEGIN
  ALTER TABLE "community_narrations" DROP CONSTRAINT IF EXISTS "community_narrations_userId_fkey";
  ALTER TABLE "community_narrations" ADD CONSTRAINT "community_narrations_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
  ALTER TABLE "community_narrations" DROP CONSTRAINT IF EXISTS "community_narrations_bookId_fkey";
  ALTER TABLE "community_narrations" ADD CONSTRAINT "community_narrations_bookId_fkey" 
    FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
  ALTER TABLE "community_narrations" DROP CONSTRAINT IF EXISTS "community_narrations_moderatedBy_fkey";
  ALTER TABLE "community_narrations" ADD CONSTRAINT "community_narrations_moderatedBy_fkey" 
    FOREIGN KEY ("moderatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    
  ALTER TABLE "narration_likes" DROP CONSTRAINT IF EXISTS "narration_likes_narrationId_fkey";
  ALTER TABLE "narration_likes" ADD CONSTRAINT "narration_likes_narrationId_fkey" 
    FOREIGN KEY ("narrationId") REFERENCES "community_narrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
  ALTER TABLE "narration_likes" DROP CONSTRAINT IF EXISTS "narration_likes_userId_fkey";
  ALTER TABLE "narration_likes" ADD CONSTRAINT "narration_likes_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
  ALTER TABLE "narration_plays" DROP CONSTRAINT IF EXISTS "narration_plays_narrationId_fkey";
  ALTER TABLE "narration_plays" ADD CONSTRAINT "narration_plays_narrationId_fkey" 
    FOREIGN KEY ("narrationId") REFERENCES "community_narrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
  ALTER TABLE "narration_plays" DROP CONSTRAINT IF EXISTS "narration_plays_userId_fkey";
  ALTER TABLE "narration_plays" ADD CONSTRAINT "narration_plays_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    
  ALTER TABLE "narration_flags" DROP CONSTRAINT IF EXISTS "narration_flags_narrationId_fkey";
  ALTER TABLE "narration_flags" ADD CONSTRAINT "narration_flags_narrationId_fkey" 
    FOREIGN KEY ("narrationId") REFERENCES "community_narrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
  ALTER TABLE "narration_flags" DROP CONSTRAINT IF EXISTS "narration_flags_userId_fkey";
  ALTER TABLE "narration_flags" ADD CONSTRAINT "narration_flags_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
  ALTER TABLE "narration_flags" DROP CONSTRAINT IF EXISTS "narration_flags_resolvedBy_fkey";
  ALTER TABLE "narration_flags" ADD CONSTRAINT "narration_flags_resolvedBy_fkey" 
    FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    
  ALTER TABLE "book_permissions" DROP CONSTRAINT IF EXISTS "book_permissions_bookId_fkey";
  ALTER TABLE "book_permissions" ADD CONSTRAINT "book_permissions_bookId_fkey" 
    FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 9. Enable community narrations for all existing books (optional - change to false if you want to enable manually)
INSERT INTO "book_permissions" ("id", "bookId", "allowCommunityNarrations", "allowRevenueShare", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  "id",
  true,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "books"
WHERE "id" NOT IN (SELECT "bookId" FROM "book_permissions");

-- Done!
SELECT 'Community Narrator System tables created successfully!' AS status;
