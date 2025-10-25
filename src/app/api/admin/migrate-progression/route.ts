import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/admin/migrate-progression
 * Run database migration for course progression system
 * ADMIN ONLY
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

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
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_lesson ON quiz_attempts(user_id, lesson_id);
    `);
    console.log("✅ Indexes created");

    return NextResponse.json({
      success: true,
      message: "Course progression migration completed successfully",
      changes: [
        "Added quiz_passed, quiz_attempts, last_quiz_score, can_proceed to lesson_progress",
        "Added is_locked, requires_quiz, prerequisite_lesson_id to course_lessons",
        "Added lesson_id, course_id, attempt_number to quiz_attempts",
        "Created indexes for quiz_attempts",
        "Unlocked first lesson of each course",
      ],
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
