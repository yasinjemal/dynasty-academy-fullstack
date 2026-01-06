# 🧠 RAG SYSTEM - COMPLETE SETUP GUIDE

**Status:** ✅ Infrastructure Ready | ⏳ Waiting for Real Books

---

## 📋 What's Been Done

### ✅ Completed Setup

1. **pgvector Extension Enabled** in Supabase
2. **content_embeddings Table Created** with:

   - Vector storage (1536 dimensions for OpenAI ada-002)
   - HNSW index for fast similarity search
   - Metadata support for filtering
   - Page number tracking

3. **search_content() Function** for semantic search
4. **Embeddings Helper** (`/src/lib/embeddings.ts`):

   - Generate embeddings from text
   - Chunk large content into 500-token pieces
   - Search similar content by semantic meaning
   - Store/retrieve embeddings

5. **Embedding Script** (`/scripts/embed-books.ts`):
   - Processes all books from BookContent table
   - Generates embeddings for each page
   - Stores in Supabase with metadata
   - Progress tracking and error handling

---

## 🚀 When You're Ready to Embed Books

### Step 1: Fix Permissions (One-Time Setup)

Run this in **Supabase SQL Editor**:

```sql
-- Grant permissions for service_role (used by scripts)
GRANT ALL ON TABLE content_embeddings TO service_role;
GRANT ALL ON TABLE content_embeddings TO postgres;

-- Grant read access to authenticated users (for chat API)
GRANT SELECT ON TABLE content_embeddings TO authenticated;

-- Grant execute permission on search function
GRANT EXECUTE ON FUNCTION search_content TO service_role;
GRANT EXECUTE ON FUNCTION search_content TO postgres;
GRANT EXECUTE ON FUNCTION search_content TO authenticated;
```

Or run the file: `fix-embeddings-permissions.sql`

### Step 2: Add Your Books

1. Upload books to Dynasty Academy
2. Ensure BookContent table has pages with text content
3. Verify books are ready for production

### Step 3: Run Embedding Script

```powershell
npx tsx scripts/embed-books.ts
```

**What it does:**

- ✅ Finds all books in database
- ✅ Gets content from BookContent table (page by page)
- ✅ Chunks each page into 500-token segments
- ✅ Generates OpenAI embeddings (ada-002)
- ✅ Stores in content_embeddings with page numbers
- ✅ Shows progress: `Page 15, chunk 2/3 (150 total)`
- ✅ Rate limited to 3000 req/min (20ms delay)

**Cost Estimate:**

- OpenAI ada-002: **$0.0001 per 1K tokens**
- 100-page book ≈ 300 chunks ≈ 150K tokens
- Cost per book: **~$0.015** (1.5 cents)
- 100 books: **~$1.50**

**Time Estimate:**

- 300 chunks × 20ms delay = 6 seconds
- Plus API time ≈ **30-60 seconds per book**

---

## 🔄 Re-Embedding Books

### When to Re-Embed:

- ✅ Book content updated
- ✅ Fixed typos/errors
- ✅ Added new pages

### How to Re-Embed:

**Option 1: Re-embed ALL books**

```powershell
npx tsx scripts/embed-books.ts
```

(Script automatically deletes old embeddings first)

**Option 2: Re-embed ONE book** (future feature)

```powershell
npx tsx scripts/embed-books.ts --book-id="clxxx123"
```

**Option 3: Delete embeddings manually**

```sql
DELETE FROM content_embeddings WHERE content_id = 'book_id_here';
```

---

## 🧪 Testing Embeddings

### Check Embedding Stats

```sql
SELECT
  content_type,
  COUNT(*) as chunks,
  COUNT(DISTINCT content_id) as items
FROM content_embeddings
GROUP BY content_type;
```

### Test Semantic Search

```sql
-- Find chunks about "discipline" (you'll need an embedding vector)
SELECT
  content_title,
  page_number,
  chunk_text,
  similarity
FROM search_content(
  '[... embedding vector ...]'::vector(1536),
  0.7, -- threshold
  5    -- top 5 results
);
```

### View Embedded Books

```sql
SELECT
  content_title,
  COUNT(*) as chunks,
  MIN(page_number) as first_page,
  MAX(page_number) as last_page,
  MIN(created_at) as embedded_at
FROM content_embeddings
WHERE content_type = 'book'
GROUP BY content_id, content_title
ORDER BY embedded_at DESC;
```

