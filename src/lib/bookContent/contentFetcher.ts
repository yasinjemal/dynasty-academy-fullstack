/**
 * 📚 BOOK CONTENT FETCHER
 *
 * Fetches full text content from public domain book sources.
 * Supports Project Gutenberg and Open Library formats.
 */

export interface FetchedContent {
  success: boolean;
  content?: string;
  error?: string;
  source: string;
  format: string;
  wordCount?: number;
}

export class BookContentFetcher {
  /**
   * Fetch content from Project Gutenberg book
   */
  static async fetchGutenbergContent(bookId: string): Promise<FetchedContent> {
    const mirrors = [
      `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`,
      `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`,
      `https://www.gutenberg.org/ebooks/${bookId}.txt.utf-8`,
    ];

    for (const url of mirrors) {
      try {
        console.log(`📖 Trying Gutenberg: ${url}`);
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Dynasty Academy Book Reader/1.0",
          },
        });

        if (response.ok) {
          const text = await response.text();
          const cleaned = this.cleanGutenbergText(text);

          if (cleaned && cleaned.length > 1000) {
            return {
              success: true,
              content: cleaned,
              source: "gutenberg",
              format: "text",
              wordCount: cleaned.split(/\s+/).length,
            };
          }
        }
      } catch (error) {
        console.error(`❌ Failed ${url}:`, error);
        continue;
      }
    }

    return {
      success: false,
      error: "Failed to fetch content from all Gutenberg mirrors",
      source: "gutenberg",
      format: "text",
    };
  }

  /**
   * Fetch content from Open Library book
   */
  static async fetchOpenLibraryContent(
    bookKey: string
  ): Promise<FetchedContent> {
    try {
      // Open Library provides read API
      const readApiUrl = `https://openlibrary.org${bookKey}.txt`;

      console.log(`📖 Trying Open Library: ${readApiUrl}`);
      const response = await fetch(readApiUrl, {
        headers: {
          "User-Agent": "Dynasty Academy Book Reader/1.0",
        },
      });

      if (response.ok) {
        const text = await response.text();
        const cleaned = this.cleanText(text);

        if (cleaned && cleaned.length > 1000) {
          return {
            success: true,
            content: cleaned,
            source: "openlibrary",
            format: "text",
            wordCount: cleaned.split(/\s+/).length,
          };
        }
      }

      // Try Internet Archive (many Open Library books are hosted there)
      const iaId = bookKey.replace("/works/", "").replace("/books/", "");
      const iaUrl = `https://archive.org/stream/${iaId}/${iaId}_djvu.txt`;

      console.log(`📖 Trying Internet Archive: ${iaUrl}`);
      const iaResponse = await fetch(iaUrl, {
        headers: {
          "User-Agent": "Dynasty Academy Book Reader/1.0",
        },
      });

      if (iaResponse.ok) {
        const text = await iaResponse.text();
        const cleaned = this.cleanText(text);

        if (cleaned && cleaned.length > 1000) {
          return {
            success: true,
            content: cleaned,
            source: "internet_archive",
            format: "text",
            wordCount: cleaned.split(/\s+/).length,
          };
        }
      }

      return {
        success: false,
        error: "No readable content found in Open Library or Internet Archive",
        source: "openlibrary",
        format: "text",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "openlibrary",
        format: "text",
      };
    }
  }

  /**
   * Clean Gutenberg-specific text (remove headers, footers, etc.)
   */
  private static cleanGutenbergText(text: string): string {
    // Remove Gutenberg header (everything before "*** START OF")
    const startMarkers = [
      "*** START OF THIS PROJECT GUTENBERG",
      "*** START OF THE PROJECT GUTENBERG",
      "***START OF THIS PROJECT GUTENBERG",
    ];

    let cleaned = text;
    for (const marker of startMarkers) {
      const startIndex = cleaned.indexOf(marker);
      if (startIndex !== -1) {
        // Find the end of the header line
        const lineEnd = cleaned.indexOf("\n", startIndex);
        if (lineEnd !== -1) {
          cleaned = cleaned.substring(lineEnd + 1);
        }
        break;
      }
    }

    // Remove Gutenberg footer (everything after "*** END OF")
    const endMarkers = [
      "*** END OF THIS PROJECT GUTENBERG",
      "*** END OF THE PROJECT GUTENBERG",
      "***END OF THIS PROJECT GUTENBERG",
    ];

    for (const marker of endMarkers) {
      const endIndex = cleaned.indexOf(marker);
      if (endIndex !== -1) {
        cleaned = cleaned.substring(0, endIndex);
        break;
      }
    }

    return this.cleanText(cleaned);
  }

  /**
   * General text cleaning
   */
  private static cleanText(text: string): string {
    return (
      text
        // Normalize line breaks
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // Remove excessive whitespace
        .replace(/\n{4,}/g, "\n\n\n")
        // Trim each line
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        // Remove leading/trailing whitespace
        .trim()
    );
  }

  /**
   * Generic content fetcher that tries appropriate method based on source
   */
  static async fetchContent(
    source: string,
    externalId: string,
    externalData?: any
  ): Promise<FetchedContent> {
    switch (source) {
      case "gutenberg":
        return this.fetchGutenbergContent(externalId);

      case "openlibrary":
        // Extract work key from external data
        const workKey = externalData?.key || externalId;
        return this.fetchOpenLibraryContent(workKey);

      case "google":
        return {
          success: false,
          error: "Google Books does not provide full text access via API",
          source: "google",
          format: "text",
        };

      default:
        return {
          success: false,
          error: `Unsupported source: ${source}`,
          source,
          format: "text",
        };
    }
  }
}
