/**
 * AI Lesson Content Generator
 *
 * Transforms course outlines into rich, engaging lesson content
 * Features:
 * - Full lesson content generation with RAG
 * - Multiple content styles (conversational, academic, practical)
 * - Smart chunking and pacing
 * - Examples and exercises
 * - Cost tracking and quality metrics
 */

import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";
import { searchSimilarContent, SearchResult } from "./embeddings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const prisma = new PrismaClient();

// Types
export interface LessonGenerationConfig {
  contentStyle?: "conversational" | "academic" | "practical";
  includeExamples?: boolean;
  includeExercises?: boolean;
  useRAG?: boolean;
  targetWordCount?: number; // 500-2000 words
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface GeneratedLessonContent {
  title: string;
  introduction: string;
  mainContent: string;
  examples?: string[];
  keyTakeaways: string[];
  exercises?: string[];
  summary: string;
  estimatedReadingTime: number; // in minutes
  wordCount: number;
}

export interface LessonGenerationResult {
  lessonId: string;
  content: GeneratedLessonContent;
  metadata: {
    bookContext: string[];
    confidence: number;
    tokensUsed: number;
    costUSD: number;
    generationTimeMs: number;
  };
}

/**
 * Analyze lesson requirements to optimize generation
 */
export async function analyzeLessonRequirements(
  lessonTitle: string,
  lessonObjective: string,
  courseContext: string
): Promise<{
  complexity: "simple" | "moderate" | "complex";
  suggestedWordCount: number;
  keyTopics: string[];
  requiresExamples: boolean;
}> {
  const startTime = Date.now();

  try {
    const analysisPrompt = `Analyze this lesson to determine content requirements:

Lesson Title: ${lessonTitle}
Objective: ${lessonObjective}
Course Context: ${courseContext}

Provide a brief analysis of:
1. Complexity level
2. Suggested word count (500-2000)
3. Key topics to cover
4. Whether concrete examples are needed

Return as JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert instructional designer analyzing lesson requirements. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");

    return {
      complexity: analysis.complexity || "moderate",
      suggestedWordCount: analysis.suggestedWordCount || 800,
      keyTopics: analysis.keyTopics || [],
      requiresExamples: analysis.requiresExamples !== false,
    };
  } catch (error) {
    console.error("Error analyzing lesson requirements:", error);
    return {
      complexity: "moderate",
      suggestedWordCount: 800,
      keyTopics: [],
      requiresExamples: true,
    };
  }
}

/**
 * Generate comprehensive lesson content
 */
export async function generateLessonContent(
  courseId: string,
  lessonData: {
    title: string;
    objective: string;
    pageReferences?: number[];
  },
  bookId: string,
  config: LessonGenerationConfig = {}
): Promise<LessonGenerationResult> {
  const startTime = Date.now();
  let tokensUsed = 0;
  const bookContext: string[] = [];

  try {
    // Default configuration
    const {
      contentStyle = "conversational",
      includeExamples = true,
      includeExercises = true,
      useRAG = true,
      targetWordCount = 800,
      difficulty = "intermediate",
    } = config;

    // Get course context using raw SQL
    const generatedCourseResult = await prisma.$queryRaw<any[]>`
      SELECT generated_data
      FROM ai_generated_content
      WHERE id = ${courseId}
        AND content_type = 'course'
      LIMIT 1
    `;

    const generatedCourse = generatedCourseResult[0] || null;

    const courseContext = generatedCourse
      ? `Course: ${(generatedCourse.generated_data as any).title}`
      : "General course";

    // Use RAG to get relevant book content
    let ragContext = "";
    if (useRAG) {
      try {
        const searchQuery = `${lessonData.title} ${lessonData.objective}`;
        const relevantChunks = await searchSimilarContent(searchQuery, {
          matchThreshold: 0.7,
          matchCount: 8,
        });

        if (relevantChunks.length > 0) {
          ragContext = relevantChunks
            .map(
              (chunk: SearchResult) =>
                `Page ${chunk.page_number}: ${chunk.chunk_text}`
            )
            .join("\n\n");
          bookContext.push(
            ...relevantChunks.map((c: SearchResult) => `Page ${c.page_number}`)
          );
        }
      } catch (error) {
        console.warn("RAG search failed, continuing without context:", error);
      }
    }

    // Style-specific instructions
    const styleInstructions = {
      conversational:
        'Write in a warm, engaging, conversational tone. Use "you" to address the learner. Break down complex concepts with everyday analogies.',
      academic:
        "Write in a formal, scholarly tone. Use precise terminology. Include citations to concepts and theories. Maintain objectivity.",
      practical:
        "Write in a direct, action-oriented tone. Focus on how to apply concepts. Use step-by-step explanations and practical examples.",
    };

    // Generate the lesson content
    const contentPrompt = `You are creating educational lesson content for: "${
      lessonData.title
    }"

COURSE CONTEXT: ${courseContext}
LESSON OBJECTIVE: ${lessonData.objective}
CONTENT STYLE: ${contentStyle}
TARGET LENGTH: ${targetWordCount} words
DIFFICULTY LEVEL: ${difficulty}

${ragContext ? `RELEVANT BOOK CONTENT:\n${ragContext}\n` : ""}

${styleInstructions[contentStyle]}

Create a comprehensive lesson with the following structure:
1. **Introduction** (10% of content): Hook the learner, explain why this matters, preview what they'll learn
2. **Main Content** (60% of content): Core teaching, break into digestible sections with clear headings
${
  includeExamples
    ? "3. **Examples** (15% of content): 2-3 concrete, relatable examples that illustrate key concepts\n"
    : ""
}
4. **Key Takeaways** (10% of content): 3-5 bullet points summarizing main learnings
${
  includeExercises
    ? "5. **Exercises** (5% of content): 2-3 reflection questions or practice activities\n"
    : ""
}
6. **Summary** (5% of content): Brief wrap-up reinforcing the lesson objective

IMPORTANT GUIDELINES:
- Use the book content provided to ensure accuracy
- Include specific page references when using book content
- Make content engaging and memorable
- Use formatting (headings, bullets, emphasis) to aid readability
- Ensure content directly supports the learning objective
- Target approximately ${targetWordCount} words total

Return as JSON with this exact structure:
{
  "title": "lesson title",
  "introduction": "engaging intro text",
  "mainContent": "core teaching content with markdown formatting",
  "examples": ["example 1", "example 2", "example 3"],
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "exercises": ["exercise 1", "exercise 2", "exercise 3"],
  "summary": "brief summary text",
  "wordCount": estimated_word_count
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert instructional designer and educational content creator. Create engaging, pedagogically sound lesson content. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: contentPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    tokensUsed = response.usage?.total_tokens || 0;
    const content = JSON.parse(response.choices[0].message.content || "{}");

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.wordCount || targetWordCount;
    const estimatedReadingTime = Math.ceil(wordCount / 200);

    // Calculate cost (GPT-4 Turbo: $0.01 input, $0.03 output per 1K tokens)
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const costUSD = (inputTokens * 0.01 + outputTokens * 0.03) / 1000;

    // Generate confidence score based on content quality indicators
    let confidence = 75; // Base confidence
    if (ragContext) confidence += 10; // Used book context
    if (content.examples?.length >= 2) confidence += 5; // Has examples
    if (content.keyTakeaways?.length >= 3) confidence += 5; // Has takeaways
    if (
      wordCount >= targetWordCount * 0.8 &&
      wordCount <= targetWordCount * 1.2
    )
      confidence += 5; // Good length

    const lessonContent: GeneratedLessonContent = {
      title: content.title || lessonData.title,
      introduction: content.introduction || "",
      mainContent: content.mainContent || "",
      examples: includeExamples ? content.examples || [] : undefined,
      keyTakeaways: content.keyTakeaways || [],
      exercises: includeExercises ? content.exercises || [] : undefined,
      summary: content.summary || "",
      estimatedReadingTime,
      wordCount,
    };

    return {
      lessonId: `lesson_${Date.now()}`,
      content: lessonContent,
      metadata: {
        bookContext,
        confidence: Math.min(confidence, 100),
        tokensUsed,
        costUSD,
        generationTimeMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error("Error generating lesson content:", error);
    throw new Error(`Failed to generate lesson content: ${error}`);
  }
}

/**
 * Generate content for multiple lessons (batch processing)
 */
export async function generateBatchLessons(
  courseId: string,
  lessons: Array<{
    id: string;
    title: string;
    objective: string;
    pageReferences?: number[];
  }>,
  bookId: string,
  config: LessonGenerationConfig = {},
  onProgress?: (completed: number, total: number) => void
): Promise<{
  results: LessonGenerationResult[];
  summary: {
    totalLessons: number;
    successCount: number;
    failureCount: number;
    totalCost: number;
    totalTokens: number;
    totalTimeMs: number;
  };
}> {
  const startTime = Date.now();
  const results: LessonGenerationResult[] = [];
  let successCount = 0;
  let failureCount = 0;
  let totalCost = 0;
  let totalTokens = 0;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];

    try {
      const result = await generateLessonContent(
        courseId,
        {
          title: lesson.title,
          objective: lesson.objective,
          pageReferences: lesson.pageReferences,
        },
        bookId,
        config
      );

      results.push(result);
      successCount++;
      totalCost += result.metadata.costUSD;
      totalTokens += result.metadata.tokensUsed;

      if (onProgress) {
        onProgress(i + 1, lessons.length);
      }

      // Small delay to avoid rate limits
      if (i < lessons.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to generate lesson: ${lesson.title}`, error);
      failureCount++;
    }
  }

  return {
    results,
    summary: {
      totalLessons: lessons.length,
      successCount,
      failureCount,
      totalCost,
      totalTokens,
      totalTimeMs: Date.now() - startTime,
    },
  };
}

/**
 * Save generated lesson content to database
 */
export async function saveGeneratedLesson(
  lessonResult: LessonGenerationResult,
  courseId: string,
  bookId: string,
  config: LessonGenerationConfig
): Promise<string> {
  try {
    const lessonId = `lesson_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await prisma.$executeRaw`
      INSERT INTO ai_generated_content (
        id, content_type, source_type, source_id, source_title,
        generated_data, prompt_used, model_used, tokens_used,
        cost_usd, generation_time_ms, temperature, status,
        confidence_score, quality_score, metadata, created_at, updated_at
      ) VALUES (
        ${lessonId},
        'lesson',
        'book',
        ${bookId},
        ${lessonResult.content.title},
        ${JSON.stringify(lessonResult.content)}::jsonb,
        ${`Generate lesson: ${lessonResult.content.title}`},
        'gpt-4-turbo-preview',
        ${lessonResult.metadata.tokensUsed},
        ${lessonResult.metadata.costUSD},
        ${lessonResult.metadata.generationTimeMs},
        ${config.contentStyle === "academic" ? 0.5 : 0.7},
        'draft',
        ${lessonResult.metadata.confidence},
        ${lessonResult.metadata.confidence},
        ${JSON.stringify({
          courseId,
          bookContext: lessonResult.metadata.bookContext,
          config,
          estimatedReadingTime: lessonResult.content.estimatedReadingTime,
          wordCount: lessonResult.content.wordCount,
        })}::jsonb,
        NOW(),
        NOW()
      )
    `;

    return lessonId;
  } catch (error) {
    console.error("Error saving lesson to database:", error);
    throw new Error(`Failed to save lesson: ${error}`);
  }
}

/**
 * Get lesson generation cost estimate
 */
export function estimateLessonCost(
  wordCount: number = 800,
  useRAG: boolean = true
): {
  estimatedTokens: number;
  estimatedCostUSD: number;
  estimatedTimeSeconds: number;
} {
  // Rough estimates based on GPT-4 Turbo pricing
  const baseTokens = 500; // System prompts
  const contentTokens = Math.ceil(wordCount / 0.75); // ~0.75 words per token
  const ragTokens = useRAG ? 1000 : 0; // RAG context
  const outputTokens = Math.ceil(wordCount / 0.75);

  const totalTokens = baseTokens + contentTokens + ragTokens + outputTokens;

  // GPT-4 Turbo: $0.01 input, $0.03 output per 1K tokens
  const inputCost = ((baseTokens + contentTokens + ragTokens) * 0.01) / 1000;
  const outputCost = (outputTokens * 0.03) / 1000;
  const estimatedCostUSD = inputCost + outputCost;

  // Estimated generation time (varies by API response time)
  const estimatedTimeSeconds = Math.ceil(totalTokens / 100); // ~100 tokens/sec

  return {
    estimatedTokens: totalTokens,
    estimatedCostUSD: Number(estimatedCostUSD.toFixed(4)),
    estimatedTimeSeconds,
  };
}
