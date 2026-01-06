-- Quiz System Schema
-- Add these to your Prisma schema

-- Quiz model
model Quiz {
  id          String   @id @default(uuid())
  lessonId    String
  title       String
  description String?
  passingScore Int     @default(80) // Percentage needed to pass
  timeLimit   Int?    // Optional time limit in minutes
  maxAttempts Int?    // Optional max attempts (null = unlimited)
  order       Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  questions   QuizQuestion[]
  attempts    QuizAttempt[]
  
  @@index([lessonId])
}

-- Quiz Question model
model QuizQuestion {
  id          String   @id @default(uuid())
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  question    String
  type        QuestionType @default(MULTIPLE_CHOICE)
  options     Json     // Array of options for multiple choice
  correctAnswer String  // Correct answer or answers (JSON for multiple)
  explanation String?  // Optional explanation shown after answer
  points      Int      @default(1)
  order       Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([quizId])
}

-- Quiz Attempt model
model QuizAttempt {
  id          String   @id @default(uuid())
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  score       Int      // Percentage score
  passed      Boolean  @default(false)
  answers     Json     // User's answers
  timeSpent   Int?     // Time spent in seconds
  attemptNumber Int    @default(1)
  
  startedAt   DateTime @default(now())
  completedAt DateTime?
  
  @@index([quizId])
  @@index([userId])
  @@index([quizId, userId])
}

-- Question Type Enum
enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
  MULTIPLE_SELECT
}
