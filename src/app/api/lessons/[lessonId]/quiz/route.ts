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

    // Fetch quiz with questions (mock data for now - replace with actual DB query)
    const quiz = {
      id: `quiz-${lessonId}`,
      lessonId,
      title: "Lesson Quiz",
      description: "Test your understanding of this lesson",
      passingScore: 80,
      timeLimit: 15, // minutes
      maxAttempts: 3,
      questions: [
        {
          id: "q1",
          question: "What is the main topic covered in this lesson?",
          type: "MULTIPLE_CHOICE",
          options: [
            { id: "a", text: "Introduction to React hooks" },
            { id: "b", text: "Advanced TypeScript patterns" },
            { id: "c", text: "Database design principles" },
            { id: "d", text: "API development best practices" },
          ],
          correctAnswer: "a",
          explanation: "This lesson focuses on React hooks and their usage.",
          points: 1,
        },
        {
          id: "q2",
          question: "useState is a React hook.",
          type: "TRUE_FALSE",
          options: [
            { id: "True", text: "True" },
            { id: "False", text: "False" },
          ],
          correctAnswer: "True",
          explanation:
            "useState is indeed a built-in React hook for managing state.",
          points: 1,
        },
        {
          id: "q3",
          question: "Which hook is used for side effects?",
          type: "MULTIPLE_CHOICE",
          options: [
            { id: "a", text: "useState" },
            { id: "b", text: "useEffect" },
            { id: "c", text: "useContext" },
            { id: "d", text: "useReducer" },
          ],
          correctAnswer: "b",
          explanation:
            "useEffect is the hook specifically designed for handling side effects.",
          points: 1,
        },
        {
          id: "q4",
          question: "Hooks can be used in class components.",
          type: "TRUE_FALSE",
          options: [
            { id: "True", text: "True" },
            { id: "False", text: "False" },
          ],
          correctAnswer: "False",
          explanation:
            "Hooks can only be used in functional components, not class components.",
          points: 1,
        },
        {
          id: "q5",
          question: "What does the dependency array in useEffect do?",
          type: "MULTIPLE_CHOICE",
          options: [
            { id: "a", text: "Defines when the effect should run" },
            { id: "b", text: "Stores component state" },
            { id: "c", text: "Prevents re-renders" },
            { id: "d", text: "Manages async operations" },
          ],
          correctAnswer: "a",
          explanation:
            "The dependency array determines when useEffect should re-run based on changes to those dependencies.",
          points: 1,
        },
      ],
    };

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Quiz fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}
