import mammoth from "mammoth";
import { promisify } from "util";

interface ExtractedPage {
  pageNumber: number;
  text: string;
  wordCount: number;
}

interface DocumentExtractionResult {
  success: boolean;
  totalPages: number;
  pages: ExtractedPage[];
  fullText: string;
  totalWords: number;
  title?: string;
  author?: string;
  subject?: string;
  error?: string;
  format: "pdf" | "docx" | "epub" | "md" | "txt";
}

/**
 * Extract text from PDF using pdf-parse with better error handling
 */
async function extractPDF(buffer: Buffer): Promise<DocumentExtractionResult> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

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

    const fullText = textResult.text;
    const totalWords = fullText
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;

    return {
      success: true,
      totalPages: textResult.total,
      pages,
      fullText: fullText.trim(),
      totalWords,
      title: infoResult.info?.Title,
      author: infoResult.info?.Author,
      subject: infoResult.info?.Subject,
      format: "pdf",
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
      format: "pdf",
    };
  }
}

/**
 * Extract text from DOCX using mammoth
 */
async function extractDOCX(buffer: Buffer): Promise<DocumentExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const fullText = result.value;

    // Split into approximate pages (every 500 words)
    const words = fullText.split(/\s+/).filter((w: string) => w.length > 0);
    const wordsPerPage = 500;
    const pages: ExtractedPage[] = [];

    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, i + wordsPerPage);
      pages.push({
        pageNumber: Math.floor(i / wordsPerPage) + 1,
        text: pageWords.join(" "),
        wordCount: pageWords.length,
      });
    }

    return {
      success: true,
      totalPages: pages.length,
      pages,
      fullText: fullText.trim(),
      totalWords: words.length,
      format: "docx",
    };
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return {
      success: false,
      totalPages: 0,
      pages: [],
      fullText: "",
      totalWords: 0,
      error:
        error instanceof Error ? error.message : "Failed to extract DOCX text",
      format: "docx",
    };
  }
}

/**
 * Extract text from EPUB
 */
async function extractEPUB(buffer: Buffer): Promise<DocumentExtractionResult> {
  return new Promise((resolve) => {
    try {
      const req = eval("require") as NodeRequire;
      const EPub = req("epub");
      // EPub expects a file path or ArrayBuffer, convert buffer
      const epub = new EPub(buffer as any);

      epub.on("error", (err: Error) => {
        console.error("EPUB parsing error:", err);
        resolve({
          success: false,
          totalPages: 0,
          pages: [],
          fullText: "",
          totalWords: 0,
          error: err.message,
          format: "epub",
        });
      });

      epub.on("end", async () => {
        try {
          const getChapter = promisify(epub.getChapter.bind(epub));
          const chapters: string[] = [];

          // Extract all chapters
          for (const chapterId of epub.flow) {
            try {
              const chapterText = await getChapter(chapterId.id);
              // Strip HTML tags
              const text = chapterText
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              if (text) chapters.push(text);
            } catch (err) {
              console.warn(`Failed to extract chapter ${chapterId.id}:`, err);
            }
          }

          const fullText = chapters.join("\n\n");
          const words = fullText
            .split(/\s+/)
            .filter((w: string) => w.length > 0);

          // Create pages from chapters
          const pages: ExtractedPage[] = chapters.map((chapterText, index) => {
            const chapterWords = chapterText
              .split(/\s+/)
              .filter((w: string) => w.length > 0);
            return {
              pageNumber: index + 1,
              text: chapterText,
              wordCount: chapterWords.length,
            };
          });

          resolve({
            success: true,
            totalPages: pages.length,
            pages,
            fullText: fullText.trim(),
            totalWords: words.length,
            title: epub.metadata.title,
            author: epub.metadata.creator,
            subject: epub.metadata.subject,
            format: "epub",
          });
        } catch (err) {
          resolve({
            success: false,
            totalPages: 0,
            pages: [],
            fullText: "",
            totalWords: 0,
            error:
              err instanceof Error
                ? err.message
                : "Failed to extract EPUB content",
            format: "epub",
          });
        }
      });

      epub.parse();
    } catch (error) {
      console.error("EPUB extraction error:", error);
      resolve({
        success: false,
        totalPages: 0,
        pages: [],
        fullText: "",
        totalWords: 0,
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract EPUB text",
        format: "epub",
      });
    }
  });
}

/**
 * Extract text from Markdown or plain text
 */
async function extractPlainText(
  buffer: Buffer,
  format: "md" | "txt"
): Promise<DocumentExtractionResult> {
  try {
    const fullText = buffer.toString("utf-8");

    // Split into pages (every 500 words)
    const words = fullText.split(/\s+/).filter((w: string) => w.length > 0);
    const wordsPerPage = 500;
    const pages: ExtractedPage[] = [];

    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, i + wordsPerPage);
      pages.push({
        pageNumber: Math.floor(i / wordsPerPage) + 1,
        text: pageWords.join(" "),
        wordCount: pageWords.length,
      });
    }

    return {
      success: true,
      totalPages: pages.length,
      pages,
      fullText: fullText.trim(),
      totalWords: words.length,
      format,
    };
  } catch (error) {
    console.error(`${format.toUpperCase()} extraction error:`, error);
    return {
      success: false,
      totalPages: 0,
      pages: [],
      fullText: "",
      totalWords: 0,
      error:
        error instanceof Error
          ? error.message
          : `Failed to extract ${format.toUpperCase()} text`,
      format,
    };
  }
}

/**
 * Universal document text extractor
 * Supports: PDF, DOCX, EPUB, MD, TXT
 */
export async function extractDocumentText(
  buffer: Buffer | Uint8Array,
  fileExtension: string
): Promise<DocumentExtractionResult> {
  const normalizedBuffer =
    buffer instanceof Buffer ? buffer : Buffer.from(buffer);
  const ext = fileExtension.toLowerCase().replace(".", "");

  console.log(`📄 Extracting ${ext.toUpperCase()} text...`);

  switch (ext) {
    case "pdf":
      return await extractPDF(normalizedBuffer);

    case "docx":
    case "doc":
      return await extractDOCX(normalizedBuffer);

    case "epub":
      return await extractEPUB(normalizedBuffer);

    case "md":
    case "markdown":
      return await extractPlainText(normalizedBuffer, "md");

    case "txt":
      return await extractPlainText(normalizedBuffer, "txt");

    default:
      return {
        success: false,
        totalPages: 0,
        pages: [],
        fullText: "",
        totalWords: 0,
        error: `Unsupported file format: ${ext}`,
        format: "txt",
      };
  }
}
