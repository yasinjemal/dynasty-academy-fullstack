/**
 * 🎛️ RAG MANAGEMENT - ADMIN DASHBOARD
 *
 * Admin interface for managing the RAG (Retrieval Augmented Generation) system
 *
 * Features:
 * - View embedding statistics
 * - Monitor embedded books/courses
 * - Re-embed content
 * - Test search quality
 * - Delete embeddings
 * - View search analytics
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import RagManagementClient from "./RagManagementClient";

export const metadata = {
  title: "RAG Management | Dynasty Academy",
  description: "Manage vector embeddings and RAG system",
};

async function getEmbeddingStats() {
  try {
    // Get stats from Supabase using raw SQL
    const stats = await prisma.$queryRaw`
      SELECT 
        "contentType" as content_type,
        COUNT(*) as chunk_count,
        COUNT(DISTINCT "contentId") as item_count,
        MIN("createdAt") as oldest_embedding,
        MAX("updatedAt") as newest_embedding
      FROM content_embeddings
      GROUP BY "contentType"
    `;

    return stats;
  } catch (error) {
    console.error("Failed to get embedding stats:", error);
    return [];
  }
}

async function getRecentEmbeddings() {
  try {
    const recent = await prisma.$queryRaw`
      SELECT 
        "contentType" as content_type,
        "contentId" as content_id,
        LEFT("textContent", 100) as content_preview,
        COUNT(*) as chunks,
        MAX("updatedAt") as last_updated
      FROM content_embeddings
      GROUP BY "contentType", "contentId", "textContent"
      ORDER BY MAX("updatedAt") DESC
      LIMIT 10
    `;

    return recent;
  } catch (error) {
    console.error("Failed to get recent embeddings:", error);
    return [];
  }
}

async function getBooks() {
  try {
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        totalPages: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return books;
  } catch (error) {
    console.error("Failed to get books:", error);
    return [];
  }
}

export default async function RagManagementPage() {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get data
  const [stats, recentEmbeddings, books] = await Promise.all([
    getEmbeddingStats(),
    getRecentEmbeddings(),
    getBooks(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎛️ RAG Management
          </h1>
          <p className="text-gray-400">
            Manage vector embeddings and RAG system
          </p>
        </div>

        {/* Client Component with data */}
        <RagManagementClient
          stats={stats}
          recentEmbeddings={recentEmbeddings}
          books={books}
        />
      </div>
    </div>
  );
}
