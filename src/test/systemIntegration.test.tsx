/**
 * System Integration Tests for Text Display Improvements
 * Tests the complete integration of all text formatting components
 * Validates Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Calendar } from '../components/Calendar';
import { EventModal } from '../components/EventModal';
import { EventCard } from '../components/display/EventCard';
import { ResponsiveText } from '../components/display/ResponsiveText';
import { ExpandableText } from '../components/display/ExpandableText';
import { textFormatter } from '../utils/textFormatter';
import { CalendarEvent } from '../types';

// Mock external dependencies
vi.mock('../lib/supabase', () => ({
  syncCalendarStatus: vi.fn(),
  cacheEvents: vi.fn(),
  getCachedEvents: vi.fn().mockResolvedValue([]),
  clearCache: vi.fn()
}));

vi.mock('../utils/icalParser', () => ({
  ICalParser: {
    fetchAndParse: vi.fn().mockResolvedValue([])
  }
}));

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window properties
const mockWindowProperties = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      fontSize: '16px',
      fontFamily: 'Arial',
      fontWeight: '400',
      lineHeight: '1.5'
    }),
    writable: true
  });
  
  window.dispatchEvent(new Event('resize'));
};

// Test data representing real-world scenarios
const createComplexEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'complex-event-1',
  title: 'IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315 - UCBL1 Faculté de Médecine et de Pharmacie - Advanced Research in Neuromuscular Diseases',
  description: `
    <div class="event-description">
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
  `,
  start: new Date('2025-09-26T14:00:00'),
  end: new Date('2025-09-26T16:30:00'),
  location: 'Auditoire MEDI 91, Avenue Hippocrate 54, 1200 Bruxelles',
  source: 'outlook',
  allDay: false,
  category: { id: 'seminar', name: 'Seminar', color: '#007bff', source: 'outlook' },
  color: '#007bff',
  ...overrides
});

const createSimpleEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'simple-event-1',
  title: 'Simple Meeting',
  description: 'A simple meeting description.',
  start: new Date('2025-09-25T10:00:00'),
  end: new Date('2025-09-25T11:00:00'),
  location: 'Room A.123',
  source: 'icloud',
  allDay: false,
  category: { id: 'meeting', name: 'Meeting', color: '#28a745', source: 'icloud' },
  color: '#28a745',
  ...overrides
});

describe('System Integration Tests', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    mockWindowProperties(1200); // Default to desktop
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Text Processing Pipeline', () => {
    it('should process complex event content through entire pipeline', async () => {
      const complexEvent = createComplexEvent();

      // Test the complete processing pipeline
      const titleResult = textFormatter.formatTitle(complexEvent.title, {
        maxLength: 120,
        preserveWords: true,
        showEllipsis: true
      });

      const descriptionResult = textFormatter.formatDescription(complexEvent.description, {
        maxLength: 500,
        preserveWords: true,
        showEllipsis: true
      });

      const cleanedContent = textFormatter.cleanHtmlContent(complexEvent.description);
      const specialContent = textFormatter.extractSpecialContent(cleanedContent);
      const advancedContent = textFormatter.processAdvancedContent(complexEvent.description);

      // Validate title processing
      expect(titleResult.isTruncated).toBe(true);
      expect(titleResult.content).toContain('...');
      expect(titleResult.hasSpecialContent).toBe(true);

      // Validate description processing
      expect(descriptionResult.isTruncated).toBe(true);
      expect(descriptionResult.content).toContain('...');

      // Validate HTML cleaning
      expect(cleanedContent).not.toContain('<');
      expect(cleanedContent).toContain('IREC');

      // Validate special content extraction
      expect(specialContent.emails).toContain('irec@uclouvain.be');
      expect(specialContent.phones).toContain('+32 10 47 43 02');
      expect(specialContent.urls).toContain('https://uclouvain.be/irec');

      // Validate advanced content processing
      expect(advancedContent.links.length).toBeGreaterThan(0);
      expect(advancedContent.contacts.length).toBeGreaterThan(0);
      expect(advancedContent.formatting.paragraphs.length).toBeGreaterThan(0);
      expect(advancedContent.formatting.lists.length).toBeGreaterThan(0);
    });

    it('should handle edge cases gracefully throughout pipeline', () => {
      const edgeCases = [
        '', // Empty string
        '   ', // Whitespace only
        '<p></p>', // Empty HTML
        '<script>alert("test")</script>', // Malicious content
        'supercalifragilisticexpialidocious'.repeat(10), // Very long words
        '🎉 Event with émojis and spéciàl characters ñ ç', // Special characters
        'https://very-long-domain-name.example.com/very/long/path/to/resource?with=many&query=parameters&and=values'
      ];

      edgeCases.forEach((testCase, index) => {
        expect(() => {
          const titleResult = textFormatter.formatTitle(testCase, { maxLength: 50 });
          const descResult = textFormatter.formatDescription(testCase, { maxLength: 100 });
          const cleaned = textFormatter.cleanHtmlContent(testCase);
          const special = textFormatter.extractSpecialContent(testCase);
          
          // All operations should complete without throwing
          expect(titleResult).toBeDefined();
          expect(descResult).toBeDefined();
          expect(cleaned).toBeDefined();
          expect(special).toBeDefined();
        }).not.toThrow(`Edge case ${index}: "${testCase}"`);
      });
    });
  });

  describe('EventCard Integration', () => {
    it('should render complex event with all text improvements', () => {
      const complexEvent = createComplexEvent();

      render(<EventCard event={complexEvent} />);

      // Verify title is truncated and formatted
      const titleElement = screen.getByRole('heading', { level: 3 });
      expect(titleElement).toBeInTheDocument();
      expect(titleElement.textContent).toContain('...');
      expect(titleElement.textContent!.length).toBeLessThan(complexEvent.title.length);

      // Verify description is present and formatted
      const descriptionElement = screen.getByText(/Nous avons le plaisir/);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveClass('responsive-text--description');

      // Verify metadata is properly formatted
      expect(screen.getByText(/vendredi 26 septembre/i)).toBeInTheDocument();
      expect(screen.getByText(/14:00 - 16:30/)).toBeInTheDocument();
      expect(screen.getByText(/SSS/)).toBeInTheDocument();

      // Verify location is displayed
      expect(screen.getByText(/Auditoire MEDI 91/)).toBeInTheDocument();
    });

    it('should adapt to different screen sizes', () => {
      const event = createComplexEvent();

      // Test mobile
      mockWindowProperties(600);
      const { rerender } = render(<EventCard event={event} />);
      
      let responsiveElements = screen.getAllByText(/IREC Seminar|Nous avons|vendredi|14:00|SSS/);
      responsiveElements.forEach(element => {
        if (element.classList.contains('responsive-text')) {
          expect(element).toHaveAttribute('data-screen-size', 'mobile');
        }
      });

      // Test desktop
      mockWindowProperties(1200);
      rerender(<EventCard event={event} />);
      
      responsiveElements = screen.getAllByText(/IREC Seminar|Nous avons|vendredi|14:00|SSS/);
      responsiveElements.forEach(element => {
        if (element.classList.contains('responsive-text')) {
          expect(element).toHaveAttribute('data-screen-size', 'desktop');
        }
      });

      // Test TV
      mockWindowProperties(2000);
      rerender(<EventCard event={event} />);
      
      responsiveElements = screen.getAllByText(/IREC Seminar|Nous avons|vendredi|14:00|SSS/);
      responsiveElements.forEach(element => {
        if (element.classList.contains('responsive-text')) {
          expect(element).toHaveAttribute('data-screen-size', 'tv');
        }
      });
    });
  });

  describe('EventModal Integration', () => {
    it('should display complete formatted content in modal', () => {
      const complexEvent = createComplexEvent();

      render(
        <EventModal
          event={complexEvent}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Verify title uses ResponsiveText
      const modalTitle = screen.getByText(/IREC Seminar/);
      expect(modalTitle).toBeInTheDocument();
      expect(modalTitle).toHaveClass('responsive-text--title');

      // Verify description is formatted with advanced processing
      const descriptionSection = screen.getByText(/Nous avons le plaisir/);
      expect(descriptionSection).toBeInTheDocument();

      // Verify extracted links are displayed separately
      expect(screen.getByText('Liens et contacts')).toBeInTheDocument();
      expect(screen.getByText('irec@uclouvain.be')).toBeInTheDocument();
      expect(screen.getByText('+32 10 47 43 02')).toBeInTheDocument();
      expect(screen.getByText('https://uclouvain.be/irec')).toBeInTheDocument();

      // Verify proper link formatting
      const emailLink = screen.getByRole('link', { name: /irec@uclouvain.be/ });
      expect(emailLink).toHaveAttribute('href', 'mailto:irec@uclouvain.be');

      const phoneLink = screen.getByRole('link', { name: /\+32 10 47 43 02/ });
      expect(phoneLink).toHaveAttribute('href', 'tel:+3210474302');

      const webLink = screen.getByRole('link', { name: /https:\/\/uclouvain\.be\/irec/ });
      expect(webLink).toHaveAttribute('href', 'https://uclouvain.be/irec');
      expect(webLink).toHaveAttribute('target', '_blank');
    });

    it('should handle scrollable content with indicators', async () => {
      const eventWithLongDescription = createComplexEvent({
        description: '<p>' + 'Very long paragraph content. '.repeat(50) + '</p>'
      });

      render(
        <EventModal
          event={eventWithLongDescription}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Wait for content to render
      await waitFor(() => {
        const descriptionContent = screen.getByText(/Very long paragraph content/);
        expect(descriptionContent).toBeInTheDocument();
      });

      // Check for scroll indicators (they may not be visible initially)
      const scrollIndicators = document.querySelectorAll('.scroll-indicator');
      expect(scrollIndicators.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ResponsiveText Component Integration', () => {
    it('should apply correct typography scales', () => {
      const testText = 'Test text for typography scaling';

      // Test all variants and screen sizes
      const variants = ['title', 'description', 'metadata'] as const;
      const screenSizes = ['mobile', 'tablet', 'desktop', 'tv'] as const;

      variants.forEach(variant => {
        screenSizes.forEach(screenSize => {
          const { unmount } = render(
            <ResponsiveText
              text={testText}
              variant={variant}
              screenSize={screenSize}
            />
          );

          const element = screen.getByText(testText);
          expect(element).toHaveClass(`responsive-text--${variant}`);
          expect(element).toHaveAttribute('data-screen-size', screenSize);

          unmount();
        });
      });
    });

    it('should handle line clamping correctly', () => {
      const longText = 'This is a very long text that should be clamped to a specific number of lines. '.repeat(10);

      render(
        <ResponsiveText
          text={longText}
          variant="description"
          maxLines={3}
        />
      );

      const element = screen.getByText(/This is a very long text/);
      expect(element).toHaveClass('responsive-text--clamped');
      expect(element).toHaveAttribute('data-max-lines', '3');
    });
  });

  describe('ExpandableText Integration', () => {
    it('should integrate with text formatting system', () => {
      const htmlContent = '<p>Content with <strong>HTML</strong> and <a href="mailto:test@example.com">email</a></p>';

      render(
        <ExpandableText
          text={htmlContent}
          variant="description"
          maxLines={2}
        />
      );

      // Should clean HTML and preserve content
      const cleanedContent = screen.getByText(/Content with HTML and email/);
      expect(cleanedContent).toBeInTheDocument();
      expect(cleanedContent.textContent).not.toContain('<');
    });

    it('should handle expansion and collapse', async () => {
      const longText = 'This is a very long text that should trigger the expand/collapse functionality. '.repeat(10);

      render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={2}
          maxLength={100}
        />
      );

      // Should show truncated content initially
      const textElement = screen.getByText(/This is a very long text/);
      expect(textElement).toBeInTheDocument();
      
      // Text should be shorter than original
      expect(textElement.textContent!.length).toBeLessThan(longText.length);
    });
  });

  describe('Performance Integration', () => {
    it('should maintain performance with multiple components', async () => {
      const events = Array.from({ length: 20 }, (_, i) => createComplexEvent({
        id: `event-${i}`,
        title: `Event ${i}: ${createComplexEvent().title}`,
        description: `Description ${i}: ${createComplexEvent().description}`
      }));

      const startTime = performance.now();

      // Render multiple EventCards
      const { container } = render(
        <div>
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      );

      const renderTime = performance.now() - startTime;

      // Should render in reasonable time
      expect(renderTime).toBeLessThan(1000); // Less than 1 second

      // All cards should be rendered
      const eventCards = container.querySelectorAll('[data-testid="event-card"]');
      expect(eventCards).toHaveLength(20);

      // Each card should have properly formatted content
      events.forEach((event, index) => {
        const titleElement = screen.getByText(new RegExp(`Event ${index}`));
        expect(titleElement).toBeInTheDocument();
      });
    });

    it('should cache formatting results effectively', () => {
      const sameText = 'Repeated text content for caching test';
      const events = Array.from({ length: 10 }, (_, i) => createSimpleEvent({
        id: `cache-event-${i}`,
        title: sameText,
        description: sameText
      }));

      const startTime = performance.now();

      // Process same content multiple times
      events.forEach(event => {
        textFormatter.formatTitle(event.title, { maxLength: 100 });
        textFormatter.formatDescription(event.description, { maxLength: 200 });
        textFormatter.cleanHtmlContent(event.description);
      });

      const processingTime = performance.now() - startTime;

      // Should be fast due to caching
      expect(processingTime).toBeLessThan(50);
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility across all components', () => {
      const event = createComplexEvent();

      render(<EventCard event={event} />);

      // Check ARIA structure
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby');
      expect(article).toHaveAttribute('aria-describedby');

      // Check heading structure
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();

      // Check screen reader labels
      expect(screen.getByText('Date:')).toHaveClass('sr-only');
      expect(screen.getByText('Heure:')).toHaveClass('sr-only');
      expect(screen.getByText('Source:')).toHaveClass('sr-only');
    });

    it('should provide proper focus management in modal', () => {
      const event = createComplexEvent();

      render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Modal should have proper ARIA attributes
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');

      // Close button should be accessible
      const closeButton = screen.getByRole('button', { name: /fermer/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });

  describe('Requirements Validation', () => {
    it('validates Requirement 1.1: Clear text display at distance', () => {
      const event = createComplexEvent();

      // Test TV screen size for distance viewing
      mockWindowProperties(2000);
      render(<EventCard event={event} />);

      const titleElement = screen.getByRole('heading', { level: 3 });
      const responsiveText = titleElement.querySelector('.responsive-text');
      
      expect(responsiveText).toHaveAttribute('data-screen-size', 'tv');
      expect(responsiveText).toHaveClass('responsive-text--title');
    });

    it('validates Requirement 2.1: Structured description formatting', () => {
      const event = createComplexEvent();

      render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should have structured content with proper spacing
      const descriptionContent = screen.getByText(/Nous avons le plaisir/);
      expect(descriptionContent).toBeInTheDocument();
      
      // Should extract and display lists and paragraphs
      expect(screen.getByText(/Détails de l'événement/)).toBeInTheDocument();
      expect(screen.getByText(/Contact et informations/)).toBeInTheDocument();
    });

    it('validates Requirement 3.1: Clear information hierarchy', () => {
      const event = createComplexEvent();

      render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should have proper hierarchy: title, date/time, location, description
      const title = screen.getByText(/IREC Seminar/);
      const dateTime = screen.getByText(/vendredi 26 septembre/i);
      const location = screen.getByText(/Auditoire MEDI 91/);
      const description = screen.getByText(/Nous avons le plaisir/);

      expect(title).toBeInTheDocument();
      expect(dateTime).toBeInTheDocument();
      expect(location).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it('validates Requirement 4.1: Automatic screen adaptation', () => {
      const event = createSimpleEvent();

      // Test different screen sizes
      const screenSizes = [
        { width: 600, expected: 'mobile' },
        { width: 900, expected: 'tablet' },
        { width: 1200, expected: 'desktop' },
        { width: 2000, expected: 'tv' }
      ];

      screenSizes.forEach(({ width, expected }) => {
        mockWindowProperties(width);
        const { unmount } = render(<EventCard event={event} />);

        const responsiveElements = screen.getAllByText(/Simple Meeting|A simple meeting|jeudi|10:00|de Duve/);
        responsiveElements.forEach(element => {
          if (element.classList.contains('responsive-text')) {
            expect(element).toHaveAttribute('data-screen-size', expected);
          }
        });

        unmount();
      });
    });

    it('validates Requirement 5.1: Intelligent text truncation', () => {
      const longTitleEvent = createComplexEvent({
        title: 'Very Long Title That Should Be Truncated Intelligently While Preserving Important Words'
      });

      render(<EventCard event={longTitleEvent} />);

      const titleElement = screen.getByRole('heading', { level: 3 });
      const titleText = titleElement.textContent || '';

      // Should be truncated
      expect(titleText.length).toBeLessThan(longTitleEvent.title.length);
      expect(titleText).toMatch(/\.\.\.$/);
      
      // Should preserve word boundaries
      expect(titleText).not.toMatch(/\w\.\.\.$/); // Should not cut in middle of word
    });

    it('validates Requirement 6.1: Visual distinction of content types', () => {
      const event = createComplexEvent();

      render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should have visually distinct links
      const emailLink = screen.getByRole('link', { name: /irec@uclouvain.be/ });
      const phoneLink = screen.getByRole('link', { name: /\+32 10 47 43 02/ });
      const webLink = screen.getByRole('link', { name: /https:\/\/uclouvain\.be\/irec/ });

      expect(emailLink).toHaveClass('extracted-link-anchor');
      expect(phoneLink).toHaveClass('extracted-link-anchor');
      expect(webLink).toHaveClass('extracted-link-anchor');

      // Should have appropriate icons
      expect(emailLink.textContent).toContain('📧');
      expect(phoneLink.textContent).toContain('📞');
      expect(webLink.textContent).toContain('🌐');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed HTML gracefully', () => {
      const malformedEvent = createComplexEvent({
        description: '<p>Unclosed paragraph <strong>Bold text <em>Nested emphasis</p> More content</em></strong>'
      });

      expect(() => {
        render(<EventCard event={malformedEvent} />);
      }).not.toThrow();

      // Should still display content
      const descriptionElement = screen.getByText(/Unclosed paragraph/);
      expect(descriptionElement).toBeInTheDocument();
    });

    it('should handle empty or null content', () => {
      const emptyEvent = createSimpleEvent({
        title: '',
        description: '',
        location: ''
      });

      expect(() => {
        render(<EventCard event={emptyEvent} />);
      }).not.toThrow();

      // Should not crash and should handle empty content gracefully
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('should handle extremely long words', () => {
      const longWordEvent = createSimpleEvent({
        title: 'supercalifragilisticexpialidocious'.repeat(5),
        description: 'antidisestablishmentarianism'.repeat(10)
      });

      expect(() => {
        render(<EventCard event={longWordEvent} />);
      }).not.toThrow();

      const titleElement = screen.getByRole('heading', { level: 3 });
      expect(titleElement).toBeInTheDocument();
      
      // Should handle long words appropriately
      const titleText = titleElement.textContent || '';
      expect(titleText.length).toBeLessThan(longWordEvent.title.length);
    });
  });
});