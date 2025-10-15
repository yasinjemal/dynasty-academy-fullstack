import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { question, context, currentSentence, chatHistory } =
      await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Build conversation history for AI
    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful study buddy AI assisting someone who is listening to a book. 
You have access to what they're currently hearing and can answer questions about:
- The content they just heard
- Explanations of complex concepts
- Connections to other ideas
- Practical applications
- Clarifications

Be conversational, helpful, and concise. Keep responses under 100 words unless asked for more detail.`,
      },
    ];

    // Add context about what user is listening to
    if (currentSentence || context) {
      messages.push({
        role: "system",
        content: `CURRENT LISTENING CONTEXT:
${currentSentence ? `Currently playing: "${currentSentence}"` : ""}
${context ? `Surrounding context: ${context}` : ""}`,
      });
    }

    // Add previous chat history (last 10 messages)
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.slice(-10).forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add current question
    messages.push({
      role: "user",
      content: question,
    });

    // 🤖 AI generates context-aware response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast for real-time chat
      messages,
      temperature: 0.8, // Slightly creative but helpful
      max_tokens: 150,
    });

    const answer =
      completion.choices[0]?.message?.content ||
      "I'm here to help! Could you rephrase that question?";

    return NextResponse.json({
      success: true,
      answer,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("AI Study Buddy Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get AI response",
        answer:
          "I'm having trouble understanding right now. Try rephrasing your question!",
      },
      { status: 500 }
    );
  }
}
