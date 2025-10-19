import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  BookImporterFactory,
  ImportSource,
  ImportedBook,
} from "@/lib/bookImporters";
import { BookContentFetcher, BookPaginator } from "@/lib/bookContent";
import { completeBookImportWorkflow } from "@/lib/seo/pipeline";

// 🚀 BULK BOOK IMPORT API - Import thousands of books from public sources!

/**
 * @CopilotWorkOrder
 * Integrate full text import pipeline with AI-SEO system
 *
 * 1️⃣ After book content is fetched & paginated,
 *     call runSeoPipelinesForBook(book.id)
 * 2️⃣ Wait until all BookContent pages are stored,
 *     then revalidate /books/[slug] and /sitemap.xml
 * 3️⃣ Save:
 *     - totalPages → book.totalPages
 *     - seoTitle, seoDescription, seoOgImage, seoSchemaJson
 * 4️⃣ Log console summary:
 *     ✅ Imported: {title}
 *     📄 {totalPages} pages stored
 *     🔮 SEO optimized + indexed
 */

export async function POST(req: NextRequest) {
  try {
    // 🔐 Admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      source, // 'gutenberg' | 'openlibrary' | 'google'
      category, // Optional category filter
      search, // Optional search query
      limit = 50, // How many books to import
      minRating = 0, // NEW: Minimum rating filter (0-5)
      language = "en",
      dryRun = false, // Preview mode without importing
    } = body;

    // Validate source
    const supportedSources = BookImporterFactory.getSupportedSources();
    if (!source || !supportedSources.includes(source)) {
      return NextResponse.json(
        { error: `Invalid source. Supported: ${supportedSources.join(", ")}` },
        { status: 400 }
      );
    }

    // Get the appropriate importer
    const importer = BookImporterFactory.getImporter(source as ImportSource);

    console.log(`📚 Starting import from ${importer.name}...`);
    console.log(
      `Filters: category=${category}, search=${search}, limit=${limit}`
    );

    // Warn about full-text availability
    if (source === "openlibrary") {
      console.warn(`⚠️  IMPORTANT: Open Library provides metadata only.`);
      console.warn(`   Most books will NOT have readable content.`);
      console.warn(`   Use Project Gutenberg for books with full text.`);
    } else if (source === "google") {
      console.warn(`⚠️  IMPORTANT: Google Books provides metadata only.`);
      console.warn(`   No books will have readable content via API.`);
      console.warn(`   Use Project Gutenberg for books with full text.`);
    }

    // Search for books
    let importedBooks = await importer.search({
      category,
      search,
      limit,
      language,
    });

    console.log(`✅ Found ${importedBooks.length} books from ${importer.name}`);

    // 🌟 Filter by minimum rating if specified
    if (minRating > 0) {
      const beforeFilter = importedBooks.length;
      importedBooks = importedBooks.filter(
        (book) => (book.rating || 0) >= minRating
      );
      console.log(
        `⭐ Filtered by rating ≥${minRating}: ${beforeFilter} → ${importedBooks.length} books`
      );
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        source: importer.name,
        found: importedBooks.length,
        preview: importedBooks.slice(0, 10),
        message: "Dry run completed. No books were imported.",
      });
    }

    // Get system user for author (or create one)
    let systemUser = await prisma.user.findFirst({
      where: { email: "system@dynasty-academy.com" },
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: "system@dynasty-academy.com",
          name: "Dynasty Academy",
          role: "ADMIN",
        },
      });
    }

    // Import books to database
    const results = {
      total: importedBooks.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
      importedBooks: [] as any[],
    };

    for (const book of importedBooks) {
      try {
        // Check if book already exists (by external ID)
        const existing = await prisma.book.findFirst({
          where: {
            source: source as string,
            externalId: book.externalId,
          },
        });

        if (existing) {
          results.skipped++;
          console.log(`⏭️  Skipped: ${book.title} (already exists)`);
          continue;
        }

        // Generate unique slug
        let slug = importer["generateSlug"](book.title);
        const existingSlug = await prisma.book.findUnique({ where: { slug } });
        if (existingSlug) {
          slug = `${slug}-${book.externalId}`;
        }

        // Create book in database
        const createdBook = await prisma.book.create({
          data: {
            title: book.title,
            slug,
            description: book.description,
            excerpt: book.description.substring(0, 200),
            coverImage: book.coverImage,
            price: 0, // Free books
            salePrice: null,
            category: book.category,
            tags: book.tags,
            contentType: "ebook",
            fileUrl: book.contentUrl,
            previewUrl: book.contentUrl,
            totalPages: book.totalPages || 100,
            previewPages: book.totalPages || 100, // Free = full access
            authorId: systemUser.id,
            publishedAt: new Date(),
            featured: false, // Only manual books are featured
            rating: book.rating || 3.5,
            reviewCount: 0,
            metaTitle: `${book.title} - Dynasty Academy`,
            metaDescription: book.description.substring(0, 160),
            // 🚀 NEW FIELDS
            bookType: "free",
            source: source as string,
            externalId: book.externalId,
            externalData: book.externalData,
            language: book.language,
            isbn: book.isbn,
            publisher: book.publisher,
            publicationYear: book.publicationYear,
          },
        });

        // 📖 FETCH AND STORE FULL TEXT CONTENT
        console.log(`📥 Fetching content for: ${book.title}...`);
        try {
          const fetchResult = await BookContentFetcher.fetchContent(
            source as string,
            book.externalId,
            book.externalData
          );

          if (fetchResult.success && fetchResult.content) {
            console.log(
              `✅ Content fetched: ${fetchResult.wordCount} words from ${fetchResult.source}`
            );

            // Paginate the content
            const paginationResult = BookPaginator.paginate(
              fetchResult.content
            );
            console.log(
              `📄 Paginated into ${paginationResult.totalPages} pages`
            );

            // Store each page in the database
            const pageData = paginationResult.pages.map((page) => ({
              bookId: createdBook.id,
              pageNumber: page.pageNumber,
              content: page.content,
              wordCount: page.wordCount,
              charCount: page.charCount,
            }));

            // Batch insert all pages
            await prisma.bookContent.createMany({
              data: pageData,
            });

            // Update book with accurate page count
            await prisma.book.update({
              where: { id: createdBook.id },
              data: {
                totalPages: paginationResult.totalPages,
                previewPages: paginationResult.totalPages,
              },
            });

            console.log(
              `✅ Stored ${paginationResult.totalPages} pages for: ${book.title}`
            );

            // 🔮 RUN SEO PIPELINE + REVALIDATION
            try {
              await completeBookImportWorkflow(
                createdBook.id,
                createdBook.slug,
                paginationResult.totalPages
              );
            } catch (seoError: any) {
              console.warn(
                `⚠️ SEO pipeline failed for ${book.title}:`,
                seoError.message
              );
              // Continue even if SEO fails - book is still imported
            }
          } else {
            console.warn(
              `⚠️ No content available for: ${book.title} (${fetchResult.error})`
            );
          }
        } catch (contentError: any) {
          console.error(
            `❌ Content fetch failed for ${book.title}:`,
            contentError.message
          );
          // Continue with import even if content fetch fails
        }

        results.imported++;
        results.importedBooks.push({
          id: createdBook.id,
          title: createdBook.title,
          slug: createdBook.slug,
          category: createdBook.category,
        });

        console.log(`✅ Imported: ${book.title}`);
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${book.title}: ${error.message}`);
        console.error(`❌ Failed to import ${book.title}:`, error);
      }
    }

    console.log(`
    📊 IMPORT COMPLETE!
    ✅ Imported: ${results.imported}
    ⏭️  Skipped: ${results.skipped}
    ❌ Failed: ${results.failed}
    📚 Total: ${results.total}
    `);

    return NextResponse.json({
      success: true,
      source: importer.name,
      results,
      message: `Successfully imported ${results.imported} books from ${importer.name}!`,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import books", details: error.message },
      { status: 500 }
    );
  }
}

// GET - Check import status or get available sources
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get statistics about imported books
    const stats = await prisma.book.groupBy({
      by: ["source", "bookType"],
      _count: true,
    });

    const supportedSources = BookImporterFactory.getSupportedSources();
    const importers = BookImporterFactory.getAllImporters().map((imp) => ({
      source: imp.source,
      name: imp.name,
    }));

    return NextResponse.json({
      supportedSources,
      importers,
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching import info:", error);
    return NextResponse.json(
      { error: "Failed to fetch import info" },
      { status: 500 }
    );
  }
}
