/**
 * Final Integration Test for Text Display System
 * Validates the complete integration and core functionality
 */

// React import removed as JSX transform handles it
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventCard } from '../components/display/EventCard';
import { EventModal } from '../components/EventModal';
import { ResponsiveText } from '../components/display/ResponsiveText';
import { textFormatter } from '../utils/textFormatter';
import { CalendarEvent } from '../types';

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

// Test event data
const createTestEvent = (): CalendarEvent => ({
  id: 'integration-test-event',
  title: 'IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315',
  description: `
    <div>
      <p>Nous avons le plaisir de vous inviter au séminaire de recherche.</p>
      <ul>
        <li>Date: 26 septembre 2025</li>
        <li>Heure: 14h00 - 16h30</li>
      </ul>
      <p>Contact: <a href="mailto:irec@uclouvain.be">irec@uclouvain.be</a></p>
      <p>Téléphone: +32 10 47 43 02</p>
      <p>Site: https://uclouvain.be/irec</p>
    </div>
  `,
  start: new Date('2025-09-26T14:00:00'),
  end: new Date('2025-09-26T16:30:00'),
  location: 'Auditoire MEDI 91, Avenue Hippocrate 54, 1200 Bruxelles',
  source: 'outlook',
  allDay: false,
  category: { id: 'seminar', name: 'Seminar', color: '#007bff', source: 'outlook' },
  color: '#007bff'
});

