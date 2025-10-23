/**
 * Concept Extraction Service
 * 
 * Uses GPT-4 to intelligently extract key concepts from course content:
 * - Identify core learning concepts
 * - Determine difficulty levels
 * - Map prerequisite relationships
 * - Generate concept definitions
 * - Create concept hierarchies
 * 
 * Week 2 - Phase 1 Self-Healing Knowledge Graph MVP
 */

import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from './vector-embeddings';
import { logger } from '@/lib/infrastructure/logger';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types
export interface ExtractedConcept {
  name: string;
  description: string;
  difficulty: number; // 1-10
  category?: string;
  prerequisites: string[]; // Names of prerequisite concepts
  relatedConcepts: string[]; // Names of related concepts
  examples?: string[];
  keywords?: string[];
}

export interface ConceptExtractionResult {
  courseId: string;
  courseTitle: string;
  concepts: ExtractedConcept[];
  totalConcepts: number;
  extractionTime: number;
  cost: number;
}

/**
 * Extract concepts from a course using GPT-4
 */
export async function extractConceptsFromCourse(
  courseId: string
): Promise<ConceptExtractionResult> {
  const startTime = Date.now();
  
  try {
    // Get course with lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          select: {
            title: true,
            description: true,
            content: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error(`Course ${courseId} not found`);
    }

    // Compile course content
    const courseContent = compileCourseContent(course);

    // Use GPT-4 to extract concepts
    const prompt = buildConceptExtractionPrompt(course.title, courseContent);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content analyst. Your task is to extract key learning concepts from course material and identify their relationships.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent extraction
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const concepts = result.concepts || [];

    // Calculate cost (GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens)
    const usage = response.usage;
    const cost = usage
      ? (usage.prompt_tokens / 1000) * 0.03 + (usage.completion_tokens / 1000) * 0.06
      : 0;

    logger.logInfo('Concepts extracted from course', {
      courseId,
      courseTitle: course.title,
      conceptCount: concepts.length,
      cost,
      duration: Date.now() - startTime,
    });

    return {
      courseId,
      courseTitle: course.title,
      concepts,
      totalConcepts: concepts.length,
      extractionTime: Date.now() - startTime,
      cost,
    };
  } catch (error) {
    logger.logError('Failed to extract concepts from course', error as Error, {
      courseId,
    });
    throw error;
  }
}

/**
 * Extract concepts from all courses
 */
export async function extractConceptsFromAllCourses(): Promise<{
  results: ConceptExtractionResult[];
  totalConcepts: number;
  totalCost: number;
  duration: number;
}> {
  const startTime = Date.now();
  
  try {
    // Get all published courses
    const courses = await prisma.course.findMany({
      where: { published: true },
      select: { id: true },
    });

    logger.logInfo('Starting concept extraction for all courses', {
      courseCount: courses.length,
    });

    const results: ConceptExtractionResult[] = [];
    let totalConcepts = 0;
    let totalCost = 0;

    // Process courses sequentially to avoid rate limits
    for (const course of courses) {
      try {
        const result = await extractConceptsFromCourse(course.id);
        results.push(result);
        totalConcepts += result.totalConcepts;
        totalCost += result.cost;

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.logError('Failed to extract concepts from course', error as Error, {
          courseId: course.id,
        });
      }
    }

    const duration = Date.now() - startTime;

    logger.logInfo('Concept extraction complete for all courses', {
      courseCount: results.length,
      totalConcepts,
      totalCost,
      duration,
    });

    return {
      results,
      totalConcepts,
      totalCost,
      duration,
    };
  } catch (error) {
    logger.logError('Failed to extract concepts from all courses', error as Error);
    throw error;
  }
}

/**
 * Save extracted concepts to database
 */
