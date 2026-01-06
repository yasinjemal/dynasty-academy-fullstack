# 🚀 Quick Start - Professional Audio System

## ✅ What's Done

- ✅ Professional audio utilities created
- ✅ Hash-based caching implemented
- ✅ Supabase Storage integration ready
- ✅ Redis locking system built
- ✅ `/api/voice` route created
- ✅ Dependencies installed (@supabase/supabase-js, ioredis)
- ✅ Database schema updated (AudioAsset model)
- ✅ Migration script ready

## 🎯 What You Need to Do

### Step 1: Configure Supabase Storage (5 minutes)

**Option A: Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Storage** → **New Bucket**
4. Bucket name: `audio`
5. Make bucket **PUBLIC** ✅
6. Click **Create bucket**

**Option B: SQL (faster)**
```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true);

CREATE POLICY "Audio read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Audio upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');
```

### Step 2: Add Environment Variables (2 minutes)

Add to `.env.local`:
```env
# Already have:
ELEVENLABS_API_KEY=sk_e92bc7c3ace8a83f4f5042d8065e85839276ec59a15383b0

# Add these (get from Supabase Dashboard → Settings → API):
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional (for production locking):
REDIS_URL=redis://localhost:6379
```

### Step 3: Run Database Migration (2 minutes)

```bash
# Execute migration
node migrate-audio-assets.mjs

# Regenerate Prisma Client
npx prisma generate

# Restart dev server
npm run dev
```

### Step 4: Test It! (5 minutes)

1. Open browser: http://localhost:3000
2. Navigate to a book (e.g., "The Habit")
3. Click "Listen Mode"
4. Generate audio (first time)
5. Check browser console:
   ```
   ❌ Cache MISS - Generating new audio (PAID)
   🎙️ Generating audio with ElevenLabs...
   ✅ Audio generated in 3421ms
   ☁️ Uploading to Supabase Storage...
   ✅ Uploaded to bookId/hash.mp3 (2.3MB) in 567ms
   ```
6. Generate audio again (same chapter, same voice)
7. Check console:
   ```
   ✅ Cache HIT - Serving existing audio (FREE)
   ```

**Success!** You've achieved 99% cost reduction 🎉

## 📊 Quick Cost Check

| Scenario | Old Cost | New Cost | Savings |
|----------|----------|----------|---------|
| 100 users, same chapter | R1,500 | R15 | 99% |
| 1000 users over time | R15,000 | R15 | 99.9% |

## 🔍 Verify It's Working

### Console Logs:
- **First time:** `❌ Cache MISS` + `🎙️ Generating...` (takes 4-6 sec)
- **Second time:** `✅ Cache HIT` (instant, <100ms)

### Supabase Storage:
- Go to Dashboard → Storage → `audio` bucket
- Should see files: `bookId/a1b2c3d4...mp3`

### Database:
```sql
SELECT content_hash, voice_id, word_count, 
       metadata->>'cacheHits' as hits
FROM audio_assets;
```

## ⚡ Next Steps (Optional)

### Update AudioPlayer Component
Change API endpoint from:
```typescript
// Old
fetch(`/api/books/${slug}/audio`, { ... })

// New
fetch(`/api/voice`, { 
  method: 'POST',
  body: JSON.stringify({
    text: chapterContent,
    voiceId: selectedVoice,
    bookId,
    chapterId: pageNumber.toString(),
  })
})
```

### Add Cache Indicator
```tsx
{response.reused && (
  <span className="text-green-500 text-sm">
    ✅ Cached Audio (Instant)
  </span>
)}
```

## 🐛 Troubleshooting

### "Supabase credentials not configured"
- Check `.env.local` has all 3 Supabase variables
- Restart dev server: `npm run dev`

### "Audio bucket does not exist"
- Create bucket in Supabase Dashboard (Step 1)
- Make sure it's named exactly `audio`
- Make sure it's **PUBLIC**

### "Redis connection error"
- System works without Redis (optional for dev)
- For production: Use Upstash Redis (free tier)

### "Migration failed"
- Check DATABASE_URL in `.env`
- Verify Prisma schema: `npx prisma validate`
- Try: `npx prisma db push`

## 📚 Documentation

- **Full Guide:** `AUDIO_SYSTEM_PROFESSIONAL.md`
- **Implementation Summary:** `AUDIO_SYSTEM_IMPLEMENTATION.md`
- **Setup Script:** `setup-audio-system.mjs`
- **Migration:** `migrate-audio-assets.mjs`

## 🎯 Success Checklist

- [ ] Supabase `audio` bucket created
- [ ] Environment variables added to `.env.local`
- [ ] Migration executed successfully
- [ ] Prisma Client regenerated
- [ ] Dev server restarted
- [ ] Tested audio generation
- [ ] Verified cache hit on second generation
- [ ] Confirmed files in Supabase Storage

## 💡 Key Concepts

**Content Hash:** SHA-256 of (text + voiceId + model + rate + format)
- Same inputs → Same hash → Same audio file
- Different voice → Different hash → New generation

**Cost Optimization:**
- First user pays R15 (generation)
- All subsequent users: FREE (cache hit)
- Works across different books with same content

**Storage:**
- Audio files in Supabase Storage (CDN)
- NOT in database (no bloat)
- Path: `audio/{bookId}/{contentHash}.mp3`

## 🚀 Deploy to Production

1. Add environment variables to Vercel/hosting
2. Enable Redis (Upstash recommended)
3. Monitor cache hit rate
4. Pre-generate popular voices
5. Set up analytics dashboard

---

**Total Setup Time: ~15 minutes**

**Result: 99% cost reduction on duplicate audio generations**

🎉 **You're ready to scale!**
