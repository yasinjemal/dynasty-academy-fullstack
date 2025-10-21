-- Fix: Update DECIMAL precision for score fields
-- Run this in Supabase SQL Editor to fix the numeric overflow error

-- Update confidence_score and quality_score to handle values 0-100
ALTER TABLE ai_generated_content 
  ALTER COLUMN confidence_score TYPE DECIMAL(5, 2),
  ALTER COLUMN quality_score TYPE DECIMAL(5, 2);

-- Update template scores as well
ALTER TABLE ai_course_templates 
  ALTER COLUMN success_rate TYPE DECIMAL(5, 2),
  ALTER COLUMN avg_quality_score TYPE DECIMAL(5, 2);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale
FROM information_schema.columns 
WHERE table_name = 'ai_generated_content' 
  AND column_name IN ('confidence_score', 'quality_score');
