-- Dynasty Academy: Course Resources Schema
-- Allows instructors to attach downloadable files to lessons

-- Resource model - files attached to lessons
model LessonResource {
  id          String   @id @default(cuid())
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  title       String
  description String?
  fileUrl     String   // URL to file (Cloudinary, S3, etc.)
  fileType    String   // pdf, zip, docx, etc.
  fileSize    Int      // in bytes
  
  downloadCount Int    @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([lessonId])
}

-- Resource Download tracking
model ResourceDownload {
  id         String   @id @default(cuid())
  resourceId String
  resource   LessonResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  downloadedAt DateTime @default(now())
  
  @@index([resourceId])
  @@index([userId])
  @@unique([resourceId, userId]) // Track unique downloads per user
}
