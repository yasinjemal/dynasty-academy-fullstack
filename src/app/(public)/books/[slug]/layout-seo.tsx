/**
 * 🚀 HYPER-OPTIMIZED BOOK PAGE METADATA
 *
 * Server-side metadata generation with:
 * - AI-powered titles and descriptions
 * - Multi-language support
 * - Schema.org structured data
 * - Dynamic OG images
 * - Perfect SEO every time
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AIMetadataGenerator } from "@/lib/seo/aiMetadataGenerator";
import { AdvancedSchemaGenerator } from "@/lib/seo/advancedSchemaGenerator";
import { DynamicOGImageGenerator } from "@/lib/seo/dynamicOGImage";

interface BookPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * 🎯 GENERATE METADATA (Server-side, Google sees this immediately!)
 */
export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;

  const book = await prisma.book.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!book) {
    return {
      title: "Book Not Found - Dynasty Academy",
      description: "The book you are looking for could not be found.",
    };
  }

  const isFree = book.bookType === "free";

  // 🤖 AI-POWERED METADATA (Optional: Enable for maximum optimization)
  const USE_AI = process.env.USE_AI_SEO === "true";

  let metadata;
  if (USE_AI) {
    try {
      metadata = await AIMetadataGenerator.generateHyperOptimizedMetadata(
        {
          title: book.title,
          description: book.description,
          author: book.author?.name || "Unknown Author",
          category: book.category,
          tags: book.tags,
          publicationYear: book.publicationYear || undefined,
        },
        isFree
      );
    } catch (error) {
      console.error("AI metadata generation failed, using fallback:", error);
      metadata = null;
    }
  }

  // Fallback to smart defaults
  const metaTitle =
    metadata?.metaTitle ||
    `${book.title} by ${book.author?.name || "Unknown"} - ${
      isFree ? "Read Free Online" : "Premium Book"
    } | Dynasty Academy`;

  const metaDescription =
    metadata?.metaDescription ||
    `${isFree ? "Read" : "Get"} ${book.title} by ${
      book.author?.name || "Unknown"
    } ${
      isFree ? "free online" : "with premium features"
    }. ${book.description.substring(
      0,
      100
    )}... Available now on Dynasty Academy.`;

  const keywords = metadata?.keywords || [
    book.title.toLowerCase(),
    book.author?.name?.toLowerCase() || "",
    `read ${book.title.toLowerCase()} online`,
    `${book.title.toLowerCase()} free`,
    book.category.toLowerCase(),
    ...book.tags.map((t) => t.toLowerCase()),
    "classic literature",
    "free ebooks",
    "online reading",
    "ai-powered reading",
  ];

  // 🎨 DYNAMIC OG IMAGE URL
  const ogImageUrl = DynamicOGImageGenerator.getOGImageURL(book.slug);

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords.join(", "),
    authors: book.author?.name ? [{ name: book.author.name }] : [],

    // Open Graph (Facebook, LinkedIn, etc.)
    openGraph: {
      title: metadata?.ogTitle || metaTitle,
      description: metadata?.ogDescription || metaDescription,
      type: "book",
      url: `https://dynasty-academy.com/books/${book.slug}`,
      siteName: "Dynasty Academy",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${book.title} - Dynasty Academy`,
        },
      ],
      locale: "en_US",
      ...(book.isbn && {
        book: {
          isbn: book.isbn,
          releaseDate: book.publicationYear
            ? `${book.publicationYear}-01-01`
            : undefined,
          authors: book.author?.name ? [book.author.name] : [],
          tags: book.tags,
        },
      }),
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: metadata?.twitterTitle || metaTitle,
      description: metadata?.twitterDescription || metaDescription,
      images: [ogImageUrl],
      creator: "@dynastyacademy",
      site: "@dynastyacademy",
    },

    // Additional metadata
    alternates: {
      canonical: `https://dynasty-academy.com/books/${book.slug}`,
      languages: {
        "en-US": `https://dynasty-academy.com/books/${book.slug}`,
        "es-ES": `https://dynasty-academy.com/es/libros/${book.slug}`,
        "fr-FR": `https://dynasty-academy.com/fr/livres/${book.slug}`,
        "de-DE": `https://dynasty-academy.com/de/bucher/${book.slug}`,
      },
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Additional tags
    other: {
      "book:author": book.author?.name || "",
      "book:isbn": book.isbn || "",
      "book:release_date": book.publicationYear
        ? `${book.publicationYear}-01-01`
        : "",
      "article:published_time": book.createdAt.toISOString(),
      "article:modified_time": book.updatedAt.toISOString(),
      "og:updated_time": book.updatedAt.toISOString(),
    },
  };
}

/**
 * 📚 STATIC PARAMS GENERATION (Pre-render top 100 books)
 */
export async function generateStaticParams() {
  const books = await prisma.book.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
    take: 100, // Pre-render top 100 for instant loading
    orderBy: [{ featured: "desc" }, { viewCount: "desc" }],
  });

  return books.map((book) => ({
    slug: book.slug,
  }));
}

/**
 * 📄 BOOK PAGE COMPONENT (Same as before, but with SEO superpowers!)
 */
export default async function BookDetailPage({ params }: BookPageProps) {
  const { slug } = await params;

  const book = await prisma.book.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!book) {
    notFound();
  }

  // Generate FAQ schema
  const faqs = [
    {
      question: `Is ${book.title} free to read?`,
      answer:
        book.bookType === "free"
          ? `Yes! ${book.title} by ${
              book.author?.name || "the author"
            } is completely free to read online at Dynasty Academy.`
          : `${book.title} is a premium book available with a Dynasty Academy subscription.`,
    },
    {
      question: `Who wrote ${book.title}?`,
      answer: `${book.title} was written by ${
        book.author?.name || "Unknown Author"
      }${
        book.publicationYear ? ` and published in ${book.publicationYear}` : ""
      }.`,
    },
    {
      question: `What is ${book.title} about?`,
      answer: book.description,
    },
    {
      question: `How many pages is ${book.title}?`,
      answer: `${book.title} has ${
        book.totalPages || "approximately 100"
      } pages.`,
    },
    {
      question: `Can I read ${book.title} on mobile?`,
      answer: `Yes! ${book.title} is available on Dynasty Academy's mobile-optimized reader with AI-powered features.`,
    },
  ];

  // Generate complete schema
  const schema = AdvancedSchemaGenerator.generateCompleteSchema(
    book as any,
    faqs
  );

  return (
    <>
      {/* 🧠 SCHEMA.ORG STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Your existing book page component goes here */}
      {/* We'll keep the client component for interactivity */}
      <ClientBookPage bookSlug={slug} />
    </>
  );
}

/**
 * 🎨 CLIENT COMPONENT (Interactive features)
 * Import your existing client component here
 */
function ClientBookPage({ bookSlug }: { bookSlug: string }) {
  // This would be your existing client component
  // We're wrapping it to add server-side SEO
  return null; // Replace with your actual component
}
