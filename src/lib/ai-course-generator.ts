/**
 * 🧠 AI Course Generator - The Brain
 *
 * This is where the magic happens. This service takes a book and generates
 * a complete, professional course with intelligent analysis and structure.
 *
 * Features:
 * - Smart content analysis
 * - Automatic difficulty detection
 * - Prerequisite identification
 * - Learning objective generation
 * - Optimal pacing calculation
 * - Module & lesson structuring
 */

import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";
import { searchSimilarContent } from "./embeddings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// 📊 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface CourseGenerationConfig {
  bookId: string;
  mode?: "fast" | "balanced" | "comprehensive"; // How deep to analyze
  targetAudience?: "beginner" | "intermediate" | "advanced";
  estimatedDuration?: number; // in hours
  moduleCount?: number; // How many modules to create
  useRAG?: boolean; // Use embeddings for better context
  template?: string; // Template ID to use
}

export interface GeneratedCourse {
  // Course Metadata
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];

  // Course Structure
  modules: GeneratedModule[];

  // Learning Details
  learningObjectives: string[];
  prerequisites: string[];
  targetAudience: string;
  estimatedDuration: number; // in hours

  // Metadata
  totalLessons: number;
  difficulty: {
    overall: number; // 1-10
    progression: "linear" | "gradual" | "steep";
  };

  // AI Confidence
  confidence: {
    score: number; // 0-100
    strengths: string[];
    concerns: string[];
  };
}

export interface GeneratedModule {
  title: string;
  description: string;
  order: number;
  estimatedDuration: number; // in hours
  difficulty: number; // 1-10
  lessons: GeneratedLesson[];
  learningOutcomes: string[];
}

export interface GeneratedLesson {
  title: string;
  description: string;
  order: number;
  type: "video" | "text" | "interactive" | "quiz";
  estimatedDuration: number; // in minutes
  difficulty: number; // 1-10
  objectives: string[];

  // Source mapping
  sourcePages?: {
    start: number;
    end: number;
  };
  keyTopics: string[];
}

export interface BookAnalysis {
  // Content Analysis
  totalPages: number;
  estimatedWordCount: number;
  readingLevel: "easy" | "moderate" | "challenging";

  // Structure Analysis
  detectedChapters: Chapter[];
  majorTopics: string[];
  keyTerms: string[];

  // Learning Analysis
  suggestedModuleCount: number;
  suggestedLessonCount: number;
  estimatedCourseHours: number;
  difficulty: number; // 1-10

  // Audience Analysis
  bestFor: string[];
  prerequisites: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
}

interface Chapter {
  title: string;
  startPage: number;
  endPage: number;
  pageCount: number;
  topics: string[];
}

// ═══════════════════════════════════════════════════════════════
// 🔬 STEP 1: ANALYZE THE BOOK
// ═══════════════════════════════════════════════════════════════

