import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");

    const session = await getServerSession(authOptions);

    // Get book details
    const book = await prisma.book.findUnique({
      where: { slug },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if user has purchased the book or if it's a free book
    const isPurchased = book.bookType === "free" || false; // Free books are accessible to all

    // Check if page is within free preview or user has purchased
    const canAccess = page <= (book.previewPages || 0) || isPurchased;

    if (!canAccess) {
      return NextResponse.json(
        {
          error: "Purchase required to access this page",
          requiresPurchase: true,
        },
        { status: 403 }
      );
    }

    // 🚀 TRY NEW SYSTEM FIRST (BookContent table for imported books)
    if (book.source !== "manual") {
      try {
        // Fetch from BookContent table
        const pageContent = await prisma.bookContent.findUnique({
          where: {
            bookId_pageNumber: {
              bookId: book.id,
              pageNumber: page,
            },
          },
        });

        if (pageContent) {
          // Get total pages for this book
          const totalPagesResult = await prisma.bookContent.findFirst({
            where: { bookId: book.id },
            orderBy: { pageNumber: "desc" },
            select: { pageNumber: true },
          });

          const totalPages =
            totalPagesResult?.pageNumber || book.totalPages || 1;

          // Track reading progress if user is logged in
          if (session?.user?.id) {
            try {
              await prisma.userProgress.upsert({
                where: {
                  userId_bookId: {
                    userId: session.user.id,
                    bookId: book.id,
                  },
                },
                update: {
                  lastPage: page,
                  progress: Math.round((page / totalPages) * 100),
                  completed: page >= totalPages,
                },
                create: {
                  userId: session.user.id,
                  bookId: book.id,
                  lastPage: page,
                  progress: Math.round((page / totalPages) * 100),
                  completed: page >= totalPages,
                },
              });
            } catch (error) {
              console.error("Error tracking reading progress:", error);
            }
          }

          return NextResponse.json({
            content: pageContent.content,
            currentPage: page,
            totalPages,
            isPurchased: !!isPurchased,
            previewPages: book.previewPages || 0,
            wordCount: pageContent.wordCount,
            source: book.source,
          });
        }
      } catch (error) {
        console.error("Error fetching from BookContent:", error);
        // Fall through to file-based system
      }
    }

    // 📁 FALLBACK TO OLD SYSTEM (file-based for manual books)
    const contentFile = join(
      process.cwd(),
      "data",
      "book-content",
      book.id,
      "content.json"
    );

    if (!existsSync(contentFile)) {
      return NextResponse.json(
        { error: "Book content not available" },
        { status: 404 }
      );
    }

    const contentData = JSON.parse(await readFile(contentFile, "utf-8"));

    if (page < 1 || page > contentData.totalPages) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }

    // Get the requested page content
    const pageContent = contentData.pages[page - 1];

    // Track reading progress if user is logged in
    if (session?.user?.id) {
      try {
        await prisma.userProgress.upsert({
          where: {
            userId_bookId: {
              userId: session.user.id,
              bookId: book.id,
            },
          },
          update: {
            lastPage: page,
            progress: Math.round((page / contentData.totalPages) * 100),
            completed: page >= contentData.totalPages,
          },
          create: {
            userId: session.user.id,
            bookId: book.id,
            lastPage: page,
            progress: Math.round((page / contentData.totalPages) * 100),
            completed: page >= contentData.totalPages,
          },
        });
      } catch (error) {
        // Log but don't fail the page load if progress tracking fails
        console.error("Error tracking reading progress:", error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      currentPage: page,
      totalPages: contentData.totalPages,
      isPurchased: !!isPurchased,
      previewPages: book.previewPages || 0,
    });
  } catch (error: any) {
    console.error("Error reading book page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load page" },
      { status: 500 }
    );
  }
}
