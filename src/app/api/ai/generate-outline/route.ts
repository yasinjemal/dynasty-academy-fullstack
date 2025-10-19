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

    const { title, description, category, numSections = 10 } = await req.json();

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
          content: `You are an expert curriculum designer. Create a comprehensive course outline with sections and lessons.

Return ONLY valid JSON:
{
  "sections": [
    {
      "title": "Section title",
      "description": "What this section covers",
      "lessons": [
        {
          "title": "Lesson title",
          "type": "video",
          "duration": 15
        }
      ]
    }
  ]
}

Types can be: "video", "article", "quiz", "code", or "reflection"`,
        },
        {
          role: "user",
          content: `Create a ${numSections}-section course outline for:
Title: ${title}
Description: ${description || "A comprehensive course"}
Category: ${category || "General"}

Each section should have 2-4 lessons. Mix different lesson types. Progress from beginner to advanced.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || '{"sections": []}'
    );

    const sections = (result.sections || []).map(
      (section: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        title: section.title || `Section ${index + 1}`,
        description: section.description || "",
        lessons: (section.lessons || []).map((lesson: any, lIndex: number) => ({
          id: `lesson-${Date.now()}-${index}-${lIndex}`,
          title: lesson.title || `Lesson ${lIndex + 1}`,
          description: lesson.description || "",
          type: lesson.type || "video",
          duration: lesson.duration || 15,
          videoUrl: "",
          content: "",
        })),
      })
    );

    return NextResponse.json({
      sections,
    });
  } catch (error) {
    console.error("[AI Outline] Error:", error);

    // Return a basic outline as fallback
    const fallbackSections = Array.from({ length: 6 }, (_, i) => ({
      id: `fallback-${Date.now()}-${i}`,
      title: `Section ${i + 1}: Core Concepts`,
      description: "Essential knowledge and practical skills",
      lessons: [
        {
          id: `lesson-${Date.now()}-${i}-0`,
          title: "Introduction",
          description: "",
          type: "video",
          duration: 10,
          videoUrl: "",
          content: "",
        },
        {
          id: `lesson-${Date.now()}-${i}-1`,
          title: "Practice Exercise",
          description: "",
          type: "article",
          duration: 15,
          videoUrl: "",
          content: "",
        },
      ],
    }));

    return NextResponse.json(
      {
        sections: fallbackSections,
      },
      { status: 200 }
    );
  }
}