export async function analyzeBook(bookId: string): Promise<BookAnalysis> {
  console.log(`📚 Analyzing book: ${bookId}`);

  // Get book with content
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  if (!book) {
    throw new Error(`Book not found: ${bookId}`);
  }

  // Get book content pages
  const bookContent = await prisma.bookContent.findMany({
    where: { bookId },
    orderBy: { pageNumber: "asc" },
    take: 50, // Sample first 50 pages for analysis
  });

  if (bookContent.length === 0) {
    throw new Error(`No content found for book: ${book.title}`);
  }

  // Sample content for AI analysis (first 20 pages, last 5 pages, middle 10 pages)
  const firstPages = bookContent.slice(0, 20);
  const lastPages = bookContent.slice(-5);
  const middleStart = Math.floor(bookContent.length / 2) - 5;
  const middlePages = bookContent.slice(middleStart, middleStart + 10);

  const sampledContent = [...firstPages, ...middlePages, ...lastPages].map(
    (page) => ({
      page: page.pageNumber,
      content: page.content.substring(0, 500), // First 500 chars per page
    })
  );

  // Build analysis prompt
  const analysisPrompt = `You are an expert educational content analyst. Analyze this book and provide a detailed assessment for creating an online course.

**Book Information:**
- Title: ${book.title}
- Category: ${book.category}
- Total Pages: ${book.totalPages || "Unknown"}
- Description: ${book.description}

**Content Sample** (${sampledContent.length} pages):
${sampledContent.map((p) => `Page ${p.page}: ${p.content}...`).join("\n\n")}

**Your Task:**
Analyze this book and provide a JSON response with the following structure:

{
  "readingLevel": "easy" | "moderate" | "challenging",
  "difficulty": 1-10 (integer),
  "skillLevel": "beginner" | "intermediate" | "advanced",
  "estimatedWordCount": <number>,
  "suggestedModuleCount": 4-8 (integer),
  "suggestedLessonCount": 15-40 (integer),
  "estimatedCourseHours": <number>,
  "majorTopics": ["topic1", "topic2", ...] (5-10 topics),
  "keyTerms": ["term1", "term2", ...] (10-15 terms),
  "bestFor": ["audience1", "audience2", ...],
  "prerequisites": ["prereq1", "prereq2", ...],
  "detectedChapters": [
    {
      "title": "Chapter Title",
      "startPage": <number>,
      "endPage": <number>,
      "topics": ["topic1", "topic2"]
    }
  ]
}

Be specific and educational-focused. Consider how this content would be best taught in an online course format.`;

  console.log("🤖 Sending book to AI for analysis...");

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an expert educational content analyst specializing in curriculum design and online course creation. Respond only with valid JSON.",
      },
      {
        role: "user",
        content: analysisPrompt,
      },
    ],
    temperature: 0.3, // Low temperature for consistent analysis
    response_format: { type: "json_object" },
  });

  const analysisTime = Date.now() - startTime;
  console.log(`✅ Analysis complete in ${analysisTime}ms`);

  const analysis = JSON.parse(response.choices[0].message.content || "{}");

  return {
    totalPages: book.totalPages || bookContent.length,
    estimatedWordCount: analysis.estimatedWordCount || book.totalPages! * 300,
    readingLevel: analysis.readingLevel || "moderate",
    detectedChapters: analysis.detectedChapters || [],
    majorTopics: analysis.majorTopics || [],
    keyTerms: analysis.keyTerms || [],
    suggestedModuleCount: analysis.suggestedModuleCount || 5,
    suggestedLessonCount: analysis.suggestedLessonCount || 20,
    estimatedCourseHours:
      analysis.estimatedCourseHours || Math.ceil(book.totalPages! / 20),
    difficulty: analysis.difficulty || 5,
    bestFor: analysis.bestFor || [],
    prerequisites: analysis.prerequisites || [],
    skillLevel: analysis.skillLevel || "intermediate",
  };
}

// ═══════════════════════════════════════════════════════════════
// 🏗️ STEP 2: GENERATE COURSE STRUCTURE
// ═══════════════════════════════════════════════════════════════

