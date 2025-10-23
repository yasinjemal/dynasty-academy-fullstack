-- Enable pgvector extension for vector similarity search
-- This must be run before the schema can use vector types

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a function for cosine similarity search (if not exists)
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector) 
RETURNS float AS $$
SELECT 1 - (a <=> b);
$$ LANGUAGE SQL IMMUTABLE STRICT PARALLEL SAFE;

-- Create indexes for vector columns (will be applied after table creation)
-- These use HNSW (Hierarchical Navigable Small World) algorithm for fast approximate nearest neighbor search

-- Note: The actual index creation will happen automatically via Prisma
-- but we're documenting the index strategy here for reference

-- Index configuration for best performance:
-- - m: Maximum number of connections per layer (16 is good default)
-- - ef_construction: Size of dynamic candidate list during index construction (64 is good)

-- Example manual index creation (if needed):
-- CREATE INDEX idx_concepts_embedding_hnsw ON concepts USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
-- CREATE INDEX idx_content_embeddings_embedding_hnsw ON content_embeddings USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
