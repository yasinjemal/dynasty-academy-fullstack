/**
 * Content Extraction Service
 *
 * Extracts and prepares text content from various sources for embedding generation:
 * - Courses (title, description, content)
 * - Lessons (content, transcripts, materials)
 * - Quizzes (questions, answers, explanations)
 * - Books (chapters, summaries)
 * - Concepts (definitions, examples)
 *
 * Week 2 - Phase 1 Self-Healing Knowledge Graph MVP
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/infrastructure/logger";

const prisma = new PrismaClient();

// Types
export interface ExtractedContent {
  id: string;
  type: "course" | "lesson" | "quiz" | "book" | "concept" | "question";
  title: string;
  content: string;
  metadata: {
    categoryId?: string;
    category?: string;
    difficulty?: number;
    duration?: number;
    authorId?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface ExtractionStats {
  totalItems: number;
  byType: Record<string, number>;
  totalCharacters: number;
  avgContentLength: number;
  processingTime: number;
}

/**
 * Extract all courses for embedding
 */
export async function extractCourses(
  limit?: number,
  offset: number = 0
): Promise<ExtractedContent[]> {
  const startTime = Date.now();

  try {
    const courses = await prisma.course.findMany({
      take: limit,
      skip: offset,
      include: {
        category: true,
        instructor: true,
      },
      where: {
        published: true, // Only process published courses
      },
    });

    const extracted: ExtractedContent[] = courses.map((course) => {
      // Combine title, description, and learning outcomes into searchable content
      const contentParts = [
        course.title,
        course.description || "",
        course.shortDescription || "",
        course.learningOutcomes || "",
        course.prerequisites || "",
      ].filter(Boolean);

      return {
        id: course.id,
        type: "course",
        title: course.title,
        content: contentParts.join("\n\n"),
        metadata: {
          categoryId: course.categoryId || undefined,
          category: course.category?.name,
          difficulty: course.difficulty
            ? difficultyToNumber(course.difficulty)
            : undefined,
          duration: course.duration || undefined,
          authorId: course.instructorId,
          tags: course.tags || [],
          level: course.level,
          price: course.price,
          enrollmentCount: course.enrollmentCount,
        },
      };
    });

    logger.logInfo("Courses extracted for embedding", {
      count: extracted.length,
      duration: Date.now() - startTime,
    });

    return extracted;
  } catch (error) {
    logger.logError("Failed to extract courses", error as Error);
    throw error;
  }
}

/**
 * Extract all lessons for embedding
 */
export async function extractLessons(
  limit?: number,
  offset: number = 0
): Promise<ExtractedContent[]> {
  const startTime = Date.now();

  try {
    const lessons = await prisma.lesson.findMany({
      take: limit,
      skip: offset,
      include: {
        course: {
          include: {
            category: true,
          },
        },
      },
    });

    const extracted: ExtractedContent[] = lessons.map((lesson) => {
      // Combine all lesson content
      const contentParts = [
        lesson.title,
        lesson.description || "",
        lesson.content || "",
        lesson.videoTranscript || "",
      ].filter(Boolean);

      return {
        id: lesson.id,
        type: "lesson",
        title: lesson.title,
        content: contentParts.join("\n\n"),
        metadata: {
          courseId: lesson.courseId,
          categoryId: lesson.course.categoryId || undefined,
          category: lesson.course.category?.name,
          duration: lesson.duration || undefined,
          order: lesson.order,
          type: lesson.type,
          isFree: lesson.isFree,
        },
      };
    });

    logger.logInfo("Lessons extracted for embedding", {
      count: extracted.length,
      duration: Date.now() - startTime,
    });

    return extracted;
  } catch (error) {
    logger.logError("Failed to extract lessons", error as Error);
    throw error;
  }
}

/**
 * Extract all quiz questions for embedding
 */
