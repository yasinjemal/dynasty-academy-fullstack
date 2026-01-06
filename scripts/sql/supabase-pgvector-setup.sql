-- Enable pgvector extension for vector similarity search
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for RAG
CREATE TABLE IF NOT EXISTS content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content metadata
  content_type TEXT NOT NULL, -- 'book', 'course', 'lesson'
  content_id TEXT NOT NULL,   -- bookId, courseId, lessonId
  content_title TEXT NOT NULL,
  content_slug TEXT,
  
  -- Chunk info
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  page_number INTEGER,
  
  -- Vector embedding (OpenAI ada-002 = 1536 dimensions)
  embedding vector(1536) NOT NULL,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT unique_chunk UNIQUE (content_type, content_id, chunk_index)
);

-- Create vector similarity search index (HNSW for speed)
CREATE INDEX IF NOT EXISTS content_embeddings_embedding_idx 
ON content_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS content_embeddings_content_type_idx 
ON content_embeddings (content_type);

CREATE INDEX IF NOT EXISTS content_embeddings_content_id_idx 
ON content_embeddings (content_id);

CREATE INDEX IF NOT EXISTS content_embeddings_created_at_idx 
ON content_embeddings (created_at DESC);

-- Function to search similar content
CREATE OR REPLACE FUNCTION search_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_type text DEFAULT NULL,
  filter_id text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content_type text,
  content_id text,
  content_title text,
  chunk_text text,
  page_number integer,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.content_type,
    ce.content_id,
    ce.content_title,
    ce.chunk_text,
    ce.page_number,
    1 - (ce.embedding <=> query_embedding) as similarity,
    ce.metadata
  FROM content_embeddings ce
  WHERE 
    (filter_type IS NULL OR ce.content_type = filter_type)
    AND (filter_id IS NULL OR ce.content_id = filter_id)
    AND (1 - (ce.embedding <=> query_embedding)) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant permissions (adjust for your auth setup)
-- ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE content_embeddings IS 'Vector embeddings for RAG (Retrieval Augmented Generation)';
COMMENT ON FUNCTION search_content IS 'Semantic search using cosine similarity';
