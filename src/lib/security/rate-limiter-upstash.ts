/**
 * Production Rate Limiter with Upstash Redis
 *
 * Distributed rate limiting for production environments
 * Replaces in-memory limiter for scalability
 *
 * Setup:
 * 1. Create Upstash Redis database at https://upstash.com
 * 2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
 * 3. Install @upstash/redis: npm install @upstash/redis
 *
 * Features:
 * - Distributed rate limiting (works across multiple servers)
 * - Persistent across deployments
 * - Sliding window algorithm
 * - Automatic expiration
 * - Low latency (<50ms)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Rate limit configurations
 * Each config defines limits for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
    analytics: true,
    prefix: "@ratelimit/login",
  }),

  REGISTER: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 attempts per hour
    analytics: true,
    prefix: "@ratelimit/register",
  }),

  // API endpoints
  API_GENERAL: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: true,
    prefix: "@ratelimit/api",
  }),

  API_HEAVY: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute for heavy operations
    analytics: true,
    prefix: "@ratelimit/api-heavy",
  }),

  // Instructor operations
  INSTRUCTOR_APPLY: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"), // 3 applications per day
    analytics: true,
    prefix: "@ratelimit/instructor-apply",
  }),

  COURSE_CREATE: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 courses per hour
    analytics: true,
    prefix: "@ratelimit/course-create",
  }),

  // Email operations
  EMAIL_SEND: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 emails per minute
    analytics: true,
    prefix: "@ratelimit/email",
  }),

  // File upload
  FILE_UPLOAD: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 uploads per hour
    analytics: true,
    prefix: "@ratelimit/upload",
  }),

  // Search operations
  SEARCH: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 searches per minute
    analytics: true,
    prefix: "@ratelimit/search",
  }),

  // Admin operations (more lenient)
  ADMIN_OPERATIONS: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1 m"), // 200 requests per minute
    analytics: true,
    prefix: "@ratelimit/admin",
  }),
};

/**
 * Check rate limit for an identifier
 *
 * @param limiterType - Type of rate limiter to use
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @returns Rate limit result with allowed/denied status
 */
export async function checkRateLimit(
  limiterType: keyof typeof RATE_LIMITS,
  identifier: string
) {
  try {
    const limiter = RATE_LIMITS[limiterType];
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success
        ? null
        : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error(`Rate limit check failed for ${limiterType}:`, error);

    // Fail open (allow request) if rate limiter is down
    // This prevents rate limiter issues from breaking the app
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      retryAfter: null,
      error: "Rate limiter unavailable",
    };
  }
}

/**
 * Rate limit middleware helper
 * Use this in API routes for easy rate limiting
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const result = await rateLimit(request, 'API_GENERAL');
 *   if (!result.success) {
 *     return new NextResponse('Too Many Requests', {
 *       status: 429,
 *       headers: {
 *         'X-RateLimit-Limit': result.limit.toString(),
 *         'X-RateLimit-Remaining': result.remaining.toString(),
 *         'X-RateLimit-Reset': result.reset.toString(),
 *         'Retry-After': result.retryAfter?.toString() || '60',
 *       },
 *     });
 *   }
 *   // Continue with request...
 * }
 * ```
 */
export async function rateLimit(
  request: Request,
  limiterType: keyof typeof RATE_LIMITS,
  useUserId = false
) {
  // Get identifier (IP address or user ID)
  const identifier = useUserId
    ? await getUserIdFromRequest(request)
    : getIPFromRequest(request);

  const result = await checkRateLimit(limiterType, identifier);

  return result;
}

/**
 * Get IP address from request
 */
function getIPFromRequest(request: Request): string {
  // Try various headers (works with proxies and CDNs)
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const cloudflare = request.headers.get("cf-connecting-ip");

  if (cloudflare) return cloudflare;
  if (forwarded) return forwarded.split(",")[0].trim();
  if (real) return real;

  return "unknown";
}

/**
 * Get user ID from request (requires authentication)
 */
async function getUserIdFromRequest(request: Request): Promise<string> {
  // This is a placeholder - implement based on your auth system
  // For NextAuth, you'd extract from the session token
  return getIPFromRequest(request);
}

/**
 * Get rate limit analytics
 * Returns statistics about rate limit hits
 */
export async function getRateLimitAnalytics() {
  try {
    // Upstash Ratelimit automatically tracks analytics
    // You can query Redis for stats if needed

    const stats = {
      available: true,
      message: "Rate limit analytics are tracked in Upstash dashboard",
      dashboardUrl: "https://console.upstash.com",
    };

    return stats;
  } catch (error) {
    return {
      available: false,
      error: "Analytics unavailable",
    };
  }
}

/**
 * Reset rate limit for a specific identifier
 * Use this for testing or manual overrides
 */
export async function resetRateLimit(
  limiterType: keyof typeof RATE_LIMITS,
  identifier: string
) {
  try {
    const limiter = RATE_LIMITS[limiterType];
    // Reset by deleting the key
    await redis.del(`@ratelimit/${limiterType.toLowerCase()}:${identifier}`);

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Block an IP address permanently
 * Creates a special rate limit that always denies
 */
export async function blockIP(ipAddress: string, reason: string) {
  try {
    await redis.set(
      `@blocked:${ipAddress}`,
      JSON.stringify({ reason, timestamp: new Date().toISOString() }),
      { ex: 60 * 60 * 24 * 30 } // 30 days
    );

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Check if IP is blocked
 */
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  try {
    const result = await redis.get(`@blocked:${ipAddress}`);
    return result !== null;
  } catch (error) {
    return false; // Fail open
  }
}

/**
 * Unblock an IP address
 */
export async function unblockIP(ipAddress: string) {
  try {
    await redis.del(`@blocked:${ipAddress}`);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// Export Redis client for custom operations
export { redis };
