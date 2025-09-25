/**
 * Test to verify React error #310 fix
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResponsiveText } from '../components/display/ResponsiveText';
import { EventCard } from '../components/display/EventCard';
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
  id: 'test-event',
  title: 'Test Event',
  description: 'Test description',
  start: new Date('2025-09-25T10:00:00'),
  end: new Date('2025-09-25T11:00:00'),
  location: 'Test Location',
  source: 'icloud',
  allDay: false,
  category: { id: 'test', name: 'Test', color: '#007bff', source: 'icloud' },
  color: '#007bff'
};

describe('React Error #310 Fix', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    vi.clearAllMocks();
  });

  it('should render ResponsiveText without errors', () => {
    expect(() => {
      render(
        <ResponsiveText
          text="Test text"
          variant="title"
          screenSize="desktop"
        />
      );
    }).not.toThrow();

    expect(screen.getByText('Test text')).toBeInTheDocument();
  });

  it('should render EventCard without errors', () => {
    expect(() => {
      render(<EventCard event={mockEvent} />);
    }).not.toThrow();

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('should handle null/undefined text gracefully', () => {
    expect(() => {
      render(
        <ResponsiveText
          text=""
          variant="title"
          screenSize="desktop"
        />
      );
    }).not.toThrow();
  });

  it('should handle invalid variant gracefully', () => {
    expect(() => {
      render(
        <ResponsiveText
          text="Test text"
          variant={'invalid' as any}
          screenSize="desktop"
        />
      );
    }).not.toThrow();
  });

  it('should handle invalid screen size gracefully', () => {
    expect(() => {
      render(
        <ResponsiveText
          text="Test text"
          variant="title"
          screenSize={'invalid' as any}
        />
      );
    }).not.toThrow();
  });

  it('should handle event with missing properties gracefully', () => {
    const incompleteEvent = {
      ...mockEvent,
      description: undefined,
      location: undefined
    } as any;

    expect(() => {
      render(<EventCard event={incompleteEvent} />);
    }).not.toThrow();
  });
});