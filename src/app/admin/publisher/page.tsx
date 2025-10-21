import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import PublisherClient from "./PublisherClient";
import { Metadata } from "next";

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "AI Publisher | Dynasty Academy",
  description: "Publish AI-generated courses to live platform",
};

export default async function PublisherPage() {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch generated courses ready to publish
  const generatedCoursesRaw = await prisma.$queryRaw<any[]>`
    SELECT 
      id,
      source_id as "sourceId",
      generated_data as "generatedData",
      metadata,
      status,
      confidence_score as "confidenceScore",
      cost_usd as "costUsd",
      created_at as "createdAt"
    FROM ai_generated_content
    WHERE content_type = 'course'
      AND status IN ('approved', 'draft', 'published')
    ORDER BY created_at DESC
    LIMIT 50
  `;

  // Convert Decimal objects to numbers for serialization
  const generatedCourses = generatedCoursesRaw.map((course) => ({
    ...course,
    confidenceScore: course.confidenceScore
      ? Number(course.confidenceScore)
      : null,
    costUsd: course.costUsd ? Number(course.costUsd) : null,
  }));

  // Fetch already published courses
  const publishedCoursesRaw = await prisma.$queryRaw<any[]>`
    SELECT 
      c.id,
      c.title,
      c.slug,
      c.description,
      c.status,
      c.price,
      c."isFree",
      c.level,
      c.category,
      c."enrollmentCount",
      c."lessonCount",
      c."certificateEnabled",
      c."publishedAt",
      c."createdAt",
      COUNT(DISTINCT cl.id) as "actualLessonCount",
      COUNT(DISTINCT cq.id) as "quizCount"
    FROM courses c
    LEFT JOIN course_lessons cl ON c.id = cl."courseId"
    LEFT JOIN course_quizzes cq ON c.id = cq."courseId"
    WHERE c."authorId" = ${session.user.id}
    GROUP BY c.id
    ORDER BY c."createdAt" DESC
    LIMIT 50
  `;

  // Convert Decimal objects to numbers for serialization
  const publishedCourses = publishedCoursesRaw.map((course) => ({
    ...course,
    price: course.price ? Number(course.price) : null,
    enrollmentCount: Number(course.enrollmentCount || 0),
    lessonCount: Number(course.lessonCount || 0),
    actualLessonCount: Number(course.actualLessonCount || 0),
    quizCount: Number(course.quizCount || 0),
  }));

  // Get stats
  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(*) as total_published,
      COALESCE(SUM("enrollmentCount"), 0) as total_enrollments,
      COALESCE(SUM("lessonCount"), 0) as total_lessons,
      AVG(CASE WHEN "averageRating" > 0 THEN "averageRating" ELSE NULL END) as avg_rating
    FROM courses
    WHERE "authorId" = ${session.user.id}
  `;

  const publishStats = stats[0] || {
    total_published: 0,
    total_enrollments: 0,
    total_lessons: 0,
    avg_rating: 0,
  };

  return (
    <PublisherClient
      generatedCourses={generatedCourses}
      publishedCourses={publishedCourses}
      stats={{
        totalPublished: Number(publishStats.total_published),
        totalEnrollments: Number(publishStats.total_enrollments),
        totalLessons: Number(publishStats.total_lessons),
        averageRating: parseFloat(publishStats.avg_rating) || 0,
      }}
    />
  );
}
