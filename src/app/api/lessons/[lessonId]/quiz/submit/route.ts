import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { nanoid } from "nanoid";

/**
 * POST /api/lessons/[lessonId]/quiz/submit
 * Submit quiz answers and calculate score
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId } = await params;
    const body = await request.json();
    const { answers, timeSpent = 0 } = body;

    // Fetch the actual quiz from database
    const quiz = await prisma.course_quizzes.findFirst({
      where: {
        lessonId: lessonId,
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
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get current attempt count for this user and lesson
    const previousAttempts = await prisma.quiz_attempts.count({
      where: {
        userId: session.user.id,
        quizId: quiz.id,
      },
    });

    const attemptNumber = previousAttempts + 1;

    // Check max attempts limit
    if (quiz.maxAttempts && attemptNumber > quiz.maxAttempts) {
      return NextResponse.json(
        {
          error: `Maximum attempts (${quiz.maxAttempts}) exceeded`,
          maxAttempts: quiz.maxAttempts,
          currentAttempt: previousAttempts,
        },
        { status: 400 }
      );
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;

    quiz.quiz_questions.forEach((question) => {
      totalPoints += question.points || 1;

      // Get user's answer for this question
      const userAnswer = answers[question.id];

      // Compare answers (handle different formats)
      if (userAnswer === question.correctAnswer) {
        correctAnswers += question.points || 1;
      } else if (
        // Handle case where correctAnswer is stored as number but user sends string
        String(userAnswer) === String(question.correctAnswer)
      ) {
        correctAnswers += question.points || 1;
      }
    });

    const score =
      totalPoints > 0 ? Math.round((correctAnswers / totalPoints) * 100) : 0;
    const passed = score >= (quiz.passingScore || 70);

    // Save quiz attempt to database using raw SQL
    const attemptId = nanoid();
    await prisma.$executeRaw`
      INSERT INTO quiz_attempts (
        id, "userId", "quizId", lesson_id, course_id, 
        score, passed, answers, attempt_number, "timeSpent", "completedAt"
      ) VALUES (
        ${attemptId}, ${session.user.id}, ${quiz.id}, ${lessonId}, ${
      quiz.courseId
    },
        ${score}, ${passed}, ${JSON.stringify(
      answers
    )}::jsonb, ${attemptNumber}, 
        ${timeSpent}, NOW()
      )
    `;

    // Get or create lesson progress
    const enrollment = await prisma.course_enrollments.findFirst({
      where: {
        userId: session.user.id,
        courseId: quiz.courseId,
      },
    });

    if (enrollment) {
      // Update lesson progress with quiz results using raw SQL
      const progressId = nanoid();
      await prisma.$executeRaw`
        INSERT INTO lesson_progress (
          id, "userId", "lessonId", "courseId", "enrollmentId",
          quiz_passed, quiz_attempts, last_quiz_score, can_proceed,
          progress, status, "createdAt", "updatedAt"
        ) VALUES (
          ${progressId}, ${session.user.id}, ${lessonId}, ${quiz.courseId}, ${
        enrollment.id
      },
          ${passed}, ${attemptNumber}, ${score}, ${passed},
          100, ${passed ? "completed" : "in_progress"}, NOW(), NOW()
        )
        ON CONFLICT ("userId", "lessonId")
        DO UPDATE SET
          quiz_passed = ${passed},
          quiz_attempts = ${attemptNumber},
          last_quiz_score = ${score},
          can_proceed = ${passed},
          "updatedAt" = NOW()
      `;

      // If passed, unlock next lesson
      if (passed) {
        const currentLesson = await prisma.course_lessons.findUnique({
          where: { id: lessonId },
        });

        if (currentLesson) {
          // Find next lesson in sequence
          const nextLesson = await prisma.course_lessons.findFirst({
            where: {
              courseId: quiz.courseId,
              order: currentLesson.order + 1,
            },
          });

          if (nextLesson) {
            // Unlock next lesson
            await prisma.course_lessons.update({
              where: { id: nextLesson.id },
              data: { isLocked: false },
            });
          }

          // Update enrollment progress
          const progressData = await prisma.$queryRaw<any[]>`
            SELECT 
              COUNT(*) FILTER (WHERE l."requiresQuiz" = true AND lp.quiz_passed = true) as "completedLessons",
              COUNT(*) as "totalLessons"
            FROM course_lessons l
            LEFT JOIN lesson_progress lp ON lp."lessonId" = l.id AND lp."userId" = ${session.user.id}
            WHERE l."courseId" = ${quiz.courseId}
          `;

          if (progressData && progressData.length > 0) {
            const { completedLessons, totalLessons } = progressData[0];
            const progress = Math.round(
              (Number(completedLessons) / Number(totalLessons)) * 100
            );

            await prisma.course_enrollments.update({
              where: { id: enrollment.id },
              data: {
                completedLessons: Number(completedLessons),
                progress: progress,
                updatedAt: new Date(),
              },
            });
          }
        }
      }
    }

    // Award Dynasty points for passing
    if (passed) {
      // Intelligence.track({
      //   userId: session.user.id,
      //   activityType: "QUIZ_PASSED",
      //   entityId: lessonId,
      //   sessionDuration: timeSpent,
      //   completed: true,
      // });
    }

    return NextResponse.json({
      success: true,
      score,
      passed,
      correctAnswers,
      totalQuestions: quiz.quiz_questions.length,
      passingScore: quiz.passingScore || 70,
      attemptNumber,
      maxAttempts: quiz.maxAttempts || 0,
      message: passed
        ? "🎉 Congratulations! You passed!"
        : `Keep trying! You scored ${score}%. You need ${
            quiz.passingScore || 70
          }% to pass.`,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