describe('Final Integration Tests', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    mockWindowProperties(1200); // Desktop default
    vi.clearAllMocks();
  });

  describe('Core Text Processing Integration', () => {
    it('should process text through complete pipeline', () => {
      const testText = '<p>Test with <strong>HTML</strong> and https://example.com</p>';
      
      // Test complete processing pipeline
      const cleaned = textFormatter.cleanHtmlContent(testText);
      expect(cleaned).not.toContain('<');
      expect(cleaned).toContain('Test with HTML and https://example.com');

      const formatted = textFormatter.formatTitle(testText, { maxLength: 50 });
      expect(formatted.content).toBeDefined();
      expect(formatted.hasSpecialContent).toBe(true);

      const specialContent = textFormatter.extractSpecialContent(cleaned);
      expect(specialContent.urls).toContain('https://example.com');
    });

    it('should handle complex real-world content', () => {
      const event = createTestEvent();
      
      // Process title
      const titleResult = textFormatter.formatTitle(event.title, { maxLength: 100 });
      expect(titleResult.isTruncated).toBe(true);
      expect(titleResult.content).toContain('...');

      // Process description
      const cleanedDesc = textFormatter.cleanHtmlContent(event.description || '');
      expect(cleanedDesc).not.toContain('<');
      expect(cleanedDesc).toContain('irec@uclouvain.be');

      // Extract special content
      const specialContent = textFormatter.extractSpecialContent(cleanedDesc);
      expect(specialContent.emails).toContain('irec@uclouvain.be');
      expect(specialContent.phones).toContain('+32 10 47 43 02');
      expect(specialContent.urls).toContain('https://uclouvain.be/irec');
    });
  });

  describe('EventCard Integration', () => {
    it('should render with all text improvements', () => {
      const event = createTestEvent();
      const { container } = render(<EventCard event={event} />);

      // Check structure
      expect(container.querySelector('.event-card')).toBeInTheDocument();
      
      // Check responsive text elements
      const responsiveTexts = container.querySelectorAll('.responsive-text');
      expect(responsiveTexts.length).toBeGreaterThan(0);

      // All should have desktop screen size
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'desktop');
      });

      // Check title truncation
      const titleElement = screen.getByRole('heading', { level: 3 });
      expect(titleElement.textContent).toContain('...');
      expect(titleElement.textContent!.length).toBeLessThan(event.title.length);

      // Check description cleaning
      const descriptionElement = container.querySelector('.event-description');
      expect(descriptionElement?.textContent).not.toContain('<');
    });

    it('should adapt to different screen sizes', () => {
      const event = createTestEvent();

      // Test mobile
      mockWindowProperties(600);
      const { rerender } = render(<EventCard event={event} />);
      
      let responsiveTexts = document.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'mobile');
      });

      // Test TV
      mockWindowProperties(2000);
      rerender(<EventCard event={event} />);
      
      responsiveTexts = document.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'tv');
      });
    });
  });

  describe('EventModal Integration', () => {
    it('should display formatted content with extracted links', () => {
      const event = createTestEvent();
      
      render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Check modal structure
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Check title formatting
      const titleElement = screen.getByText(/IREC Seminar/);
      expect(titleElement).toHaveClass('responsive-text--title');

      // Check description processing
      expect(screen.getByText(/Nous avons le plaisir/)).toBeInTheDocument();

      // Check extracted links section
      expect(screen.getByText('Liens et contacts')).toBeInTheDocument();
      
      // Check specific links
      expect(screen.getByRole('link', { name: /irec@uclouvain.be/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /https:\/\/uclouvain\.be\/irec/ })).toBeInTheDocument();
    });
  });

  describe('ResponsiveText Component', () => {
    it('should apply correct typography scales', () => {
      const testText = 'Test typography scaling';
      
      const { container } = render(
        <ResponsiveText
          text={testText}
          variant="title"
          screenSize="desktop"
        />
      );

      const element = container.querySelector('.responsive-text');
      expect(element).toHaveClass('responsive-text--title');
      expect(element).toHaveAttribute('data-screen-size', 'desktop');
    });

    it('should handle line clamping', () => {
      const longText = 'Very long text for testing line clamping. '.repeat(10);
      
      const { container } = render(
        <ResponsiveText
          text={longText}
          variant="description"
          maxLines={3}
          screenSize="desktop"
        />
      );

      const element = container.querySelector('.responsive-text');
      expect(element).toHaveClass('responsive-text--clamped');
      expect(element).toHaveAttribute('data-max-lines', '3');
    });
  });

  describe('Requirements Validation', () => {
    it('validates Requirement 1.1: Clear text display', () => {
      const event = createTestEvent();
      
      // Test TV screen for distance viewing
      mockWindowProperties(2000);
      const { container } = render(<EventCard event={event} />);

      const responsiveTexts = container.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'tv');
      });
    });

    it('validates Requirement 2.1: Structured formatting', () => {
      const event = createTestEvent();
      
      render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should have structured content
      expect(screen.getByText(/Nous avons le plaisir/)).toBeInTheDocument();
      expect(screen.getByText('Date et heure')).toBeInTheDocument();
      expect(screen.getByText('Lieu')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('validates Requirement 4.1: Screen adaptation', () => {
      const event = createTestEvent();
      
      const screenSizes = [
        { width: 600, expected: 'mobile' },
        { width: 1200, expected: 'desktop' },
        { width: 2000, expected: 'tv' }
      ];

      screenSizes.forEach(({ width, expected }) => {
        mockWindowProperties(width);
        const { container, unmount } = render(<EventCard event={event} />);

        const responsiveTexts = container.querySelectorAll('.responsive-text');
        responsiveTexts.forEach(element => {
          expect(element).toHaveAttribute('data-screen-size', expected);
        });

        unmount();
      });
    });

    it('validates Requirement 5.1: Intelligent truncation', () => {
      const event = createTestEvent();
      render(<EventCard event={event} />);

      const titleElement = screen.getByRole('heading', { level: 3 });
      const titleText = titleElement.textContent || '';

      // Should be truncated
      expect(titleText.length).toBeLessThan(event.title.length);
      expect(titleText).toMatch(/\.\.\.$/);
      
      // Should preserve word boundaries
      expect(titleText).not.toMatch(/\w\.\.\.$/);
    });

    it('validates Requirement 6.1: Visual content distinction', () => {
      const event = createTestEvent();
      
      render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should have visually distinct links with icons
      const emailLink = screen.getByRole('link', { name: /irec@uclouvain.be/ });
      expect(emailLink.textContent).toContain('📧');

      const webLink = screen.getByRole('link', { name: /https:\/\/uclouvain\.be\/irec/ });
      expect(webLink.textContent).toContain('🌐');
    });
  });

  describe('Performance and Accessibility', () => {
    it('should maintain performance with multiple components', () => {
      const events = Array.from({ length: 5 }, (_, i) => ({
        ...createTestEvent(),
        id: `perf-test-${i}`,
        title: `Event ${i}: ${createTestEvent().title}`
      }));

      const startTime = performance.now();
      
      const { container } = render(
        <div>
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      );

      const renderTime = performance.now() - startTime;
      
      // Should render quickly
      expect(renderTime).toBeLessThan(500);
      
      // All cards should be present
      const eventCards = container.querySelectorAll('.event-card');
      expect(eventCards).toHaveLength(5);
    });

    it('should maintain accessibility structure', () => {
      const event = createTestEvent();
      const { container } = render(<EventCard event={event} />);

      // Check ARIA structure
      const article = container.querySelector('[role="article"]');
      expect(article).toHaveAttribute('aria-labelledby');
      expect(article).toHaveAttribute('aria-describedby');

      // Check heading structure
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();

      // Check screen reader labels
      const srOnlyElements = container.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed content gracefully', () => {
      const malformedEvent = {
        ...createTestEvent(),
        description: '<p>Unclosed <strong>tags <em>everywhere</p>'
      };

      expect(() => {
        render(<EventCard event={malformedEvent} />);
      }).not.toThrow();

      // Should still display content
      const descriptionElement = screen.getByText(/Unclosed/);
      expect(descriptionElement).toBeInTheDocument();
    });

    it('should handle empty content gracefully', () => {
      const emptyEvent = {
        ...createTestEvent(),
        title: '',
        description: '',
        location: ''
      };

      expect(() => {
        render(<EventCard event={emptyEvent} />);
      }).not.toThrow();

      // Should maintain structure
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });
  });
});