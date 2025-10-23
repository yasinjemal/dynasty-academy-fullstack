/**
 * API Route: Batch Embedding Process
 *
 * POST /api/ai/batch-embeddings - Start batch embedding process
 * GET /api/ai/batch-embeddings - Get processing status
 *
 * Dynasty Nexus 2.0 - Phase 1 Week 2
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  processAllContent,
  processUnembeddedContent,
  getProcessingStatus,
  retryFailedEmbeddings,
  queueBatchEmbeddingJob,
} from "@/lib/ai/batch-embedding-processor";
import { logger } from "@/lib/infrastructure/logger";

// GET - Get processing status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can access this endpoint
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getProcessingStatus();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.logError("Failed to get batch embedding status", error as Error);

    return NextResponse.json(
      {
        error: "Failed to get processing status",
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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      mode = "unembedded", 
      async = false,
      contentTypes = [] // New: specific content types to process
    } = body;

    logger.logInfo("Batch embedding process triggered", {
      mode,
      async,
      contentTypes,
      userId: session.user.id,
    });

    // If async mode, queue the job
    if (async) {
      const jobId = await queueBatchEmbeddingJob();

      return NextResponse.json({
        success: true,
        data: {
          jobId,
          message: "Batch embedding job queued successfully",
        },
      });
    }

    // Import content-specific extraction functions
    const { 
      extractCourses, 
      extractLessons, 
      extractQuizQuestions, 
      extractBooks 
    } = await import('@/lib/ai/content-extractor');
    
    const { processBatchForContent } = await import('@/lib/ai/batch-embedding-processor');

    // If specific content types are requested, process only those
    if (contentTypes.length > 0) {
      const contentToProcess = [];

      for (const type of contentTypes) {
        switch (type) {
          case 'courses':
            const courses = await extractCourses();
            contentToProcess.push(...courses);
            break;
          case 'lessons':
            const lessons = await extractLessons();
            contentToProcess.push(...lessons);
            break;
          case 'questions':
            const questions = await extractQuizQuestions();
            contentToProcess.push(...questions);
            break;
          case 'books':
            const books = await extractBooks();
            contentToProcess.push(...books);
            break;
        }
      }

      // Filter based on mode
      if (mode === 'unembedded') {
        // Filter out content that already has embeddings
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        const existingEmbeddings = await prisma.contentEmbedding.findMany({
          select: { contentType: true, contentId: true },
        });
        
        const embeddedIds = new Set(
          existingEmbeddings.map(e => `${e.contentType}:${e.contentId}`)
        );
        
        const unembedded = contentToProcess.filter(
          item => !embeddedIds.has(`${item.type}:${item.id}`)
        );
        
        contentToProcess.length = 0;
        contentToProcess.push(...unembedded);
        
        await prisma.$disconnect();
      }

      // Process the selected content
      const result = await processBatchForContent(contentToProcess, (progress) => {
        logger.logInfo("Batch embedding progress", progress);
      });

      return NextResponse.json({
        success: result.success,
        data: result,
      });
    }

    // Otherwise, process all content based on mode
    let result;

    switch (mode) {
      case "all":
        result = await processAllContent((progress) => {
          logger.logInfo("Batch embedding progress", progress);
        });
        break;

      case "unembedded":
        result = await processUnembeddedContent((progress) => {
          logger.logInfo("Batch embedding progress", progress);
        });
        break;

      case "retry":
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
    logger.logError("Failed to process batch embeddings", error as Error);

    return NextResponse.json(
      {
        error: "Failed to process batch embeddings",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
