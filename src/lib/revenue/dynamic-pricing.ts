/**
 * 💰 DYNAMIC PRICING ENGINE
 * Real-time price optimization based on multiple factors
 */

import { prisma } from "@/lib/prisma";

export interface PricingContext {
  userId?: string;
  userSegment?: string; // "new", "returning", "premium", "whale"
  location?: string;
  deviceType?: string; // "mobile", "desktop", "tablet"
  timeOfDay?: number; // 0-23
  dayOfWeek?: number; // 0-6
  isWeekend?: boolean;
  referralSource?: string;
  cartValue?: number;
  isFirstPurchase?: boolean;
}

export interface PricingRule {
  condition: string; // "timeOfDay", "dayOfWeek", "userSegment", "demand", etc
  operator: string; // "equals", "greaterThan", "lessThan", "in", etc
  value: any;
  multiplier: number; // 0.8 = 20% off, 1.2 = 20% premium
  priority: number; // Higher = applied first
  active: boolean;
}

export interface CalculatedPrice {
  basePrice: number;
  finalPrice: number;
  discount?: number;
  discountPercent?: number;
  appliedRules: string[];
  reason?: string;
  expiresAt?: Date;
}

/**
 * Calculate optimized price for a product
 */
export async function calculateDynamicPrice(
  productId: string,
  productType: "course" | "book" | "bundle" | "subscription",
  context: PricingContext = {}
): Promise<CalculatedPrice> {
  // Get pricing rules for this product
  const pricingRule = await prisma.pricingRule.findFirst({
    where: {
      productId,
      active: true,
    },
  });

  if (!pricingRule) {
    // No rules defined, return base price (fetch from product)
    const basePrice = await getProductBasePrice(productId, productType);
    return {
      basePrice,
      finalPrice: basePrice,
      appliedRules: [],
      reason: "Base price - no pricing rules active",
    };
  }

  const basePrice = pricingRule.basePrice;
  let finalPrice = basePrice;
  const appliedRules: string[] = [];

  // Parse and apply pricing rules
  const rules = pricingRule.rules as PricingRule[];
  const activeRules = rules
    .filter((r) => r.active)
    .sort((a, b) => b.priority - a.priority); // Apply high priority first

  for (const rule of activeRules) {
    if (evaluateCondition(rule, context)) {
      finalPrice *= rule.multiplier;
      appliedRules.push(rule.condition);
    }
  }

  // Apply safety limits
  if (pricingRule.minPrice && finalPrice < pricingRule.minPrice) {
    finalPrice = pricingRule.minPrice;
    appliedRules.push("minimum_price_floor");
  }
  if (pricingRule.maxPrice && finalPrice > pricingRule.maxPrice) {
    finalPrice = pricingRule.maxPrice;
    appliedRules.push("maximum_price_ceiling");
  }

  // Round to 2 decimals
  finalPrice = Math.round(finalPrice * 100) / 100;

  const discount = basePrice - finalPrice;
  const discountPercent =
    discount > 0 ? Math.round((discount / basePrice) * 100) : undefined;

  return {
    basePrice,
    finalPrice,
    discount: discount > 0 ? discount : undefined,
    discountPercent,
    appliedRules,
    reason: generatePriceReason(appliedRules),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };
}

/**
 * Evaluate if a pricing rule condition is met
 */
function evaluateCondition(rule: PricingRule, context: PricingContext): boolean {
  const { condition, operator, value } = rule;

  // Time-based rules
  if (condition === "timeOfDay" && context.timeOfDay !== undefined) {
    return evaluateOperator(context.timeOfDay, operator, value);
  }

  if (condition === "dayOfWeek" && context.dayOfWeek !== undefined) {
    return evaluateOperator(context.dayOfWeek, operator, value);
  }

  if (condition === "isWeekend") {
    return context.isWeekend === value;
  }

  // User-based rules
  if (condition === "userSegment" && context.userSegment) {
    if (operator === "equals") return context.userSegment === value;
    if (operator === "in") return value.includes(context.userSegment);
  }

  if (condition === "isFirstPurchase") {
    return context.isFirstPurchase === value;
  }

  // Cart-based rules
  if (condition === "cartValue" && context.cartValue !== undefined) {
    return evaluateOperator(context.cartValue, operator, value);
  }

  // Device-based rules
  if (condition === "deviceType" && context.deviceType) {
    return context.deviceType === value;
  }

  // Location-based rules
  if (condition === "location" && context.location) {
    return context.location === value;
  }

  // Default: condition not met
  return false;
}

