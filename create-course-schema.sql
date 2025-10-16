-- Dynasty Academy Course System
-- Advanced course platform with videos, PDFs, quizzes, and Intelligence OS

-- ===== COURSE MODELS =====

CREATE TABLE IF NOT EXISTS "courses" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "shortDescription" TEXT,
  "coverImage" TEXT,
  "previewVideo" TEXT,
  
  -- Content & Structure
  "level" TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced, expert
  "category" TEXT NOT NULL,
  "tags" TEXT[],
  "duration" INTEGER, -- total minutes
  "lessonCount" INTEGER DEFAULT 0,
  
  -- Pricing
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "currency" TEXT DEFAULT 'USD',
  "isFree" BOOLEAN DEFAULT false,
  "discount" INTEGER DEFAULT 0, -- percentage
  
  -- Status
  "status" TEXT DEFAULT 'draft', -- draft, published, archived
  "featured" BOOLEAN DEFAULT false,
  "isPremium" BOOLEAN DEFAULT false,
  
  -- Author
  "authorId" TEXT NOT NULL,
  "instructorName" TEXT,
  "instructorBio" TEXT,
  "instructorImage" TEXT,
  
  -- Stats
  "enrollmentCount" INTEGER DEFAULT 0,
  "completionCount" INTEGER DEFAULT 0,
  "averageRating" DECIMAL(3,2) DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "viewCount" INTEGER DEFAULT 0,
  
  -- SEO
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "ogImage" TEXT,
  
  -- Certificates
  "certificateEnabled" BOOLEAN DEFAULT false,
  "certificateTemplate" TEXT,
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP
);

-- ===== COURSE SECTIONS (Modules/Chapters) =====

CREATE TABLE IF NOT EXISTS "course_sections" (
  "id" TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL,
  "isLocked" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_course_sections_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE
);

-- ===== COURSE LESSONS =====

CREATE TABLE IF NOT EXISTS "course_lessons" (
  "id" TEXT PRIMARY KEY,
  "sectionId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL,
  
  -- Content Type
  "type" TEXT NOT NULL, -- video, pdf, article, quiz, assignment
  "content" TEXT, -- HTML content for articles
  
  -- Video
  "videoUrl" TEXT,
  "videoProvider" TEXT, -- youtube, vimeo, cloudinary, custom
  "videoDuration" INTEGER, -- seconds
  "videoThumbnail" TEXT,
  
  -- PDF/Downloads
  "pdfUrl" TEXT,
  "downloadUrl" TEXT,
  "fileSize" INTEGER, -- bytes
  
  -- Settings
  "isFree" BOOLEAN DEFAULT false,
  "isLocked" BOOLEAN DEFAULT false,
  "unlockAfter" TEXT, -- lesson ID that must be completed first
  
  -- Transcript
  "transcript" TEXT,
  "hasTranscript" BOOLEAN DEFAULT false,
  
  -- Stats
  "viewCount" INTEGER DEFAULT 0,
  "completionCount" INTEGER DEFAULT 0,
  "averageWatchTime" INTEGER DEFAULT 0, -- seconds
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_course_lessons_section"
    FOREIGN KEY ("sectionId") REFERENCES "course_sections"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_course_lessons_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE,
    
  UNIQUE("courseId", "slug")
);

-- ===== COURSE RESOURCES (PDFs, Downloads, Links) =====

CREATE TABLE IF NOT EXISTS "course_resources" (
  "id" TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL,
  "lessonId" TEXT,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- pdf, doc, zip, link, template
  "url" TEXT NOT NULL,
  "fileSize" INTEGER,
  "downloadCount" INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_course_resources_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_course_resources_lesson"
    FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id")
    ON DELETE CASCADE
);

-- ===== COURSE ENROLLMENTS =====

CREATE TABLE IF NOT EXISTS "course_enrollments" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "status" TEXT DEFAULT 'active', -- active, completed, dropped, suspended
  
  -- Progress
  "progress" DECIMAL(5,2) DEFAULT 0, -- percentage
  "completedLessons" INTEGER DEFAULT 0,
  "totalLessons" INTEGER DEFAULT 0,
  "currentLessonId" TEXT,
  
  -- Time tracking
  "totalWatchTime" INTEGER DEFAULT 0, -- minutes
  "lastAccessedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  
  -- Certificate
  "certificateIssued" BOOLEAN DEFAULT false,
  "certificateIssuedAt" TIMESTAMP,
  "certificateUrl" TEXT,
  
  -- Timestamps
  "enrolledAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_course_enrollments_user"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_course_enrollments_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE,
    
  UNIQUE("userId", "courseId")
);

-- ===== LESSON PROGRESS =====

CREATE TABLE IF NOT EXISTS "lesson_progress" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "enrollmentId" TEXT NOT NULL,
  
  -- Progress
  "status" TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  "progress" DECIMAL(5,2) DEFAULT 0, -- percentage
  "watchTime" INTEGER DEFAULT 0, -- seconds
  "lastPosition" INTEGER DEFAULT 0, -- seconds for video
  
  -- Completion
  "completed" BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP,
  
  -- Interaction
  "notes" TEXT,
  "bookmarked" BOOLEAN DEFAULT false,
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastAccessedAt" TIMESTAMP,
  
  CONSTRAINT "fk_lesson_progress_user"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_lesson_progress_lesson"
    FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_lesson_progress_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_lesson_progress_enrollment"
    FOREIGN KEY ("enrollmentId") REFERENCES "course_enrollments"("id")
    ON DELETE CASCADE,
    
  UNIQUE("userId", "lessonId")
);

