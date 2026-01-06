-- Create book_reflections table for Social Reading Layer
CREATE TABLE IF NOT EXISTS book_reflections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  chapter_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  community_post_id TEXT UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_book_reflections_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_book_reflections_book 
    FOREIGN KEY (book_id) 
    REFERENCES books(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_book_reflections_community_post 
    FOREIGN KEY (community_post_id) 
    REFERENCES forum_topics(id) 
    ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_book_reflections_user_id ON book_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reflections_book_id ON book_reflections(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reflections_chapter_number ON book_reflections(chapter_number);
CREATE INDEX IF NOT EXISTS idx_book_reflections_created_at ON book_reflections(created_at);
