/**
 * 📝 ADVANCED CONTENT FORMATTER
 *
 * Automatically formats book content with intelligent detection of:
 * - Chapter titles and headings
 * - Author attributions
 * - Bullet points and lists
 * - Numbered lists
 * - Block quotes
 * - Paragraphs with proper spacing
 * - Emphasis (bold/italic)
 *
 * Makes raw text look beautiful and professional!
 */

export interface FormattedContent {
  html: string;
  metadata: {
    hasChapters: boolean;
    hasBullets: boolean;
    hasNumberedLists: boolean;
    hasQuotes: boolean;
    wordCount: number;
  };
}

export class ContentFormatter {
  /**
   * Main formatting function - transforms raw text into beautiful HTML
   */
  static format(rawContent: string): FormattedContent {
    let html = rawContent;

    // Track what formatting was applied
    const metadata = {
      hasChapters: false,
      hasBullets: false,
      hasNumberedLists: false,
      hasQuotes: false,
      wordCount: rawContent.split(/\s+/).length,
    };

    // 1. Format chapter titles (CHAPTER I, Chapter 1, CHAPTER ONE, etc.)
    html = this.formatChapters(html);
    metadata.hasChapters = /CHAPTER|Chapter/.test(html);

    // 2. Format section headings (ALL CAPS lines)
    html = this.formatHeadings(html);

    // 3. Format numbered lists (1., 2., 3. or 1), 2), 3))
    html = this.formatNumberedLists(html);
    metadata.hasNumberedLists = /\d+\.|numbered-list/.test(html);

    // 4. Format bullet points (*, -, •)
    html = this.formatBulletPoints(html);
    metadata.hasBullets = /bullet-list/.test(html);

    // 5. Format block quotes (lines starting with > or indented)
    html = this.formatQuotes(html);
    metadata.hasQuotes = /blockquote/.test(html);

    // 6. Format author attributions (— Author Name, -Author Name)
    html = this.formatAuthors(html);

    // 7. Format emphasis (*italic*, **bold**, _italic_)
    html = this.formatEmphasis(html);

    // 8. Format paragraphs with proper spacing
    html = this.formatParagraphs(html);

    return { html, metadata };
  }

  /**
   * Format chapter titles with beautiful styling
   */
  private static formatChapters(content: string): string {
    // Match patterns like:
    // CHAPTER I, CHAPTER 1, Chapter One, CHAPTER THE FIRST
    const chapterRegex =
      /^(CHAPTER|Chapter)\s+([IVXLCDM]+|\d+|[A-Z][a-z]+|THE\s+[A-Z]+)[\s]*$/gm;

    return content.replace(chapterRegex, (match) => {
      return `<h2 class="chapter-title">${match.trim()}</h2>`;
    });
  }

  /**
   * Format section headings (all caps lines)
   */
  private static formatHeadings(content: string): string {
    // Match lines that are ALL CAPS and under 100 characters (likely headings)
    const headingRegex = /^([A-Z][A-Z\s]{2,99})$/gm;

    return content.replace(headingRegex, (match) => {
      // Don't format if it's already a chapter
      if (match.includes("CHAPTER")) return match;

      return `<h3 class="section-heading">${match.trim()}</h3>`;
    });
  }

