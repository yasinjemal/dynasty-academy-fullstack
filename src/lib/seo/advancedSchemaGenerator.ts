/**
 * 🧠 SCHEMA.ORG ON ABSOLUTE STEROIDS
 *
 * Triple-nested structured data that dominates:
 * - Rich snippets (star ratings, images)
 * - Knowledge panels (author info, book details)
 * - Featured snippets ("People also ask")
 * - Carousels (related books)
 * - Review snippets
 * - FAQ snippets
 *
 * This is MAXIMUM SERP real estate occupation!
 */

interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: { name: string; bio?: string; image?: string };
  coverImage?: string;
  rating?: number;
  reviewCount: number;
  price: number;
  totalPages?: number;
  language?: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  category: string;
  tags: string[];
  createdAt: Date;
}

interface FAQItem {
  question: string;
  answer: string;
}

export class AdvancedSchemaGenerator {
  /**
   * 🚀 Generate ALL schema types for maximum SERP domination
   */
  static generateCompleteSchema(book: Book, faqs?: FAQItem[]) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        // 1. Book Schema (Rich Snippets)
        this.generateBookSchema(book),

        // 2. WebPage Schema (Page-level SEO)
        this.generateWebPageSchema(book),

        // 3. BreadcrumbList (Navigation)
        this.generateBreadcrumbSchema(book),

        // 4. Person Schema (Author authority)
        this.generateAuthorSchema(book.author),

        // 5. Organization Schema (Brand trust)
        this.generateOrganizationSchema(),

        // 6. Review Schema (Social proof)
        book.reviewCount > 0 ? this.generateReviewSchema(book) : null,

        // 7. FAQ Schema (Featured snippets)
        faqs && faqs.length > 0 ? this.generateFAQSchema(faqs) : null,

        // 8. ItemList Schema (Related books carousel)
        this.generateItemListSchema(book),

        // 9. ReadAction Schema (Direct reading links)
        this.generateReadActionSchema(book),
      ].filter(Boolean),
    };
  }

  /**
   * 📚 Book Schema
   */
  private static generateBookSchema(book: Book) {
    return {
      "@type": "Book",
      "@id": `https://dynasty-academy.com/books/${book.slug}#book`,
      name: book.title,
      url: `https://dynasty-academy.com/books/${book.slug}`,
      image:
        book.coverImage || "https://dynasty-academy.com/default-book-cover.jpg",
      author: {
        "@type": "Person",
        "@id": `https://dynasty-academy.com/authors/${book.author.name
          .toLowerCase()
          .replace(/\s+/g, "-")}#person`,
        name: book.author.name,
      },
      publisher: {
        "@type": "Organization",
        name: book.publisher || "Dynasty Academy",
        logo: "https://dynasty-academy.com/logo.png",
      },
      datePublished: book.publicationYear
        ? `${book.publicationYear}-01-01`
        : undefined,
      description: book.description,
      isbn: book.isbn,
      numberOfPages: book.totalPages,
      inLanguage: book.language || "en",
      genre: book.category,
      keywords: book.tags.join(", "),
      aggregateRating:
        book.rating && book.reviewCount > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: book.rating,
              reviewCount: book.reviewCount,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      offers: {
        "@type": "Offer",
        price: book.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `https://dynasty-academy.com/books/${book.slug}`,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    };
  }

  /**
   * 🌐 WebPage Schema
   */
  private static generateWebPageSchema(book: Book) {
    return {
      "@type": "WebPage",
      "@id": `https://dynasty-academy.com/books/${book.slug}#webpage`,
      url: `https://dynasty-academy.com/books/${book.slug}`,
      name: `${book.title} - Read Online | Dynasty Academy`,
      description: book.description,
      isPartOf: {
        "@id": "https://dynasty-academy.com/#website",
      },
      about: {
        "@id": `https://dynasty-academy.com/books/${book.slug}#book`,
      },
      datePublished: book.createdAt.toISOString(),
      dateModified: book.createdAt.toISOString(),
      inLanguage: book.language || "en",
      potentialAction: {
        "@type": "ReadAction",
        target: `https://dynasty-academy.com/books/${book.slug}/read`,
        name: `Read ${book.title}`,
      },
    };
  }

  /**
   * 🍞 Breadcrumb Schema
   */
  private static generateBreadcrumbSchema(book: Book) {
    return {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://dynasty-academy.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Books",
          item: "https://dynasty-academy.com/books",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: book.category,
          item: `https://dynasty-academy.com/books/category/${book.category.toLowerCase()}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: book.title,
          item: `https://dynasty-academy.com/books/${book.slug}`,
        },
      ],
    };
  }

  /**
   * 👤 Author/Person Schema (Authority signal)
   */
  private static generateAuthorSchema(author: {
    name: string;
    bio?: string;
    image?: string;
  }) {
    return {
      "@type": "Person",
      "@id": `https://dynasty-academy.com/authors/${author.name
        .toLowerCase()
        .replace(/\s+/g, "-")}#person`,
      name: author.name,
      description: author.bio || `${author.name} is a renowned author.`,
      image: author.image || "https://dynasty-academy.com/default-author.jpg",
      sameAs: [
        `https://en.wikipedia.org/wiki/${author.name.replace(/\s+/g, "_")}`,
        `https://www.goodreads.com/author/show/${author.name}`,
      ],
    };
  }

  /**
   * 🏢 Organization Schema (Brand authority)
   */
  private static generateOrganizationSchema() {
    return {
      "@type": "Organization",
      "@id": "https://dynasty-academy.com/#organization",
      name: "Dynasty Academy",
      url: "https://dynasty-academy.com",
      logo: {
        "@type": "ImageObject",
        url: "https://dynasty-academy.com/logo.png",
        width: 600,
        height: 60,
      },
      description:
        "The most luxurious online reading platform with AI-powered features.",
      sameAs: [
        "https://twitter.com/dynastyacademy",
        "https://facebook.com/dynastyacademy",
        "https://instagram.com/dynastyacademy",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "support@dynasty-academy.com",
      },
    };
  }

  /**
   * ⭐ Review Schema (Social proof)
   */
  private static generateReviewSchema(book: Book) {
    return {
      "@type": "Review",
      itemReviewed: {
        "@id": `https://dynasty-academy.com/books/${book.slug}#book`,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: book.rating || 4.5,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        "@type": "Organization",
        name: "Dynasty Academy Readers",
      },
      reviewBody: `Readers love ${book.title} on Dynasty Academy.`,
    };
  }

  /**
   * ❓ FAQ Schema (Featured snippets)
   */
  private static generateFAQSchema(faqs: FAQItem[]) {
    return {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  /**
   * 📋 ItemList Schema (Related books carousel)
   */
  private static generateItemListSchema(book: Book) {
    return {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": `https://dynasty-academy.com/books/${book.slug}#book`,
          },
        },
      ],
    };
  }

  /**
   * 📖 ReadAction Schema (Direct reading link)
   */
  private static generateReadActionSchema(book: Book) {
    return {
      "@type": "ReadAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://dynasty-academy.com/books/${book.slug}/read`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      object: {
        "@id": `https://dynasty-academy.com/books/${book.slug}#book`,
      },
      expectsAcceptanceOf: {
        "@type": "Offer",
        price: book.price,
        priceCurrency: "USD",
      },
    };
  }
}
