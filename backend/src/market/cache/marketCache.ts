/**
 * Market Data Cache
 * In-memory cache with TTL for market data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MarketCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly DEFAULT_TTL = 5000; // 5 seconds

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export default new MarketCache();

const marketCacheInstance = new MarketCache();

// Run cleanup every minute
setInterval(() => {
  marketCacheInstance.cleanup();
}, 60000);
