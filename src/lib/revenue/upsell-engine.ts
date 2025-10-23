/**
 * 🎯 SMART UPSELL ENGINE
 * Personalized product recommendations at optimal moments
 */

import { prisma } from "@/lib/prisma";

export interface UpsellRecommendation {
  ruleId: string;
  productId: string;
  productType: string;
  offerType: string;
  discount?: number;
  message: string;
  cta: string;
  priority: number;
  reason: string;
}

export interface UpsellContext {
  userId: string;
  currentPage: string;
  cartValue?: number;
  cartItems?: string[];
  completedCourses?: string[];
  viewHistory?: string[];
  userSegment?: string;
  totalSpent?: number;
}

/**
 * Get personalized upsell recommendations
 */
export async function getUpsellRecommendations(
  context: UpsellContext,
  triggerType: "cart" | "checkout" | "post-purchase" | "mid-course" | "browse"
): Promise<UpsellRecommendation[]> {
  // Get active upsell rules for this trigger
  const rules = await prisma.upsellRule.findMany({
    where: {
      triggerType,
      active: true,
    },
    orderBy: { priority: "desc" },
  });

  const recommendations: UpsellRecommendation[] = [];

  for (const rule of rules) {
    // Check if rule conditions are met
    if (evaluateUpsellCondition(rule, context)) {
      // Get product details
      const product = await getProductDetails(rule.offerProductId);

      if (product) {
        recommendations.push({
          ruleId: rule.id,
          productId: rule.offerProductId,
          productType: product.type,
          offerType: rule.offerType,
          discount: rule.offerDiscount || undefined,
          message: rule.offerMessage || generateDefaultMessage(rule, product),
          cta: generateCTA(rule.offerType),
          priority: rule.priority,
          reason: generateRecommendationReason(rule, context),
        });
      }
    }
  }

  return recommendations;
}

/**
 * Evaluate if upsell condition is met
 */
function evaluateUpsellCondition(rule: any, context: UpsellContext): boolean {
  const conditions = rule.triggerCondition as any;

  // Check user segment
  if (conditions.userSegment && context.userSegment) {
    if (Array.isArray(conditions.userSegment)) {
      if (!conditions.userSegment.includes(context.userSegment)) return false;
    } else if (conditions.userSegment !== context.userSegment) {
      return false;
    }
  }

  // Check minimum cart value
  if (conditions.minCartValue && context.cartValue) {
    if (context.cartValue < conditions.minCartValue) return false;
  }

  // Check if user has specific product in cart
  if (conditions.hasProductInCart && context.cartItems) {
    if (!context.cartItems.includes(conditions.hasProductInCart)) return false;
  }

  // Check if user completed specific course
  if (conditions.completedCourse && context.completedCourses) {
    if (!context.completedCourses.includes(conditions.completedCourse))
      return false;
  }

  // Check time of day
  if (conditions.timeOfDay) {
    const hour = new Date().getHours();
    const [start, end] = conditions.timeOfDay;
    if (hour < start || hour > end) return false;
  }

  // Check minimum total spent
  if (conditions.minTotalSpent && context.totalSpent) {
    if (context.totalSpent < conditions.minTotalSpent) return false;
  }

  // All conditions met
  return true;
}

/**
 * Get product details
 */
async function getProductDetails(productId: string): Promise<any> {
  // Try to find in books
  const book = await prisma.book.findUnique({
    where: { id: productId },
    select: { id: true, title: true, price: true, slug: true },
  });

  if (book) {
    return { ...book, type: "book" };
  }

  // Try courses (when course table exists)
  // const course = await prisma.course.findUnique({ where: { id: productId } });

  return null;
}

/**
 * Generate default upsell message
 */
function generateDefaultMessage(rule: any, product: any): string {
  const messages: Record<string, string> = {
    upgrade: `Upgrade to ${product.title} and unlock advanced content!`,
    bundle: `Save more with our ${product.title} bundle!`,
    complementary: `You might also like ${product.title}`,
    "next-level": `Ready for the next level? Check out ${product.title}!`,
  };

  return messages[rule.offerType] || `Check out ${product.title}!`;
}

/**
 * Generate call-to-action text
 */
