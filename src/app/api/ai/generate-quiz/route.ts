import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { content, bookId, chapterId } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // 🎮 AI generates quiz question from listened content
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a learning assistant creating quiz questions from audiobook content.
Generate 1 multiple-choice question to test comprehension and retention.
Format your response as JSON with this structure:
{
  "question": "Clear question about key concept",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0-3 (index of correct option),
  "explanation": "Why this answer is correct"
}`,
        },
        {
          role: "user",
          content: `Create a quiz question from this audiobook section:\n\n${content}\n\nMake it challenging but fair. Test understanding, not memorization.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const quizData = JSON.parse(completion.choices[0]?.message?.content || "{}");

    return NextResponse.json({
      question: quizData.question || "What was the main idea discussed?",
      options: quizData.options || ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: quizData.correctAnswer ?? 0,
      explanation: quizData.explanation || "This captures the key concept from the section.",
    });

  } catch (error) {
    console.error("[Quiz Generation] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate quiz",
        question: "What did you just learn?",
        options: ["Important concept", "Key idea", "Main point", "All of the above"],
        correctAnswer: 3,
        explanation: "All options represent valuable learning!",
      },
      { status: 500 }
    );
  }
}
