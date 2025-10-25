import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugQuizAnswers() {
  console.log('🔍 Debugging Quiz Answer Format...\n');
  
  // Get Elizabethan Era quiz
  const quiz = await prisma.course_quizzes.findFirst({
    where: {
      title: {
        contains: 'Elizabethan Era'
      }
    },
    include: {
      quiz_questions: {
        orderBy: { order: 'asc' }
      }
    }
  });
  
  if (!quiz) {
    console.log('❌ Quiz not found');
    await prisma.$disconnect();
    return;
  }
  
  console.log(`📝 Quiz: ${quiz.title}\n`);
  
  quiz.quiz_questions.forEach((q, index) => {
    console.log(`\nQuestion ${index + 1}:`);
    console.log(`ID: ${q.id}`);
    console.log(`Question: ${q.question.substring(0, 60)}...`);
    console.log(`Type: ${q.type}`);
    console.log(`Options: ${JSON.stringify(q.options)}`);
    console.log(`Correct Answer: "${q.correctAnswer}" (type: ${typeof q.correctAnswer})`);
    
    // Show what the frontend will send
    if (q.type === 'multiple_choice') {
      const options = q.options as string[];
      options.forEach((opt, i) => {
        const letter = String.fromCharCode(97 + i); // a, b, c, d
        console.log(`  ${letter}) ${opt} ${i === parseInt(q.correctAnswer) ? '✓ CORRECT' : ''}`);
      });
      console.log(`Frontend will send: "${String.fromCharCode(97 + parseInt(q.correctAnswer))}"`);
      console.log(`Database expects: "${q.correctAnswer}"`);
    }
  });
  
  await prisma.$disconnect();
}

debugQuizAnswers();
