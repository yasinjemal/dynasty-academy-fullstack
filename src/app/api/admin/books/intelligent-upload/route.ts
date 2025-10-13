import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import mammoth from "mammoth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/epub+zip",
      "text/plain",
      "text/markdown",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Generate unique file ID
    const fileId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${fileId}.${fileExtension}`;

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "books");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/books/${fileName}`;

    // Extract content based on file type
    let extractedData: any = {
      fileId,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };

    try {
      if (file.type === "application/pdf") {
        // Extract PDF content
        extractedData = {
          ...extractedData,
          ...(await extractPDFContent(buffer, file.name)),
        };
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Extract DOCX content
        extractedData = {
          ...extractedData,
          ...(await extractDOCXContent(buffer, file.name)),
        };
      } else if (file.type === "text/plain" || file.type === "text/markdown") {
        // Extract text content
        extractedData = {
          ...extractedData,
          ...(await extractTextContent(buffer.toString(), file.name)),
        };
      }
    } catch (error) {
      console.error("Content extraction error:", error);
      // Continue with basic file info even if extraction fails
      extractedData.extractedTitle = file.name.replace(/\.[^/.]+$/, "");
      extractedData.totalPages = 0;
      extractedData.wordCount = 0;
      extractedData.contentPreview = "";
    }

    return NextResponse.json({
      success: true,
      ...extractedData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload and process file" },
      { status: 500 }
    );
  }
}

// Extract PDF content
async function extractPDFContent(
  buffer: Buffer,
  fileName: string
): Promise<any> {
  return new Promise((resolve) => {
    // For now, return basic info with a placeholder content preview
    // TODO: Implement proper PDF extraction with pdf-parse or similar
    const title = fileName
      .replace(/\.pdf$/i, "")
      .replace(/_/g, " ")
      .replace(/-/g, " ");

    // Provide a basic content preview based on the title for AI analysis
    const contentPreview = `This is a book titled "${title}". The book appears to cover topics related to the subject indicated in its title. Further content analysis will be performed based on the title and context.`;

    resolve({
      extractedTitle: title,
      extractedAuthor: "Unknown",
      totalPages: 100, // Estimated placeholder
      wordCount: 25000, // Estimated placeholder (100 pages * ~250 words)
      contentPreview,
      extractedCover: null,
    });
  });
}

// Extract DOCX content
async function extractDOCXContent(
  buffer: Buffer,
  fileName: string
): Promise<any> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const words = text.split(/\s+/).filter((w) => w.length > 0);

    // Extract title (first line or filename)
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const title =
      lines[0]?.trim() || fileName.replace(/\.docx$/i, "").replace(/_/g, " ");

    // Try to extract author (look for common patterns)
    const authorMatch = text.match(
      /(?:by|author|written by)[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i
    );
    const author = authorMatch ? authorMatch[1] : "Unknown";

    // Estimate pages (assuming 300 words per page)
    const estimatedPages = Math.ceil(words.length / 300);

    return {
      extractedTitle: title,
      extractedAuthor: author,
      totalPages: estimatedPages,
      wordCount: words.length,
      contentPreview: text.slice(0, 2000),
      extractedCover: null,
    };
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return {
      extractedTitle: fileName.replace(/\.docx$/i, ""),
      extractedAuthor: "Unknown",
      totalPages: 0,
      wordCount: 0,
      contentPreview: "",
      extractedCover: null,
    };
  }
}

// Extract text/markdown content
async function extractTextContent(
  text: string,
  fileName: string
): Promise<any> {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  // Extract title (first line or first heading)
  let title =
    lines[0]?.replace(/^#+\s*/, "").trim() ||
    fileName.replace(/\.(txt|md)$/i, "");

  // Try to extract author
  const authorMatch = text.match(
    /(?:by|author|written by)[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i
  );
  const author = authorMatch ? authorMatch[1] : "Unknown";

  // Estimate pages
  const estimatedPages = Math.ceil(words.length / 300);

  return {
    extractedTitle: title,
    extractedAuthor: author,
    totalPages: estimatedPages,
    wordCount: words.length,
    contentPreview: text.slice(0, 2000),
    extractedCover: null,
  };
}
