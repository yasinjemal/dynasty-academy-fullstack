import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findBadQuiz() {
  console.log(
    "🔍 Looking for the newest quiz that might have wrong questions...\n"
  );

  // Get the most recently generated quizzes from ai_generated_content
  const recentQuizzes = await prisma.$queryRawUnsafe(`
    SELECT id, source_type, source_id, source_title, generated_data, created_at
    FROM ai_generated_content
    WHERE content_type = 'quiz'
    ORDER BY created_at DESC
    LIMIT 5
  `);

  console.log(`Last 5 generated quizzes:\n`);

  for (const quiz of recentQuizzes) {
    const data =
      typeof quiz.generated_data === "string"
        ? JSON.parse(quiz.generated_data)
        : quiz.generated_data;

    const questions = data.quiz?.questions || data.questions || [];
    const firstQ = questions[0];

    console.log(`\n📝 "${data.quiz?.title || data.title}"`);
    console.log(`   Created: ${new Date(quiz.created_at).toLocaleString()}`);
    console.log(`   Source: ${quiz.source_type} - ${quiz.source_id}`);

    if (firstQ) {
      console.log(
        `   First Question: "${firstQ.question.substring(0, 80)}..."`
      );
      if (firstQ.options) {
        console.log(
          `   Options: ${JSON.stringify(firstQ.options).substring(0, 100)}...`
        );
      }
    }
  }

  await prisma.$disconnect();
}

findBadQuiz();
