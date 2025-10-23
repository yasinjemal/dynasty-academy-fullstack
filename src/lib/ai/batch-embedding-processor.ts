/**
 * Batch Embedding Processor
 * 
 * Processes large amounts of content for embedding generation:
 * - Extracts content from database
 * - Generates embeddings in batches
 * - Stores embeddings in content_embeddings table
 * - Tracks progress and errors
 * - Provides progress updates
 * 
 * Week 2 - Phase 1 Self-Healing Knowledge Graph MVP
 */

import { PrismaClient } from '@prisma/client';
import { generateBatchEmbeddings, estimateEmbeddingCost } from './vector-embeddings';
import { extractAllContent, extractUnembbeddedContent, getExtractionStats, type ExtractedContent } from './content-extractor';
import { logger } from '@/lib/infrastructure/logger';
import { queueContentProcessing } from '@/lib/infrastructure/queue-manager';

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = 50; // Process 50 items at once (balance between speed and memory)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds between retries

// Types
export interface ProcessingProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number; // seconds
  totalCost: number; // USD
  errors: Array<{ id: string; error: string }>;
}

export interface ProcessingResult {
  success: boolean;
  stats: {
    total: number;
    successful: number;
    failed: number;
    totalCost: number;
    totalTokens: number;
    duration: number; // ms
  };
  errors: Array<{ id: string; type: string; error: string }>;
}

/**
 * Process all content and generate embeddings
 * This is the main function to run for initial setup
 */
export async function processAllContent(
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  logger.logInfo('Starting batch embedding process for all content...');

  try {
    // Extract all content
    const { content, stats: extractStats } = await extractAllContent();
    
    logger.logInfo('Content extraction complete', extractStats);

    // Estimate total cost
    const totalEstimate = content.reduce((sum, item) => {
      const { estimatedCost } = estimateEmbeddingCost(item.content);
      return sum + estimatedCost;
    }, 0);

    logger.logInfo('Estimated embedding cost', {
      totalItems: content.length,
      estimatedCost: totalEstimate.toFixed(4),
      currency: 'USD',
    });

    // Process in batches
    const result = await processBatch(content, onProgress);

    const duration = Date.now() - startTime;
    logger.logInfo('Batch embedding process complete', {
      ...result.stats,
      duration,
    });

    return {
      ...result,
      stats: {
        ...result.stats,
        duration,
      },
    };
  } catch (error) {
    logger.logError('Failed to process all content', error as Error);
    throw error;
  }
}

/**
 * Process only content that doesn't have embeddings yet
 * Use this for incremental updates
 */
export async function processUnembeddedContent(
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  logger.logInfo('Starting batch embedding process for unembedded content...');

  try {
    const content = await extractUnembbeddedContent();
    
    if (content.length === 0) {
      logger.logInfo('No unembedded content found');
      return {
        success: true,
        stats: {
          total: 0,
          successful: 0,
          failed: 0,
          totalCost: 0,
          totalTokens: 0,
          duration: Date.now() - startTime,
        },
        errors: [],
      };
    }

    logger.logInfo('Unembedded content found', {
      count: content.length,
    });

    const result = await processBatch(content, onProgress);

    const duration = Date.now() - startTime;
    logger.logInfo('Unembedded content processing complete', {
      ...result.stats,
      duration,
    });

    return {
      ...result,
      stats: {
        ...result.stats,
        duration,
      },
    };
  } catch (error) {
    logger.logError('Failed to process unembedded content', error as Error);
    throw error;
  }
}

/**
 * Process a batch of content items
 */
async function processBatch(
  content: ExtractedContent[],
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> {
  const totalBatches = Math.ceil(content.length / BATCH_SIZE);
  let successful = 0;
  let failed = 0;
  let totalCost = 0;
  let totalTokens = 0;
  const errors: Array<{ id: string; type: string; error: string }> = [];

  for (let i = 0; i < content.length; i += BATCH_SIZE) {
    const batch = content.slice(i, i + BATCH_SIZE);
    const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
    const batchStartTime = Date.now();

    logger.logInfo(`Processing batch ${currentBatch}/${totalBatches}`, {
      batchSize: batch.length,
      processed: i,
      total: content.length,
    });

    try {
      // Generate embeddings for batch
      const texts = batch.map(item => item.content);
      const ids = batch.map(item => item.id);
      const types = batch.map(item => item.type);

      const result = await generateBatchEmbeddings(texts, 'mixed', ids);

      totalCost += result.totalCost;
      totalTokens += result.totalTokens;

      // Store embeddings in database
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const embedding = result.embeddings[j];

        try {
          await storeEmbedding(item, embedding);
          successful++;
        } catch (error) {
          failed++;
          errors.push({
            id: item.id,
            type: item.type,
            error: (error as Error).message,
          });
          logger.logError('Failed to store embedding', error as Error, {
            itemId: item.id,
            itemType: item.type,
          });
        }
      }

      // Calculate progress
      const processed = i + batch.length;
      const percentComplete = (processed / content.length) * 100;
      const avgTimePerItem = (Date.now() - batchStartTime) / batch.length;
      const remainingItems = content.length - processed;
      const estimatedTimeRemaining = Math.ceil((remainingItems * avgTimePerItem) / 1000);

      const progress: ProcessingProgress = {
        total: content.length,
        processed,
        successful,
        failed,
        currentBatch,
        totalBatches,
        estimatedTimeRemaining,
        totalCost,
        errors: errors.slice(-10), // Last 10 errors
      };

      if (onProgress) {
        onProgress(progress);
      }

      logger.logInfo(`Batch ${currentBatch}/${totalBatches} complete`, {
        percentComplete: percentComplete.toFixed(1),
        successful,
        failed,
        totalCost: totalCost.toFixed(4),
        estimatedTimeRemaining,
      });

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < content.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      logger.logError('Batch processing failed', error as Error, {
        batch: currentBatch,
        totalBatches,
      });

      // Mark entire batch as failed
      batch.forEach(item => {
        failed++;
        errors.push({
          id: item.id,
          type: item.type,
          error: `Batch failed: ${(error as Error).message}`,
        });
      });
    }
  }

  return {
    success: failed === 0,
    stats: {
      total: content.length,
      successful,
      failed,
      totalCost,
      totalTokens,
      duration: 0, // Will be set by caller
    },
    errors,
  };
}

