/**
 * 🧠 EMBEDDINGS HELPER
 *
 * Handles text → vector conversion using OpenAI embeddings
 * and vector similarity search in Supabase pgvector
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding vector from text using OpenAI ada-002
 * Returns 1536-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.substring(0, 8000), // Max tokens limit
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("❌ Generate embedding error:", error);
    throw error;
  }
}

/**
 * Store content embedding in Supabase
 */
export interface ContentEmbedding {
  content_type: "book" | "course" | "lesson";
  content_id: string;
  content_title: string;
  content_slug?: string;
  chunk_text: string;
  chunk_index: number;
  page_number?: number;
  embedding: number[];
  metadata?: Record<string, any>;
}

export async function upsertEmbedding(
  data: ContentEmbedding
): Promise<{ success: boolean; id?: string; error?: any }> {
  try {
    const { data: result, error } = await supabase
      .from("content_embeddings")
      .upsert(
        {
          content_type: data.content_type,
          content_id: data.content_id,
          content_title: data.content_title,
          content_slug: data.content_slug,
          chunk_text: data.chunk_text,
          chunk_index: data.chunk_index,
          page_number: data.page_number,
          embedding: data.embedding,
          metadata: data.metadata || {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "content_type,content_id,chunk_index",
        }
      )
      .select("id")
      .single();

    if (error) {
      console.error("❌ Upsert embedding error:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("❌ Upsert embedding exception:", error);
    return { success: false, error };
  }
}

/**
 * Search for similar content using vector similarity
 */
export interface SearchOptions {
  matchThreshold?: number; // 0-1, higher = more similar required
  matchCount?: number; // How many results to return
  filterType?: "book" | "course" | "lesson";
  filterId?: string; // Specific content ID to search within
}

export interface SearchResult {
  id: string;
  content_type: string;
  content_id: string;
  content_title: string;
  chunk_text: string;
  page_number?: number;
  similarity: number;
  metadata: Record<string, any>;
}

export async function searchSimilarContent(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  try {
    // 1. Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search using Supabase RPC function
    const { data, error } = await supabase.rpc("search_content", {
      query_embedding: queryEmbedding,
      match_threshold: options.matchThreshold || 0.7,
      match_count: options.matchCount || 5,
      filter_type: options.filterType || null,
      filter_id: options.filterId || null,
    });

    if (error) {
      console.error("❌ Search error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("❌ Search exception:", error);
    return [];
  }
}

/**
 * Delete embeddings for specific content
 */
export async function deleteEmbeddings(
  contentType: string,
  contentId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from("content_embeddings")
      .delete()
      .eq("content_type", contentType)
      .eq("content_id", contentId);

    if (error) {
      console.error("❌ Delete embeddings error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Delete embeddings exception:", error);
    return { success: false, error };
  }
}

/**
 * Get embedding statistics
 */
export async function getEmbeddingStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  recentlyUpdated: number;
}> {
  try {
    // Total count
    const { count: total } = await supabase
      .from("content_embeddings")
      .select("*", { count: "exact", head: true });

    // By type
    const { data: byTypeData } = await supabase
      .from("content_embeddings")
      .select("content_type")
      .limit(10000);

    const byType: Record<string, number> = {};
    byTypeData?.forEach((row) => {
      byType[row.content_type] = (byType[row.content_type] || 0) + 1;
    });

    // Recently updated (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentlyUpdated } = await supabase
      .from("content_embeddings")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", sevenDaysAgo.toISOString());

    return {
      total: total || 0,
      byType,
      recentlyUpdated: recentlyUpdated || 0,
    };
  } catch (error) {
    console.error("❌ Get stats error:", error);
    return { total: 0, byType: {}, recentlyUpdated: 0 };
  }
}

/**
 * Chunk text into smaller pieces for embedding
 * Optimal chunk size: 200-500 tokens (~150-400 words)
 */
export function chunkText(text: string, maxChunkSize: number = 500): string[] {
  // Split by paragraphs first
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds limit, save current chunk
    if (
      currentChunk.length > 0 &&
      currentChunk.length + paragraph.length > maxChunkSize * 4
    ) {
      // ~4 chars per token
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }

    // If single paragraph is too large, split by sentences
    if (paragraph.length > maxChunkSize * 4) {
      const sentences = paragraph.split(/\.  +/);
      for (const sentence of sentences) {
        if (
          currentChunk.length > 0 &&
          currentChunk.length + sentence.length > maxChunkSize * 4
        ) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
        currentChunk += sentence + ". ";
      }
    } else {
      currentChunk += paragraph + "\n\n";
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
