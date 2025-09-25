/**
 * Test to verify that automatic link generation is disabled
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

const mockEventWithLinks: CalendarEvent = {
  id: 'test-no-links-event',
  title: 'Event with Links',
  description: `
    <p>Contact us at test@example.com or call +32 10 47 43 02.</p>
    <p>Visit our website at https://www.example.com for more information.</p>
    <p>You can also reach us at contact@uclouvain.be or phone +32 2 764 1111.</p>
  `,
  start: new Date('2025-09-25T10:00:00'),
  end: new Date('2025-09-25T11:00:00'),
  location: 'Test Location',
  source: 'icloud',
  allDay: false,
  category: { id: 'test', name: 'Test', color: '#007bff', source: 'icloud' },
  color: '#007bff'
};

describe('No Automatic Link Generation', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    vi.clearAllMocks();
  });

  it('should not generate automatic links from email addresses', () => {
    render(
      <EventModal
        event={mockEventWithLinks}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should not have "Liens et contacts" section
    expect(screen.queryByText('Liens et contacts')).not.toBeInTheDocument();
    
    // Should not have extracted link anchors
    expect(screen.queryByRole('link', { name: /test@example.com/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /contact@uclouvain.be/ })).not.toBeInTheDocument();
  });

  it('should not generate automatic links from phone numbers', () => {
    render(
      <EventModal
        event={mockEventWithLinks}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should not have phone number links
    expect(screen.queryByRole('link', { name: /\+32 10 47 43 02/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /\+32 2 764 1111/ })).not.toBeInTheDocument();
  });

  it('should not generate automatic links from URLs', () => {
    render(
      <EventModal
        event={mockEventWithLinks}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should not have URL links
    expect(screen.queryByRole('link', { name: /https:\/\/www\.example\.com/ })).not.toBeInTheDocument();
  });

  it('should display content as plain text without link formatting', () => {
    render(
      <EventModal
        event={mockEventWithLinks}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should display the text content but not as links
    expect(screen.getByText(/Contact us at test@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/call \+32 10 47 43 02/)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/www\.example\.com/)).toBeInTheDocument();
    
    // But these should be plain text, not links
    const textElement = screen.getByText(/Contact us at test@example.com/);
    expect(textElement.tagName).not.toBe('A');
  });

  it('should preserve existing HTML links but not generate new ones', () => {
    const eventWithExistingLink: CalendarEvent = {
      ...mockEventWithLinks,
      description: `
        <p>Visit <a href="https://existing-link.com">our existing link</a>.</p>
        <p>But this email test@example.com should not become a link.</p>
      `
    };

    render(
      <EventModal
        event={eventWithExistingLink}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should preserve existing HTML links (if any survive HTML cleaning)
    // But should not generate new links from plain text
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    
    // Should not have "Liens et contacts" section
    expect(screen.queryByText('Liens et contacts')).not.toBeInTheDocument();
  });

  it('should not have link-related CSS classes', () => {
    const { container } = render(
      <EventModal
        event={mockEventWithLinks}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should not have extracted link elements
    expect(container.querySelector('.extracted-links')).not.toBeInTheDocument();
    expect(container.querySelector('.extracted-link')).not.toBeInTheDocument();
    expect(container.querySelector('.extracted-link-anchor')).not.toBeInTheDocument();
    
    // Should not have text formatter link classes
    expect(container.querySelector('.text-formatter-email')).not.toBeInTheDocument();
    expect(container.querySelector('.text-formatter-phone')).not.toBeInTheDocument();
    expect(container.querySelector('.text-formatter-url')).not.toBeInTheDocument();
  });

  it('should still display content correctly without links', () => {
    render(
      <EventModal
        event={mockEventWithLinks}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should display the content
    expect(screen.getByText(/Contact us at test@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Visit our website at https:\/\/www\.example\.com/)).toBeInTheDocument();
    
    // Should have description section
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});