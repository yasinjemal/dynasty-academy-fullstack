# 🎯 SUPABASE MANUAL SCHEMA MIGRATION GUIDE

## Problem

`prisma db push` is failing due to Supabase pooler connection timeouts and missing pgvector extension.

## Solution

Manually run the SQL migration in Supabase Dashboard.

---

## 📋 Step-by-Step Instructions

### 1. Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **dynasty-academy-fullstack**
3. Navigate to: **Database** → **SQL Editor**

### 2. Create New Query

1. Click **"New Query"** button
2. Copy the entire contents of `supabase-ledger-migration.sql`
3. Paste into the SQL editor

### 3. Run Migration

1. Click **"Run"** button (or press Ctrl+Enter)
2. Wait for completion (~5-10 seconds)
3. Check for success message: "Success. No rows returned"

### 4. Verify Tables Created

Navigate to **Database** → **Tables** and verify these exist:

- ✅ `ledger_accounts`
- ✅ `ledger_transfers`
- ✅ `ledger_entries`

### 5. Verify Ledger Integrity

Run this verification query in SQL Editor:

```sql
SELECT * FROM check_ledger_balance();
```

Expected result: `total_balance = 0` ✅

---

## 🔄 After Migration Complete

### Regenerate Prisma Client

```powershell
npx prisma generate
```

### Run Tests

```powershell
npm run test
```

Expected result: **40/40 tests passing** (100%) ✅

---

## 📊 What This Migration Does

### Tables Created:

**ledger_accounts** (Account master)

- `id` - Primary key
- `ownerId` - User/entity ID (nullable for platform)
- `kind` - "platform" | "instructor" | "user"
- `currency` - "USD", "EUR", etc.
- Unique constraint: `(ownerId, kind, currency)`

**ledger_transfers** (Transfer headers)

- `id` - Primary key
- `fromAccountId`, `toAccountId` - Account references
- `amount` - Amount in cents (always positive)
- `currency` - Currency code
- `reason` - Human-readable reason
- `refType`, `refId` - Reference to business object
- `idempotencyKey` - Unique key for idempotent operations
- `state` - "posted" | "pending"

**ledger_entries** (Double-entry records)

- `id` - Primary key
- `transferId` - Parent transfer reference
- `accountId` - Account reference
- `amount` - Signed amount in cents (+/-)
- `direction` - "debit" | "credit"
- `refType`, `refId` - Reference to business object
- Foreign keys with CASCADE delete on transfer

### Features:

✅ Atomic transfers (both entries or neither)
✅ Idempotency (unique idempotencyKey)
✅ Double-entry invariant (sum always = 0)
✅ Referential integrity (foreign keys)
✅ Performance indexes
✅ pgvector extension enabled

---

## 🚨 Troubleshooting

### Error: "extension vector does not exist"

**Solution:** Supabase should have pgvector pre-installed. If not, contact Supabase support or enable it via:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Error: "table already exists"

**Solution:** Run the DROP statements first:

```sql
DROP TABLE IF EXISTS "public"."ledger_entries" CASCADE;
DROP TABLE IF EXISTS "public"."ledger_transfers" CASCADE;
DROP TABLE IF EXISTS "public"."ledger_accounts" CASCADE;
```

### Error: "permission denied"

**Solution:** Make sure you're using the **postgres** role (default in Supabase SQL Editor).

---

## ✅ Success Checklist

- [ ] SQL migration ran without errors
- [ ] 3 tables visible in Database → Tables
- [ ] `check_ledger_balance()` returns 0
- [ ] `npx prisma generate` completed
- [ ] Tests running with `npm run test`
- [ ] All 40 tests passing ✅

---

## 🎯 Next Steps After Migration

Once the schema is deployed:

1. **Run tests** to verify 100% pass rate
2. **Update webhook handler** to call `splitTransfer()`
3. **Test full purchase flow** end-to-end
4. **Deploy to production** 🚀

---

## 📞 Support

If you encounter issues:

1. Check Supabase Dashboard → Database → Logs
2. Verify DATABASE_URL in `.env` is correct
3. Test connection: `npx prisma db pull` (should succeed)
4. Contact Supabase support if pgvector unavailable
