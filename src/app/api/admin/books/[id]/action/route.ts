import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookId } = await params;
    const { action } = await req.json();

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    let message = "";

    switch (action) {
      case "duplicate":
        const duplicatedBook = await prisma.book.create({
          data: {
            title: `${book.title} (Copy)`,
            slug: `${book.slug}-copy-${Date.now()}`,
            description: book.description,
            excerpt: book.excerpt,
            category: book.category,
            tags: book.tags,
            price: book.price,
            salePrice: book.salePrice,
            coverImage: book.coverImage,
            contentType: book.contentType,
            fileUrl: book.fileUrl,
            previewUrl: book.previewUrl,
            pages: book.pages,
            duration: book.duration,
            totalPages: book.totalPages,
            previewPages: book.previewPages,
            authorId: book.authorId,
            featured: false,
            publishedAt: null,
          },
        });
        message = "Book duplicated successfully!";
        break;

      case "togglePublish":
        await prisma.book.update({
          where: { id: bookId },
          data: {
            publishedAt: book.publishedAt ? null : new Date(),
          },
        });
        message = book.publishedAt
          ? "Book unpublished successfully!"
          : "Book published successfully!";
        break;

      case "toggleFeatured":
        await prisma.book.update({
          where: { id: bookId },
          data: { featured: !book.featured },
        });
        message = book.featured
          ? "Book unfeatured successfully!"
          : "Book featured successfully!";
        break;

      case "delete":
        await prisma.book.delete({
          where: { id: bookId },
        });
        message = "Book deleted successfully!";
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Quick action error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
