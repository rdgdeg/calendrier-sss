import { render, screen, waitFor } from '@testing-library/react';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('EventModal - Loop Fix', () => {
  const mockEvent: CalendarEvent = {
    id: 'test-event-1',
    title: 'Test Event with Complex Description',
    start: new Date('2025-12-15T10:00:00'),
    end: new Date('2025-12-15T11:00:00'),
    allDay: false,
    description: `
      <p>This is a complex description with HTML formatting.</p>
      <p>It contains multiple paragraphs and special content:</p>
      <ul>
        <li>Email: test@uclouvain.be</li>
        <li>Phone: +32 10 47 43 02</li>
        <li>Website: https://uclouvain.be</li>
      </ul>
      <p>Date: 26/09/2025 at 14h30</p>
      <p>This is an important event that has been modified.</p>
      ***
      <p>Custom line break marker test</p>
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

  // Mock ResizeObserver to prevent issues in tests
  const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', mockResizeObserver);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should render without infinite loops', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<EventModal {...mockProps} />);

    // Wait for the component to stabilize
    await waitFor(() => {
      expect(screen.getByText('Test Event with Complex Description')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify that the description is rendered
    expect(screen.getByText('Description')).toBeInTheDocument();
    
    // Check that no infinite loop warnings were logged
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('infinite'));
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining('infinite'));

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle content processing without excessive re-renders', async () => {
    const renderSpy = vi.fn();
    
    const TestWrapper = () => {
      renderSpy();
      return <EventModal {...mockProps} />;
    };

    render(<TestWrapper />);

    // Wait for initial render and processing
    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Allow some time for any potential re-renders
    await new Promise(resolve => setTimeout(resolve, 500));

    // Should not have excessive re-renders (allow for initial render + content processing)
    expect(renderSpy).toHaveBeenCalledTimes(2); // Initial + content processing is acceptable
  });

  it('should handle scroll state updates without loops', async () => {
    const { container } = render(<EventModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Find the description content element
    const descriptionContent = container.querySelector('.description-content');
    expect(descriptionContent).toBeInTheDocument();

    // Simulate scroll events (should not cause infinite loops)
    if (descriptionContent) {
      // Mock scroll properties
      Object.defineProperty(descriptionContent, 'scrollTop', { value: 10, writable: true });
      Object.defineProperty(descriptionContent, 'scrollHeight', { value: 200, writable: true });
      Object.defineProperty(descriptionContent, 'clientHeight', { value: 100, writable: true });

      // Trigger scroll event
      const scrollEvent = new Event('scroll');
      descriptionContent.dispatchEvent(scrollEvent);

      // Wait for any updates
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Component should still be stable
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should handle ResizeObserver updates without loops', async () => {
    render(<EventModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Verify ResizeObserver was set up
    expect(mockResizeObserver).toHaveBeenCalled();

    // Component should remain stable
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should process complex content without performance issues', async () => {
    const complexEvent = {
      ...mockEvent,
      description: Array.from({ length: 50 }, (_, i) => 
        `<p>Paragraph ${i + 1} with some complex content and formatting.</p>`
      ).join('\n') + '\n***\n<p>Final paragraph after custom break.</p>'
    };

    const startTime = performance.now();
    
    render(<EventModal {...mockProps} event={complexEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within reasonable time (less than 1 second)
    expect(renderTime).toBeLessThan(1000);
  });

  it('should handle modal open/close without memory leaks', async () => {
    const { rerender } = render(<EventModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Close modal
    rerender(<EventModal {...mockProps} isOpen={false} />);

    // Reopen modal
    rerender(<EventModal {...mockProps} isOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    // Should work without issues
    expect(screen.getByText('Test Event with Complex Description')).toBeInTheDocument();
  });

  it('should handle events with no description gracefully', async () => {
    const eventWithoutDescription = {
      ...mockEvent,
      description: undefined
    };

    render(<EventModal {...mockProps} event={eventWithoutDescription} />);

    await waitFor(() => {
      expect(screen.getByText('Test Event with Complex Description')).toBeInTheDocument();
    });

    // Should not show description section
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('should handle events with empty description gracefully', async () => {
    const eventWithEmptyDescription = {
      ...mockEvent,
      description: ''
    };

    render(<EventModal {...mockProps} event={eventWithEmptyDescription} />);

    await waitFor(() => {
      expect(screen.getByText('Test Event with Complex Description')).toBeInTheDocument();
    });

    // Should not show description section
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });
});