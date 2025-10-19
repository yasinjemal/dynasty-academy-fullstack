import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sortBy") || "newest";
    const bookType = searchParams.get("bookType") || ""; // 'premium', 'free', 'all'
    const source = searchParams.get("source") || ""; // Filter by source

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      publishedAt: { not: null },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All Categories" && category !== "All") {
      where.category = { contains: category, mode: "insensitive" };
    }

    // 🚀 NEW: Filter by book type
    if (bookType && bookType !== "all") {
      where.bookType = bookType;
    }

    // 🚀 NEW: Filter by source
    if (source && source !== "all") {
      where.source = source;
    }

    // 🚀 PRIORITY SORTING: Featured books always first!
    let orderBy: any[] = [
      { featured: "desc" }, // Featured books first
    ];

    switch (sort) {
      case "oldest":
        orderBy.push({ createdAt: "asc" });
        break;
      case "price-low":
        orderBy.push({ price: "asc" });
        break;
      case "price-high":
        orderBy.push({ price: "desc" });
        break;
      case "rating":
        orderBy.push({ rating: "desc" });
        break;
      case "popular":
        orderBy.push({ viewCount: "desc" });
        break;
      default: // newest
        orderBy.push({ createdAt: "desc" });
    }

    // Get books with pagination
    const [books, totalCount] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          price: true,
          salePrice: true,
          category: true,
          rating: true,
          reviewCount: true,
          featured: true,
          createdAt: true,
          bookType: true, // 🚀 NEW
          source: true, // 🚀 NEW
          language: true, // 🚀 NEW
          publisher: true, // 🚀 NEW
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    console.error("Books API error:", error);
    return NextResponse.json(
      { message: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
