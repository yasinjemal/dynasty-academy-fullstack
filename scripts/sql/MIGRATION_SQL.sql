-- ============================================
-- COURSE PROGRESSION SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add columns to lesson_progress table
ALTER TABLE lesson_progress 
ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS quiz_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_quiz_score INTEGER,
ADD COLUMN IF NOT EXISTS can_proceed BOOLEAN DEFAULT FALSE;

-- 2. Add columns to course_lessons table
ALTER TABLE course_lessons 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS requires_quiz BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS prerequisite_lesson_id TEXT;

-- 3. Unlock the first lesson of each course (order = 0)
UPDATE course_lessons 
SET is_locked = FALSE 
WHERE "order" = 0;

-- 4. Add columns to quiz_attempts table
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS lesson_id TEXT,
ADD COLUMN IF NOT EXISTS course_id TEXT,
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_lesson ON quiz_attempts("userId", lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_quiz_passed ON lesson_progress(quiz_passed);
CREATE INDEX IF NOT EXISTS idx_course_lessons_locked ON course_lessons(is_locked);

-- 6. Add comments for documentation
COMMENT ON COLUMN lesson_progress.quiz_passed IS 'Whether user passed the quiz for this lesson';
COMMENT ON COLUMN lesson_progress.quiz_attempts IS 'Number of quiz attempts for this lesson';
COMMENT ON COLUMN lesson_progress.last_quiz_score IS 'Most recent quiz score (0-100)';
COMMENT ON COLUMN lesson_progress.can_proceed IS 'Whether user can proceed to next lesson';
COMMENT ON COLUMN course_lessons.is_locked IS 'Whether lesson is locked until prerequisites met';
COMMENT ON COLUMN course_lessons.requires_quiz IS 'Whether quiz must be passed to complete lesson';
COMMENT ON COLUMN course_lessons.prerequisite_lesson_id IS 'Lesson ID that must be completed first';
COMMENT ON COLUMN quiz_attempts.lesson_id IS 'Lesson this quiz attempt is for';
COMMENT ON COLUMN quiz_attempts.course_id IS 'Course this quiz attempt is for';
COMMENT ON COLUMN quiz_attempts.attempt_number IS 'Which attempt number (1st, 2nd, etc.)';

-- 7. Verify the changes
SELECT 'lesson_progress columns added' AS status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
AND column_name IN ('quiz_passed', 'quiz_attempts', 'last_quiz_score', 'can_proceed');

SELECT 'course_lessons columns added' AS status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'course_lessons' 
AND column_name IN ('is_locked', 'requires_quiz', 'prerequisite_lesson_id');

SELECT 'quiz_attempts columns added' AS status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
AND column_name IN ('lesson_id', 'course_id', 'attempt_number');

SELECT 'First lessons unlocked' AS status;
SELECT id, title, "order", is_locked 
FROM course_lessons 
WHERE "order" = 0;

-- Done! 🎉
