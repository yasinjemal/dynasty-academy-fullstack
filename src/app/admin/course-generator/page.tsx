/**
 * 🎓 AI Course Generator - Admin Dashboard
 *
 * /admin/course-generator
 *
 * Beautiful, powerful interface for generating courses from books using AI
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import CourseGeneratorClient from "./CourseGeneratorClient";

const prisma = new PrismaClient();

export default async function CourseGeneratorPage() {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Get all books
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      totalPages: true,
      coverImage: true,
      description: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get recent generations
  const recentGenerationsRaw = await prisma.$queryRaw<any[]>`
    SELECT 
      id,
      source_title,
      generated_data->>'title' as course_title,
      status,
      confidence_score,
      tokens_used,
      cost_usd,
      generation_time_ms,
      created_at
    FROM ai_generated_content
    WHERE content_type = 'course'
    ORDER BY created_at DESC
    LIMIT 20
  `;

  // Convert Decimal objects to numbers for serialization
  const recentGenerations = recentGenerationsRaw.map((gen) => ({
    ...gen,
    confidence_score: gen.confidence_score
      ? Number(gen.confidence_score)
      : null,
    tokens_used: gen.tokens_used ? Number(gen.tokens_used) : null,
    cost_usd: gen.cost_usd ? Number(gen.cost_usd) : null,
    generation_time_ms: gen.generation_time_ms
      ? Number(gen.generation_time_ms)
      : null,
  }));

  // Get stats
  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(*) as total_generated,
      COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
      COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
      COUNT(*) FILTER (WHERE status = 'published') as published_count,
      COALESCE(SUM(cost_usd), 0) as total_cost,
      COALESCE(SUM(tokens_used), 0) as total_tokens
    FROM ai_generated_content
    WHERE content_type = 'course'
  `;

  const statsData = stats[0] || {
    total_generated: 0,
    draft_count: 0,
    approved_count: 0,
    published_count: 0,
    total_cost: 0,
    total_tokens: 0,
  };

  // Convert stats Decimal objects to numbers
  const serializedStats = {
    total_generated: Number(statsData.total_generated),
    draft_count: Number(statsData.draft_count),
    approved_count: Number(statsData.approved_count),
    published_count: Number(statsData.published_count),
    total_cost: Number(statsData.total_cost),
    total_tokens: Number(statsData.total_tokens),
  };

  await prisma.$disconnect();

  return (
    <CourseGeneratorClient
      books={books}
      recentGenerations={recentGenerations}
      stats={serializedStats}
    />
  );
}
