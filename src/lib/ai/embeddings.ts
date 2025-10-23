/**
 * OpenAI Embeddings Service
 * Converts text into vector embeddings for semantic search
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Embedding model configuration
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim(),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts.map((t) => t.trim()),
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

/**
 * Prepare text for embedding (clean and chunk if needed)
 */
export function prepareTextForEmbedding(
  text: string,
  maxLength: number = 8000
): string[] {
  // Clean the text
  const cleaned = text.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();

  // If text is short enough, return as single chunk
  if (cleaned.length <= maxLength) {
    return [cleaned];
  }

  // Split into chunks
  const chunks: string[] = [];
  let currentChunk = "";

  const sentences = cleaned.split(/[.!?]\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
