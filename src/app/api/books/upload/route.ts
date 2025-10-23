import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { extractDocumentText } from "@/lib/document/extract-text";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type - Now supports PDF, DOCX, EPUB, MD, TXT
    const lowerCaseFileName = file.name.toLowerCase();
    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".doc",
      ".epub",
      ".md",
      ".markdown",
      ".txt",
    ];
    const isValidType = allowedExtensions.some((ext) =>
      lowerCaseFileName.endsWith(ext)
    );

    if (!isValidType) {
      return NextResponse.json(
        { error: "Supported formats: PDF, DOCX, EPUB, MD, TXT" },
        { status: 400 }
      );
    }

    // File size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 50MB" },
        { status: 400 }
      );
    }

    // Generate unique file ID
    const fileId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const savedFileName = `${fileId}.${fileExtension}`;

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "user-books");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, savedFileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/user-books/${savedFileName}`;

    // Extract basic book info from filename
    const bookTitle = file.name
      .replace(/\.(pdf|epub)$/i, "")
      .replace(/_/g, " ")
      .replace(/-/g, " ");

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Estimate page count (rough estimate: 1MB ≈ 25 pages for PDF)
    const estimatedPages = Math.max(
      10,
      Math.floor(file.size / (1024 * 1024) / 0.04)
    );

    // Extract document text (supports PDF, DOCX, EPUB, MD, TXT)
    let documentMetadata: any = null;
    let actualPageCount = estimatedPages;

    try {
      const extraction = await extractDocumentText(
        buffer,
        fileExtension || "pdf"
      );

      if (extraction.success) {
        documentMetadata = extraction;
        actualPageCount = extraction.totalPages;
        console.log(
          `✅ Extracted ${extraction.totalPages} pages, ${
            extraction.totalWords
          } words from ${extraction.format.toUpperCase()}`
        );
      } else {
        console.warn(
          `⚠️ ${extraction.format.toUpperCase()} extraction failed:`,
          extraction.error
        );
      }
    } catch (error) {
      console.error("❌ Document extraction error:", error);
      // Continue without extraction - we'll still save the file
    }

    // Create book in database with user as author
    const book = await prisma.book.create({
      data: {
        title: documentMetadata?.title || bookTitle,
        slug: `user-${fileId}`,
        description:
          documentMetadata?.subject || `User-uploaded book: ${bookTitle}`,
        authorId: user.id, // User is the author of their uploaded book
        coverImage:
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
        category: "Personal",
        price: 0, // Free for the uploader
        contentType: fileExtension?.toUpperCase() || "PDF",
        publishedAt: new Date(),
        totalPages: actualPageCount,
        fileUrl: fileUrl,
        bookType: "free", // Mark as free user upload
        source: "user-upload", // Track source as user upload
        language: "en",
      },
    });

    // Store extracted document content page by page
    if (documentMetadata?.success && documentMetadata.pages.length > 0) {
      console.log(
        `💾 Storing ${documentMetadata.pages.length} pages in database...`
      );

      // Create book content entries for each page
      await prisma.bookContent.createMany({
        data: documentMetadata.pages.map((page: any) => ({
          bookId: book.id,
          pageNumber: page.pageNumber,
          content: page.text,
          wordCount: page.wordCount,
          charCount: page.text.length,
        })),
      });

      console.log(
        `✅ ${documentMetadata.format.toUpperCase()} content stored successfully`
      );
    }

    // Automatically "purchase" for the user (since they uploaded it)
    await prisma.purchase.create({
      data: {
        userId: user.id,
        bookId: book.id,
        amount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
        author: documentMetadata?.author || user.name || "You",
        coverImage: book.coverImage,
        totalPages: book.totalPages,
        fileSize: file.size,
        fileName: file.name,
        fileUrl: fileUrl,
        extracted: !!documentMetadata?.success,
        wordCount: documentMetadata?.totalWords || 0,
        format: documentMetadata?.format || fileExtension,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload book. Please try again." },
      { status: 500 }
    );
  }
}