/**
 * Evaluate comparison operators
 */
function evaluateOperator(
  contextValue: any,
  operator: string,
  ruleValue: any
): boolean {
  switch (operator) {
    case "equals":
      return contextValue === ruleValue;
    case "greaterThan":
      return contextValue > ruleValue;
    case "lessThan":
      return contextValue < ruleValue;
    case "greaterThanOrEqual":
      return contextValue >= ruleValue;
    case "lessThanOrEqual":
      return contextValue <= ruleValue;
    case "in":
      return Array.isArray(ruleValue) && ruleValue.includes(contextValue);
    case "notIn":
      return Array.isArray(ruleValue) && !ruleValue.includes(contextValue);
    default:
      return false;
  }
}

/**
 * Generate human-readable price reason
 */
function generatePriceReason(appliedRules: string[]): string {
  if (appliedRules.length === 0) return "Standard pricing";

  const reasons: string[] = [];

  if (appliedRules.includes("isWeekend")) reasons.push("Weekend premium");
  if (appliedRules.includes("timeOfDay")) reasons.push("Time-based pricing");
  if (appliedRules.includes("userSegment")) reasons.push("Personalized discount");
  if (appliedRules.includes("isFirstPurchase"))
    reasons.push("First-time buyer discount");
  if (appliedRules.includes("cartValue")) reasons.push("Cart value bonus");
  if (appliedRules.includes("demand")) reasons.push("High demand pricing");
  if (appliedRules.includes("minimum_price_floor")) reasons.push("Minimum price applied");
  if (appliedRules.includes("maximum_price_ceiling"))
    reasons.push("Maximum price applied");

  return reasons.join(" + ");
}

/**
 * Get product base price from database
 */
async function getProductBasePrice(
  productId: string,
  productType: string
): Promise<number> {
  // Default prices if product not found
  const defaults: Record<string, number> = {
    course: 499,
    book: 199,
    bundle: 999,
    subscription: 299,
  };

  // Try to fetch from product tables
  if (productType === "book") {
    const book = await prisma.book.findUnique({
      where: { id: productId },
      select: { price: true },
    });
    return book?.price || defaults.book;
  }

  // Add course/bundle logic here when tables exist

  return defaults[productType] || 299;
}

/**
 * Create or update pricing rule
 */
export async function createPricingRule(
  productId: string,
  productType: string,
  basePrice: number,
  rules: PricingRule[],
  options: {
    minPrice?: number;
    maxPrice?: number;
  } = {}
) {
  return prisma.pricingRule.upsert({
    where: {
      productId_productType: {
        productId,
        productType,
      },
    },
    create: {
      productId,
      productType,
      basePrice,
      currentPrice: basePrice,
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
      rules: rules as any,
      active: true,
    },
    update: {
      basePrice,
      currentPrice: basePrice,
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
      rules: rules as any,
    },
  });
}

/**
 * Track price test impression and conversion
 */
export async function trackPriceTest(
  productId: string,
  pricePoint: number,
  action: "impression" | "conversion",
  revenue?: number
) {
  const test = await prisma.priceTest.findFirst({
    where: {
      productId,
      pricePoint,
      isActive: true,
    },
  });

  if (!test) return;

  if (action === "impression") {
    await prisma.priceTest.update({
      where: { id: test.id },
      data: { impressions: { increment: 1 } },
    });
  } else if (action === "conversion") {
    const conversions = test.conversions + 1;
    const totalRevenue = test.revenue + (revenue || 0);
    const impressions = test.impressions;

    await prisma.priceTest.update({
      where: { id: test.id },
      data: {
        conversions: { increment: 1 },
        revenue: { increment: revenue || 0 },
        conversionRate: impressions > 0 ? conversions / impressions : 0,
        avgOrderValue: conversions > 0 ? totalRevenue / conversions : 0,
      },
    });
  }
}

/**
 * Get pricing context from user and request
 */
export function getPricingContext(
  userId?: string,
  userAgent?: string,
  location?: string
): PricingContext {
  const now = new Date();

  return {
    userId,
    timeOfDay: now.getHours(),
    dayOfWeek: now.getDay(),
    isWeekend: now.getDay() === 0 || now.getDay() === 6,
    deviceType: getDeviceType(userAgent),
    location,
  };
}

function getDeviceType(userAgent?: string): string {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile")) return "mobile";
  if (ua.includes("tablet")) return "tablet";
  return "desktop";
}
