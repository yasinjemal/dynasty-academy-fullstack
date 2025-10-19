// 📚 Google Books Importer
// API: https://developers.google.com/books/docs/v1/using

import { BookImporter, ImportedBook, ImportOptions } from "./types";

export class GoogleBooksImporter extends BookImporter {
  name = "Google Books";
  source = "google";
  private baseUrl = "https://www.googleapis.com/books/v1/volumes";
  private apiKey = process.env.GOOGLE_BOOKS_API_KEY || ""; // Optional but recommended

  async search(options: ImportOptions = {}): Promise<ImportedBook[]> {
    try {
      const params = new URLSearchParams();

      // Build search query
      let query = "";
      if (options.search) {
        query = options.search;
      } else if (options.category) {
        query = `subject:${options.category.toLowerCase()}`;
      } else {
        query = "subject:business OR subject:self-help OR subject:psychology";
      }

      params.append("q", query);
      params.append("maxResults", Math.min(options.limit || 40, 40).toString()); // API max is 40
      params.append("startIndex", (options.offset || 0).toString());
      params.append("printType", "books");
      params.append("orderBy", "relevance");

      if (options.language) {
        params.append("langRestrict", options.language);
      }

      if (this.apiKey) {
        params.append("key", this.apiKey);
      }

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.statusText}`);
      }

      const data = await response.json();
      const books: ImportedBook[] = [];

      for (const item of data.items || []) {
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
      console.error("Google Books search error:", error);
      return [];
    }
  }

  async getBookContent(externalId: string): Promise<string | null> {
    try {
      // Google Books provides preview/sample content
      const url = this.apiKey
        ? `${this.baseUrl}/${externalId}?key=${this.apiKey}`
        : `${this.baseUrl}/${externalId}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        // Return description as preview content
        return data.volumeInfo?.description || null;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Google Books content:`, error);
      return null;
    }
  }

  private transformBook(item: any): ImportedBook | null {
    try {
      const volumeInfo = item.volumeInfo;

      // Skip books without essential info
      if (!volumeInfo?.title) {
        return null;
      }

      const author = volumeInfo.authors?.[0] || "Unknown Author";
      const categories = volumeInfo.categories || [];

      // Get best quality cover image
      const imageLinks = volumeInfo.imageLinks;
      const coverImage =
        imageLinks?.extraLarge ||
        imageLinks?.large ||
        imageLinks?.medium ||
        imageLinks?.small ||
        imageLinks?.thumbnail ||
        undefined;

      // Description
      const description =
        volumeInfo.description ||
        this.generateDescription(volumeInfo.title, author, categories);

      // ISBN
      const isbn = volumeInfo.industryIdentifiers?.find(
        (id: any) => id.type === "ISBN_13" || id.type === "ISBN_10"
      )?.identifier;

      // Publication year
      const publicationYear = this.extractYear(volumeInfo.publishedDate);

      // Rating from Google Books
      const rating = volumeInfo.averageRating || 3.5;

      // Get preview link
      const previewLink =
        item.accessInfo?.webReaderLink ||
        volumeInfo.previewLink ||
        volumeInfo.infoLink;

      return {
        title: volumeInfo.title,
        description: this.cleanDescription(description, 500),
        author,
        coverImage: coverImage?.replace("http://", "https://"), // Force HTTPS
        category: this.categorizeBook(categories),
        tags: this.extractTags(
          [...categories, ...(volumeInfo.mainCategory || [])].join(" "),
          8
        ),
        language: volumeInfo.language || "en",
        isbn,
        publisher: volumeInfo.publisher,
        publicationYear,
        totalPages: volumeInfo.pageCount,
        externalId: item.id,
        externalData: item,
        contentUrl: previewLink,
        rating: Math.min(5, Math.max(1, rating)),
      };
    } catch (error) {
      console.error("Error transforming Google Books item:", error);
      return null;
    }
  }

  private generateDescription(
    title: string,
    author: string,
    categories: string[]
  ): string {
    if (categories.length === 0) {
      return `${title} by ${author}. A comprehensive work available through Google Books. This book provides valuable knowledge and insights for readers seeking to expand their understanding.`;
    }

    const categoryList = categories.slice(0, 2).join(" and ");
    return `${title} by ${author} delves into ${categoryList}. This engaging work offers readers a deep exploration of the subject matter, providing both practical insights and theoretical knowledge. A must-read for anyone interested in ${categories[0].toLowerCase()}.`;
  }

  private extractYear(dateString?: string): number | undefined {
    if (!dateString) return undefined;
    const yearMatch = dateString.match(/\b(\d{4})\b/);
    return yearMatch ? parseInt(yearMatch[1]) : undefined;
  }
}
