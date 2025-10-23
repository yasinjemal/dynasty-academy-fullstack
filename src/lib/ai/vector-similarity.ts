/**
 * Vector Similarity Search Service
 *
 * Handles all database-level vector similarity operations for Dynasty Nexus 2.0:
 * - pgvector similarity search (cosine, euclidean, inner product)
 * - HNSW index optimization
 * - Batch similarity queries
 * - Result caching
 *
 * Week 1 - Phase 1 Self-Healing Knowledge Graph MVP
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { getCache, setCache } from "@/lib/infrastructure/redis";
import { logger } from "@/lib/infrastructure/logger";

const prisma = new PrismaClient();

// Types
export interface SimilarityResult {
  id: string;
  similarity: number;
  contentType?: string;
  contentId?: string;
  metadata?: any;
}

export type SimilarityMetric = "cosine" | "euclidean" | "inner_product";

/**
 * Find similar concepts using vector similarity search
 * Uses pgvector's HNSW index for fast approximate nearest neighbor search
 */
export async function findSimilarConcepts(
  embedding: number[],
  limit: number = 10,
  metric: SimilarityMetric = "cosine",
  minSimilarity?: number
): Promise<SimilarityResult[]> {
  const startTime = Date.now();

  try {
    // Convert embedding array to pgvector format
    const embeddingStr = `[${embedding.join(",")}]`;

    // Choose distance operator based on metric
    // <=> cosine distance (1 - similarity)
    // <-> euclidean distance
    // <#> negative inner product (for max inner product search)
    let operator: string;
    let orderDirection: string;

    switch (metric) {
      case "cosine":
        operator = "<=>";
        orderDirection = "ASC"; // Lower distance = higher similarity
        break;
      case "euclidean":
        operator = "<->";
        orderDirection = "ASC";
        break;
      case "inner_product":
        operator = "<#>";
        orderDirection = "ASC"; // Negative, so ASC gives highest
        break;
      default:
        operator = "<=>";
        orderDirection = "ASC";
    }

    // Build the similarity query
    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string | null;
        difficulty_score: number | null;
        category: string | null;
        distance: number;
        similarity: number;
        metadata: any;
      }>
    >`
      SELECT 
        id,
        name,
        description,
        difficulty_score,
        category,
        embedding ${Prisma.raw(operator)} ${Prisma.raw(
      `'${embeddingStr}'::vector`
    )} AS distance,
        1 - (embedding <=> ${Prisma.raw(
          `'${embeddingStr}'::vector`
        )}) AS similarity,
        metadata
      FROM concepts
      WHERE embedding IS NOT NULL
      ORDER BY embedding ${Prisma.raw(operator)} ${Prisma.raw(
      `'${embeddingStr}'::vector`
    )} ${Prisma.raw(orderDirection)}
      LIMIT ${limit};
    `;

    // Filter by minimum similarity if specified
    const filtered = minSimilarity
      ? results.filter((r) => r.similarity >= minSimilarity)
      : results;

    logger.logInfo("Similar concepts search complete", {
      metric,
      resultsCount: filtered.length,
      duration: Date.now() - startTime,
    });

    return filtered.map((r) => ({
      id: r.id,
      similarity: r.similarity,
      metadata: {
        name: r.name,
        description: r.description,
        difficultyScore: r.difficulty_score,
        category: r.category,
        ...r.metadata,
      },
    }));
  } catch (error) {
    logger.logError("Failed to find similar concepts", error as Error, {
      metric,
      limit,
    });
    throw error;
  }
}

/**
 * Find similar content using embeddings table
 * Supports any content type (courses, lessons, quizzes, etc.)
 */
