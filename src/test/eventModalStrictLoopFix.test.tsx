import { render, screen, waitFor, act } from '@testing-library/react';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('EventModal - Strict Loop Fix', () => {
  const mockEvent: CalendarEvent = {
    id: 'test-event-strict',
    title: 'Strict Test Event',
    start: new Date('2025-12-15T10:00:00'),
    end: new Date('2025-12-15T11:00:00'),
    allDay: false,
    description: `
      <p>This is a test description that might cause loops.</p>
      <div>Complex HTML structure with nested elements</div>
      <ul>
        <li>Item 1 with special characters: àéèù</li>
        <li>Item 2 with numbers: 123456</li>
        <li>Item 3 with symbols: @#$%^&*()</li>
      </ul>
      ***
      <p>Custom line break test</p>
      <p>Final paragraph with more content to test scrolling behavior.</p>
    `,
    location: 'Test Location',
    source: 'icloud',
    category: {
      id: 'test-category',
      name: 'Test Category',
      color: '#3174ad',
      source: 'icloud'
    },
    color: '#3174ad'
  };

  const mockProps = {
    event: mockEvent,
    isOpen: true,
    onClose: vi.fn(),
    onExportToGoogle: vi.fn(),
    onExportToOutlook: vi.fn(),
    onExportToICS: vi.fn()
  };

  // Mock ResizeObserver with more detailed tracking
  const mockResizeObserverCalls = vi.fn();
  const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn((element) => {
      mockResizeObserverCalls('observe', element);
    }),
    disconnect: vi.fn(() => {
      mockResizeObserverCalls('disconnect');
    }),
    unobserve: vi.fn((element) => {
      mockResizeObserverCalls('unobserve', element);
    }),
  }));

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', mockResizeObserver);
    vi.clearAllMocks();
    mockResizeObserverCalls.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should have absolutely no render loops after stabilization', async () => {
    let renderCount = 0;
    const renderTracker = vi.fn(() => {
      renderCount++;
    });
    
    const TestWrapper = () => {
      renderTracker();
      return <EventModal {...mockProps} />;
    };

    await act(async () => {
      render(<TestWrapper />);
    });

    // Wait for initial stabilization
    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    }, { timeout: 3000 });

    const initialRenderCount = renderCount;

    // Wait additional time to catch any residual loops
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Should have no additional renders after stabilization
    expect(renderCount).toBe(initialRenderCount);
    expect(renderCount).toBeLessThanOrEqual(3); // Allow max 3 initial renders
  });

  it('should not trigger excessive ResizeObserver calls', async () => {
    await act(async () => {
      render(<EventModal {...mockProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Wait for any potential observer calls
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    // Should have reasonable number of observer calls
    expect(mockResizeObserverCalls).toHaveBeenCalledWith('observe', expect.any(Element));
    expect(mockResizeObserverCalls.mock.calls.length).toBeLessThanOrEqual(5);
  });

  it('should handle rapid modal open/close without loops', async () => {
    const { rerender } = render(<EventModal {...mockProps} isOpen={false} />);

    // Rapidly open and close modal multiple times
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        rerender(<EventModal {...mockProps} isOpen={true} />);
        await new Promise(resolve => setTimeout(resolve, 50));
        rerender(<EventModal {...mockProps} isOpen={false} />);
        await new Promise(resolve => setTimeout(resolve, 50));
      });
    }

    // Final open
    await act(async () => {
      rerender(<EventModal {...mockProps} isOpen={true} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Should be stable after rapid changes
    expect(screen.getByText('Strict Test Event')).toBeInTheDocument();
  });

  it('should handle scroll events without triggering loops', async () => {
    const { container } = render(<EventModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    const descriptionContent = container.querySelector('.description-content');
    expect(descriptionContent).toBeInTheDocument();

    if (descriptionContent) {
      // Mock scroll properties to simulate scrollable content
      Object.defineProperty(descriptionContent, 'scrollTop', { value: 0, writable: true });
      Object.defineProperty(descriptionContent, 'scrollHeight', { value: 300, writable: true });
      Object.defineProperty(descriptionContent, 'clientHeight', { value: 150, writable: true });

      // Simulate multiple scroll events rapidly
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          Object.defineProperty(descriptionContent, 'scrollTop', { value: i * 10, writable: true });
          const scrollEvent = new Event('scroll');
          descriptionContent.dispatchEvent(scrollEvent);
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      });

      // Wait for throttling to settle
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });
    }

    // Component should remain stable
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should handle complex content without performance degradation', async () => {
    const complexEvent = {
      ...mockEvent,
      description: Array.from({ length: 100 }, (_, i) => 
        `<p>Complex paragraph ${i + 1} with <strong>bold</strong>, <em>italic</em>, and <a href="#">links</a>.</p>`
      ).join('\n') + '\n***\n<p>Final complex paragraph with special chars: àéèùç</p>'
    };

    const startTime = performance.now();
    
    await act(async () => {
      render(<EventModal {...mockProps} event={complexEvent} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    }, { timeout: 2000 });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render complex content quickly
    expect(renderTime).toBeLessThan(500);
  });

  it('should properly cleanup all resources on unmount', async () => {
    const { unmount } = render(<EventModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Unmount component
    await act(async () => {
      unmount();
    });

    // Wait to ensure cleanup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    // Should have called disconnect on ResizeObserver
    expect(mockResizeObserverCalls).toHaveBeenCalledWith('disconnect');
  });

  it('should handle event changes without loops', async () => {
    const { rerender } = render(<EventModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Strict Test Event')).toBeInTheDocument();
    });

    // Change event
    const newEvent = {
      ...mockEvent,
      id: 'new-event-id',
      title: 'New Event Title',
      description: '<p>New description content</p>'
    };

    await act(async () => {
      rerender(<EventModal {...mockProps} event={newEvent} />);
    });

    await waitFor(() => {
      expect(screen.getByText('New Event Title')).toBeInTheDocument();
    });

    // Should handle event change smoothly
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should maintain stable state with identical content', async () => {
    render(<EventModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Wait for potential additional state changes
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Component should remain stable and functional
    expect(screen.getByText('Strict Test Event')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});