import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log("🚀 Adding course progression columns...\n");

    // Add columns to lesson_progress
    await prisma.$executeRawUnsafe(`
      ALTER TABLE lesson_progress 
      ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS quiz_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_quiz_score INTEGER,
      ADD COLUMN IF NOT EXISTS can_proceed BOOLEAN DEFAULT FALSE;
    `);
    console.log("✅ lesson_progress columns added");

    // Add columns to course_lessons
    await prisma.$executeRawUnsafe(`
      ALTER TABLE course_lessons 
      ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS requires_quiz BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS prerequisite_lesson_id TEXT;
    `);
    console.log("✅ course_lessons columns added");

    // Unlock first lesson of each course
    await prisma.$executeRawUnsafe(`
      UPDATE course_lessons 
      SET is_locked = FALSE 
      WHERE "order" = 0;
    `);
    console.log("✅ First lessons unlocked");

    // Add columns to quiz_attempts
    await prisma.$executeRawUnsafe(`
      ALTER TABLE quiz_attempts 
      ADD COLUMN IF NOT EXISTS lesson_id TEXT,
      ADD COLUMN IF NOT EXISTS course_id TEXT,
      ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;
    `);
    console.log("✅ quiz_attempts columns added");

    // Add indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_lesson ON quiz_attempts(user_id, lesson_id);
    `);
    console.log("✅ Indexes created");

    console.log("\n🎉 Migration completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Update quiz submit endpoint to save attempts");
    console.log("2. Add lesson unlock validation");
    console.log("3. Update frontend navigation");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
