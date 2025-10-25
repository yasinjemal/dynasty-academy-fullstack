/**
 * AI Quiz Generator
 *
 * Generates intelligent assessment questions from courses and lessons
 * Features:
 * - 4 question types (multiple choice, true/false, short answer, essay)
 * - 3 difficulty levels (easy, medium, hard)
 * - Bloom's taxonomy alignment
 * - RAG integration for accuracy
 * - Answer key generation
 * - Explanation support
 */

import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";
import { searchSimilarContent, SearchResult } from "./embeddings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const prisma = new PrismaClient();

// Types
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type BloomLevel =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

export interface QuizGenerationConfig {
  questionTypes?: QuestionType[];
  questionCount?: number;
  difficulty?: DifficultyLevel;
  bloomLevels?: BloomLevel[];
  includeExplanations?: boolean;
  useRAG?: boolean;
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
}

export interface MultipleChoiceQuestion {
  type: "multiple_choice";
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  bloomLevel: BloomLevel;
  difficulty: DifficultyLevel;
  points: number;
}

export interface TrueFalseQuestion {
  type: "true_false";
  question: string;
  correctAnswer: boolean;
  explanation?: string;
  bloomLevel: BloomLevel;
  difficulty: DifficultyLevel;
  points: number;
}

export interface ShortAnswerQuestion {
  type: "short_answer";
  question: string;
  sampleAnswers: string[];
  keyPoints: string[];
  explanation?: string;
  bloomLevel: BloomLevel;
  difficulty: DifficultyLevel;
  points: number;
}

export interface EssayQuestion {
  type: "essay";
  question: string;
  rubric: {
    criteria: string;
    points: number;
  }[];
  sampleAnswer?: string;
  keyThemes: string[];
  bloomLevel: BloomLevel;
  difficulty: DifficultyLevel;
  points: number;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | EssayQuestion;

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: Question[];
  totalPoints: number;
  estimatedTimeMinutes: number;
  passingScore: number;
  metadata: {
    sourceType: "course" | "lesson" | "book";
    sourceId: string;
    difficulty: DifficultyLevel;
  };
}

export interface QuizGenerationResult {
  quiz: GeneratedQuiz;
  metadata: {
    tokensUsed: number;
    costUSD: number;
    generationTimeMs: number;
    confidence: number;
  };
}

/**
 * Analyze quiz requirements based on source content
 */
