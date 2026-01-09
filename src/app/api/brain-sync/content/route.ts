import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// GET - Fetch available books and courses for Brain Sync sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("📚 Brain Sync Content API - Session:", session?.user?.email);

    // For now, allow fetching even without login to show available content
    const userId = session?.user?.id;

    // Fetch ALL books for Brain Sync - let users study any book
    // Access control happens when reading content, not when listing
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        category: true,
        totalPages: true,
        pages: true,
        bookType: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { title: "asc" },
      take: 50,
    });

    console.log(`📚 Found ${books.length} books`);

    // Fetch ALL published courses for Brain Sync
    const courses = await prisma.courses.findMany({
      where: {
        status: "published",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        category: true,
        level: true,
        lessonCount: true,
        instructorName: true,
        isFree: true,
      },
      orderBy: { title: "asc" },
      take: 50,
    });

    console.log(`📖 Found ${courses.length} courses`);

    return NextResponse.json({
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        slug: book.slug,
        coverImage: book.coverImage,
        category: book.category || "General",
        totalPages: book.totalPages || book.pages || 100,
        authorName: book.author?.name || "Unknown",
        type: "book",
      })),
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        coverImage: course.coverImage,
        category: course.category || "General",
        level: course.level,
        lessonCount: course.lessonCount || 0,
        instructorName: course.instructorName || "Unknown",
        type: "course",
      })),
    });
  } catch (error) {
    console.error("Error fetching Brain Sync content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
