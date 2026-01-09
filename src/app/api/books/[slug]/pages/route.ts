import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

// GET - Fetch book pages/content
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    // Find the book
    const book = await prisma.book.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        totalPages: true,
        bookType: true,
        previewPages: true,
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check access - for premium books, user needs to own it
    let hasFullAccess = book.bookType === "free" || book.bookType === "public";

    if (!hasFullAccess && session?.user?.id) {
      // Check if user purchased the book
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: session.user.id,
          bookId: book.id,
          status: "completed",
        },
      });

      if (purchase) {
        hasFullAccess = true;
      }
    }

    // Fetch book content pages from database
    let bookContent = await prisma.bookContent.findMany({
      where: { bookId: book.id },
      orderBy: { pageNumber: "asc" },
      select: {
        pageNumber: true,
        content: true,
        wordCount: true,
      },
    });

    // If no content in database, try to load from JSON file
    if (bookContent.length === 0) {
      const jsonPath = path.join(
        process.cwd(),
        "data",
        "book-content",
        book.id,
        "content.json"
      );

      try {
        if (fs.existsSync(jsonPath)) {
          const jsonContent = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
          if (jsonContent.pages && Array.isArray(jsonContent.pages)) {
            // Transform JSON pages to match database format
            bookContent = jsonContent.pages.map(
              (content: string, index: number) => ({
                pageNumber: index + 1,
                content: content,
                wordCount: content.split(/\s+/).length,
              })
            );
            console.log(
              `📖 Loaded ${bookContent.length} pages from JSON for book: ${book.title}`
            );
          }
        }
      } catch (jsonError) {
        console.error("Error loading JSON content:", jsonError);
      }
    }

    // If still no content found, return empty
    if (bookContent.length === 0) {
      return NextResponse.json({
        pages: [],
        totalPages: book.totalPages || 0,
        hasFullAccess,
        message: "No content available for this book",
      });
    }

    // Determine how many pages to return
    const previewPageCount = book.previewPages || 3;

    // Format pages
    const pages = bookContent.map((page, index) => {
      // For premium books without access, only show preview pages
      const isPreviewPage = index < previewPageCount;
      const canAccess = hasFullAccess || isPreviewPage;

      return {
        number: page.pageNumber,
        title: `Page ${page.pageNumber}`,
        content: canAccess
          ? page.content
          : `[Preview Only] Upgrade to access this page. Purchase the book to continue reading.`,
        wordCount: page.wordCount,
        isPreview: isPreviewPage && !hasFullAccess,
      };
    });

    return NextResponse.json({
      pages,
      totalPages: book.totalPages || bookContent.length,
      hasFullAccess,
      previewPages: previewPageCount,
    });
  } catch (error: any) {
    console.error("Book pages API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch book pages" },
      { status: 500 }
    );
  }
}
