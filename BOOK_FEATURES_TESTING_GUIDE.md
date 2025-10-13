# 📚 Dynasty Academy - Book Features Testing Guide

## 🎯 Features to Test

### 1. **Admin Book Upload** 📤
### 2. **Book Reading Mode** 📖
### 3. **Listen Mode (Text-to-Speech)** 🎧

---

## 🔧 TESTING INSTRUCTIONS

### **Prerequisites:**
- ✅ Dev server running: `npm run dev`
- ✅ Database connected (Supabase)
- ✅ Admin user created (use `make-admin.mjs` if needed)
- ✅ Signed in as admin user

---

## 1️⃣ ADMIN BOOK UPLOAD

### **Step 1: Navigate to Admin Panel**
```
URL: http://localhost:3000/admin/books
```

### **Step 2: Upload a Book**

Click **"Add New Book"** button

#### **Fill in Book Details:**

```yaml
Title: "The Power of Habit"
Description: "Why We Do What We Do in Life and Business"
Category: "Self-Help"
Price: 29.99
Sale Price: 19.99 (optional)
Content Type: PDF / DOCX / Markdown / Text
Tags: habit, productivity, psychology
Status: PUBLISHED
Featured: ✓ (optional)
```

#### **Upload Book Content File:**

**Supported Formats:**
- ✅ **PDF** (.pdf) - Auto-parses to pages
- ✅ **DOCX** (.docx) - Converts to HTML pages
- ✅ **Markdown** (.md) - Converts with formatting
- ✅ **Text** (.txt) - Plain text split into pages

**File Upload Process:**
1. Click "Choose File" button
2. Select your book file
3. System automatically:
   - Parses content
   - Splits into pages (300 words/page)
   - Saves to database
   - Creates JSON file in `data/book-content/{bookId}/content.json`

#### **Upload Cover Image:**
1. Click "Upload Image" 
2. Select cover image (JPG, PNG)
3. System saves to `public/uploads/books/`

### **Step 3: Verify Upload**

After clicking **"Create Book"**, verify:
- ✅ Book appears in admin books list
- ✅ Total pages count shown
- ✅ Preview pages set (default: 3 pages free)
- ✅ Cover image displayed
- ✅ Status shows as "PUBLISHED"

---

## 2️⃣ BOOK READING MODE

### **Step 1: Navigate to Book**
```
URL: http://localhost:3000/books/{book-slug}
```

### **Step 2: Click "Read Now"**
```
URL: http://localhost:3000/books/{book-slug}/read
```

### **Features to Test:**

#### **📄 Page Navigation:**
- ✅ Left/Right arrow keys to navigate
- ✅ Page number indicator (Page 1 of X)
- ✅ Next/Previous page buttons
- ✅ Page progress bar at top

#### **🎨 Reading Controls:**
- ✅ **Font Size:** Small / Medium / Large / XL
- ✅ **Theme:** Light / Sepia / Dark
- ✅ **Font Family:** Sans-serif / Serif / Mono
- ✅ **Line Height:** Compact / Normal / Relaxed

#### **🔒 Paywall (Free Preview):**
- **Free Users:**
  - Can read first 3 pages (or `previewPages` value)
  - See paywall overlay on page 4+
  - "Unlock Full Book" CTA shows price
  - Blurred text preview visible

- **Premium Users:**
  - Full access to all pages
  - No paywall restrictions
  - Can download book (optional)

#### **💾 Reading Progress:**
- ✅ Progress auto-saved every page change
- ✅ Resume from last page on revisit
- ✅ Progress bar shows completion percentage

#### **📱 Responsive Design:**
- ✅ Mobile-friendly layout
- ✅ Touch swipe to change pages
- ✅ Pinch to zoom (optional)

---

## 3️⃣ LISTEN MODE (TEXT-TO-SPEECH)

### **Step 1: Open Listen Mode**

From reading page, click **"Listen Mode"** button in top-right

### **Features to Test:**

#### **🎙️ Voice Selection:**

Available voices:
1. **Josh** (Deep, Natural) - Default
2. **Rachel** (Warm, Expressive)
3. **Antoni** (Authoritative)
4. **Aria** (Clear, Professional)
5. **Sam** (Dynamic, Energetic)

