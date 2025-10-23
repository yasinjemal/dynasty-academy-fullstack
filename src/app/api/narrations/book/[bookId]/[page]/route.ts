import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string; page: string }> }
) {
  try {
    const { bookId, page } = await params;
    const pageNumber = parseInt(page);

    if (!bookId || isNaN(pageNumber)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Fetch narrations for this book and page
    const narrations = await prisma.communityNarration.findMany({
      where: {
        bookId,
        pageNumber,
        status: "APPROVED", // Only show approved narrations
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: [
        { likeCount: "desc" }, // Most liked first
        { playCount: "desc" }, // Then most played
        { qualityScore: "desc" }, // Then highest quality
        { createdAt: "asc" }, // Then earliest
      ],
    });

    return NextResponse.json(narrations);
  } catch (error) {
    console.error("Error fetching narrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
