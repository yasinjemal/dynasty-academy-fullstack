# 🚀 SAFE MODE - QUICK REFERENCE

**One-page guide for developers**

---

## 📦 KEY FILES

```
src/lib/ledger/
├── accounts.ts         # Account management, balance computation
└── transfers.ts        # Double-entry transfers, idempotency

src/lib/revenue/
├── stripe.ts           # Stripe SDK wrappers
└── fees.ts             # Trust-based fee calculation

src/app/api/
├── payments/
│   ├── checkout/       # Create Stripe sessions
│   └── webhook/        # ⚡ CRITICAL - Process events
├── payouts/
│   ├── connect/        # Stripe Connect onboarding
│   └── request/        # Instructor payouts
├── marketplace/
│   └── browse/         # Product catalog
├── ownership/
│   └── has/            # Access verification
└── ledger/
    └── balance/        # User balance

prisma/schema.marketplace.prisma  # Database models
.env.example.marketplace          # Configuration
```

---

## 🔑 ENVIRONMENT VARIABLES

```env
# Safe Mode Flags
CREDITS_ONLY=true
ENABLE_CRYPTO=false
TRUST_FEE_ENABLED=true
CONNECT_ENABLED=true

# Stripe (Get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Limits
MIN_PAYOUT_AMOUNT_CENTS=5000  # $50
PURCHASE_RATE_LIMIT=10         # per hour
PAYOUT_RATE_LIMIT=3            # per day

# Security
REQUIRE_INSTRUCTOR_KYC=true
AUDIT_ALL_TRANSACTIONS=true
```

---

## 💻 COMMON COMMANDS

```bash
# Setup
npx prisma db push              # Run migration
npm run dev                     # Start dev server

# Testing
npm run test                    # Run all tests
npm run test:watch              # Watch mode
npm run test:coverage           # Coverage report

# Stripe
stripe login                    # Login to Stripe
stripe listen --forward-to localhost:3000/api/payments/webhook
stripe trigger checkout.session.completed

# Build
npm run build                   # Production build
```

---

## 🎯 TRUST-BASED FEES

| Tier          | Score    | Fee | Instructor Gets | Boost       |
| ------------- | -------- | --- | --------------- | ----------- |
| Unverified    | 0-199    | 50% | $50 from $100   | Baseline    |
| Verified      | 200-499  | 35% | $65 from $100   | +30% 📈     |
| Trusted       | 500-799  | 25% | $75 from $100   | +50% 📈     |
| **Elite**     | 800-949  | 15% | $85 from $100   | **+70%** 🚀 |
| **Legendary** | 950-1000 | 5%  | $95 from $100   | **+90%** 🔥 |

**Elite instructors earn $35,000 more per 1,000 sales!**

---

## 🔄 MONEY FLOW

### **Purchase ($100 product, Trusted instructor):**

```
1. User clicks "Buy" → POST /api/payments/checkout
2. Dynasty creates Stripe session
3. User pays Stripe (Stripe holds $100)
4. Stripe sends webhook → checkout.session.completed
5. Webhook handler:
   ├─ Calculate fee: 25% = $25
   ├─ Transfer $25 → Platform (ledger)
   ├─ Transfer $75 → Instructor (ledger)
   └─ Grant ownership
6. User owns product, instructor sees $75 balance
```

### **Payout ($500 instructor balance):**

```
1. Instructor clicks "Request Payout"
2. Dynasty checks:
   ├─ KYC verified? ✅
   ├─ Connect onboarded? ✅
   ├─ Balance ≥ $500? ✅
   └─ Rate limit OK? ✅
3. Create Stripe payout
4. Debit $500 from instructor ledger
5. Stripe sends to bank (2-3 days)
```

---

## 🧮 LEDGER API

```typescript
// Get/create account
const account = await getOrCreateAccount(userId, "instructor", "USD");

// Get balance (always computed from entries)
const balanceCents = await getBalanceCents(account.id);

// Atomic transfer
const result = await transfer({
  fromAccountId: account1.id,
  toAccountId: account2.id,
  amountCents: 5000,
  refType: "purchase",
  refId: productId,
  idempotency: `purchase_${orderId}`, // Must be unique
});

// Verify ledger integrity (dev tool)
const { isValid, totalSum } = await verifyLedgerInvariant();
// isValid must be true, totalSum must be 0
```

---

## 💳 STRIPE API

```typescript
// Create checkout session
const session = await createCheckoutSession({
  productId,
  productTitle,
  priceAmountCents: 10000,
  userId,
  userEmail,
  instructorId,
  successUrl: "/marketplace/success",
  cancelUrl: "/marketplace",
});

// Redirect user to session.url
```

---

## 🎨 FEE CALCULATION

```typescript
// Calculate fee for instructor
const feeCalc = await calculateFee(instructorId, 10000); // $100

// Returns:
{
  grossAmountCents: 10000,
  platformFeeCents: 2500,      // $25 (25% for Trusted)
  instructorNetCents: 7500,    // $75
  feePercentage: 0.25,
  trustScore: 650,
  tier: "Trusted"
}

// Simple fee lookup (no async)
const feePercent = platformFeeFor(trustScore);
// 0.05 (Legendary), 0.15 (Elite), 0.25 (Trusted), 0.35 (Verified), 0.50 (Unverified)
```

