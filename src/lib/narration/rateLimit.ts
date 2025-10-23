/**
 * 🎙️ COMMUNITY NARRATOR - RATE LIMITING
 *
 * Prevents abuse through Redis-based rate limiting:
 * - Upload limits (5 per 10 minutes)
 * - Like limits (30 per 10 minutes)
 */

// TODO: Install redis package: npm install redis
// For MVP, we'll use in-memory fallback

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// In-memory fallback (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if action is rate limited.
 *
 * @param key - Unique identifier (e.g., `upload:${userId}`)
 * @param limit - Max actions allowed in window
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
    };
  }

  // Increment counter
  entry.count++;

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Rate limit for narration uploads.
 * Limit: 5 uploads per 10 minutes per user.
 */
export async function checkUploadLimit(
  userId: string
): Promise<RateLimitResult> {
  return checkRateLimit(`upload:${userId}`, 5, 10 * 60 * 1000);
}

/**
 * Rate limit for likes.
 * Limit: 30 likes per 10 minutes per user.
 */
export async function checkLikeLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`like:${userId}`, 30, 10 * 60 * 1000);
}

/**
 * Clean up expired entries (run periodically).
 */
export function cleanupExpiredLimits() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupExpiredLimits, 5 * 60 * 1000);
