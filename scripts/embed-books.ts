/**
 * 📚 EMBED BOOKS SCRIPT
 *
 * Processes all books in the database and generates vector embeddings
 * for semantic search in the AI Chat system
 *
 * Usage: npx tsx scripts/embed-books.ts
 */

import { PrismaClient } from "@prisma/client";
import {
  generateEmbedding,
  upsertEmbedding,
  chunkText,
  deleteEmbeddings,
} from "../src/lib/embeddings";

const prisma = new PrismaClient();

interface ProcessingStats {
  totalBooks: number;
  processedBooks: number;
  totalChunks: number;
  successfulChunks: number;
  failedChunks: number;
  errors: string[];
}

const stats: ProcessingStats = {
  totalBooks: 0,
  processedBooks: 0,
  totalChunks: 0,
  successfulChunks: 0,
  failedChunks: 0,
  errors: [],
};

/**
 * Process a single book
 */
async function processBook(book: any) {
  console.log(`\n📖 Processing: ${book.title}`);

  try {
    // Delete existing embeddings for this book
    console.log("🗑️  Deleting old embeddings...");
    await deleteEmbeddings("book", book.id);

    // Get book content from BookContent table
    const bookContent = await prisma.bookContent.findMany({
      where: { bookId: book.id },
      orderBy: { pageNumber: "asc" },
    });

    if (bookContent.length === 0) {
      console.log("⚠️  No content to embed");
      return;
    }

    console.log(`� Found ${bookContent.length} pages`);

    let totalChars = 0;
    let totalChunks = 0;

    // Process each page
    for (const page of bookContent) {
      const content = page.content || "";
      if (content.length < 50) continue; // Skip very short pages

      totalChars += content.length;

      // Chunk the page content
      const chunks = chunkText(content, 500); // 500 tokens per chunk
      totalChunks += chunks.length;

      // Process each chunk
      for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
        const chunk = chunks[chunkIdx];

        try {
          stats.totalChunks++;

          // Show progress
          if (stats.totalChunks % 10 === 0) {
            console.log(
              `  Page ${page.pageNumber}, chunk ${chunkIdx + 1}/${
                chunks.length
              } (${stats.totalChunks} total)`
            );
          }

          // Generate embedding
          const embedding = await generateEmbedding(chunk);

          // Calculate global chunk index
          const globalChunkIdx = stats.totalChunks - 1;

          // Store in database
          const result = await upsertEmbedding({
            content_type: "book",
            content_id: book.id,
            content_title: book.title,
            content_slug: book.slug,
            chunk_text: chunk,
            chunk_index: globalChunkIdx,
            page_number: page.pageNumber,
            embedding,
            metadata: {
              category: book.category,
              page_word_count: page.wordCount,
              chunk_length: chunk.length,
            },
          });

          if (result.success) {
            stats.successfulChunks++;
          } else {
            stats.failedChunks++;
            stats.errors.push(
              `Book ${book.title}, page ${page.pageNumber}, chunk ${chunkIdx}: ${result.error}`
            );
          }

          // Rate limiting: OpenAI allows 3000 requests/min
          // Wait 20ms between requests = 3000 req/min
          await new Promise((resolve) => setTimeout(resolve, 20));
        } catch (error) {
          stats.failedChunks++;
          stats.errors.push(
            `Book ${book.title}, page ${page.pageNumber}, chunk ${chunkIdx}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          console.error(
            `❌ Page ${page.pageNumber}, chunk ${chunkIdx} failed:`,
            error
          );
        }
      }
    }

    stats.processedBooks++;
    console.log(
      `✅ Completed ${book.title}: ${
        bookContent.length
      } pages, ${totalChars.toLocaleString()} chars, ${totalChunks} chunks`
    );
  } catch (error) {
    stats.errors.push(
      `Book ${book.title}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    console.error(`❌ Failed to process ${book.title}:`, error);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Starting book embedding process...\n");

  try {
    // Fetch all books (content is in separate BookContent table)
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
      },
    });

    stats.totalBooks = books.length;
    console.log(`📚 Found ${books.length} books\n`);

    if (books.length === 0) {
      console.log("⚠️  No books found. Add books to the database first.");
      return;
    }

    // Process each book
    for (const book of books) {
      await processBook(book);
    }

    // Print final statistics
    console.log("\n" + "=".repeat(60));
    console.log("📊 EMBEDDING STATISTICS");
    console.log("=".repeat(60));
    console.log(`Total Books: ${stats.totalBooks}`);
    console.log(`Processed Books: ${stats.processedBooks}`);
    console.log(`Total Chunks: ${stats.totalChunks}`);
    console.log(`Successful Chunks: ${stats.successfulChunks}`);
    console.log(`Failed Chunks: ${stats.failedChunks}`);
    console.log(
      `Success Rate: ${Math.round(
        (stats.successfulChunks / stats.totalChunks) * 100
      )}%`
    );

    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors (${stats.errors.length}):`);
      stats.errors.slice(0, 10).forEach((error) => {
        console.log(`  - ${error}`);
      });
      if (stats.errors.length > 10) {
        console.log(`  ... and ${stats.errors.length - 10} more`);
      }
    }

    console.log("\n✅ Embedding process complete!");
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run
main();