**Test:**
- ✅ Click each voice option
- ✅ Verify voice preview plays
- ✅ Select preferred voice
- ✅ Voice badge shows active selection

#### **▶️ Audio Playback:**

**Test Controls:**
- ✅ Play button starts audio
- ✅ Pause button stops audio
- ✅ Skip forward/backward buttons (10s)
- ✅ Progress bar shows current time
- ✅ Scrub through audio with progress bar
- ✅ Volume slider (0-100%)
- ✅ Mute/unmute button

#### **📝 Text Highlighting:**

**Real-time Features:**
- ✅ Current sentence highlights in purple
- ✅ Completed sentences show in gray
- ✅ Upcoming sentences in light gray
- ✅ Auto-scroll follows audio
- ✅ Click sentence to jump to that timestamp

#### **⚡ Speed Control:**

Test all speeds:
- ✅ 0.5x (Slow)
- ✅ 0.75x (Relaxed)
- ✅ 1.0x (Normal) - Default
- ✅ 1.25x (Quick)
- ✅ 1.5x (Fast)
- ✅ 2.0x (Very Fast)

Each speed has personality:
- Slow: 🐢 "Take your time"
- Relaxed: ☕ "Easy pace"
- Normal: ⚡ "Perfect flow"
- Quick: 🚀 "Speed up"
- Fast: 💨 "Zoom through"
- Very Fast: ⚡ "Lightning"

#### **🎨 Visual Effects:**

**Test Animations:**
- ✅ Floating particles in background
- ✅ Glow effects on active elements
- ✅ Smooth transitions between sentences
- ✅ Waveform visualizer (24 bars)
- ✅ Premium badges with sparkle effects

#### **🔒 Paywall (3-Minute Preview):**

**Free Users:**
- ✅ Can listen for 3 minutes
- ✅ Timer shows countdown
- ✅ Paywall modal appears after 3 minutes
- ✅ Audio pauses automatically
- ✅ Blur overlay on text
- ✅ "Unlock Premium" CTA visible

**Premium Users:**
- ✅ Unlimited listening time
- ✅ No timer restrictions
- ✅ Download audio option (optional)
- ✅ Premium badge visible

#### **📱 Mobile Experience:**

**Test on Mobile:**
- ✅ Touch-friendly controls (44px minimum)
- ✅ Responsive layout
- ✅ Works in portrait/landscape
- ✅ Background audio (when app minimized)
- ✅ Lock screen controls (iOS/Android)

---

## 🐛 KNOWN ISSUES & FIXES

### **Issue 1: Book Content Not Showing**

**Symptoms:**
- "Book Content Not Available" error
- `totalPages` is 0 or null

**Fix:**
```bash
# Re-upload book content file in admin panel
# Or manually create content.json:
```

**File Location:**
```
data/book-content/{bookId}/content.json
```

**Format:**
```json
{
  "pages": [
    {
      "number": 1,
      "content": "<p>Page 1 content here...</p>"
    },
    {
      "number": 2,
      "content": "<p>Page 2 content here...</p>"
    }
  ]
}
```

### **Issue 2: Listen Mode Audio Not Generating**

**Symptoms:**
- "Failed to generate audio" error
- Audio URL is null

**Fix:**
```bash
# Check .env file has ElevenLabs API key:
ELEVENLABS_API_KEY=your_api_key_here

# If missing, get from: https://elevenlabs.io/
```

**Test API Key:**
```bash
curl -X GET "https://api.elevenlabs.io/v1/voices" \
  -H "xi-api-key: YOUR_API_KEY"
```

### **Issue 3: Images Not Loading**

**Symptoms:**
- Cover images show broken
- Book content images missing

**Fix:**
```bash
# Ensure uploads directory exists:
mkdir -p public/uploads/books

# Check file permissions (Windows):
# Right-click folder → Properties → Security → Edit
# Give "Users" group Read & Write permissions
```

### **Issue 4: Admin Access Denied**

**Symptoms:**
- Can't access /admin/books
- "Unauthorized" error

**Fix:**
```bash
# Run make-admin script:
node make-admin.mjs

# Enter your email when prompted
# This sets isAdmin=true in database
```

