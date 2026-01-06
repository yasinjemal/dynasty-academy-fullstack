# 🎙️ Community Narrator - Setup Instructions

## ✅ COMPLETED

All code has been implemented:

- ✅ Recording functionality (MediaRecorder API)
- ✅ Upload API endpoint (`/api/narrations`)
- ✅ Fetch API endpoint (`/api/narrations/[bookId]/[page]`)
- ✅ Community narrations panel UI
- ✅ Recording preview modal
- ✅ Toolbar buttons with animations
- ✅ Database schema (CommunityNarration model)
- ✅ Prisma relations (User, Book)

## 🔧 SETUP REQUIRED

### 1. Database Migration

Run this when database is available:

```bash
npx prisma migrate dev --name add_community_narrations
```

Or manually run this SQL:

```sql
-- See: prisma/migrations/add_community_narrations.sql
CREATE TABLE "community_narrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "community_narrations_pkey" PRIMARY KEY ("id")
);

-- Indexes and foreign keys (see migration file)
```

### 2. Regenerate Prisma Client

After database migration:

```bash
npx prisma generate
```

This will make `prisma.communityNarration` available in TypeScript.

### 3. Audio Storage Setup (IMPORTANT!)

Currently using placeholder URLs. Choose one:

#### Option A: Vercel Blob (Recommended)

1. Install package:

```bash
npm install @vercel/blob
```

2. Add to .env:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

3. Update `/src/app/api/narrations/route.ts`:

```typescript
import { put } from "@vercel/blob";

// Replace placeholder upload with:
const blob = await put(
  `narrations/${bookId}/${pageNumber}/${session.user.id}-${Date.now()}.webm`,
  audioFile,
  { access: "public" }
);
const audioUrl = blob.url;
```

#### Option B: Cloudinary

1. Use existing Cloudinary setup

2. Update upload code:

```typescript
import { v2 as cloudinary } from "cloudinary";

const result = await cloudinary.uploader.upload(audioFile, {
  resource_type: "video",
  folder: `narrations/${bookId}/${pageNumber}`,
  format: "webm",
});
const audioUrl = result.secure_url;
```

#### Option C: AWS S3

1. Install AWS SDK
2. Configure S3 bucket
3. Upload audio files
4. Return public URL

## 🧪 TESTING

Once setup is complete:

1. Navigate to any book reader page
2. Click the 🎙️ Record button (red when recording)
3. Read the page aloud
4. Click Stop
5. Click "Share with Community"
6. Check database for new record
7. Click 👥 Community button to see your narration
8. Play it back!

## 📁 FILE LOCATIONS

- Component: `/src/components/books/BookReaderLuxury.tsx`
- Upload API: `/src/app/api/narrations/route.ts`
- Fetch API: `/src/app/api/narrations/[bookId]/[page]/route.ts`
- Schema: `/prisma/schema.prisma`
- Migration: `/prisma/migrations/add_community_narrations.sql`
- Docs: `/COMMUNITY_NARRATOR_COMPLETE.md`

## 🚀 NEXT STEPS

1. Setup audio storage (Vercel Blob/Cloudinary/S3)
2. Run database migration
3. Regenerate Prisma client
4. Test recording + playback
5. Deploy to production
6. Announce feature to users! 🎉

## 💡 FUTURE ENHANCEMENTS

See `COMMUNITY_NARRATOR_COMPLETE.md` for Phase 2 features:

- Narrator profiles
- Rating system
- Leaderboards
- Gamification
- Moderation
- Analytics
- And much more!

---

**Status**: ✅ Code complete, database setup pending
