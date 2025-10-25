import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/lessons/[lessonId]/quiz
 * Fetch quiz for a lesson
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId } = await params;

    // Fetch quiz from database
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
      return NextResponse.json(
        {
          error: "No quiz found for this lesson",
        },
        { status: 404 }
      );
    }

    // Transform database format to frontend format
    const formattedQuiz = {
      id: quiz.id,
      lessonId: quiz.lessonId,
      title: quiz.title,
      description: quiz.description || "Test your understanding of this lesson",
      passingScore: quiz.passingScore || 70,
      timeLimit: quiz.timeLimit || 0, // 0 means no limit
      maxAttempts: quiz.maxAttempts || 0, // 0 means unlimited
      questions: quiz.quiz_questions.map((q) => ({
        id: q.id,
        question: q.question,
        type:
          q.type === "multiple_choice"
            ? "MULTIPLE_CHOICE"
            : q.type === "true_false"
            ? "TRUE_FALSE"
            : q.type === "multiple_select"
            ? "MULTIPLE_SELECT"
            : "MULTIPLE_CHOICE",
        options: ((q.options as string[]) || []).map(
          (opt: string, index: number) => ({
            id: String.fromCharCode(97 + index), // a, b, c, d
            text: opt,
          })
        ),
        // Convert database answer format ("0", "1", "2") to letter format ("a", "b", "c")
        // For true/false, keep as is ("true", "false")
        correctAnswer:
          q.type === "true_false"
            ? q.correctAnswer
            : !isNaN(Number(q.correctAnswer))
            ? String.fromCharCode(97 + Number(q.correctAnswer))
            : q.correctAnswer,
        explanation: q.explanation || "",
        points: q.points || 1,
      })),
    };

    return NextResponse.json({ quiz: formattedQuiz });
  } catch (error) {
    console.error("Quiz fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}
