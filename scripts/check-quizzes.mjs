import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkQuizzes() {
  console.log("🎯 Checking existing course quizzes...\n");

  const quizzes = await prisma.course_quizzes.findMany({
    include: {
      quiz_questions: true,
      course_lessons: {
        select: { title: true },
      },
    },
  });

  console.log(`Found ${quizzes.length} quizzes in course_quizzes table:\n`);

  for (const quiz of quizzes) {
    console.log(`\n✅ ${quiz.title}`);
    console.log(`   Lesson: ${quiz.course_lessons?.title || "N/A"}`);
    console.log(`   Questions: ${quiz.quiz_questions.length}`);

    if (quiz.quiz_questions.length > 0) {
      console.log(
        `   Sample question: "${quiz.quiz_questions[0].question.substring(
          0,
          60
        )}..."`
      );
    }
  }

  await prisma.$disconnect();
}

checkQuizzes();
