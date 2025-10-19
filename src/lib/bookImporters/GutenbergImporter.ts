// 📚 Project Gutenberg Importer
// API: https://gutendex.com (Modern Gutenberg API)

import { BookImporter, ImportedBook, ImportOptions } from "./types";

export class GutenbergImporter extends BookImporter {
  name = "Project Gutenberg";
  source = "gutenberg";
  private baseUrl = "https://gutendex.com/books";

  async search(options: ImportOptions = {}): Promise<ImportedBook[]> {
    try {
      const params = new URLSearchParams();

      if (options.search) {
        params.append("search", options.search);
      }

      if (options.language) {
        params.append("languages", options.language);
      }

      // Topic-based search if category provided
      if (options.category) {
        params.append("topic", options.category.toLowerCase());
      }

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Gutenberg API error: ${response.statusText}`);
      }

      const data = await response.json();
      const books: ImportedBook[] = [];

      for (const item of data.results.slice(0, options.limit || 50)) {
        try {
          const book = this.transformBook(item);
          if (book) {
            books.push(book);
          }
        } catch (error) {
          console.error(`Error transforming book ${item.id}:`, error);
        }
      }

      return books;
    } catch (error) {
      console.error("Gutenberg search error:", error);
      return [];
    }
  }

  async getBookContent(externalId: string): Promise<string | null> {
    try {
      // Gutenberg books are available as plain text
      const textUrl = `https://www.gutenberg.org/files/${externalId}/${externalId}-0.txt`;
      const response = await fetch(textUrl);

      if (response.ok) {
        return await response.text();
      }

      // Try alternative format
      const altUrl = `https://www.gutenberg.org/cache/epub/${externalId}/pg${externalId}.txt`;
      const altResponse = await fetch(altUrl);

      if (altResponse.ok) {
        return await altResponse.text();
      }

      return null;
    } catch (error) {
      console.error(
        `Error fetching Gutenberg content for ${externalId}:`,
        error
      );
      return null;
    }
  }

  private transformBook(item: any): ImportedBook | null {
    try {
      const author = item.authors?.[0]?.name || "Unknown Author";
      const subjects = item.subjects || [];
      const bookshelves = item.bookshelves || [];

      // Get best quality cover image
      const coverImage = item.formats?.["image/jpeg"] || null;

      // Extract description from subjects/bookshelves
      const description = this.generateDescription(
        item.title,
        author,
        subjects,
        bookshelves
      );

      // Get content URL (HTML or plain text)
      const contentUrl =
        item.formats?.["text/html"] ||
        item.formats?.["text/plain; charset=utf-8"] ||
        item.formats?.["text/plain"];

      return {
        title: item.title,
        description,
        author,
        coverImage,
        category: this.categorizeBook([...subjects, ...bookshelves]),
        tags: this.extractTags([...subjects, ...bookshelves].join(" "), 8),
        language: item.languages?.[0] || "en",
        isbn: undefined,
        publisher: "Project Gutenberg",
        publicationYear: this.extractYear(item.title) || undefined,
        totalPages: undefined, // Gutenberg doesn't provide page count
        externalId: item.id.toString(),
        externalData: item,
        contentUrl,
        rating: 4.0, // Default good rating for classics
      };
    } catch (error) {
      console.error("Error transforming Gutenberg book:", error);
      return null;
    }
  }

  private generateDescription(
    title: string,
    author: string,
    subjects: string[],
    bookshelves: string[]
  ): string {
    const categories = [...new Set([...subjects, ...bookshelves])]
      .slice(0, 3)
      .join(", ");

    return (
      `A classic work by ${author}. ${title} is a renowned literary piece that has stood the test of time. ` +
      `This public domain book from Project Gutenberg offers readers a chance to explore ${categories}. ` +
      `Perfect for students, scholars, and anyone interested in classic literature.`
    );
  }

  private extractYear(title: string): number | null {
    const yearMatch = title.match(/\b(1[6-9]\d{2}|20[0-2]\d)\b/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }
}
