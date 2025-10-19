/**
 * 🎨 OG IMAGE API ROUTE
 *
 * Dynamic OG image generation at the edge!
 * GET /api/og/book/[slug] → Beautiful custom social card
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { DynamicOGImageGenerator } from "@/lib/seo/dynamicOGImage";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch book data
    const book = await prisma.book.findUnique({
      where: { slug },
      include: { author: true },
    });

    if (!book) {
      // Return default OG image for 404
      return new Response("Book not found", { status: 404 });
    }

    // Generate OG image
    return await DynamicOGImageGenerator.generateBookOGImage({
      title: book.title,
      author: book.author.name || "Unknown Author",
      category: book.category,
      rating: book.rating || undefined,
      coverImage: book.coverImage || undefined,
      isFree: book.bookType === "free",
    });
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
