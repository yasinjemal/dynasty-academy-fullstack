import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sectionTitle, content } = await req.json();

    if (!sectionTitle) {
      return NextResponse.json(
        { error: "Section title is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a concise summarizer. Create a brief, clear summary (2-3 sentences) of what students will learn in this section.`,
        },
        {
          role: "user",
          content: `Summarize this course section:
Title: ${sectionTitle}
${content ? `Content: ${content}` : ""}

Create a clear, student-focused summary.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const summary =
      completion.choices[0]?.message?.content ||
      `In this section, you'll learn about ${sectionTitle.toLowerCase()}. We'll cover key concepts and practical applications.`;

    return NextResponse.json({
      summary,
    });
  } catch (error) {
    console.error("[AI Summary] Error:", error);
    return NextResponse.json(
      {
        summary: `Learn essential concepts and practical skills in this comprehensive section.`,
      },
      { status: 200 }
    );
  }
}