-- ===== COURSE REVIEWS =====

CREATE TABLE IF NOT EXISTS "course_reviews" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" TEXT,
  "helpful" INTEGER DEFAULT 0,
  "verified" BOOLEAN DEFAULT false, -- completed course
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_course_reviews_user"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_course_reviews_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE,
    
  UNIQUE("userId", "courseId")
);

-- ===== COURSE QUIZZES =====

CREATE TABLE IF NOT EXISTS "course_quizzes" (
  "id" TEXT PRIMARY KEY,
  "lessonId" TEXT,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "passingScore" INTEGER DEFAULT 70, -- percentage
  "timeLimit" INTEGER, -- minutes
  "maxAttempts" INTEGER, -- null = unlimited
  "showAnswers" BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_course_quizzes_lesson"
    FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_course_quizzes_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE
);

-- ===== QUIZ QUESTIONS =====

CREATE TABLE IF NOT EXISTS "quiz_questions" (
  "id" TEXT PRIMARY KEY,
  "quizId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- multiple_choice, true_false, short_answer, essay
  "options" JSONB, -- ["Option A", "Option B", "Option C", "Option D"]
  "correctAnswer" TEXT, -- "0" for first option, "1" for second, etc.
  "explanation" TEXT,
  "points" INTEGER DEFAULT 1,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_quiz_questions_quiz"
    FOREIGN KEY ("quizId") REFERENCES "course_quizzes"("id")
    ON DELETE CASCADE
);

-- ===== QUIZ ATTEMPTS =====

CREATE TABLE IF NOT EXISTS "quiz_attempts" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "score" DECIMAL(5,2),
  "passed" BOOLEAN DEFAULT false,
  "answers" JSONB, -- {"questionId": "answer"}
  "timeSpent" INTEGER, -- seconds
  "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  
  CONSTRAINT "fk_quiz_attempts_user"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_quiz_attempts_quiz"
    FOREIGN KEY ("quizId") REFERENCES "course_quizzes"("id")
    ON DELETE CASCADE
);

-- ===== COURSE NOTES =====

CREATE TABLE IF NOT EXISTS "course_notes" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "lessonId" TEXT,
  "content" TEXT NOT NULL,
  "timestamp" INTEGER, -- video timestamp if applicable
  "isPublic" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_course_notes_user"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_course_notes_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_course_notes_lesson"
    FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id")
    ON DELETE SET NULL
);

-- ===== INDEXES FOR PERFORMANCE =====

CREATE INDEX IF NOT EXISTS "idx_courses_status" ON "courses"("status");
CREATE INDEX IF NOT EXISTS "idx_courses_category" ON "courses"("category");
CREATE INDEX IF NOT EXISTS "idx_courses_featured" ON "courses"("featured");
CREATE INDEX IF NOT EXISTS "idx_courses_author" ON "courses"("authorId");
CREATE INDEX IF NOT EXISTS "idx_courses_slug" ON "courses"("slug");

CREATE INDEX IF NOT EXISTS "idx_course_sections_course" ON "course_sections"("courseId");
CREATE INDEX IF NOT EXISTS "idx_course_sections_order" ON "course_sections"("order");

CREATE INDEX IF NOT EXISTS "idx_course_lessons_section" ON "course_lessons"("sectionId");
CREATE INDEX IF NOT EXISTS "idx_course_lessons_course" ON "course_lessons"("courseId");
CREATE INDEX IF NOT EXISTS "idx_course_lessons_type" ON "course_lessons"("type");

CREATE INDEX IF NOT EXISTS "idx_course_enrollments_user" ON "course_enrollments"("userId");
CREATE INDEX IF NOT EXISTS "idx_course_enrollments_course" ON "course_enrollments"("courseId");
CREATE INDEX IF NOT EXISTS "idx_course_enrollments_status" ON "course_enrollments"("status");

CREATE INDEX IF NOT EXISTS "idx_lesson_progress_user" ON "lesson_progress"("userId");
CREATE INDEX IF NOT EXISTS "idx_lesson_progress_lesson" ON "lesson_progress"("lessonId");
CREATE INDEX IF NOT EXISTS "idx_lesson_progress_enrollment" ON "lesson_progress"("enrollmentId");

CREATE INDEX IF NOT EXISTS "idx_course_reviews_course" ON "course_reviews"("courseId");
CREATE INDEX IF NOT EXISTS "idx_course_reviews_user" ON "course_reviews"("userId");

CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_user" ON "quiz_attempts"("userId");
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_quiz" ON "quiz_attempts"("quizId");

CREATE INDEX IF NOT EXISTS "idx_course_notes_user" ON "course_notes"("userId");
CREATE INDEX IF NOT EXISTS "idx_course_notes_course" ON "course_notes"("courseId");
