import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { sentence, context, bookId, chapterId } = await req.json();

    if (!sentence) {
      return NextResponse.json(
        { error: "Sentence is required" },
        { status: 400 }
      );
    }

    // 💡 AI analyzes sentence with surrounding context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective
      messages: [
        {
          role: "system",
          content: `You are a brilliant study buddy helping users extract maximum value from books. 
Analyze sentences and provide:
1. A one-sentence summary (what it means)
2. A key insight (why it matters)
3. An actionable takeaway (how to apply it)

Be concise, insightful, and practical.`,
        },
        {
          role: "user",
          content: `Analyze this sentence from a book:

TARGET SENTENCE: "${sentence}"

CONTEXT: ${context || "No additional context"}

Provide:
1. Summary: (one clear sentence)
2. Insight: (why this matters)
3. Action: (how to apply this)`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content || "";

    // Parse AI response (simple extraction with fallback)
    const lines = response.split("\n").filter((l) => l.trim());
    let aiSummary = "This sentence captures a key idea.";
    let keyInsight = "Understanding this deepens your knowledge.";
    let actionable = "Reflect on how this applies to your life.";

    // Extract sections by keyword matching
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("Summary:")) {
        aiSummary = line.replace(/^.*?Summary:\s*/i, "").trim() || aiSummary;
      } else if (line.includes("Insight:")) {
        keyInsight = line.replace(/^.*?Insight:\s*/i, "").trim() || keyInsight;
      } else if (line.includes("Action:")) {
        actionable = line.replace(/^.*?Action:\s*/i, "").trim() || actionable;
      }
    }

    return NextResponse.json({
      success: true,
      aiSummary,
      keyInsight,
      actionable,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze sentence",
        aiSummary: "This sentence contains important information.",
        keyInsight: "Every sentence in a book serves a purpose.",
        actionable: "Think about how this connects to what you already know.",
      },
      { status: 500 }
    );
  }
}
