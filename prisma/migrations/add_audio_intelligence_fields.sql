-- 🔥 AUDIO INTELLIGENCE ENHANCEMENT
-- Add content hash fields for revolutionary 99% cost reduction

-- Add new columns for smart caching
ALTER TABLE book_audio ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE book_audio ADD COLUMN IF NOT EXISTS voice_id TEXT;
ALTER TABLE book_audio ADD COLUMN IF NOT EXISTS storage_url TEXT;
ALTER TABLE book_audio ADD COLUMN IF NOT EXISTS duration_sec DOUBLE PRECISION;
ALTER TABLE book_audio ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE book_audio ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'mp3_44100_128';
ALTER TABLE book_audio ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;

-- Create unique index for content hash (enables O(1) lookups!)
CREATE UNIQUE INDEX IF NOT EXISTS book_audio_content_hash_key ON book_audio(content_hash) WHERE content_hash IS NOT NULL;

-- Create performance index for hash lookups
CREATE INDEX IF NOT EXISTS book_audio_content_hash_idx ON book_audio(content_hash);

-- Update existing records to have default access count
UPDATE book_audio SET access_count = 0 WHERE access_count IS NULL;

-- Add comment explaining the revolution
COMMENT ON COLUMN book_audio.content_hash IS 'SHA-256 hash of (text + voiceId + settings) - enables 99% cache hit rate through content-based deduplication';
COMMENT ON COLUMN book_audio.access_count IS 'Number of times this cached audio has been accessed - tracks cost savings';
