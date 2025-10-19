/**
 * 📄 BOOK PAGINATOR
 *
 * Splits book content into pages for the luxury reader.
 * Intelligent splitting that respects paragraphs and sentences.
 */

export interface BookPage {
  pageNumber: number;
  content: string;
  wordCount: number;
  charCount: number;
}

export interface PaginationResult {
  pages: BookPage[];
  totalPages: number;
  totalWords: number;
  totalChars: number;
}

export class BookPaginator {
  // Target words per page (adjust for reading comfort)
  private static readonly MIN_WORDS_PER_PAGE = 400;
  private static readonly MAX_WORDS_PER_PAGE = 800;
  private static readonly TARGET_WORDS_PER_PAGE = 600;

  /**
   * Paginate book content into readable pages
   */
  static paginate(content: string): PaginationResult {
    const pages: BookPage[] = [];
    const paragraphs = this.splitIntoParagraphs(content);

    let currentPage = "";
    let currentWordCount = 0;
    let pageNumber = 1;

    for (const paragraph of paragraphs) {
      const paragraphWords = paragraph.split(/\s+/).length;

      // If adding this paragraph would exceed max words, save current page
      if (
        currentWordCount > 0 &&
        currentWordCount + paragraphWords > this.MAX_WORDS_PER_PAGE
      ) {
        // Only save if we have at least minimum words
        if (currentWordCount >= this.MIN_WORDS_PER_PAGE) {
          pages.push(this.createPage(pageNumber++, currentPage));
          currentPage = paragraph;
          currentWordCount = paragraphWords;
        } else {
          // Add paragraph anyway if current page is too small
          currentPage += "\n\n" + paragraph;
          currentWordCount += paragraphWords;
        }
      } else {
        // Add paragraph to current page
        if (currentPage) {
          currentPage += "\n\n" + paragraph;
        } else {
          currentPage = paragraph;
        }
        currentWordCount += paragraphWords;
      }

      // If we've hit target words, consider starting new page at next paragraph
      if (currentWordCount >= this.TARGET_WORDS_PER_PAGE) {
        pages.push(this.createPage(pageNumber++, currentPage));
        currentPage = "";
        currentWordCount = 0;
      }
    }

    // Add remaining content as final page
    if (currentPage.trim()) {
      pages.push(this.createPage(pageNumber, currentPage));
    }

    const totalWords = pages.reduce((sum, p) => sum + p.wordCount, 0);
    const totalChars = pages.reduce((sum, p) => sum + p.charCount, 0);

    console.log(
      `📊 Pagination complete: ${pages.length} pages, ${totalWords} words`
    );

    return {
      pages,
      totalPages: pages.length,
      totalWords,
      totalChars,
    };
  }

  /**
   * Split content into paragraphs
   */
  private static splitIntoParagraphs(content: string): string[] {
    return content
      .split(/\n\s*\n/) // Split on double line breaks
      .map((p) => p.trim())
      .filter((p) => p.length > 0); // Remove empty paragraphs
  }

  /**
   * Create a page object
   */
  private static createPage(pageNumber: number, content: string): BookPage {
    const trimmed = content.trim();
    return {
      pageNumber,
      content: trimmed,
      wordCount: trimmed.split(/\s+/).length,
      charCount: trimmed.length,
    };
  }

  /**
   * Get a specific page from paginated content
   */
  static getPage(pages: BookPage[], pageNumber: number): BookPage | null {
    return pages.find((p) => p.pageNumber === pageNumber) || null;
  }

  /**
   * Get statistics about paginated content
   */
  static getStats(pages: BookPage[]): {
    avgWordsPerPage: number;
    avgCharsPerPage: number;
    minWords: number;
    maxWords: number;
  } {
    if (pages.length === 0) {
      return {
        avgWordsPerPage: 0,
        avgCharsPerPage: 0,
        minWords: 0,
        maxWords: 0,
      };
    }

    const totalWords = pages.reduce((sum, p) => sum + p.wordCount, 0);
    const totalChars = pages.reduce((sum, p) => sum + p.charCount, 0);
    const wordCounts = pages.map((p) => p.wordCount);

    return {
      avgWordsPerPage: Math.round(totalWords / pages.length),
      avgCharsPerPage: Math.round(totalChars / pages.length),
      minWords: Math.min(...wordCounts),
      maxWords: Math.max(...wordCounts),
    };
  }
}
