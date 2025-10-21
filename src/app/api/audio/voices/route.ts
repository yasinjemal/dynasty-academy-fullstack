import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

/**
 * GET /api/audio/voices
 * Returns available TTS voices from all providers with cost comparison
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Voice library with cost and quality data
    const voices = [
      // ElevenLabs Voices (Ultra Quality)
      {
        id: "21m00Tcm4TlvDq8ikWAM",
        name: "Rachel",
        provider: "elevenlabs" as const,
        gender: "female" as const,
        accent: "American English",
        description:
          "Warm, engaging voice perfect for audiobooks and narration",
        quality: "ultra" as const,
        costPerChar: 0.0000003, // $0.30 per 1M chars
        emotionalRange: 9,
        naturalness: 10,
        recommended: true,
        tags: ["audiobook", "narration", "professional"],
      },
      {
        id: "VR6AewLTigWG4xSOukaG",
        name: "Arnold",
        provider: "elevenlabs" as const,
        gender: "male" as const,
        accent: "American English",
        description: "Deep, authoritative voice ideal for educational content",
        quality: "ultra" as const,
        costPerChar: 0.0000003,
        emotionalRange: 8,
        naturalness: 10,
        recommended: true,
        tags: ["education", "documentary", "authoritative"],
      },
      {
        id: "EXAVITQu4vr4xnSDxMaL",
        name: "Bella",
        provider: "elevenlabs" as const,
        gender: "female" as const,
        accent: "British English",
        description: "Elegant British accent, perfect for classic literature",
        quality: "ultra" as const,
        costPerChar: 0.0000003,
        emotionalRange: 9,
        naturalness: 10,
        recommended: false,
        tags: ["british", "elegant", "literature"],
      },

      // OpenAI Voices (Premium Quality - 20x cheaper!)
      {
        id: "alloy",
        name: "Alloy",
        provider: "openai" as const,
        gender: "neutral" as const,
        accent: "American English",
        description: "Balanced, versatile voice for general content",
        quality: "premium" as const,
        costPerChar: 0.000000015, // $0.015 per 1M chars
        emotionalRange: 7,
        naturalness: 8,
        recommended: true,
        tags: ["versatile", "neutral", "general"],
      },
      {
        id: "echo",
        name: "Echo",
        provider: "openai" as const,
        gender: "male" as const,
        accent: "American English",
        description: "Clear, professional male voice",
        quality: "premium" as const,
        costPerChar: 0.000000015,
        emotionalRange: 7,
        naturalness: 8,
        recommended: false,
        tags: ["professional", "clear", "business"],
      },
      {
        id: "fable",
        name: "Fable",
        provider: "openai" as const,
        gender: "female" as const,
        accent: "British English",
        description: "Expressive British voice with character",
        quality: "premium" as const,
        costPerChar: 0.000000015,
        emotionalRange: 8,
        naturalness: 8,
        recommended: false,
        tags: ["expressive", "storytelling", "british"],
      },
      {
        id: "onyx",
        name: "Onyx",
        provider: "openai" as const,
        gender: "male" as const,
        accent: "American English",
        description: "Deep, commanding voice",
        quality: "premium" as const,
        costPerChar: 0.000000015,
        emotionalRange: 7,
        naturalness: 8,
        recommended: false,
        tags: ["deep", "commanding", "powerful"],
      },
      {
        id: "nova",
        name: "Nova",
        provider: "openai" as const,
        gender: "female" as const,
        accent: "American English",
        description: "Energetic, youthful voice",
        quality: "premium" as const,
        costPerChar: 0.000000015,
        emotionalRange: 8,
        naturalness: 8,
        recommended: true,
        tags: ["energetic", "youthful", "engaging"],
      },
      {
        id: "shimmer",
        name: "Shimmer",
        provider: "openai" as const,
        gender: "female" as const,
        accent: "American English",
        description: "Soft, gentle voice",
        quality: "premium" as const,
        costPerChar: 0.000000015,
        emotionalRange: 7,
        naturalness: 8,
        recommended: false,
        tags: ["soft", "gentle", "soothing"],
      },

      // Google Voices (Standard Quality - 75x cheaper!)
      {
        id: "en-US-Standard-A",
        name: "Google Male A",
        provider: "google" as const,
        gender: "male" as const,
        accent: "American English",
        description: "Standard quality male voice for casual content",
        quality: "standard" as const,
        costPerChar: 0.000000004, // $0.004 per 1M chars
        emotionalRange: 5,
        naturalness: 6,
        recommended: false,
        tags: ["standard", "casual", "budget"],
      },
      {
        id: "en-US-Standard-B",
        name: "Google Male B",
        provider: "google" as const,
        gender: "male" as const,
        accent: "American English",
        description: "Alternative standard male voice",
        quality: "standard" as const,
        costPerChar: 0.000000004,
        emotionalRange: 5,
        naturalness: 6,
        recommended: false,
        tags: ["standard", "casual", "budget"],
      },
      {
        id: "en-US-Standard-C",
        name: "Google Female C",
        provider: "google" as const,
        gender: "female" as const,
        accent: "American English",
        description: "Standard quality female voice",
        quality: "standard" as const,
        costPerChar: 0.000000004,
        emotionalRange: 5,
        naturalness: 6,
        recommended: false,
        tags: ["standard", "casual", "budget"],
      },
      {
        id: "en-US-Wavenet-A",
        name: "Google Wavenet A",
        provider: "google" as const,
        gender: "male" as const,
        accent: "American English",
        description: "Higher quality Wavenet voice",
        quality: "premium" as const,
        costPerChar: 0.000000016,
        emotionalRange: 6,
        naturalness: 7,
        recommended: false,
        tags: ["wavenet", "improved", "budget"],
      },
    ];

    return NextResponse.json({ voices });
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 }
    );
  }
}