  /**
   * Format numbered lists
   */
  private static formatNumberedLists(content: string): string {
    const lines = content.split("\n");
    const result: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if line starts with number followed by . or )
      const isNumberedItem = /^\d+[\.\)]\s+/.test(trimmed);

      if (isNumberedItem) {
        if (!inList) {
          result.push('<ol class="numbered-list">');
          inList = true;
        }

        // Remove the number and format as list item
        const content = trimmed.replace(/^\d+[\.\)]\s+/, "");
        result.push(`<li class="numbered-item">${content}</li>`);
      } else {
        if (inList && trimmed === "") {
          result.push("</ol>");
          inList = false;
        }
        result.push(line);
      }
    }

    if (inList) {
      result.push("</ol>");
    }

    return result.join("\n");
  }

  /**
   * Format bullet points
   */
  private static formatBulletPoints(content: string): string {
    const lines = content.split("\n");
    const result: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if line starts with bullet character
      const isBulletItem = /^[\*\-\•]\s+/.test(trimmed);

      if (isBulletItem) {
        if (!inList) {
          result.push('<ul class="bullet-list">');
          inList = true;
        }

        // Remove the bullet and format as list item
        const content = trimmed.replace(/^[\*\-\•]\s+/, "");
        result.push(`<li class="bullet-item">${content}</li>`);
      } else {
        if (inList && trimmed === "") {
          result.push("</ul>");
          inList = false;
        }
        result.push(line);
      }
    }

    if (inList) {
      result.push("</ul>");
    }

    return result.join("\n");
  }

  /**
   * Format block quotes
   */
  private static formatQuotes(content: string): string {
    const lines = content.split("\n");
    const result: string[] = [];
    let inQuote = false;
    let quoteLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if line starts with > or is heavily indented
      const isQuoteLine =
        trimmed.startsWith(">") || (/^\s{4,}/.test(line) && trimmed.length > 0);

      if (isQuoteLine) {
        if (!inQuote) {
          inQuote = true;
        }

        // Remove quote character and excess indentation
        const cleaned = trimmed.replace(/^>\s*/, "").trim();
        if (cleaned) {
          quoteLines.push(cleaned);
        }
      } else {
        if (inQuote && quoteLines.length > 0) {
          result.push(
            `<blockquote class="book-quote">${quoteLines.join(
              " "
            )}</blockquote>`
          );
          quoteLines = [];
          inQuote = false;
        }
        result.push(line);
      }
    }

    // Close any remaining quote
    if (inQuote && quoteLines.length > 0) {
      result.push(
        `<blockquote class="book-quote">${quoteLines.join(" ")}</blockquote>`
      );
    }

    return result.join("\n");
  }

  /**
   * Format author attributions
   */
  private static formatAuthors(content: string): string {
    // Match patterns like "— Author Name" or "- Author Name" at end of paragraphs
    const authorRegex = /^[\s]*(—|-)\s*([A-Z][a-zA-Z\s\.]+)$/gm;

    return content.replace(authorRegex, (match, dash, author) => {
      return `<p class="author-attribution">${dash} ${author.trim()}</p>`;
    });
  }

  /**
   * Format emphasis (bold/italic)
   */
  private static formatEmphasis(content: string): string {
    let formatted = content;

    // Bold: **text** or __text__
    formatted = formatted.replace(
      /\*\*(.+?)\*\*|__(.+?)__/g,
      '<strong class="text-bold">$1$2</strong>'
    );

    // Italic: *text* or _text_ (but not in URLs or markdown artifacts)
    formatted = formatted.replace(
      /(?<![*_])\*([^*]+?)\*(?![*_])|(?<![*_])_([^_]+?)_(?![*_])/g,
      '<em class="text-italic">$1$2</em>'
    );

    return formatted;
  }

  /**
   * Format paragraphs with proper spacing
   */
  private static formatParagraphs(content: string): string {
    // Split by double newlines to identify paragraphs
    const paragraphs = content.split(/\n\n+/);

    return paragraphs
      .map((para) => {
        const trimmed = para.trim();

        // Skip if empty
        if (!trimmed) return "";

        // Skip if already formatted (has HTML tags)
        if (/<\/?(h[1-6]|ul|ol|blockquote|p|li)/.test(trimmed)) {
          return trimmed;
        }

        // Wrap in paragraph tags
        return `<p class="book-paragraph">${trimmed}</p>`;
      })
      .filter((p) => p)
      .join("\n\n");
  }

  /**
   * Clean up any formatting artifacts from source text
   */
  static clean(content: string): string {
    return content
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\t/g, "  ") // Convert tabs to spaces
      .replace(/\n{4,}/g, "\n\n\n") // Max 3 consecutive newlines
      .trim();
  }
}

/**
 * 🎨 CSS CLASSES FOR FORMATTED CONTENT
 *
 * Add these to your global CSS or component:
 */
export const formatterStyles = `
  .chapter-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin: 3rem 0 2rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-heading {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
    letter-spacing: 0.025em;
    color: #4a5568;
  }

  .numbered-list {
    margin: 1.5rem 0;
    padding-left: 2rem;
    counter-reset: item;
  }

  .numbered-item {
    margin: 0.75rem 0;
    line-height: 1.8;
    position: relative;
  }

  .numbered-item::marker {
    color: #667eea;
    font-weight: 600;
  }

  .bullet-list {
    margin: 1.5rem 0;
    padding-left: 2rem;
  }

  .bullet-item {
    margin: 0.75rem 0;
    line-height: 1.8;
  }

  .bullet-item::marker {
    color: #667eea;
  }

  .book-quote {
    margin: 2rem 0;
    padding: 1.5rem 2rem;
    border-left: 4px solid #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-radius: 0.5rem;
    font-style: italic;
    color: #4a5568;
  }

  .author-attribution {
    text-align: right;
    font-style: italic;
    color: #718096;
    margin: 1rem 0;
    font-size: 0.95em;
  }

  .text-bold {
    font-weight: 600;
    color: inherit;
  }

  .text-italic {
    font-style: italic;
    color: inherit;
  }

  .book-paragraph {
    margin: 1.25rem 0;
    line-height: inherit;
    text-align: justify;
    hyphens: auto;
  }

  /* Dark theme variants */
  .dark .section-heading {
    color: #cbd5e0;
  }

  .dark .book-quote {
    border-left-color: #9f7aea;
    background: rgba(159, 122, 234, 0.1);
    color: #e2e8f0;
  }

  .dark .author-attribution {
    color: #a0aec0;
  }
`;
