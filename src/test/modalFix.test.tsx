/**
 * Test to verify EventModal React error #310 fix
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventModal } from '../components/EventModal';
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

const mockEvent: CalendarEvent = {
  id: 'test-modal-event',
  title: 'Test Modal Event',
  description: '<p>Test description with <strong>HTML</strong> and <a href="mailto:test@example.com">email</a></p>',
  start: new Date('2025-09-25T10:00:00'),
  end: new Date('2025-09-25T11:00:00'),
  location: 'Test Location',
  source: 'icloud',
  allDay: false,
  category: { id: 'test', name: 'Test', color: '#007bff', source: 'icloud' },
  color: '#007bff'
};

describe('EventModal React Error #310 Fix', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    vi.clearAllMocks();
  });

  it('should render EventModal without React error #310', () => {
    expect(() => {
      render(
        <EventModal
          event={mockEvent}
          isOpen={true}
          onClose={() => {}}
        />
      );
    }).not.toThrow();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Event')).toBeInTheDocument();
  });

  it('should handle modal opening and closing without errors', () => {
    const onClose = vi.fn();

    const { rerender } = render(
      <EventModal
        event={mockEvent}
        isOpen={false}
        onClose={onClose}
      />
    );

    // Modal should not be visible when closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Open modal
    expect(() => {
      rerender(
        <EventModal
          event={mockEvent}
          isOpen={true}
          onClose={onClose}
        />
      );
    }).not.toThrow();

    // Modal should be visible when open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close modal
    expect(() => {
      rerender(
        <EventModal
          event={mockEvent}
          isOpen={false}
          onClose={onClose}
        />
      );
    }).not.toThrow();

    // Modal should not be visible when closed again
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should handle event changes without errors', () => {
    const event1 = { ...mockEvent, id: 'event-1', title: 'Event 1' };
    const event2 = { ...mockEvent, id: 'event-2', title: 'Event 2' };

    const { rerender } = render(
      <EventModal
        event={event1}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Event 1')).toBeInTheDocument();

    // Change event
    expect(() => {
      rerender(
        <EventModal
          event={event2}
          isOpen={true}
          onClose={() => {}}
        />
      );
    }).not.toThrow();

    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.queryByText('Event 1')).not.toBeInTheDocument();
  });

  it('should handle null event gracefully', () => {
    expect(() => {
      render(
        <EventModal
          event={null}
          isOpen={true}
          onClose={() => {}}
        />
      );
    }).not.toThrow();

    // Modal should not render with null event
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should handle event without description', () => {
    const eventWithoutDescription = {
      ...mockEvent,
      description: ''
    };

    expect(() => {
      render(
        <EventModal
          event={eventWithoutDescription}
          isOpen={true}
          onClose={() => {}}
        />
      );
    }).not.toThrow();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Event')).toBeInTheDocument();
  });

  it('should handle complex HTML content without errors', () => {
    const complexEvent = {
      ...mockEvent,
      description: `
        <div>
          <h2>Complex Content</h2>
          <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2 with <a href="mailto:test@example.com">email</a></li>
          </ul>
          <p>Contact: +32 10 47 43 02 or visit https://example.com</p>
        </div>
      `
    };

    expect(() => {
      render(
        <EventModal
          event={complexEvent}
          isOpen={true}
          onClose={() => {}}
        />
      );
    }).not.toThrow();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Event')).toBeInTheDocument();
  });

  it('should handle rapid modal open/close cycles', () => {
    const onClose = vi.fn();

    const { rerender } = render(
      <EventModal
        event={mockEvent}
        isOpen={false}
        onClose={onClose}
      />
    );

    // Rapidly open and close modal multiple times
    for (let i = 0; i < 5; i++) {
      expect(() => {
        rerender(
          <EventModal
            event={mockEvent}
            isOpen={true}
            onClose={onClose}
          />
        );
      }).not.toThrow();

      expect(() => {
        rerender(
          <EventModal
            event={mockEvent}
            isOpen={false}
            onClose={onClose}
          />
        );
      }).not.toThrow();
    }
  });
});