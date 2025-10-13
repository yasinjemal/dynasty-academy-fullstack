import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all books with their stats
    const books = await prisma.book.findMany({
      include: {
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // Calculate analytics
    const totalBooks = books.length;
    const publishedBooks = books.filter((b) => b.publishedAt).length;

    // Revenue calculations (simplified - you can enhance this with actual order data)
    const totalRevenue = books.reduce((sum, book) => {
      const price = book.salePrice || book.price;
      const salesCount = book.salesCount || 0;
      return sum + price * salesCount;
    }, 0);

    // Calculate monthly revenue (last 30 days - simplified)
    const monthlyRevenue = totalRevenue * 0.3; // Placeholder

    // Views
    const totalViews = books.reduce((sum, book) => sum + (book.viewCount || 0), 0);

    // Rating
    const booksWithRatings = books.filter((b) => b.rating && b.rating > 0);
    const averageRating =
      booksWithRatings.length > 0
        ? booksWithRatings.reduce((sum, book) => sum + (book.rating || 0), 0) /
          booksWithRatings.length
        : 0;

    const totalReviews = books.reduce(
      (sum, book) => sum + (book.reviewCount || 0),
      0
    );

    const featuredBooks = books.filter((b) => b.featured).length;

    // Growth calculations (simplified - compare with last period)
    const revenueGrowth = 15.3; // Placeholder
    const viewsGrowth = 23.7; // Placeholder

    // Top performing books
    const topBooks = books
      .sort((a, b) => {
        const revenueA = (a.salePrice || a.price) * (a.salesCount || 0);
        const revenueB = (b.salePrice || b.price) * (b.salesCount || 0);
        return revenueB - revenueA;
      })
      .slice(0, 5)
      .map((book) => ({
        title: book.title,
        revenue: (book.salePrice || book.price) * (book.salesCount || 0),
        views: book.viewCount || 0,
        rating: book.rating || 0,
      }));

    // Revenue by category
    const revenueByCategory: Record<string, number> = {};
    books.forEach((book) => {
      const category = book.category || "Uncategorized";
      const revenue = (book.salePrice || book.price) * (book.salesCount || 0);
      revenueByCategory[category] =
        (revenueByCategory[category] || 0) + revenue;
    });

    // Engagement rate (views to purchases ratio)
    const totalSales = books.reduce((sum, book) => sum + (book.salesCount || 0), 0);
    const engagementRate =
      totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(1) : 0;

    return NextResponse.json({
      totalBooks,
      publishedBooks,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      totalViews,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews,
      featuredBooks,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      viewsGrowth: parseFloat(viewsGrowth.toFixed(1)),
      topBooks,
      revenueByCategory,
      engagementRate: parseFloat(engagementRate as string),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