---

## 🔐 WEBHOOK HANDLER

```typescript
// Webhook receives event
POST / api / payments / webhook;

// 1. Verify signature
const event = constructWebhookEvent(body, signature, secret);

// 2. Check if already processed
const existing = await prisma.stripeEvent.findUnique({
  where: { id: event.id },
});
if (existing?.processed) return; // Idempotent

// 3. Process based on type
switch (event.type) {
  case "checkout.session.completed":
    // Calculate fee → Create entries → Grant ownership
    break;
  case "charge.refunded":
    // Reverse entries → Revoke ownership
    break;
}

// 4. Mark processed
await prisma.stripeEvent.update({
  where: { id: event.id },
  data: { processed: true },
});
```

---

## 🧪 TESTING

```bash
# Run tests
npm run test

# Expected output
✓ tests/ledger.spec.ts (12)     # Account, transfers, idempotency
✓ tests/fees.spec.ts (15)       # Trust tiers, fee calculation
✓ tests/webhook.spec.ts (10)    # Event processing, ownership

Test Files  3 passed (3)
Tests      37 passed (37)
```

### **Test Stripe locally:**

```bash
# Forward webhooks
stripe listen --forward-to localhost:3000/api/payments/webhook

# Trigger test event
stripe trigger checkout.session.completed

# Check database
psql -d dynasty -c "SELECT * FROM \"StripeEvent\" WHERE processed = true"
```

---

## ⚠️ CRITICAL RULES

### **1. ALWAYS use transfer() for money movement**

❌ Don't create Entry records directly  
✅ Use transfer() which creates debit + credit atomically

### **2. ALWAYS provide idempotency key**

❌ `transfer({ ..., idempotency: undefined })`  
✅ `transfer({ ..., idempotency: "stripe_event_evt_123" })`

### **3. NEVER cache balances**

❌ Store balance in user table  
✅ Always compute from Entry sum: `getBalanceCents(accountId)`

### **4. VERIFY ledger invariant in dev**

```typescript
const { isValid, totalSum } = await verifyLedgerInvariant();
assert(isValid === true && totalSum === 0);
```

### **5. CHECK KYC before payouts**

```typescript
if (!instructor.verified && process.env.REQUIRE_INSTRUCTOR_KYC === "true") {
  throw new Error("KYC required");
}
```

---

## 🐛 COMMON ERRORS

### **"Transfer amount must be positive"**

❌ `amountCents: -1000`  
✅ `amountCents: 1000` (always positive, direction handled by from/to)

### **"Cannot transfer to same account"**

❌ `fromAccountId === toAccountId`  
✅ Different accounts for from/to

### **"Duplicate idempotency key"**

✅ **This is correct!** Idempotency working as designed.  
Function returns existing transfer, no duplicate created.

### **"Webhook signature verification failed"**

Check `STRIPE_WEBHOOK_SECRET` in `.env` matches Stripe dashboard.

### **"Sum of entries not zero"**

Only happens if you manually created Entry records.  
In production, ONLY use transfer() function.

---

## 📊 DATABASE QUERIES

```sql
-- Check balance
SELECT SUM("amountCents") FROM "Entry" WHERE "accountId" = 'acc_123';

-- View transactions
SELECT * FROM "Entry" WHERE "refId" = 'prod_123' ORDER BY "createdAt" DESC;

-- Verify invariant
SELECT SUM("amountCents") FROM "Entry";  -- Must be 0

-- Check ownership
SELECT * FROM "Ownership" WHERE "userId" = 'user_123' AND "revokedAt" IS NULL;

-- Webhook events
SELECT * FROM "StripeEvent" WHERE "processed" = false;

-- Recent payouts
SELECT * FROM "Payout" ORDER BY "requestedAt" DESC LIMIT 10;
```

---

## 🎯 ACCEPTANCE CRITERIA

Before production:

- [ ] `npm run build` succeeds
- [ ] All 37 tests passing
- [ ] Purchase flow works (test card: 4242 4242 4242 4242)
- [ ] Ownership granted after payment
- [ ] Ledger entries created (platform + instructor)
- [ ] Refund flow works (ownership revoked)
- [ ] Payout requires KYC verification
- [ ] Rate limiting enforced (10 purchases/hour, 3 payouts/day)
- [ ] `verifyLedgerInvariant()` returns `isValid: true`
- [ ] Audit logs written for all transactions

---

## 📚 DOCUMENTATION

- `SAFE_MODE_RUNBOOK.md` - Complete deployment guide (600+ lines)
- `SAFE_MODE_SUMMARY.md` - Architecture overview (400+ lines)
- `SAFE_MODE_TESTS.md` - Test suite docs (500+ lines)
- `SAFE_MODE_STATUS.md` - Implementation status (400+ lines)

---

## 💬 SUPPORT

**Stripe Issues:**

- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Webhooks: https://dashboard.stripe.com/webhooks

**Testing:**

- Test cards: https://stripe.com/docs/testing
- Webhook testing: `stripe trigger <event_name>`

**Ledger Issues:**

- Run `verifyLedgerInvariant()` - must return `isValid: true`
- Check all entries created via `transfer()` function
- Never manually create Entry records

---

**🛡️ SAFE MODE: NON-CUSTODIAL • SECURE • PRODUCTION-READY**
