interface ExtractedPage {
  pageNumber: number;
  text: string;
  wordCount: number;
}

interface PDFExtractionResult {
  success: boolean;
  totalPages: number;
  pages: ExtractedPage[];
  fullText: string;
  totalWords: number;
  title?: string;
  author?: string;
  subject?: string;
  error?: string;
}

/**
 * Extract text content from a PDF buffer using pdf-parse
 * @param pdfBuffer - Buffer containing the PDF file
 * @returns Promise with extracted text and metadata
 */
export async function extractPDFText(
  pdfBuffer: Buffer | Uint8Array
): Promise<PDFExtractionResult> {
  try {
    // Convert Uint8Array to Buffer if needed
    const buffer =
      pdfBuffer instanceof Buffer ? pdfBuffer : Buffer.from(pdfBuffer);

    // Dynamically import pdf-parse (works better with CommonJS modules in Next.js)
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    // Extract text and metadata
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

    // Extract metadata
    const title = infoResult.info?.Title || undefined;
    const author = infoResult.info?.Author || undefined;
    const subject = infoResult.info?.Subject || undefined;

    const totalPages = textResult.total;
    const fullText = textResult.text;

    // Extract individual pages from the text result
    const pages: ExtractedPage[] = textResult.pages.map((pageData: any) => {
      const pageText = pageData.text || "";
      const pageWords = pageText
        .split(/\s+/)
        .filter((w: string) => w.length > 0);

      return {
        pageNumber: pageData.num,
        text: pageText,
        wordCount: pageWords.length,
      };
    });

    const totalWords = fullText
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;

    return {
      success: true,
      totalPages,
      pages,
      fullText: fullText.trim(),
      totalWords,
      title,
      author,
      subject,
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      success: false,
      totalPages: 0,
      pages: [],
      fullText: "",
      totalWords: 0,
      error:
        error instanceof Error ? error.message : "Failed to extract PDF text",
    };
  }
}

/**
 * Extract text from a single page
 * @param pdfBuffer - Buffer containing the PDF file
 * @param pageNumber - Page number to extract (1-indexed)
 * @returns Promise with page text
 */
export async function extractPDFPage(
  pdfBuffer: Buffer | Uint8Array,
  pageNumber: number
): Promise<string> {
  try {
    const result = await extractPDFText(pdfBuffer);

    if (!result.success) {
      throw new Error(result.error || "PDF extraction failed");
    }

    const page = result.pages.find((p) => p.pageNumber === pageNumber);

    if (!page) {
      throw new Error(`Page ${pageNumber} not found`);
    }

    return page.text;
  } catch (error) {
    console.error("PDF page extraction error:", error);
    throw error;
  }
}

/**
 * Format extracted text into readable pages for display
 * @param fullText - Complete extracted text
 * @param wordsPerPage - Approximate words per page
 * @returns Array of formatted page texts
 */
export function formatTextIntoPages(
  fullText: string,
  wordsPerPage: number = 250
): string[] {
  const words = fullText.split(/\s+/);
  const pages: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerPage) {
    const pageWords = words.slice(i, i + wordsPerPage);
    pages.push(pageWords.join(" "));
  }

  return pages;
}
