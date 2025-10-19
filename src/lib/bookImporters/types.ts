// 📚 Book Import System - Type Definitions

export interface ImportedBook {
  title: string;
  description: string;
  author: string;
  coverImage?: string;
  category: string;
  tags: string[];
  language: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  totalPages?: number;
  externalId: string;
  externalData: any;
  contentUrl?: string;
  rating?: number;
}

export interface ImportOptions {
  category?: string;
  limit?: number;
  search?: string;
  language?: string;
  offset?: number;
}

export interface ImportProgress {
  total: number;
  imported: number;
  failed: number;
  skipped: number;
  status: "idle" | "importing" | "completed" | "error";
  currentBook?: string;
  errors: string[];
}

export abstract class BookImporter {
  abstract name: string;
  abstract source: string;

  abstract search(options: ImportOptions): Promise<ImportedBook[]>;
  abstract getBookContent(externalId: string): Promise<string | null>;

  // Utility to generate slug
  protected generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Utility to clean description
  protected cleanDescription(text: string, maxLength: number = 500): string {
    return text
      .replace(/<[^>]*>/g, "") // Remove HTML
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .substring(0, maxLength);
  }

  // Utility to extract tags from text
  protected extractTags(text: string, maxTags: number = 8): string[] {
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
    ]);
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];

    const wordFreq = new Map<string, number>();
    words.forEach((word) => {
      if (!commonWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTags)
      .map(([word]) => word);
  }

  // Categorize book based on subjects
  protected categorizeBook(subjects: string[]): string {
    const categoryMap: Record<string, string[]> = {
      Business: [
        "business",
        "entrepreneurship",
        "management",
        "marketing",
        "finance",
        "economics",
      ],
      "Self-Improvement": [
        "self-help",
        "motivation",
        "personal development",
        "success",
        "productivity",
      ],
      Psychology: [
        "psychology",
        "mental health",
        "cognitive",
        "behavior",
        "mind",
      ],
      Leadership: ["leadership", "management", "strategy", "executive"],
      Philosophy: ["philosophy", "ethics", "metaphysics", "logic"],
      Science: ["science", "physics", "chemistry", "biology", "astronomy"],
      History: ["history", "historical", "war", "civilization"],
      Fiction: ["fiction", "novel", "romance", "mystery", "thriller"],
      Technology: [
        "technology",
        "computer",
        "programming",
        "software",
        "internet",
      ],
    };

    const subjectsLower = subjects.map((s) => s.toLowerCase()).join(" ");

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some((keyword) => subjectsLower.includes(keyword))) {
        return category;
      }
    }

    return "General";
  }
}
