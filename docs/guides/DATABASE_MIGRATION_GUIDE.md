# Database Migration Guide

## ⚠️ IMPORTANT: Database Migration Required

The V1 completion added 3 new tables to your database schema:

1. `instructor_applications` - Stores instructor onboarding applications
2. `audit_logs` - Tracks all admin actions for governance transparency
3. `instructor_verification` - Supports KYC verification (future use)

## 🚦 Migration Steps

### Step 1: Stop Your Dev Server

If your Next.js dev server is running, stop it first (Ctrl+C in terminal).

**Why?** Windows file locks prevent Prisma from updating while the app is running.

### Step 2: Generate Prisma Client

```powershell
npx prisma generate
```

**Expected Output:**

```
✔ Generated Prisma Client
```

### Step 3: Push Schema to Database

```powershell
npx prisma db push
```

**Expected Output:**

```
✔ Database schema pushed to production
```

### Step 4: Verify Tables Created

```powershell
npx prisma studio
```

This opens Prisma Studio in your browser. Verify these tables exist:

- ✅ `InstructorApplication`
- ✅ `AuditLog`
- ✅ `InstructorVerification`

### Step 5: Restart Dev Server

```powershell
npm run dev
```

---

## 🐛 Troubleshooting

### Error: "EPERM: operation not permitted"

**Cause**: Dev server or another process is using Prisma files.

**Solution**:

1. Stop all terminals running `npm run dev`
2. Close VS Code (if necessary)
3. Reopen VS Code, try again

**Alternative** (force push without regenerating):

```powershell
npx prisma db push --skip-generate
```

### Error: "Database URL not found"

**Cause**: Missing `DATABASE_URL` in `.env` file.

**Solution**:

1. Check `.env` file exists in project root
2. Verify `DATABASE_URL` is set to your Supabase connection string
3. Format: `postgresql://user:password@host:port/database?schema=public`

### Error: "Column already exists"

**Cause**: Previous partial migration.

**Solution** (if safe to reset):

```powershell
npx prisma db push --force-reset
```

⚠️ **WARNING**: `--force-reset` deletes all data! Only use in development.

---

## ✅ Post-Migration Verification

### Test 1: Check Database Schema

```powershell
npx prisma studio
```

- Verify 3 new tables exist
- Check User table has new relation fields

### Test 2: Test Instructor Application Flow

1. Visit `http://localhost:3000/become-instructor`
2. Fill out application form
3. Submit application
4. Go to admin dashboard: `http://localhost:3000/admin/instructor-applications`
5. Verify application appears

### Test 3: Test Audit Logging

1. Approve an instructor application
2. Go to governance dashboard: `http://localhost:3000/admin/governance`
3. Verify audit log entry appears

### Test 4: Test Recommendations

1. Go to main dashboard: `http://localhost:3000/dashboard`
2. Verify "Personalized Feed" section renders
3. Check console for any API errors

---

## 📊 Expected Database Schema Changes

### New Models (3)

```prisma
model InstructorApplication {
  id                String   @id @default(cuid())
  userId            String
  status            String   // "pending" | "approved" | "rejected"
  teachingPitch     String
  topicsToTeach     String[]
  portfolioUrl      String?
  rejectionReason   String?
  reviewedBy        String?
  reviewedAt        DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation("UserInstructorApplications", fields: [userId], references: [id])
  reviewer          User?    @relation("ReviewedApplications", fields: [reviewedBy], references: [id])

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model AuditLog {
  id            String   @id @default(cuid())
  actorUserId   String
  action        String
  entity        String
  entityId      String
  before        Json?
  after         Json?
  reason        String?
  metadata      Json?
  createdAt     DateTime @default(now())

  actor         User     @relation("AuditLogsActor", fields: [actorUserId], references: [id])

  @@index([actorUserId])
  @@index([entity, entityId])
  @@index([createdAt])
}

model InstructorVerification {
  id                String   @id @default(cuid())
  instructorId      String   @unique
  verificationType  String   // "email" | "phone" | "document" | "background_check"
  status            String   // "pending" | "verified" | "failed"
  documentUrl       String?
  verifiedAt        DateTime?
  verifiedBy        String?
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  instructor        User     @relation("InstructorVerifications", fields: [instructorId], references: [id])

  @@index([instructorId])
  @@index([status])
}
```

### Updated Model (User)

```prisma
model User {
  // ... existing fields ...

  // NEW RELATIONS
  instructorApplications       InstructorApplication[]  @relation("UserInstructorApplications")
  reviewedApplications         InstructorApplication[]  @relation("ReviewedApplications")
  auditLogsAsActor             AuditLog[]               @relation("AuditLogsActor")
  instructorVerifications      InstructorVerification[] @relation("InstructorVerifications")
}
```

---

## 🔄 Rollback Plan (Emergency)

If migration causes issues, you can rollback:

### Option 1: Remove New Models

1. Open `prisma/schema.prisma`
2. Delete the 3 new models (InstructorApplication, AuditLog, InstructorVerification)
3. Remove User relations
4. Run `npx prisma db push --force-reset`

### Option 2: Git Revert (if committed)

```powershell
git log --oneline  # Find commit hash before migration
git revert <commit-hash>
npx prisma generate
npx prisma db push
```

---

## 📞 Need Help?

### Check Logs

```powershell
# Prisma debug mode
DEBUG="*" npx prisma db push
```

### Verify Supabase Connection

```powershell
# Test connection
npx prisma db pull
```

If successful, your DATABASE_URL is correct.

### Discord/Support

If issues persist:

1. Check `logs/` folder for error details
2. Share error message + stack trace
3. Include Prisma version: `npx prisma --version`

---

## ✅ Migration Complete!

Once migration succeeds:

- ✅ 3 new tables created
- ✅ User relations updated
- ✅ Indexes created for performance
- ✅ Ready to test V1 features

**Next**: Test all 3 options (A, B, C) to verify everything works!
