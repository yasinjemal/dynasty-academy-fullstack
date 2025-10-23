/**
 * RAG (Retrieval Augmented Generation) System
 * Dynasty Nexus AI - Semantic Search & Context Retrieval
 */

import { generateEmbedding } from "./embeddings";
import { queryVectors, PINECONE_NAMESPACE } from "./pinecone";
import { prisma } from "@/lib/db/prisma";

export interface RAGContext {
  type: "course" | "lesson" | "book" | "general";
  id?: string;
  content: string;
  relevance: number;
  metadata?: Record<string, any>;
}

/**
 * Search for relevant context using semantic search
 */
export async function searchRelevantContext(
  query: string,
  options: {
    topK?: number;
    namespace?: string;
    filter?: Record<string, any>;
    includeTypes?: ("course" | "lesson" | "book")[];
  } = {}
): Promise<RAGContext[]> {
  try {
    // Check if Pinecone is configured
    if (!process.env.PINECONE_API_KEY) {
      console.warn("Pinecone API key not configured, skipping semantic search");
      return [];
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search in Pinecone
    const results = await queryVectors({
      vector: queryEmbedding,
      topK: options.topK || 5,
      namespace: options.namespace || PINECONE_NAMESPACE.GENERAL,
      filter: options.filter,
    });

    // Map results to RAGContext
    const contexts: RAGContext[] = results.map((match) => ({
      type: (match.metadata?.type as any) || "general",
      id: match.metadata?.id as string,
      content: match.metadata?.content as string,
      relevance: match.score || 0,
      metadata: match.metadata as Record<string, any>,
    }));

    // Filter by type if specified
    if (options.includeTypes && options.includeTypes.length > 0) {
      return contexts.filter((ctx) => options.includeTypes!.includes(ctx.type));
    }

    return contexts;
  } catch (error) {
    console.error("Error searching relevant context:", error);
    return [];
  }
}

/**
 * Get enhanced context for AI chat
 * Combines semantic search with user's current context
 */
export async function getEnhancedContext(params: {
  query: string;
  userId: string;
  currentContext?: {
    page?: string;
    courseId?: string;
    lessonId?: string;
    bookId?: string;
  };
}): Promise<{
  relevantContexts: RAGContext[];
  userProgress?: any;
  currentContent?: any;
}> {
  const { query, userId, currentContext } = params;

  // Search for relevant content
  const relevantContexts = await searchRelevantContext(query, {
    topK: 3,
  });

  // Get user's current progress if on a course/lesson
  let userProgress = null;
  if (currentContext?.courseId) {
    userProgress = await prisma.courseEnrollment.findFirst({
      where: {
        userId,
        courseId: currentContext.courseId,
      },
      include: {
        course: {
          select: {
            title: true,
            description: true,
          },
        },
      },
    });
  }

  // Get current content details
  let currentContent = null;
  if (currentContext?.lessonId) {
    currentContent = await prisma.lesson.findUnique({
      where: { id: currentContext.lessonId },
      select: {
        title: true,
        content: true,
        order: true,
      },
    });
  } else if (currentContext?.courseId) {
    currentContent = await prisma.course.findUnique({
      where: { id: currentContext.courseId },
      select: {
        title: true,
        description: true,
      },
    });
  } else if (currentContext?.bookId) {
    currentContent = await prisma.book.findUnique({
      where: { id: currentContext.bookId },
      select: {
        title: true,
        author: true,
        description: true,
      },
    });
  }

  return {
    relevantContexts,
    userProgress,
    currentContent,
  };
}

/**
 * Build context string for AI prompt
 */
export function buildContextPrompt(contexts: RAGContext[]): string {
  if (contexts.length === 0) {
    return "";
  }

  let prompt = "\n\nRELEVANT CONTEXT FROM DYNASTY ACADEMY:\n\n";

  contexts.forEach((ctx, idx) => {
    prompt += `[${idx + 1}] ${ctx.type.toUpperCase()}`;
    if (ctx.metadata?.title) {
      prompt += ` - "${ctx.metadata.title}"`;
    }
    prompt += `:\n${ctx.content}\n\n`;
  });

  prompt +=
    "Use the above context to provide accurate, specific answers. If the context doesn't contain relevant information, acknowledge that and provide general guidance.\n\n";

  return prompt;
}
