/**
 * Concept Extraction API
 *
 * POST /api/ai/concepts/extract
 * - Extract concepts from courses
 * - Save to database with relationships
 * - Track progress and costs
 *
 * GET /api/ai/concepts/extract
 * - Get extraction statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  extractConceptsFromCourse,
  processConceptsForCourse,
  processConceptsForAllCourses,
  getConceptStats,
} from "@/lib/ai/concept-extractor";

// GET - Get concept extraction stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const stats = await getConceptStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Concept stats error:", error);
    return NextResponse.json(
      { error: "Failed to get concept stats" },
      { status: 500 }
    );
  }
}

// POST - Extract concepts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, mode = "all" } = body;

    // Extract for single course
    if (courseId) {
      const result = await processConceptsForCourse(courseId);

      return NextResponse.json({
        success: true,
        extraction: result.extraction,
        database: result.database,
      });
    }

    // Extract for all courses
    if (mode === "all") {
      // TEMPORARY FIX: Test Prisma directly in route to bypass caching issues
      console.log("Testing Prisma connection...");
      const testCourses = await prisma.course.findMany({
        where: { published: true },
        select: { id: true, title: true },
        take: 5,
      });
      console.log("Found courses:", testCourses.length);

      // If we get here, Prisma works - call the actual function
      const result = await processConceptsForAllCourses();

      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    console.error("Concept extraction error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract concepts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
