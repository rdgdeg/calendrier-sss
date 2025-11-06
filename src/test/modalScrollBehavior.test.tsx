import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';

const mockEventWithLongDescription: CalendarEvent = {
  id: 'test-scroll-behavior',
  title: 'Event with Very Long Description',
  description: `+++Long Content Test+++

This is a very long description that should definitely require scrolling to see all the content. We need to make sure that when the user scrolls down, the scroll position is maintained and doesn't automatically jump back to the top.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

===

___More content___ to ensure scrolling is definitely needed.

* Point 1 with additional text
* Point 2 with more text
* Point 3 with even more text to make sure we have enough content

Final paragraph to ensure we have plenty of scrollable content that will definitely require the user to scroll down to see everything.`,
  start: new Date('2025-12-05T10:00:00'),
  end: new Date('2025-12-05T16:00:00'),
  location: 'Test Location',
  allDay: false,
  source: 'icloud' as const,
  color: '#ff6b6b',
  category: {
    id: 'test',
    name: 'TEST',
    color: '#ff6b6b',
    source: 'icloud' as const
  }
};

describe('Modal Scroll Behavior', () => {
  const mockProps = {
    event: mockEventWithLongDescription,
    isOpen: true,
    onClose: vi.fn(),
    onExportToGoogle: vi.fn(),
    onExportToOutlook: vi.fn(),
    onExportToICS: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not reset scroll position when scrolling down', async () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    const descriptionContent = container.querySelector('.description-content');
    expect(descriptionContent).toBeInTheDocument();
    
    if (descriptionContent) {
      // Mock scroll properties to simulate scrollable content
      Object.defineProperty(descriptionContent, 'scrollHeight', {
        value: 800,
        writable: true
      });
      Object.defineProperty(descriptionContent, 'clientHeight', {
        value: 350,
        writable: true
      });
      
      // Set initial scroll position
      Object.defineProperty(descriptionContent, 'scrollTop', {
        value: 0,
        writable: true
      });

      // Simulate scrolling down
      const targetScrollTop = 200;
      Object.defineProperty(descriptionContent, 'scrollTop', {
        value: targetScrollTop,
        writable: true
      });

      // Trigger scroll event
      fireEvent.scroll(descriptionContent, { target: { scrollTop: targetScrollTop } });
      
      // Wait for any potential scroll resets
      await waitFor(() => {
        expect(descriptionContent.scrollTop).toBe(targetScrollTop);
      }, { timeout: 1000 });

      // Verify scroll position is maintained
      expect(descriptionContent.scrollTop).toBe(targetScrollTop);
    }
  });

  it('should handle multiple scroll events without jumping to top', async () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    const descriptionContent = container.querySelector('.description-content');
    
    if (descriptionContent) {
      // Mock scrollable content
      Object.defineProperty(descriptionContent, 'scrollHeight', {
        value: 1000,
        writable: true
      });
      Object.defineProperty(descriptionContent, 'clientHeight', {
        value: 350,
        writable: true
      });

      // Simulate multiple scroll positions
      const scrollPositions = [50, 100, 150, 200, 250];
      
      for (const position of scrollPositions) {
        Object.defineProperty(descriptionContent, 'scrollTop', {
          value: position,
          writable: true
        });

        fireEvent.scroll(descriptionContent, { target: { scrollTop: position } });
        
        // Small delay between scrolls
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify position is maintained
        expect(descriptionContent.scrollTop).toBe(position);
      }
    }
  });

  it('should not have smooth scroll behavior that interferes with natural scrolling', () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    const descriptionContent = container.querySelector('.description-content');
    
    if (descriptionContent) {
      const computedStyle = window.getComputedStyle(descriptionContent);
      
      // Should not have smooth scroll behavior
      expect(computedStyle.scrollBehavior).not.toBe('smooth');
    }
  });

  it('should maintain scroll position during state updates', async () => {
    const { container, rerender } = render(<EventModal {...mockProps} />);
    
    const descriptionContent = container.querySelector('.description-content');
    
    if (descriptionContent) {
      // Mock scrollable content
      Object.defineProperty(descriptionContent, 'scrollHeight', {
        value: 800,
        writable: true
      });
      Object.defineProperty(descriptionContent, 'clientHeight', {
        value: 350,
        writable: true
      });

      // Set scroll position
      const scrollPosition = 150;
      Object.defineProperty(descriptionContent, 'scrollTop', {
        value: scrollPosition,
        writable: true
      });

      // Trigger scroll event
      fireEvent.scroll(descriptionContent, { target: { scrollTop: scrollPosition } });

      // Re-render component (simulates state update)
      rerender(<EventModal {...mockProps} />);

      // Wait for any effects to run
      await waitFor(() => {
        expect(descriptionContent).toBeInTheDocument();
      });

      // Scroll position should be maintained
      expect(descriptionContent.scrollTop).toBe(scrollPosition);
    }
  });

  it('should handle scroll events without errors', async () => {
    const { container } = render(<EventModal {...mockProps} />);
    
    const descriptionContent = container.querySelector('.description-content');
    
    if (descriptionContent) {
      // Mock scrollable content
      Object.defineProperty(descriptionContent, 'scrollHeight', {
        value: 800,
        writable: true
      });
      Object.defineProperty(descriptionContent, 'clientHeight', {
        value: 350,
        writable: true
      });

      // Trigger multiple scroll events - should not cause errors
      for (let i = 0; i < 5; i++) {
        Object.defineProperty(descriptionContent, 'scrollTop', {
          value: i * 50,
          writable: true
        });
        fireEvent.scroll(descriptionContent, { target: { scrollTop: i * 50 } });
        
        // Small delay between events
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Should complete without errors
      expect(descriptionContent).toBeInTheDocument();
    }
  });
});