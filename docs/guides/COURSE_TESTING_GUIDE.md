# 🧪 COURSE SYSTEM TESTING GUIDE

## 🎯 Test Course Ready!

**Status:** ✅ Test course created successfully

### 📚 Course Details

- **Title:** Complete React & Next.js Masterclass
- **Level:** Intermediate
- **Price:** $199
- **Sections:** 3
- **Total Lessons:** 8

### 🔗 Test URL

```
http://localhost:3000/courses/4a244b5f-e694-413b-b6f3-1921ece7cb77
```

---

## 📖 Lesson Breakdown

### Section 1: Getting Started with React

- ✅ **Lesson 1.1:** Welcome to the Course (YouTube Video) - FREE
- ✅ **Lesson 1.2:** Course Roadmap & Setup Guide (PDF) - FREE
- ✅ **Lesson 1.3:** React Fundamentals Explained (Vimeo Video)

### Section 2: Advanced React Patterns

- ✅ **Lesson 2.1:** React Hooks Masterclass (YouTube Video)
- ✅ **Lesson 2.2:** Design Patterns Cheat Sheet (PDF)

### Section 3: Next.js App Router

- ✅ **Lesson 3.1:** Introduction to Next.js 15 (YouTube Video)
- ✅ **Lesson 3.2:** Server Components Deep Dive (Article/HTML)

---

## 🧪 Testing Checklist

### 🎬 Video Player Testing

#### YouTube Player

- [ ] Video loads correctly
- [ ] Play/pause button works
- [ ] Volume controls work
- [ ] Seek bar works (click to jump)
- [ ] Fullscreen mode works
- [ ] Keyboard shortcuts:
  - [ ] `Space` or `K` - Play/pause
  - [ ] `M` - Mute/unmute
  - [ ] `F` - Fullscreen
  - [ ] `←/→` - Seek backward/forward
- [ ] Progress tracking (saves every 10 seconds)
- [ ] Auto-resume from last position
- [ ] Completion detection (marks complete at end)

#### Vimeo Player

- [ ] Video loads correctly
- [ ] All playback controls work
- [ ] Fullscreen mode works
- [ ] Progress tracking works

### 📄 PDF Viewer Testing

- [ ] PDF loads and renders correctly
- [ ] Page navigation works (prev/next buttons)
- [ ] Direct page number input works
- [ ] Zoom controls work:
  - [ ] Zoom in (+)
  - [ ] Zoom out (-)
  - [ ] Range: 50% - 200%
- [ ] Download button works
- [ ] Keyboard shortcuts:
  - [ ] `←/→` - Previous/next page
  - [ ] `+/-` - Zoom in/out
- [ ] Progress tracking (page number saved)
- [ ] Auto-complete at 80% read
- [ ] Sticky controls bar visible
- [ ] Responsive on different screen sizes

### 📝 Article View Testing

- [ ] HTML content renders correctly
- [ ] Headings styled properly
- [ ] Lists display correctly
- [ ] Content is readable
- [ ] Mark complete button works

### 🎯 Course Features

#### Navigation

- [ ] Sidebar shows all sections
- [ ] Sections are collapsible
- [ ] Lessons are clickable
- [ ] Active lesson is highlighted
- [ ] Section order is correct (0, 1, 2)
- [ ] Lesson order is correct within sections

#### Progress Tracking

- [ ] Progress percentage updates
- [ ] Completed lessons show checkmark
- [ ] Progress persists after page reload
- [ ] "Mark Complete" button works
- [ ] Course completion percentage accurate

#### Intelligence Panel

- [ ] Panel loads without errors
- [ ] Shows 6 intelligence cards:
  - [ ] 🌅 Circadian Rhythm
  - [ ] 🧠 Cognitive Load
  - [ ] 📈 Momentum
  - [ ] 🌬️ Atmosphere
  - [ ] 🎯 Next Lesson
  - [ ] 💡 Suggestions
- [ ] Predictions update based on context
- [ ] Recommendations are relevant
- [ ] No API errors in console

#### UI/UX

- [ ] Layout is responsive
- [ ] Sidebar can collapse/expand
- [ ] Content area adjusts properly
- [ ] No layout shifts
- [ ] Loading states work
- [ ] Error messages display properly
- [ ] Tooltips work (if any)

---

## 🐛 Known Issues to Watch For

### Potential Problems

1. **PDF Viewer:**

   - PDF.js worker not loading → Check console for errors
   - Large PDFs may take time to load
   - Some PDFs may not be compatible

2. **Video Player:**

   - YouTube/Vimeo iframes may block in some browsers
   - CORS issues with custom video URLs
   - Autoplay may be blocked by browser

3. **Progress Tracking:**

   - API calls may fail if not authenticated
   - Database updates may be slow
   - Race conditions with rapid lesson switching

4. **Intelligence Panel:**
   - Predictions may return null on first visit
   - API rate limits may apply
   - Requires activity data to be meaningful

---

## 🔍 Testing Steps

### 1. Initial Load

```bash
# Open browser
http://localhost:3000/courses/4a244b5f-e694-413b-b6f3-1921ece7cb77

# Check:
- Page loads without errors
- Course title displays
- Sidebar shows all sections
- First lesson is selected by default
```

### 2. Test Video Player (YouTube)

