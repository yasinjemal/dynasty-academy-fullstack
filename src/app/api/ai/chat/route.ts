/**
 * 🤖 DYNASTY AI COACH - CHAT API
 *
 * Real-time AI tutor available 24/7 for all students.
 * Context-aware, streaming responses, conversation history.
 *
 * Features:
 * - OpenAI GPT-4 integration
 * - RAG (Retrieval Augmented Generation) for course/book knowledge
 * - Streaming responses for real-time feel
 * - Conversation context tracking
 * - Sentiment analysis
 * - Cost tracking
 * - Rate limiting
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import OpenAI from "openai";
import { getEnhancedContext, buildContextPrompt } from "@/lib/ai/rag";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for Dynasty AI Coach
const SYSTEM_PROMPT = `You are the Dynasty AI Coach, a knowledgeable and encouraging AI tutor for Dynasty Academy students.

Your role:
- Help students understand course content and book materials
- Answer questions clearly and concisely
- Provide examples and analogies
- Encourage continuous learning
- Be supportive and motivating
- Adapt to the student's level

Your personality:
- Professional yet friendly
- Patient and understanding
- Enthusiastic about learning
- Use occasional emojis (📚, 🎯, 💡, ⚡, 🚀) to be engaging
- Never be condescending or dismissive

Guidelines:
- Keep responses concise (2-4 paragraphs max)
- Use markdown formatting for better readability
- Provide actionable next steps when appropriate
- If you don't know something, admit it honestly
- Always encourage the student to keep learning

Context awareness:
- You have access to the user's current page and learning context
- Reference their progress and achievements when relevant
- Suggest related lessons or resources from Dynasty Academy

📚 RAG (Retrieval Augmented Generation):
- When relevant content is provided from books/courses, USE IT as your primary source
- Quote directly from the source material with page numbers: "As stated in [Book Title, Page X]..."
- If the source content answers the question, reference it explicitly
- If no relevant content is found, use your general knowledge but mention it
- Always prioritize accuracy from Dynasty Academy materials over general knowledge
`;

/**
 * POST /api/ai/chat
 * Send message to AI Coach and get response
 */
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

    // 2️⃣ Get request body
    const body = await request.json();
    const {
      message,
      conversationId,
      context, // { page, courseId?, lessonId?, bookId? }
    } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 3️⃣ Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        level: true,
        dynastyScore: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ Rate limiting check (10 messages per minute)
    // NOTE: This counts message pairs (user + AI response) not conversations
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // Count recent message exchanges (each conversation update = 2 messages)
    const recentConversations = await prisma.aiConversation.findMany({
      where: {
        userId: user.id,
        updatedAt: { gte: oneMinuteAgo },
      },
      select: {
        messageCount: true,
      },
    });

    // Calculate total messages in last minute
    const totalRecentMessages = recentConversations.reduce(
      (sum, conv) => sum + conv.messageCount,
      0
    );

    // Allow up to 20 messages (10 exchanges) per minute
    if (totalRecentMessages >= 20) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Please wait a moment before sending another message.",
          retryAfter: 60,
        },
        { status: 429 }
      );
    }

    // 5️⃣ Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation || conversation.userId !== user.id) {
        return NextResponse.json(
          { error: "Conversation not found or unauthorized" },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      conversation = await prisma.aiConversation.create({
        data: {
          userId: user.id,
          messages: [],
          messageCount: 0,
          context: context || {},
          status: "ACTIVE",
        },
      });
    }

    // 6️⃣ Build conversation history
    const messages = (conversation.messages as any[]) || [];

    // Add context to first message
    let contextPrompt = "";
    if (context) {
      contextPrompt = `\n\n[Student Context: Currently on ${
        context.page || "unknown page"
      }`;
      if (context.courseId) contextPrompt += `, studying course`;
      if (context.lessonId) contextPrompt += `, on specific lesson`;
      if (context.bookId) contextPrompt += `, reading book`;
      contextPrompt += `]`;
    }

    // Add user info
    const userInfoPrompt = `\n\n[Student Info: ${
      user.name || "Student"
    }, Level ${user.level}, Dynasty Score: ${user.dynastyScore}]`;

    // 6.5️⃣ RAG: Search for relevant content using Pinecone vector search
    let ragContext = "";
    try {
      const enhancedContext = await getEnhancedContext({
        query: message,
        userId: user.id,
        currentContext: context,
      });

      // Build RAG context from search results
      ragContext = buildContextPrompt(enhancedContext.relevantContexts);

      // Add current content context if available
      if (enhancedContext.currentContent) {
        ragContext += `\n📍 CURRENT CONTENT:\n`;
        if (context?.lessonId) {
          ragContext += `Lesson: "${enhancedContext.currentContent.title}"\n`;
          ragContext += `Content: ${enhancedContext.currentContent.content?.substring(
            0,
            500
          )}...\n\n`;
        } else if (context?.courseId) {
          ragContext += `Course: "${enhancedContext.currentContent.title}"\n`;
          ragContext += `${enhancedContext.currentContent.description}\n\n`;
        } else if (context?.bookId) {
          ragContext += `Book: "${enhancedContext.currentContent.title}" by ${enhancedContext.currentContent.author}\n`;
          ragContext += `${enhancedContext.currentContent.description}\n\n`;
        }
      }

      // Add user progress context
      if (enhancedContext.userProgress) {
        ragContext += `\n🎯 STUDENT PROGRESS:\n`;
        ragContext += `Enrolled in: "${enhancedContext.userProgress.course.title}"\n`;
        ragContext += `Progress: ${enhancedContext.userProgress.progress}%\n\n`;
      }
    } catch (error) {
      console.error("❌ RAG search error (continuing without):", error);
      // Gracefully continue without RAG if there's an error
    }

    // 7️⃣ Prepare OpenAI messages
    const openAiMessages: any[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT + userInfoPrompt + contextPrompt + ragContext,
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // 8️⃣ Call OpenAI (streaming)
    const startTime = Date.now();

    const stream = await openai.chat.completions.create({
      model: "gpt-4", // or 'gpt-4-turbo-preview' for faster responses
      messages: openAiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 800,
    });

    // 9️⃣ Stream response
    let fullResponse = "";
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          const responseTime = (Date.now() - startTime) / 1000;

          // 🔟 Update conversation in database
          const updatedMessages = [
            ...messages,
            {
              role: "user",
              content: message,
              timestamp: new Date().toISOString(),
            },
            {
              role: "assistant",
              content: fullResponse,
              timestamp: new Date().toISOString(),
            },
          ];

          // Estimate tokens (rough calculation)
          const estimatedTokens = Math.ceil(
            (message.length + fullResponse.length) / 4
          );
          const estimatedCost = (estimatedTokens / 1000) * 0.03; // ~$0.03 per 1K tokens for GPT-4

          // Sentiment analysis (basic)
          const sentiment = analyzeSentiment(fullResponse);

          await prisma.aiConversation.update({
            where: { id: conversation.id },
            data: {
              messages: updatedMessages,
              messageCount: { increment: 2 }, // user + assistant
              responseTime,
              tokensUsed: { increment: estimatedTokens },
              cost: { increment: estimatedCost },
              sentiment,
              updatedAt: new Date(),
            },
          });

          // 1️⃣1️⃣ Extract insights (async - don't wait)
          extractInsights(message, fullResponse, context, user.id).catch(
            console.error
          );

          // Send completion event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                conversationId: conversation.id,
                responseTime,
              })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          console.error("❌ Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("❌ AI Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat message" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/chat?conversationId=xxx
 * Get conversation history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (conversationId) {
      // Get specific conversation
      const conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation || conversation.userId !== user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ conversation });
    } else {
      // Get all user conversations
      const conversations = await prisma.aiConversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: {
          id: true,
          topic: true,
          messageCount: true,
          status: true,
          context: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({ conversations });
    }
  } catch (error: any) {
    console.error("❌ Get conversations error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Basic sentiment analysis
 * Returns score from -1 (negative) to 1 (positive)
 */
function analyzeSentiment(text: string): number {
  const positiveWords = [
    "great",
    "excellent",
    "good",
    "helpful",
    "thanks",
    "perfect",
    "awesome",
    "wonderful",
  ];
  const negativeWords = [
    "bad",
    "wrong",
    "error",
    "confused",
    "stuck",
    "difficult",
    "hard",
    "problem",
  ];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) score += 0.1;
    if (negativeWords.includes(word)) score -= 0.1;
  });

  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, score));
}

