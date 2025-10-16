import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// POST /api/reviews/[reviewId]/helpful - Toggle helpful vote on review
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with actual Prisma query
    // const existingVote = await prisma.reviewHelpfulVote.findUnique({
    //   where: {
    //     reviewId_userId: {
    //       reviewId: params.reviewId,
    //       userId: session.user.id,
    //     }
    //   }
    // });

    // if (existingVote) {
    //   // Remove vote
    //   await prisma.reviewHelpfulVote.delete({
    //     where: { id: existingVote.id }
    //   });
    //   await prisma.courseReview.update({
    //     where: { id: params.reviewId },
    //     data: { helpfulVotes: { decrement: 1 } }
    //   });
    //   return NextResponse.json({ action: 'removed', helpful: false });
    // } else {
    //   // Add vote
    //   await prisma.reviewHelpfulVote.create({
    //     data: {
    //       reviewId: params.reviewId,
    //       userId: session.user.id,
    //     }
    //   });
    //   await prisma.courseReview.update({
    //     where: { id: params.reviewId },
    //     data: { helpfulVotes: { increment: 1 } }
    //   });
    //   return NextResponse.json({ action: 'added', helpful: true });
    // }

    // Mock response
    return NextResponse.json({
      action: "added",
      helpful: true,
    });
  } catch (error) {
    console.error("Error toggling helpful vote:", error);
    return NextResponse.json(
      { error: "Failed to toggle vote" },
      { status: 500 }
    );
  }
}