/**
 * Store embedding in database
 */
async function storeEmbedding(
  item: ExtractedContent,
  embedding: number[]
): Promise<void> {
  try {
    // Convert embedding array to pgvector format
    const embeddingStr = `[${embedding.join(',')}]`;

    // Upsert embedding (update if exists, insert if not)
    await prisma.$executeRaw`
      INSERT INTO content_embeddings (
        id,
        content_type,
        content_id,
        embedding,
        text_content,
        metadata,
        version,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${item.type}::varchar,
        ${item.id},
        ${embeddingStr}::vector,
        ${item.content.slice(0, 5000)}, -- Store first 5000 chars for reference
        ${JSON.stringify(item.metadata)}::jsonb,
        1,
        NOW(),
        NOW()
      )
      ON CONFLICT (content_type, content_id, version)
      DO UPDATE SET
        embedding = EXCLUDED.embedding,
        text_content = EXCLUDED.text_content,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
    `;

    logger.logInfo('Embedding stored', {
      itemId: item.id,
      itemType: item.type,
    });
  } catch (error) {
    logger.logError('Failed to store embedding', error as Error, {
      itemId: item.id,
      itemType: item.type,
    });
    throw error;
  }
}

/**
 * Re-process content that failed embedding
 */
export async function retryFailedEmbeddings(): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  logger.logInfo('Retrying failed embeddings...');

  try {
    // Get all content
    const { content } = await extractAllContent();

    // Get successfully embedded content IDs
    const embedded = await prisma.contentEmbedding.findMany({
      select: { contentType: true, contentId: true },
    });

    const embeddedSet = new Set(
      embedded.map(e => `${e.contentType}:${e.contentId}`)
    );

    // Filter to get failed items
    const failed = content.filter(
      item => !embeddedSet.has(`${item.type}:${item.id}`)
    );

    if (failed.length === 0) {
      logger.logInfo('No failed embeddings to retry');
      return {
        success: true,
        stats: {
          total: 0,
          successful: 0,
          failed: 0,
          totalCost: 0,
          totalTokens: 0,
          duration: Date.now() - startTime,
        },
        errors: [],
      };
    }

    logger.logInfo('Failed embeddings found', { count: failed.length });

    const result = await processBatch(failed);

    return {
      ...result,
      stats: {
        ...result.stats,
        duration: Date.now() - startTime,
      },
    };
  } catch (error) {
    logger.logError('Failed to retry failed embeddings', error as Error);
    throw error;
  }
}

/**
 * Queue background job to process all content
 * Use this for async processing
 */
export async function queueBatchEmbeddingJob(): Promise<string> {
  try {
    const stats = await getExtractionStats();
    
    const jobId = await queueContentProcessing({
      type: 'batch_embedding',
      contentType: 'all',
      itemCount: stats.pending,
    });

    logger.logInfo('Batch embedding job queued', {
      jobId,
      pendingItems: stats.pending,
    });

    return jobId;
  } catch (error) {
    logger.logError('Failed to queue batch embedding job', error as Error);
    throw error;
  }
}

/**
 * Get processing status
 */
export async function getProcessingStatus(): Promise<{
  stats: Awaited<ReturnType<typeof getExtractionStats>>;
  progress: number; // percentage
  isComplete: boolean;
}> {
  try {
    const stats = await getExtractionStats();
    const progress = stats.total > 0 ? (stats.embedded / stats.total) * 100 : 0;
    const isComplete = stats.pending === 0;

    return {
      stats,
      progress,
      isComplete,
    };
  } catch (error) {
    logger.logError('Failed to get processing status', error as Error);
    throw error;
  }
}
