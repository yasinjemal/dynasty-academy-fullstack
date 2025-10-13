import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, title, author, contentPreview, totalPages, wordCount } =
      await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Missing required data: title is required" },
        { status: 400 }
      );
    }

    // If no content preview, use title and author for analysis
    const hasContent = contentPreview && contentPreview.trim().length > 0;
    if (!hasContent) {
      console.log("No content preview available, analyzing based on title and metadata only");
    }

    // Create comprehensive AI prompt
    const prompt = `You are an expert book analyst, marketer, and publisher. Analyze this book comprehensively.

BOOK INFORMATION:
Title: "${title}"
Author: "${author || 'Unknown'}"
Pages: ${totalPages || 'Unknown'}
Word Count: ${wordCount || 'Unknown'}
${hasContent ? `Content Preview (first 2000 characters):\n"""\n${contentPreview}\n"""` : 'Note: No content preview available. Please analyze based on the title and metadata provided.'}

PROVIDE A COMPREHENSIVE ANALYSIS:

1. **Compelling Description** (200-250 words):
   - Hook readers in the first sentence
   - Highlight key themes and value propositions
   - Create emotional connection
   - End with a call-to-action tone
   - Professional marketing copywriting

2. **Category** (choose ONE most appropriate):
   Business, Self-Help, Fiction, Non-Fiction, Technology, Science, History, Philosophy, Psychology, Health, Biography, Mystery, Romance, Fantasy, Thriller

3. **Detailed Tags** (8-12 relevant keywords):
   - Mix of broad and specific terms
   - Include genre, themes, target audience descriptors
   - SEO-optimized keywords

4. **Target Audience** (50-100 words):
   - Who should read this book?
   - Demographics and psychographics
   - Reader interests and pain points

5. **Reading Level**:
   Beginner, Intermediate, Advanced, Expert

6. **Key Themes & Topics** (5-8 main themes):
   - Core concepts covered
   - Major topics discussed

7. **Suggested Price** ($9.99-$49.99):
   - Based on length, complexity, market positioning
   - Consider: page count, genre, target audience, perceived value
   - Provide brief reasoning

8. **SEO Metadata**:
   - Meta Title (under 60 characters, engaging)
   - Meta Description (under 160 characters, compelling)
   - URL Slug (kebab-case)

9. **Category Confidence** (percentage 0-100):
   - How confident are you in the category selection?

10. **Estimated Market Value**:
    - Low, Medium, High (based on content quality, uniqueness, market demand)

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "title": "refined or confirmed title",
  "author": "confirmed or extracted author",
  "description": "compelling 200-250 word description",
  "category": "primary category",
  "categoryConfidence": 95,
  "tags": ["tag1", "tag2", "tag3", ...],
  "targetAudience": "detailed audience description",
  "readingLevel": "Intermediate",
  "themes": ["theme1", "theme2", ...],
  "topics": ["topic1", "topic2", ...],
  "suggestedPrice": 29.99,
  "priceReasoning": "brief pricing explanation",
  "metaTitle": "SEO title",
  "metaDescription": "SEO description",
  "slug": "url-friendly-slug",
  "marketValue": "Medium",
  "keySellingPoints": ["point1", "point2", "point3"]
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert book analyst and publisher. Always respond with valid JSON only, no markdown formatting. Provide comprehensive, professional analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      throw new Error("Invalid response format from AI");
    }

    // Validate required fields
    const requiredFields = [
      "description",
      "category",
      "tags",
      "targetAudience",
      "readingLevel",
      "themes",
      "suggestedPrice",
      "metaTitle",
      "metaDescription",
      "slug",
    ];

    const missingFields = requiredFields.filter((field) => !analysis[field]);

    if (missingFields.length > 0) {
      console.error("Missing fields in AI response:", missingFields);
      throw new Error(
        `AI response missing required fields: ${missingFields.join(", ")}`
      );
    }

    // Add cover image generation option (placeholder for now)
    // TODO: Implement DALL-E 3 cover generation if needed
    analysis.coverImage = null; // Will add DALL-E integration later

    return NextResponse.json({
      success: true,
      ...analysis,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    });
  } catch (error) {
    console.error("AI Deep Analysis Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "OpenAI API key not configured" },
          { status: 500 }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "AI service rate limit exceeded. Please wait and try again.",
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to analyze book content. Please try again." },
      { status: 500 }
    );
  }
}
