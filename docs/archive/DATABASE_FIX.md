# 🔧 Database Connection Fix

## Problem

Database connection failing with error: `FATAL: Tenant or user not found`

This means your Supabase credentials are expired or incorrect.

## Solution

### Step 1: Get Fresh Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Look for both:
   - **Connection pooling** URL (for DATABASE_URL)
   - **Direct connection** URL (for DIRECT_URL)

### Step 2: Update .env.local

Replace the existing DATABASE_URL and DIRECT_URL in your `.env.local` file with the fresh credentials from Supabase.

Example format:

```bash
# Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### Step 3: Restart Dev Server

After updating credentials:

1. Stop the dev server (Ctrl+C in terminal)
2. Run: `npm run dev`

## Alternative: Test Without Database

If you just want to test **Spotify Integration** and other client-side features (which don't need the database), you can:

1. Skip the database fix for now
2. Go directly to a book's Listen Mode page
3. Test all 10 Pandora features (most work client-side)

The features that work WITHOUT database:

- ✅ Spotify Integration (client-side OAuth)
- ✅ Emotional Intelligence AI (client-side)
- ✅ Voice Cloning (ElevenLabs API)
- ✅ Multi-Voice Dialogues (client-side)
- ✅ 3D Spatial Audio (client-side)
- ✅ Learning Mode (client-side)
- ✅ Social Rooms (client-side)
- ✅ Focus Detection (client-side)

The features that NEED database:

- ❌ Smart Bookmarks (saves to DB)
- ❌ AI Study Buddy (saves chat history)

## Quick Test URL

If you want to test features without fixing DB:

- Just navigate directly to: `http://localhost:3000/books/[any-slug]/listen`
- The Listen Mode component will load even if book data fails

---

**Recommendation**: Fix Supabase credentials to get full functionality, or test client-side features first! 🚀
