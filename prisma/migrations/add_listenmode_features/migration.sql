-- ============================================
-- LISTENMODE PHASE 2: Cloud Sync + Gamification
-- ============================================

-- 1. LISTENING PROGRESS TABLE (Multi-Device Cloud Sync)
CREATE TABLE IF NOT EXISTS "listening_progress" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "chapterNumber" INTEGER NOT NULL,
  "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "voiceId" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "lastListened" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deviceId" TEXT,
  "deviceName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "listening_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "listening_progress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint: one progress per user/book/chapter
CREATE UNIQUE INDEX IF NOT EXISTS "listening_progress_userId_bookId_chapterNumber_key" 
ON "listening_progress"("userId", "bookId", "chapterNumber");

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS "listening_progress_userId_idx" ON "listening_progress"("userId");
CREATE INDEX IF NOT EXISTS "listening_progress_lastListened_idx" ON "listening_progress"("lastListened");

-- 2. LISTENING STREAKS TABLE
CREATE TABLE IF NOT EXISTS "listening_streaks" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastListenDate" DATE NOT NULL,
  "totalMinutes" INTEGER NOT NULL DEFAULT 0,
  "totalSessions" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "listening_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint: one streak per user
CREATE UNIQUE INDEX IF NOT EXISTS "listening_streaks_userId_key" ON "listening_streaks"("userId");

-- 3. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS "achievements" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "category" TEXT NOT NULL, -- LISTENING, READING, ENGAGEMENT, MILESTONE
  "requirement" INTEGER NOT NULL,
  "dynastyPoints" INTEGER NOT NULL DEFAULT 0,
  "rarity" TEXT NOT NULL DEFAULT 'COMMON', -- COMMON, RARE, EPIC, LEGENDARY
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS "user_achievements" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "progress" INTEGER NOT NULL DEFAULT 0,
  
  CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint: user can only unlock achievement once
CREATE UNIQUE INDEX IF NOT EXISTS "user_achievements_userId_achievementId_key" 
ON "user_achievements"("userId", "achievementId");

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS "user_achievements_userId_idx" ON "user_achievements"("userId");

-- 5. SENTENCE HIGHLIGHTS TABLE (Cross-device sync)
CREATE TABLE IF NOT EXISTS "sentence_highlights" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "chapterNumber" INTEGER NOT NULL,
  "sentenceIndex" INTEGER NOT NULL,
  "sentenceText" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "sentence_highlights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sentence_highlights_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint: one highlight per sentence per user
CREATE UNIQUE INDEX IF NOT EXISTS "sentence_highlights_userId_bookId_chapter_sentence_key" 
ON "sentence_highlights"("userId", "bookId", "chapterNumber", "sentenceIndex");

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS "sentence_highlights_userId_bookId_idx" ON "sentence_highlights"("userId", "bookId");

-- 6. LISTENING ANALYTICS TABLE (Advanced Dashboard)
CREATE TABLE IF NOT EXISTS "listening_analytics" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3),
  "duration" INTEGER NOT NULL DEFAULT 0, -- seconds
  "speed" DOUBLE PRECISION NOT NULL,
  "voiceId" TEXT NOT NULL,
  "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "device" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "listening_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "listening_analytics_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS "listening_analytics_userId_startTime_idx" 
ON "listening_analytics"("userId", "startTime");
CREATE INDEX IF NOT EXISTS "listening_analytics_bookId_idx" ON "listening_analytics"("bookId");

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================

INSERT INTO "achievements" ("id", "key", "name", "description", "icon", "category", "requirement", "dynastyPoints", "rarity") VALUES
-- LISTENING ACHIEVEMENTS
('ach_001', 'first_listen', 'First Listen', 'Complete your first listening session', '🎧', 'LISTENING', 1, 10, 'COMMON'),
('ach_002', 'night_owl', 'Night Owl', 'Listen after 10 PM', '🌙', 'LISTENING', 1, 25, 'RARE'),
('ach_003', 'speed_demon', 'Speed Demon', 'Listen at 2x speed for 30 minutes', '⚡', 'LISTENING', 30, 50, 'EPIC'),
('ach_004', 'marathon', 'Marathon Listener', 'Listen for 3 hours straight', '🏃', 'LISTENING', 180, 100, 'EPIC'),
('ach_005', 'early_bird', 'Early Bird', 'Listen before 6 AM', '🌅', 'LISTENING', 1, 25, 'RARE'),

-- STREAK ACHIEVEMENTS
('ach_006', 'streak_3', '3-Day Streak', 'Listen for 3 consecutive days', '🔥', 'LISTENING', 3, 30, 'COMMON'),
('ach_007', 'streak_7', 'Week Warrior', 'Listen for 7 consecutive days', '💪', 'LISTENING', 7, 75, 'RARE'),
('ach_008', 'streak_30', 'Monthly Master', 'Listen for 30 consecutive days', '👑', 'LISTENING', 30, 300, 'LEGENDARY'),
('ach_009', 'streak_100', 'Century Club', 'Listen for 100 consecutive days', '💎', 'LISTENING', 100, 1000, 'LEGENDARY'),

-- MILESTONE ACHIEVEMENTS
('ach_010', 'hours_10', '10 Hours', 'Listen for 10 total hours', '⏰', 'MILESTONE', 600, 50, 'COMMON'),
('ach_011', 'hours_50', '50 Hours', 'Listen for 50 total hours', '⏱️', 'MILESTONE', 3000, 200, 'RARE'),
('ach_012', 'hours_100', '100 Hours', 'Listen for 100 total hours', '🕐', 'MILESTONE', 6000, 500, 'EPIC'),
('ach_013', 'hours_500', '500 Hours', 'Listen for 500 total hours', '🏆', 'MILESTONE', 30000, 2000, 'LEGENDARY'),

-- ENGAGEMENT ACHIEVEMENTS
('ach_014', 'highlighter', 'Highlighter', 'Highlight 10 sentences', '✨', 'ENGAGEMENT', 10, 30, 'COMMON'),
('ach_015', 'reflector', 'Deep Thinker', 'Create 5 reflections from audio', '💭', 'ENGAGEMENT', 5, 50, 'RARE'),
('ach_016', 'sharer', 'Social Butterfly', 'Share 20 sentences', '🦋', 'ENGAGEMENT', 20, 75, 'RARE'),
('ach_017', 'voice_explorer', 'Voice Explorer', 'Try all 5 voices', '🎤', 'ENGAGEMENT', 5, 40, 'COMMON'),

-- READING ACHIEVEMENTS
('ach_018', 'book_1', 'First Book', 'Complete your first audiobook', '📖', 'READING', 1, 100, 'COMMON'),
('ach_019', 'book_5', 'Bookworm', 'Complete 5 audiobooks', '📚', 'READING', 5, 300, 'RARE'),
('ach_020', 'book_10', 'Scholar', 'Complete 10 audiobooks', '🎓', 'READING', 10, 750, 'EPIC')
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE "listening_progress" IS 'Stores user listening progress for multi-device sync';
COMMENT ON TABLE "listening_streaks" IS 'Tracks user listening streaks and total minutes';
COMMENT ON TABLE "achievements" IS 'Global achievements that users can unlock';
COMMENT ON TABLE "user_achievements" IS 'User-specific achievement unlocks';
COMMENT ON TABLE "sentence_highlights" IS 'User sentence highlights synced across devices';
COMMENT ON TABLE "listening_analytics" IS 'Detailed listening analytics for dashboard';