---

## 📊 Next Steps (After Embedding)

### 1. Integrate RAG into Chat API

Update `/src/app/api/ai/chat/route.ts`:

```typescript
import { searchSimilarContent } from "@/lib/embeddings";

// Inside POST handler, before GPT-4 call:
const relevantContent = await searchSimilarContent(userMessage, {
  matchThreshold: 0.7,
  matchCount: 3,
  filterType: "book", // or 'course', 'lesson'
});

// Add to system prompt:
if (relevantContent.length > 0) {
  const context = relevantContent
    .map((r) => `[${r.content_title}, Page ${r.page_number}]: ${r.chunk_text}`)
    .join("\n\n");

  systemPrompt += `\n\nRelevant content from books:\n${context}`;
}
```

### 2. Test RAG in Chat

Ask questions like:

- "What does the book say about discipline?"
- "Summarize the chapter on morning routines"
- "Quote the section about goal setting"

AI should reference actual book content with page numbers!

### 3. Build Admin Dashboard

Create `/admin/rag-management`:

- View total embeddings
- See embedded books
- Re-embed specific books
- Monitor search quality
- Delete test embeddings

### 4. Optimize

- Add caching for common queries
- Tune similarity threshold (0.7 default)
- Handle edge cases (no matches, low similarity)
- Add metadata filtering (by category, author, etc.)

---

## 🔧 Troubleshooting

### "Permission denied for schema public"

**Fix:** Run `fix-embeddings-permissions.sql` in Supabase

### "No content to embed"

**Check:** BookContent table has pages for this book

```sql
SELECT bookId, COUNT(*) FROM book_contents GROUP BY bookId;
```

### Embeddings taking too long

**Normal:** 30-60 seconds per book (API calls + rate limiting)
**Speed up:** Reduce delay from 20ms to 10ms (but watch rate limits)

### High OpenAI costs

**Check:** How many chunks per book?

```sql
SELECT content_title, COUNT(*) as chunks
FROM content_embeddings
GROUP BY content_title
ORDER BY chunks DESC;
```

**Optimize:** Increase chunk size or skip very short pages

### Search returning irrelevant results

**Fix:** Increase match_threshold from 0.7 to 0.8 or 0.85
**Check:** Are embeddings for correct content?

---

## 📁 File Reference

### Core Files

- `/src/lib/embeddings.ts` - Embeddings helper functions
- `/scripts/embed-books.ts` - Book embedding script
- `/supabase-pgvector-setup.sql` - Initial setup
- `/fix-embeddings-permissions.sql` - Permissions fix

### Environment Variables (Already Set)

```env
NEXT_PUBLIC_SUPABASE_URL="https://xepfxnqprkcccgnwmctj.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
OPENAI_API_KEY="sk-proj-..."
```

---

## 💰 Cost Breakdown

### Per Embedding Run:

- **1 book (100 pages):** ~300 chunks
- **OpenAI Embedding:** $0.0001/1K tokens
- **Average chunk:** 500 tokens
- **Cost per book:** ~$0.015 (1.5 cents)

### Example Scenarios:

- **10 books:** ~$0.15
- **50 books:** ~$0.75
- **100 books:** ~$1.50
- **1000 books:** ~$15

**Storage:** Supabase free tier includes 500MB database (plenty for embeddings)

---

## ✅ Checklist for Production

Before going live with RAG:

- [ ] Run `fix-embeddings-permissions.sql`
- [ ] Delete test books and embeddings
- [ ] Add real, production-ready books
- [ ] Run `npx tsx scripts/embed-books.ts`
- [ ] Verify embeddings in database (check counts)
- [ ] Integrate RAG into chat API
- [ ] Test with real questions
- [ ] Monitor OpenAI costs
- [ ] Set up admin dashboard
- [ ] Document for team

---

## 🎯 Current Status

**Infrastructure:** ✅ 100% Complete

- pgvector enabled
- Tables created
- Functions working
- Scripts ready
- Environment configured

**Embeddings:** ⏳ Waiting for real books

- Test books will be deleted
- Run script when production books are ready
- Estimated time: 1-2 minutes per book

**Integration:** 🔴 Not started yet

- Will add to chat API after embeddings
- Graceful fallback if no embeddings found
- Admin tools for management

---

**Ready to proceed when you add real books!** 🚀

Just run: `npx tsx scripts/embed-books.ts`
