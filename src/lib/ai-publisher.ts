/**
 * 🚀 AI Publisher - Phase 2d
 * Transform AI-generated content into live student courses
 *
 * Features:
 * - Publish courses to live platform
 * - Create sections/modules
 * - Publish lessons with content
 * - Publish quizzes with questions
 * - Configure pricing & certificates
 * - Track publishing status
 */

import { PrismaClient } from "@prisma/client";
import { createId as cuid } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

// ==================== TYPES ====================

export interface PublishCourseConfig {
  // Pricing
  price?: number;
  currency?: string;
  isFree?: boolean;
  discount?: number;

  // Access
  level?: "beginner" | "intermediate" | "advanced";
  isPremium?: boolean;

  // Certificate
  certificateEnabled?: boolean;
  certificateTemplate?: string;

  // Publishing
  status?: "draft" | "published";
  featured?: boolean;

  // Metadata
  category?: string;
  tags?: string[];
  instructorName?: string;
  instructorBio?: string;
  instructorImage?: string;
}

export interface PublishResult {
  success: boolean;
  courseId?: string;
  sectionsCreated?: number;
  lessonsCreated?: number;
  quizzesCreated?: number;
  questionsCreated?: number;
  publishedAt?: Date;
  errors?: string[];
}

export interface PublishStatus {
  courseId: string;
  status: "draft" | "published";
  enrollmentCount: number;
  completionCount: number;
  averageRating: number;
  reviewCount: number;
  publishedAt?: Date;
}

// ==================== MAIN FUNCTIONS ====================

/**
 * Publish an AI-generated course to the live platform
 */
export async function publishCourse(
  generatedCourseId: string,
  authorId: string,
  config: PublishCourseConfig = {}
): Promise<PublishResult> {
  const errors: string[] = [];

  try {
    // 1. Fetch the generated course from ai_generated_content
    const generatedCourse = await prisma.$queryRaw<any[]>`
      SELECT * FROM ai_generated_content
      WHERE id = ${generatedCourseId}
      AND content_type = 'course'
      LIMIT 1
    `;

    if (!generatedCourse || generatedCourse.length === 0) {
      return {
        success: false,
        errors: ["Generated course not found"],
      };
    }

    const courseData = generatedCourse[0].generated_data;

    // 2. Create the course record
    const courseId = cuid();
    const slug = generateSlug(courseData.title);

    // Prepare tags array
    const tagsArray = config.tags || courseData.tags || [];
    const tagsString = `{${tagsArray
      .map((tag: string) => `"${tag}"`)
      .join(",")}}`;

    // Prepare publishedAt value
    const publishedAtValue = config.status === "published" ? new Date() : null;

    await prisma.$executeRaw`
      INSERT INTO courses (
        id, title, slug, description, "shortDescription",
        level, category, tags,
        price, currency, "isFree", discount,
        status, featured, "isPremium",
        "authorId", "instructorName", "instructorBio", "instructorImage",
        "certificateEnabled", "certificateTemplate",
        "createdAt", "updatedAt", "publishedAt"
      ) VALUES (
        ${courseId},
        ${courseData.title},
        ${slug},
        ${courseData.description || ""},
        ${
          courseData.shortDescription ||
          courseData.description?.substring(0, 200) ||
          ""
        },
        ${config.level || "beginner"},
        ${config.category || courseData.category || "General"},
        ${tagsString}::text[],
        ${config.price || 0},
        ${config.currency || "USD"},
        ${
          config.isFree !== undefined
            ? config.isFree
            : config.price === 0 || !config.price
        },
        ${config.discount || 0},
        ${config.status || "draft"},
        ${config.featured || false},
        ${config.isPremium || false},
        ${authorId},
        ${config.instructorName || ""},
        ${config.instructorBio || ""},
        ${config.instructorImage || ""},
        ${config.certificateEnabled || false},
        ${config.certificateTemplate || ""},
        NOW(),
        NOW(),
        ${publishedAtValue}
      )
    `;

    // 3. Create sections (modules)
    const sectionsCreated = await publishSections(
      courseId,
      courseData.modules || courseData.sections || []
    );

    // 4. Fetch generated lessons for this course
    const generatedLessons = await prisma.$queryRaw<any[]>`
      SELECT * FROM ai_generated_content
      WHERE (metadata->>'courseId')::text = ${generatedCourseId}
      AND content_type = 'lesson'
      AND status IN ('draft', 'approved', 'published')
      ORDER BY (generated_data->>'order')::int ASC
    `;

    // 5. Publish lessons
    const lessonsCreated = await publishLessons(courseId, generatedLessons);

    // 6. Fetch generated quizzes for this course
    const generatedQuizzes = await prisma.$queryRaw<any[]>`
      SELECT * FROM ai_generated_content
      WHERE (metadata->>'courseId')::text = ${generatedCourseId}
      AND content_type = 'quiz'
      AND status IN ('draft', 'approved', 'published')
    `;

    // 7. Publish quizzes
    const { quizzesCreated, questionsCreated } = await publishQuizzes(
      courseId,
      generatedQuizzes
    );

    // 8. Update lesson count on course
    await prisma.$executeRaw`
      UPDATE courses
      SET "lessonCount" = ${lessonsCreated},
          "updatedAt" = NOW()
      WHERE id = ${courseId}
    `;

    // 9. Update the generated course status
    await prisma.$executeRaw`
      UPDATE ai_generated_content
      SET status = 'published',
          metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{publishedCourseId}',
            to_jsonb(${courseId}::text)
          ),
          updated_at = NOW()
      WHERE id = ${generatedCourseId}
    `;

    return {
      success: true,
      courseId,
      sectionsCreated,
      lessonsCreated,
      quizzesCreated,
      questionsCreated,
      publishedAt: config.status === "published" ? new Date() : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error publishing course:", error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : "Unknown error occurred",
      ],
    };
  }
}

