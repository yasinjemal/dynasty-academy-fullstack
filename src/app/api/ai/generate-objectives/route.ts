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

    const { title, description, category } = await req.json();

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
          content: `You are an expert learning designer. Generate 4-6 clear, actionable learning objectives.
Each objective should:
- Start with an action verb (Learn, Build, Master, Understand, Create, etc.)
- Be specific and measurable
- Focus on skills and outcomes
- Be achievable by the end of the course

Return ONLY valid JSON:
{
  "objectives": ["Objective 1", "Objective 2", "Objective 3", "Objective 4"]
}`,
        },
        {
          role: "user",
          content: `Generate learning objectives for:
Title: ${title}
Description: ${description || "A comprehensive course"}
Category: ${category || "General"}

Create 4-6 clear, actionable objectives.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || '{"objectives": []}'
    );

    const objectives = result.objectives || [
      `Master the fundamentals of ${title}`,
      `Build practical projects and applications`,
      `Apply best practices and industry standards`,
      `Develop skills for real-world scenarios`,
    ];

    return NextResponse.json({
      objectives,
    });
  } catch (error) {
    console.error("[AI Objectives] Error:", error);
    return NextResponse.json(
      {
        objectives: [
          "Gain comprehensive knowledge of the subject",
          "Build practical skills through hands-on practice",
          "Master key concepts and techniques",
          "Apply learning to real-world projects",
        ],
      },
      { status: 200 }
    );
  }
}