```bash
# Navigate to: Lesson 1.1 - Welcome to the Course
# Test:
- Click play
- Adjust volume
- Seek to different timestamps
- Try fullscreen
- Use keyboard shortcuts
- Check console for errors
```

### 3. Test PDF Viewer

```bash
# Navigate to: Lesson 1.2 - Course Roadmap & Setup Guide
# Test:
- PDF renders correctly
- Navigate through pages
- Zoom in and out
- Download the PDF
- Use keyboard navigation
```

### 4. Test Vimeo Player

```bash
# Navigate to: Lesson 1.3 - React Fundamentals Explained
# Test:
- Video loads and plays
- Controls work
- Fullscreen works
```

### 5. Test Article View

```bash
# Navigate to: Lesson 3.2 - Server Components Deep Dive
# Test:
- HTML content renders
- Styling looks good
- Mark complete works
```

### 6. Test Progress Tracking

```bash
# Test:
1. Watch video for 10+ seconds → Check if progress saved
2. Navigate away and back → Should resume where you left off
3. Mark lesson complete → Check if completion persisted
4. Check overall course progress updates
```

### 7. Test Intelligence Panel

```bash
# Test:
1. Wait for panel to load
2. Check all 6 cards display
3. Verify predictions make sense
4. Complete a lesson → Check if predictions update
```

---

## 📊 Expected Results

### Video Player

- **YouTube:** Should show embedded player with controls
- **Vimeo:** Should show Vimeo player with controls
- **Progress:** Should track watch time every 10 seconds
- **Completion:** Should auto-complete at 90% watched

### PDF Viewer

- **Rendering:** PDF pages should be crisp and readable
- **Navigation:** Page changes should be smooth
- **Zoom:** Should scale from 50% to 200%
- **Progress:** Should track current page
- **Completion:** Should auto-complete at 80% read

### Course Features

- **Sidebar:** Should show all 3 sections with 8 total lessons
- **Progress:** Should show 0% initially, increase as lessons complete
- **Intelligence:** Should show personalized recommendations
- **Navigation:** Should smoothly switch between lessons

---

## 🚨 Errors to Report

### Console Errors

```javascript
// Watch for:
- 404 errors (missing files)
- CORS errors (blocked resources)
- API errors (failed requests)
- React errors (component issues)
- PDF.js errors (rendering issues)
```

### Visual Bugs

- Layout breaks
- Overlapping elements
- Missing content
- Incorrect styling
- Responsive issues

### Functional Bugs

- Buttons don't work
- Progress doesn't save
- Videos don't play
- PDFs don't render
- Intelligence panel errors

---

## 💡 Test URLs

### Sample Videos (if you want to test more)

```
YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Vimeo: https://vimeo.com/76979871
```

### Sample PDFs

```
W3C Dummy PDF: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
Sample PDF: https://pdfobject.com/pdf/sample.pdf
```

---

## 🎉 Success Criteria

### ✅ Pass = All of these work:

1. ✅ Videos play in both YouTube and Vimeo players
2. ✅ PDFs render and are navigable
3. ✅ Progress tracking saves and persists
4. ✅ Mark complete button works
5. ✅ Intelligence panel loads without errors
6. ✅ Sidebar navigation works
7. ✅ No critical console errors
8. ✅ Responsive on desktop

### 🚀 Bonus = These also work:

- ⭐ Keyboard shortcuts (Space, F, +/-, arrows)
- ⭐ Fullscreen mode (video and PDF)
- ⭐ Auto-resume functionality
- ⭐ Intelligence predictions are meaningful
- ⭐ Mobile responsive

---

## 📝 Test Report Template

```markdown
## Course System Test Report

**Date:** October 16, 2025
**Tester:** [Your Name]
**Browser:** [Chrome/Firefox/Safari] [Version]
**Course ID:** 4a244b5f-e694-413b-b6f3-1921ece7cb77

### ✅ Working Features

- [ ] YouTube video player
- [ ] Vimeo video player
- [ ] PDF viewer
- [ ] Article view
- [ ] Progress tracking
- [ ] Mark complete
- [ ] Intelligence panel
- [ ] Sidebar navigation

### ❌ Issues Found

1. [Description of issue]
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Console errors (if any)

### 💡 Suggestions

- [Any improvements or suggestions]

### 🎯 Overall Rating

- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes
```

---

## 🚀 Next Steps After Testing

1. **If all tests pass:**

   - ✅ Document any bugs found
   - ✅ Create more test courses
   - ✅ Test with real course content
   - ✅ Deploy to staging

2. **If issues found:**

   - 🐛 Create GitHub issues
   - 🔧 Fix critical bugs first
   - 🧪 Retest after fixes
   - 📝 Update documentation

3. **Enhancement ideas:**
   - 📹 Add video playback speed controls
   - 📄 Add PDF search functionality
   - 🎤 Add audio narration for articles
   - 💬 Add lesson comments/questions
   - 📱 Improve mobile experience

---

## 📞 Support

**Issues?** Check the console for errors and report them with:

- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console error messages

---

_Happy Testing! 🧪_

**Status:** Ready for comprehensive testing
**Last Updated:** October 16, 2025
**Dynasty Academy:** Owning the field, not playing the game 🏆
