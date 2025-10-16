import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// POST /api/answers/[answerId]/upvote - Toggle upvote on an answer
export async function POST(
  request: NextRequest,
  { params }: { params: { answerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with actual Prisma query
    // const existingVote = await prisma.answerVote.findUnique({
    //   where: {
    //     answerId_userId: {
    //       answerId: params.answerId,
    //       userId: session.user.id,
    //     }
    //   }
    // });

    // if (existingVote) {
    //   // Remove vote
    //   await prisma.answerVote.delete({
    //     where: { id: existingVote.id }
    //   });
    //   await prisma.lessonAnswer.update({
    //     where: { id: params.answerId },
    //     data: { upvotes: { decrement: 1 } }
    //   });
    //   return NextResponse.json({ action: 'removed', upvoted: false });
    // } else {
    //   // Add vote
    //   await prisma.answerVote.create({
    //     data: {
    //       answerId: params.answerId,
    //       userId: session.user.id,
    //     }
    //   });
    //   await prisma.lessonAnswer.update({
    //     where: { id: params.answerId },
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
