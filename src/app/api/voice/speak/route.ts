import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Text-to-speech endpoint with ElevenLabs
export async function POST(request: NextRequest) {
  try {
    const { text, voice = "Rachel" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    // Generate audio with ElevenLabs
    const audio = await elevenlabs.generate({
      voice,
      text,
      model_id: "eleven_turbo_v2_5", // Fastest, lowest latency
    });

    // Convert audio stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return audio as base64
    return NextResponse.json({
      audio: buffer.toString("base64"),
      type: "audio/mpeg",
    });
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
