import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateQuizzes() {
  try {
    console.log("🔄 Migrating existing quizzes to course_quizzes table...\n");

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
      AND source_type IN ('course', 'lesson')
      ORDER BY created_at ASC
    `);

    console.log(`📊 Found ${quizRecords.length} quizzes to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const record of quizRecords) {
      try {
        const quizData = record.generated_data;
        const quizId = `quiz_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Determine courseId and lessonId
        let courseId = "";
        let lessonId = null;

        if (record.source_type === "course") {
          courseId = record.source_id;
        } else if (record.source_type === "lesson") {
          lessonId = record.source_id;
          // Get courseId from lesson
          const lesson = await prisma.course_lessons.findUnique({
            where: { id: lessonId },
            select: { courseId: true },
          });
          if (!lesson) {
            console.log(`   ⚠️  Skipped: Lesson ${lessonId} not found`);
            skipped++;
            continue;
          }
          courseId = lesson.courseId;
        }

        // Check if course exists
        const courseExists = await prisma.courses.findUnique({
          where: { id: courseId },
          select: { id: true },
        });

        if (!courseExists) {
          console.log(`   ⚠️  Skipped: Course ${courseId} not found`);
          skipped++;
          continue;
        }

        // Check if quiz already exists for this course/lesson
        const existingQuiz = await prisma.course_quizzes.findFirst({
          where: {
            courseId: courseId,
            lessonId: lessonId,
            title: quizData.title,
          },
        });

        if (existingQuiz) {
          console.log(
            `   ⏭️  Skipped: Quiz "${quizData.title}" already exists`
          );
          skipped++;
          continue;
        }

        // Create quiz
        await prisma.course_quizzes.create({
          data: {
            id: quizId,
            courseId: courseId,
            lessonId: lessonId,
            title: quizData.title,
            description: quizData.description || "",
            passingScore: 70,
            timeLimit: quizData.timeLimit || null,
            maxAttempts: 3,
            showAnswers: true,
            order: 0,
          },
        });

        // Create questions
        if (quizData.questions && Array.isArray(quizData.questions)) {
          for (let i = 0; i < quizData.questions.length; i++) {
            const question = quizData.questions[i];
            await prisma.quiz_questions.create({
              data: {
                id: `q_${quizId}_${i}`,
                quizId: quizId,
                question: question.question,
                type: question.type,
                options: question.options || null,
                correctAnswer: question.correctAnswer || "",
                explanation: question.explanation || null,
                points: question.points || 1,
                order: i,
              },
            });
          }
        }

        console.log(
          `   ✅ Migrated: "${quizData.title}" (${
            quizData.questions?.length || 0
          } questions)`
        );
        migrated++;
      } catch (error) {
        console.error(`   ❌ Error migrating quiz:`, error.message);
        errors++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log("\n✨ Migration complete!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateQuizzes();
