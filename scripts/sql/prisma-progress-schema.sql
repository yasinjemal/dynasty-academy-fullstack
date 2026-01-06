-- Dynasty Academy: Enhanced Progress Tracking Schema
-- Extends lesson progress with detailed analytics and session tracking

-- Extend existing lesson_progress table with new fields
-- Note: This extends the existing model, doesn't replace it

-- Enhanced Progress Tracking
model EnhancedLessonProgress {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId        String
  lesson          Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  -- Basic progress (from existing table)
  isCompleted     Boolean  @default(false)
  completedAt     DateTime?
  lastPosition    Int      @default(0) // Video position in seconds
  
  -- NEW: Time tracking
  totalTimeSpent  Int      @default(0) // Total seconds spent on this lesson
  lastWatchedAt   DateTime @default(now())
  
  -- NEW: Rewatch tracking
  watchCount      Int      @default(1) // Number of times watched
  rewatchCount    Int      @default(0) // Number of rewatches after completion
  
  -- NEW: Session history (JSON array of watch sessions)
  sessionHistory  Json     @default("[]")
  // Example structure:
  // [
  //   { startTime: "2024-01-01T10:00:00Z", endTime: "2024-01-01T10:45:00Z", duration: 2700 },
  //   { startTime: "2024-01-02T14:00:00Z", endTime: "2024-01-02T14:30:00Z", duration: 1800 }
  // ]
  
  -- NEW: Engagement metrics
  playbackSpeed   Float    @default(1.0) // Average playback speed
  pauseCount      Int      @default(0) // Number of pauses
  seekCount       Int      @default(0) // Number of seeks/skips
  
  -- NEW: Quiz performance (if quiz exists)
  quizAttempts    Int      @default(0)
  quizHighScore   Int      @default(0)
  quizPassed      Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
  @@index([lastWatchedAt])
}

-- Study Streak tracking
model StudyStreak {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  currentStreak   Int      @default(0) // Days in a row
  longestStreak   Int      @default(0) // Best ever streak
  lastStudyDate   DateTime @default(now())
  
  -- Calendar of study days (JSON array of dates)
  studyDates      Json     @default("[]")
  // Example: ["2024-01-01", "2024-01-02", "2024-01-03"]
  
  totalStudyDays  Int      @default(0)
  totalStudyTime  Int      @default(0) // Total minutes studied
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

-- Daily Study Session
model DailyStudySession {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date            DateTime @default(now()) // Date of study session
  totalTime       Int      @default(0) // Minutes studied that day
  lessonsWatched  Int      @default(0)
  quizzesTaken    Int      @default(0)
  
  -- Activity breakdown
  activities      Json     @default("[]")
  // Example:
  // [
  //   { type: "video", lessonId: "xxx", duration: 1800 },
  //   { type: "quiz", lessonId: "yyy", duration: 600 }
  // ]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([userId, date])
  @@index([userId])
  @@index([date])
}
