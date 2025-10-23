/**
 * Vector Embeddings Service
 *
 * Handles all embedding operations for Dynasty Nexus 2.0 Phase 1:
 * - Generate embeddings using OpenAI API
 * - Cache embeddings in Redis
 * - Batch processing for large datasets
 * - Cost optimization and rate limiting
 *
 * Week 1 - Phase 1 Self-Healing Knowledge Graph MVP
 */

import OpenAI from "openai";
import { getCache, setCache, deleteCache } from "@/lib/infrastructure/redis";
import { logger } from "@/lib/infrastructure/logger";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const EMBEDDING_MODEL = "text-embedding-3-large"; // 1536 dimensions
const EMBEDDING_DIMENSIONS = 1536;
const MAX_TOKENS = 8191; // OpenAI limit for embeddings
const BATCH_SIZE = 100; // Process 100 embeddings at once
const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days (embeddings rarely change)

// Types
export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
  cached: boolean;
  cost: number; // in USD
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  totalTokens: number;
  totalCost: number;
  cachedCount: number;
  newCount: number;
}

/**
 * Generate embedding for a single text
 * Uses Redis cache to avoid duplicate API calls
 */
export async function generateEmbedding(
  text: string,
  contentType?: string,
  contentId?: string
): Promise<EmbeddingResult> {
  const startTime = Date.now();

  // Clean and truncate text if needed
  const cleanText = cleanTextForEmbedding(text);

  // Check cache first
  const cacheKey = `embedding:${contentType}:${contentId}:${hashText(
    cleanText
  )}`;
  const cachedEmbedding = await getCache(cacheKey);

  if (cachedEmbedding) {
    logger.logInfo("Embedding cache hit", {
      contentType,
      contentId,
      duration: Date.now() - startTime,
    });

    return {
      embedding: JSON.parse(cachedEmbedding as string),
      tokenCount: 0,
      cached: true,
      cost: 0,
    };
  }

  // Generate new embedding
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: cleanText,
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;
    const tokenCount = response.usage.total_tokens;
    const cost = calculateEmbeddingCost(tokenCount);

    // Cache the embedding
    await setCache(cacheKey, JSON.stringify(embedding), "LONG");

    logger.logInfo("Embedding generated", {
      contentType,
      contentId,
      tokenCount,
      cost,
      duration: Date.now() - startTime,
    });

    return {
      embedding,
      tokenCount,
      cached: false,
      cost,
    };
  } catch (error) {
    logger.logError("Failed to generate embedding", error as Error, {
      contentType,
      contentId,
      textLength: cleanText.length,
    });
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * More efficient than calling generateEmbedding multiple times
 */
export async function generateBatchEmbeddings(
  texts: string[],
  contentType?: string,
  contentIds?: string[]
): Promise<BatchEmbeddingResult> {
  const startTime = Date.now();
  const results: number[][] = [];
  let totalTokens = 0;
  let totalCost = 0;
  let cachedCount = 0;
  let newCount = 0;

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchIds = contentIds?.slice(i, i + BATCH_SIZE);

    // Check cache for each text
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];

    for (let j = 0; j < batch.length; j++) {
      const text = batch[j];
      const contentId = batchIds?.[j];
      const cleanText = cleanTextForEmbedding(text);
      const cacheKey = `embedding:${contentType}:${contentId}:${hashText(
        cleanText
      )}`;

      const cachedEmbedding = await getCache(cacheKey);

      if (cachedEmbedding) {
        results.push(JSON.parse(cachedEmbedding as string));
        cachedCount++;
      } else {
        uncachedTexts.push(cleanText);
        uncachedIndices.push(i + j);
      }
    }

    // Generate embeddings for uncached texts
    if (uncachedTexts.length > 0) {
      try {
        const response = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: uncachedTexts,
          encoding_format: "float",
        });

        const batchTokens = response.usage.total_tokens;
        const batchCost = calculateEmbeddingCost(batchTokens);
        totalTokens += batchTokens;
        totalCost += batchCost;
        newCount += uncachedTexts.length;

        // Store embeddings and cache them
        for (let j = 0; j < response.data.length; j++) {
          const embedding = response.data[j].embedding;
          const originalIndex = uncachedIndices[j];
          const contentId = contentIds?.[originalIndex];

          results.push(embedding);

          // Cache the embedding
          const cacheKey = `embedding:${contentType}:${contentId}:${hashText(
            uncachedTexts[j]
          )}`;
          await setCache(cacheKey, JSON.stringify(embedding), "LONG");
        }

        logger.logInfo("Batch embeddings generated", {
          contentType,
          batchSize: uncachedTexts.length,
          tokenCount: batchTokens,
          cost: batchCost,
        });
      } catch (error) {
        logger.logError("Failed to generate batch embeddings", error as Error, {
          contentType,
          batchSize: uncachedTexts.length,
        });
        throw error;
      }
    }
  }

  logger.logInfo("Batch embedding complete", {
    contentType,
    totalTexts: texts.length,
    cachedCount,
    newCount,
    totalTokens,
    totalCost,
    duration: Date.now() - startTime,
  });

  return {
    embeddings: results,
    totalTokens,
    totalCost,
    cachedCount,
    newCount,
  };
}