export async function extractQuizQuestions(
  limit?: number,
  offset: number = 0
): Promise<ExtractedContent[]> {
  const startTime = Date.now();

  try {
    const questions = await prisma.quiz_questions.findMany({
      take: limit,
      skip: offset,
      include: {
        quiz: {
          include: {
            lesson: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    const extracted: ExtractedContent[] = questions.map((question) => {
      // Combine question, options, and explanation
      const contentParts = [
        question.question,
        question.explanation || "",
        // Include correct answer context
        `Correct answer: ${question.correctAnswer}`,
      ].filter(Boolean);

      // Add options if they exist
      if (question.options && Array.isArray(question.options)) {
        contentParts.push(`Options: ${question.options.join(", ")}`);
      }

      return {
        id: question.id,
        type: "question",
        title: question.question,
        content: contentParts.join("\n\n"),
        metadata: {
          quizId: question.quizId,
          lessonId: question.quiz.lessonId || undefined,
          courseId: question.quiz.lesson?.courseId,
          difficulty: question.difficulty || undefined,
          type: question.type,
          points: question.points,
        },
      };
    });

    logger.logInfo("Quiz questions extracted for embedding", {
      count: extracted.length,
      duration: Date.now() - startTime,
    });

    return extracted;
  } catch (error) {
    logger.logError("Failed to extract quiz questions", error as Error);
    throw error;
  }
}

/**
 * Extract all books for embedding
 */
export async function extractBooks(
  limit?: number,
  offset: number = 0
): Promise<ExtractedContent[]> {
  const startTime = Date.now();

  try {
    const books = await prisma.book.findMany({
      take: limit,
      skip: offset,
      where: {
        publishedAt: { not: null }, // Only published books
      },
    });

    const extracted: ExtractedContent[] = books.map((book) => {
      const contentParts = [
        book.title,
        book.description,
        book.excerpt || "",
      ].filter(Boolean);

      return {
        id: book.id,
        type: "book",
        title: book.title,
        content: contentParts.join("\n\n"),
        metadata: {
          category: book.category,
          tags: book.tags || [],
          authorId: book.authorId,
          bookType: book.bookType,
          language: book.language,
          pages: book.pages || book.totalPages,
        },
      };
    });

    logger.logInfo("Books extracted for embedding", {
      count: extracted.length,
      duration: Date.now() - startTime,
    });

    return extracted;
  } catch (error) {
    logger.logError("Failed to extract books", error as Error);
    throw error;
  }
}

/**
 * Extract all content from all sources
 */
export async function extractAllContent(): Promise<{
  content: ExtractedContent[];
  stats: ExtractionStats;
}> {
  const startTime = Date.now();

  logger.logInfo("Starting full content extraction...");

  try {
    // Extract from all sources in parallel
    const [courses, lessons, questions, books] = await Promise.all([
      extractCourses(),
      extractLessons(),
      extractQuizQuestions(),
      extractBooks(),
    ]);

    const allContent = [...courses, ...lessons, ...questions, ...books];

    // Calculate statistics
    const byType: Record<string, number> = {};
    let totalCharacters = 0;

    allContent.forEach((item) => {
      byType[item.type] = (byType[item.type] || 0) + 1;
      totalCharacters += item.content.length;
    });

    const stats: ExtractionStats = {
      totalItems: allContent.length,
      byType,
      totalCharacters,
      avgContentLength: Math.round(totalCharacters / allContent.length),
      processingTime: Date.now() - startTime,
    };

    logger.logInfo("Full content extraction complete", stats);

    return { content: allContent, stats };
  } catch (error) {
    logger.logError("Failed to extract all content", error as Error);
    throw error;
  }
}

/**
 * Extract content that needs embedding (doesn't have embedding yet)
 */
export async function extractUnembbeddedContent(): Promise<ExtractedContent[]> {
  const startTime = Date.now();

  try {
    // Get IDs of content that already has embeddings
    const existingEmbeddings = await prisma.contentEmbedding.findMany({
      select: {
        contentType: true,
        contentId: true,
      },
    });

    const embeddedIds = new Map<string, Set<string>>();
    existingEmbeddings.forEach((e) => {
      if (!embeddedIds.has(e.contentType)) {
        embeddedIds.set(e.contentType, new Set());
      }
      embeddedIds.get(e.contentType)!.add(e.contentId);
    });

    // Extract all content
    const { content: allContent } = await extractAllContent();

    // Filter out content that already has embeddings
    const unembedded = allContent.filter((item) => {
      const typeKey = item.type === "question" ? "quiz" : item.type;
      const embeddedSet = embeddedIds.get(typeKey);
      return !embeddedSet || !embeddedSet.has(item.id);
    });

    logger.logInfo("Unembedded content identified", {
      total: allContent.length,
      unembedded: unembedded.length,
      alreadyEmbedded: allContent.length - unembedded.length,
      duration: Date.now() - startTime,
    });

    return unembedded;
  } catch (error) {
    logger.logError("Failed to extract unembedded content", error as Error);
    throw error;
  }
}

/**
 * Extract content updated since a specific date
 */
export async function extractRecentlyUpdatedContent(
  since: Date
): Promise<ExtractedContent[]> {
  const startTime = Date.now();

  try {
    const [courses, lessons] = await Promise.all([
      prisma.course.findMany({
        where: {
          updatedAt: { gte: since },
          published: true,
        },
        include: { category: true, instructor: true },
      }),
      prisma.lesson.findMany({
        where: {
          updatedAt: { gte: since },
        },
        include: {
          course: { include: { category: true } },
        },
      }),
    ]);

    const extracted: ExtractedContent[] = [];

    // Process courses
    courses.forEach((course) => {
      const contentParts = [
        course.title,
        course.description || "",
        course.shortDescription || "",
        course.learningOutcomes || "",
        course.prerequisites || "",
      ].filter(Boolean);

      extracted.push({
        id: course.id,
        type: "course",
        title: course.title,
        content: contentParts.join("\n\n"),
        metadata: {
          categoryId: course.categoryId || undefined,
          category: course.category?.name,
          difficulty: course.difficulty
            ? difficultyToNumber(course.difficulty)
            : undefined,
          duration: course.duration || undefined,
          authorId: course.instructorId,
          tags: course.tags || [],
        },
      });
    });

    // Process lessons
    lessons.forEach((lesson) => {
      const contentParts = [
        lesson.title,
        lesson.description || "",
        lesson.content || "",
        lesson.videoTranscript || "",
      ].filter(Boolean);

      extracted.push({
        id: lesson.id,
        type: "lesson",
        title: lesson.title,
        content: contentParts.join("\n\n"),
        metadata: {
          courseId: lesson.courseId,
          categoryId: lesson.course.categoryId || undefined,
          category: lesson.course.category?.name,
          duration: lesson.duration || undefined,
        },
      });
    });

    logger.logInfo("Recently updated content extracted", {
      since: since.toISOString(),
      count: extracted.length,
      duration: Date.now() - startTime,
    });

    return extracted;
  } catch (error) {
    logger.logError(
      "Failed to extract recently updated content",
      error as Error
    );
    throw error;
  }
}

/**
 * Get extraction statistics without extracting content
 */
export async function getExtractionStats(): Promise<{
  courses: number;
  lessons: number;
  questions: number;
  books: number;
  total: number;
  embedded: number;
  pending: number;
}> {
  try {
    const [courses, lessons, questions, books, embedded] = await Promise.all([
      prisma.course.count({ where: { published: true } }),
      prisma.lesson.count(),
      prisma.quiz_questions.count(),
      prisma.book.count({ where: { publishedAt: { not: null } } }),
      prisma.contentEmbedding.count(),
    ]);

    const total = courses + lessons + questions + books;

    return {
      courses,
      lessons,
      questions,
      books,
      total,
      embedded,
      pending: Math.max(0, total - embedded),
    };
  } catch (error) {
    logger.logError("Failed to get extraction stats", error as Error);
    throw error;
  }
}

// Helper functions

/**
 * Convert difficulty string to number
 */
function difficultyToNumber(difficulty: string): number {
  const map: Record<string, number> = {
    beginner: 1,
    easy: 2,
    intermediate: 5,
    medium: 5,
    advanced: 8,
    hard: 9,
    expert: 10,
  };

  return map[difficulty.toLowerCase()] || 5;
}

/**
 * Clean and normalize text content
 */
export function cleanContent(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}
