import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const coverImage = formData.get("coverImage") as File;
    const bookId = formData.get("bookId") as string;

    if (!coverImage) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!bookId) {
      return NextResponse.json({ error: "No book ID provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(coverImage.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WEBP allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (coverImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max size is 5MB" },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Delete old cover if exists
    if (book.coverImage) {
      const oldCoverPath = join(process.cwd(), "public", book.coverImage);
      if (existsSync(oldCoverPath)) {
        try {
          await unlink(oldCoverPath);
        } catch (error) {
          console.error("Error deleting old cover:", error);
        }
      }
    }

    // Generate unique filename
    const bytes = await coverImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = coverImage.name.split(".").pop() || "jpg";
    const filename = `${bookId}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "covers");
    const filepath = join(uploadDir, filename);

    // Ensure directory exists
    const fs = require("fs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    await writeFile(filepath, buffer);
    const coverUrl = `/uploads/covers/${filename}`;

    // Update database
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: { coverImage: coverUrl },
    });

    return NextResponse.json({
      success: true,
      coverUrl,
      message: "Cover image uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading cover:", error);
    return NextResponse.json(
      { error: "Failed to upload cover image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: "No book ID provided" }, { status: 400 });
    }

    // Get book
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Delete cover file if exists
    if (book.coverImage) {
      const coverPath = join(process.cwd(), "public", book.coverImage);
      if (existsSync(coverPath)) {
        try {
          await unlink(coverPath);
        } catch (error) {
          console.error("Error deleting cover:", error);
        }
      }
    }

    // Update database
    await prisma.book.update({
      where: { id: bookId },
      data: { coverImage: null },
    });

    return NextResponse.json({
      success: true,
      message: "Cover image removed successfully",
    });
  } catch (error) {
    console.error("Error removing cover:", error);
    return NextResponse.json(
      { error: "Failed to remove cover image" },
      { status: 500 }
    );
  }
}
