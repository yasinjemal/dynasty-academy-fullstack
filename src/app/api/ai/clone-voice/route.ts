import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const voiceName = formData.get("name") as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenlabsApiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    // Convert File to Buffer for ElevenLabs
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🎙️ Step 1: Add voice to ElevenLabs Voice Lab
    const addVoiceFormData = new FormData();
    addVoiceFormData.append("name", voiceName || "User Cloned Voice");
    addVoiceFormData.append(
      "files",
      new Blob([buffer], { type: "audio/webm" }),
      "sample.webm"
    );
    addVoiceFormData.append(
      "description",
      "User cloned voice from Dynasty Academy"
    );

    const addVoiceResponse = await fetch(
      "https://api.elevenlabs.io/v1/voices/add",
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenlabsApiKey,
        },
        body: addVoiceFormData,
      }
    );

    if (!addVoiceResponse.ok) {
      const error = await addVoiceResponse.text();
      console.error("[Voice Cloning] ElevenLabs error:", error);
      return NextResponse.json(
        { error: "Failed to clone voice with ElevenLabs" },
        { status: 500 }
      );
    }

    const voiceData = await addVoiceResponse.json();

    console.log("[Voice Cloning] Success:", {
      voiceId: voiceData.voice_id,
      name: voiceName,
    });

    return NextResponse.json({
      success: true,
      voiceId: voiceData.voice_id,
      name: voiceName,
      message: "Voice cloned successfully! You can now use it for audiobooks.",
    });
  } catch (error) {
    console.error("[Voice Cloning] Error:", error);
    return NextResponse.json(
      { error: "Failed to process voice cloning request" },
      { status: 500 }
    );
  }
}