---

## ✅ TESTING CHECKLIST

### **Admin Panel:**
- [ ] Can access /admin/books
- [ ] Can create new book
- [ ] Can upload PDF file
- [ ] Can upload DOCX file
- [ ] Can upload Markdown file
- [ ] Can upload cover image
- [ ] Book appears in list
- [ ] Can edit book details
- [ ] Can delete book
- [ ] Search works
- [ ] Filter by category works

### **Reading Mode:**
- [ ] Can open book reader
- [ ] Pages load correctly
- [ ] Navigation arrows work
- [ ] Keyboard shortcuts work (←/→)
- [ ] Font size changes work
- [ ] Theme changes work (Light/Sepia/Dark)
- [ ] Reading progress saves
- [ ] Paywall shows at preview limit
- [ ] Premium users see all pages
- [ ] Mobile responsive

### **Listen Mode:**
- [ ] Can open listen mode
- [ ] Voice selection works
- [ ] Audio generates successfully
- [ ] Play/pause works
- [ ] Skip forward/backward works
- [ ] Volume control works
- [ ] Speed control works
- [ ] Text highlights with audio
- [ ] Auto-scroll follows audio
- [ ] Waveform animates
- [ ] 3-minute timer works (free users)
- [ ] Paywall shows after 3 min
- [ ] Premium users unlimited
- [ ] Mobile controls work

---

## 🚀 TESTING WORKFLOW

### **Quick Test (5 minutes):**
1. Login as admin
2. Upload a small text file (< 1000 words)
3. Navigate to book page
4. Test reading mode (2-3 pages)
5. Test listen mode (30 seconds)

### **Full Test (20 minutes):**
1. Upload book with each file type (PDF, DOCX, MD, TXT)
2. Test all reading mode features
3. Test all 5 voices in listen mode
4. Test paywall as free user
5. Test full access as premium user
6. Test on mobile device
7. Test reading progress persistence

### **Stress Test (1 hour):**
1. Upload large book (100+ pages)
2. Test performance with long audio
3. Test multiple books simultaneously
4. Test rapid page navigation
5. Test audio with all speed settings
6. Test on slow network
7. Test with poor API connectivity

---

## 📊 SUCCESS CRITERIA

### **Admin Upload:**
✅ Upload completes in < 10 seconds (small files)
✅ Content properly parsed into pages
✅ Images display correctly
✅ Book searchable immediately

### **Reading Mode:**
✅ Page loads in < 1 second
✅ Smooth navigation (< 300ms)
✅ No content flash/reflow
✅ Reading progress saves automatically

### **Listen Mode:**
✅ Audio generates in < 5 seconds
✅ Playback starts immediately
✅ Text highlights sync perfectly
✅ Controls responsive (< 100ms)
✅ No audio stuttering/gaps

---

## 🎯 NEXT STEPS

After testing, if everything works:

1. ✅ Mark todo items complete
2. ✅ Create test book library (5-10 books)
3. ✅ Test with real users
4. ✅ Gather feedback
5. ✅ Optimize based on usage

If issues found:
1. 🐛 Document bugs in GitHub Issues
2. 🔧 Fix critical issues first
3. 📝 Update this guide with solutions

---

## 📞 SUPPORT

**Common Questions:**

**Q: Why is audio generation slow?**
A: ElevenLabs API can take 3-5 seconds for first generation. Subsequent plays use cached audio.

**Q: Can I use different TTS providers?**
A: Yes! Code supports multiple providers. Check `AUDIO_SYSTEM_IMPLEMENTATION.md` for details.

**Q: How do I add more voices?**
A: Update `voices` array in `ListenMode.tsx` with new ElevenLabs voice IDs.

**Q: Why does paywall blur show?**
A: This is intentional UX to encourage upgrades. Adjust `blurStrength` in code if needed.

**Q: Can I customize page size?**
A: Yes! Change `wordsPerPage` in `upload-file/route.ts` (default: 300 words).

---

**Version:** 1.0  
**Last Updated:** October 13, 2025  
**Author:** Dynasty Built Academy Team

*Now go test those features!* 🚀📚🎧
