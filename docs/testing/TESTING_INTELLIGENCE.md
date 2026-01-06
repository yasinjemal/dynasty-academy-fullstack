# 🧪 Intelligence Features Testing Guide

## ✅ Premium Status: CONFIRMED

All 8 users are premium until October 15, 2026!

---

## Test 1: Listen Mode Intelligence

### Steps:

1. Navigate to: `http://localhost:3000/books/[any-book-slug]/read`
2. Click the **"Listen Mode"** button
3. Select a voice and generate audio
4. Once audio starts playing:
   - ✅ Look for the **Intelligence Insights Panel** (purple/blue gradient box)
   - ✅ Should show: Engagement Level, Completion %, Recommended Speed, Break Interval
   - ✅ Play for 30 seconds to trigger speed suggestion toast

### What to Look For:

- 🧠 Intelligence panel appears below "Now Playing" info
- 📊 Shows "High/Medium/Low" engagement with color coding
- 🎯 Displays completion probability percentage
- 💡 Lists AI suggestions based on content

### Troubleshooting:

- If panel doesn't appear: Check you're logged in as premium user
- If predictions are empty: Wait 30 seconds for first analysis
- Refresh page to fetch latest predictions

---

## Test 2: Read Mode Intelligence

### Steps:

1. Navigate to any book in regular reading mode
2. Scroll up and down through the content
3. Stop scrolling for 3 seconds (triggers pause detection)
4. Look for the **Intelligence Insights Panel** at the bottom

### What to Look For:

- 🧠 Intelligence panel appears after content
- 📜 Scroll tracking active (console logs if DevTools open)
- ⏸️ Pause detection after 3s of no scrolling
- 📊 Same metrics as Listen Mode

### How It Tracks:

- **Scroll Speed** → Reading speed (WPM)
- **Pauses** → 3s no scroll = pause
- **Rereads** → Scrolling back up
- **Position** → Progress through chapter

---

## Test 3: AI Auto-Recommendations

### Steps:

1. In Listen Mode, play audio for 30+ seconds
2. Change playback speed manually
3. Wait for AI to analyze

### What to Look For:

- 🧠 Toast notification: "AI Reading Coach"
- 💬 Suggestion: "AI suggests speeding up/slowing down to Xx"
- ⏰ Break reminder after recommended interval
- 🎨 Beautiful purple toast with epic rarity style

### Trigger Conditions:

- Speed difference > 0.2x from AI recommendation
- After 30 seconds of tracking
- Only for premium users

---

## Test 4: Admin Analytics Dashboard

### Steps:

1. Make sure you're logged in as **ADMIN** role
2. Navigate to: `http://localhost:3000/admin/intelligence`
3. View real-time analytics

### What to Look For:

- 📊 Key Metrics: Sessions, Users, Completion Rate, Engagement
- 🎯 AI Prediction Accuracy percentages
- ⏰ Peak Reading Hours bar chart
- 📚 Most Analyzed Books leaderboard
- 👥 User Retention metrics

### Note:

- May show 0s if no intelligence data yet
- Generate data by using Listen/Read mode first
- Use time range filters: 24h, 7d, 30d, All Time

---

## Test 5: Data Collection Verification

### Steps:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Use Listen/Read mode
4. Watch for API calls:

### Expected API Calls:

```
POST /api/intelligence/track
→ Sends behavior data every 30 seconds
→ Response: { success: true }

GET /api/intelligence/predict?bookId=xxx&chapterId=1
→ Fetches AI predictions
→ Response: { success: true, predictions: {...} }
```

### Check Console Logs:

- `🧠 Intelligence tracking started`
- `📊 Behavior saved`
- `🎯 Predictions loaded`

---

## Test 6: Database Verification

### Quick Check:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.readingBehavior.findMany({ take: 5 })
  .then(data => {
    console.log('\\n📊 Recent Behavior Data:');
    console.log(data.length + ' sessions found');
    data.forEach((d, i) => {
      console.log(\`  \${i+1}. User: \${d.userId}, Book: \${d.bookId}, Chapter: \${d.chapterNumber}\`);
    });
    prisma.$disconnect();
  });
"
```

### Should Show:

- Reading behavior records
- User ID, Book ID, Chapter Number
- Metrics: pauseCount, speedChanges, etc.

---

## Debugging Tips

### Intelligence Panel Not Showing:

1. Check: Are you logged in?
2. Check: Is account premium? (run `node check-premium-users.mjs`)
3. Check Console: Any errors?
4. Check Network: Is `/api/intelligence/predict` being called?

### No AI Suggestions:

1. Wait 30 seconds after playback starts
2. Check speed difference > 0.2x from recommended
3. Check Console for prediction data
4. Verify `isPremiumUser === true`

### Admin Dashboard Empty:

1. First use Listen/Read mode to generate data
2. Check you're logged in as ADMIN role
3. Refresh page
4. Try different time ranges

### Tracking Not Working:

1. Check: `intelligence.startTracking()` called?
2. Check: Event handlers connected?
3. Check Console: Any TypeScript errors?
4. Verify Prisma client generated: `npx prisma generate`

---

## Success Criteria

### ✅ Intelligence System Working:

- [ ] Intelligence panel appears in Listen Mode
- [ ] Intelligence panel appears in Read Mode
- [ ] Scroll tracking active (Read Mode)
- [ ] Speed suggestions appear (Listen Mode)
- [ ] Break reminders appear
- [ ] Admin dashboard loads
- [ ] API calls successful
- [ ] Data saved to database

### ✅ Premium Features:

- [ ] Only premium users see intelligence
- [ ] Free users (if any) don't see panel
- [ ] Premium badge shows correctly

---

## Quick Test Command

Run this to verify everything:

```bash
# 1. Check premium status
node check-premium-users.mjs

# 2. Check TypeScript compilation
npm run build

# 3. Start dev server
npm run dev

# 4. Test in browser:
#    - http://localhost:3000/books/[book-slug]/read
#    - Click Listen Mode
#    - Watch for intelligence panel
```

---

## Expected Results

### After 1 Minute of Usage:

- ✅ Intelligence panel shows predictions
- ✅ At least 1 behavior record in database
- ✅ AI suggestions may appear
- ✅ Tracking data accumulating

### After 5 Minutes of Usage:

- ✅ Multiple behavior records
- ✅ Patterns starting to form
- ✅ More accurate predictions
- ✅ Break reminders triggered

### After First Session Complete:

- ✅ User behavior pattern created
- ✅ Content complexity analyzed
- ✅ Predictions highly personalized
- ✅ Admin dashboard shows data

---

## 🎉 You're All Set!

**All users are premium → Intelligence features fully unlocked!**

Just navigate to any book and start reading/listening to see the AI in action! 🚀
