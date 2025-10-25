import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkQuizFormat() {
  const quiz = await prisma.course_quizzes.findFirst({
    where: { lessonId: "yodfuxce85zcki07oz4bnyb2" },
    include: { quiz_questions: true },
  });

  if (!quiz) {
    console.log("❌ No quiz found!");
    return;
  }

  console.log("📝 Quiz:", quiz.title);
  console.log("\n🔍 Answer Format Analysis:\n");

  quiz.quiz_questions.forEach((q, i) => {
    console.log(`Q${i + 1}: ${q.question.substring(0, 60)}...`);
    console.log(`   Options: ${JSON.stringify(q.options)}`);
    console.log(`   ✅ Database stores: "${q.correctAnswer}"`);
    console.log(`   ❌ Frontend sends: "a", "b", "c", or "d"`);
    console.log(`   ⚠️  Mismatch: "${q.correctAnswer}" !== "a/b/c/d"\n`);
  });

  console.log("\n💡 Solution: Convert database answer to letter during fetch!");
  console.log('   If correctAnswer = "2", convert to "c" (97 + 2 = 99 = "c")');

  await prisma.$disconnect();
}

checkQuizFormat().catch(console.error);
