import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { question, learningContext } = body;

    if (!question || !learningContext) {
      return NextResponse.json(
        { error: "Bad request - missing question or learningContext" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          message: "Please add OPENAI_API_KEY to your .env file",
        },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are Dynasty Mentor, an intelligent learning analytics assistant for Dynasty Academy.
Your role is to analyze student learning data and provide personalized, actionable insights.

RULES:
- Use ONLY the provided data - never make up information
- Be specific and cite your sources using inline tags: [quiz], [video], [attention], [notes]
- Keep responses concise: 3 bullet points max + 1 next action
- Be encouraging but honest about areas needing improvement
- If data is insufficient, explain what needs to be collected
- Focus on actionable recommendations, not just observations

DATA INTERPRETATION:
- Quiz scores: 80%+ = excellent, 60-79% = good, below 60% = needs improvement
- Video engagement: 80%+ = great focus, 50-79% = moderate, below 50% = low engagement
- Attention scores: 70%+ = highly engaged, 40-69% = moderate, below 40% = distracted
- Pauses/seeks: Low = smooth learning, High = confusion or reviewing

RESPONSE FORMAT:
1. Quick diagnosis (1 line)
2. Key findings (2-3 bullets with citations)
3. Next action (1 specific recommendation)
`;

    const userPrompt = `
Student Question: "${question}"

Learning Data:
${JSON.stringify(learningContext, null, 2)}

Analyze this data and provide a helpful, actionable response.
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2, // Low temperature for consistent, factual responses
      max_tokens: 350,
    });

    const message = completion.choices[0].message?.content ?? "";

    return NextResponse.json({
      message,
      context: {
        totalEvents: learningContext.totalEvents,
        dateRange: learningContext.dateRange,
      },
    });
  } catch (error: any) {
    console.error("[chat-with-data] Error:", error);

    return NextResponse.json(
      {
        error: "Server error",
        message: error?.message ?? "Failed to process your question",
      },
      { status: 500 }
    );
  }
}
