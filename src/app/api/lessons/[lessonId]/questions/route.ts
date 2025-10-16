import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// GET /api/lessons/[lessonId]/questions - Fetch all questions for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    // TODO: Replace with actual Prisma query
    // const questions = await prisma.lessonQuestion.findMany({
    //   where: {
    //     lessonId: params.lessonId,
    //     ...(filter === 'resolved' && { isResolved: true }),
    //     ...(filter === 'unresolved' && { isResolved: false }),
    //   },
    //   include: {
    //     user: { select: { name: true, image: true } },
    //     answers: { select: { id: true } },
    //     votes: { where: { userId: session.user.id } }
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });

    // Mock data
    const mockQuestions = [
      {
        id: "q1",
        title: "How does useState work with objects?",
        content:
          "I'm trying to update a nested object in state but it's not re-rendering. What's the correct way to do this?",
        userId: "user1",
        user: {
          name: "Sarah Johnson",
          image: null,
        },
        upvotes: 5,
        answerCount: 3,
        isResolved: true,
        hasUpvoted: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "q2",
        title: "What's the difference between useEffect and useLayoutEffect?",
        content:
          "I've seen both used for side effects. When should I choose one over the other?",
        userId: "user2",
        user: {
          name: "Mike Chen",
          image: null,
        },
        upvotes: 8,
        answerCount: 5,
        isResolved: true,
        hasUpvoted: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "q3",
        title: "Custom hooks best practices?",
        content:
          "What are some best practices when creating reusable custom hooks? Any patterns to follow?",
        userId: "user3",
        user: {
          name: "Alex Rivera",
          image: null,
        },
        upvotes: 3,
        answerCount: 1,
        isResolved: false,
        hasUpvoted: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Apply filter
    const filteredQuestions =
      filter === "all"
        ? mockQuestions
        : mockQuestions.filter((q) =>
            filter === "resolved" ? q.isResolved : !q.isResolved
          );

    return NextResponse.json({
      questions: filteredQuestions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/lessons/[lessonId]/questions - Create a new question
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Prisma query
    // const question = await prisma.lessonQuestion.create({
    //   data: {
    //     lessonId: params.lessonId,
    //     userId: session.user.id,
    //     title,
    //     content,
    //   },
    //   include: {
    //     user: { select: { name: true, image: true } },
    //   }
    // });

    // Mock response
    const mockQuestion = {
      id: `q${Date.now()}`,
      title,
      content,
      userId: session.user.id,
      user: {
        name: session.user.name || "Anonymous",
        image: session.user.image || null,
      },
      upvotes: 0,
      answerCount: 0,
      isResolved: false,
      hasUpvoted: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      question: mockQuestion,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