export async function analyzeQuizRequirements(
  sourceType: "course" | "lesson" | "book",
  sourceId: string
): Promise<{
  suggestedQuestionCount: number;
  suggestedDifficulty: DifficultyLevel;
  keyTopics: string[];
  bloomDistribution: Record<BloomLevel, number>;
}> {
  try {
    // Get source content
    let sourceContent = "";
    let contentTitle = "";

    if (sourceType === "course") {
      const course = (await prisma.$queryRaw`
        SELECT generated_data, source_title 
        FROM ai_generated_content 
        WHERE id = ${sourceId} AND content_type = 'course'
        LIMIT 1
      `) as any[];

      if (course[0]) {
        sourceContent = JSON.stringify(course[0].generated_data);
        contentTitle = course[0].source_title || "Course";
      }
    } else if (sourceType === "lesson") {
      const lesson = (await prisma.$queryRaw`
        SELECT generated_data, source_title 
        FROM ai_generated_content 
        WHERE id = ${sourceId} AND content_type = 'lesson'
        LIMIT 1
      `) as any[];

      if (lesson[0]) {
        sourceContent = JSON.stringify(lesson[0].generated_data);
        contentTitle = lesson[0].source_title || "Lesson";
      }
    }

    // Analyze with AI
    const analysisPrompt = `Analyze this educational content for quiz creation:

${sourceContent.substring(0, 2000)}

Provide recommendations for:
1. Optimal number of questions (5-20)
2. Suggested difficulty level
3. Key topics to assess
4. Distribution across Bloom's taxonomy levels

Return as JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert assessment designer. Analyze content and provide quiz recommendations. Respond with valid JSON only.",
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
      suggestedQuestionCount: analysis.questionCount || 10,
      suggestedDifficulty: analysis.difficulty || "medium",
      keyTopics: analysis.keyTopics || [],
      bloomDistribution: analysis.bloomDistribution || {
        remember: 20,
        understand: 30,
        apply: 25,
        analyze: 15,
        evaluate: 5,
        create: 5,
      },
    };
  } catch (error) {
    console.error("Error analyzing quiz requirements:", error);
    return {
      suggestedQuestionCount: 10,
      suggestedDifficulty: "medium",
      keyTopics: [],
      bloomDistribution: {
        remember: 20,
        understand: 30,
        apply: 25,
        analyze: 15,
        evaluate: 5,
        create: 5,
      },
    };
  }
}

/**
 * Generate a complete quiz
 */
export async function generateQuiz(
  sourceType: "course" | "lesson" | "book",
  sourceId: string,
  config: QuizGenerationConfig = {}
): Promise<QuizGenerationResult> {
  const startTime = Date.now();
  let tokensUsed = 0;

  try {
    // Default configuration
    const {
      questionTypes = ["multiple_choice", "true_false", "short_answer"],
      questionCount = 10,
      difficulty = "medium",
      bloomLevels = ["remember", "understand", "apply", "analyze"],
      includeExplanations = true,
      useRAG = true,
      timeLimit = 30,
      passingScore = 70,
    } = config;

    // Get source content
    let sourceContent = "";
    let contentTitle = "";
    let bookId = "";

    if (sourceType === "course") {
      const course = (await prisma.$queryRaw`
        SELECT generated_data, source_title, source_id 
        FROM ai_generated_content 
        WHERE id = ${sourceId} AND content_type = 'course'
        LIMIT 1
      `) as any[];

      if (course[0]) {
        sourceContent = JSON.stringify(course[0].generated_data);
        contentTitle = course[0].source_title || "Course";
        bookId = course[0].source_id;
      }
    } else if (sourceType === "lesson") {
      const lesson = (await prisma.$queryRaw`
        SELECT generated_data, source_title, metadata 
        FROM ai_generated_content 
        WHERE id = ${sourceId} AND content_type = 'lesson'
        LIMIT 1
      `) as any[];

      if (lesson[0]) {
        sourceContent = JSON.stringify(lesson[0].generated_data);
        contentTitle = lesson[0].source_title || "Lesson";
        bookId = lesson[0].metadata?.bookId || "";
      }
    } else {
      const book = await prisma.book.findUnique({ where: { id: sourceId } });
      if (book) {
        contentTitle = book.title;
        bookId = sourceId;
      }
    }

    // Use RAG to get relevant context
    let ragContext = "";
    if (useRAG && bookId) {
      try {
        const searchQuery = `${contentTitle} key concepts and important facts`;
        const relevantChunks = await searchSimilarContent(searchQuery, {
          matchThreshold: 0.7,
          matchCount: 10,
        });

        if (relevantChunks.length > 0) {
          ragContext = relevantChunks
            .map(
              (chunk: SearchResult) =>
                `Page ${chunk.page_number}: ${chunk.chunk_text}`
            )
            .join("\n\n");
        }
      } catch (error) {
        console.warn("RAG search failed, continuing without context:", error);
      }
    }

    // Build the generation prompt
    const quizPrompt = `Create a comprehensive quiz for: "${contentTitle}"

SOURCE CONTENT:
${sourceContent.substring(0, 3000)}

${ragContext ? `ADDITIONAL CONTEXT FROM BOOK:\n${ragContext}\n` : ""}

REQUIREMENTS:
- Generate ${questionCount} questions
- Question types: ${questionTypes.join(", ")}
- Difficulty level: ${difficulty}
- Bloom's taxonomy levels: ${bloomLevels.join(", ")}
- ${
      includeExplanations
        ? "Include explanations for each answer"
        : "No explanations needed"
    }

QUESTION TYPE DISTRIBUTION:
${
  questionTypes.includes("multiple_choice")
    ? "- Multiple choice: 4 options each, 1 correct\n"
    : ""
}
${
  questionTypes.includes("true_false") ? "- True/False: Clear statements\n" : ""
}
${
  questionTypes.includes("short_answer")
    ? "- Short answer: 2-3 sentence responses\n"
    : ""
}
${
  questionTypes.includes("essay")
    ? "- Essay: Deep analysis questions with rubrics\n"
    : ""
}

BLOOM'S TAXONOMY GUIDE:
- Remember: Recall facts and basic concepts
- Understand: Explain ideas or concepts
- Apply: Use information in new situations
- Analyze: Draw connections among ideas
- Evaluate: Justify a decision or course of action
- Create: Produce new or original work

QUALITY STANDARDS:
- Questions must be clear and unambiguous
- Avoid trick questions
- Test understanding, not memorization
- Include diverse difficulty within the level
- Provide accurate answer keys
- ${includeExplanations ? "Explanations should teach, not just confirm" : ""}

Return as JSON with this exact structure:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "bloomLevel": "understand",
      "difficulty": "medium",
      "points": 1
    },
    {
      "type": "true_false",
      "question": "Statement",
      "correctAnswer": true,
      "explanation": "Explanation",
      "bloomLevel": "remember",
      "difficulty": "easy",
      "points": 1
    },
    {
      "type": "short_answer",
      "question": "Question",
      "sampleAnswers": ["Sample 1", "Sample 2"],
      "keyPoints": ["Point 1", "Point 2"],
      "explanation": "What to look for",
      "bloomLevel": "apply",
      "difficulty": "medium",
      "points": 2
    },
    {
      "type": "essay",
      "question": "Deep question",
      "rubric": [
        {"criteria": "Criterion 1", "points": 2},
        {"criteria": "Criterion 2", "points": 3}
      ],
      "sampleAnswer": "Example response",
      "keyThemes": ["Theme 1", "Theme 2"],
      "bloomLevel": "analyze",
      "difficulty": "hard",
      "points": 5
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational assessment designer. Create high-quality, pedagogically sound quiz questions. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: quizPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3500,
      response_format: { type: "json_object" },
    });

    tokensUsed = response.usage?.total_tokens || 0;
    const quizData = JSON.parse(response.choices[0].message.content || "{}");

    // Calculate total points
    const totalPoints = quizData.questions.reduce(
      (sum: number, q: Question) => sum + q.points,
      0
    );

    // Estimate time (1 min for MC/TF, 2 min for short answer, 5 min for essay)
    const estimatedTime = quizData.questions.reduce(
      (time: number, q: Question) => {
        if (q.type === "multiple_choice" || q.type === "true_false")
          return time + 1;
        if (q.type === "short_answer") return time + 2;
        if (q.type === "essay") return time + 5;
        return time;
      },
      0
    );

    const quiz: GeneratedQuiz = {
      title: quizData.title || `${contentTitle} - Quiz`,
      description: quizData.description || `Assessment for ${contentTitle}`,
      questions: quizData.questions || [],
      totalPoints,
      estimatedTimeMinutes: Math.max(estimatedTime, timeLimit || 30),
      passingScore,
      metadata: {
        sourceType,
        sourceId,
        difficulty,
      },
    };

    // Calculate cost (GPT-4 Turbo: $0.01 input, $0.03 output per 1K tokens)
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const costUSD = (inputTokens * 0.01 + outputTokens * 0.03) / 1000;

    // Calculate confidence based on quality indicators
    let confidence = 75;
    if (ragContext) confidence += 10;
    if (quiz.questions.length >= questionCount) confidence += 5;
    if (includeExplanations && quiz.questions.every((q) => q.explanation))
      confidence += 10;

    return {
      quiz,
      metadata: {
        tokensUsed,
        costUSD,
        generationTimeMs: Date.now() - startTime,
        confidence: Math.min(confidence, 100),
      },
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error(`Failed to generate quiz: ${error}`);
  }
}