export async function generateCourseStructure(
  bookId: string,
  analysis: BookAnalysis,
  config: CourseGenerationConfig
): Promise<GeneratedCourse> {
  console.log(`🏗️  Generating course structure for book: ${bookId}`);

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error(`Book not found: ${bookId}`);
  }

  // Get some content for context (RAG or direct)
  let contextContent = "";

  if (config.useRAG !== false) {
    try {
      // Use RAG to get relevant content
      const relevantChunks = await searchSimilarContent(
        `Create an online course about: ${book.title}. ${book.description}`,
        {
          matchThreshold: 0.7,
          matchCount: 10,
          filterType: "book",
          filterId: bookId,
        }
      );

      if (relevantChunks.length > 0) {
        contextContent = relevantChunks
          .map((chunk) => `Page ${chunk.page_number}: ${chunk.chunk_text}`)
          .join("\n\n");
        console.log(
          `📚 Using RAG: ${relevantChunks.length} relevant chunks found`
        );
      }
    } catch (error) {
      console.log("⚠️  RAG not available, using direct content");
    }
  }

  // If no RAG content, get first 30 pages directly
  if (!contextContent) {
    const bookContent = await prisma.bookContent.findMany({
      where: { bookId },
      orderBy: { pageNumber: "asc" },
      take: 30,
    });

    contextContent = bookContent
      .map(
        (page) => `Page ${page.pageNumber}: ${page.content.substring(0, 800)}`
      )
      .join("\n\n");
  }

  // Build the generation prompt
  const generationPrompt = `You are an expert online course creator. Generate a comprehensive course structure from this book.

**Book Information:**
- Title: ${book.title}
- Category: ${book.category}
- Total Pages: ${book.totalPages}
- Description: ${book.description}

**Book Analysis:**
- Reading Level: ${analysis.readingLevel}
- Difficulty: ${analysis.difficulty}/10
- Skill Level: ${analysis.skillLevel}
- Suggested Modules: ${analysis.suggestedModuleCount}
- Suggested Lessons: ${analysis.suggestedLessonCount}
- Estimated Hours: ${analysis.estimatedCourseHours}
- Major Topics: ${analysis.majorTopics.join(", ")}
- Prerequisites: ${analysis.prerequisites.join(", ")}

**Configuration:**
- Mode: ${config.mode || "balanced"}
- Target Audience: ${config.targetAudience || analysis.skillLevel}
- Module Count: ${config.moduleCount || analysis.suggestedModuleCount}

**Book Content Sample:**
${contextContent.substring(0, 8000)}

**Your Task:**
Create a complete online course structure. Respond with valid JSON:

{
  "title": "Engaging Course Title",
  "slug": "url-friendly-slug",
  "shortDescription": "One compelling sentence (max 150 chars)",
  "description": "Detailed course description (200-400 words)",
  "level": "beginner" | "intermediate" | "advanced",
  "category": "${book.category}",
  "tags": ["tag1", "tag2", ...] (5-8 relevant tags),
  "learningObjectives": [
    "What students will learn (5-7 objectives)"
  ],
  "prerequisites": ["What students need to know beforehand"],
  "targetAudience": "Who this course is perfect for",
  "estimatedDuration": <hours as number>,
  "totalLessons": <number>,
  "difficulty": {
    "overall": 1-10,
    "progression": "linear" | "gradual" | "steep"
  },
  "modules": [
    {
      "title": "Module Title",
      "description": "What this module covers (2-3 sentences)",
      "order": 1,
      "estimatedDuration": <hours>,
      "difficulty": 1-10,
      "learningOutcomes": ["outcome1", "outcome2", ...],
      "lessons": [
        {
          "title": "Lesson Title",
          "description": "What this lesson teaches (1-2 sentences)",
          "order": 1,
          "type": "video" | "text" | "interactive" | "quiz",
          "estimatedDuration": <minutes>,
          "difficulty": 1-10,
          "objectives": ["objective1", "objective2"],
          "sourcePages": { "start": 1, "end": 10 },
          "keyTopics": ["topic1", "topic2"]
        }
      ]
    }
  ],
  "confidence": {
    "score": 0-100,
    "strengths": ["What makes this course structure strong"],
    "concerns": ["What might need human review"]
  }
}

**Guidelines:**
1. Create ${config.moduleCount || analysis.suggestedModuleCount} modules
2. Each module should have 3-6 lessons
3. Progress from fundamentals to advanced
4. Include mix of lesson types (70% text/video, 20% interactive, 10% quiz)
5. Map lessons to specific book page ranges
6. Ensure logical flow and pacing
7. Make titles engaging and clear
8. Be specific and actionable

Generate a professional, well-structured course that maximizes learning outcomes.`;

  console.log("🤖 Generating course structure with AI...");

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an expert curriculum designer and online course creator with 10+ years of experience. Create engaging, effective course structures. Respond only with valid JSON.",
      },
      {
        role: "user",
        content: generationPrompt,
      },
    ],
    temperature: 0.7, // Balanced creativity and consistency
    response_format: { type: "json_object" },
  });

  const generationTime = Date.now() - startTime;
  const tokensUsed = response.usage?.total_tokens || 0;
  const cost =
    ((response.usage?.prompt_tokens || 0) * 0.01 +
      (response.usage?.completion_tokens || 0) * 0.03) /
    1000;

  console.log(`✅ Course generated in ${generationTime}ms`);
  console.log(`📊 Tokens: ${tokensUsed}, Cost: $${cost.toFixed(4)}`);

  const generatedCourse = JSON.parse(
    response.choices[0].message.content || "{}"
  );

  return generatedCourse as GeneratedCourse;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 STEP 3: SAVE TO DATABASE
