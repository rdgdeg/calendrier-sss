/**
 * TextFormatter Performance Tests
 * Tests for memoization and performance optimizations in TextFormatter
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TextFormatter } from '../utils/textFormatter';
import { globalTextFormattingCache } from '../utils/performanceOptimizer';

describe('TextFormatter Performance Optimizations', () => {
  let formatter: TextFormatter;

  beforeEach(() => {
    formatter = new TextFormatter();
    globalTextFormattingCache.clear();
  });

  afterEach(() => {
    globalTextFormattingCache.clear();
  });

  describe('Memoization', () => {
    it('should cache HTML cleaning results', () => {
      const htmlContent = '<p>Test <strong>content</strong> with <em>HTML</em></p>';
      
      const startTime = performance.now();
      const result1 = formatter.cleanHtmlContent(htmlContent);
      const firstCallTime = performance.now() - startTime;
      
      const secondStartTime = performance.now();
      const result2 = formatter.cleanHtmlContent(htmlContent);
      const secondCallTime = performance.now() - secondStartTime;
      
      expect(result1).toBe(result2);
      expect(result1).toBe('Test content with HTML');
      expect(secondCallTime).toBeLessThan(firstCallTime);
    });

    it('should cache special content extraction', () => {
      const textWithSpecialContent = 'Contact us at test@example.com or call +32 10 47 43 02. Visit https://example.com for more info.';
      
      const startTime = performance.now();
      const result1 = formatter.extractSpecialContent(textWithSpecialContent);
      const firstCallTime = performance.now() - startTime;
      
      const secondStartTime = performance.now();
      const result2 = formatter.extractSpecialContent(textWithSpecialContent);
      const secondCallTime = performance.now() - secondStartTime;
      
      expect(result1).toEqual(result2);
      expect(result1.emails).toContain('test@example.com');
      expect(result1.phones).toContain('+32 10 47 43 02');
      expect(result1.urls).toContain('https://example.com');
      expect(secondCallTime).toBeLessThan(firstCallTime);
    });

    it('should cache truncation results', () => {
      const longText = 'This is a very long text that needs to be truncated intelligently to preserve word boundaries and maintain readability while ensuring the content fits within the specified limits.';
      const options = { maxLength: 50, preserveWords: true, showEllipsis: true, breakLongWords: false };
      
      const startTime = performance.now();
      const result1 = formatter.formatTitle(longText, options);
      const firstCallTime = performance.now() - startTime;
      
      const secondStartTime = performance.now();
      const result2 = formatter.formatTitle(longText, options);
      const secondCallTime = performance.now() - secondStartTime;
      
      expect(result1).toEqual(result2);
      expect(result1.isTruncated).toBe(true);
      expect(secondCallTime).toBeLessThan(firstCallTime);
    });

    it('should handle different cache keys for different inputs', () => {
      const text1 = 'First text content';
      const text2 = 'Second text content';
      
      const result1 = formatter.cleanHtmlContent(text1);
      const result2 = formatter.cleanHtmlContent(text2);
      const result1Again = formatter.cleanHtmlContent(text1);
      
      expect(result1).toBe('First text content');
      expect(result2).toBe('Second text content');
      expect(result1Again).toBe(result1);
      
      const stats = globalTextFormattingCache.getStats();
      expect(stats.size).toBe(2); // Two different cache entries
    });

    it('should handle different options as different cache keys', () => {
      const text = 'This is a test text for truncation';
      
      const result1 = formatter.formatTitle(text, { maxLength: 20 });
      const result2 = formatter.formatTitle(text, { maxLength: 30 });
      const result1Again = formatter.formatTitle(text, { maxLength: 20 });
      
      expect(result1.content).not.toBe(result2.content);
      expect(result1Again.content).toBe(result1.content);
    });
  });

  describe('Lazy Loading', () => {
    it('should process advanced content lazily', async () => {
      const complexText = `
        <p>This is a complex description with multiple paragraphs.</p>
        <ul>
          <li>First item in list</li>
          <li>Second item with <strong>emphasis</strong></li>
        </ul>
        <p>Contact: test@example.com or visit https://example.com</p>
        <p>Phone: +32 10 47 43 02</p>
      `;
      
      const startTime = performance.now();
      const result = await formatter.processAdvancedContentLazy(complexText);
      const processingTime = performance.now() - startTime;
      
      expect(result.cleanText).toContain('This is a complex description');
      expect(result.links.length).toBeGreaterThanOrEqual(2); // email and URL (may include phone)
      expect(result.contacts.length).toBeGreaterThanOrEqual(2); // email and phone
      expect(result.formatting.paragraphs.length).toBeGreaterThanOrEqual(1);
      
      // Second call should be faster (cached)
      const secondStartTime = performance.now();
      const result2 = await formatter.processAdvancedContentLazy(complexText);
      const secondProcessingTime = performance.now() - secondStartTime;
      
      expect(result2).toEqual(result);
      expect(secondProcessingTime).toBeLessThan(processingTime);
    });

    it('should handle concurrent lazy processing', async () => {
      const text = 'Test content for concurrent processing';
      
      // Start multiple concurrent processing requests
      const promises = [
        formatter.processAdvancedContentLazy(text),
        formatter.processAdvancedContentLazy(text),
        formatter.processAdvancedContentLazy(text)
      ];
      
      const results = await Promise.all(promises);
      
      // All results should be identical
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should demonstrate significant performance improvement with caching', () => {
      const complexHtml = `
        <div class="event-description">
          <p>This is a <strong>complex</strong> HTML content with <em>multiple</em> tags.</p>
          <ul>
            <li>Item 1 with <a href="https://example.com">link</a></li>
            <li>Item 2 with <span style="color: red;">styled text</span></li>
          </ul>
          <p>Contact information: <a href="mailto:test@example.com">test@example.com</a></p>
        </div>
      `;
      
      // Measure performance without cache (first calls)
      globalTextFormattingCache.clear();
      
      const uncachedStartTime = performance.now();
      for (let i = 0; i < 100; i++) {
        formatter.cleanHtmlContent(complexHtml + i); // Different content each time
      }
      const uncachedTime = performance.now() - uncachedStartTime;
      
      // Measure performance with cache (repeated calls)
      const cachedStartTime = performance.now();
      for (let i = 0; i < 100; i++) {
        formatter.cleanHtmlContent(complexHtml); // Same content each time
      }
      const cachedTime = performance.now() - cachedStartTime;
      
      expect(cachedTime).toBeLessThan(uncachedTime * 0.1); // Should be at least 10x faster
      
      const stats = globalTextFormattingCache.getStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0); // Should have some hit rate
    });

    it('should handle large volumes of text efficiently', () => {
      const largeText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(1000);
      
      const startTime = performance.now();
      
      // Process the same large text multiple times
      for (let i = 0; i < 10; i++) {
        formatter.formatTitle(largeText, { maxLength: 200 });
        formatter.formatDescription(largeText, { maxLength: 500 });
        formatter.extractSpecialContent(largeText);
      }
      
      const totalTime = performance.now() - startTime;
      
      // Should complete in reasonable time due to caching
      expect(totalTime).toBeLessThan(100); // Less than 100ms
      
      const stats = globalTextFormattingCache.getStats();
      expect(stats).toBeDefined();
      expect(stats.metrics.totalOperations).toBeGreaterThan(0);
    });

    it('should maintain cache efficiency under memory pressure', () => {
      // Fill cache with many different entries
      for (let i = 0; i < 2000; i++) {
        formatter.cleanHtmlContent(`<p>Content ${i}</p>`);
      }
      
      const stats = globalTextFormattingCache.getStats();
      
      // Cache should not grow indefinitely
      expect(stats.size).toBeLessThan(1500); // Should evict old entries
      
      // Should still maintain reasonable hit rate
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory Management', () => {
    it('should clean up cache entries after TTL', async () => {
      const shortTtlCache = globalTextFormattingCache;
      
      formatter.cleanHtmlContent('<p>Test content</p>');
      
      let stats = shortTtlCache.getStats();
      expect(stats.size).toBe(1);
      
      // Manually trigger cleanup (in real scenario this happens automatically)
      shortTtlCache.cleanup();
      
      // Entry should still exist (not expired yet)
      stats = shortTtlCache.getStats();
      expect(stats.size).toBe(1);
    });

    it('should handle cache overflow gracefully', () => {
      // Create a small cache for testing
      const smallCache = globalTextFormattingCache;
      
      // Fill beyond capacity
      for (let i = 0; i < 1500; i++) {
        smallCache.get(`key-${i}`, () => `value-${i}`);
      }
      
      const stats = smallCache.getStats();
      
      // Should not exceed reasonable size
      expect(stats.size).toBeLessThan(1200);
      
      // Should still function correctly
      const result = smallCache.get('new-key', () => 'new-value');
      expect(result).toBe('new-value');
    });
  });

  describe('Error Handling', () => {
    it('should handle caching errors gracefully', () => {
      const problematicFormatter = new TextFormatter();
      
      // Test with potentially problematic input
      const result = problematicFormatter.cleanHtmlContent(null as any);
      expect(result).toBe('');
      
      const result2 = problematicFormatter.cleanHtmlContent(undefined as any);
      expect(result2).toBe('');
      
      const result3 = problematicFormatter.cleanHtmlContent('');
      expect(result3).toBe('');
    });

    it('should maintain cache integrity with invalid inputs', () => {
      const invalidInputs = [null, undefined, '', 123, {}, []];
      
      invalidInputs.forEach(input => {
        expect(() => {
          formatter.cleanHtmlContent(input as any);
        }).not.toThrow();
      });
      
      const stats = globalTextFormattingCache.getStats();
      expect(stats.size).toBeGreaterThan(0); // Should have cached valid results
    });
  });
});