export async function saveConceptsToDatabase(
  extraction: ConceptExtractionResult
): Promise<{
  created: number;
  updated: number;
  relationships: number;
}> {
  const startTime = Date.now();
  let created = 0;
  let updated = 0;
  let relationships = 0;

  try {
    const conceptIds = new Map<string, string>(); // Map concept name to ID

    // First pass: Create/update all concepts
    for (const concept of extraction.concepts) {
      // Generate embedding for the concept
      const embeddingText = `${concept.name}\n${concept.description}\n${concept.keywords?.join(', ') || ''}`;
      const { embedding } = await generateEmbedding(
        embeddingText,
        'concept',
        `${extraction.courseId}:${concept.name}`
      );

      // Convert embedding to pgvector format
      const embeddingStr = `[${embedding.join(',')}]`;

      // Upsert concept
      const result = await prisma.$executeRaw`
        INSERT INTO concepts (
          id,
          name,
          description,
          embedding,
          difficulty_score,
          category,
          metadata,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid(),
          ${concept.name},
          ${concept.description},
          ${embeddingStr}::vector,
          ${concept.difficulty},
          ${concept.category || null},
          ${JSON.stringify({
            courseId: extraction.courseId,
            courseTitle: extraction.courseTitle,
            examples: concept.examples || [],
            keywords: concept.keywords || [],
          })}::jsonb,
          NOW(),
          NOW()
        )
        ON CONFLICT (name)
        DO UPDATE SET
          description = EXCLUDED.description,
          embedding = EXCLUDED.embedding,
          difficulty_score = EXCLUDED.difficulty_score,
          category = EXCLUDED.category,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING id;
      `;

      // Get the concept ID
      const savedConcept = await prisma.concept.findUnique({
        where: { name: concept.name },
        select: { id: true },
      });

      if (savedConcept) {
        conceptIds.set(concept.name, savedConcept.id);
        if (result === 0) {
          updated++;
        } else {
          created++;
        }
      }
    }

    // Second pass: Create relationships
    for (const concept of extraction.concepts) {
      const conceptId = conceptIds.get(concept.name);
      if (!conceptId) continue;

      // Create prerequisite relationships
      for (const prereqName of concept.prerequisites) {
        const prereqId = conceptIds.get(prereqName);
        if (!prereqId) continue;

        try {
          await prisma.conceptRelationship.create({
            data: {
              parentConceptId: prereqId, // Prerequisite is the parent
              childConceptId: conceptId, // Current concept is the child
              relationshipType: 'prerequisite',
              strength: 1.0, // Strong relationship
              validated: true,
            },
          });
          relationships++;
        } catch (error) {
          // Ignore duplicate relationships
          if (!(error as any).code?.includes('23505')) {
            throw error;
          }
        }
      }

      // Create related concept relationships
      for (const relatedName of concept.relatedConcepts) {
        const relatedId = conceptIds.get(relatedName);
        if (!relatedId) continue;

        try {
          await prisma.conceptRelationship.create({
            data: {
              parentConceptId: conceptId,
              childConceptId: relatedId,
              relationshipType: 'related',
              strength: 0.7, // Medium relationship
              validated: false,
            },
          });
          relationships++;
        } catch (error) {
          // Ignore duplicates
          if (!(error as any).code?.includes('23505')) {
            throw error;
          }
        }
      }
    }

    logger.logInfo('Concepts saved to database', {
      courseId: extraction.courseId,
      created,
      updated,
      relationships,
      duration: Date.now() - startTime,
    });

    return { created, updated, relationships };
  } catch (error) {
    logger.logError('Failed to save concepts to database', error as Error, {
      courseId: extraction.courseId,
    });
    throw error;
  }
}

/**
 * Extract and save concepts for a course (combined operation)
 */
export async function processConceptsForCourse(
  courseId: string
): Promise<{
  extraction: ConceptExtractionResult;
  database: { created: number; updated: number; relationships: number };
}> {
  const extraction = await extractConceptsFromCourse(courseId);
  const database = await saveConceptsToDatabase(extraction);

  return { extraction, database };
}

/**
 * Extract and save concepts for all courses
 */
