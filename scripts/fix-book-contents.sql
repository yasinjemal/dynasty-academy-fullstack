-- Fix orphaned book_contents records before schema push
-- This script cleans up foreign key constraint violations

-- 1. Find and delete orphaned book_contents records
DELETE FROM book_contents 
WHERE "bookId" NOT IN (SELECT id FROM books);

-- 2. Verify no orphans remain
SELECT COUNT(*) as orphaned_count 
FROM book_contents bc
LEFT JOIN books b ON bc."bookId" = b.id
WHERE b.id IS NULL;

-- If orphaned_count = 0, you can safely run: npx prisma db push
