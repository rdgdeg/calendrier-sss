/**
 * Performance Optimizer Tests
 * Tests for memoization, caching, and lazy loading functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  TextFormattingCache, 
  LazyTextProcessor, 
  DebouncedResizeHandler,
  globalTextFormattingCache,
  globalLazyTextProcessor,
  globalResizeHandler
} from '../utils/performanceOptimizer';

describe('TextFormattingCache', () => {
  let cache: TextFormattingCache;

  beforeEach(() => {
    cache = new TextFormattingCache({
      maxSize: 10,
      ttl: 1000,
      cleanupInterval: 100,
      enableMetrics: true
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  it('should cache and retrieve results', () => {
    const factory = vi.fn(() => 'result');
    
    const result1 = cache.get('test-key', factory);
    const result2 = cache.get('test-key', factory);
    
    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should track cache metrics', () => {
    const factory = vi.fn(() => 'result');
    
    cache.get('key1', factory);
    cache.get('key1', factory); // Cache hit
    cache.get('key2', factory); // Cache miss
    
    const metrics = cache.getMetrics();
    expect(metrics.cacheHits).toBe(1);
    expect(metrics.cacheMisses).toBe(2);
    expect(metrics.totalOperations).toBe(3);
  });

  it('should evict old entries when cache is full', () => {
    const factory = vi.fn((key: string) => `result-${key}`);
    
    // Fill cache beyond capacity
    for (let i = 0; i < 15; i++) {
      cache.get(`key-${i}`, () => factory(`key-${i}`));
    }
    
    const stats = cache.getStats();
    expect(stats.size).toBeLessThanOrEqual(10);
  });

  it('should expire entries after TTL', async () => {
    const factory = vi.fn(() => 'result');
    
    cache.get('test-key', factory);
    expect(factory).toHaveBeenCalledTimes(1);
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    cache.get('test-key', factory);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should memoize functions correctly', () => {
    const expensiveFunction = vi.fn((a: number, b: number) => a + b);
    const memoized = cache.memoize(expensiveFunction);
    
    const result1 = memoized(1, 2);
    const result2 = memoized(1, 2);
    const result3 = memoized(2, 3);
    
    expect(result1).toBe(3);
    expect(result2).toBe(3);
    expect(result3).toBe(5);
    expect(expensiveFunction).toHaveBeenCalledTimes(2);
  });

  it('should provide accurate statistics', () => {
    const factory = vi.fn(() => 'result');
    
    cache.get('key1', factory);
    cache.get('key1', factory);
    cache.get('key2', factory);
    
    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.hitRate).toBeCloseTo(0.33, 2);
    expect(stats.metrics.totalOperations).toBe(3);
  });
});

describe('LazyTextProcessor', () => {
  let processor: LazyTextProcessor;

  beforeEach(() => {
    processor = new LazyTextProcessor();
  });

  afterEach(() => {
    processor.clear();
  });

  it('should process items lazily', async () => {
    const processorFn = vi.fn(async () => 'processed');
    
    const result = await processor.processLazy('test-key', processorFn);
    
    expect(result).toBe('processed');
    expect(processorFn).toHaveBeenCalledTimes(1);
  });

  it('should cache processed results', async () => {
    const processorFn = vi.fn(async () => 'processed');
    
    const result1 = await processor.processLazy('test-key', processorFn);
    const result2 = await processor.processLazy('test-key', processorFn);
    
    expect(result1).toBe('processed');
    expect(result2).toBe('processed');
    expect(processorFn).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent processing of same key', async () => {
    const processorFn = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'processed';
    });
    
    const promise1 = processor.processLazy('test-key', processorFn);
    const promise2 = processor.processLazy('test-key', processorFn);
    
    const [result1, result2] = await Promise.all([promise1, promise2]);
    
    expect(result1).toBe('processed');
    expect(result2).toBe('processed');
    expect(processorFn).toHaveBeenCalledTimes(1);
  });

  it('should process batch items', async () => {
    const items = [
      { key: 'key1', processor: async () => 'result1' },
      { key: 'key2', processor: async () => 'result2' },
      { key: 'key3', processor: async () => 'result3' }
    ];
    
    const results = await processor.processBatch(items);
    
    expect(results).toEqual(['result1', 'result2', 'result3']);
  });

  it('should handle priority processing', async () => {
    const results: string[] = [];
    
    const lowPriorityProcessor = async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      results.push('low');
      return 'low';
    };
    
    const highPriorityProcessor = async () => {
      results.push('high');
      return 'high';
    };
    
    // Start low priority first, then high priority
    const lowPromise = processor.processLazy('low', lowPriorityProcessor, 'low');
    const highPromise = processor.processLazy('high', highPriorityProcessor, 'high');
    
    await Promise.all([lowPromise, highPromise]);
    
    // High priority should complete first despite being started later
    expect(results[0]).toBe('high');
  });

  it('should provide processing statistics', async () => {
    const processorFn = async () => 'result';
    
    const promise = processor.processLazy('test-key', processorFn);
    
    let stats = processor.getStats();
    expect(stats.queueSize).toBe(1);
    expect(stats.isProcessing).toBe(true);
    
    await promise;
    
    stats = processor.getStats();
    expect(stats.queueSize).toBe(0);
    expect(stats.cacheSize).toBe(1);
    expect(stats.isProcessing).toBe(false);
  });
});

describe('DebouncedResizeHandler', () => {
  let handler: DebouncedResizeHandler;
  let mockWindow: any;

  beforeEach(() => {
    handler = new DebouncedResizeHandler(50);
    
    // Mock window and resize events
    mockWindow = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    // Replace global window for testing
    vi.stubGlobal('window', mockWindow);
  });

  afterEach(() => {
    handler.destroy();
    vi.unstubAllGlobals();
  });

  it('should add and remove callbacks', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    const cleanup1 = handler.addCallback(callback1);
    const cleanup2 = handler.addCallback(callback2);
    
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true });
    
    cleanup1();
    cleanup2();
    
    // Should stop listening when no callbacks remain
    expect(mockWindow.removeEventListener).toHaveBeenCalled();
  });

  it('should debounce resize events', async () => {
    const callback = vi.fn();
    handler.addCallback(callback);
    
    // Get the resize handler that was added to window
    const resizeHandler = mockWindow.addEventListener.mock.calls[0][1];
    
    // Trigger multiple resize events quickly
    resizeHandler();
    resizeHandler();
    resizeHandler();
    
    // Callback should not be called immediately
    expect(callback).not.toHaveBeenCalled();
    
    // Wait for debounce delay
    await new Promise(resolve => setTimeout(resolve, 60));
    
    // Callback should be called once after debounce
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle callback errors gracefully', async () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Callback error');
    });
    const normalCallback = vi.fn();
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    handler.addCallback(errorCallback);
    handler.addCallback(normalCallback);
    
    const resizeHandler = mockWindow.addEventListener.mock.calls[0][1];
    resizeHandler();
    
    await new Promise(resolve => setTimeout(resolve, 60));
    
    expect(consoleSpy).toHaveBeenCalledWith('Error in resize callback:', expect.any(Error));
    expect(normalCallback).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});

describe('Global Performance Instances', () => {
  it('should provide global text formatting cache', () => {
    expect(globalTextFormattingCache).toBeInstanceOf(TextFormattingCache);
    
    const factory = vi.fn(() => 'result');
    const result = globalTextFormattingCache.get('test', factory);
    
    expect(result).toBe('result');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should provide global lazy text processor', async () => {
    expect(globalLazyTextProcessor).toBeInstanceOf(LazyTextProcessor);
    
    const result = await globalLazyTextProcessor.processLazy('test', () => 'processed');
    expect(result).toBe('processed');
  });

  it('should provide global resize handler', () => {
    expect(globalResizeHandler).toBeInstanceOf(DebouncedResizeHandler);
    
    const callback = vi.fn();
    const cleanup = globalResizeHandler.addCallback(callback);
    
    expect(typeof cleanup).toBe('function');
    cleanup();
  });
});

describe('Performance Benchmarks', () => {
  it('should demonstrate cache performance benefits', () => {
    const cache = new TextFormattingCache();
    const expensiveOperation = vi.fn((input: string) => {
      // Simulate expensive operation
      let result = '';
      for (let i = 0; i < 1000; i++) {
        result += input.charAt(i % input.length);
      }
      return result;
    });
    
    const memoized = cache.memoize(expensiveOperation);
    
    const startTime = performance.now();
    
    // First call - should be slow
    memoized('test-input');
    const firstCallTime = performance.now() - startTime;
    
    const secondStartTime = performance.now();
    
    // Second call - should be fast (cached)
    memoized('test-input');
    const secondCallTime = performance.now() - secondStartTime;
    
    expect(expensiveOperation).toHaveBeenCalledTimes(1);
    expect(secondCallTime).toBeLessThan(firstCallTime);
    
    cache.destroy();
  });

  it('should measure lazy processing performance', async () => {
    const processor = new LazyTextProcessor();
    
    const heavyProcessor = async (input: string) => {
      // Simulate heavy processing
      await new Promise(resolve => setTimeout(resolve, 10));
      return `processed-${input}`;
    };
    
    const startTime = performance.now();
    
    // Process multiple items
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(processor.processLazy(`item-${i}`, () => heavyProcessor(`item-${i}`)));
    }
    
    const results = await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    expect(results).toHaveLength(5);
    expect(totalTime).toBeLessThan(100); // Should complete in reasonable time
    
    processor.clear();
  });
});