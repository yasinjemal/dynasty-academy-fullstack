import { NextRequest, NextResponse } from "next/server";

// GET /api/courses/[id]/reviews/summary - Get rating statistics summary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual Prisma aggregation
    // const stats = await prisma.courseReview.aggregate({
    //   where: { courseId: params.id },
    //   _avg: { rating: true },
    //   _count: { rating: true },
    // });

    // const distribution = await prisma.courseReview.groupBy({
    //   by: ['rating'],
    //   where: { courseId: params.id },
    //   _count: { rating: true },
    // });

    // Mock data
    const mockSummary = {
      averageRating: 4.5,
      totalReviews: 328,
      distribution: {
        5: 189, // 58%
        4: 98, // 30%
        3: 25, // 8%
        2: 11, // 3%
        1: 5, // 1%
      },
      recommendationRate: 88, // percentage who would recommend
    };

    return NextResponse.json(mockSummary);
  } catch (error) {
    console.error("Error fetching review summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch review summary" },
      { status: 500 }
    );
  }
}
