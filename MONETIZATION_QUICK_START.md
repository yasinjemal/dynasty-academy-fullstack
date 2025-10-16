# 💰 MONETIZATION IMPLEMENTATION GUIDE

## Quick Start to Revenue

---

## 🚀 PHASE 1: IMMEDIATE REVENUE (This Week)

### Step 1: Install Stripe

```bash
npm install stripe @stripe/stripe-js
npm install -D @types/stripe
```

### Step 2: Add Environment Variables

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PREMIUM_MONTHLY=price_...
STRIPE_PREMIUM_ANNUAL=price_...
STRIPE_PRO_MONTHLY=price_...
STRIPE_PRO_ANNUAL=price_...
```

### Step 3: Create Stripe Products

**In Stripe Dashboard:**

1. Go to Products
2. Create "Premium" - $29/month recurring
3. Create "Premium Annual" - $290/year recurring
4. Create "Professional" - $99/month recurring
5. Create "Professional Annual" - $990/year recurring

Copy the Price IDs to your `.env` file.

---

## 💳 SIMPLE PAYMENT FLOW

### 1. Pricing Page (`/pricing`)

```typescript
// src/app/pricing/page.tsx
export default function PricingPage() {
  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>

      {/* Free Tier */}
      <PricingCard
        name="Free"
        price="$0"
        features={[
          "3 courses per month",
          "5 books per month",
          "Community access",
          "Basic AI insights",
        ]}
      />

      {/* Premium Tier */}
      <PricingCard
        name="Premium"
        price="$29/month"
        annualPrice="$290/year"
        features={[
          "Unlimited courses",
          "Unlimited books",
          "Advanced AI coaching",
          "Certificates",
          "Downloads",
          "Priority support",
        ]}
        onSubscribe={() => handleCheckout("premium", "month")}
      />

      {/* Professional Tier */}
      <PricingCard
        name="Professional"
        price="$99/month"
        annualPrice="$990/year"
        popular
        features={[
          "Everything in Premium",
          "1-on-1 AI mentorship",
          "Job board access",
          "Resume AI",
          "API access",
          "Team dashboard",
        ]}
        onSubscribe={() => handleCheckout("professional", "month")}
      />
    </div>
  );
}
```

### 2. Checkout API

```typescript
// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, interval } = await req.json();

  // Get price ID
  const priceIds = {
    premium_month: process.env.STRIPE_PREMIUM_MONTHLY!,
    premium_year: process.env.STRIPE_PREMIUM_ANNUAL!,
    professional_month: process.env.STRIPE_PRO_MONTHLY!,
    professional_year: process.env.STRIPE_PRO_ANNUAL!,
  };

  const priceId = priceIds[`${plan}_${interval}` as keyof typeof priceIds];

  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?upgrade=cancelled`,
    customer_email: session.user.email!,
    metadata: {
      userId: session.user.id,
      plan,
      interval,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### 3. Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  // Handle subscription created
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && plan) {
      // Upgrade user to premium
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });
    }
  }

  // Handle subscription cancelled
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    // Find user by subscription ID and downgrade
    // Implementation depends on how you store subscription IDs
  }

  return NextResponse.json({ received: true });
}
```

---

## 🔒 FREEMIUM LIMITS

### 1. Course Access Limit

```typescript
// src/app/(dashboard)/courses/page.tsx
export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);
  const [monthlyCount, setMonthlyCount] = useState(0);

  useEffect(() => {
    // Check if user hit limit
    if (!session?.user.isPremium && monthlyCount >= 3) {
      showUpgradeModal();
    }
  }, [monthlyCount]);

  return (
    <div>
      {!session?.user.isPremium && monthlyCount >= 3 && (
        <UpgradeModal
          message="You've reached your 3-course limit!"
          plan="premium"
        />
      )}

      <CourseGrid courses={courses} />
    </div>
  );
}
```

### 2. Feature Gating

```typescript
// src/components/FeatureGate.tsx
export function FeatureGate({
  feature,
  children,
  fallback,
}: {
  feature: "downloads" | "certificates" | "ai_coaching";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { data: session } = useSession();

  if (!session?.user.isPremium) {
    return (
      <div className="locked-feature">
        {fallback || (
          <div className="upgrade-prompt">
            <Lock className="w-6 h-6" />
            <p>Upgrade to unlock this feature</p>
            <Button onClick={() => router.push("/pricing")}>Upgrade Now</Button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

// Usage:
<FeatureGate feature="downloads">
  <DownloadButton />
</FeatureGate>;
```

---

## 📊 QUICK REVENUE TRACKING

### Simple Analytics

