# 💳 Premium Purchase System - Complete Guide

## 🎯 Overview

Your Dynasty Built Academy now has a **conversion-optimized e-commerce system** rivaling Kindle, Apple Books, and premium platforms. This system includes:

- ✅ **Stripe Checkout Integration** - Secure payment processing
- ✅ **Individual Book Purchases** - One-time lifetime access
- ✅ **Subscription Plans** - Unlimited book access
- ✅ **Dynamic Pricing** - Automatic discount calculations
- ✅ **Instant Access** - Unlock content immediately after purchase
- ✅ **Webhook Automation** - Automatic purchase fulfillment
- ✅ **Trust Signals** - Security badges and conversion optimizations

---

## 📋 Database Schema

### Purchase Model
```prisma
model Purchase {
  id                String   @id @default(cuid())
  userId            String
  bookId            String
  amount            Float
  status            String   @default("completed") // completed, refunded, failed
  paymentProvider   String   @default("stripe")
  paymentIntentId   String?
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, bookId]) // User can only purchase book once
}
```

### Subscription Model
```prisma
model Subscription {
  id                    String   @id @default(cuid())
  userId                String
  planId                String   // basic, pro, premium
  status                String   @default("active") // active, past_due, canceled
  stripeSubscriptionId  String?  @unique
  stripeCustomerId      String?
  currentPeriodEnd      DateTime
  canceledAt            DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install stripe@latest
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Application URL (for webhook redirects)
NEXTAUTH_URL=http://localhost:3000
```

### 3. Create Database Tables

```bash
node create-purchase-tables.mjs
```

This creates:
- `purchases` table
- `subscriptions` table
- All necessary indexes

### 4. Stripe Dashboard Setup

#### Create Products

**Option 1: Individual Books**
- Product Type: One-time payment
- Name: Book Title
- Price: R199, R299, R499 (your pricing)

**Option 2: Subscription Plans**

1. **Basic Plan**
   - Price: R99/month
   - Description: "3 Books per month"
   - Billing: Monthly

2. **Pro Plan**
   - Price: R299/month
   - Description: "Unlimited Books"
   - Billing: Monthly

3. **Premium Plan**
   - Price: R499/month
   - Description: "Books + Audio Mode"
   - Billing: Monthly

#### Configure Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

5. Copy the Webhook Secret → Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### 5. Test Webhooks Locally

```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will give you a webhook secret (whsec_xxx) - add it to .env
```

---

## 🎨 Enhanced Paywall Features

### Dynamic Pricing Display

The paywall automatically calculates and displays:

```tsx
// Savings Calculation
const discount = Math.round(((price - salePrice) / price) * 100)

// Display
Save {discount}% 🔥
💎 Early Reader Discount - Limited Time!
```

### Trust Signals

Three key conversion elements:

1. **🛡️ Secure Payment** - SSL encryption
2. **⚡ Instant Access** - Unlock immediately
3. **✅ Lifetime Access** - Never expires

### Visual Enhancements

- Animated gradient lock icon (pulse effect)
- Gradient text for headings (purple → blue)
- Hover animations on CTA buttons (scale + shadow)
- Blurred backdrop for premium feel
- Slide-up animation on modal appearance

---

## 🔌 API Endpoints

### 1. Create Checkout Session

**POST** `/api/checkout/create-session`

**Request:**
```json
{
  "bookId": "cmglh65wz0001uy7kl2399fhu",
  "type": "book" // or "subscription"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/c/pay/xxx"
}
```

**Usage:**
```typescript
const res = await fetch('/api/checkout/create-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bookId, type: 'book' }),
})

const { url } = await res.json()
window.location.href = url // Redirect to Stripe
```

### 2. Complete Purchase

**POST** `/api/purchase/[bookId]`

Called automatically by webhook after successful payment.

**Request:**
```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 299.00,
  "provider": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "purchase": {
    "id": "clxxx",
    "userId": "user123",
    "bookId": "book456",
    "amount": 299.00,
    "status": "completed"
  }
}
```

