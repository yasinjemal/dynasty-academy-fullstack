/**
 * Pinecone Vector Database Configuration
 * Dynasty Nexus - RAG (Retrieval Augmented Generation) System
 */

import { Pinecone } from "@pinecone-database/pinecone";

// Lazy initialization - only when actually used
let pineconeInstance: Pinecone | null = null;

/**
 * Get Pinecone client (lazy initialization)
 */
function getPineconeClient(): Pinecone {
  if (!pineconeInstance) {
    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey) {
      throw new Error("PINECONE_API_KEY environment variable is not set");
    }

    pineconeInstance = new Pinecone({ apiKey });
  }

  return pineconeInstance;
}

// Index configuration
export const PINECONE_INDEX_NAME = "dynasty-academy";
export const PINECONE_NAMESPACE = {
  COURSES: "courses",
  LESSONS: "lessons",
  BOOKS: "books",
  GENERAL: "general",
} as const;

/**
 * Get Pinecone index
 */
export async function getPineconeIndex() {
  const pinecone = getPineconeClient();
  return pinecone.index(PINECONE_INDEX_NAME);
}

/**
 * Upsert vector to Pinecone
 */
export async function upsertVector(params: {
  id: string;
  values: number[];
  metadata: Record<string, any>;
  namespace?: string;
}) {
  const index = await getPineconeIndex();

  await index.namespace(params.namespace || PINECONE_NAMESPACE.GENERAL).upsert([
    {
      id: params.id,
      values: params.values,
      metadata: params.metadata,
    },
  ]);
}

/**
 * Query vectors from Pinecone
 */
export async function queryVectors(params: {
  vector: number[];
  topK?: number;
  namespace?: string;
  filter?: Record<string, any>;
}) {
  const index = await getPineconeIndex();

  const results = await index
    .namespace(params.namespace || PINECONE_NAMESPACE.GENERAL)
    .query({
      vector: params.vector,
      topK: params.topK || 5,
      includeMetadata: true,
      filter: params.filter,
    });

  return results.matches;
}

/**
 * Delete vectors from Pinecone
 */
export async function deleteVectors(params: {
  ids: string[];
  namespace?: string;
}) {
  const index = await getPineconeIndex();

  await index
    .namespace(params.namespace || PINECONE_NAMESPACE.GENERAL)
    .deleteMany(params.ids);
}

/**
 * Delete all vectors in a namespace
 */
export async function deleteNamespace(namespace: string) {
  const index = await getPineconeIndex();
  await index.namespace(namespace).deleteAll();
}

export default getPineconeClient;
