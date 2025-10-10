/**
 * Dynasty Built Academy - Intelligent Caching System
 * Adaptive caching that learns from usage patterns
 */

interface CacheEntry {
  key: string
  value: any
  hits: number
  lastAccess: Date
  createdAt: Date
  ttl: number // Time to live in milliseconds
  size: number // Approximate size in bytes
}

export class SmartCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number = 100 * 1024 * 1024 // 100MB
  private currentSize: number = 0
  private hitCount: number = 0
  private missCount: number = 0

  /**
   * Adaptive TTL based on access patterns
   */
  private calculateAdaptiveTTL(key: string, baseTTL: number): number {
    const existing = this.cache.get(key)
    
    if (!existing) return baseTTL
    
    // Frequently accessed items get longer TTL
    const accessFrequency = existing.hits / 
      ((Date.now() - existing.createdAt.getTime()) / (1000 * 60 * 60)) // hits per hour
    
    if (accessFrequency > 10) return baseTTL * 3 // Very hot data
    if (accessFrequency > 5) return baseTTL * 2 // Hot data
    if (accessFrequency < 1) return baseTTL * 0.5 // Cold data
    
    return baseTTL
  }

  /**
   * Intelligent cache eviction using LFU + LRU hybrid
   */
  private evict() {
    if (this.cache.size === 0) return

    // Calculate score for each entry
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      const age = Date.now() - entry.lastAccess.getTime()
      const frequency = entry.hits
      
      // Lower score = more likely to evict
      // Combines frequency (LFU) and recency (LRU)
      const score = frequency / (Math.log(age + 1) + 1)
      
      return { key, entry, score }
    })

    // Sort by score (ascending)
    entries.sort((a, b) => a.score - b.score)

    // Evict lowest 20%
    const evictCount = Math.ceil(entries.length * 0.2)
    for (let i = 0; i < evictCount; i++) {
      const { key, entry } = entries[i]
      this.cache.delete(key)
      this.currentSize -= entry.size
    }

    console.log(`🗑️ Evicted ${evictCount} entries, freed ${(this.currentSize / 1024 / 1024).toFixed(2)}MB`)
  }

  /**
   * Set with intelligent caching
   */
  async set(key: string, value: any, ttl: number = 3600000): Promise<void> {
    const size = this.estimateSize(value)
    
    // Check if we need to evict
    if (this.currentSize + size > this.maxSize) {
      this.evict()
    }

    const adaptiveTTL = this.calculateAdaptiveTTL(key, ttl)

    this.cache.set(key, {
      key,
      value,
      hits: 0,
      lastAccess: new Date(),
      createdAt: new Date(),
      ttl: adaptiveTTL,
      size
    })

    this.currentSize += size
  }

  /**
   * Get with hit tracking
   */
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      this.missCount++
      return null
    }

    // Check if expired
    if (Date.now() - entry.createdAt.getTime() > entry.ttl) {
      this.cache.delete(key)
      this.currentSize -= entry.size
      this.missCount++
      return null
    }

    // Update hit tracking
    entry.hits++
    entry.lastAccess = new Date()
    this.hitCount++

    return entry.value
  }

  /**
   * Delete a specific cache entry
   */
  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.currentSize -= entry.size
      return true
    }
    return false
  }

  /**
   * Cache warming - pre-load popular content
   */
  async warmCache(popularKeys: string[], fetcher: (key: string) => Promise<any>) {
    console.log(`🔥 Warming cache with ${popularKeys.length} popular items...`)

    const results = await Promise.allSettled(
      popularKeys.map(async key => {
        const value = await fetcher(key)
        await this.set(key, value, 7200000) // 2 hour TTL for popular content
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    console.log(`✅ Warmed ${successful}/${popularKeys.length} cache entries`)
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.hitCount / (this.hitCount + this.missCount) || 0

    return {
      size: this.cache.size,
      memoryUsage: `${(this.currentSize / 1024 / 1024).toFixed(2)}MB`,
      maxMemory: `${(this.maxSize / 1024 / 1024).toFixed(2)}MB`,
      utilization: `${((this.currentSize / this.maxSize) * 100).toFixed(1)}%`,
      hitRate: `${(hitRate * 100).toFixed(1)}%`,
      hits: this.hitCount,
      misses: this.missCount
    }
  }

  /**
   * Estimate object size in bytes
   */
  private estimateSize(obj: any): number {
    const str = JSON.stringify(obj)
    return new Blob([str]).size
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear()
    this.currentSize = 0
    console.log('🗑️ Cache cleared')
  }

  /**
   * Remove expired entries (periodic cleanup)
   */
  cleanup() {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt.getTime() > entry.ttl) {
        this.cache.delete(key)
        this.currentSize -= entry.size
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired entries`)
    }
  }
}

// Singleton instance
export const smartCache = new SmartCache()

// Auto-cleanup every 5 minutes
setInterval(() => {
  smartCache.cleanup()
}, 5 * 60 * 1000)
