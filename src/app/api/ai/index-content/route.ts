/**
 * Index Content into Pinecone Vector Database
 * POST /api/ai/index-content
 *
 * Indexes courses, lessons, and books for semantic search
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  generateEmbedding,
  prepareTextForEmbedding,
} from "@/lib/ai/embeddings";
import { upsertVector, PINECONE_NAMESPACE } from "@/lib/ai/pinecone";

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { type, id } = await req.json();

    let indexed = 0;
    const errors: string[] = [];

    // Index all courses
    if (!type || type === "courses") {
      try {
        const courses = await prisma.course.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            level: true,
          },
          where: id ? { id } : undefined,
        });

        for (const course of courses) {
          try {
            const text = `${course.title}\n\n${course.description || ""}`;
            const chunks = prepareTextForEmbedding(text);

            for (let i = 0; i < chunks.length; i++) {
              const embedding = await generateEmbedding(chunks[i]);

              await upsertVector({
                id: `course_${course.id}_${i}`,
                values: embedding,
                metadata: {
                  type: "course",
                  id: course.id,
                  title: course.title,
                  content: chunks[i],
                  category: course.category,
                  level: course.level,
                  chunkIndex: i,
                  totalChunks: chunks.length,
                },
                namespace: PINECONE_NAMESPACE.COURSES,
              });
            }

            indexed++;
          } catch (error) {
            errors.push(`Course ${course.id}: ${error}`);
          }
        }
      } catch (error) {
        errors.push(`Courses indexing failed: ${error}`);
      }
    }

    // Index all lessons
    if (!type || type === "lessons") {
      try {
        const lessons = await prisma.lesson.findMany({
          select: {
            id: true,
            title: true,
            content: true,
            moduleId: true,
            module: {
              select: {
                courseId: true,
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          where: id ? { id } : undefined,
        });

        for (const lesson of lessons) {
          try {
            const text = `${lesson.title}\n\n${lesson.content || ""}`;
            const chunks = prepareTextForEmbedding(text);

            for (let i = 0; i < chunks.length; i++) {
              const embedding = await generateEmbedding(chunks[i]);

              await upsertVector({
                id: `lesson_${lesson.id}_${i}`,
                values: embedding,
                metadata: {
                  type: "lesson",
                  id: lesson.id,
                  title: lesson.title,
                  content: chunks[i],
                  courseId: lesson.module.courseId,
                  courseName: lesson.module.course.title,
                  chunkIndex: i,
                  totalChunks: chunks.length,
                },
                namespace: PINECONE_NAMESPACE.LESSONS,
              });
            }

            indexed++;
          } catch (error) {
            errors.push(`Lesson ${lesson.id}: ${error}`);
          }
        }
      } catch (error) {
        errors.push(`Lessons indexing failed: ${error}`);
      }
    }

    // Index all books
    if (!type || type === "books") {
      try {
        const books = await prisma.book.findMany({
          select: {
            id: true,
            title: true,
            author: true,
            description: true,
            genre: true,
          },
          where: id ? { id } : undefined,
        });

        for (const book of books) {
          try {
            const text = `${book.title} by ${book.author}\n\n${
              book.description || ""
            }`;
            const chunks = prepareTextForEmbedding(text);

            for (let i = 0; i < chunks.length; i++) {
              const embedding = await generateEmbedding(chunks[i]);

              await upsertVector({
                id: `book_${book.id}_${i}`,
                values: embedding,
                metadata: {
                  type: "book",
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  content: chunks[i],
                  genre: book.genre,
                  chunkIndex: i,
                  totalChunks: chunks.length,
                },
                namespace: PINECONE_NAMESPACE.BOOKS,
              });
            }

            indexed++;
          } catch (error) {
            errors.push(`Book ${book.id}: ${error}`);
          }
        }
      } catch (error) {
        errors.push(`Books indexing failed: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      indexed,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully indexed ${indexed} items${
        errors.length > 0 ? ` with ${errors.length} errors` : ""
      }`,
    });
  } catch (error) {
    console.error("Index content error:", error);
    return NextResponse.json(
      { error: "Failed to index content", details: String(error) },
      { status: 500 }
    );
  }
}
