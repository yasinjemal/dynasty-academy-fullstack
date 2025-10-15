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

    // Check cache first (by bookId + chapterNumber)
    const existingAudio = await prisma.audioAsset.findFirst({
      where: {
        bookId: book.id,
        chapterNumber: parseInt(chapterNumber),
      },
    });

    if (existingAudio) {
      const metadata = (existingAudio.metadata as { wordCount?: number }) || {};
      console.log(
        "✅ Cache hit! Saved $",
        (((metadata.wordCount || 500) / 1000) * 0.18).toFixed(2)
      );
      return NextResponse.json({
        success: true,
        audioUrl: existingAudio.audioUrl,
        duration: existingAudio.duration || "1:00",
        cached: true,
      });
    }

    console.log("🎙️ Generating new audio with ElevenLabs...");
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
      console.error("ElevenLabs error:", errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
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

    await prisma.audioAsset.create({
      data: {
        bookId: book.id,
        chapterNumber: parseInt(chapterNumber),
        voiceId,
        audioUrl,
        duration,
        metadata: {
          contentHash,
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
