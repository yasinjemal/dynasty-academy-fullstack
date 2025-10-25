# Safe Mode Tests Currently Blocked

## Current Status

**25/40 tests failing** (15 fee tests passing, 11 ledger tests + 14 webhook tests timing out)

## What's Working ✅

1. **Vitest installation**: v4.0.2 installed successfully
2. **Database schema**: All 8 marketplace tables deployed to Supabase
3. **Model name fixes**: All 50+ references updated across 9 files
4. **Audit logger skip**: Working correctly (`SKIP_AUDIT_LOGS=true` flag functioning)
5. **Fee calculation tests**: All 15 tests passing (don't require database)
6. **Environment variables**: Loading correctly from .env via vitest config

## What's NOT Working ❌

### Root Cause: Supabase Database Connection Timeouts

Tests are hanging on **every database query**, not just audit logs.

**Evidence:**

```
✓ should get platform account  13071ms  ← PASSED but took 13 seconds!
× should get instructor account 12764ms  ← TIMED OUT at 5 seconds
```

- "should get platform account" **passed** but took **13 seconds** for a single database query
- All other tests timing out at **5 seconds** (test timeout) or **15 seconds** (multiple attempts)
- Audit logger IS being skipped (console shows "⏭️ Skipping audit log")
- Database queries like `prisma.ledgerAccount.findUnique()` hanging for 10+ seconds

**Error Pattern:**

```
Error: Test timed out in 5000ms
```

AND

```
Can't reach database server at `aws-1-ap-southeast-1.pooler.supabase.com:5432`
(intermittent)
```

### Possible Causes

1. **Supabase connection pooling limits** - Free tier has limited connections
2. **Network latency** - Asia Pacific region might be slow from current location
3. **Connection exhaustion** - Tests running in parallel exhausting connection pool
4. **Database overload** - Too many test operations overwhelming Supabase instance
5. **Missing DATABASE_URL** in test environment (but .env should be loading)

## Next Steps

### Option 1: Increase Test Timeouts (Quick Fix)

```typescript
// vitest.config.ts
test: {
  testTimeout: 60000, // 60 seconds instead of 5
  hookTimeout: 120000, // 120 seconds instead of 10
}
```

**Pros:** Might allow slow tests to complete  
**Cons:** Doesn't fix underlying performance issue, tests will be very slow

### Option 2: Use Local PostgreSQL for Tests (Recommended)

Set up a local Postgres instance for tests instead of Supabase:

```typescript
// tests/setup.ts
beforeAll(async () => {
  if (process.env.NODE_ENV === "test") {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test_db";
  }
});
```

**Pros:** Fast, isolated, no network latency  
**Cons:** Requires PostgreSQL installation, setup complexity

### Option 3: Mock Prisma Client (Fastest)

Use `@prisma/client/scripts/default-index.js` or `jest-mock-extended`:

```typescript
import { mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

const prisma = mockDeep<PrismaClient>();
```

**Pros:** Instant tests, no database needed  
**Cons:** Doesn't test actual database logic, might miss bugs

### Option 4: Debug Supabase Connection

Check if DATABASE_URL is correct, connection pool settings:

```bash
npx prisma db execute --stdin <<< "SELECT 1"
```

**Pros:** Fixes root cause if it's a configuration issue  
**Cons:** Might not solve if it's a Supabase performance issue

## Recommendation

**Immediate:** Try Option 1 (increase timeouts) to see if tests pass  
**Short-term:** Implement Option 2 (local PostgreSQL) for reliable testing  
**Long-term:** Add Option 3 (mocked tests) for unit tests, keep integration tests with real DB

## Progress Tracker

### Completed ✅

- [x] Install Vitest
- [x] Create @/lib/db/index.ts export
- [x] Deploy marketplace schema to Supabase
- [x] Fix all model name mismatches (50+ fixes across 9 files)
- [x] Implement audit logger skip for tests
- [x] Configure vitest to load .env file
- [x] Debug audit logger (confirmed working)

### Blocked ⏸️

- [ ] Get all 40 tests passing (blocked by Supabase timeouts)
- [ ] Validate double-entry ledger logic
- [ ] Validate trust-based fee calculations
- [ ] Validate webhook idempotency

### Not Started ⏳

- [ ] Security hardening
- [ ] UI refactor (wire to APIs)
- [ ] Feature flags
- [ ] End-to-end acceptance testing
- [ ] Create pull request

## Value Delivered So Far

- ✅ **Database deployed** - 8 new tables in production Supabase
- ✅ **Code fixed** - All model references updated correctly
- ✅ **Test framework ready** - Vitest configured, 15/40 tests passing
- ⏸️ **Test validation blocked** - Need to resolve database performance issue

## Estimated Time to Unblock

- **Option 1 (timeouts):** 5 minutes
- **Option 2 (local DB):** 1-2 hours (install Postgres + configure)
- **Option 3 (mocking):** 2-3 hours (set up mocks + rewrite tests)
- **Option 4 (debug):** Unknown (depends on root cause)

---

**Current Blocker:** Supabase database queries taking 10-15 seconds each  
**Recommended Action:** Increase test timeouts to 60s, then investigate local PostgreSQL setup
