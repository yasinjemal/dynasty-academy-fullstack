/**
 * Redis Locking System
 * Prevents duplicate concurrent audio generation
 * Optional - gracefully degrades if Redis not configured
 */

// Dynamic import to avoid errors if ioredis not installed
let Redis: any = null
let redis: any = null

try {
  Redis = require('ioredis')
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 5000,
    })

    redis.on('error', (err: any) => {
      console.error('❌ Redis connection error:', err)
    })

    redis.on('connect', () => {
      console.log('✅ Redis connected')
    })
  } else {
    console.warn('⚠️ REDIS_URL not configured - locking disabled (OK for dev)')
  }
} catch (error) {
  console.warn('⚠️ Redis not available - locking disabled (OK for dev)')
}

const LOCK_PREFIX = 'voice:lock:'
const LOCK_TTL = 60 // 60 seconds

export interface LockResult {
  acquired: boolean
  existingTTL?: number
}

/**
 * Try to acquire a lock for audio generation
 * Returns true if lock acquired, false if already locked
 */
export async function acquireLock(contentHash: string): Promise<LockResult> {
  // If Redis not configured, always allow (dev mode)
  if (!redis) {
    return { acquired: true }
  }

  try {
    const key = `${LOCK_PREFIX}${contentHash}`

    // Try to set key with NX (only if not exists) and EX (expiry)
    const result = await redis.set(key, Date.now(), 'EX', LOCK_TTL, 'NX')

    if (result === 'OK') {
      return { acquired: true }
    }

    // Lock already exists - get its TTL
    const ttl = await redis.ttl(key)

    return {
      acquired: false,
      existingTTL: ttl > 0 ? ttl : undefined,
    }
  } catch (error) {
    console.error('❌ Redis lock error:', error)
    // On error, allow operation to proceed (fail open)
    return { acquired: true }
  }
}

/**
 * Release a lock after generation completes
 */
export async function releaseLock(contentHash: string): Promise<void> {
  if (!redis) return

  try {
    const key = `${LOCK_PREFIX}${contentHash}`
    await redis.del(key)
  } catch (error) {
    console.error('❌ Redis unlock error:', error)
    // Non-critical error - lock will expire naturally
  }
}

/**
 * Wait for an existing lock to be released
 * Polls every second up to maxWaitSeconds
 */
export async function waitForLock(
  contentHash: string,
  maxWaitSeconds: number = 30
): Promise<boolean> {
  if (!redis) return true

  const key = `${LOCK_PREFIX}${contentHash}`
  const startTime = Date.now()
  const maxWaitMs = maxWaitSeconds * 1000

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const exists = await redis.exists(key)

      if (!exists) {
        return true // Lock released
      }

      // Wait 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('❌ Redis wait error:', error)
      return true // On error, proceed
    }
  }

  return false // Timeout
}

/**
 * Check if a lock exists without acquiring it
 */
export async function checkLock(contentHash: string): Promise<boolean> {
  if (!redis) return false

  try {
    const key = `${LOCK_PREFIX}${contentHash}`
    const exists = await redis.exists(key)
    return exists === 1
  } catch (error) {
    console.error('❌ Redis check error:', error)
    return false
  }
}

/**
 * Get all active locks (for debugging)
 */
export async function getActiveLocks(): Promise<string[]> {
  if (!redis) return []

  try {
    const keys = await redis.keys(`${LOCK_PREFIX}*`)
    return keys.map((key: string) => key.replace(LOCK_PREFIX, ''))
  } catch (error) {
    console.error('❌ Redis keys error:', error)
    return []
  }
}

/**
 * Clear all locks (admin only - for debugging)
 */
export async function clearAllLocks(): Promise<number> {
  if (!redis) return 0

  try {
    const keys = await redis.keys(`${LOCK_PREFIX}*`)
    if (keys.length === 0) return 0

    const result = await redis.del(...keys)
    return result
  } catch (error) {
    console.error('❌ Redis clear error:', error)
    return 0
  }
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (!redis) return

  try {
    await redis.quit()
    console.log('✅ Redis connection closed')
  } catch (error) {
    console.error('❌ Redis close error:', error)
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null && redis.status === 'ready'
}
