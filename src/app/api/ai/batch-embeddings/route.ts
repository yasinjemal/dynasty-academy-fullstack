/**
 * API Route: Batch Embedding Process
 * 
 * POST /api/ai/batch-embeddings - Start batch embedding process
 * GET /api/ai/batch-embeddings - Get processing status
 * 
 * Dynasty Nexus 2.0 - Phase 1 Week 2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import {
  processAllContent,
  processUnembeddedContent,
  getProcessingStatus,
  retryFailedEmbeddings,
  queueBatchEmbeddingJob,
} from '@/lib/ai/batch-embedding-processor';
import { logger } from '@/lib/infrastructure/logger';

// GET - Get processing status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can access this endpoint
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = await getProcessingStatus();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.logError('Failed to get batch embedding status', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to get processing status',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST - Start batch embedding process
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can trigger batch processing
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mode = 'unembedded', async = false } = body;

    logger.logInfo('Batch embedding process triggered', {
      mode,
      async,
      userId: session.user.id,
    });

    // If async mode, queue the job
    if (async) {
      const jobId = await queueBatchEmbeddingJob();

      return NextResponse.json({
        success: true,
        data: {
          jobId,
          message: 'Batch embedding job queued successfully',
        },
      });
    }

    // Otherwise, process synchronously (only for small batches)
    let result;

    switch (mode) {
      case 'all':
        result = await processAllContent((progress) => {
          logger.logInfo('Batch embedding progress', progress);
        });
        break;

      case 'unembedded':
        result = await processUnembeddedContent((progress) => {
          logger.logInfo('Batch embedding progress', progress);
        });
        break;

      case 'retry':
        result = await retryFailedEmbeddings();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid mode. Use "all", "unembedded", or "retry"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    logger.logError('Failed to process batch embeddings', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to process batch embeddings',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
