-- Add AI-Generated Content Tracking Tables
-- Run this in Supabase SQL Editor

-- 1. Track all AI-generated content for auditing and analytics
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id TEXT PRIMARY KEY,
  
  -- Content Type & Source
  content_type TEXT NOT NULL, -- 'course' | 'lesson' | 'quiz' | 'section'
  source_type TEXT NOT NULL,  -- 'book' | 'manual' | 'existing_course'
  source_id TEXT NOT NULL,    -- bookId, courseId, etc
  source_title TEXT,          -- For display purposes
  
  -- Generated Content
  generated_data JSONB NOT NULL, -- The actual generated content
  prompt_used TEXT,               -- The AI prompt that was used
  model_used TEXT NOT NULL,       -- 'gpt-4', 'gpt-4-turbo', etc
  
  -- AI Metadata
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 4) DEFAULT 0,
  generation_time_ms INTEGER,
  temperature DECIMAL(3, 2),
  
  -- Quality & Status
  status TEXT DEFAULT 'draft', -- 'draft' | 'review' | 'approved' | 'rejected' | 'published'
  quality_score DECIMAL(3, 2), -- 0-100 score
  confidence_score DECIMAL(3, 2), -- AI's confidence in generation
  
  -- Review Workflow
  reviewed_by TEXT,            -- userId of reviewer
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  approved_by TEXT,            -- userId of approver
  approved_at TIMESTAMPTZ,
  
  -- Publishing
  published_to TEXT,           -- courseId, lessonId after publishing
  published_at TIMESTAMPTZ,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_id TEXT,              -- For tracking regenerations
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  edit_count INTEGER DEFAULT 0,
  last_edited_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Track AI generation jobs (for async processing)
CREATE TABLE IF NOT EXISTS ai_generation_jobs (
  id TEXT PRIMARY KEY,
  
  -- Job Details
  job_type TEXT NOT NULL,     -- 'course' | 'batch_lessons' | 'quiz_set'
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  
  -- Configuration
  config JSONB NOT NULL,       -- Job-specific configuration
  priority INTEGER DEFAULT 5,  -- 1-10, higher = more urgent
  
  -- Status
  status TEXT DEFAULT 'queued', -- 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress INTEGER DEFAULT 0,   -- 0-100 percentage
  current_step TEXT,
  
  -- Results
  result_ids TEXT[],           -- IDs of generated content
  error_message TEXT,
  error_stack TEXT,
  
  -- Performance
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  
  -- Metadata
  created_by TEXT NOT NULL,    -- userId
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Track course generation templates & best practices
CREATE TABLE IF NOT EXISTS ai_course_templates (
  id TEXT PRIMARY KEY,
  
  -- Template Info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,               -- 'business', 'technology', 'finance', etc
  
  -- Template Structure
  structure JSONB NOT NULL,    -- Predefined course structure
  prompt_template TEXT NOT NULL,
  example_output JSONB,
  
  -- Usage Stats
  use_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3, 2),
  avg_quality_score DECIMAL(3, 2),
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_type ON ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_source ON ai_generated_content(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_status ON ai_generated_content(status);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_created ON ai_generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_published_to ON ai_generated_content(published_to);

CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_status ON ai_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_created ON ai_generation_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_created_by ON ai_generation_jobs(created_by);

CREATE INDEX IF NOT EXISTS idx_ai_course_templates_category ON ai_course_templates(category);
CREATE INDEX IF NOT EXISTS idx_ai_course_templates_active ON ai_course_templates(is_active);

-- Enable Row Level Security (optional)
-- ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_generation_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_course_templates ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE ai_generated_content TO service_role;
GRANT ALL ON TABLE ai_generated_content TO postgres;
GRANT SELECT ON TABLE ai_generated_content TO authenticated;

GRANT ALL ON TABLE ai_generation_jobs TO service_role;
GRANT ALL ON TABLE ai_generation_jobs TO postgres;
GRANT SELECT ON TABLE ai_generation_jobs TO authenticated;

GRANT ALL ON TABLE ai_course_templates TO service_role;
GRANT ALL ON TABLE ai_course_templates TO postgres;
GRANT SELECT ON TABLE ai_course_templates TO authenticated;

COMMENT ON TABLE ai_generated_content IS 'Stores all AI-generated content with full audit trail';
COMMENT ON TABLE ai_generation_jobs IS 'Tracks async AI generation jobs';
COMMENT ON TABLE ai_course_templates IS 'Reusable templates for course generation';
