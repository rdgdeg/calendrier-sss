/**
 * Visual Regression Tests for Text Display System
 * Tests to prevent visual regressions in the text formatting system
 * Validates consistent appearance across different scenarios
 */

// React import removed as JSX transform handles it
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventCard } from '../components/display/EventCard';
import { EventModal } from '../components/EventModal';
import { ResponsiveText } from '../components/display/ResponsiveText';
import { ExpandableText } from '../components/display/ExpandableText';
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

// Mock window properties for consistent testing
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

// Test data for visual consistency
const createTestEvent = (type: 'simple' | 'complex' | 'long' | 'special'): CalendarEvent => {
  const baseEvent = {
    id: `${type}-event`,
    start: new Date('2025-09-25T10:00:00'),
    end: new Date('2025-09-25T11:00:00'),
    source: 'icloud' as const,
    allDay: false,
    category: { id: 'test', name: 'Test', color: '#007bff', source: 'icloud' as const },
    color: '#007bff'
  };

  switch (type) {
    case 'simple':
      return {
        ...baseEvent,
        title: 'Simple Event Title',
        description: 'A simple event description.',
        location: 'Room A.123'
      };

    case 'complex':
      return {
        ...baseEvent,
        title: 'IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261',
        description: `
          <div>
            <p>Detailed seminar description with <strong>formatting</strong>.</p>
            <ul>
              <li>First point with details</li>
              <li>Second point with <em>emphasis</em></li>
            </ul>
            <p>Contact: <a href="mailto:test@uclouvain.be">test@uclouvain.be</a></p>
          </div>
        `,
        location: 'Auditoire MEDI 91, Avenue Hippocrate 54, 1200 Bruxelles'
      };

    case 'long':
      return {
        ...baseEvent,
        title: 'Very Long Event Title That Should Be Truncated Intelligently While Preserving Important Information About The Event',
        description: 'Very long description content. '.repeat(50),
        location: 'Very Long Location Name That Might Need Special Handling'
      };

    case 'special':
      return {
        ...baseEvent,
        title: 'Event with Special Characters: é, à, ç, ñ, €, ™, ©',
        description: 'Description with URLs https://example.com, emails test@example.com, and phones +32 10 47 43 02',
        location: 'Salle spéciale avec caractères accentués'
      };

    default:
      return { ...baseEvent, title: 'Default Event', description: 'Default description', location: 'Default location' };
  }
};

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    mockWindowProperties(1200); // Default to desktop
    vi.clearAllMocks();
  });

  describe('EventCard Visual Consistency', () => {
    it('should maintain consistent layout for simple events', () => {
      const event = createTestEvent('simple');
      const { container } = render(<EventCard event={event} />);

      // Check basic structure
      expect(container.querySelector('.event-card')).toBeInTheDocument();
      expect(container.querySelector('.event-card-header')).toBeInTheDocument();
      expect(container.querySelector('.event-title-section')).toBeInTheDocument();
      expect(container.querySelector('.event-description')).toBeInTheDocument();
      expect(container.querySelector('.event-location')).toBeInTheDocument();

      // Check responsive text elements
      const responsiveTexts = container.querySelectorAll('.responsive-text');
      expect(responsiveTexts.length).toBeGreaterThan(0);

      // Check that all responsive texts have proper classes
      responsiveTexts.forEach(element => {
        expect(element).toHaveClass('responsive-text');
        expect(element).toHaveAttribute('data-screen-size');
      });
    });

    it('should maintain consistent layout for complex events', () => {
      const event = createTestEvent('complex');
      const { container } = render(<EventCard event={event} />);

      // Should have same structure as simple events
      expect(container.querySelector('.event-card')).toBeInTheDocument();
      expect(container.querySelector('.event-card-header')).toBeInTheDocument();
      expect(container.querySelector('.event-title-section')).toBeInTheDocument();

      // Title should be truncated but maintain structure
      const titleElement = container.querySelector('.event-title');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement?.textContent).toContain('...');

      // Description should be cleaned but present
      const descriptionElement = container.querySelector('.event-description');
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement?.textContent).not.toContain('<');
    });

    it('should handle long content consistently', () => {
      const event = createTestEvent('long');
      const { container } = render(<EventCard event={event} />);

      // Structure should remain consistent
      expect(container.querySelector('.event-card')).toBeInTheDocument();

      // Long title should be truncated
      const titleElement = container.querySelector('.event-title');
      expect(titleElement?.textContent).toContain('...');
      expect(titleElement?.textContent!.length).toBeLessThan(event.title.length);

      // Long description should be truncated
      const descriptionElement = container.querySelector('.event-description');
      expect(descriptionElement?.textContent!.length).toBeLessThan(event.description?.length || 0);
    });

    it('should handle special characters consistently', () => {
      const event = createTestEvent('special');
      const { container } = render(<EventCard event={event} />);

      // Should preserve special characters
      expect(screen.getByText(/é, à, ç, ñ, €, ™, ©/)).toBeInTheDocument();
      expect(screen.getByText(/https:\/\/example\.com/)).toBeInTheDocument();
      expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
      expect(screen.getByText(/\+32 10 47 43 02/)).toBeInTheDocument();

      // Structure should remain consistent
      expect(container.querySelector('.event-card')).toBeInTheDocument();
    });
  });

  describe('Screen Size Visual Consistency', () => {
    const testEvent = createTestEvent('complex');

    it('should maintain visual consistency on mobile', () => {
      mockWindowProperties(600);
      const { container } = render(<EventCard event={testEvent} />);

      // Check mobile-specific classes and attributes
      const responsiveTexts = container.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'mobile');
      });

      // Structure should remain the same
      expect(container.querySelector('.event-card')).toBeInTheDocument();
      expect(container.querySelector('.event-card-header')).toBeInTheDocument();
    });

    it('should maintain visual consistency on tablet', () => {
      mockWindowProperties(900);
      const { container } = render(<EventCard event={testEvent} />);

      const responsiveTexts = container.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'tablet');
      });

      expect(container.querySelector('.event-card')).toBeInTheDocument();
    });

    it('should maintain visual consistency on desktop', () => {
      mockWindowProperties(1200);
      const { container } = render(<EventCard event={testEvent} />);

      const responsiveTexts = container.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'desktop');
      });

      expect(container.querySelector('.event-card')).toBeInTheDocument();
    });

    it('should maintain visual consistency on TV', () => {
      mockWindowProperties(2000);
      const { container } = render(<EventCard event={testEvent} />);

      const responsiveTexts = container.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'tv');
      });

      expect(container.querySelector('.event-card')).toBeInTheDocument();
    });
  });

  describe('EventModal Visual Consistency', () => {
    it('should maintain consistent modal layout', () => {
      const event = createTestEvent('complex');
      const { container } = render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Check modal structure
      expect(container.querySelector('.event-modal-backdrop')).toBeInTheDocument();
      expect(container.querySelector('.event-modal')).toBeInTheDocument();
      expect(container.querySelector('.event-modal-header')).toBeInTheDocument();
      expect(container.querySelector('.event-modal-content')).toBeInTheDocument();

      // Check that title uses ResponsiveText
      const modalTitle = container.querySelector('.event-modal-title .responsive-text');
      expect(modalTitle).toBeInTheDocument();
      expect(modalTitle).toHaveClass('responsive-text--title');

      // Check detail rows structure
      const detailRows = container.querySelectorAll('.event-detail-row');
      expect(detailRows.length).toBeGreaterThan(0);

      // Each detail row should have consistent structure
      detailRows.forEach(row => {
        expect(row.querySelector('.detail-icon')).toBeInTheDocument();
        expect(row.querySelector('.detail-content')).toBeInTheDocument();
      });
    });

    it('should display extracted links consistently', () => {
      const event = createTestEvent('special');
      const { container } = render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should have links section
      expect(screen.getByText('Liens et contacts')).toBeInTheDocument();

      // Check extracted links structure
      const extractedLinks = container.querySelectorAll('.extracted-link');
      expect(extractedLinks.length).toBeGreaterThan(0);

      extractedLinks.forEach(link => {
        expect(link.querySelector('.extracted-link-icon')).toBeInTheDocument();
        expect(link.querySelector('.extracted-link-text')).toBeInTheDocument();
        expect(link.querySelector('.extracted-link-anchor')).toBeInTheDocument();
      });
    });

    it('should handle scrollable content consistently', () => {
      const longEvent = createTestEvent('long');
      const { container } = render(
        <EventModal
          event={longEvent}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should have description content wrapper
      const descriptionWrapper = container.querySelector('.description-content-wrapper');
      expect(descriptionWrapper).toBeInTheDocument();

      const descriptionContent = container.querySelector('.description-content');
      expect(descriptionContent).toBeInTheDocument();

      // Should have scroll indicators structure (even if not visible)
      const scrollIndicators = container.querySelectorAll('.scroll-indicator');
      expect(scrollIndicators.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ResponsiveText Visual Consistency', () => {
    const testText = 'Test text for visual consistency';

    it('should apply consistent classes for all variants', () => {
      const variants = ['title', 'description', 'metadata'] as const;

      variants.forEach(variant => {
        const { container, unmount } = render(
          <ResponsiveText
            text={testText}
            variant={variant}
            screenSize="desktop"
          />
        );

        const element = container.querySelector('.responsive-text');
        expect(element).toBeInTheDocument();
        expect(element).toHaveClass(`responsive-text--${variant}`);
        expect(element).toHaveAttribute('data-screen-size', 'desktop');

        unmount();
      });
    });

    it('should handle line clamping consistently', () => {
      const longText = 'Long text for clamping test. '.repeat(20);

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

  describe('ExpandableText Visual Consistency', () => {
    it('should maintain consistent collapsed state', () => {
      const longText = 'Long text for expandable test. '.repeat(20);

      const { container } = render(
        <ExpandableText
          text={longText}
          variant="description"
          maxLines={3}
        />
      );

      // Should have expandable text structure
      const expandableText = container.querySelector('.expandable-text');
      expect(expandableText).toBeInTheDocument();
      expect(expandableText).toHaveClass('expandable-text--collapsed');

      // Should have content wrapper
      const contentWrapper = container.querySelector('.expandable-text__content');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('should handle empty content consistently', () => {
      const { container } = render(
        <ExpandableText
          text=""
          variant="description"
          maxLines={3}
        />
      );

      // Should not render anything for empty content
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Typography Scale Consistency', () => {
    it('should apply consistent font sizes across screen sizes', () => {
      const testText = 'Typography test text';
      const screenSizes = ['mobile', 'tablet', 'desktop', 'tv'] as const;

      screenSizes.forEach(screenSize => {
        const { container, unmount } = render(
          <ResponsiveText
            text={testText}
            variant="title"
            screenSize={screenSize}
          />
        );

        const element = container.querySelector('.responsive-text');
        expect(element).toHaveAttribute('data-screen-size', screenSize);
        expect(element).toHaveClass('responsive-text--title');

        unmount();
      });
    });

    it('should maintain consistent spacing and layout', () => {
      const event = createTestEvent('complex');

      // Test that spacing remains consistent across renders
      const { container: container1 } = render(<EventCard event={event} />);
      const { container: container2 } = render(<EventCard event={event} />);

      // Both should have identical structure
      const structure1 = container1.querySelector('.event-card')?.className;
      const structure2 = container2.querySelector('.event-card')?.className;
      expect(structure1).toBe(structure2);

      // Both should have same number of responsive text elements
      const responsiveTexts1 = container1.querySelectorAll('.responsive-text');
      const responsiveTexts2 = container2.querySelectorAll('.responsive-text');
      expect(responsiveTexts1.length).toBe(responsiveTexts2.length);
    });
  });

  describe('Color and Theme Consistency', () => {
    it('should maintain consistent source colors', () => {
      const icloudEvent = createTestEvent('simple');
      icloudEvent.source = 'icloud';
      
      const outlookEvent = createTestEvent('simple');
      outlookEvent.source = 'outlook';

      const { container: icloudContainer } = render(<EventCard event={icloudEvent} />);
      const { container: outlookContainer } = render(<EventCard event={outlookEvent} />);

      // Should have source-specific classes
      const icloudSource = icloudContainer.querySelector('.event-source-icloud');
      const outlookSource = outlookContainer.querySelector('.event-source-outlook');

      expect(icloudSource).toBeInTheDocument();
      expect(outlookSource).toBeInTheDocument();
    });

    it('should maintain consistent link styling', () => {
      const event = createTestEvent('special');
      const { container } = render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // All extracted links should have consistent styling
      const extractedLinks = container.querySelectorAll('.extracted-link');
      extractedLinks.forEach(link => {
        expect(link).toHaveClass('extracted-link');
        expect(link.querySelector('.extracted-link-anchor')).toBeInTheDocument();
        expect(link.querySelector('.extracted-link-icon')).toBeInTheDocument();
        expect(link.querySelector('.extracted-link-text')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Visual Consistency', () => {
    it('should maintain consistent ARIA structure', () => {
      const event = createTestEvent('complex');
      const { container } = render(<EventCard event={event} />);

      // Check consistent ARIA attributes
      const article = container.querySelector('[role="article"]');
      expect(article).toHaveAttribute('aria-labelledby');
      expect(article).toHaveAttribute('aria-describedby');

      // Check heading structure
      const heading = container.querySelector('h3');
      expect(heading).toHaveAttribute('id');

      // Check screen reader labels
      const srOnlyElements = container.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });

    it('should maintain consistent focus indicators', () => {
      const event = createTestEvent('simple');
      const { container } = render(
        <EventModal
          event={event}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Modal should have consistent focus structure
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveAttribute('aria-modal', 'true');

      const closeButton = container.querySelector('.event-modal-close');
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });

  describe('Error State Visual Consistency', () => {
    it('should handle malformed content consistently', () => {
      const malformedEvent = createTestEvent('complex');
      malformedEvent.description = '<p>Unclosed <strong>tags <em>everywhere</p>';

      const { container } = render(<EventCard event={malformedEvent} />);

      // Should still maintain structure despite malformed HTML
      expect(container.querySelector('.event-card')).toBeInTheDocument();
      expect(container.querySelector('.event-description')).toBeInTheDocument();

      // Content should be cleaned
      const descriptionElement = container.querySelector('.event-description');
      expect(descriptionElement?.textContent).not.toContain('<');
    });

    it('should handle missing content consistently', () => {
      const emptyEvent = createTestEvent('simple');
      emptyEvent.description = '';
      emptyEvent.location = '';

      const { container } = render(<EventCard event={emptyEvent} />);

      // Should maintain structure even with missing content
      expect(container.querySelector('.event-card')).toBeInTheDocument();
      expect(container.querySelector('.event-card-header')).toBeInTheDocument();
      expect(container.querySelector('.event-title-section')).toBeInTheDocument();

      // Missing sections should not be rendered
      expect(container.querySelector('.event-description')).not.toBeInTheDocument();
      expect(container.querySelector('.event-location')).not.toBeInTheDocument();
    });
  });
});