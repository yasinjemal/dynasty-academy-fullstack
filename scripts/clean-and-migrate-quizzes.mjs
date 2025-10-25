import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

async function cleanAndMigrate() {
  try {
    console.log("🧹 Cleaning incomplete quizzes...\n");

    // Delete all existing quizzes (this will cascade delete questions too)
    const deleted = await prisma.course_quizzes.deleteMany({});
    console.log(`   Deleted ${deleted.count} existing quizzes\n`);

    console.log("🎯 Starting fresh migration...\n");

    // Get all quiz records from ai_generated_content
    const quizRecords = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        source_type,
        source_id,
        generated_data,
        created_at
      FROM ai_generated_content
      WHERE content_type = 'quiz'
      ORDER BY created_at ASC
    `);

    console.log(`Found ${quizRecords.length} quiz records\n`);

    // Get all lessons
    const lessons = await prisma.course_lessons.findMany({
      select: {
        id: true,
        title: true,
        courseId: true,
      },
    });

    let migrated = 0;
    let skipped = 0;

    // Track which quizzes we've already created (by title + lesson to avoid duplicates)
    const created = new Set();

    for (const record of quizRecords) {
      try {
        const quizData =
          typeof record.generated_data === "string"
            ? JSON.parse(record.generated_data)
            : record.generated_data;

        const quizTitle =
          quizData.quiz?.title || quizData.title || "Unknown Quiz";

        // Try to match quiz title to lesson title
        const matchedLesson = lessons.find((lesson) => {
          const quizTitleLower = quizTitle.toLowerCase();
          const lessonTitleLower = lesson.title.toLowerCase();

          // Check if quiz title contains lesson title or vice versa
          return (
            quizTitleLower.includes(lessonTitleLower) ||
            lessonTitleLower.includes(quizTitleLower)
          );
        });

        if (matchedLesson) {
          // Create a unique key for this quiz
          const quizKey = `${matchedLesson.id}-${quizTitle}`;

          if (created.has(quizKey)) {
            skipped++;
            continue;
          }

          created.add(quizKey);

          console.log(`✅ Creating: "${quizTitle}"`);
          console.log(`   Lesson: "${matchedLesson.title}"`);

          // Create the quiz
          const quiz = await prisma.course_quizzes.create({
            data: {
              id: createId(),
              courseId: matchedLesson.courseId,
              lessonId: matchedLesson.id,
              title: quizTitle,
              description:
                quizData.quiz?.description || quizData.description || "",
              passingScore: 70,
              timeLimit: 0,
              maxAttempts: 0,
              showAnswers: true,
              order: 0,
            },
          });

          // Create questions
          const questions =
            quizData.quiz?.questions || quizData.questions || [];

          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            // Convert correctAnswer to string
            let correctAnswer = q.correctAnswer || q.answer || "";
            if (typeof correctAnswer === "number") {
              correctAnswer = String(correctAnswer);
            } else if (typeof correctAnswer === "boolean") {
              correctAnswer = correctAnswer ? "true" : "false";
            }

            await prisma.quiz_questions.create({
              data: {
                id: createId(),
                quizId: quiz.id,
                question: q.question,
                type: q.type || "multiple-choice",
                options: q.options || [],
                correctAnswer,
                explanation: q.explanation || "",
                points: q.points || 1,
                order: i,
              },
            });
          }

          console.log(`   ✅ Created with ${questions.length} questions!\n`);
          migrated++;
        } else {
          console.log(`⚠️  No match: "${quizTitle}"\n`);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Error:`, error.message, "\n");
        skipped++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Migrated: ${migrated} quizzes`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log("\n✨ Migration complete!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndMigrate();
