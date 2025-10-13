import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookId } = await params;

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const views = book.viewCount || 0;
    const sales = book.salesCount || 0;
    const rating = book.rating || 0;
    const reviews = book._count.reviews;
    const price = book.salePrice || book.price;
    const revenue = price * sales;
    const conversionRate = views > 0 ? (sales / views) * 100 : 0;

    return NextResponse.json({
      views,
      sales,
      rating,
      reviews,
      revenue: parseFloat(revenue.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
