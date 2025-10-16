-- Dynasty Academy: Course Reviews & Ratings Schema
-- Allows students to review and rate courses after completion

-- Course Review model
model CourseReview {
  id              String   @id @default(cuid())
  courseId        String
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  -- Review content
  rating          Int      // 1-5 stars
  title           String   // Review headline
  content         String   @db.Text // Full review text
  
  -- Engagement
  helpfulVotes    Int      @default(0)
  reportCount     Int      @default(0)
  
  -- Instructor response
  instructorReply String?  @db.Text
  repliedAt       DateTime?
  
  -- Metadata
  completedCourse Boolean  @default(true) // Must complete to review
  isVerified      Boolean  @default(false) // Verified purchase/enrollment
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([courseId, userId]) // One review per user per course
  @@index([courseId])
  @@index([userId])
  @@index([rating])
}

-- Review Helpful Votes
model ReviewHelpfulVote {
  id        String   @id @default(cuid())
  reviewId  String
  review    CourseReview @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([reviewId, userId])
  @@index([reviewId])
  @@index([userId])
}

-- Course Rating Summary (denormalized for performance)
model CourseRatingSummary {
  id              String   @id @default(cuid())
  courseId        String   @unique
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  -- Aggregate ratings
  averageRating   Float    @default(0.0)
  totalReviews    Int      @default(0)
  
  -- Rating distribution
  fiveStars       Int      @default(0)
  fourStars       Int      @default(0)
  threeStars      Int      @default(0)
  twoStars        Int      @default(0)
  oneStar         Int      @default(0)
  
  updatedAt       DateTime @updatedAt
}