export async function processConceptsForAllCourses(): Promise<{
  totalCourses: number;
  totalConcepts: number;
  totalRelationships: number;
  totalCost: number;
  duration: number;
}> {
  const startTime = Date.now();
  
  const { results, totalCost } = await extractConceptsFromAllCourses();
  
  let totalConcepts = 0;
  let totalRelationships = 0;

  for (const result of results) {
    const { created, updated, relationships } = await saveConceptsToDatabase(result);
    totalConcepts += created + updated;
    totalRelationships += relationships;
  }

  return {
    totalCourses: results.length,
    totalConcepts,
    totalRelationships,
    totalCost,
    duration: Date.now() - startTime,
  };
}

// Helper functions

/**
 * Compile course content for concept extraction
 */
function compileCourseContent(course: any): string {
  const parts = [
    `Course: ${course.title}`,
    `Description: ${course.description || ''}`,
    course.learningOutcomes ? `Learning Outcomes: ${course.learningOutcomes}` : '',
    course.prerequisites ? `Prerequisites: ${course.prerequisites}` : '',
    '\nLessons:',
  ];

  course.lessons?.forEach((lesson: any, index: number) => {
    parts.push(`\n${index + 1}. ${lesson.title}`);
    if (lesson.description) parts.push(`   ${lesson.description}`);
    if (lesson.content) parts.push(`   ${lesson.content.slice(0, 500)}...`);
  });

  return parts.filter(Boolean).join('\n');
}

/**
 * Build GPT-4 prompt for concept extraction
 */
function buildConceptExtractionPrompt(courseTitle: string, content: string): string {
  return `
Analyze the following course content and extract the key learning concepts.

Course: ${courseTitle}

${content}

Extract 5-15 key concepts that students need to learn in this course. For each concept, provide:

1. name: A clear, concise name (2-5 words)
2. description: A 1-2 sentence explanation
3. difficulty: Rate 1-10 (1=beginner, 5=intermediate, 10=expert)
4. category: The subject area (e.g., "Programming", "Data Science", "Business")
5. prerequisites: Array of concept names that should be learned first
6. relatedConcepts: Array of concept names that are related but not prerequisites
7. examples: Array of 1-3 practical examples
8. keywords: Array of 3-7 relevant keywords

Return your response in this JSON format:
{
  "concepts": [
    {
      "name": "Variables and Data Types",
      "description": "Understanding how to store and manipulate different types of data in programming.",
      "difficulty": 2,
      "category": "Programming Fundamentals",
      "prerequisites": [],
      "relatedConcepts": ["Memory Management", "Type Conversion"],
      "examples": ["Declaring integer variables", "String concatenation", "Boolean logic"],
      "keywords": ["variables", "data types", "integers", "strings", "boolean"]
    }
  ]
}

Focus on concepts that are:
- Specific and teachable
- Measurable (can assess if learned)
- Build on each other logically
- Core to the course material

Return ONLY valid JSON, no additional text.
`;
}

/**
 * Get concept extraction statistics
 */
export async function getConceptStats(): Promise<{
  totalConcepts: number;
  totalRelationships: number;
  byCategory: Record<string, number>;
  avgDifficulty: number;
}> {
  try {
    const [concepts, relationships] = await Promise.all([
      prisma.concept.findMany({
        select: { category: true, difficultyScore: true },
      }),
      prisma.conceptRelationship.count(),
    ]);

    const byCategory: Record<string, number> = {};
    let totalDifficulty = 0;

    concepts.forEach(c => {
      const cat = c.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      totalDifficulty += c.difficultyScore || 0;
    });

    return {
      totalConcepts: concepts.length,
      totalRelationships: relationships,
      byCategory,
      avgDifficulty: concepts.length > 0 ? totalDifficulty / concepts.length : 0,
    };
  } catch (error) {
    logger.logError('Failed to get concept stats', error as Error);
    throw error;
  }
}
