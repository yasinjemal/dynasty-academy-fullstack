-- Fix numeric field overflow by changing DECIMAL(3,2) to DECIMAL(5,2)
-- This allows values from 0-100 instead of just 0-9.99

-- Fix ai_generated_content table
ALTER TABLE ai_generated_content 
  ALTER COLUMN quality_score TYPE DECIMAL(5, 2),
  ALTER COLUMN confidence_score TYPE DECIMAL(5, 2);

-- Fix ai_course_templates table
ALTER TABLE ai_course_templates 
  ALTER COLUMN success_rate TYPE DECIMAL(5, 2),
  ALTER COLUMN avg_quality_score TYPE DECIMAL(5, 2);

-- Verify changes
SELECT 
  table_name, 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale
FROM information_schema.columns
WHERE table_name IN ('ai_generated_content', 'ai_course_templates')
  AND column_name IN ('quality_score', 'confidence_score', 'success_rate', 'avg_quality_score')
ORDER BY table_name, column_name;
