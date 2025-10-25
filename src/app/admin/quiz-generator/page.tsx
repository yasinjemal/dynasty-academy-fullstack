/**
 * Quiz Generator Admin Page
 * Server Component - Fetches data and handles auth
 */

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import QuizGeneratorClient from "./QuizGeneratorClient";

const prisma = new PrismaClient();

export default async function QuizGeneratorPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Get all PUBLISHED courses from the actual courses table
  const publishedCourses = await prisma.courses.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert to format expected by client (matching old structure)
  const generatedCourses = publishedCourses.map((course) => ({
    id: course.id,
    source_id: course.id,
    source_title: course.title,
    status: "published",
    confidence_score: 100,
    created_at: course.createdAt,
    generated_data: {
      course: {
        title: course.title,
        description: course.description,
      },
    },
  }));

  // Get all PUBLISHED lessons from the actual course_lessons table
  const publishedLessons = await prisma.course_lessons.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      courseId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  // Convert to format expected by client
  const generatedLessons = publishedLessons.map((lesson) => ({
    id: lesson.id,
    source_title: lesson.title,
    status: "published",
    created_at: lesson.createdAt,
    metadata: {
      courseId: lesson.courseId,
    },
    generated_data: {
      lesson: {
        title: lesson.title,
        description: lesson.description,
      },
    },
  }));

  // Get all generated quizzes
  const generatedQuizzesRaw = (await prisma.$queryRaw`
    SELECT id, source_type, source_id, source_title, generated_data, status, 
           confidence_score, cost_usd, metadata, created_at
    FROM ai_generated_content
    WHERE content_type = 'quiz'
    ORDER BY created_at DESC
    LIMIT 50
  `) as any[];

  // Convert Decimal objects to numbers
  const generatedQuizzes = generatedQuizzesRaw.map((quiz) => ({
    ...quiz,
    confidence_score: quiz.confidence_score
      ? Number(quiz.confidence_score)
      : null,
    cost_usd: quiz.cost_usd ? Number(quiz.cost_usd) : null,
  }));

  // Get statistics
  const stats = (await prisma.$queryRaw`
    SELECT 
      COUNT(id) as total_generated,
      SUM(cost_usd) as total_cost,
      SUM(tokens_used) as total_tokens,
      AVG(confidence_score) as avg_confidence
    FROM ai_generated_content
    WHERE content_type = 'quiz'
  `) as any[];

  const quizStats = {
    totalGenerated: Number(stats[0]?.total_generated || 0),
    totalCost: Number(stats[0]?.total_cost || 0),
    totalTokens: Number(stats[0]?.total_tokens || 0),
    avgConfidence: Number(stats[0]?.avg_confidence || 0),
  };

  return (
    <QuizGeneratorClient
      generatedCourses={generatedCourses}
      generatedLessons={generatedLessons}
      generatedQuizzes={generatedQuizzes}
      stats={quizStats}
    />
  );
}
