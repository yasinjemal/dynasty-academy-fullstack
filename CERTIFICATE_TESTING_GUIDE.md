# 🧪 CERTIFICATE TESTING GUIDE

**Status:** ✅ Server Running at http://localhost:3000  
**Date:** October 16, 2025

---

## 🎯 TESTING CHECKLIST

### Step 1: Setup Test Data ✅

We need a course enrollment at 100% completion. Run this script:

```powershell
node setup-certificate-test.mjs
```

**What it does:**

- Finds existing user (or creates test user)
- Finds existing course
- Enables certificates on the course
- Creates enrollment at 100% completion
- Gives you the course ID to test with

---

### Step 2: Login to the Platform 🔐

**Option A: Use Existing Account**

1. Go to: http://localhost:3000
2. Login with your Google account
3. Make sure you're enrolled in a course

**Option B: Use Test Account**

- Email from setup script
- Or create new account

---

### Step 3: Navigate to Course Player 📚

Visit the course completion page:

```
http://localhost:3000/courses/[COURSE-ID]
```

_Get course ID from setup script output_

---

### Step 4: Test Certificate Generation 🎓

**What to look for:**

1. **Before 100% Complete:**

   - Should see progress bar
   - Message: "Complete the course to earn your certificate"
   - No generate button

2. **At 100% Complete:**

   - Should see "Generate Certificate" button
   - Button should be clickable
   - Shows completion checkmark ✅

3. **Click "Generate Certificate":**

   - Loading spinner appears
   - API call to `/api/courses/[id]/certificate`
   - Success: Certificate generated!

4. **After Generation:**
   - Shows verification code (format: `USER-COUR-XXXXXXXX-XXXXXXXX`)
   - Download PDF button appears
   - View Certificate button appears
   - Share on LinkedIn button appears

---

### Step 5: Test PDF Download 📄

**Click "Download Certificate":**

Expected behavior:

- Downloads PDF file
- Filename: `dynasty-certificate-[CODE].pdf`
- Opens in browser/downloads to computer

**PDF should contain:**

- Dynasty Academy branding (purple/blue)
- Student name
- Course title
- Completion date
- Instructor name
- Verification code
- Professional design with borders

---

### Step 6: Test Verification Page 🔍

**Visit verification URL:**

```
http://localhost:3000/certificates/[VERIFICATION-CODE]
```

**Expected to see:**

- ✅ Green "Verified" badge
- Certificate details:
  - Student name
  - Course title
  - Completion date
  - Instructor name
  - Verification code (large display)
- Download button
- Share button (copy link)
- LinkedIn "Add Certification" button

**Test invalid code:**

```
http://localhost:3000/certificates/INVALID-CODE-12345
```

Should show:

- ❌ Red error message
- "Certificate not found or invalid"
- No certificate details

---

### Step 7: Test LinkedIn Integration 🔗

**Click "Add to LinkedIn":**

Should open LinkedIn with pre-filled data:

- Certification Name: [Course Title]
- Issuing Organization: Dynasty Academy
- Credential ID: [Verification Code]
- Credential URL: [Verification Link]

---

## 🐛 DEBUGGING TIPS

### Issue: "Generate Certificate" button not showing

**Check:**

```sql
-- Is course completed?
SELECT progress, status, "completedAt"
FROM course_enrollments
WHERE "userId" = '[YOUR-USER-ID]'
AND "courseId" = '[COURSE-ID]';
```

Should return:

- progress: 100
- status: 'completed'
- completedAt: [timestamp]

**Fix:**

```powershell
node setup-certificate-test.mjs
```

---

### Issue: API returns "Certificates not available"

**Check:**

```sql
-- Are certificates enabled?
SELECT id, title, "certificateEnabled"
FROM courses
WHERE id = '[COURSE-ID]';
```

Should return:

- certificateEnabled: true

**Fix:**

```sql
UPDATE courses
SET "certificateEnabled" = true
WHERE id = '[COURSE-ID]';
```

---

### Issue: PDF doesn't download

**Check browser console:**

- Look for errors in Network tab
- Check `/api/certificates/[code]/download` response
- Should return `application/pdf`

**Check server logs:**

- Look for jsPDF errors
- Check if certificate exists in database

---

### Issue: Verification page shows 404

**Check:**

```sql
-- Does certificate exist?
SELECT * FROM certificates
WHERE "verificationCode" = '[CODE]';
```

Should return certificate record.

**Fix:** Regenerate certificate by clicking "Generate Certificate" again.

---

## 📊 DATABASE QUERIES FOR TESTING

### Check all certificates:

```sql
SELECT
  c.id,
  c."verificationCode",
  c."issuedAt",
  u.name as "userName",
  co.title as "courseTitle"
FROM certificates c
JOIN users u ON u.id = c."userId"
JOIN courses co ON co.id = c."courseId"
ORDER BY c."issuedAt" DESC;
```

### Check enrollment status:

```sql
SELECT
  u.name,
  co.title,
  ce.progress,
  ce.status,
  ce."completedAt",
  ce."certificateIssued"
FROM course_enrollments ce
JOIN users u ON u.id = ce."userId"
JOIN courses co ON co.id = ce."courseId"
WHERE ce."userId" = '[USER-ID]';
```

### Delete test certificate (for re-testing):

```sql
DELETE FROM certificates
WHERE "userId" = '[USER-ID]'
AND "courseId" = '[COURSE-ID]';

UPDATE course_enrollments
SET
  "certificateIssued" = false,
  "certificateIssuedAt" = NULL,
  "certificateUrl" = NULL
WHERE "userId" = '[USER-ID]'
AND "courseId" = '[COURSE-ID]';
```

---

## ✅ SUCCESS CRITERIA

**Certificate system is working if:**

1. ✅ Can generate certificate for completed course
2. ✅ PDF downloads with professional design
3. ✅ Verification page shows authentic certificate
4. ✅ Invalid codes show error message
5. ✅ Can download from verification page
6. ✅ LinkedIn share button works
7. ✅ Duplicate generation returns existing certificate
8. ✅ Cannot generate before 100% completion

---

## 🚀 NEXT STEPS AFTER TESTING

### If all tests pass:

1. **Integrate into Course Player UI**

   - Add CertificateCard component to course page
   - Show when course is completed

2. **Enable Monetization**

   - Set pricing ($49-$499)
   - Add Stripe payment flow
   - Create certificate upgrade tiers

3. **Deploy to Production**

   - Push to GitHub
   - Deploy to Vercel/hosting
   - Test on live site

4. **Marketing**
   - Announce certificate feature
   - Share on social media
   - Update course descriptions

---

## 🎉 READY TO TEST!

**Start here:**

```powershell
# 1. Run setup script
node setup-certificate-test.mjs

# 2. Visit course page (use ID from script)
# http://localhost:3000/courses/[COURSE-ID]

# 3. Click "Generate Certificate"

# 4. Download PDF

# 5. Visit verification page
```

**Need help?** Check the debugging section above! 🔧
