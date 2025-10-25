import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAllQuizzes() {
  console.log("🔍 Checking ALL quizzes in the database...\n");

  const quizzes = await prisma.course_quizzes.findMany({
    include: {
      quiz_questions: {
        orderBy: { order: "asc" },
        take: 1, // Just get first question
      },
      course_lessons: {
        select: { title: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(`Found ${quizzes.length} total quizzes:\n`);

  for (const quiz of quizzes) {
    console.log(`\n📝 "${quiz.title}"`);
    console.log(`   Lesson: ${quiz.course_lessons?.title || "N/A"}`);
    console.log(
      `   Total Questions: ${quiz.quiz_questions.length > 0 ? "5+" : "0"}`
    );

    if (quiz.quiz_questions.length > 0) {
      const q = quiz.quiz_questions[0];
      console.log(`   First Question: "${q.question.substring(0, 80)}..."`);
      if (q.options && q.options.length > 0) {
        console.log(`   Options: ${JSON.stringify(q.options)}`);
      }
    }
  }

  await prisma.$disconnect();
}

checkAllQuizzes();
