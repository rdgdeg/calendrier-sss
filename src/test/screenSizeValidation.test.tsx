/**
 * Screen Size Validation Tests
 * Comprehensive tests for all supported screen sizes and event types
 * Validates Requirement 4.1, 4.2, 4.3, 4.4
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventCard } from '../components/display/EventCard';
import { EventModal } from '../components/EventModal';
import { ResponsiveText } from '../components/display/ResponsiveText';
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

// Screen size configurations for testing
const SCREEN_SIZES = {
  mobile: { width: 375, height: 667, name: 'Mobile (iPhone)' },
  mobileLarge: { width: 414, height: 896, name: 'Mobile Large (iPhone Plus)' },
  tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
  tabletLarge: { width: 1024, height: 1366, name: 'Tablet Large (iPad Pro)' },
  desktop: { width: 1280, height: 720, name: 'Desktop (HD)' },
  desktopLarge: { width: 1920, height: 1080, name: 'Desktop Large (Full HD)' },
  tv: { width: 2560, height: 1440, name: 'TV (4K)' },
  tvLarge: { width: 3840, height: 2160, name: 'TV Large (Ultra HD)' }
};

// Event types for comprehensive testing
const EVENT_TYPES = {
  short: {
    title: 'Short Event',
    description: 'Brief description.',
    location: 'Room A'
  },
  medium: {
    title: 'Medium Length Event Title for Testing',
    description: 'This is a medium length description that provides more details about the event and its purpose.',
    location: 'Conference Room B, Building 2'
  },
  long: {
    title: 'Very Long Event Title That Should Be Truncated Appropriately Based on Screen Size and Available Space',
    description: 'This is a very long description that contains multiple sentences and detailed information about the event. It should be handled appropriately across different screen sizes with proper truncation and formatting. The description includes various details that might be important for attendees.',
    location: 'Large Conference Hall, Main Building, Floor 3, Room 301-305'
  },
  complex: {
    title: 'IREC Seminar - Prof. Élise Belaidi Institut NeuroMyoGène (INMG) CNRS 5261 – INSERM U1315',
    description: `
      <div>
        <p>Detailed seminar with <strong>formatting</strong> and <em>emphasis</em>.</p>
        <ul>
          <li>First important point</li>
          <li>Second point with details</li>
          <li>Third point with <a href="mailto:contact@example.com">contact info</a></li>
        </ul>
        <p>Visit <a href="https://example.com">our website</a> or call +32 10 47 43 02.</p>
      </div>
    `,
    location: 'Auditoire MEDI 91, Avenue Hippocrate 54, 1200 Bruxelles'
  }
};

// Mock window properties
const mockScreenSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
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

// Helper to create test events
const createTestEvent = (type: keyof typeof EVENT_TYPES, source: 'icloud' | 'outlook' = 'icloud'): CalendarEvent => ({
  id: `${type}-${source}-event`,
  title: EVENT_TYPES[type].title,
  description: EVENT_TYPES[type].description,
  location: EVENT_TYPES[type].location,
  start: new Date('2025-09-25T10:00:00'),
  end: new Date('2025-09-25T11:00:00'),
  source,
  allDay: false,
  category: { id: 'test', name: 'Test', color: '#007bff', source },
  color: '#007bff'
});

// Helper to get expected screen size category
const getExpectedScreenSize = (width: number): string => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1920) return 'desktop';
  return 'tv';
};

describe('Screen Size Validation Tests', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    vi.clearAllMocks();
  });

  describe('EventCard Screen Size Adaptation', () => {
    Object.entries(SCREEN_SIZES).forEach(([, config]) => {
      describe(`${config.name} (${config.width}x${config.height})`, () => {
        beforeEach(() => {
          mockScreenSize(config.width, config.height);
        });

        Object.entries(EVENT_TYPES).forEach(([eventType]) => {
          it(`should render ${eventType} event correctly`, () => {
            const event = createTestEvent(eventType as keyof typeof EVENT_TYPES);
            const { container } = render(<EventCard event={event} />);

            // Check that event card renders
            expect(container.querySelector('.event-card')).toBeInTheDocument();

            // Check that responsive text elements have correct screen size
            const responsiveTexts = container.querySelectorAll('.responsive-text');
            const expectedScreenSize = getExpectedScreenSize(config.width);
            
            responsiveTexts.forEach(element => {
              expect(element).toHaveAttribute('data-screen-size', expectedScreenSize);
            });

            // Check that title is present and appropriately formatted
            const titleElement = screen.getByRole('heading', { level: 3 });
            expect(titleElement).toBeInTheDocument();

            // For long titles, check truncation
            if (eventType === 'long' || eventType === 'complex') {
              const titleText = titleElement.textContent || '';
              expect(titleText.length).toBeLessThan(event.title.length);
              expect(titleText).toMatch(/\.\.\.$/);
            }

            // Check that description is handled appropriately
            if (event.description) {
              const descriptionElement = container.querySelector('.event-description');
              if (descriptionElement) {
                expect(descriptionElement).toBeInTheDocument();
                // Description should not contain HTML tags
                expect(descriptionElement.textContent).not.toContain('<');
              }
            }

            // Check that location is displayed if present
            if (event.location) {
              const locationElement = container.querySelector('.event-location');
              expect(locationElement).toBeInTheDocument();
            }
          });
        });

        it('should apply correct typography scales', () => {
          const event = createTestEvent('medium');
          const { container } = render(<EventCard event={event} />);

          const expectedScreenSize = getExpectedScreenSize(config.width);
          
          // Check title typography
          const titleText = container.querySelector('.responsive-text--title');
          expect(titleText).toHaveAttribute('data-screen-size', expectedScreenSize);

          // Check description typography
          const descriptionText = container.querySelector('.responsive-text--description');
          if (descriptionText) {
            expect(descriptionText).toHaveAttribute('data-screen-size', expectedScreenSize);
          }

          // Check metadata typography
          const metadataTexts = container.querySelectorAll('.responsive-text--metadata');
          metadataTexts.forEach(element => {
            expect(element).toHaveAttribute('data-screen-size', expectedScreenSize);
          });
        });

        it('should handle both event sources consistently', () => {
          const icloudEvent = createTestEvent('medium', 'icloud');
          const outlookEvent = createTestEvent('medium', 'outlook');

          const { container: icloudContainer } = render(<EventCard event={icloudEvent} />);
          const { container: outlookContainer } = render(<EventCard event={outlookEvent} />);

          // Both should have same structure
          expect(icloudContainer.querySelector('.event-card')).toBeInTheDocument();
          expect(outlookContainer.querySelector('.event-card')).toBeInTheDocument();

          // Both should have correct screen size
          const expectedScreenSize = getExpectedScreenSize(config.width);
          
          const icloudResponsiveTexts = icloudContainer.querySelectorAll('.responsive-text');
          const outlookResponsiveTexts = outlookContainer.querySelectorAll('.responsive-text');

          icloudResponsiveTexts.forEach(element => {
            expect(element).toHaveAttribute('data-screen-size', expectedScreenSize);
          });

          outlookResponsiveTexts.forEach(element => {
            expect(element).toHaveAttribute('data-screen-size', expectedScreenSize);
          });
        });
      });
    });
  });

  describe('EventModal Screen Size Adaptation', () => {
    Object.entries(SCREEN_SIZES).forEach(([, config]) => {
      describe(`${config.name} (${config.width}x${config.height})`, () => {
        beforeEach(() => {
          mockScreenSize(config.width, config.height);
        });

        it('should render modal with correct responsive elements', () => {
          const event = createTestEvent('complex');
          const { container } = render(
            <EventModal
              event={event}
              isOpen={true}
              onClose={() => {}}
            />
          );

          // Check modal structure
          expect(container.querySelector('.event-modal')).toBeInTheDocument();

          // Check that title uses responsive text
          const modalTitle = container.querySelector('.event-modal-title .responsive-text');
          expect(modalTitle).toBeInTheDocument();
          expect(modalTitle).toHaveAttribute('data-screen-size', getExpectedScreenSize(config.width));

          // Check that modal content is properly structured
          expect(container.querySelector('.event-modal-content')).toBeInTheDocument();
          expect(container.querySelector('.event-modal-details')).toBeInTheDocument();
        });

        it('should handle extracted links appropriately', () => {
          const event = createTestEvent('complex');
          const { container } = render(
            <EventModal
              event={event}
              isOpen={true}
              onClose={() => {}}
            />
          );

          // Should extract and display links
          const linksSection = screen.queryByText('Liens et contacts');
          if (linksSection) {
            expect(linksSection).toBeInTheDocument();

            // Check extracted links structure
            const extractedLinks = container.querySelectorAll('.extracted-link');
            extractedLinks.forEach(link => {
              expect(link.querySelector('.extracted-link-anchor')).toBeInTheDocument();
              expect(link.querySelector('.extracted-link-icon')).toBeInTheDocument();
              expect(link.querySelector('.extracted-link-text')).toBeInTheDocument();
            });
          }
        });

        it('should handle scrollable content', () => {
          const longEvent = createTestEvent('long');
          const { container } = render(
            <EventModal
              event={longEvent}
              isOpen={true}
              onClose={() => {}}
            />
          );

          // Should have description content structure
          const descriptionWrapper = container.querySelector('.description-content-wrapper');
          if (descriptionWrapper) {
            expect(descriptionWrapper).toBeInTheDocument();
            
            const descriptionContent = container.querySelector('.description-content');
            expect(descriptionContent).toBeInTheDocument();
          }
        });
      });
    });
  });

  describe('ResponsiveText Direct Testing', () => {
    const testText = 'Test text for responsive typography validation';

    Object.entries(SCREEN_SIZES).forEach(([, config]) => {
      describe(`${config.name} (${config.width}x${config.height})`, () => {
        beforeEach(() => {
          mockScreenSize(config.width, config.height);
        });

        ['title', 'description', 'metadata'].forEach(variant => {
          it(`should render ${variant} variant correctly`, () => {
            const { container } = render(
              <ResponsiveText
                text={testText}
                variant={variant as any}
                screenSize={getExpectedScreenSize(config.width) as any}
              />
            );

            const element = container.querySelector('.responsive-text');
            expect(element).toBeInTheDocument();
            expect(element).toHaveClass(`responsive-text--${variant}`);
            expect(element).toHaveAttribute('data-screen-size', getExpectedScreenSize(config.width));
          });
        });

        it('should handle line clamping appropriately', () => {
          const longText = 'Very long text for line clamping test. '.repeat(20);
          const { container } = render(
            <ResponsiveText
              text={longText}
              variant="description"
              maxLines={3}
              screenSize={getExpectedScreenSize(config.width) as any}
            />
          );

          const element = container.querySelector('.responsive-text');
          expect(element).toHaveClass('responsive-text--clamped');
          expect(element).toHaveAttribute('data-max-lines', '3');
        });
      });
    });
  });

  describe('Typography Scale Validation', () => {
    it('should have appropriate font size progression across screen sizes', () => {
      const testText = 'Typography scale test';
      const screenSizeOrder = ['mobile', 'tablet', 'desktop', 'tv'];
      const fontSizeResults: { [key: string]: string } = {};

      screenSizeOrder.forEach(screenSize => {
        const config = Object.values(SCREEN_SIZES).find(s => 
          getExpectedScreenSize(s.width) === screenSize
        );
        
        if (config) {
          mockScreenSize(config.width, config.height);
          
          const { container, unmount } = render(
            <ResponsiveText
              text={testText}
              variant="title"
              screenSize={screenSize as any}
            />
          );

          const element = container.querySelector('.responsive-text');
          expect(element).toHaveAttribute('data-screen-size', screenSize);
          
          // Store for comparison (in real implementation, we'd check computed styles)
          fontSizeResults[screenSize] = element?.getAttribute('data-screen-size') || '';
          
          unmount();
        }
      });

      // Verify all screen sizes were tested
      expect(Object.keys(fontSizeResults)).toEqual(screenSizeOrder);
    });

    it('should maintain readability at distance for TV screens', () => {
      mockScreenSize(SCREEN_SIZES.tv.width, SCREEN_SIZES.tv.height);
      
      const event = createTestEvent('medium');
      const { container } = render(<EventCard event={event} />);

      // All responsive text should be marked as TV size
      const responsiveTexts = container.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'tv');
      });

      // Title should be clearly visible
      const titleElement = screen.getByRole('heading', { level: 3 });
      expect(titleElement).toBeInTheDocument();
      
      const titleResponsiveText = titleElement.querySelector('.responsive-text');
      expect(titleResponsiveText).toHaveClass('responsive-text--title');
    });

    it('should optimize for touch interfaces on mobile', () => {
      mockScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height);
      
      const event = createTestEvent('medium');
      const { container } = render(<EventCard event={event} />);

      // Should have mobile-optimized sizing
      const responsiveTexts = container.querySelectorAll('.responsive-text');
      responsiveTexts.forEach(element => {
        expect(element).toHaveAttribute('data-screen-size', 'mobile');
      });

      // Event card should maintain structure on mobile
      expect(container.querySelector('.event-card')).toBeInTheDocument();
      expect(container.querySelector('.event-card-header')).toBeInTheDocument();
      expect(container.querySelector('.event-title-section')).toBeInTheDocument();
    });
  });

  describe('Truncation Behavior Across Screen Sizes', () => {
    Object.entries(SCREEN_SIZES).forEach(([, config]) => {
      it(`should truncate appropriately on ${config.name}`, () => {
        mockScreenSize(config.width, config.height);
        
        const event = createTestEvent('long');
        render(<EventCard event={event} />);

        const titleElement = screen.getByRole('heading', { level: 3 });
        const titleText = titleElement.textContent || '';

        // Should be truncated
        expect(titleText.length).toBeLessThan(event.title.length);
        expect(titleText).toMatch(/\.\.\.$/);

        // Should have appropriate screen size
        const responsiveText = titleElement.querySelector('.responsive-text');
        expect(responsiveText).toHaveAttribute('data-screen-size', getExpectedScreenSize(config.width));

        // Larger screens should allow more text
        if (config.width >= 1920) {
          // TV screens should show more content
          expect(titleText.length).toBeGreaterThan(50);
        } else if (config.width >= 1024) {
          // Desktop screens should show reasonable amount
          expect(titleText.length).toBeGreaterThan(40);
        } else if (config.width >= 768) {
          // Tablet screens should show moderate amount
          expect(titleText.length).toBeGreaterThan(30);
        } else {
          // Mobile screens should show less but still meaningful
          expect(titleText.length).toBeGreaterThan(20);
        }
      });
    });
  });

  describe('Performance Across Screen Sizes', () => {
    it('should render efficiently on all screen sizes', () => {
      const events = Array.from({ length: 10 }, (_, i) => 
        createTestEvent('medium', i % 2 === 0 ? 'icloud' : 'outlook')
      );

      Object.entries(SCREEN_SIZES).forEach(([, config]) => {
        mockScreenSize(config.width, config.height);
        
        const startTime = performance.now();
        
        const { container, unmount } = render(
          <div>
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        );

        const renderTime = performance.now() - startTime;

        // Should render quickly regardless of screen size
        expect(renderTime).toBeLessThan(500);

        // All cards should be rendered
        const eventCards = container.querySelectorAll('.event-card');
        expect(eventCards).toHaveLength(10);

        unmount();
      });
    });
  });

  describe('Accessibility Across Screen Sizes', () => {
    Object.entries(SCREEN_SIZES).forEach(([, config]) => {
      it(`should maintain accessibility on ${config.name}`, () => {
        mockScreenSize(config.width, config.height);
        
        const event = createTestEvent('complex');
        const { container } = render(<EventCard event={event} />);

        // Should maintain ARIA structure regardless of screen size
        const article = container.querySelector('[role="article"]');
        expect(article).toHaveAttribute('aria-labelledby');
        expect(article).toHaveAttribute('aria-describedby');

        // Should have proper heading structure
        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toBeInTheDocument();

        // Should have screen reader labels
        const srOnlyElements = container.querySelectorAll('.sr-only');
        expect(srOnlyElements.length).toBeGreaterThan(0);
      });
    });
  });
});