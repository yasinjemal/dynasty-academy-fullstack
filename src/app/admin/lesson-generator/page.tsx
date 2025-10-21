/**
 * Lesson Generator Admin Page
 * Server Component - Fetches data and handles auth
 */

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import LessonGeneratorClient from "./LessonGeneratorClient";

const prisma = new PrismaClient();

export default async function LessonGeneratorPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Get all generated courses using raw SQL
  const generatedCoursesRaw = await prisma.$queryRaw<any[]>`
    SELECT 
      id,
      source_id as "sourceId",
      source_title as "sourceTitle",
      generated_data as "generatedData",
      status,
      confidence_score as "confidenceScore",
      published_to as "publishedTo",
      created_at as "createdAt"
    FROM ai_generated_content
    WHERE content_type = 'course'
      AND status IN ('draft', 'approved', 'published')
    ORDER BY created_at DESC
  `;

  // Convert Decimal objects to numbers
  const generatedCourses = generatedCoursesRaw.map((course) => ({
    ...course,
    confidenceScore: course.confidenceScore
      ? Number(course.confidenceScore)
      : null,
  }));

  // Get all generated lessons using raw SQL
  const generatedLessonsRaw = await prisma.$queryRaw<any[]>`
    SELECT 
      id,
      source_title as "sourceTitle",
      generated_data as "generatedData",
      status,
      confidence_score as "confidenceScore",
      cost_usd as "costUsd",
      metadata,
      created_at as "createdAt"
    FROM ai_generated_content
    WHERE content_type = 'lesson'
    ORDER BY created_at DESC
    LIMIT 50
  `;

  // Convert Decimal objects to numbers
  const generatedLessons = generatedLessonsRaw.map((lesson) => ({
    ...lesson,
    confidenceScore: lesson.confidenceScore
      ? Number(lesson.confidenceScore)
      : null,
    costUsd: lesson.costUsd ? Number(lesson.costUsd) : null,
  }));

  // Get statistics using raw SQL
  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(*) as total_generated,
      COALESCE(SUM(cost_usd), 0) as total_cost,
      COALESCE(SUM(tokens_used), 0) as total_tokens,
      COALESCE(AVG(confidence_score), 0) as avg_confidence
    FROM ai_generated_content
    WHERE content_type = 'lesson'
  `;

  const lessonStats = {
    totalGenerated: Number(stats[0]?.total_generated || 0),
    totalCost: Number(stats[0]?.total_cost || 0),
    totalTokens: Number(stats[0]?.total_tokens || 0),
    avgConfidence: Number(stats[0]?.avg_confidence || 0),
  };

  return (
    <LessonGeneratorClient
      generatedCourses={generatedCourses}
      generatedLessons={generatedLessons}
      stats={lessonStats}
    />
  );
}
