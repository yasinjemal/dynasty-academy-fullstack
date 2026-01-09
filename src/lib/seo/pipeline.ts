/**
 * 🚀 SEO Pipeline Orchestrator
 *
 * Automatically runs all SEO optimizations when a book is imported:
 * - AI metadata generation (GPT-4)
 * - Advanced schema.org generation
 * - Dynamic OG image generation
 * - Database updates with SEO fields
 */

import { prisma } from "@/lib/db/prisma";
import { AIMetadataGenerator } from "./aiMetadataGenerator";
import { AdvancedSchemaGenerator } from "./advancedSchemaGenerator";
import { getOGImageURL } from "./dynamicOGImage";

interface SeoPipelineResult {
  success: boolean;
  bookId: string;
  metadata?: {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    schemaJson: string;
  };
  error?: string;
}

/**
 * Run complete SEO pipeline for a single book
 * Called automatically after book import + content storage
 */
export async function runSeoPipelinesForBook(
  bookId: string
): Promise<SeoPipelineResult> {
  try {
    console.log(`🔮 Starting SEO pipeline for book: ${bookId}`);

    // 1. Fetch book data
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
          },
        },
      },
    });

    if (!book) {
      throw new Error(`Book not found: ${bookId}`);
    }

    const useAiSeo = process.env.USE_AI_SEO === "true";
    console.log(
      `   ${useAiSeo ? "🤖 AI SEO enabled" : "📝 Using fallback SEO"}`
    );

    // 2. Generate AI-powered metadata (or fallback)
    let metadata;
    if (useAiSeo && process.env.OPENAI_API_KEY) {
      try {
        const generator = new AIMetadataGenerator(process.env.OPENAI_API_KEY);
        metadata = await generator.generateHyperOptimizedMetadata({
          title: book.title,
          author: book.author?.username || "Unknown Author",
          description: book.description || "",
          category: book.category || "Fiction",
          tags: book.tags || [],
          publicationYear: book.publicationYear,
          rating: book.rating || 0,
          reviewCount: book.reviewCount || 0,
          language: book.language || "en",
        });
        console.log(`   ✅ AI metadata generated`);
      } catch (error) {
        console.warn(`   ⚠️  AI generation failed, using fallback:`, error);
        metadata = AIMetadataGenerator.generateFallbackMetadata({
          title: book.title,
          author: book.author?.username || "Unknown Author",
          description: book.description || "",
          category: book.category || "Fiction",
          tags: book.tags || [],
        });
      }
    } else {
      metadata = AIMetadataGenerator.generateFallbackMetadata({
        title: book.title,
        author: book.author?.username || "Unknown Author",
        description: book.description || "",
        category: book.category || "Fiction",
        tags: book.tags || [],
      });
      console.log(`   ✅ Fallback metadata generated`);
    }

    // 3. Generate OG Image URL (will be generated on-demand at edge)
    const ogImageUrl = getOGImageURL(book.id, book.slug, book.title);
    console.log(`   ✅ OG image URL: ${ogImageUrl}`);

    // 4. Generate advanced Schema.org JSON-LD
    const schemaGenerator = new AdvancedSchemaGenerator();
    const schemas = schemaGenerator.generateCompleteSchema({
      book: {
        id: book.id,
        title: book.title,
        slug: book.slug,
        description: book.description || metadata.metaDescription,
        author: book.author?.username || "Unknown Author",
        authorBio: book.author?.bio,
        publisher: book.publisher,
        publicationYear: book.publicationYear,
        isbn: book.isbn,
        language: book.language || "en",
        category: book.category || "Fiction",
        tags: book.tags || [],
        coverImage: book.coverImage,
        rating: book.rating || 0,
        reviewCount: book.reviewCount || 0,
        price: book.price || 0,
        pages: book.totalPages || 0,
      },
      url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://www.dynastybuiltacademy.com"
      }/books/${book.slug}`,
      breadcrumbs: [
        {
          name: "Home",
          url:
            process.env.NEXT_PUBLIC_BASE_URL || "https://www.dynastybuiltacademy.com",
        },
        {
          name: "Books",
          url: `${
            process.env.NEXT_PUBLIC_BASE_URL || "https://www.dynastybuiltacademy.com"
          }/books`,
        },
        {
          name: book.title,
          url: `${
            process.env.NEXT_PUBLIC_BASE_URL || "https://www.dynastybuiltacademy.com"
          }/books/${book.slug}`,
        },
      ],
    });
    console.log(
      `   ✅ Schema.org generated (${schemas["@graph"].length} types)`
    );

    // 5. Prepare SEO data for database
    const seoData = {
      // Meta tags
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,

      // Store additional SEO fields (if columns exist)
      seoTitle: metadata.metaTitle,
      seoDescription: metadata.metaDescription,
      seoKeywords: metadata.keywords.join(", "),
      seoOgImage: ogImageUrl,
      seoSchemaJson: JSON.stringify(schemas),

      // Update existing meta fields
      updatedAt: new Date(),
    };

    // 6. Update book with SEO data
    await prisma.book.update({
      where: { id: bookId },
      data: seoData as any, // Type assertion since SEO fields might not be in schema yet
    });
    console.log(`   ✅ Book updated with SEO data`);

    console.log(`🎉 SEO pipeline complete for: ${book.title}`);

    return {
      success: true,
      bookId,
      metadata: {
        seoTitle: metadata.metaTitle,
        seoDescription: metadata.metaDescription,
        seoKeywords: metadata.keywords,
        ogTitle: metadata.ogTitle,
        ogDescription: metadata.ogDescription,
        ogImage: ogImageUrl,
        twitterCard: "summary_large_image",
        schemaJson: JSON.stringify(schemas),
      },
    };
  } catch (error) {
    console.error(`❌ SEO pipeline failed for book ${bookId}:`, error);
    return {
      success: false,
      bookId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch process SEO for multiple books
 * Useful for backfilling SEO data on existing books
 */
export async function runSeoPipelineBatch(
  bookIds: string[]
): Promise<SeoPipelineResult[]> {
  console.log(`🔮 Starting batch SEO pipeline for ${bookIds.length} books...`);

  const results: SeoPipelineResult[] = [];

  for (const bookId of bookIds) {
    const result = await runSeoPipelinesForBook(bookId);
    results.push(result);

    // Rate limiting for AI API (if enabled)
    if (process.env.USE_AI_SEO === "true") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `✅ Batch complete: ${successCount}/${bookIds.length} successful`
  );

  return results;
}

/**
 * Revalidate Next.js paths (ISR)
 * Called after SEO updates to refresh cached pages
 */
export async function revalidatePaths(paths: string[]): Promise<void> {
  const revalidateToken = process.env.REVALIDATE_TOKEN;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.dynastybuiltacademy.com";

  if (!revalidateToken) {
    console.warn("⚠️  REVALIDATE_TOKEN not set, skipping revalidation");
    return;
  }

  console.log(`🔄 Revalidating ${paths.length} paths...`);

  const promises = paths.map(async (path) => {
    try {
      const url = `${baseUrl}/api/revalidate?path=${encodeURIComponent(
        path
      )}&token=${revalidateToken}`;
      const response = await fetch(url);

      if (response.ok) {
        console.log(`   ✅ Revalidated: ${path}`);
      } else {
        console.warn(
          `   ⚠️  Failed to revalidate: ${path} (${response.status})`
        );
      }
    } catch (error) {
      console.warn(`   ⚠️  Error revalidating ${path}:`, error);
    }
  });

  await Promise.all(promises);
}

/**
 * Complete import + SEO workflow
 * Use this as the main entry point from import API
 */
export async function completeBookImportWorkflow(
  bookId: string,
  slug: string,
  totalPages: number
): Promise<void> {
  console.log(`\n🚀 Complete import workflow for book: ${bookId}`);

  // 1. Update page count
  await prisma.book.update({
    where: { id: bookId },
    data: { totalPages },
  });
  console.log(`📄 Updated page count: ${totalPages}`);

  // 2. Run SEO pipeline
  const seoResult = await runSeoPipelinesForBook(bookId);

  if (!seoResult.success) {
    console.warn(`⚠️  SEO pipeline had issues, but continuing...`);
  }

  // 3. Revalidate paths
  await revalidatePaths([`/books/${slug}`, "/books", "/sitemap.xml"]);

  console.log(`✅ Workflow complete for book: ${bookId}\n`);
}
