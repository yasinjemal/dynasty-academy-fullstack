/**
 * 🤖 DYNASTY AI COACH - DEDICATED ENDPOINT
 *
 * Context-aware AI coach with RAG (Retrieval Augmented Generation)
 * Uses vector embeddings for semantic search across book content.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { searchSimilarContent } from "@/lib/embeddings";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const COACH_SYSTEM_PROMPT = `You are the Dynasty AI Coach, an expert reading companion and tutor.

Your role:
- Help students understand the book they're currently reading
- Answer questions about specific pages and concepts
- Provide insights and connections to other topics
- Encourage critical thinking and deeper comprehension
- Be supportive, engaging, and encouraging

Your personality:
- Knowledgeable yet approachable
- Enthusiastic about learning
- Use occasional emojis (📚, 💡, 🎯, ⚡, 🚀) to be engaging
- Patient and understanding

Guidelines:
- Reference the specific page content when answering
- Keep responses concise (2-4 paragraphs max)
- Use markdown formatting for better readability
- Quote directly from the text when relevant: "As stated on this page..."
- Provide actionable next steps or reflection questions
- Always tie answers back to the current reading context

Context awareness:
- You have access to the current page text and book details
- The user's reading progress and stats are provided
- Reference these contextually in your responses
- Adapt your teaching style to their reading pace and comprehension
`;

export interface CoachContext {
  bookId: string;
  bookSlug?: string;
  bookTitle: string;
  pageNumber: number;
  totalPages: number;
  pageText: string;
  userStats?: {
    wpm?: number;
    minutesToday?: number;
    progressPct?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // 2️⃣ Parse and validate request
    const body = await request.json().catch(() => ({}));
    const {
      message,
      context,
    }: {
      message: string;
      context: CoachContext;
    } = body;

    // Validate required fields
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!context) {
      return NextResponse.json(
        { error: "Context is required" },
        { status: 400 }
      );
    }

    // Validate context fields
    const requiredFields = [
      "bookId",
      "bookTitle",
      "pageNumber",
      "totalPages",
      "pageText",
    ];
    const missingFields = requiredFields.filter(
      (field) => !context[field as keyof CoachContext]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required context fields: ${missingFields.join(", ")}`,
          details:
            "The AI Coach needs full reading context to provide helpful responses.",
        },
        { status: 400 }
      );
    }

    // 3️⃣ Use RAG to find related content (optional enhancement)
    let ragContext = "";
    try {
      // Search for semantically similar content from the book
      const similarContent = await searchSimilarContent(message, {
        filterType: "book",
        filterId: context.bookId,
        matchCount: 3,
        matchThreshold: 0.75,
      });

      if (similarContent.length > 0) {
        ragContext = "\n\n📖 **Related Content from this Book:**\n";
        similarContent.forEach((result, index) => {
          const pageInfo = result.page_number
            ? ` (Page ${result.page_number})`
            : "";
          ragContext += `\n${
            index + 1
          }. ${pageInfo}\n"${result.chunk_text.slice(0, 200)}..."\n`;
        });
      }
    } catch (ragError) {
      console.log("⚠️ RAG search skipped:", ragError);
      // Continue without RAG if it fails
    }

    // 4️⃣ Build contextual prompt
    const contextPrompt = buildContextPrompt(context, ragContext);

    // 5️⃣ Call OpenAI with streaming
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: COACH_SYSTEM_PROMPT,
        },
        {
          role: "system",
          content: contextPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 800,
    });

    // 5️⃣ Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          // Send done signal
          const doneData = `data: ${JSON.stringify({ done: true })}\n\n`;
          controller.enqueue(encoder.encode(doneData));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("❌ AI Coach error:", error);
    return NextResponse.json(
      {
        error: "Failed to get AI response",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Build context-rich prompt from reading state + RAG results
 */
function buildContextPrompt(
  context: CoachContext,
  ragContext: string = ""
): string {
  const { bookTitle, pageNumber, totalPages, pageText, userStats } = context;

  const progressPct = Math.round((pageNumber / totalPages) * 100);
  const pagePreview = pageText.slice(0, 2000); // Limit to ~2000 chars for token efficiency

  let prompt = `📚 CURRENT READING CONTEXT:

**Book:** "${bookTitle}"
**Page:** ${pageNumber} of ${totalPages} (${progressPct}% complete)

**Current Page Content:**
${pagePreview}${
    pageText.length > 2000 ? "\n\n[...content truncated for brevity]" : ""
  }
`;

  // Add RAG context if available
  if (ragContext) {
    prompt += ragContext;
  }

  if (userStats) {
    prompt += `\n\n**Reader Stats:**`;
    if (userStats.wpm) prompt += `\n- Reading speed: ${userStats.wpm} WPM`;
    if (userStats.minutesToday)
      prompt += `\n- Time today: ${userStats.minutesToday} min`;
    if (userStats.progressPct)
      prompt += `\n- Overall progress: ${userStats.progressPct}%`;
  }

  prompt += `\n\nWhen answering, reference the current page content primarily, and use the related content for additional context when helpful. Be specific and cite page numbers when referencing other parts of the book.`;

  return prompt;
}
