/**
 * Check which books have content available for AI Course Generator
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkBooksWithContent() {
  console.log("📚 Checking books with content...\n");

  try {
    // Get all books
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        totalPages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${books.length} books total\n`);

    // Check each book for content
    for (const book of books) {
      const contentPages = await prisma.bookContent.count({
        where: { bookId: book.id },
      });

      const status = contentPages > 0 ? "✅" : "❌";
      console.log(`${status} "${book.title}"`);
      console.log(
        `   Pages in DB: ${contentPages} | Total Pages: ${
          book.totalPages || "unknown"
        }`
      );

      if (contentPages > 0) {
        // Show sample of first page
        const firstPage = await prisma.bookContent.findFirst({
          where: { bookId: book.id },
          orderBy: { pageNumber: "asc" },
        });

        if (firstPage) {
          console.log(
            `   First page preview: ${firstPage.content.substring(0, 100)}...`
          );
        }
      }
      console.log("");
    }

    // Summary
    const booksWithContent = await prisma.$queryRaw<any[]>`
      SELECT 
        b.id,
        b.title,
        COUNT(bc.id) as page_count
      FROM books b
      LEFT JOIN book_contents bc ON b.id = bc.book_id
      GROUP BY b.id, b.title
      HAVING COUNT(bc.id) > 0
      ORDER BY COUNT(bc.id) DESC
    `;

    console.log("\n📊 Summary:");
    console.log(`Books with content: ${booksWithContent.length}`);
    console.log(
      `Books without content: ${books.length - booksWithContent.length}`
    );

    if (booksWithContent.length > 0) {
      console.log("\n✅ Books ready for AI Course Generator:");
      booksWithContent.forEach((book) => {
        console.log(`   - "${book.title}" (${book.page_count} pages)`);
      });
    } else {
      console.log("\n⚠️  No books have content uploaded yet!");
      console.log(
        '   Books need content in the "book_contents" table to generate courses.'
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBooksWithContent();
