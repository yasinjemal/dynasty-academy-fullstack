-- Grant permissions for content_embeddings table
-- Run this in Supabase SQL Editor

-- Grant all permissions to service_role (used by scripts)
GRANT ALL ON TABLE content_embeddings TO service_role;
GRANT ALL ON TABLE content_embeddings TO postgres;

-- Grant read access to authenticated users (for the chat API)
GRANT SELECT ON TABLE content_embeddings TO authenticated;

-- Grant execute permission on search function
GRANT EXECUTE ON FUNCTION search_content TO service_role;
GRANT EXECUTE ON FUNCTION search_content TO postgres;
GRANT EXECUTE ON FUNCTION search_content TO authenticated;

-- Confirm permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'content_embeddings';