function generateCTA(offerType: string): string {
  const ctas: Record<string, string> = {
    upgrade: "Upgrade Now",
    bundle: "Get Bundle",
    complementary: "Add to Cart",
    "next-level": "Start Learning",
  };

  return ctas[offerType] || "Learn More";
}

/**
 * Generate recommendation reason
 */
function generateRecommendationReason(
  rule: any,
  context: UpsellContext
): string {
  if (context.completedCourses && context.completedCourses.length > 0) {
    return "Based on your completed courses";
  }

  if (context.cartItems && context.cartItems.length > 0) {
    return "Frequently bought together";
  }

  if (context.userSegment === "high-value") {
    return "Recommended for advanced learners";
  }

  return "Popular choice";
}

/**
 * Track upsell event
 */
export async function trackUpsellEvent(
  userId: string,
  ruleId: string,
  action: "shown" | "clicked" | "converted",
  context: any = {},
  revenue?: number
) {
  // Find or create event
  let event = await prisma.upsellEvent.findFirst({
    where: { userId, ruleId },
    orderBy: { timestamp: "desc" },
  });

  const now = new Date();

  if (!event && action === "shown") {
    // Create new event
    event = await prisma.upsellEvent.create({
      data: {
        userId,
        ruleId,
        triggerContext: context,
        shown: true,
        shownAt: now,
        timestamp: now,
      },
    });

    // Update rule impressions
    await prisma.upsellRule.update({
      where: { id: ruleId },
      data: { impressions: { increment: 1 } },
    });
  } else if (event) {
    // Update existing event
    const updates: any = {};

    if (action === "clicked" && !event.clicked) {
      updates.clicked = true;
      updates.clickedAt = now;

      // Update rule clicks
      await prisma.upsellRule.update({
        where: { id: ruleId },
        data: { clicks: { increment: 1 } },
      });
    }

    if (action === "converted" && !event.converted) {
      updates.converted = true;
      updates.convertedAt = now;
      updates.revenue = revenue || 0;

      // Update rule conversions and revenue
      await prisma.upsellRule.update({
        where: { id: ruleId },
        data: {
          conversions: { increment: 1 },
          revenue: { increment: revenue || 0 },
        },
      });
    }

    if (Object.keys(updates).length > 0) {
      await prisma.upsellEvent.update({
        where: { id: event.id },
        data: updates,
      });
    }
  }

  return event;
}

/**
 * Create upsell rule
 */
export async function createUpsellRule(data: {
  name: string;
  description?: string;
  triggerType: string;
  triggerCondition: any;
  offerType: string;
  offerProductId: string;
  offerDiscount?: number;
  offerMessage?: string;
  priority?: number;
}) {
  return prisma.upsellRule.create({
    data: {
      name: data.name,
      description: data.description,
      triggerType: data.triggerType,
      triggerCondition: data.triggerCondition,
      offerType: data.offerType,
      offerProductId: data.offerProductId,
      offerDiscount: data.offerDiscount,
      offerMessage: data.offerMessage,
      priority: data.priority || 0,
      active: true,
    },
  });
}

/**
 * Get upsell analytics
 */
export async function getUpsellAnalytics(ruleId?: string) {
  const where = ruleId ? { id: ruleId } : {};

  const rules = await prisma.upsellRule.findMany({
    where: { ...where, active: true },
    select: {
      id: true,
      name: true,
      triggerType: true,
      impressions: true,
      clicks: true,
      conversions: true,
      revenue: true,
    },
  });

  return rules.map((rule) => ({
    ...rule,
    clickRate:
      rule.impressions > 0 ? (rule.clicks / rule.impressions) * 100 : 0,
    conversionRate:
      rule.clicks > 0 ? (rule.conversions / rule.clicks) * 100 : 0,
    avgRevenue: rule.conversions > 0 ? rule.revenue / rule.conversions : 0,
  }));
}

/**
 * Smart bundle recommendations based on cart
 */
export async function recommendBundles(cartItems: string[]): Promise<any[]> {
  // Logic to find complementary products
  // For now, return empty (would implement based on purchase patterns)
  return [];
}

/**
 * Next-course recommendations based on completion
 */
export async function recommendNextCourse(
  userId: string,
  completedCourseId: string
): Promise<any[]> {
  // Logic to find logical next courses
  // Would analyze course difficulty, topic, and learning path
  return [];
}