/**
 * Publish course sections (modules)
 */
async function publishSections(
  courseId: string,
  modules: any[]
): Promise<number> {
  let sectionsCreated = 0;

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    const sectionId = cuid();

    try {
      await prisma.$executeRaw`
        INSERT INTO course_sections (
          id, "courseId", title, description, "order",
          "isLocked", "createdAt", "updatedAt"
        ) VALUES (
          ${sectionId},
          ${courseId},
          ${module.title || module.name || `Module ${i + 1}`},
          ${module.description || module.objective || ""},
          ${i},
          ${false},
          NOW(),
          NOW()
        )
      `;

      // Store section ID for lesson mapping
      module._publishedSectionId = sectionId;
      sectionsCreated++;
    } catch (error) {
      console.error(`Error creating section ${i + 1}:`, error);
    }
  }

  return sectionsCreated;
}

/**
 * Publish lessons to course
 */
async function publishLessons(
  courseId: string,
  generatedLessons: any[]
): Promise<number> {
  let lessonsCreated = 0;

  // Group lessons by module/section
  const lessonsByModule: { [key: string]: any[] } = {};

  for (const lesson of generatedLessons) {
    const lessonData = lesson.generated_data;
    const moduleIndex = lessonData.moduleIndex || lessonData.sectionIndex || 0;

    if (!lessonsByModule[moduleIndex]) {
      lessonsByModule[moduleIndex] = [];
    }
    lessonsByModule[moduleIndex].push({ ...lesson, lessonData });
  }

  // Get sections for this course
  const sections = await prisma.$queryRaw<any[]>`
    SELECT id, "order"
    FROM course_sections
    WHERE "courseId" = ${courseId}
    ORDER BY "order" ASC
  `;

  // Publish lessons to appropriate sections
  for (const [moduleIndex, lessons] of Object.entries(lessonsByModule)) {
    const sectionIndex = parseInt(moduleIndex);
    const section = sections[sectionIndex];

    if (!section) {
      console.warn(`No section found for module index ${moduleIndex}`);
      continue;
    }

    for (let i = 0; i < lessons.length; i++) {
      const { lessonData } = lessons[i];
      const lessonId = cuid();
      const slug = generateSlug(lessonData.title);

      try {
        await prisma.$executeRaw`
          INSERT INTO course_lessons (
            id, "sectionId", "courseId", title, slug,
            description, "order", type, content,
            "isFree", "isLocked", "createdAt", "updatedAt"
          ) VALUES (
            ${lessonId},
            ${section.id},
            ${courseId},
            ${lessonData.title},
            ${slug},
            ${lessonData.objective || lessonData.description || ""},
            ${i},
            ${"text"},
            ${lessonData.content || lessonData.mainContent || ""},
            ${i === 0}, -- First lesson is free
            ${false},
            NOW(),
            NOW()
          )
        `;

        lessonsCreated++;
      } catch (error) {
        console.error(`Error creating lesson "${lessonData.title}":`, error);
      }
    }
  }

  return lessonsCreated;
}

/**
 * Publish quizzes with questions
 */
