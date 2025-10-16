-- Dynasty Academy: Bookmarks & Favorites Schema
-- Allows students to bookmark video timestamps and favorite lessons

-- Video Bookmark model - save specific timestamps in videos
model VideoBookmark {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  lessonId        String
  lesson          Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  -- Bookmark details
  timestamp       Int      // Position in seconds
  title           String   // User's note/label for the bookmark
  note            String?  @db.Text // Optional longer note
  
  -- Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([lessonId])
  @@index([userId, lessonId])
}

-- Favorite Lesson model - quick access to favorite lessons
model FavoriteLesson {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  lessonId        String
  lesson          Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  
  @@unique([userId, lessonId]) // Can't favorite the same lesson twice
  @@index([userId])
  @@index([lessonId])
}

-- Favorite Course model - bookmark entire courses
model FavoriteCourse {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  courseId        String
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  
  @@unique([userId, courseId]) // Can't favorite the same course twice
  @@index([userId])
  @@index([courseId])
}