export async function findSimilarContent(
  embedding: number[],
  contentType?: string,
  limit: number = 10,
  metric: SimilarityMetric = "cosine",
  excludeIds?: string[]
): Promise<SimilarityResult[]> {
  const startTime = Date.now();

  // Check cache first
  const cacheKey = `similar_content:${contentType}:${hashEmbedding(
    embedding
  )}:${limit}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    logger.logInfo("Similarity search cache hit", {
      contentType,
      duration: Date.now() - startTime,
    });
    return JSON.parse(cached as string);
  }

  try {
    const embeddingStr = `[${embedding.join(",")}]`;

    let operator: string;
    let orderDirection: string;

    switch (metric) {
      case "cosine":
        operator = "<=>";
        orderDirection = "ASC";
        break;
      case "euclidean":
        operator = "<->";
        orderDirection = "ASC";
        break;
      case "inner_product":
        operator = "<#>";
        orderDirection = "ASC";
        break;
      default:
        operator = "<=>";
        orderDirection = "ASC";
    }

    // Build WHERE clause for content type and exclusions
    let whereClause = "WHERE embedding IS NOT NULL";
    if (contentType) {
      whereClause += ` AND content_type = '${contentType}'`;
    }
    if (excludeIds && excludeIds.length > 0) {
      const excludeList = excludeIds.map((id) => `'${id}'`).join(",");
      whereClause += ` AND content_id NOT IN (${excludeList})`;
    }

    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        content_type: string;
        content_id: string;
        text_content: string | null;
        distance: number;
        similarity: number;
        metadata: any;
      }>
    >`
      SELECT 
        id,
        content_type,
        content_id,
        text_content,
        embedding ${Prisma.raw(operator)} ${Prisma.raw(
      `'${embeddingStr}'::vector`
    )} AS distance,
        1 - (embedding <=> ${Prisma.raw(
          `'${embeddingStr}'::vector`
        )}) AS similarity,
        metadata
      FROM content_embeddings
      ${Prisma.raw(whereClause)}
      ORDER BY embedding ${Prisma.raw(operator)} ${Prisma.raw(
      `'${embeddingStr}'::vector`
    )} ${Prisma.raw(orderDirection)}
      LIMIT ${limit};
    `;

    const mapped = results.map((r) => ({
      id: r.id,
      similarity: r.similarity,
      contentType: r.content_type,
      contentId: r.content_id,
      metadata: r.metadata,
    }));

    // Cache the results
    await setCache(cacheKey, JSON.stringify(mapped), "MEDIUM");

    logger.logInfo("Similar content search complete", {
      contentType,
      metric,
      resultsCount: mapped.length,
      duration: Date.now() - startTime,
    });

    return mapped;
  } catch (error) {
    logger.logError("Failed to find similar content", error as Error, {
      contentType,
      metric,
      limit,
    });
    throw error;
  }
}

/**
 * Batch similarity search - find similar items for multiple embeddings at once
 */
export async function batchSimilaritySearch(
  embeddings: number[][],
  contentType?: string,
  limit: number = 10,
  metric: SimilarityMetric = "cosine"
): Promise<SimilarityResult[][]> {
  const startTime = Date.now();

  try {
    const results = await Promise.all(
      embeddings.map((embedding) =>
        findSimilarContent(embedding, contentType, limit, metric)
      )
    );

    logger.logInfo("Batch similarity search complete", {
      batchSize: embeddings.length,
      contentType,
      duration: Date.now() - startTime,
    });

    return results;
  } catch (error) {
    logger.logError("Failed batch similarity search", error as Error, {
      batchSize: embeddings.length,
      contentType,
    });
    throw error;
  }
}

/**
 * Find concepts by semantic text search
 * Combines embedding generation + similarity search
 */
export async function semanticConceptSearch(
  queryText: string,
  limit: number = 10,
  minSimilarity: number = 0.7
): Promise<SimilarityResult[]> {
  const { generateEmbedding } = await import("./vector-embeddings");

  try {
    // Generate embedding for query text
    const { embedding } = await generateEmbedding(
      queryText,
      "query",
      "concept_search"
    );

    // Search for similar concepts
    return await findSimilarConcepts(embedding, limit, "cosine", minSimilarity);
  } catch (error) {
    logger.logError("Failed semantic concept search", error as Error, {
      queryText,
    });
    throw error;
  }
}

/**
 * Get concept recommendations based on user's current concept
 * Uses relationship graph + similarity search
 */
export async function getConceptRecommendations(
  currentConceptId: string,
  limit: number = 5
): Promise<Array<{ conceptId: string; score: number; reason: string }>> {
  const startTime = Date.now();

  try {
    // Get current concept with embedding
    const concept = await prisma.concept.findUnique({
      where: { id: currentConceptId },
      include: {
        childRelationships: {
          include: { childConcept: true },
        },
      },
    });

    if (!concept) {
      throw new Error("Concept not found");
    }

    const recommendations: Array<{
      conceptId: string;
      score: number;
      reason: string;
    }> = [];

    // 1. Add direct prerequisite relationships (highest priority)
    const prerequisites = concept.childRelationships
      .filter((rel) => rel.relationshipType === "prerequisite")
      .map((rel) => ({
        conceptId: rel.childConceptId,
        score: 1.0,
        reason: "Next in learning path",
      }));

    recommendations.push(...prerequisites);

    // 2. Add related concepts
    const related = concept.childRelationships
      .filter((rel) => rel.relationshipType === "related")
      .map((rel) => ({
        conceptId: rel.childConceptId,
        score: 0.8,
        reason: "Related topic",
      }));

    recommendations.push(...related);

    // 3. Add similar concepts using embeddings (if available)
    if (concept.embedding) {
      const embeddingArray = parseEmbedding(concept.embedding as any);
      if (embeddingArray) {
        const similar = await findSimilarConcepts(
          embeddingArray,
          limit * 2,
          "cosine",
          0.7
        );

        similar
          .filter((s) => s.id !== currentConceptId) // Exclude current concept
          .filter((s) => !recommendations.find((r) => r.conceptId === s.id)) // Exclude already recommended
          .slice(0, limit - recommendations.length)
          .forEach((s) => {
            recommendations.push({
              conceptId: s.id,
              score: s.similarity * 0.7, // Lower priority than direct relationships
              reason: "Semantically similar",
            });
          });
      }
    }

    // Sort by score and limit
    const sorted = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    logger.logInfo("Concept recommendations generated", {
      currentConceptId,
      recommendationsCount: sorted.length,
      duration: Date.now() - startTime,
    });

    return sorted;
  } catch (error) {
    logger.logError("Failed to get concept recommendations", error as Error, {
      currentConceptId,
    });
    throw error;
  }
}

/**
 * Calculate similarity between two stored embeddings
 */
export async function calculateStoredSimilarity(
  embeddingId1: string,
  embeddingId2: string,
  metric: SimilarityMetric = "cosine"
): Promise<number> {
  try {
    let operator: string;

    switch (metric) {
      case "cosine":
        operator = "<=>";
        break;
      case "euclidean":
        operator = "<->";
        break;
      case "inner_product":
        operator = "<#>";
        break;
      default:
        operator = "<=>";
    }

    const result = await prisma.$queryRaw<Array<{ similarity: number }>>`
      SELECT 
        1 - (e1.embedding ${Prisma.raw(operator)} e2.embedding) AS similarity
      FROM content_embeddings e1
      CROSS JOIN content_embeddings e2
      WHERE e1.id = ${embeddingId1}
        AND e2.id = ${embeddingId2};
    `;

    return result[0]?.similarity || 0;
  } catch (error) {
    logger.logError("Failed to calculate stored similarity", error as Error, {
      embeddingId1,
      embeddingId2,
    });
    throw error;
  }
}

/**
 * Get vector search statistics
 */
export async function getVectorSearchStats(): Promise<{
  totalConcepts: number;
  conceptsWithEmbeddings: number;
  totalContentEmbeddings: number;
  avgSimilaritySearchTime: number;
}> {
  try {
    const [totalConcepts, conceptsWithEmbeddings, totalContentEmbeddings] =
      await Promise.all([
        prisma.concept.count(),
        prisma.concept.count({ where: { embedding: { not: null } } }),
        prisma.contentEmbedding.count(),
      ]);

    return {
      totalConcepts,
      conceptsWithEmbeddings,
      totalContentEmbeddings,
      avgSimilaritySearchTime: 0, // Will be tracked over time
    };
  } catch (error) {
    logger.logError("Failed to get vector search stats", error as Error);
    throw error;
  }
}

// Helper functions

/**
 * Parse embedding from Prisma Unsupported type
 */
function parseEmbedding(embedding: any): number[] | null {
  if (!embedding) return null;

  try {
    // pgvector stores as string "[1,2,3,...]"
    if (typeof embedding === "string") {
      return JSON.parse(embedding.replace(/^\[/, "[").replace(/\]$/, "]"));
    }

    // Already an array
    if (Array.isArray(embedding)) {
      return embedding;
    }

    return null;
  } catch (error) {
    logger.logError("Failed to parse embedding", error as Error);
    return null;
  }
}

/**
 * Simple hash for embedding arrays (for caching)
 */
function hashEmbedding(embedding: number[]): string {
  // Take first, middle, and last values for a quick hash
  const len = embedding.length;
  const sample = [
    embedding[0],
    embedding[Math.floor(len / 4)],
    embedding[Math.floor(len / 2)],
    embedding[Math.floor((3 * len) / 4)],
    embedding[len - 1],
  ];

  let hash = 2166136261; // FNV offset basis

  for (const val of sample) {
    const intVal = Math.floor(val * 1000000); // Convert float to int
    hash ^= intVal;
    hash = Math.imul(hash, 16777619); // FNV prime
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

// Export for use in other modules
export { prisma as vectorSearchPrisma };
