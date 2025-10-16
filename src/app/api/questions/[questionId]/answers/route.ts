import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// GET /api/questions/[questionId]/answers - Fetch all answers for a question
export async function GET(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with actual Prisma query
    // const answers = await prisma.lessonAnswer.findMany({
    //   where: {
    //     questionId: params.questionId,
    //   },
    //   include: {
    //     user: { select: { name: true, image: true } },
    //     votes: { where: { userId: session.user.id } }
    //   },
    //   orderBy: [
    //     { isBestAnswer: 'desc' },
    //     { isInstructorAnswer: 'desc' },
    //     { upvotes: 'desc' }
    //   ]
    // });

    // Mock data
    const mockAnswers = [
      {
        id: "a1",
        content:
          "You need to create a new object when updating state. Use the spread operator: setState({...state, nested: {...state.nested, prop: newValue}}). This ensures React detects the change.",
        userId: "instructor1",
        user: {
          name: "Dr. Emma Wilson",
          image: null,
        },
        upvotes: 12,
        isInstructorAnswer: true,
        isBestAnswer: true,
        hasUpvoted: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "a2",
        content:
          "I had the same issue! Another approach is to use useReducer for complex state updates. It's cleaner and less error-prone.",
        userId: "user4",
        user: {
          name: "James Parker",
          image: null,
        },
        upvotes: 5,
        isInstructorAnswer: false,
        isBestAnswer: false,
        hasUpvoted: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "a3",
        content:
          "Also consider using a state management library like Zustand or Redux if you have deeply nested state. It simplifies updates significantly.",
        userId: "user5",
        user: {
          name: "Lisa Anderson",
          image: null,
        },
        upvotes: 3,
        isInstructorAnswer: false,
        isBestAnswer: false,
        hasUpvoted: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({
      answers: mockAnswers,
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}

// POST /api/questions/[questionId]/answers - Post an answer
export async function POST(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // TODO: Check if user is instructor for the course
    // const isInstructor = await checkIfInstructor(session.user.id, courseId);

    // TODO: Replace with actual Prisma query
    // const answer = await prisma.lessonAnswer.create({
    //   data: {
    //     questionId: params.questionId,
    //     userId: session.user.id,
    //     content,
    //     isInstructorAnswer: isInstructor,
    //   },
    //   include: {
    //     user: { select: { name: true, image: true } },
    //   }
    // });

    // Mock response
    const mockAnswer = {
      id: `a${Date.now()}`,
      content,
      userId: session.user.id,
      user: {
        name: session.user.name || "Anonymous",
        image: session.user.image || null,
      },
      upvotes: 0,
      isInstructorAnswer: false, // TODO: Check actual instructor status
      isBestAnswer: false,
      hasUpvoted: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      answer: mockAnswer,
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Failed to create answer" },
      { status: 500 }
    );
  }
}