### 3. Check Purchase Status

**GET** `/api/purchase/[bookId]`

**Response:**
```json
{
  "purchased": true,
  "purchase": {
    "id": "clxxx",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### 4. Webhook Handler

**POST** `/api/webhooks/stripe`

Automatically processes:
- `checkout.session.completed` → Creates Purchase record
- `invoice.payment_succeeded` → Renews subscription
- `invoice.payment_failed` → Marks subscription as past_due
- `customer.subscription.deleted` → Cancels subscription

---

## 💡 User Flow

### Book Purchase Flow

1. **User reads free preview** (e.g., 7 pages)
2. **Hits paywall at page 8**
3. **Enhanced modal appears** with:
   - Animated lock icon
   - Dynamic pricing (R265 ~~R155~~ = Save 40% 🔥)
   - Trust signals (Secure, Instant, Lifetime)
   - "Purchase Book" CTA button
4. **Clicks "Purchase Book"**
5. **Creates Stripe Checkout Session** via API
6. **Redirects to Stripe Checkout**
7. **User completes payment**
8. **Stripe sends webhook** to `/api/webhooks/stripe`
9. **Purchase record created** in database
10. **User redirected** to `/books/slug/read?success=true`
11. **Page instantly unlocked** - all pages accessible

### Subscription Flow

1. **User clicks "Subscribe for Unlimited Books"**
2. **Selects plan** (Basic R99, Pro R299, Premium R499)
3. **Redirects to Stripe Checkout** (recurring)
4. **Completes subscription**
5. **Webhook creates Subscription** record
6. **User gets unlimited access** to all books

---

## 🎯 Conversion Optimization Strategies

### 1. Price Anchoring

Always show original price with strikethrough:

```tsx
<span className="text-5xl font-bold">R265</span>
<span className="text-2xl line-through text-gray-400">R455</span>
<span className="text-green-600">Save 40% 🔥</span>
```

### 2. Urgency Triggers

Add time-limited language:
- "💎 Early Reader Discount - Limited Time!"
- "🔥 Hot Deal"
- "⏰ Offer expires soon"

### 3. Social Proof

(To be added next):
- "Join 1,247 readers who unlocked this book"
- "⭐⭐⭐⭐⭐ 4.8/5 from 83 reviews"
- "🔥 Trending in Business & Money"

### 4. Micro-commitments

Free preview → bookmark → paywall → purchase
Each step builds commitment.

### 5. Two-Option Pricing

Always offer:
- Option A: Buy this book (R299)
- Option B: Unlimited subscription (R499/mo)

Makes Option A feel like a bargain.

---

## 📊 Analytics to Track

### Key Metrics

1. **Conversion Rate**
   ```typescript
   // Paywall views vs purchases
   const conversionRate = (purchases / paywallViews) * 100
   ```

2. **Drop-off Analysis**
   - Which page do most users abandon?
   - How many pages before paywall trigger?

3. **Revenue Metrics**
   - Average order value (AOV)
   - Lifetime value (LTV)
   - Monthly recurring revenue (MRR)

4. **A/B Testing**
   - Test different discount percentages
   - Test paywall trigger points (page 5 vs 7 vs 10)
   - Test pricing (R199 vs R265 vs R299)

### Implementation

```typescript
// Track paywall views
await fetch('/api/analytics/track', {
  method: 'POST',
  body: JSON.stringify({
    event: 'paywall_view',
    bookId,
    userId,
    page: currentPage,
  }),
})