```typescript
// src/app/api/admin/revenue/route.ts
export async function GET() {
  const totalUsers = await prisma.user.count();
  const premiumUsers = await prisma.user.count({
    where: { isPremium: true },
  });

  const mrr = premiumUsers * 29; // Assuming all are on $29 plan
  const arr = mrr * 12;

  return NextResponse.json({
    totalUsers,
    premiumUsers,
    conversionRate: ((premiumUsers / totalUsers) * 100).toFixed(2) + "%",
    mrr: `$${mrr.toLocaleString()}`,
    arr: `$${arr.toLocaleString()}`,
  });
}
```

---

## 🎯 CONVERSION TACTICS

### 1. Upgrade Prompts

```typescript
// Show at strategic moments
const upgradePrompts = [
  {
    trigger: "course_limit_reached",
    message: "You're on fire! 🔥 Unlock unlimited learning for $29/month",
    cta: "Upgrade to Premium",
  },
  {
    trigger: "download_attempt",
    message: "Want to learn offline? Download courses with Premium",
    cta: "Enable Downloads",
  },
  {
    trigger: "certificate_attempt",
    message: "Showcase your skills! Get verified certificates",
    cta: "Get Certificate",
  },
  {
    trigger: "ai_feature_tease",
    message: "AI can optimize your learning path 3x faster",
    cta: "Unlock AI Coach",
  },
];
```

### 2. Trial Offer

```typescript
// Offer 7-day free trial
<Button onClick={() => startTrial()}>Try Premium Free for 7 Days</Button>

// After 7 days, convert to paid or downgrade
```

### 3. Annual Discount

```typescript
<PricingToggle>
  <Tab value="monthly">Monthly</Tab>
  <Tab value="annual">
    Annual
    <Badge>Save $58!</Badge>
  </Tab>
</PricingToggle>
```

---

## 💎 CERTIFICATE SALES

### Quick Implementation

```typescript
// src/app/courses/[id]/certificate/page.tsx
export default function CertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const handlePurchase = async (type: "standard" | "professional") => {
    const price = type === "standard" ? 49 : 149;

    const res = await fetch("/api/certificates/checkout", {
      method: "POST",
      body: JSON.stringify({
        courseId: params.id,
        type,
        price,
      }),
    });

    const { url } = await res.json();
    window.location.href = url; // Redirect to Stripe
  };

  return (
    <div className="certificate-shop">
      <h1>Get Your Certificate</h1>

      <CertificateOption
        name="Standard Certificate"
        price="$49"
        features={["LinkedIn-ready", "PDF download", "Verification"]}
        onPurchase={() => handlePurchase("standard")}
      />

      <CertificateOption
        name="Professional Certificate"
        price="$149"
        features={["Everything above", "Project review", "Mentor feedback"]}
        onPurchase={() => handlePurchase("professional")}
      />
    </div>
  );
}
```

---

## 🚀 QUICK LAUNCH CHECKLIST

### Week 1:

- [ ] Set up Stripe account
- [ ] Create products in Stripe Dashboard
- [ ] Add environment variables
- [ ] Build pricing page
- [ ] Implement checkout flow
- [ ] Add webhook handler
- [ ] Test with Stripe test mode

### Week 2:

- [ ] Add freemium limits (3 courses/month)
- [ ] Show upgrade prompts
- [ ] Implement feature gates
- [ ] Add certificate sales
- [ ] Create admin revenue dashboard

### Week 3:

- [ ] Switch to Stripe live mode
- [ ] Launch! 🚀
- [ ] Monitor conversions
- [ ] Optimize pricing

---

## 📈 EXPECTED RESULTS

### Conservative Estimate (Month 3):

- **1,000 users** total
- **10% conversion** to premium = 100 paid users
- **$29/month** average = **$2,900 MRR**
- **Infrastructure cost**: $5/month
- **Profit**: $2,895/month

### Aggressive Estimate (Month 6):

- **10,000 users** total
- **15% conversion** = 1,500 paid users
- **Average $35/month** (mix of premium & pro) = **$52,500 MRR**
- **Infrastructure cost**: $50/month
- **Profit**: $52,450/month

### Target (Month 12):

- **100,000 users** total
- **20% conversion** = 20,000 paid users
- **Average $40/month** = **$800,000 MRR**
- **$9.6M ARR** 🚀

---

## 💰 THE BEAUTY OF THIS MODEL

1. **Low Infrastructure Cost**: $5-50/month
2. **High Margins**: 99%+ profit margins
3. **Recurring Revenue**: Predictable MRR
4. **Multiple Streams**: Subscriptions + Certificates + API
5. **Scalability**: More users = more revenue (not more costs!)

---

**Status**: Ready to monetize
**Timeline**: Launch in 1 week
**Revenue Target**: $10K MRR in 3 months
**Let's make money!** 💰🚀
