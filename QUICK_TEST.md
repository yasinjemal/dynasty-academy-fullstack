# 🎯 Quick Testing Checklist

## ✅ **Server Status**
- ✅ Dev server running at: http://localhost:3000
- ✅ Database connected: Supabase
- ✅ All APIs ready

---

## 🔥 **QUICK TEST SEQUENCE (10 minutes)**

### **Step 1: Admin Book Upload** (3 min)
```bash
URL: http://localhost:3000/admin/books
```

**Actions:**
1. [ ] Click "Add New Book" button
2. [ ] Fill in:
   - Title: "Test Book"
   - Description: "Testing book upload"
   - Category: "Test"
   - Price: 19.99
   - Content Type: "Text" (easiest to test)
3. [ ] Upload a .txt file with some content
4. [ ] Upload a cover image (optional)
5. [ ] Click "Create Book"

**Expected Result:**
✅ Book appears in list  
✅ Shows page count  
✅ Status: PUBLISHED  
✅ Cover image displays  

---

### **Step 2: Reading Mode** (3 min)
```bash
URL: http://localhost:3000/books/test-book
```

**Actions:**
1. [ ] Click "Read Now" button
2. [ ] Use arrow keys to navigate pages (← →)
3. [ ] Test font size buttons (A- A A+)
4. [ ] Toggle theme (Light/Sepia/Dark)
5. [ ] Navigate to page 4 (should see paywall if not premium)

**Expected Result:**
✅ Pages load smoothly  
✅ Font changes work  
✅ Theme switches correctly  
✅ Navigation responsive  
✅ Paywall shows on page 4 (free users)  

---

### **Step 3: Listen Mode** (4 min)
```bash
From reading page, click "Listen Mode" button
```

**Actions:**
1. [ ] Select a voice (Josh, Rachel, etc.)
2. [ ] Click Play button
3. [ ] Watch text highlight as audio plays
4. [ ] Test speed control (1x, 1.5x, 2x)
5. [ ] Test pause/skip buttons
6. [ ] Test volume slider

**Expected Result:**
✅ Audio generates successfully  
✅ Text highlights sync with audio  
✅ Speed changes work  
✅ Controls responsive  
✅ Waveform animates  
✅ Premium badge shows  

---

## 🐛 **If Something Breaks:**

### **"Book Content Not Available"**
→ Book upload didn't create pages properly  
→ Re-upload the book file  

### **"Failed to generate audio"**
→ Check `.env` has `ELEVENLABS_API_KEY`  
→ Verify API key is valid  

### **"Unauthorized" on admin page**
→ Run: `node make-admin.mjs`  
→ Enter your email  

### **Images not loading**
→ Check `public/uploads/books/` folder exists  
→ Clear Next.js cache: `npm run build`  

---

## 📸 **What to Look For:**

### **Good Signs:**
✅ Smooth animations  
✅ No console errors  
✅ Fast page loads (< 1s)  
✅ Text readable on all themes  
✅ Audio plays immediately  
✅ Text highlighting smooth  

### **Bad Signs:**
❌ Console errors (red text)  
❌ Slow loading (> 3s)  
❌ Broken images  
❌ Audio stuttering  
❌ Text not highlighting  
❌ Buttons not responding  

---

## 🚀 **Next Actions:**

**If everything works:**
1. ✅ Upload 2-3 real books
2. ✅ Test with different file formats (PDF, DOCX, Markdown)
3. ✅ Test on mobile device
4. ✅ Share with beta testers

**If issues found:**
1. 🐛 Note the specific error message
2. 📸 Take screenshot
3. 💬 Share in chat for debugging
4. 🔧 Check BOOK_FEATURES_TESTING_GUIDE.md for solutions

---

## 📊 **Current URLs:**

- **Home:** http://localhost:3000
- **Admin Books:** http://localhost:3000/admin/books
- **Community:** http://localhost:3000/community
- **Books List:** http://localhost:3000/books

---

**Ready to test?** Open http://localhost:3000/admin/books and let's go! 🚀

