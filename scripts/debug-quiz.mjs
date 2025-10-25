import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkQuizQuestions() {
  console.log("🔍 Checking quiz questions for Elizabethan Era lesson...\n");

  // Find the Elizabethan Era lesson
  const lesson = await prisma.course_lessons.findFirst({
    where: {
      title: {
        contains: "Elizabethan Era",
      },
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!lesson) {
    console.log("❌ Lesson not found");
    await prisma.$disconnect();
    return;
  }

  console.log(`📚 Lesson: ${lesson.title} (${lesson.id})\n`);

  // Get the quiz for this lesson
  const quiz = await prisma.course_quizzes.findFirst({
    where: {
      lessonId: lesson.id,
    },
    include: {
      quiz_questions: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!quiz) {
    console.log("❌ No quiz found for this lesson");
    await prisma.$disconnect();
    return;
  }

  console.log(`📝 Quiz: ${quiz.title}\n`);
  console.log(`Questions (${quiz.quiz_questions.length}):\n`);

  quiz.quiz_questions.forEach((q, index) => {
    console.log(`${index + 1}. ${q.question}`);
    console.log(`   Type: ${q.type}`);
    console.log(`   Options: ${JSON.stringify(q.options)}`);
    console.log(`   Correct Answer: ${q.correctAnswer}`);
    console.log(`   Explanation: ${q.explanation}\n`);
  });

  // Check the original AI generated data
  console.log("\n🔍 Checking original AI generated data...\n");

  const aiQuiz = await prisma.$queryRawUnsafe(`
    SELECT generated_data, created_at
    FROM ai_generated_content
    WHERE content_type = 'quiz'
    AND source_title LIKE '%Elizabethan Era%'
    ORDER BY created_at DESC
    LIMIT 1
  `);

  if (aiQuiz && aiQuiz[0]) {
    const data =
      typeof aiQuiz[0].generated_data === "string"
        ? JSON.parse(aiQuiz[0].generated_data)
        : aiQuiz[0].generated_data;

    console.log("Original AI Quiz Data:");
    console.log(`Title: ${data.quiz?.title || data.title}`);
    console.log(
      `Questions: ${(data.quiz?.questions || data.questions || []).length}`
    );
    console.log("\nFirst question from AI:");
    const firstQ = (data.quiz?.questions || data.questions || [])[0];
    if (firstQ) {
      console.log(`Question: ${firstQ.question}`);
      console.log(`Options: ${JSON.stringify(firstQ.options)}`);
    }
  }

  await prisma.$disconnect();
}

checkQuizQuestions();