async function publishQuizzes(
  courseId: string,
  generatedQuizzes: any[]
): Promise<{ quizzesCreated: number; questionsCreated: number }> {
  let quizzesCreated = 0;
  let questionsCreated = 0;

  // Get course lessons for associating quizzes
  const lessons = await prisma.$queryRaw<any[]>`
    SELECT id, title, "order", "sectionId"
    FROM course_lessons
    WHERE "courseId" = ${courseId}
    ORDER BY "order" ASC
  `;

  for (const generatedQuiz of generatedQuizzes) {
    const quizData = generatedQuiz.generated_data;
    const quiz = quizData.quiz || quizData;

    // Find appropriate lesson (distribute quizzes across lessons)
    const lessonIndex = Math.floor(
      (quizzesCreated / generatedQuizzes.length) * lessons.length
    );
    const lesson = lessons[lessonIndex];

    const quizId = cuid();

    try {
      // Create quiz
      await prisma.$executeRaw`
        INSERT INTO course_quizzes (
          id, "courseId", "lessonId", title, description,
          "passingScore", "timeLimit", "maxAttempts", "showAnswers",
          "order", "createdAt", "updatedAt"
        ) VALUES (
          ${quizId},
          ${courseId},
          ${lesson?.id || null},
          ${quiz.title || `Quiz ${quizzesCreated + 1}`},
          ${quiz.description || ""},
          ${quiz.passingScore || 70},
          ${quiz.timeLimit || quiz.estimatedTimeMinutes || null},
          ${quiz.maxAttempts || 3},
          ${true},
          ${quizzesCreated},
          NOW(),
          NOW()
        )
      `;

      // Create quiz questions
      const questions = quiz.questions || [];
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionId = cuid();

        // Map question type
        let questionType = "multiple_choice";
        if (question.type === "true_false") questionType = "true_false";
        else if (question.type === "short_answer")
          questionType = "short_answer";
        else if (question.type === "essay") questionType = "essay";

        try {
          await prisma.$executeRaw`
            INSERT INTO quiz_questions (
              id, "quizId", question, type, options,
              "correctAnswer", explanation, points,
              "order", "createdAt"
            ) VALUES (
              ${questionId},
              ${quizId},
              ${question.question},
              ${questionType},
              ${JSON.stringify(question.options || [])},
              ${JSON.stringify(question.correctAnswer)},
              ${question.explanation || ""},
              ${question.points || 1},
              ${i},
              NOW()
            )
          `;

          questionsCreated++;
        } catch (error) {
          console.error(`Error creating question ${i + 1}:`, error);
        }
      }

      quizzesCreated++;
    } catch (error) {
      console.error(`Error creating quiz:`, error);
    }
  }

  return { quizzesCreated, questionsCreated };
}

/**
 * Get published course status
 */
export async function getPublishedCourseStatus(
  courseId: string
): Promise<PublishStatus | null> {
  try {
    const course = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        status,
        "enrollmentCount",
        "completionCount",
        "averageRating",
        "reviewCount",
        "publishedAt"
      FROM courses
      WHERE id = ${courseId}
      LIMIT 1
    `;

    if (!course || course.length === 0) {
      return null;
    }

    const c = course[0];
    return {
      courseId: c.id,
      status: c.status,
      enrollmentCount: c.enrollmentCount || 0,
      completionCount: c.completionCount || 0,
      averageRating: parseFloat(c.averageRating) || 0,
      reviewCount: c.reviewCount || 0,
      publishedAt: c.publishedAt,
    };
  } catch (error) {
    console.error("Error getting course status:", error);
    return null;
  }
}

/**
 * Update course status (draft <-> published)
 */
export async function updateCourseStatus(
  courseId: string,
  status: "draft" | "published"
): Promise<boolean> {
  try {
    await prisma.$executeRaw`
      UPDATE courses
      SET status = ${status},
          "publishedAt" = ${status === "published" ? "NOW()" : null},
          "updatedAt" = NOW()
      WHERE id = ${courseId}
    `;
    return true;
  } catch (error) {
    console.error("Error updating course status:", error);
    return false;
  }
}

/**
 * Unpublish a course (soft delete - set to draft)
 */
export async function unpublishCourse(courseId: string): Promise<boolean> {
  return updateCourseStatus(courseId, "draft");
}

/**
 * Get all published courses
 */
export async function getPublishedCourses(authorId?: string): Promise<any[]> {
  try {
    if (authorId) {
      return await prisma.$queryRaw<any[]>`
        SELECT 
          id, title, slug, description, "shortDescription",
          level, category, tags, price, currency, "isFree",
          status, featured, "isPremium", "enrollmentCount",
          "lessonCount", "publishedAt", "createdAt"
        FROM courses
        WHERE "authorId" = ${authorId}
        ORDER BY "createdAt" DESC
      `;
    } else {
      return await prisma.$queryRaw<any[]>`
        SELECT 
          id, title, slug, description, "shortDescription",
          level, category, tags, price, currency, "isFree",
          status, featured, "isPremium", "enrollmentCount",
          "lessonCount", "publishedAt", "createdAt"
        FROM courses
        ORDER BY "createdAt" DESC
        LIMIT 100
      `;
    }
  } catch (error) {
    console.error("Error getting published courses:", error);
    return [];
  }
}

// ==================== UTILITIES ====================

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .substring(0, 100) + // Limit length
    `-${cuid().substring(0, 8)}`
  ); // Add unique suffix
}

/**
 * Validate publish configuration
 */
export function validatePublishConfig(config: PublishCourseConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Price validation
  if (config.price !== undefined && config.price < 0) {
    errors.push("Price cannot be negative");
  }

  if (
    config.discount !== undefined &&
    (config.discount < 0 || config.discount > 100)
  ) {
    errors.push("Discount must be between 0 and 100");
  }

  // Level validation
  if (
    config.level &&
    !["beginner", "intermediate", "advanced"].includes(config.level)
  ) {
    errors.push("Level must be beginner, intermediate, or advanced");
  }

  // Status validation
  if (config.status && !["draft", "published"].includes(config.status)) {
    errors.push("Status must be draft or published");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
