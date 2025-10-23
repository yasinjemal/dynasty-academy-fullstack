/**
 * In-memory rate limiter (for development)
 * In production, use Upstash Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request should be rate limited
   * @param identifier - Usually IP address or user ID
   * @param limit - Max requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  async checkLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No existing entry or expired - create new
    if (!entry || entry.resetTime < now) {
      const resetTime = now + windowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: limit - 1, resetTime };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    // Check if over limit
    if (entry.count > limit) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy limiter and clear interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTER: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour

  // API endpoints
  API_GENERAL: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  API_STRICT: { limit: 30, windowMs: 60 * 1000 }, // 30 requests per minute

  // Instructor actions
  INSTRUCTOR_APPLY: { limit: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 per day
  COURSE_CREATE: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  PAYOUT_REQUEST: { limit: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 per day

  // Admin actions
  ADMIN_ACTIONS: { limit: 200, windowMs: 60 * 1000 }, // 200 per minute
};

/**
 * Helper to extract identifier from request
 */
export function getIdentifier(request: Request, userId?: string): string {
  // Prefer user ID if authenticated
  if (userId) return `user:${userId}`;

  // Fall back to IP address
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * Rate limit middleware wrapper
 */
export async function rateLimit(
  request: Request,
  config: { limit: number; windowMs: number },
  identifier?: string
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const id = identifier || getIdentifier(request);
  const result = await rateLimiter.checkLimit(
    id,
    config.limit,
    config.windowMs
  );

  const headers = {
    "X-RateLimit-Limit": config.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
  };

  if (!result.allowed) {
    headers["Retry-After"] = Math.ceil(
      (result.resetTime - Date.now()) / 1000
    ).toString();
  }

  return { allowed: result.allowed, headers };
}
