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

    const { lessonTitle, sectionTitle, courseTitle } = await req.json();

    if (!lessonTitle) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are creating thoughtful reflection questions for students. Generate 3-4 reflection questions that encourage deep thinking and practical application.`,
        },
        {
          role: "user",
          content: `Create reflection questions for this lesson:
Course: ${courseTitle || ""}
Section: ${sectionTitle || ""}
Lesson: ${lessonTitle}

Generate 3-4 questions that help students:
1. Reflect on what they learned
2. Apply concepts to their own situation
3. Plan next steps

Return as JSON array of strings.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Try to parse JSON, fallback to default questions
    let reflectionQuestions: string[];
    try {
      reflectionQuestions = JSON.parse(content);
      if (
        !Array.isArray(reflectionQuestions) ||
        reflectionQuestions.length === 0
      ) {
        throw new Error("Invalid format");
      }
    } catch {
      reflectionQuestions = [
        `What was the most important concept you learned in "${lessonTitle}"?`,
        "How can you apply this knowledge to your own projects or goals?",
        "What questions do you still have, and what will you explore next?",
      ];
    }

    return NextResponse.json({
      reflectionQuestions,
    });
  } catch (error) {
    console.error("[AI Reflection] Error:", error);
    return NextResponse.json(
      {
        reflectionQuestions: [
          "What key insights did you gain from this lesson?",
          "How will you apply what you learned?",
          "What's your next step to master this skill?",
        ],
      },
      { status: 200 }
    );
  }
}
