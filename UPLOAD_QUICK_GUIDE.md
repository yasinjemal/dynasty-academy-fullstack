# 🎬 QUICK GUIDE: Upload Course Media

## ✅ IT'S WORKING NOW!

The image and video upload functionality is **fully operational**! Here's how to use it:

---

## 📸 HOW TO UPLOAD THUMBNAIL

### **Step 1: Go to Media Section**

```
Navigate to: /instructor/create-course
Complete Step 1 & 2
Click "Next" to reach Step 3: Media
```

### **Step 2: Upload Your Thumbnail**

**Option A: Click to Browse**

1. Click the "Choose File" button
2. Select your image (JPG, PNG, WebP)
3. Image must be less than 2MB
4. Preview appears instantly!

**Option B: Drag & Drop** _(coming soon)_

1. Drag image file from your computer
2. Drop it in the upload area
3. Preview appears instantly!

### **Step 3: Manage Your Upload**

**Change Image:**

- Hover over the preview
- Click "Change Image"
- Select new image

**Remove Image:**

- Hover over the preview
- Click "Remove" button
- Upload area resets

---

## 🎥 HOW TO UPLOAD PROMO VIDEO

### **Step 1: Same Media Section**

```
Scroll down on Step 3: Media
Find "Promo Video (Optional)" section
```

### **Step 2: Upload Your Video**

**Click "Upload Video" button:**

1. Select video file (MP4, WebM, MOV)
2. Must be **2 minutes or less**
3. Must be less than **50MB**
4. Video player preview appears!

### **Step 3: Review Your Video**

**Watch the preview:**

- ▶️ Click play to watch
- 🔊 Adjust volume
- ⏸️ Pause/resume playback
- ⛶ Fullscreen mode

**Remove if needed:**

- Hover over video
- Click "Remove" (top-right)
- Upload area resets

---

## ⚡ QUICK SPECS

### **Thumbnail Image**

```
✓ Formats: JPG, PNG, WebP, GIF
✓ Max Size: 2MB
✓ Recommended: 1280x720px (16:9)
✓ Required: YES
```

### **Promo Video**

```
✓ Formats: MP4, WebM, MOV
✓ Max Size: 50MB
✓ Max Duration: 2 minutes (120 seconds)
✓ Required: NO (optional)
```

---

## 🎯 WHAT HAPPENS AFTER UPLOAD?

### **Data Storage:**

1. **Files are converted to Base64** for preview
2. **Stored in course data** (thumbnail & promoVideo fields)
3. **Saved when you publish** the course
4. **Can be edited later** in course edit page

### **Validation Checks:**

- ✅ **File type** - Only images/videos accepted
- ✅ **File size** - Within limits (2MB/50MB)
- ✅ **Video duration** - Max 2 minutes checked automatically
- ❌ **Errors shown** - Clear messages if validation fails

---

## 🚨 COMMON ERRORS & FIXES

### **"Please upload an image file"**

**Problem:** You selected a non-image file  
**Fix:** Choose JPG, PNG, WebP, or GIF

### **"Image must be less than 2MB"**

**Problem:** Image file is too large  
**Fix:**

- Compress the image using tools like TinyPNG
- Reduce image dimensions
- Convert to WebP format (smaller size)

### **"Please upload a video file"**

**Problem:** You selected a non-video file  
**Fix:** Choose MP4, WebM, or MOV

### **"Video must be less than 50MB"**

**Problem:** Video file is too large  
**Fix:**

- Compress video using HandBrake or similar
- Reduce video quality/resolution
- Trim unnecessary parts

### **"Video must be 2 minutes or less"**

**Problem:** Video duration exceeds 2 minutes  
**Fix:**

- Trim video to under 2 minutes
- Create a shorter highlight version
- Use video editing software to cut

---

## 💡 PRO TIPS

### **For Best Results:**

**Thumbnail:**

- 📐 Use 16:9 aspect ratio (1280x720px)
- 🎨 Bright, eye-catching colors
- 📝 Add text overlay (course title)
- 🖼️ High contrast for readability
- ✨ Professional design tools: Canva, Figma

**Promo Video:**

- ⏱️ Keep it short (30-60 seconds ideal)
- 🎯 Show key learning outcomes
- 👤 Include instructor introduction
- 🎬 Start with a hook (first 3 seconds)
- 🔊 Clear audio (use microphone)
- 📱 Test on mobile devices

---

## 🎨 VISUAL WORKFLOW

```
START
  ↓
Go to /instructor/create-course
  ↓
Complete Step 1: Basic Info
  ↓
Complete Step 2: Curriculum
  ↓
Click "Next" to Step 3: Media
  ↓
┌─────────────────────────────┐
│  📸 Upload Thumbnail        │
│  - Click "Choose File"      │
│  - Select image < 2MB       │
│  - See instant preview      │
└─────────────────────────────┘
  ↓
┌─────────────────────────────┐
│  🎥 Upload Promo Video      │
│  - Click "Upload Video"     │
│  - Select video < 2 min     │
│  - See video player         │
└─────────────────────────────┘
  ↓
Click "Next" to Step 4: Pricing
  ↓
Continue to Step 5: Publish
  ↓
COURSE CREATED! 🎉
```

---

## 🧪 TEST IT NOW!

### **Quick Test:**

1. **Start dev server** (if not running):

   ```bash
   npm run dev
   ```

2. **Visit course creation**:

   ```
   http://localhost:3003/instructor/create-course
   ```

3. **Navigate to Step 3**:

   - Fill Step 1 (Basic Info)
   - Fill Step 2 (Add 1 section)
   - Click "Next" to Step 3

4. **Try uploading**:
   - Upload a test image (< 2MB)
   - Upload a test video (< 2 min)
   - See previews appear!

---

## 📊 WHAT'S STORED?

### **In Component State:**

```typescript
thumbnailFile: File object (original file)
thumbnailPreview: Base64 string (for display)
promoVideoFile: File object (original file)
promoVideoPreview: Base64 string (for display)

courseData.thumbnail: Base64 string (saved to DB)
courseData.promoVideo: Base64 string (saved to DB)
```

### **In Database (when published):**

```sql
courses.thumbnail: TEXT (Base64 or URL)
courses.promo_video: TEXT (Base64 or URL)
```

---

## 🔮 COMING NEXT

### **Phase 2 Improvements:**

- 🎨 Image cropping tool
- 📊 Upload progress bars
- ☁️ Cloud storage (Cloudinary)
- 🗜️ Auto-compression
- 🎬 Video thumbnail generator
- 📱 Better mobile experience

---

## ✅ SUMMARY

**What You Can Do Now:**

1. ✅ Upload course thumbnail (< 2MB)
2. ✅ Upload promo video (< 2 min, < 50MB)
3. ✅ See instant previews
4. ✅ Change/remove uploads
5. ✅ Get validation errors
6. ✅ Save with course data

**Access:**

```
http://localhost:3003/instructor/create-course
→ Step 3: Media
```

---

**Status:** ✅ **READY TO USE!**  
**Updated:** October 16, 2025

🎬 **UPLOAD YOUR MEDIA AND CREATE AMAZING COURSES!** 📸
