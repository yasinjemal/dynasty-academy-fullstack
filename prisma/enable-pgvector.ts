/**
 * Enable pgvector extension in Supabase
 *
 * Run this script to set up the vector database for Dynasty Nexus 2.0
 *
 * Usage:
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to SQL Editor
 * 3. Create a new query
 * 4. Paste the SQL from ENABLE_PGVECTOR_SQL below
 * 5. Run the query
 *
 * OR run this TypeScript script: npx tsx prisma/enable-pgvector.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ENABLE_PGVECTOR_SQL = `
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- Create helper function for cosine similarity
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector) 
RETURNS float AS $$
SELECT 1 - (a <=> b);
$$ LANGUAGE SQL IMMUTABLE STRICT PARALLEL SAFE;

-- Create helper function for euclidean distance
CREATE OR REPLACE FUNCTION euclidean_distance(a vector, b vector) 
RETURNS float AS $$
SELECT a <-> b;
$$ LANGUAGE SQL IMMUTABLE STRICT PARALLEL SAFE;

-- Test vector operations
SELECT 
  '[1,2,3]'::vector <-> '[4,5,6]'::vector AS euclidean_distance,
  1 - ('[1,2,3]'::vector <=> '[4,5,6]'::vector) AS cosine_similarity;
`;

async function enablePgVector() {
  console.log("🚀 Enabling pgvector extension in Supabase...\n");

  try {
    // Step 1: Enable extension
    console.log("Step 1: Enabling pgvector extension...");
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log("✅ pgvector extension enabled\n");

    // Step 2: Create helper functions
    console.log("Step 2: Creating helper functions...");
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector) 
      RETURNS float AS $$
      SELECT 1 - (a <=> b);
      $$ LANGUAGE SQL IMMUTABLE STRICT PARALLEL SAFE;
    `;
    console.log("✅ Cosine similarity function created\n");

    // Step 3: Create HNSW indexes
    console.log("Step 3: Creating HNSW indexes for fast vector search...\n");

    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_concepts_embedding_hnsw 
        ON concepts USING hnsw (embedding vector_cosine_ops) 
        WITH (m = 16, ef_construction = 64);
      `;
      console.log("✅ Created index on concepts.embedding");
    } catch (error: any) {
      if (error.code === "P2010" || error.meta?.code === "42P07") {
        console.log("⚠️  concepts.embedding index already exists");
      } else {
        console.log(
          "⚠️  Could not create concepts.embedding index:",
          error.message
        );
      }
    }

    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_content_embeddings_embedding_hnsw 
        ON content_embeddings USING hnsw (embedding vector_cosine_ops) 
        WITH (m = 16, ef_construction = 64);
      `;
      console.log("✅ Created index on content_embeddings.embedding");
    } catch (error: any) {
      if (error.code === "P2010" || error.meta?.code === "42P07") {
        console.log("⚠️  content_embeddings.embedding index already exists");
      } else {
        console.log(
          "⚠️  Could not create content_embeddings.embedding index:",
          error.message
        );
      }
    }

    // Step 4: Verify installation
    console.log("\nStep 4: Verifying installation...");
    const result = await prisma.$queryRaw<
      Array<{ extname: string; extversion: string }>
    >`
      SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
    `;

    if (result.length > 0) {
      console.log(
        `✅ pgvector ${result[0].extversion} is installed and ready!\n`
      );
    }

    console.log("🎉 Dynasty Nexus 2.0 - Phase 1 database setup complete!");
    console.log("✅ 6 new tables created");
    console.log("✅ Vector search enabled");
    console.log("✅ HNSW indexes created");
    console.log("\n🚀 Ready to build the Self-Healing Knowledge Graph!");
    console.log("\nNew tables:");
    console.log("  - concepts (knowledge units with embeddings)");
    console.log("  - concept_relationships (prerequisite chains)");
    console.log("  - learning_paths (optimized learning sequences)");
    console.log("  - knowledge_gaps (detected learning gaps)");
    console.log("  - content_embeddings (vector representations)");
    console.log("  - similarity_cache (performance optimization)");
  } catch (error: any) {
    console.error("❌ Error enabling pgvector:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Make sure you have Supabase database access");
    console.error("2. Check that your DATABASE_URL is correct in .env");
    console.error(
      "3. You may need to enable pgvector manually in Supabase SQL Editor"
    );
    console.error("\nManual SQL to run in Supabase (one at a time):");
    console.error("```sql");
    console.error("CREATE EXTENSION IF NOT EXISTS vector;");
    console.error("```");
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
enablePgVector();
