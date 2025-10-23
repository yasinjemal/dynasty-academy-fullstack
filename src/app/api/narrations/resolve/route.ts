import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getParagraphHash,
  getContentHash,
} from "@/lib/narration/textNormalization";

/**
 * 🎙️ COMMUNITY NARRATOR - PLAYBACK RESOLUTION
 *
 * Smart audio resolution strategy:
 * 1. Try best APPROVED human narration (sorted by quality/popularity)
 * 2. Fall back to TTS cache (by contentHash)
 * 3. Generate TTS on-demand if nothing exists
 *
 * This ensures users always get audio, preferring human narrations.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookId,
      pageNumber,
      paragraphText,
      language = "en",
      readingStyle = "neutral",
    } = body;

    if (!bookId || !pageNumber || !paragraphText) {
      return NextResponse.json(
        { error: "Missing required fields: bookId, pageNumber, paragraphText" },
        { status: 400 }
      );
    }

    // Compute hashes for lookup
    const paragraphHash = getParagraphHash(paragraphText);
    const contentHash = getContentHash(paragraphText, language, readingStyle);

    console.log("🔍 Resolving audio for:", {
      bookId,
      pageNumber,
      paragraphHash,
    });

    // STEP 1: Try to find best APPROVED human narration
    const humanNarrations = await prisma.communityNarration.findMany({
      where: {
        bookId,
        pageNumber,
        paragraphHash,
        language,
        status: "APPROVED",
      },
      orderBy: [
        { likeCount: "desc" }, // Most liked
        { playCount: "desc" }, // Most played
        { qualityScore: "desc" }, // Highest quality
        { createdAt: "asc" }, // Oldest (most battle-tested)
      ],
      take: 1,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    if (humanNarrations.length > 0) {
      const bestNarration = humanNarrations[0];
      console.log("✅ Found human narration:", bestNarration.id);

      return NextResponse.json({
        type: "human",
        audioUrl: bestNarration.audioUrl,
        narrationId: bestNarration.id,
        narrator: bestNarration.user,
        metadata: {
          durationSec: bestNarration.durationSec,
          qualityScore: bestNarration.qualityScore,
          likeCount: bestNarration.likeCount,
          playCount: bestNarration.playCount,
        },
      });
    }

    // STEP 2: Try to find cached TTS by contentHash
    const ttsCache = await prisma.audioAsset.findFirst({
      where: {
        bookId,
        chapterNumber: pageNumber,
        // Assuming TTS cache stores contentHash in metadata
        metadata: {
          path: ["contentHash"],
          equals: contentHash,
        },
      },
    });

    if (ttsCache?.audioUrl) {
      console.log("✅ Found TTS cache:", ttsCache.id);

      return NextResponse.json({
        type: "tts-cached",
        audioUrl: ttsCache.audioUrl,
        metadata: {
          duration: ttsCache.duration,
          cached: true,
        },
      });
    }

    // STEP 3: Generate TTS on-demand
    console.log("🎨 No audio found, will generate TTS on-demand");

    // TODO: Integrate with TTS generation service
    // For now, return a placeholder that triggers client-side generation

    return NextResponse.json({
      type: "tts-generate",
      audioUrl: null, // Will be generated
      shouldGenerate: true,
      metadata: {
        paragraphText,
        language,
        readingStyle,
        contentHash,
      },
    });
  } catch (error) {
    console.error("❌ Error resolving audio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Batch resolve audio for multiple paragraphs
 * Used for efficient page loading
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const pageNumber = parseInt(searchParams.get("pageNumber") || "0");

    if (!bookId || !pageNumber) {
      return NextResponse.json(
        { error: "Missing bookId or pageNumber" },
        { status: 400 }
      );
    }

    // Get all approved narrations for this page
    const narrations = await prisma.communityNarration.findMany({
      where: {
        bookId,
        pageNumber,
        status: "APPROVED",
      },
      orderBy: [
        { paragraphHash: "asc" }, // Group by paragraph
        { likeCount: "desc" }, // Best first
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Group by paragraph (take best per paragraph)
    const bestPerParagraph = new Map<string, any>();

    for (const narration of narrations) {
      if (!bestPerParagraph.has(narration.paragraphHash)) {
        bestPerParagraph.set(narration.paragraphHash, narration);
      }
    }

    const results = Array.from(bestPerParagraph.values()).map((narration) => ({
      paragraphHash: narration.paragraphHash,
      type: "human",
      audioUrl: narration.audioUrl,
      narrationId: narration.id,
      narrator: narration.user,
      metadata: {
        durationSec: narration.durationSec,
        qualityScore: narration.qualityScore,
        likeCount: narration.likeCount,
        playCount: narration.playCount,
      },
    }));

    return NextResponse.json({
      bookId,
      pageNumber,
      results,
      totalParagraphs: results.length,
    });
  } catch (error) {
    console.error("❌ Error batch resolving audio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
