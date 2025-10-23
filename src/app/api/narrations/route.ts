import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  getParagraphHash,
  getContentHash,
  getFileHash,
} from "@/lib/narration/textNormalization";
import {
  transcribeAndValidate,
  analyzeAudioQuality,
  moderateTranscript,
  shouldAutoApprove,
} from "@/lib/narration/audioQuality";
import { checkUploadLimit } from "@/lib/narration/rateLimit";

/**
 * 🎙️ COMMUNITY NARRATOR - UPLOAD ENDPOINT
 *
 * Full moderation pipeline:
 * 1. Auth & permission check
 * 2. Rate limiting
 * 3. File validation
 * 4. Hash computation (deduplication)
 * 5. Audio upload to storage
 * 6. ASR transcription & WER calculation
 * 7. Quality scoring (SNR, silence, clipping)
 * 8. Policy moderation
 * 9. Auto-approve or queue for review
 * 10. Database persistence
 */
export async function POST(request: NextRequest) {
  try {
    // 1. AUTH CHECK
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to record narrations" },
        { status: 401 }
      );
    }

    // 2. PARSE FORM DATA
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const bookId = formData.get("bookId") as string;
    const pageNumber = parseInt(formData.get("pageNumber") as string);
    const paragraphText = formData.get("paragraphText") as string;
    const language = (formData.get("language") as string) || "en";
    const readingStyle = (formData.get("readingStyle") as string) || "neutral";

    // 3. VALIDATE INPUT
    if (!audioFile || !bookId || !pageNumber || !paragraphText) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: audio, bookId, pageNumber, paragraphText",
        },
        { status: 400 }
      );
    }

    // 4. CHECK BOOK PERMISSIONS
    const bookPermission = await prisma.bookPermission.findUnique({
      where: { bookId },
    });

    if (!bookPermission?.allowCommunityNarrations) {
      return NextResponse.json(
        { error: "Community narrations are not enabled for this book" },
        { status: 403 }
      );
    }

    // 5. RATE LIMITING
    const rateLimit = await checkUploadLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many uploads. Try again after ${rateLimit.resetAt.toLocaleTimeString()}`,
          resetAt: rateLimit.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    // 6. FILE VALIDATION
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    if (audioFile.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Invalid file type. Must be audio file" },
        { status: 400 }
      );
    }

    // 7. COMPUTE HASHES
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const fileHash = getFileHash(audioBuffer);
    const paragraphHash = getParagraphHash(paragraphText);
    const contentHash = getContentHash(paragraphText, language, readingStyle);

    // 8. CHECK FOR DUPLICATE CONTENT
    const existingNarration = await prisma.communityNarration.findUnique({
      where: { contentHash },
    });

    if (existingNarration) {
      return NextResponse.json(
        {
          error: "Duplicate narration",
          message:
            "This exact narration already exists (same text, language, and style)",
          existingId: existingNarration.id,
        },
        { status: 409 }
      );
    }

    // 9. UPLOAD AUDIO TO STORAGE
    // TODO: Replace with your actual storage solution
    // Options: Vercel Blob, Cloudinary, S3, etc.
    const audioUrl = `https://storage.example.com/narrations/${bookId}/${pageNumber}/${
      session.user.id
    }-${Date.now()}.webm`;

    // In production:
    // const blob = await uploadToStorage(audioBuffer, {
    //   path: `narrations/${bookId}/${pageNumber}/${session.user.id}-${Date.now()}.webm`,
    // });
    // const audioUrl = blob.url;

    // 10. ASR TRANSCRIPTION & VALIDATION
    console.log("🎤 Running ASR transcription...");
    const asrResult = await transcribeAndValidate(audioBuffer, paragraphText);
    console.log(
      `📝 Transcript confidence: ${asrResult.confidence.toFixed(
        2
      )}, WER: ${asrResult.wordErrorRate.toFixed(2)}`
    );

    // 11. QUALITY SCORING
    console.log("🔊 Analyzing audio quality...");
    const qualityResult = await analyzeAudioQuality(audioBuffer);
    console.log(`✨ Quality score: ${qualityResult.qualityScore.toFixed(2)}`);

    // 12. POLICY MODERATION
    console.log("🛡️ Running content moderation...");
    const isPolicyClean = await moderateTranscript(asrResult.transcript);
    console.log(`✅ Policy check: ${isPolicyClean ? "PASS" : "FAIL"}`);

    // 13. AUTO-APPROVE DECISION
    const isAutoApproved = shouldAutoApprove(
      asrResult,
      qualityResult,
      isPolicyClean
    );
    const status = isAutoApproved ? "APPROVED" : "PENDING";

    console.log(`🎯 Decision: ${status} (auto-approve: ${isAutoApproved})`);

    // 14. CREATE DATABASE RECORD
    const narration = await prisma.communityNarration.create({
      data: {
        userId: session.user.id,
        bookId,
        pageNumber,
        paragraphHash,
        paragraphText,
        language,
        readingStyle,
        audioUrl,
        format: "webm-opus",
        durationSec: audioFile.size / 16000, // Rough estimate
        sizeBytes: audioFile.size,
        transcript: asrResult.transcript,
        asrConfidence: asrResult.confidence,
        wordErrorRate: asrResult.wordErrorRate,
        qualityScore: qualityResult.qualityScore,
        status,
        contentHash,
        license: "DYN_COMMERCIAL",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    // 15. EMIT ANALYTICS EVENT
    console.log("📊 Narration uploaded:", {
      id: narration.id,
      status,
      confidence: asrResult.confidence,
      wer: asrResult.wordErrorRate,
      quality: qualityResult.qualityScore,
    });

    // TODO: Track event in analytics
    // await analytics.track('narration_uploaded', { ... });

    return NextResponse.json(
      {
        success: true,
        narration,
        moderation: {
          status,
          autoApproved: isAutoApproved,
          confidence: asrResult.confidence,
          wordErrorRate: asrResult.wordErrorRate,
          qualityScore: qualityResult.qualityScore,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error uploading narration:", error);
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
