-- Add course progression columns to lesson_progress
ALTER TABLE lesson_progress 
ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS quiz_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_quiz_score INTEGER,
ADD COLUMN IF NOT EXISTS can_proceed BOOLEAN DEFAULT FALSE;

-- Add lesson lock and requirement columns to course_lessons
ALTER TABLE course_lessons 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS requires_quiz BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS prerequisite_lesson_id TEXT;

-- Unlock first lesson of each course (order = 0)
UPDATE course_lessons 
SET is_locked = FALSE 
WHERE "order" = 0;

-- Create quiz_attempts table to track all quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  time_taken INTEGER, -- seconds
  attempt_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_quiz_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_attempts_lesson FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_attempts_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for quiz_attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course ON quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_lesson ON quiz_attempts(user_id, lesson_id);

-- Add comment
COMMENT ON TABLE quiz_attempts IS 'Tracks all quiz attempts by users for lessons';
COMMENT ON COLUMN lesson_progress.quiz_passed IS 'Whether user passed the quiz for this lesson';
COMMENT ON COLUMN lesson_progress.can_proceed IS 'Whether user can proceed to next lesson';
COMMENT ON COLUMN course_lessons.is_locked IS 'Whether lesson is locked and requires previous completion';
