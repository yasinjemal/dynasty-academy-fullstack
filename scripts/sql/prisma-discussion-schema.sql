-- Course Discussion/Q&A Schema

-- Lesson Question model
model LessonQuestion {
  id          String   @id @default(uuid())
  lessonId    String
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title       String
  content     String
  isResolved  Boolean  @default(false)
  upvotes     Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  answers     LessonAnswer[]
  votes       QuestionVote[]
  
  @@index([lessonId])
  @@index([userId])
  @@index([lessonId, isResolved])
}

-- Lesson Answer model
model LessonAnswer {
  id          String   @id @default(uuid())
  questionId  String
  question    LessonQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  content     String
  isInstructorAnswer Boolean @default(false)
  isBestAnswer Boolean  @default(false)
  upvotes     Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  votes       AnswerVote[]
  
  @@index([questionId])
  @@index([userId])
}

-- Question Vote model
model QuestionVote {
  id          String   @id @default(uuid())
  questionId  String
  question    LessonQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@unique([questionId, userId])
  @@index([questionId])
  @@index([userId])
}

-- Answer Vote model
model AnswerVote {
  id          String   @id @default(uuid())
  answerId    String
  answer      LessonAnswer @relation(fields: [answerId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@unique([answerId, userId])
  @@index([answerId])
  @@index([userId])
}
