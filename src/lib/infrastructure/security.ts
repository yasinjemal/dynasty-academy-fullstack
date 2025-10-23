/**
 * 🛡️ SECURITY MIDDLEWARE
 * Production-grade security hardening
 */

import { NextRequest, NextResponse } from "next/server";
import { getCache, setCache, incrementCache, CacheKeys } from "./redis";
import { logSecurity } from "./logger";

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export const RateLimits = {
  API: { windowMs: 60000, maxRequests: 100 }, // 100 req/min
  AUTH: { windowMs: 900000, maxRequests: 5 }, // 5 req/15min
  STRICT: { windowMs: 60000, maxRequests: 10 }, // 10 req/min
} as const;

/**
 * Rate limiter middleware
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
  // Get identifier (IP or user ID)
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const key = `${CacheKeys.API_RESPONSE}ratelimit:${identifier}:${req.nextUrl.pathname}`;

  // Get current count
  const count = await incrementCache(key, 1);

  // Set expiry on first request
  if (count === 1) {
    const redis = await import("./redis").then((m) => m.getRedisClient());
    await redis.pexpire(key, config.windowMs);
  }

  const limited = count > config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - count);
  const resetTime = Date.now() + config.windowMs;

  if (limited) {
    logSecurity(`Rate limit exceeded`, "medium", {
      identifier,
      path: req.nextUrl.pathname,
      count,
    });
  }

  return { limited, remaining, resetTime };
}

/**
 * Apply rate limit to API route
 */
export async function withRateLimit(
  req: NextRequest,
  config: RateLimitConfig = RateLimits.API
): Promise<NextResponse | null> {
  const { limited, remaining, resetTime } = await rateLimit(req, config);

  if (limited) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(resetTime),
        },
      }
    );
  }

  return null;
}

/**
 * IP allowlist/blocklist
 */
const blockedIPs = new Set<string>();
const allowedIPs = new Set<string>();

export function blockIP(ip: string): void {
  blockedIPs.add(ip);
  logSecurity(`IP blocked: ${ip}`, "high");
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);
  logSecurity(`IP unblocked: ${ip}`, "medium");
}

export function allowIP(ip: string): void {
  allowedIPs.add(ip);
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function isIPAllowed(ip: string): boolean {
  return allowedIPs.size === 0 || allowedIPs.has(ip);
}

/**
 * Check IP restrictions
 */
export function checkIPRestrictions(req: NextRequest): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isIPBlocked(ip)) {
    logSecurity(`Blocked IP attempted access: ${ip}`, "high", {
      path: req.nextUrl.pathname,
    });
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  if (!isIPAllowed(ip)) {
    logSecurity(`Non-allowed IP attempted access: ${ip}`, "medium", {
      path: req.nextUrl.pathname,
    });
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  return null;
}

/**
 * CORS configuration
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 hours
};

/**
 * Security headers (Helmet-style)
 */
export const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
};

/**
 * Apply security headers to response
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Input sanitization
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate request body size
 */
export function validateBodySize(
  body: any,
  maxSizeKB: number = 100
): boolean {
  const size = JSON.stringify(body).length / 1024;
  return size <= maxSizeKB;
}

/**
 * SQL injection detection (basic)
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b).*=.*('|")/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * XSS detection (basic)
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize request
 */
export function validateRequest(
  body: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check body size
  if (!validateBodySize(body, 500)) {
    errors.push("Request body too large");
  }

  // Check for SQL injection in string values
  const checkForInjection = (obj: any, path: string = "") => {
    if (typeof obj === "string") {
      if (detectSQLInjection(obj)) {
        errors.push(`Potential SQL injection detected at ${path}`);
        logSecurity(`SQL injection attempt detected`, "critical", { path });
      }
      if (detectXSS(obj)) {
        errors.push(`Potential XSS detected at ${path}`);
        logSecurity(`XSS attempt detected`, "critical", { path });
      }
    } else if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        checkForInjection(value, path ? `${path}.${key}` : key);
      });
    }
  };

  checkForInjection(body);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * API key validation
 */
export function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key");
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) return true; // No API key configured

  return apiKey === validApiKey;
}

/**
 * Comprehensive security middleware
 */
export async function securityMiddleware(
  req: NextRequest
): Promise<NextResponse | null> {
  // Check IP restrictions
  const ipRestriction = checkIPRestrictions(req);
  if (ipRestriction) return ipRestriction;

  // Apply rate limiting
  const rateLimit = await withRateLimit(req);
  if (rateLimit) return rateLimit;

  // Validate API key for protected routes
  if (req.nextUrl.pathname.startsWith("/api/admin/")) {
    if (!validateApiKey(req)) {
      logSecurity(`Invalid API key attempt`, "high", {
        path: req.nextUrl.pathname,
      });
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }
  }

  return null;
}
