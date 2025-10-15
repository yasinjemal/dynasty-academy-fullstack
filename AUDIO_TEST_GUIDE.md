# 🧪 AUDIO GENERATION - QUICK TEST GUIDE

**Ready to test?** The server is running and the audio system is fixed!

---

## ✅ PRE-TEST CHECKLIST

- ✅ Server running at http://localhost:3000
- ✅ No compilation errors
- ✅ Database connected (Supabase PostgreSQL)
- ✅ ElevenLabs API key configured
- ✅ Audio route file fixed (192 lines, working)

---

## 🎯 TEST STEPS

### **Step 1: Open a Book**
1. Go to http://localhost:3000
2. Click on any book (e.g., "The Puppet Master's Handbook")
3. Click "Read" to open the book

### **Step 2: Enable Listen Mode**
1. Look for the 🎧 **"Listen Mode"** button or toggle
2. Click to activate Listen Mode
3. You should see the audio player interface

### **Step 3: Generate Audio (First Time)**
1. Click **"Generate Audio"** button for Chapter 1
2. **Watch the browser console** (F12) for:
   ```
   🎙️ Generating audio...
   ```
3. **Watch the server terminal** for:
   ```
   🎙️ Generating new audio with ElevenLabs...
   ✅ Audio generated! 1234 words, ~$0.22
   ```
4. Wait for generation (5-30 seconds depending on chapter length)
5. Audio player should appear with the generated audio

### **Step 4: Test Caching (Second Time)**
1. Click **"Generate Audio"** again for the **same chapter**
2. **Watch the server terminal** for:
   ```
   ✅ Cache hit! Saved $0.22
   ```
3. Audio should return **instantly** (no ElevenLabs call)

---

## 🔍 WHAT TO LOOK FOR

### **✅ SUCCESS INDICATORS**

**Browser Console (F12):**
```javascript
// First generation
POST /api/books/the-puppet-master-s-handbook/audio 200

// Response
{
  success: true,
  audioUrl: "data:audio/mpeg;base64,//uQx...",
  duration: "3:45",
  cached: false
}
```

**Server Terminal:**
```
🎙️ Generating new audio with ElevenLabs...
✅ Audio generated! 1234 words, ~$0.22
POST /api/books/the-puppet-master-s-handbook/audio 200 in 15234ms
```

**Second Request (Cached):**
```
✅ Cache hit! Saved $0.22
POST /api/books/the-puppet-master-s-handbook/audio 200 in 234ms
```

### **❌ ERROR INDICATORS**

**401 Unauthorized:**
```
Error: Unauthorized
```
**Fix:** Make sure you're logged in

**404 Book Not Found:**
```
Error: Book not found
```
**Fix:** Check the book slug in the URL

**500 ElevenLabs Error:**
```
ElevenLabs API error: 401
```
**Fix:** Check ELEVENLABS_API_KEY in .env

**Database Error:**
```
Prisma error: P2002
```
**Fix:** Check DATABASE_URL connection

---

## 📊 MONITORING

### **Check Database After Test**
```sql
-- See all generated audio
SELECT 
  id,
  "bookId",
  "chapterNumber",
  duration,
  metadata->>'wordCount' as word_count,
  metadata->>'contentHash' as content_hash,
  "createdAt"
FROM book_audio
ORDER BY "createdAt" DESC
LIMIT 10;
```

### **Calculate Total Cost**
```sql
-- Total words generated
SELECT SUM((metadata->>'wordCount')::int) as total_words
FROM book_audio;

-- Estimated total cost (@ $0.18 per 1,000 words)
SELECT 
  SUM((metadata->>'wordCount')::int) as total_words,
  SUM((metadata->>'wordCount')::int) / 1000.0 * 0.18 as total_cost
FROM book_audio;
```

### **Cache Hit Rate**
```sql
-- Count unique chapters vs total requests
-- (You'd need to add usage logging for this)
SELECT 
  COUNT(*) as unique_chapters,
  (SELECT COUNT(*) FROM audio_usage_log) as total_requests,
  ((SELECT COUNT(*) FROM audio_usage_log WHERE type = 'cache_hit')::float / 
   (SELECT COUNT(*) FROM audio_usage_log)) * 100 as cache_hit_rate
FROM book_audio;
```

---

## 🐛 TROUBLESHOOTING

### **Problem: Audio doesn't generate**

**Check:**
1. Server terminal for errors
2. Browser console (F12) for API errors
3. Network tab (F12) → Filter "audio" → Check status code

**Common Fixes:**
```bash
# Restart server
npm run dev

# Regenerate Prisma client
npx prisma generate

# Check environment variables
cat .env | grep ELEVENLABS_API_KEY
```

### **Problem: Caching doesn't work**

**Symptoms:**
- Same chapter generates new audio every time
- No "Cache hit!" message

**Check:**
```sql
-- Verify audio was saved
SELECT * FROM book_audio 
WHERE "bookId" = 'your-book-id' 
  AND "chapterNumber" = 1;
```

**Fix:**
- Make sure database saves completed
- Check for duplicate contentHash values
- Verify bookId and chapterNumber match

### **Problem: Audio plays but sounds wrong**

**Check:**
1. Voice ID is correct (should be valid ElevenLabs voice)
2. Audio format is mp3
3. Browser supports audio/mpeg

**Test Different Voice:**
```typescript
// In the request, try different voiceId
{
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel (default)
  voiceId: "AZnzlk1XvdvUeBnXmlld", // Domi
  voiceId: "EXAVITQu4vr4xnSDxMaL"  // Sarah
}
```

---

## 📈 EXPECTED PERFORMANCE

### **First Generation (CACHE MISS)**
- **Time**: 5-30 seconds (depends on chapter length)
- **Cost**: ~$0.18 per 1,000 words
- **Database**: New row created in book_audio table

### **Subsequent Plays (CACHE HIT)**
- **Time**: <1 second (instant database lookup)
- **Cost**: $0.00 (free!)
- **Database**: Same row returned

### **Example Metrics**
```
Chapter 1 (1,234 words):
- First generation: 12.5s, $0.22
- Cache hit: 0.3s, $0.00
- Savings: 97.6% faster, 100% cheaper
```

---

## ✅ TEST CHECKLIST

- [ ] Audio generates successfully for Chapter 1
- [ ] Server logs show "Generating new audio..."
- [ ] Audio plays in browser
- [ ] Cache hit works (same chapter returns instantly)
- [ ] Server logs show "Cache hit! Saved $X.XX"
- [ ] Database has new row in book_audio table
- [ ] No compilation errors
- [ ] No runtime errors

---

## 🎉 SUCCESS CRITERIA

**You know it's working when:**
1. ✅ Click "Generate Audio" → Audio plays
2. ✅ Console shows success response
3. ✅ Server terminal shows generation logs
4. ✅ Second request is instant (cached)
5. ✅ Database has audio record

**Then you can celebrate!** 🎊 The intelligent audio system is operational!

---

## 🚀 NEXT ACTIONS AFTER SUCCESSFUL TEST

1. **Document the test results**
2. **Test multiple chapters** (verify caching across different chapters)
3. **Test different books** (verify caching per book)
4. **Monitor ElevenLabs usage** (check API dashboard)
5. **Consider applying migration** (unlock advanced ML features)

---

**Built with:** ElevenLabs API, Next.js 15, Prisma, PostgreSQL  
**Status:** 🟢 Ready for testing at http://localhost:3000