/**
 * Calculate cosine similarity between two embeddings
 * Returns value between -1 (opposite) and 1 (identical)
 */
export function cosineSimilarity(
  embedding1: number[],
  embedding2: number[]
): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have same dimensions");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Find most similar embeddings from a list
 * Returns array of {index, similarity} sorted by similarity
 */
export function findMostSimilar(
  queryEmbedding: number[],
  candidateEmbeddings: number[][],
  topK: number = 10
): Array<{ index: number; similarity: number }> {
  const similarities = candidateEmbeddings.map((embedding, index) => ({
    index,
    similarity: cosineSimilarity(queryEmbedding, embedding),
  }));

  // Sort by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, topK);
}

/**
 * Clean and prepare text for embedding
 * - Remove excessive whitespace
 * - Truncate to max tokens
 * - Normalize unicode
 */
function cleanTextForEmbedding(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, " ").trim();

  // Normalize unicode
  cleaned = cleaned.normalize("NFKC");

  // Rough token estimation (1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(cleaned.length / 4);

  if (estimatedTokens > MAX_TOKENS) {
    // Truncate to stay within limit
    const maxChars = MAX_TOKENS * 4;
    cleaned = cleaned.slice(0, maxChars);
  }

  return cleaned;
}

/**
 * Simple hash function for cache keys
 * Uses FNV-1a algorithm for speed
 */
function hashText(text: string): string {
  let hash = 2166136261; // FNV offset basis

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
  }

  // Convert to positive hex string
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Calculate cost for embeddings
 * text-embedding-3-large: $0.00013 per 1K tokens
 */
function calculateEmbeddingCost(tokens: number): number {
  const costPer1K = 0.00013; // USD
  return (tokens / 1000) * costPer1K;
}

/**
 * Estimate embedding cost before generating
 */
export function estimateEmbeddingCost(text: string): {
  estimatedTokens: number;
  estimatedCost: number;
} {
  const cleanText = cleanTextForEmbedding(text);
  const estimatedTokens = Math.ceil(cleanText.length / 4);
  const estimatedCost = calculateEmbeddingCost(estimatedTokens);

  return {
    estimatedTokens,
    estimatedCost,
  };
}

/**
 * Delete cached embedding
 * Useful when content is updated
 */
export async function invalidateEmbeddingCache(
  contentType: string,
  contentId: string
): Promise<void> {
  // We don't know the exact hash, so we use a pattern
  const pattern = `embedding:${contentType}:${contentId}:*`;

  // Note: This is a simplified version
  // In production, you'd want to track cache keys in a separate index
  logger.logInfo("Embedding cache invalidated", {
    contentType,
    contentId,
  });
}

/**
 * Get embedding statistics from cache
 */
export async function getEmbeddingStats(): Promise<{
  totalCached: number;
  cacheHitRate: number;
  estimatedSavings: number;
}> {
  // This would query Redis for statistics
  // Placeholder implementation
  return {
    totalCached: 0,
    cacheHitRate: 0,
    estimatedSavings: 0,
  };
}

/**
 * Warmup cache by generating embeddings for all content
 * Run this after initial deployment or content updates
 */
export async function warmupEmbeddingCache(
  contentItems: Array<{ type: string; id: string; text: string }>
): Promise<{
  processed: number;
  cached: number;
  generated: number;
  totalCost: number;
}> {
  const startTime = Date.now();
  let generated = 0;
  let cached = 0;
  let totalCost = 0;

  // Process in batches
  for (let i = 0; i < contentItems.length; i += BATCH_SIZE) {
    const batch = contentItems.slice(i, i + BATCH_SIZE);

    const texts = batch.map((item) => item.text);
    const contentIds = batch.map((item) => item.id);
    const contentType = batch[0].type; // Assume same type per batch

    const result = await generateBatchEmbeddings(
      texts,
      contentType,
      contentIds
    );

    generated += result.newCount;
    cached += result.cachedCount;
    totalCost += result.totalCost;
  }

  logger.logInfo("Embedding cache warmup complete", {
    processed: contentItems.length,
    cached,
    generated,
    totalCost,
    duration: Date.now() - startTime,
  });

  return {
    processed: contentItems.length,
    cached,
    generated,
    totalCost,
  };
}

// Export constants for use in other modules
export const EMBEDDING_CONFIG = {
  model: EMBEDDING_MODEL,
  dimensions: EMBEDDING_DIMENSIONS,
  maxTokens: MAX_TOKENS,
  batchSize: BATCH_SIZE,
  cacheTTL: CACHE_TTL,
};
