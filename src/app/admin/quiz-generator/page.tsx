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

  // Get all generated courses
  const generatedCoursesRaw = (await prisma.$queryRaw`
    SELECT id, source_id, source_title, generated_data, status, confidence_score, created_at
    FROM ai_generated_content
    WHERE content_type = 'course' AND status IN ('draft', 'approved', 'published')
    ORDER BY created_at DESC
  `) as any[];

  // Convert Decimal objects to numbers
  const generatedCourses = generatedCoursesRaw.map((course) => ({
    ...course,
    confidence_score: course.confidence_score
      ? Number(course.confidence_score)
      : null,
  }));

  // Get all generated lessons
  const generatedLessons = (await prisma.$queryRaw`
    SELECT id, source_title, generated_data, status, metadata, created_at
    FROM ai_generated_content
    WHERE content_type = 'lesson'
    ORDER BY created_at DESC
    LIMIT 100
  `) as any[];

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
