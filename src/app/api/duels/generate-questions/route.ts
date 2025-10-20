import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import OpenAI from "openai";

/**
 * 🤖⚔️ AI QUESTION GENERATOR FOR DUELS
 * Generates 5 smart questions from book chapter content
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 🔐 Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookId, chapterId, pageNumber, difficulty = "medium" } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required" },
        { status: 400 }
      );
    }

    // Get book details
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Get chapter/page content (for context)
    let contentContext = "";

    if (pageNumber) {
      // Get specific page content
      const pageContent = await prisma.bookContent.findFirst({
        where: {
          bookId,
          pageNumber,
        },
      });

      if (pageContent) {
        contentContext = pageContent.content.substring(0, 3000); // Limit to 3000 chars
      }
    }

    // If no content found, use book description as fallback
    if (!contentContext) {
      contentContext = book.description;
    }

    console.log(
      `🤖 Generating questions for "${book.title}" (difficulty: ${difficulty})`
    );

    // Generate questions using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert quiz creator for a knowledge battle game called "Dynasty Duels". 
          
Your task: Create 5 challenging multiple-choice questions based on the provided book content.

Rules:
1. Questions must be SPECIFIC to the content provided
2. Each question has 4 options (A, B, C, D)
3. Only ONE correct answer
4. Include clear explanations for the correct answer
5. Vary difficulty based on the provided level: ${difficulty}
6. Question types: factual recall, concept understanding, application, critical thinking
7. Make it fun and competitive!

Difficulty levels:
- easy: Straightforward facts, direct quotes
- medium: Concepts, understanding, relationships
- hard: Application, analysis, synthesis, critical thinking

Format your response as valid JSON array:
[
  {
    "questionText": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "The answer is A because...",
    "difficulty": 0.5,
    "estimatedTime": 15
  }
]`,
        },
        {
          role: "user",
          content: `Book: "${book.title}"
Category: ${book.category}
${chapterId ? `Chapter: ${chapterId}` : ""}
${pageNumber ? `Page: ${pageNumber}` : ""}

Content:
${contentContext}

Generate 5 ${difficulty} difficulty questions for a 60-second knowledge battle.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

    // Parse the JSON response
    let questions;
    try {
      // Try to extract JSON from the response (sometimes GPT adds markdown)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      throw new Error("Failed to parse AI response");
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format from AI");
    }

    // Ensure we have exactly 5 questions
    questions = questions.slice(0, 5);

    // Add metadata
    const enhancedQuestions = questions.map((q: any, index: number) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      questionOrder: index + 1,
      difficulty:
        q.difficulty ||
        (difficulty === "easy" ? 0.3 : difficulty === "hard" ? 0.8 : 0.5),
      estimatedTime: q.estimatedTime || 12,
      pageReference: pageNumber || null,
    }));

    console.log(
      `✅ Generated ${enhancedQuestions.length} questions successfully!`
    );

    return NextResponse.json({
      success: true,
      questions: enhancedQuestions,
      bookTitle: book.title,
      difficulty,
    });
  } catch (error: any) {
    console.error("❌ Question generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
