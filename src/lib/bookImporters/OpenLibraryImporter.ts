// 📚 Open Library Importer
// API: https://openlibrary.org/developers/api

import { BookImporter, ImportedBook, ImportOptions } from "./types";

export class OpenLibraryImporter extends BookImporter {
  name = "Open Library";
  source = "openlibrary";
  private baseUrl = "https://openlibrary.org";

  /**
   * Convert category name to Open Library subject slug
   * "Self Improvement" → "self_improvement"
   */
  private subjectSlug(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, "_");
  }

  async search(options: ImportOptions = {}): Promise<ImportedBook[]> {
    try {
      const limit = options.limit || 50;
      const headers = {
        "User-Agent": "DynastyAcademy/1.0 (+https://dynasty-academy.com)",
        Accept: "application/json",
      };

      const urls: string[] = [];
      let docs: any[] = [];
      let urlTried = "";

      // STRATEGY 1: Try SUBJECTS API first if category is set
      // This is the most reliable way to get books by category
      if (options.category) {
        const slug = this.subjectSlug(options.category);
        const subjectUrl = `${this.baseUrl}/subjects/${encodeURIComponent(
          slug
        )}.json?limit=${limit}&details=true`;
        urls.push(subjectUrl);

        console.log(`🔍 Open Library SUBJECTS API: ${subjectUrl}`);
        const response = await fetch(subjectUrl, { headers });

        if (response.ok) {
          const data = await response.json();
          docs = data.works || [];
          urlTried = subjectUrl;
          console.log(
            `📚 Subjects API returned ${docs.length} books for "${options.category}"`
          );

          if (docs.length > 0) {
            return this.transformSubjectsResponse(docs);
          }
        } else {
          console.warn(
            `⚠️ Subjects API failed for "${options.category}": ${response.statusText}`
          );
        }
      }

      // STRATEGY 2: Try SEARCH API with has_fulltext filter
      // This ensures we only get books with readable text
      const searchQuery =
        options.search || options.category || "philosophy business psychology";
      const params = new URLSearchParams({
        q: searchQuery,
        has_fulltext: "true",
        language: options.language || "eng",
        limit: limit.toString(),
      });

      // Optional: bias towards public domain scans
      if (!options.search) {
        params.append("public_scan_b", "true");
      }

      const searchUrl = `${this.baseUrl}/search.json?${params.toString()}`;
      urls.push(searchUrl);

      console.log(`🔍 Open Library SEARCH API: ${searchUrl}`);
      const searchResponse = await fetch(searchUrl, { headers });

      if (!searchResponse.ok) {
        throw new Error(`Open Library API error: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      docs = searchData.docs || [];
      urlTried = searchUrl;

      console.log(
        `📚 Search API returned ${searchData.numFound || 0} total results, ${
          docs.length
        } in this batch`
      );

      // STRATEGY 3: Last resort - drop all filters and try plain search
      if (docs.length === 0) {
        console.warn(
          `⚠️ No results with filters, trying plain search for "${searchQuery}"`
        );
        const fallbackUrl = `${this.baseUrl}/search.json?q=${encodeURIComponent(
          searchQuery
        )}&limit=${limit}`;
        const fallbackResponse = await fetch(fallbackUrl, { headers });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          docs = fallbackData.docs || [];
          urlTried = fallbackUrl;
          console.log(
            `📚 Fallback search returned ${docs.length} books (no filters)`
          );
        }
      }

      if (docs.length === 0) {
        console.warn(
          `❌ Open Library returned 0 results for all strategies. Last URL: ${urlTried}`
        );
        return [];
      }

      // Transform search results
      const books: ImportedBook[] = [];
      for (const item of docs) {
        try {
          const book = this.transformBook(item);
          if (book) {
            books.push(book);
          }
        } catch (error) {
          console.error(`Error transforming book:`, error);
        }
      }

      console.log(
        `✅ Successfully transformed ${books.length} books from Open Library`
      );
      return books;
    } catch (error) {
      console.error("Open Library search error:", error);
      return [];
    }
  }

  /**
   * Transform subjects API response (different structure than search API)
   */
  private transformSubjectsResponse(works: any[]): ImportedBook[] {
    const books: ImportedBook[] = [];

    for (const work of works) {
      try {
        // Subjects API has a slightly different structure
        const item = {
          title: work.title,
          key: work.key,
          author_name: work.authors?.map((a: any) => a.name) || [],
          first_publish_year: work.first_publish_year,
          cover_id: work.cover_id,
          subject: work.subject || [],
          language: ["eng"], // Subjects API doesn't return language
          isbn: [],
          publisher: [],
          first_sentence: [],
          number_of_pages_median: work.lending_edition_s
            ? undefined
            : undefined,
        };

        const book = this.transformBook(item);
        if (book) {
          books.push(book);
        }
      } catch (error) {
        console.error(`Error transforming subjects work:`, error);
      }
    }

    return books;
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
