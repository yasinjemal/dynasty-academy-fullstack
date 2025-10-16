/**
 * 💰 DYNASTY PAYMENT SYSTEM
 * Stripe Integration + Freemium Logic
 *
 * Revenue Streams:
 * 1. Premium Subscriptions ($29/month)
 * 2. Professional ($99/month)
 * 3. Certificates ($49-$499)
 * 4. API Access (usage-based)
 * 5. Enterprise (custom)
 */

import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

// ============================================================================
// PRICING PLANS
// ============================================================================

export const PRICING_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month" as const,
    features: {
      coursesPerMonth: 3,
      booksPerMonth: 5,
      certificates: false,
      aiInsights: "basic",
      support: "community",
      downloads: false,
      analytics: false,
    },
  },

  PREMIUM: {
    id: "premium",
    name: "Premium",
    price: 29,
    priceAnnual: 290, // Save $58
    interval: "month" as const,
    stripeMonthly: process.env.STRIPE_PREMIUM_MONTHLY!,
    stripeAnnual: process.env.STRIPE_PREMIUM_ANNUAL!,
    features: {
      coursesPerMonth: Infinity,
      booksPerMonth: Infinity,
      certificates: true,
      aiInsights: "advanced",
      support: "priority",
      downloads: true,
      analytics: true,
      studyGroups: true,
      careerPath: true,
    },
  },

  PROFESSIONAL: {
    id: "professional",
    name: "Professional",
    price: 99,
    priceAnnual: 990, // Save $198
    interval: "month" as const,
    stripeMonthly: process.env.STRIPE_PRO_MONTHLY!,
    stripeAnnual: process.env.STRIPE_PRO_ANNUAL!,
    features: {
      ...PRICING_PLANS.PREMIUM.features,
      aiCoaching: true,
      mentorship: true,
      verifiedCertificates: true,
      jobBoard: true,
      resumeAI: true,
      apiAccess: true,
      teamDashboard: true,
    },
  },

  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    price: 5000,
    interval: "month" as const,
    custom: true,
    features: {
      ...PRICING_PLANS.PROFESSIONAL.features,
      unlimitedUsers: true,
      customBranding: true,
      sso: true,
      dedicatedSupport: true,
      customDevelopment: true,
      dataExport: true,
    },
  },
} as const;

// ============================================================================
// CERTIFICATE PRICING
// ============================================================================

export const CERTIFICATE_PRICING = {
  STANDARD: {
    id: "cert_standard",
    name: "Standard Certificate",
    price: 49,
    stripePriceId: process.env.STRIPE_CERT_STANDARD!,
    features: [
      "Course completion badge",
      "Skills verification",
      "LinkedIn-ready",
      "PDF download",
    ],
  },

  PROFESSIONAL: {
    id: "cert_professional",
    name: "Professional Certificate",
    price: 149,
    stripePriceId: process.env.STRIPE_CERT_PROFESSIONAL!,
    features: [
      "Everything in Standard",
      "Portfolio project review",
      "Industry mentor feedback",
      "Employer verification letter",
    ],
  },

  MASTER: {
    id: "cert_master",
    name: "Master Certificate",
    price: 499,
    stripePriceId: process.env.STRIPE_CERT_MASTER!,
    features: [
      "Everything in Professional",
      "Capstone project",
      "3-month mentorship",
      "Job placement assistance",
      "Lifetime career support",
    ],
  },

  BLOCKCHAIN: {
    id: "cert_blockchain",
    name: "Blockchain Certificate (NFT)",
    price: 99,
    stripePriceId: process.env.STRIPE_CERT_BLOCKCHAIN!,
    features: [
      "Tamper-proof credential",
      "On-chain verification",
      "Transferable ownership",
      "Permanent record",
    ],
  },
} as const;

// ============================================================================
// FREEMIUM ENFORCEMENT
// ============================================================================

export class FreemiumGuard {
  /**
   * Check if user can access a course
   */
  static async canAccessCourse(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    upgradeUrl?: string;
  }> {
    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    });

    // Premium users get unlimited access
    if (user?.isPremium && user?.subscriptionStatus === "active") {
      return { allowed: true };
    }

    // Check free tier limits
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const coursesThisMonth = await prisma.courseEnrollment.count({
      where: {
        userId,
        enrolledAt: { gte: thisMonth },
      },
    });

    const limit = PRICING_PLANS.FREE.features.coursesPerMonth;

    if (coursesThisMonth >= limit) {
      return {
        allowed: false,
        reason: `You've reached your ${limit} course limit this month. Upgrade for unlimited access!`,
        upgradeUrl: "/pricing?from=course-limit",
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can download content
   */
  static async canDownload(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, subscriptionStatus: true },
    });

    return user?.isPremium && user?.subscriptionStatus === "active";
  }

  /**
   * Check if user can access AI features
   */
  static async canUseAI(
    userId: string,
    feature: "basic" | "advanced"
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    });

    if (feature === "basic") {
      return true; // Everyone gets basic AI
    }

    return user?.isPremium && user?.subscriptionStatus === "active";
  }

  /**
   * Check if user can purchase certificates
   */
  static async canBuyCertificate(
    userId: string,
    courseId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Must have completed the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId,
        courseId,
        status: "completed",
      },
    });

    if (!enrollment) {
      return {
        allowed: false,
        reason: "You must complete the course first",
      };
    }

    // Check if already purchased
    const existing = await prisma.certificate.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      return {
        allowed: false,
        reason: "You already have a certificate for this course",
      };
    }

    return { allowed: true };
  }
}

