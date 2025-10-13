import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, bookIds, data } = await req.json();

    if (
      !action ||
      !bookIds ||
      !Array.isArray(bookIds) ||
      bookIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    let result;
    let message = "";

    switch (action) {
      case "updatePrice":
        if (!data?.price || isNaN(parseFloat(data.price))) {
          return NextResponse.json({ error: "Invalid price" }, { status: 400 });
        }
        result = await prisma.book.updateMany({
          where: { id: { in: bookIds } },
          data: { price: parseFloat(data.price) },
        });
        message = `Updated price for ${result.count} books`;
        break;

      case "updateCategory":
        if (!data?.category) {
          return NextResponse.json(
            { error: "Invalid category" },
            { status: 400 }
          );
        }
        result = await prisma.book.updateMany({
          where: { id: { in: bookIds } },
          data: { category: data.category },
        });
        message = `Updated category for ${result.count} books`;
        break;

      case "toggleFeatured":
        // Get current featured status for each book and toggle
        const books = await prisma.book.findMany({
          where: { id: { in: bookIds } },
          select: { id: true, featured: true },
        });

        const updatePromises = books.map((book) =>
          prisma.book.update({
            where: { id: book.id },
            data: { featured: !book.featured },
          })
        );

        await Promise.all(updatePromises);
        message = `Toggled featured status for ${books.length} books`;
        break;

      case "publish":
        result = await prisma.book.updateMany({
          where: { id: { in: bookIds } },
          data: { publishedAt: new Date() },
        });
        message = `Published ${result.count} books`;
        break;

      case "unpublish":
        result = await prisma.book.updateMany({
          where: { id: { in: bookIds } },
          data: { publishedAt: null },
        });
        message = `Unpublished ${result.count} books`;
        break;

      case "delete":
        result = await prisma.book.deleteMany({
          where: { id: { in: bookIds } },
        });
        message = `Deleted ${result.count} books`;
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message,
      count: result?.count || bookIds.length,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
