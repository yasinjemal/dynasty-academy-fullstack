import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    // Get user's purchased books
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        purchases: {
          include: {
            book: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        progress: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get unique books from purchases
    const purchasedBooks = user.purchases.map((purchase) => {
      const book = purchase.book;
      const progress = user.progress.find((p) => p.bookId === book.id);

      return {
        id: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author?.name || "Unknown Author",
        authorImage: book.author?.image,
        cover:
          book.coverImage ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
        progress: progress?.progress || 0,
        pages: book.totalPages || book.pages || 0,
        currentPage: Math.floor(
          ((progress?.progress || 0) / 100) *
            (book.totalPages || book.pages || 100)
        ),
        rating: book.rating,
        category: book.category,
        timeLeft: calculateTimeLeft(
          book.totalPages || book.pages || 0,
          progress?.progress || 0
        ),
        lastRead: progress?.updatedAt
          ? formatLastRead(progress.updatedAt)
          : "Never",
        purchasedAt: purchase.createdAt,
      };
    });

    // Apply filters
    let filteredBooks = purchasedBooks;

    if (search) {
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(search.toLowerCase()) ||
          book.author.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== "all") {
      filteredBooks = filteredBooks.filter(
        (book) => book.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Sort by last read (most recent first)
    filteredBooks.sort((a, b) => {
      if (a.lastRead === "Never" && b.lastRead !== "Never") return 1;
      if (a.lastRead !== "Never" && b.lastRead === "Never") return -1;
      return (
        new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      );
    });

    return NextResponse.json({
      books: filteredBooks,
      total: filteredBooks.length,
    });
  } catch (error: any) {
    console.error("Library API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch library",
        details: error?.message || "Unknown error",
        books: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateTimeLeft(
  totalPages: number,
  progressPercent: number
): string {
  const remainingPages = totalPages - (totalPages * progressPercent) / 100;
  const minutesPerPage = 2; // Average reading speed
  const minutesLeft = Math.ceil(remainingPages * minutesPerPage);

  if (minutesLeft < 60) {
    return `${minutesLeft}m`;
  } else {
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

function formatLastRead(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}
