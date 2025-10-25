import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

async function matchQuizzesToLessons() {
  console.log("🎯 Matching quizzes to actual lessons...\n");

  // Get all quizzes
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

  console.log("📝 Available Lessons:");
  lessons.forEach((lesson, index) => {
    console.log(`${index + 1}. ${lesson.title} (ID: ${lesson.id})`);
  });

  console.log("\n🎯 Quiz to Lesson Matching:\n");

  let migrated = 0;
  let skipped = 0;

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
        console.log(`\n✅ Match found!`);
        console.log(`   Quiz: "${quizTitle}"`);
        console.log(`   Lesson: "${matchedLesson.title}"`);
        console.log(`   Creating course_quizzes record...`);

        // Check if quiz already exists
        const existing = await prisma.course_quizzes.findFirst({
          where: {
            courseId: matchedLesson.courseId,
            lessonId: matchedLesson.id,
            title: quizTitle,
          },
        });

        if (existing) {
          console.log(`   ⏭️  Already exists, skipping`);
          skipped++;
          continue;
        }

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
        const questions = quizData.quiz?.questions || quizData.questions || [];
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

        console.log(`   ✅ Created with ${questions.length} questions!`);
        migrated++;
      } else {
        console.log(`\n⚠️  No match: "${quizTitle}"`);
        skipped++;
      }
    } catch (error) {
      console.error(`\n❌ Error:`, error.message);
      skipped++;
    }
  }

  console.log("\n\n📊 Final Summary:");
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);

  await prisma.$disconnect();
}

matchQuizzesToLessons();