// ============================================================================
// STRIPE CHECKOUT
// ============================================================================

export class PaymentService {
  /**
   * Create subscription checkout session
   */
  static async createSubscriptionCheckout(
    userId: string,
    plan: "premium" | "professional",
    interval: "month" | "year"
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });

    if (!user) throw new Error("User not found");

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId },
      });
      customerId = customer.id;

      // Save customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Get price ID
    const planConfig =
      plan === "premium" ? PRICING_PLANS.PREMIUM : PRICING_PLANS.PROFESSIONAL;
    const priceId =
      interval === "year" ? planConfig.stripeAnnual : planConfig.stripeMonthly;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
      metadata: {
        userId,
        plan,
        interval,
      },
    });

    return session;
  }

  /**
   * Create certificate purchase checkout
   */
  static async createCertificateCheckout(
    userId: string,
    courseId: string,
    certificateType: keyof typeof CERTIFICATE_PRICING
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    if (!user || !course) throw new Error("User or course not found");

    // Get or create customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const cert = CERTIFICATE_PRICING[certificateType];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: cert.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/courses/${courseId}/certificate?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/courses/${courseId}?payment=cancelled`,
      metadata: {
        userId,
        courseId,
        certificateType,
        courseName: course.title,
      },
    });

    return session;
  }

  /**
   * Handle successful subscription
   */
  static async handleSubscriptionSuccess(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    const subscription = session.subscription as Stripe.Subscription;

    if (!userId || !plan) throw new Error("Missing metadata");

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        subscriptionTier: plan,
        subscriptionStatus: "active",
        subscriptionId: subscription.id,
        subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Track conversion
    await prisma.conversionEvent.create({
      data: {
        userId,
        eventType: "subscription_created",
        plan,
        amount: session.amount_total! / 100,
        metadata: { sessionId, subscriptionId: subscription.id },
      },
    });

    return { success: true, userId, plan };
  }

  /**
   * Handle successful certificate purchase
   */
  static async handleCertificatePurchase(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const { userId, courseId, certificateType, courseName } = session.metadata!;

    if (!userId || !courseId || !certificateType) {
      throw new Error("Missing metadata");
    }

    // Create certificate record
    const cert =
      CERTIFICATE_PRICING[certificateType as keyof typeof CERTIFICATE_PRICING];

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        type: certificateType,
        courseName,
        issuedAt: new Date(),
        verificationCode: generateVerificationCode(),
        // Generate PDF URL
        pdfUrl: `/api/certificates/${userId}/${courseId}/download`,
      },
    });

    // Track revenue
    await prisma.revenue.create({
      data: {
        userId,
        type: "certificate",
        amount: cert.price,
        metadata: { certificateId: certificate.id, sessionId },
      },
    });

    return { success: true, certificate };
  }
}

// ============================================================================
// REVENUE TRACKING
// ============================================================================

export class RevenueAnalytics {
  /**
   * Get MRR (Monthly Recurring Revenue)
   */
  static async getMRR(): Promise<number> {
    const activeSubscriptions = await prisma.user.count({
      where: {
        isPremium: true,
        subscriptionStatus: "active",
      },
    });

    // Calculate weighted average (mix of premium and professional)
    const breakdown = await prisma.user.groupBy({
      by: ["subscriptionTier"],
      where: {
        isPremium: true,
        subscriptionStatus: "active",
      },
      _count: true,
    });

    let mrr = 0;
    breakdown.forEach((tier) => {
      if (tier.subscriptionTier === "premium") {
        mrr += tier._count * PRICING_PLANS.PREMIUM.price;
      } else if (tier.subscriptionTier === "professional") {
        mrr += tier._count * PRICING_PLANS.PROFESSIONAL.price;
      }
    });

    return mrr;
  }

  /**
   * Get conversion funnel metrics
   */
  static async getConversionMetrics() {
    const totalUsers = await prisma.user.count();
    const premiumUsers = await prisma.user.count({
      where: { isPremium: true, subscriptionStatus: "active" },
    });

    const conversionRate = (premiumUsers / totalUsers) * 100;

    // Calculate LTV
    const avgRetentionMonths = 8; // From churn analysis
    const avgRevenue =
      premiumUsers > 0 ? (await this.getMRR()) / premiumUsers : 0;
    const ltv = avgRevenue * avgRetentionMonths;

    return {
      totalUsers,
      premiumUsers,
      conversionRate: conversionRate.toFixed(2) + "%",
      ltv: ltv.toFixed(2),
      mrr: await this.getMRR(),
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateVerificationCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `DYNASTY-${timestamp}-${random}`.toUpperCase();
}

// ============================================================================
// EXPORTS
// ============================================================================

export { stripe };
export default PaymentService;
