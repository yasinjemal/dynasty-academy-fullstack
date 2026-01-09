// Check book content in database
import { prisma } from "../src/lib/db/prisma";

async function checkBookContent() {
  console.log("🔍 Checking book content...\n");

  // Find all books with "Prompt" in title
  const books = await prisma.book.findMany({
    where: {
      title: { contains: "Prompt" },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      totalPages: true,
    },
  });

  console.log("📚 Books found:", books.length);

  for (const book of books) {
    console.log(`\n📖 ${book.title}`);
    console.log(`   ID: ${book.id}`);
    console.log(`   Slug: ${book.slug}`);
    console.log(`   Total Pages: ${book.totalPages}`);

    // Check content
    const content = await prisma.bookContent.findMany({
      where: { bookId: book.id },
      take: 3,
      select: {
        pageNumber: true,
        content: true,
        wordCount: true,
      },
    });

    console.log(`   Content Pages in DB: ${content.length}`);

    if (content.length > 0) {
      console.log(
        `   First page preview: "${content[0].content?.substring(0, 100)}..."`
      );
    } else {
      console.log("   ⚠️ NO CONTENT IN DATABASE!");
    }
  }

  // Also check total BookContent entries
  const totalContent = await prisma.bookContent.count();
  console.log(`\n📊 Total BookContent entries in database: ${totalContent}`);

  // Show which books have content
  const booksWithContent = await prisma.bookContent.groupBy({
    by: ["bookId"],
    _count: { pageNumber: true },
  });

  console.log(`\n📖 Books with content:`, booksWithContent.length);

  for (const bc of booksWithContent.slice(0, 5)) {
    const bk = await prisma.book.findUnique({
      where: { id: bc.bookId },
      select: { title: true, slug: true },
    });
    console.log(
      `   - ${bk?.title} (${bk?.slug}): ${bc._count.pageNumber} pages`
    );
  }
}

checkBookContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
