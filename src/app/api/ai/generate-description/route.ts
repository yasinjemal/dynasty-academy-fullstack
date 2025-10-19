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

    const { title, category, level } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert course description writer. Create compelling, clear course descriptions that:
- Highlight what students will learn
- Explain the value and benefits
- Use engaging, professional language
- Include 2-3 paragraphs
- Focus on outcomes and transformation`,
        },
        {
          role: "user",
          content: `Write an engaging course description for:
Title: ${title}
Category: ${category || "General"}
Level: ${level || "All levels"}

Make it compelling and student-focused.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const description =
      completion.choices[0]?.message?.content ||
      `Learn everything you need to know about ${title}. This comprehensive course will take you from beginner to advanced level with practical examples and real-world applications.`;

    return NextResponse.json({
      description,
    });
  } catch (error) {
    console.error("[AI Description] Error:", error);
    return NextResponse.json(
      {
        description: `Transform your skills with this comprehensive course. You'll gain practical knowledge and hands-on experience that you can apply immediately.`,
      },
      { status: 200 } // Return fallback but still 200
    );
  }
}
