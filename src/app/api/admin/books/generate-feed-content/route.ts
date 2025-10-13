import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import OpenAI from "openai";
import prisma from "@/lib/db/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Post type definitions
type PostType =
  | "quote"
  | "discussion"
  | "trivia"
  | "character"
  | "theme"
  | "recommendation";

interface GeneratedPost {
  type: PostType;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  coverImage?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const {
      bookId,
      bookTitle,
      bookAuthor,
      bookDescription,
      contentPreview,
      category,
    } = body;

    if (!bookId || !bookTitle) {
      return NextResponse.json(
        { error: "Book ID and title are required" },
        { status: 400 }
      );
    }

    // 3. Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    console.log(`🤖 Generating AI feed content for: ${bookTitle}`);

    // 4. Call OpenAI to generate diverse post content
    const prompt = `
You are a master content creator for a book community platform. Generate engaging social media posts about this book.

📚 BOOK DETAILS:
- Title: ${bookTitle}
- Author: ${bookAuthor || "Unknown"}
- Category: ${category || "General"}
- Description: ${bookDescription || "No description provided"}
${
  contentPreview
    ? `- Content Preview:\n${contentPreview.substring(0, 2000)}`
    : ""
}

🎯 GENERATE 10 VIRAL POSTS:

1. **POWERFUL QUOTE POST**: Extract or craft a thought-provoking quote from the book. Make it shareable and inspiring.

2. **DISCUSSION QUESTION**: Create a deep question that sparks debate and makes readers think.

3. **DID YOU KNOW? TRIVIA**: Share an interesting fact, context, or insight about the book, author, or themes.

4. **CHARACTER INSIGHT**: Analyze a key character, their motivation, or their development (if applicable).

5. **THEME BREAKDOWN**: Explain a major theme or concept from the book in an accessible way.

6. **BOOK RECOMMENDATION**: Suggest similar books readers might enjoy with brief reasoning.

7. **KEY TAKEAWAY**: Share one actionable lesson or insight from the book.

8. **CONTROVERSIAL TAKE**: Present a bold or unconventional interpretation that invites discussion.

9. **READER CHALLENGE**: Create an engagement prompt (e.g., "Share your favorite quote", "How would you react?").

10. **VISUAL CONCEPT**: Describe a memorable scene or concept perfect for imagery.

📝 FORMAT YOUR RESPONSE AS A JSON ARRAY:
[
  {
    "type": "quote" | "discussion" | "trivia" | "character" | "theme" | "recommendation" | "takeaway" | "controversial" | "challenge" | "visual",
    "title": "Catchy title (5-10 words)",
    "content": "Full post content (150-300 words, engaging and conversational)",
    "excerpt": "Hook sentence (1-2 lines)",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
  }
]

Make each post:
- ✅ Standalone and engaging
- ✅ Shareable on social media
- ✅ Conversation-starting
- ✅ Community-focused
- ✅ Professional but friendly tone

Return ONLY valid JSON, no markdown formatting.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content strategist who creates viral, engaging posts about books. You understand social media trends and community engagement. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // 5. Parse AI response
    let generatedPosts: GeneratedPost[];

    try {
      const parsed = JSON.parse(aiResponse);
      // Handle both direct array and wrapped object formats
      generatedPosts = Array.isArray(parsed) ? parsed : parsed.posts || [];
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Invalid JSON response from AI");
    }

    if (!Array.isArray(generatedPosts) || generatedPosts.length === 0) {
      throw new Error("AI did not generate valid posts");
    }

    console.log(`✅ AI generated ${generatedPosts.length} posts`);

    // 6. Create posts in database
    const createdPosts = [];
    const authorId = session.user.id;

    for (const postData of generatedPosts) {
      try {
        // Generate unique slug
        const baseSlug = postData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const slug = `${baseSlug}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)}`;

        // Create post
        const post = await prisma.post.create({
          data: {
            authorId,
            title: postData.title,
            slug,
            content: postData.content,
            excerpt: postData.excerpt,
            tags: postData.tags || [],
            coverImage: book.coverImage || null,
            published: true,
            publishedAt: new Date(),
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        });

        // Create feed item
        await prisma.feedItem.create({
          data: {
            userId: authorId,
            type: "POST",
            postId: post.id,
          },
        });

        createdPosts.push(post);
        console.log(`📝 Created post: ${post.title}`);
      } catch (createError) {
        console.error(`Failed to create post: ${postData.title}`, createError);
        // Continue with other posts even if one fails
      }
    }

    // 7. Update book metadata
    await prisma.book.update({
      where: { id: bookId },
      data: {
        updatedAt: new Date(),
      },
    });

    console.log(
      `🎉 Successfully created ${createdPosts.length} feed posts for: ${bookTitle}`
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${createdPosts.length} posts`,
      posts: createdPosts,
      bookId,
      bookTitle,
    });
  } catch (error: any) {
    console.error("❌ Feed content generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate feed content",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