/**
 * Save generated quiz to database
 */
export async function saveGeneratedQuiz(
  quizResult: QuizGenerationResult,
  sourceType: "course" | "lesson" | "book",
  sourceId: string,
  config: QuizGenerationConfig
): Promise<string> {
  try {
    const quizId = `quiz_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const auditId = `audit_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 1. Save to ai_generated_content for audit trail
    await prisma.$executeRaw`
      INSERT INTO ai_generated_content (
        id, content_type, source_type, source_id, source_title,
        generated_data, prompt_used, model_used, tokens_used, cost_usd,
        generation_time_ms, temperature, status, confidence_score, quality_score,
        metadata, created_at, updated_at
      ) VALUES (
        ${auditId}, 'quiz', ${sourceType}, ${sourceId}, ${
      quizResult.quiz.title
    },
        ${JSON.stringify(quizResult.quiz)}::jsonb, 
        'Generate quiz', 'gpt-4-turbo-preview',
        ${quizResult.metadata.tokensUsed}, ${quizResult.metadata.costUSD},
        ${quizResult.metadata.generationTimeMs}, 0.7, 'draft',
        ${quizResult.metadata.confidence}, ${quizResult.metadata.confidence},
        ${JSON.stringify({
          config,
          questionCount: quizResult.quiz.questions.length,
        })}::jsonb,
        NOW(), NOW()
      )
    `;

    // 2. Create actual quiz in course_quizzes table
    if (sourceType === "course" || sourceType === "lesson") {
      const courseId = sourceType === "course" ? sourceId : null;
      const lessonId = sourceType === "lesson" ? sourceId : null;

      // If lesson, get the courseId
      let finalCourseId = courseId;
      if (sourceType === "lesson" && lessonId) {
        const lesson = await prisma.course_lessons.findUnique({
          where: { id: lessonId },
          select: { courseId: true },
        });
        finalCourseId = lesson?.courseId || "";
      }

      if (finalCourseId) {
        // Create quiz
        await prisma.course_quizzes.create({
          data: {
            id: quizId,
            courseId: finalCourseId,
            lessonId: lessonId || undefined,
            title: quizResult.quiz.title,
            description: quizResult.quiz.description,
            passingScore: 70,
            timeLimit: quizResult.quiz.timeLimit,
            maxAttempts: 3,
            showAnswers: true,
            order: 0,
          },
        });

        // Create questions
        for (let i = 0; i < quizResult.quiz.questions.length; i++) {
          const question = quizResult.quiz.questions[i];

          // Convert correctAnswer to string (handles number/boolean types)
          let correctAnswer = question.correctAnswer;
          if (typeof correctAnswer === "number") {
            correctAnswer = String(correctAnswer);
          } else if (typeof correctAnswer === "boolean") {
            correctAnswer = correctAnswer ? "true" : "false";
          }

          await prisma.quiz_questions.create({
            data: {
              id: `q_${quizId}_${i}`,
              quizId: quizId,
              question: question.question,
              type: question.type,
              options: question.options || null,
              correctAnswer: correctAnswer,
              explanation: question.explanation || null,
              points: question.points || 1,
              order: i,
            },
          });
        }

        console.log(
          `✅ Quiz created with ${quizResult.quiz.questions.length} questions`
        );
      }
    }

    return quizId;
  } catch (error) {
    console.error("Error saving quiz to database:", error);
    throw new Error(`Failed to save quiz: ${error}`);
  }
}

