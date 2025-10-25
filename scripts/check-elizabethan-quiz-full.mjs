import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkElizabethanQuiz() {
  console.log("🔍 Checking Elizabethan Era Overview Quiz in detail...\n");

  const quiz = await prisma.course_quizzes.findFirst({
    where: {
      course_lessons: {
        title: {
          contains: "Elizabethan Era Overview",
        },
      },
    },
    include: {
      quiz_questions: {
        orderBy: { order: "asc" },
      },
      course_lessons: true,
    },
  });

  if (!quiz) {
    console.log("❌ Quiz not found!");
    await prisma.$disconnect();
    return;
  }

  console.log(`📝 Quiz: ${quiz.title}`);
  console.log(`📚 Lesson: ${quiz.course_lessons?.title}`);
  console.log(`🆔 Quiz ID: ${quiz.id}`);
  console.log(`📊 Total Questions: ${quiz.quiz_questions.length}\n`);

  quiz.quiz_questions.forEach((q, index) => {
    console.log(`\nQuestion ${index + 1}:`);
    console.log(`Question: ${q.question}`);
    console.log(`Type: ${q.type}`);
    console.log(`Options: ${JSON.stringify(q.options)}`);
    console.log(`Correct Answer: ${q.correctAnswer}`);
    console.log(`Explanation: ${q.explanation?.substring(0, 100)}...`);
  });

  await prisma.$disconnect();
}

checkElizabethanQuiz();
