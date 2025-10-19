import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Voice command interpretation endpoint
export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript required" },
        { status: 400 }
      );
    }

    // Use GPT to interpret the voice command
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Dynasty AI, a voice navigation assistant for Dynasty Academy learning platform.

Your job is to interpret user voice commands and return a JSON response with navigation routes and responses.

Available routes:
- /dashboard - User's main dashboard
- /courses - Browse all courses
- /courses/[id] - Specific course (if user mentions a course)
- /profile - User profile and settings
- /profile?tab=notifications - Notifications
- /profile?tab=achievements - Achievements and progress
- /profile?tab=certificates - Certificates
- /books - Book library
- /community - Community feed
- /community/create - Create post
- /learning - Continue learning (last accessed)

Special commands:
- "what should I study" → Return personalized recommendation based on context
- "continue where I left off" → /learning (resume last session)
- "show my progress" → /profile?tab=achievements
- "help" or "what can you do" → Explain capabilities

Return JSON format:
{
  "route": "/path",
  "response": "Friendly confirmation message",
  "action": "navigate" | "suggest" | "info",
  "context": "Additional context if needed"
}

If the command is unclear or can't be interpreted, return:
{
  "route": null,
  "response": "I didn't understand that. Try saying 'courses', 'profile', 'dashboard', or 'help'",
  "action": "error"
}

Be conversational and friendly. Dynasty AI has personality!`,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 200,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Voice interpretation error:", error);
    return NextResponse.json(
      { error: "Failed to interpret command" },
      { status: 500 }
    );
  }
}
