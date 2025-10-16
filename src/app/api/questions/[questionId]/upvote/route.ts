import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// POST /api/questions/[questionId]/upvote - Toggle upvote on a question
export async function POST(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with actual Prisma query
    // const existingVote = await prisma.questionVote.findUnique({
    //   where: {
    //     questionId_userId: {
    //       questionId: params.questionId,
    //       userId: session.user.id,
    //     }
    //   }
    // });

    // if (existingVote) {
    //   // Remove vote
    //   await prisma.questionVote.delete({
    //     where: { id: existingVote.id }
    //   });
    //   await prisma.lessonQuestion.update({
    //     where: { id: params.questionId },
    //     data: { upvotes: { decrement: 1 } }
    //   });
    //   return NextResponse.json({ action: 'removed', upvoted: false });
    // } else {
    //   // Add vote
    //   await prisma.questionVote.create({
    //     data: {
    //       questionId: params.questionId,
    //       userId: session.user.id,
    //     }
    //   });
    //   await prisma.lessonQuestion.update({
    //     where: { id: params.questionId },
    //     data: { upvotes: { increment: 1 } }
    //   });
    //   return NextResponse.json({ action: 'added', upvoted: true });
    // }

    // Mock response
    return NextResponse.json({
      action: "added",
      upvoted: true,
    });
  } catch (error) {
    console.error("Error toggling vote:", error);
    return NextResponse.json(
      { error: "Failed to toggle vote" },
      { status: 500 }
    );
  }
}