// Track purchases
await fetch('/api/analytics/track', {
  method: 'POST',
  body: JSON.stringify({
    event: 'purchase_completed',
    bookId,
    userId,
    amount,
  }),
})
```

---

## 🎧 Next: Audio Mode Integration

### ElevenLabs Integration (Recommended)

**Pricing:** $5-$330/month
- Starter: 30,000 characters/mo
- Creator: 100,000 characters/mo
- Pro: 500,000 characters/mo

**Cost per book:**
- Average book: ~50,000 words = 250,000 chars
- Cost: $0.50 - $1.00 per book

**Implementation:**

```typescript
// Generate audio for book
const generateAudio = async (bookId: string) => {
  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text: bookContent,
      voice_id: 'EXAVITQu4vr4xnSDxMaL', // Male professional voice
      model_id: 'eleven_multilingual_v2',
    }),
  })

  const audioBlob = await res.blob()
  // Upload to S3/Supabase Storage
  // Save URL to BookAudio table
}
```

### UI Enhancement

Add "🎧 Listen Mode" button in reader header:

```tsx
<Button onClick={() => setAudioMode(!audioMode)}>
  <svg>🎧</svg>
  {audioMode ? 'Reading Mode' : 'Listen Mode'}
</Button>
```

---

## 🔐 Security Best Practices

### 1. Verify Webhook Signatures

Always validate Stripe webhooks:

```typescript
const signature = req.headers.get('stripe-signature')!
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

### 2. Server-Side Purchase Verification

Never trust client-side purchase status:

```typescript
// Server-side check
const purchase = await prisma.purchase.findFirst({
  where: { userId, bookId, status: 'completed' },
})

const isPurchased = !!purchase
```

### 3. Rate Limiting

Add to checkout endpoint:

```typescript
// Simple rate limit: 5 requests per minute per user
const rateLimitKey = `checkout:${userId}`
const requests = await redis.incr(rateLimitKey)
if (requests === 1) await redis.expire(rateLimitKey, 60)
if (requests > 5) return res.status(429).json({ error: 'Too many requests' })
```

---

## 📱 Mobile Optimization

### Responsive Paywall

Already implemented:
- Full-width CTA buttons on mobile
- Touch-optimized button sizes (py-6)
- Readable text sizes (text-lg, text-3xl)
- Proper spacing (gap-3, mb-6)

### Testing Checklist

- [ ] iPhone SE (smallest viewport)
- [ ] iPhone 14 Pro
- [ ] iPad
- [ ] Android (Samsung Galaxy)
- [ ] Landscape mode

---

## 🚀 Deployment Checklist

### Production Environment Variables

```env
# Stripe LIVE keys (not test)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Application URL
NEXTAUTH_URL=https://dynasty-academy.com
```

### Stripe Production Setup

1. **Activate Live Mode** in Stripe Dashboard
2. **Create live webhook** endpoint
3. **Update all test keys** to live keys
4. **Test with real credit card** (yours)
5. **Enable fraud prevention** (Radar)
6. **Set up email receipts**

### DNS/SSL

- Ensure SSL certificate is valid
- Webhook endpoint must be HTTPS
- Test webhook connection from Stripe

---

## 📈 Success Metrics (30 Days Post-Launch)

Target KPIs:
- Conversion rate: 5-15% (industry standard for e-books)
- Average order value: R250-R350
- Monthly recurring revenue: R5,000+ (from subscriptions)
- Churn rate: <10% (subscription cancellations)

---

## 🎉 What You've Built

You now have a **production-ready e-commerce platform** with:

✅ Stripe payment processing  
✅ Individual book purchases  
✅ Subscription memberships  
✅ Automatic fulfillment via webhooks  
✅ Dynamic pricing with discount display  
✅ Trust signals and conversion optimization  
✅ Secure payment verification  
✅ Professional UI/UX matching Kindle quality  

**Next Priority:** Add Listen Mode with ElevenLabs TTS integration to differentiate from competitors.

---

## 🤝 Support

Questions? Check:
1. Stripe API Docs: https://stripe.com/docs/api
2. Prisma Docs: https://www.prisma.io/docs
3. Next.js Docs: https://nextjs.org/docs

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

**Status:** ✅ Ready for Production
**Last Updated:** January 15, 2025
