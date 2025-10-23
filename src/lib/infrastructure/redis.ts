/**
 * ⚡ REDIS CACHING LAYER
 * High-performance caching for Dynasty Nexus
 */

import Redis from "ioredis";

// Redis connection singleton
let redis: Redis | null = null;

/**
 * Get Redis client (singleton)
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true; // reconnect
        }
        return false;
      },
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected");
    });

    redis.on("error", (err) => {
      console.error("❌ Redis error:", err);
    });

    redis.on("close", () => {
      console.warn("⚠️ Redis connection closed");
    });
  }

  return redis;
}

/**
 * Cache key prefixes for organization
 */
export const CacheKeys = {
  USER: "user:",
  COURSE: "course:",
  LESSON: "lesson:",
  ANALYTICS: "analytics:",
  METRICS: "metrics:",
  AB_TEST: "ab_test:",
  FUNNEL: "funnel:",
  SESSION: "session:",
  REVENUE: "revenue:",
  API_RESPONSE: "api:",
} as const;

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const;

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);

    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Cache GET error:", error);
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = CacheTTL.MEDIUM
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);

    if (ttl > 0) {
      await client.setex(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }

    return true;
  } catch (error) {
    console.error("Cache SET error:", error);
    return false;
  }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Cache DELETE error:", error);
    return false;
  }
}

/**
 * Delete multiple cached values by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);

    if (keys.length === 0) return 0;

    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.error("Cache DELETE PATTERN error:", error);
    return 0;
  }
}

/**
 * Check if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Cache EXISTS error:", error);
    return false;
  }
}

/**
 * Get remaining TTL for key
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    const client = getRedisClient();
    return await client.ttl(key);
  } catch (error) {
    console.error("Cache TTL error:", error);
    return -1;
  }
}

/**
 * Increment counter (atomic)
 */
export async function incrementCache(
  key: string,
  amount: number = 1
): Promise<number> {
  try {
    const client = getRedisClient();
    return await client.incrby(key, amount);
  } catch (error) {
    console.error("Cache INCREMENT error:", error);
    return 0;
  }
}

/**
 * Get or set pattern (cache-aside)
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const fresh = await fetchFn();

  // Store in cache
  await setCache(key, fresh, ttl);

  return fresh;
}

/**
 * Cache warming - preload data
 */
export async function warmCache(
  keys: Array<{ key: string; fetchFn: () => Promise<any>; ttl?: number }>
): Promise<void> {
  try {
    await Promise.all(
      keys.map(({ key, fetchFn, ttl }) => getOrSetCache(key, fetchFn, ttl))
    );
    console.log(`✅ Warmed ${keys.length} cache entries`);
  } catch (error) {
    console.error("Cache warming error:", error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  keys: number;
  memory: string;
  hits: number;
  misses: number;
  hitRate: string;
}> {
  try {
    const client = getRedisClient();
    const info = await client.info("stats");
    const dbInfo = await client.info("keyspace");

    // Parse stats
    const hitsMatch = info.match(/keyspace_hits:(\d+)/);
    const missesMatch = info.match(/keyspace_misses:(\d+)/);
    const keysMatch = dbInfo.match(/keys=(\d+)/);

    const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
    const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
    const keys = keysMatch ? parseInt(keysMatch[1]) : 0;

    const total = hits + misses;
    const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) : "0.00";

    // Get memory usage
    const memoryInfo = await client.info("memory");
    const memoryMatch = memoryInfo.match(/used_memory_human:(.+)/);
    const memory = memoryMatch ? memoryMatch[1].trim() : "Unknown";

    return {
      keys,
      memory,
      hits,
      misses,
      hitRate: `${hitRate}%`,
    };
  } catch (error) {
    console.error("Get cache stats error:", error);
    return {
      keys: 0,
      memory: "Unknown",
      hits: 0,
      misses: 0,
      hitRate: "0.00%",
    };
  }
}

/**
 * Flush all cache (use with caution!)
 */
export async function flushCache(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.flushall();
    console.log("✅ Cache flushed");
    return true;
  } catch (error) {
    console.error("Cache flush error:", error);
    return false;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("✅ Redis connection closed");
  }
}

/**
 * Health check
 */
export async function isRedisHealthy(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const pong = await client.ping();
    return pong === "PONG";
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
}
