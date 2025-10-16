import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chapterNumber, content, voiceId } = await req.json();
    const { slug } = params;

    if (!chapterNumber || !content || !voiceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // CORRECT: Use prisma.book (not prisma.books)
    const book = await prisma.book.findFirst({ where: { slug } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const cleanText = content
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\n\n+/g, "\n\n")
      .trim();
    const contentHash = crypto
      .createHash("sha256")
      .update(cleanText + voiceId)
      .digest("hex");

    // CORRECT: Check cache by bookId + chapterNumber + voiceId
    const existingAudio = await prisma.audioAsset.findFirst({
      where: {
        bookId: book.id,
        chapterNumber: parseInt(chapterNumber),
      },
    });

    // Check if cached audio matches the requested voice
    if (existingAudio) {
      const metadata =
        (existingAudio.metadata as { wordCount?: number; voiceId?: string }) ||
        {};
      if (metadata.voiceId === voiceId) {
        console.log(
          "⚡ VIP Priority Delivery - Instant access (Saved $",
          (((metadata.wordCount || 500) / 1000) * 0.18).toFixed(2) + ")"
        );
        return NextResponse.json({
          success: true,
          audioUrl: existingAudio.audioUrl,
          duration: existingAudio.duration || "1:00",
          cached: true,
        });
      } else {
        console.log(
          "🎨 Different voice selected, creating new premium audio..."
        );
      }
    }

    console.log("🎙️ Crafting studio-quality audio with ElevenLabs...");
    console.log("Voice ID:", voiceId);
    console.log("Text length:", cleanText.length);

    if (!ELEVENLABS_API_KEY) {
      console.error("❌ ELEVENLABS_API_KEY not configured");
      return NextResponse.json(
        { error: "Audio service not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ElevenLabs API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        voiceId,
      });

      // Return a more helpful error message
      let errorMessage = `ElevenLabs API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage =
          errorJson.detail?.message || errorJson.message || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      return NextResponse.json(
        {
          error: "Failed to generate audio",
          details: errorMessage,
          voiceId,
        },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioUrl = `data:audio/mpeg;base64,${Buffer.from(
      audioBuffer
    ).toString("base64")}`;
    const wordCount = cleanText.split(/\s+/).length;
    const estimatedSeconds = Math.ceil((wordCount / 150) * 60);
    const duration = `${Math.floor(estimatedSeconds / 60)}:${(
      estimatedSeconds % 60
    )
      .toString()
      .padStart(2, "0")}`;

    // CORRECT: Upsert (update or create) using fields that EXIST in database
    await prisma.audioAsset.upsert({
      where: {
        bookId_chapterNumber: {
          bookId: book.id,
          chapterNumber: parseInt(chapterNumber),
        },
      },
      update: {
        audioUrl,
        duration,
        metadata: {
          contentHash,
          voiceId,
          wordCount,
          generatedAt: new Date().toISOString(),
        },
      },
      create: {
        bookId: book.id,
        chapterNumber: parseInt(chapterNumber),
        audioUrl,
        duration,
        metadata: {
          contentHash,
          voiceId,
          wordCount,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    console.log(
      `✅ Audio generated! ${wordCount} words, ~$${(
        (wordCount / 1000) *
        0.18
      ).toFixed(2)}`
    );
    return NextResponse.json({
      success: true,
      audioUrl,
      duration,
      cached: false,
    });
  } catch (error) {
    console.error("Audio generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate audio", details: message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chapterNumber = searchParams.get("chapterNumber");
    const { slug } = params;

    if (!chapterNumber) {
      return NextResponse.json(
        { error: "Chapter number required" },
        { status: 400 }
      );
    }

    const book = await prisma.book.findFirst({ where: { slug } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const audioAsset = await prisma.audioAsset.findFirst({
      where: {
        bookId: book.id,
        chapterNumber: parseInt(chapterNumber),
      },
    });

    if (!audioAsset) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      audioUrl: audioAsset.audioUrl,
      duration: audioAsset.duration || "1:00",
      metadata: audioAsset.metadata,
    });
  } catch (error) {
    console.error("Error fetching audio:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch audio", details: message },
      { status: 500 }
    );
  }
}
