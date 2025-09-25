/**
 * Performance Integration Tests
 * Tests for the overall performance improvements in text formatting and display
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TextFormatter } from '../utils/textFormatter';
import { globalTextFormattingCache, globalLazyTextProcessor } from '../utils/performanceOptimizer';

describe('Performance Integration Tests', () => {
  let formatter: TextFormatter;

  beforeEach(() => {
    formatter = new TextFormatter();
    globalTextFormattingCache.clear();
    globalLazyTextProcessor.clear();
  });

  afterEach(() => {
    globalTextFormattingCache.clear();
    globalLazyTextProcessor.clear();
  });

  describe('End-to-End Performance', () => {
    it('should demonstrate performance improvements with real-world data', () => {
      const realWorldTexts = [
        '<p>IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1 Faculté de Médecine et de Pharmacie</p>',
        '<div>Contact us at <a href="mailto:test@uclouvain.be">test@uclouvain.be</a> or call +32 10 47 43 02. Visit <a href="https://uclouvain.be">https://uclouvain.be</a> for more information.</div>',
        '<p>Rendez-vous le 26/09/2025 à 12h00 - Salle A.124</p><p>Important: Veuillez confirmer votre présence avant le 25/09/2025</p>',
        '<ul><li>First item with <strong>emphasis</strong></li><li>Second item with <em>italic text</em></li><li>Third item with <a href="http://example.com">link</a></li></ul>',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
      ];

      // First pass - no caching
      const startTime = performance.now();
      realWorldTexts.forEach(text => {
        formatter.formatTitle(text, { maxLength: 100 });
        formatter.formatDescription(text, { maxLength: 200 });
        formatter.cleanHtmlContent(text);
        formatter.extractSpecialContent(text);
      });
      const firstPassTime = performance.now() - startTime;

      // Second pass - with caching
      const cachedStartTime = performance.now();
      realWorldTexts.forEach(text => {
        formatter.formatTitle(text, { maxLength: 100 });
        formatter.formatDescription(text, { maxLength: 200 });
        formatter.cleanHtmlContent(text);
        formatter.extractSpecialContent(text);
      });
      const cachedPassTime = performance.now() - cachedStartTime;

      // Cached pass should be significantly faster
      expect(cachedPassTime).toBeLessThan(firstPassTime * 0.5);

      const stats = globalTextFormattingCache.getStats();
      expect(stats.hitRate).toBeGreaterThan(0.5);
    });

    it('should handle complex formatting operations efficiently', async () => {
      const complexText = `
        <div class="event-description">
          <h2>Séminaire IREC - Recherche Avancée</h2>
          <p>Nous avons le plaisir de vous inviter au séminaire de recherche organisé par l'Institut de Recherche Expérimentale et Clinique (IREC).</p>
          
          <h3>Détails de l'événement:</h3>
          <ul>
            <li><strong>Date:</strong> 26 septembre 2025</li>
            <li><strong>Heure:</strong> 14h00 - 16h30</li>
            <li><strong>Lieu:</strong> Auditoire MEDI 91, Avenue Hippocrate 54, 1200 Bruxelles</li>
            <li><strong>Conférencier:</strong> Prof. Élise Belaidi</li>
          </ul>
          
          <h3>Contact et informations:</h3>
          <p>Pour toute question, contactez-nous:</p>
          <ul>
            <li>Email: <a href="mailto:irec@uclouvain.be">irec@uclouvain.be</a></li>
            <li>Téléphone: <a href="tel:+3210474302">+32 10 47 43 02</a></li>
            <li>Site web: <a href="https://uclouvain.be/irec">https://uclouvain.be/irec</a></li>
          </ul>
          
          <p><em>Important:</em> Inscription obligatoire avant le 25/09/2025. Places limitées.</p>
          
          <p>Cet événement s'inscrit dans le cadre des activités de recherche de l'IREC et vise à promouvoir les échanges scientifiques entre chercheurs, cliniciens et étudiants.</p>
        </div>
      `;

      const startTime = performance.now();

      // Test all major formatting operations
      const titleResult = formatter.formatTitle(complexText, { maxLength: 120 });
      const descriptionResult = formatter.formatDescription(complexText, { maxLength: 500 });
      const cleanedText = formatter.cleanHtmlContent(complexText);
      const specialContent = formatter.extractSpecialContent(cleanedText);
      const advancedContent = await formatter.processAdvancedContentLazy(complexText);

      const processingTime = performance.now() - startTime;

      // Should complete in reasonable time
      expect(processingTime).toBeLessThan(100);

      // Verify results are correct
      expect(titleResult.isTruncated).toBe(true);
      expect(titleResult.hasSpecialContent).toBe(true);
      expect(descriptionResult.isTruncated).toBe(true);
      expect(cleanedText).not.toContain('<');
      expect(specialContent.emails).toContain('irec@uclouvain.be');
      expect(specialContent.phones).toContain('+32 10 47 43 02');
      expect(specialContent.urls).toContain('https://uclouvain.be/irec');
      expect(advancedContent.links.length).toBeGreaterThan(0);
      expect(advancedContent.contacts.length).toBeGreaterThan(0);

      // Test caching effectiveness
      const cachedStartTime = performance.now();
      await formatter.processAdvancedContentLazy(complexText);
      const cachedTime = performance.now() - cachedStartTime;

      expect(cachedTime).toBeLessThan(processingTime * 0.1);
    });

    it('should maintain performance under load', () => {
      const testTexts = Array.from({ length: 50 }, (_, i) => 
        `<p>Event ${i}: This is a test event with <strong>important</strong> information. Contact: test${i}@example.com or call +32 10 47 43 ${i.toString().padStart(2, '0')}. Visit https://example${i}.com for details.</p>`
      );

      const startTime = performance.now();

      // Process all texts multiple times
      for (let round = 0; round < 3; round++) {
        testTexts.forEach(text => {
          formatter.formatTitle(text, { maxLength: 80 });
          formatter.formatDescription(text, { maxLength: 150 });
          formatter.extractSpecialContent(text);
        });
      }

      const totalTime = performance.now() - startTime;

      // Should complete in reasonable time even with many operations
      expect(totalTime).toBeLessThan(500); // Less than 500ms for 450 operations

      const stats = globalTextFormattingCache.getStats();
      expect(stats.metrics.totalOperations).toBeGreaterThan(400);
      expect(stats.hitRate).toBeGreaterThan(0.6); // Should have good hit rate
    });

    it('should handle memory efficiently with large datasets', () => {
      const largeTexts = Array.from({ length: 200 }, (_, i) => 
        `<div>Large content ${i}: ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10)} Contact: user${i}@domain.com</div>`
      );

      const initialMemory = process.memoryUsage().heapUsed;

      // Process all texts
      largeTexts.forEach(text => {
        formatter.cleanHtmlContent(text);
        formatter.extractSpecialContent(text);
      });

      const afterProcessingMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterProcessingMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      const stats = globalTextFormattingCache.getStats();
      
      // Cache should not grow indefinitely
      expect(stats.size).toBeLessThan(500); // Should evict old entries
    });
  });

  describe('Lazy Loading Performance', () => {
    it('should process multiple items concurrently', async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        key: `item-${i}`,
        text: `<p>Complex content ${i} with <strong>formatting</strong> and <a href="mailto:test${i}@example.com">email</a></p>`
      }));

      const startTime = performance.now();

      const promises = items.map(item => 
        globalLazyTextProcessor.processLazy(
          item.key,
          () => formatter.processAdvancedContent(item.text),
          'normal'
        )
      );

      const results = await Promise.all(promises);
      const processingTime = performance.now() - startTime;

      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(200); // Should complete quickly
      
      // All results should be valid
      results.forEach(result => {
        expect(result.cleanText).toBeTruthy();
        expect(result.links.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should prioritize high-priority tasks', async () => {
      const processingOrder: string[] = [];

      const lowPriorityTask = globalLazyTextProcessor.processLazy(
        'low-priority',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 20));
          processingOrder.push('low');
          return 'low-result';
        },
        'low'
      );

      const highPriorityTask = globalLazyTextProcessor.processLazy(
        'high-priority',
        async () => {
          processingOrder.push('high');
          return 'high-result';
        },
        'high'
      );

      await Promise.all([lowPriorityTask, highPriorityTask]);

      // High priority should complete first
      expect(processingOrder[0]).toBe('high');
    });
  });

  describe('Cache Efficiency', () => {
    it('should maintain optimal cache hit rates', () => {
      const commonTexts = [
        'Common event title',
        'Another common title',
        'Frequently used description'
      ];

      // Process texts multiple times to build cache
      for (let i = 0; i < 20; i++) {
        const text = commonTexts[i % commonTexts.length];
        formatter.cleanHtmlContent(text);
        formatter.formatTitle(text, { maxLength: 50 });
      }

      const stats = globalTextFormattingCache.getStats();
      
      // Should have high hit rate for repeated content
      expect(stats.hitRate).toBeGreaterThan(0.8);
      expect(stats.metrics.cacheHits).toBeGreaterThan(stats.metrics.cacheMisses);
    });

    it('should evict old entries appropriately', () => {
      // Fill cache with many unique entries
      for (let i = 0; i < 1500; i++) {
        formatter.cleanHtmlContent(`Unique content ${i}`);
      }

      const stats = globalTextFormattingCache.getStats();
      
      // Cache should not grow indefinitely
      expect(stats.size).toBeLessThan(1200);
      
      // Should still function correctly
      const result = formatter.cleanHtmlContent('New content after eviction');
      expect(result).toBe('New content after eviction');
    });
  });
});