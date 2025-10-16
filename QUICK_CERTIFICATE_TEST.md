# 🚀 QUICK TEST - Certificate System

**Server:** ✅ Running at http://localhost:3000  
**Database:** ✅ Connected  
**Course Visited:** `4a244b5f-e694-413b-b6f3-1921ece7cb77`

---

## ⚡ QUICK TEST STEPS

### 1. Visit Your Course Page

You already opened:

```
http://localhost:3000/courses/4a244b5f-e694-413b-b6f3-1921ece7cb77
```

### 2. Check Certificate Card

**Look for CertificateCard component on the page**

The component should show one of these states:

**If NOT 100% complete:**

- Progress bar showing current %
- Message: "Complete the course to earn your certificate"

**If 100% complete:**

- ✅ Completion checkmark
- "Generate Certificate" button (purple/blue)

**If certificate already issued:**

- Verification code display
- "Download Certificate" button
- "View Certificate" button
- "Share on LinkedIn" button

---

### 3. Enable Certificates (if needed)

If you see "Certificates not available", run:

```powershell
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$executeRaw\`UPDATE courses SET \\\"certificateEnabled\\\" = true WHERE id = '4a244b5f-e694-413b-b6f3-1921ece7cb77'\`.then(() => { console.log('✅ Certificates enabled!'); p.\$disconnect(); });"
```

Then refresh the page.

---

### 4. Set Course to 100% (if needed)

If you're not at 100%, run this to simulate completion:

```powershell
# Find your user ID (check the logs or session)
# Then run:
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$executeRaw\`UPDATE course_enrollments SET progress = 100, status = 'completed', \\\"completedAt\\\" = NOW(), \\\"completedLessons\\\" = \\\"totalLessons\\\" WHERE \\\"courseId\\\" = '4a244b5f-e694-413b-b6f3-1921ece7cb77' AND \\\"userId\\\" = 'YOUR-USER-ID'\`.then(() => { console.log('✅ Course completed!'); p.\$disconnect(); });"
```

Replace `YOUR-USER-ID` with your actual user ID from the session.

---

### 5. Click "Generate Certificate"

**Expected:**

1. Button shows loading spinner
2. API calls `/api/courses/4a244b5f-e694-413b-b6f3-1921ece7cb77/certificate`
3. Success message appears
4. Certificate card updates to show:
   - Verification code
   - Download button
   - View button
   - LinkedIn share

---

### 6. Download PDF

**Click "Download Certificate"**

Should download: `dynasty-certificate-[CODE].pdf`

**PDF Contains:**

- Dynasty Academy branding (purple header)
- Your name
- "Complete React & Next.js Masterclass"
- Completion date
- Instructor signature section
- Verification code
- Professional borders

---

### 7. View Verification Page

**Click "View Certificate"** or visit:

```
http://localhost:3000/certificates/[YOUR-VERIFICATION-CODE]
```

**Expected:**

- ✅ Green "Verified" badge
- Certificate details
- Download button
- Share button
- LinkedIn "Add Certification" button

---

### 8. Test LinkedIn Share

**Click "Add to LinkedIn"**

Should open LinkedIn with:

- Certification Name: Complete React & Next.js Masterclass
- Issuing Organization: Dynasty Academy
- Credential ID: [Your verification code]
- Credential URL: [Verification link]

---

## 🐛 TROUBLESHOOTING

### Can't see Certificate Card?

The component might not be integrated yet. Check:

```
src/app/(dashboard)/courses/[id]/page.tsx
```

Should import and render `<CertificateCard />` component.

**Need me to integrate it?** Just say "integrate certificate card"!

---

### Database Connection Error?

Check your `.env` file has valid DATABASE_URL.

---

### API Returns 401 Unauthorized?

Make sure you're logged in! Check session in browser DevTools:

```javascript
// Run in browser console
fetch("/api/auth/session")
  .then((r) => r.json())
  .then(console.log);
```

---

## ✅ SUCCESS = REVENUE READY!

Once certificates work:

- You can charge $49-$499 per certificate
- LinkedIn integration = social proof
- Verification builds trust
- Professional PDFs justify premium pricing

---

**Ready to test?** Start at step 1! 🎓
