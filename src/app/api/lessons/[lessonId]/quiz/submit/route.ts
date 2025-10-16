import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

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
    const { answers } = body;

    // Fetch the quiz (same as above - in real app, from database)
    const quiz = {
      id: `quiz-${lessonId}`,
      passingScore: 80,
      questions: [
        { id: "q1", correctAnswer: "a", points: 1 },
        { id: "q2", correctAnswer: "True", points: 1 },
        { id: "q3", correctAnswer: "b", points: 1 },
        { id: "q4", correctAnswer: "False", points: 1 },
        { id: "q5", correctAnswer: "a", points: 1 },
      ],
    };

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;

    quiz.questions.forEach((question) => {
      totalPoints += question.points;
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers += question.points;
      }
    });

    const score = Math.round((correctAnswers / totalPoints) * 100);
    const passed = score >= quiz.passingScore;

    // In real app, save attempt to database
    const attempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      userId: session.user.id,
      score,
      passed,
      answers,
      attemptNumber: 1, // Would get from DB
      timeSpent: 0,
      completedAt: new Date().toISOString(),
    };

    // Award Dynasty points for passing
    if (passed) {
      // Intelligence.track({
      //   userId: session.user.id,
      //   activityType: "QUIZ_PASSED",
      //   entityId: lessonId,
      //   sessionDuration: 0,
      //   completed: true,
      // });
    }

    return NextResponse.json({
      success: true,
      attempt,
      message: passed ? "Congratulations! You passed!" : "Keep trying!",
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
