/**
 * Performance Optimizer
 * Provides memoization, caching, and lazy loading utilities for text formatting operations
 */

// Cache interface for formatted text results
interface FormattedTextCache {
  [key: string]: {
    result: any;
    timestamp: number;
    accessCount: number;
  };
}

// Performance metrics interface
interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  totalOperations: number;
  averageProcessingTime: number;
  lastCleanup: number;
}

// Configuration for cache behavior
interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  cleanupInterval: number;
  enableMetrics: boolean;
}

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
  enableMetrics: true
};

/**
 * Performance-optimized cache for text formatting operations
 */
export class TextFormattingCache {
  private cache: FormattedTextCache = {};
  private metrics: PerformanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    totalOperations: 0,
    averageProcessingTime: 0,
    lastCleanup: Date.now()
  };
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.startCleanupTimer();
  }

  /**
   * Generate cache key from input parameters
   */
  private generateKey(input: string, options: any = {}): string {
    const optionsStr = JSON.stringify(options);
    return `${input.length}_${this.hashString(input)}_${this.hashString(optionsStr)}`;
  }

  /**
   * Simple hash function for string inputs
   */
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached result or execute function and cache result
   */
  get<T>(key: string, factory: () => T): T {
    const startTime = performance.now();
    
    // Check if result exists in cache and is still valid
    const cached = this.cache[key];
    if (cached && (Date.now() - cached.timestamp) < this.config.ttl) {
      cached.accessCount++;
      this.metrics.cacheHits++;
      this.metrics.totalOperations++;
      return cached.result as T;
    }

    // Execute factory function and cache result
    const result = factory();
    const endTime = performance.now();
    
    this.set(key, result);
    this.metrics.cacheMisses++;
    this.metrics.totalOperations++;
    
    // Update average processing time
    const processingTime = endTime - startTime;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.totalOperations - 1) + processingTime) / 
      this.metrics.totalOperations;

    return result;
  }

  /**
   * Set value in cache
   */
  private set<T>(key: string, value: T): void {
    // Remove oldest entries if cache is full
    if (Object.keys(this.cache).length >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache[key] = {
      result: value,
      timestamp: Date.now(),
      accessCount: 1
    };
  }

  /**
   * Memoized function wrapper
   */
  memoize<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    keyGenerator?: (...args: TArgs) => string
  ): (...args: TArgs) => TReturn {
    return (...args: TArgs): TReturn => {
      const key = keyGenerator ? keyGenerator(...args) : this.generateKey(JSON.stringify(args));
      return this.get(key, () => fn(...args));
    };
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldest(): void {
    const entries = Object.entries(this.cache);
    if (entries.length === 0) return;

    // Sort by timestamp (oldest first) and access count (least accessed first)
    entries.sort((a, b) => {
      const timestampDiff = a[1].timestamp - b[1].timestamp;
      if (timestampDiff !== 0) return timestampDiff;
      return a[1].accessCount - b[1].accessCount;
    });

    // Remove oldest 25% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.25));
    for (let i = 0; i < toRemove; i++) {
      delete this.cache[entries[i][0]];
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Object.entries(this.cache)) {
      if ((now - entry.timestamp) > this.config.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => delete this.cache[key]);
    this.metrics.lastCleanup = now;
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Get cache metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    metrics: PerformanceMetrics;
  } {
    const hitRate = this.metrics.totalOperations > 0 
      ? this.metrics.cacheHits / this.metrics.totalOperations 
      : 0;

    return {
      size: Object.keys(this.cache).length,
      hitRate,
      metrics: this.getMetrics()
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache = {};
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalOperations: 0,
      averageProcessingTime: 0,
      lastCleanup: Date.now()
    };
  }

  /**
   * Destroy cache and cleanup timers
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }
}

/**
 * Lazy loading utility for expensive text processing operations
 */
export class LazyTextProcessor {
  private processingQueue: Map<string, Promise<any>> = new Map();
  private processedResults: Map<string, any> = new Map();

  /**
   * Process text lazily with deferred execution
   */
  async processLazy<T>(
    key: string,
    processor: () => Promise<T> | T,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    // Return cached result if available
    if (this.processedResults.has(key)) {
      return this.processedResults.get(key);
    }

    // Return existing promise if already processing
    if (this.processingQueue.has(key)) {
      return this.processingQueue.get(key);
    }

    // Create processing promise
    const processingPromise = this.createProcessingPromise(key, processor, priority);
    this.processingQueue.set(key, processingPromise);

    try {
      const result = await processingPromise;
      this.processedResults.set(key, result);
      return result;
    } finally {
      this.processingQueue.delete(key);
    }
  }

  /**
   * Create processing promise with priority handling
   */
  private async createProcessingPromise<T>(
    _key: string,
    processor: () => Promise<T> | T,
    priority: 'high' | 'normal' | 'low'
  ): Promise<T> {
    // Add delay for low priority tasks to allow high priority tasks to execute first
    if (priority === 'low') {
      await new Promise(resolve => setTimeout(resolve, 10));
    } else if (priority === 'normal') {
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    return await processor();
  }

  /**
   * Batch process multiple items
   */
  async processBatch<T>(
    items: Array<{ key: string; processor: () => Promise<T> | T; priority?: 'high' | 'normal' | 'low' }>
  ): Promise<T[]> {
    const promises = items.map(item => 
      this.processLazy(item.key, item.processor, item.priority)
    );

    return Promise.all(promises);
  }

  /**
   * Clear processed results
   */
  clear(): void {
    this.processedResults.clear();
    this.processingQueue.clear();
  }

  /**
   * Get processing statistics
   */
  getStats(): {
    queueSize: number;
    cacheSize: number;
    isProcessing: boolean;
  } {
    return {
      queueSize: this.processingQueue.size,
      cacheSize: this.processedResults.size,
      isProcessing: this.processingQueue.size > 0
    };
  }
}

/**
 * Debounced resize handler for screen size changes
 */
export class DebouncedResizeHandler {
  private callbacks: Set<() => void> = new Set();
  private timeoutId?: NodeJS.Timeout;
  private isListening = false;

  constructor(private delay: number = 150) {}

  /**
   * Add callback to be executed on resize
   */
  addCallback(callback: () => void): () => void {
    this.callbacks.add(callback);
    this.startListening();

    // Return cleanup function
    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.stopListening();
      }
    };
  }

  /**
   * Start listening to resize events
   */
  private startListening(): void {
    if (this.isListening) return;

    const handleResize = () => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(() => {
        this.callbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error('Error in resize callback:', error);
          }
        });
      }, this.delay);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    this.isListening = true;
  }

  /**
   * Stop listening to resize events
   */
  private stopListening(): void {
    if (!this.isListening) return;

    window.removeEventListener('resize', this.startListening);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.isListening = false;
  }

  /**
   * Cleanup all callbacks and stop listening
   */
  destroy(): void {
    this.callbacks.clear();
    this.stopListening();
  }
}

// Global instances for shared use
export const globalTextFormattingCache = new TextFormattingCache();
export const globalLazyTextProcessor = new LazyTextProcessor();
export const globalResizeHandler = new DebouncedResizeHandler();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalTextFormattingCache.destroy();
    globalLazyTextProcessor.clear();
    globalResizeHandler.destroy();
  });
}