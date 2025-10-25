import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findWrongQuiz() {
  console.log(
    "🔍 Searching for quizzes with programming-related questions...\n"
  );

  // Get all quiz questions and search for programming keywords
  const allQuestions = await prisma.quiz_questions.findMany({
    include: {
      course_quizzes: {
        include: {
          course_lessons: {
            select: { title: true },
          },
        },
      },
    },
  });

  const programmingKeywords = [
    "react",
    "typescript",
    "database",
    "api",
    "hook",
    "component",
    "javascript",
    "programming",
  ];

  for (const question of allQuestions) {
    const questionText = question.question.toLowerCase();
    const hasProgKeyword = programmingKeywords.some((keyword) =>
      questionText.includes(keyword)
    );

    if (hasProgKeyword && question.course_quizzes) {
      console.log(`\n🚨 FOUND PROGRAMMING QUESTION IN SHAKESPEARE COURSE!`);
      console.log(`\nQuiz: "${question.course_quizzes.title}"`);
      console.log(`Lesson: "${question.course_quizzes.course_lessons?.title}"`);
      console.log(`Quiz ID: ${question.course_quizzes.id}`);
      console.log(`\nQuestion: "${question.question}"`);
      console.log(`Options: ${JSON.stringify(question.options)}`);
      console.log(`\n---`);
    }
  }

  await prisma.$disconnect();
}

findWrongQuiz();
