// 📚 Open Library Importer
// API: https://openlibrary.org/developers/api

import { BookImporter, ImportedBook, ImportOptions } from "./types";

export class OpenLibraryImporter extends BookImporter {
  name = "Open Library";
  source = "openlibrary";
  private baseUrl = "https://openlibrary.org";

  async search(options: ImportOptions = {}): Promise<ImportedBook[]> {
    try {
      const params = new URLSearchParams();

      if (options.search) {
        params.append("q", options.search);
      } else if (options.category) {
        params.append("subject", options.category.toLowerCase());
      } else {
        params.append(
          "q",
          "subject:business OR subject:self-help OR subject:philosophy"
        );
      }

      if (options.language) {
        params.append("language", options.language);
      }

      params.append("limit", (options.limit || 50).toString());
      params.append("offset", (options.offset || 0).toString());

      const url = `${this.baseUrl}/search.json?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Open Library API error: ${response.statusText}`);
      }

      const data = await response.json();
      const books: ImportedBook[] = [];

      for (const item of data.docs || []) {
        try {
          const book = this.transformBook(item);
          if (book) {
            books.push(book);
          }
        } catch (error) {
          console.error(`Error transforming book:`, error);
        }
      }

      return books;
    } catch (error) {
      console.error("Open Library search error:", error);
      return [];
    }
  }

  async getBookContent(externalId: string): Promise<string | null> {
    try {
      // Open Library provides limited full-text access
      // We'll store the reading URL instead
      const response = await fetch(`${this.baseUrl}/works/${externalId}.json`);

      if (response.ok) {
        const data = await response.json();
        return JSON.stringify(
          data.description || "Content available on Open Library"
        );
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Open Library content:`, error);
      return null;
    }
  }

  private transformBook(item: any): ImportedBook | null {
    try {
      // Skip books without basic info
      if (!item.title || !item.key) {
        return null;
      }

      const author = item.author_name?.[0] || "Unknown Author";
      const subjects = item.subject || [];

      // Get cover image (various sizes available)
      const coverId = item.cover_i;
      const coverImage = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : null;

      // First sentence or description
      const description =
        item.first_sentence?.[0] ||
        this.generateDescription(item.title, author, subjects.slice(0, 3));

      // Extract ISBN
      const isbn = item.isbn?.[0] || item.isbn_13?.[0] || item.isbn_10?.[0];

      // Extract publication year
      const publicationYear = item.first_publish_year || undefined;

      // Get work ID for content fetching
      const workId = item.key.replace("/works/", "");

      // Calculate rating from ratings data
      const rating =
        item.ratings_average ||
        (item.want_to_read_count && item.currently_reading_count
          ? Math.min(5, 3 + item.want_to_read_count / 1000)
          : 3.5);

      return {
        title: item.title,
        description: this.cleanDescription(description, 500),
        author,
        coverImage: coverImage || undefined,
        category: this.categorizeBook(subjects),
        tags: this.extractTags(subjects.join(" "), 8),
        language: item.language?.[0] || "en",
        isbn,
        publisher: item.publisher?.[0] || "Open Library",
        publicationYear,
        totalPages: item.number_of_pages_median || undefined,
        externalId: workId,
        externalData: item,
        contentUrl: `${this.baseUrl}${item.key}`,
        rating: Math.min(5, Math.max(1, rating)),
      };
    } catch (error) {
      console.error("Error transforming Open Library book:", error);
      return null;
    }
  }

  private generateDescription(
    title: string,
    author: string,
    subjects: string[]
  ): string {
    if (subjects.length === 0) {
      return `${title} by ${author}. A comprehensive work available through Open Library's extensive digital collection. This book offers valuable insights and knowledge for readers interested in expanding their literary horizons.`;
    }

    const subjectList = subjects.slice(0, 3).join(", ");
    return `${title} by ${author} explores ${subjectList}. This engaging work is part of Open Library's vast collection, offering readers access to quality literature. Perfect for anyone interested in ${subjects[0].toLowerCase()}.`;
  }
}
