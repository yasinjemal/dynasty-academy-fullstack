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

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookId } = await params;

    // Get book with author info and content
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        bookContents: {
          orderBy: {
            pageNumber: "asc",
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if user has purchased this book
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        purchases: {
          where: { bookId: book.id },
        },
      },
    });

    if (!user?.purchases || user.purchases.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to this book" },
        { status: 403 }
      );
    }

    // Get or create user progress
    let progress = await prisma.userProgress.findFirst({
      where: {
        userId: user.id,
        bookId: book.id,
      },
    });

    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId: user.id,
          bookId: book.id,
          lastPage: 0,
          progress: 0,
        },
      });
    }

    // Prepare book content - either from extracted pages or placeholder
    const hasExtractedContent =
      book.bookContents && book.bookContents.length > 0;
    const content = hasExtractedContent
      ? book.bookContents.map((page) => page.content).join("\n\n")
      : null;

    return NextResponse.json({
      book: {
        id: book.id,
        title: book.title,
        author: book.author.name || "Unknown Author",
        authorImage: book.author.image,
        coverImage: book.coverImage,
        totalPages: book.totalPages || 100,
        description: book.description,
        category: book.category,
        fileUrl: book.fileUrl,
        contentType: book.contentType,
        hasContent: hasExtractedContent,
        content: content,
      },
      progress: {
        currentPage: progress.lastPage || 0,
        progress: progress.progress,
        lastRead: progress.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json({ error: "Failed to load book" }, { status: 500 });
  }
}