/**
 * Extract insights from conversation for admin dashboard
 * Identifies: confusion points, frequently asked questions, content gaps
 */
async function extractInsights(
  userMessage: string,
  aiResponse: string,
  context: any,
  userId: string
): Promise<void> {
  try {
    // Check for confusion indicators
    const confusionKeywords = [
      "confused",
      "don't understand",
      "what does",
      "explain",
      "clarify",
      "help",
    ];
    const isConfused = confusionKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword)
    );

    if (isConfused && context?.lessonId) {
      // Record confusion about specific lesson
      const existingConfusion = await prisma.aiInsight.findFirst({
        where: {
          type: "CONFUSION",
          relatedTo: context.lessonId,
        },
      });

      if (existingConfusion) {
        await prisma.aiInsight.update({
          where: { id: existingConfusion.id },
          data: {
            frequency: { increment: 1 },
            userCount: { increment: 1 },
          },
        });
      } else {
        await prisma.aiInsight.create({
          data: {
            type: "CONFUSION",
            category: "lesson",
            content: `Users are confused about this lesson`,
            question: userMessage.slice(0, 500),
            relatedTo: context.lessonId,
            relatedType: "lesson",
            frequency: 1,
            userCount: 1,
            priority: "MEDIUM",
          },
        });
      }
    }

    // Check for frequently asked questions
    const isQuestion =
      userMessage.includes("?") ||
      userMessage.toLowerCase().startsWith("what") ||
      userMessage.toLowerCase().startsWith("how") ||
      userMessage.toLowerCase().startsWith("why");

    if (isQuestion) {
      // Store common question
      const questionKey = userMessage.toLowerCase().slice(0, 100);

      // Find similar existing question (simplified check)
      const existingInsight = await prisma.aiInsight.findFirst({
        where: {
          type: "QUESTION",
          question: { contains: questionKey.split(" ").slice(0, 5).join(" ") },
        },
      });

      if (existingInsight) {
        await prisma.aiInsight.update({
          where: { id: existingInsight.id },
          data: {
            frequency: { increment: 1 },
            userCount: { increment: 1 },
          },
        });
      } else {
        await prisma.aiInsight.create({
          data: {
            type: "QUESTION",
            category: context?.courseId ? "course" : "general",
            content: `Frequently asked: ${userMessage.slice(0, 200)}`,
            question: userMessage.slice(0, 500),
            relatedTo: context?.courseId || context?.bookId,
            relatedType: context?.courseId
              ? "course"
              : context?.bookId
              ? "book"
              : null,
            frequency: 1,
            userCount: 1,
            priority: "LOW",
          },
        });
      }
    }
  } catch (error) {
    console.error("❌ Extract insights error:", error);
    // Don't throw - insights are non-critical
  }
}
