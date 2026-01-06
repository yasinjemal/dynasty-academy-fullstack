# 🎙️ Community Narrator System - Database Setup

## Quick Start

### Step 1: Run the SQL Migration

1. Open your **Supabase Dashboard**
2. Go to the **SQL Editor**
3. Copy the contents of `add-community-narrator-system.sql`
4. Paste and **Run** the SQL script

This will create all the necessary tables:

- ✅ `community_narrations` (upgraded with production fields)
- ✅ `narration_likes` (one per user per narration)
- ✅ `narration_plays` (anti-fraud with IP hashing)
- ✅ `narration_flags` (user reporting system)
- ✅ `book_permissions` (per-book narrator permissions)

### Step 2: Verify the Setup

Check that the tables exist:

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%narration%'
ORDER BY tablename;
```

You should see:

- community_narrations
- narration_flags
- narration_likes
- narration_plays

### Step 3: Test the API

The route conflict has been fixed! New API structure:

#### Upload a Narration

```
POST /api/narrations
```

Body (FormData):

- `audio`: Audio file (≤ 8MB)
- `bookId`: Book ID
- `pageNumber`: Page number (integer)
- `paragraphText`: The text being narrated
- `language`: Language code (e.g., 'en', 'es')
- `readingStyle`: Style (e.g., 'narrative', 'dramatic', 'educational')

#### Get Narrations for a Page

```
GET /api/narrations/book/{bookId}/{page}
```

Returns approved narrations sorted by likes, plays, quality.

#### Like/Unlike a Narration

```
POST /api/narrations/{id}/like
GET /api/narrations/{id}/like
```

#### Count a Play

```
POST /api/narrations/{id}/play
GET /api/narrations/{id}/play
```

#### Smart Playback Resolution

```
POST /api/narrations/resolve
GET /api/narrations/resolve?bookId=X&pageNumber=Y&language=en
```

## Production Checklist

### ✅ Backend (Complete)

- [x] Production database schema
- [x] Text normalization & hashing
- [x] ASR & quality scoring service (placeholder-ready)
- [x] Rate limiting (5 uploads/10min, 30 likes/10min)
- [x] 15-step moderation pipeline
- [x] Anti-fraud play counting
- [x] Like/unlike with toggle behavior
- [x] Smart playback resolution
- [x] Route conflict fixed

### ⏳ Integration Needed

- [ ] Storage service (Vercel Blob / Cloudinary / S3)
- [ ] ASR service (OpenAI Whisper / Google STT)
- [ ] Audio quality analysis (ffmpeg / web-audio)
- [ ] Content moderation (OpenAI Moderation API)
- [ ] Redis for rate limiting (currently in-memory)

### 🎨 Frontend Updates

- [ ] Update recording component to use production API
- [ ] Add paragraphText extraction
- [ ] Show moderation status to user
- [ ] Display community narrations with player
- [ ] Like/unlike buttons
- [ ] Play count display
- [ ] Narrator profiles

### 🔐 Environment Variables Needed

```env
# Storage (choose one)
BLOB_READ_WRITE_TOKEN=xxx           # Vercel Blob
CLOUDINARY_URL=xxx                  # Cloudinary
AWS_ACCESS_KEY_ID=xxx               # S3
AWS_SECRET_ACCESS_KEY=xxx           # S3
AWS_S3_BUCKET_NAME=xxx              # S3

# ASR (choose one)
OPENAI_API_KEY=xxx                  # OpenAI Whisper
GOOGLE_CLOUD_KEY_FILE=xxx           # Google Speech-to-Text

# Moderation
OPENAI_API_KEY=xxx                  # For content moderation

# Rate Limiting (optional, for production scale)
REDIS_URL=xxx                       # Redis for distributed rate limiting

# Analytics (optional)
ANALYTICS_WRITE_KEY=xxx             # Segment or similar
```

## Auto-Approve Thresholds

Current settings (configurable in `src/lib/narration/audioQuality.ts`):

```typescript
{
  minConfidence: 0.92,      // ASR confidence ≥ 92%
  maxWordErrorRate: 0.18,   // WER ≤ 18%
  minQualityScore: 0.7,     // Quality score ≥ 70%
  requiresPolicyClean: true // No policy violations
}
```

## Testing the System

### 1. Test Upload (with browser)

```javascript
const formData = new FormData();
formData.append("audio", audioBlob, "narration.webm");
formData.append("bookId", "YOUR_BOOK_ID");
formData.append("pageNumber", "1");
formData.append("paragraphText", "Once upon a time...");
formData.append("language", "en");
formData.append("readingStyle", "narrative");

const response = await fetch("/api/narrations", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result);
```

### 2. Test Playback Resolution

```javascript
const response = await fetch("/api/narrations/resolve", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    bookId: "YOUR_BOOK_ID",
    pageNumber: 1,
    paragraphText: "Once upon a time...",
    language: "en",
  }),
});

const audio = await response.json();
console.log(audio);
// { type: "human", audioUrl: "...", narrator: {...} }
// or { type: "tts-cached", audioUrl: "..." }
// or { type: "tts-generate", shouldGenerate: true }
```

## What's Next?

1. **Run the SQL migration** (Step 1 above)
2. **Test the APIs** with curl/Postman
3. **Connect storage** (Vercel Blob recommended for quick start)
4. **Update frontend** to use new API structure
5. **Deploy and test** with real audio recordings

## Need Help?

- Route conflict fixed: `/api/narrations/book/{bookId}/{page}` instead of `/api/narrations/{bookId}/{page}`
- All placeholder functions ready for real service integration
- Auto-approve thresholds configurable
- Rate limits prevent abuse
- Play counting is fraud-resistant

**We're changing book reading history! 🚀🎙️📖**