/**
 * Estimate quiz generation cost
 */
export function estimateQuizCost(
  questionCount: number = 10,
  includeExplanations: boolean = true,
  useRAG: boolean = true
): {
  estimatedTokens: number;
  estimatedCostUSD: number;
  estimatedTimeSeconds: number;
} {
  const baseTokens = 500; // System prompts
  const ragTokens = useRAG ? 1500 : 0;
  const questionTokens = questionCount * (includeExplanations ? 150 : 100);
  const outputTokens = questionCount * (includeExplanations ? 200 : 120);

  const totalTokens = baseTokens + ragTokens + questionTokens + outputTokens;

  // GPT-4 Turbo: $0.01 input, $0.03 output per 1K tokens
  const inputCost = ((baseTokens + ragTokens + questionTokens) * 0.01) / 1000;
  const outputCost = (outputTokens * 0.03) / 1000;
  const estimatedCostUSD = inputCost + outputCost;

  const estimatedTimeSeconds = Math.ceil(totalTokens / 100);

  return {
    estimatedTokens: totalTokens,
    estimatedCostUSD: Number(estimatedCostUSD.toFixed(4)),
    estimatedTimeSeconds,
  };
}

/**
 * Validate student answer against quiz
 */
export function validateAnswer(
  question: Question,
  studentAnswer: any
): {
  isCorrect: boolean;
  score: number;
  feedback: string;
} {
  if (question.type === "multiple_choice") {
    const isCorrect = studentAnswer === question.correctAnswer;
    return {
      isCorrect,
      score: isCorrect ? question.points : 0,
      feedback: question.explanation || (isCorrect ? "Correct!" : "Incorrect."),
    };
  }

  if (question.type === "true_false") {
    const isCorrect = studentAnswer === question.correctAnswer;
    return {
      isCorrect,
      score: isCorrect ? question.points : 0,
      feedback: question.explanation || (isCorrect ? "Correct!" : "Incorrect."),
    };
  }

  if (question.type === "short_answer" || question.type === "essay") {
    // For short answer and essay, return partial credit and require manual grading
    return {
      isCorrect: false, // Requires manual review
      score: 0, // Will be graded manually
      feedback: "Your answer has been submitted for review.",
    };
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: "Invalid answer format.",
  };
}