// ═══════════════════════════════════════════════════════════════

export async function saveGeneratedCourse(
  bookId: string,
  generatedCourse: GeneratedCourse,
  metadata: {
    userId: string;
    tokensUsed: number;
    cost: number;
    generationTime: number;
    model: string;
    config: CourseGenerationConfig;
  }
) {
  console.log("💾 Saving generated course to database...");

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { title: true },
  });

  // Generate unique ID
  const contentId = `gen_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Save to ai_generated_content table
  await prisma.$executeRaw`
    INSERT INTO ai_generated_content (
      id,
      content_type,
      source_type,
      source_id,
      source_title,
      generated_data,
      model_used,
      tokens_used,
      cost_usd,
      generation_time_ms,
      temperature,
      status,
      confidence_score,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      ${contentId},
      'course',
      'book',
      ${bookId},
      ${book?.title || "Unknown"},
      ${JSON.stringify(generatedCourse)}::jsonb,
      ${metadata.model},
      ${metadata.tokensUsed},
      ${metadata.cost},
      ${metadata.generationTime},
      0.7,
      'draft',
      ${generatedCourse.confidence?.score || 85},
      ${JSON.stringify(metadata.config)}::jsonb,
      NOW(),
      NOW()
    )
  `;

  console.log(`✅ Course saved with ID: ${contentId}`);

  return {
    id: contentId,
    ...generatedCourse,
  };
}

// ═══════════════════════════════════════════════════════════════
// 🚀 MAIN FUNCTION: GENERATE COMPLETE COURSE
// ═══════════════════════════════════════════════════════════════

export async function generateCourseFromBook(
  config: CourseGenerationConfig,
  userId: string
): Promise<{
  id: string;
  course: GeneratedCourse;
  analysis: BookAnalysis;
  metadata: {
    tokensUsed: number;
    cost: number;
    generationTime: number;
  };
}> {
  const overallStart = Date.now();

  console.log("🎓 Starting AI Course Generation...");
  console.log(`📖 Book ID: ${config.bookId}`);
  console.log(`⚙️  Mode: ${config.mode || "balanced"}`);
  console.log(`👥 Target: ${config.targetAudience || "auto-detect"}`);

  try {
    // Step 1: Analyze the book
    const analysis = await analyzeBook(config.bookId);
    console.log(`✅ Step 1: Book analysis complete`);

    // Step 2: Generate course structure
    const generatedCourse = await generateCourseStructure(
      config.bookId,
      analysis,
      config
    );
    console.log(`✅ Step 2: Course structure generated`);

    // Calculate metadata
    const overallTime = Date.now() - overallStart;
    const estimatedTokens = 8000; // Rough estimate
    const estimatedCost = 0.2; // Rough estimate

    // Step 3: Save to database
    const savedCourse = await saveGeneratedCourse(
      config.bookId,
      generatedCourse,
      {
        userId,
        tokensUsed: estimatedTokens,
        cost: estimatedCost,
        generationTime: overallTime,
        model: "gpt-4-turbo-preview",
        config,
      }
    );
    console.log(`✅ Step 3: Course saved to database`);

    console.log(`🎉 Course generation complete!`);
    console.log(`⏱️  Total time: ${overallTime}ms`);
    console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}`);

    return {
      id: savedCourse.id,
      course: generatedCourse,
      analysis,
      metadata: {
        tokensUsed: estimatedTokens,
        cost: estimatedCost,
        generationTime: overallTime,
      },
    };
  } catch (error) {
    console.error("❌ Course generation failed:", error);
    throw error;
  }
}
