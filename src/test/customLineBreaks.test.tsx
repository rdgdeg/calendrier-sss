/**
 * Test for custom line break markers functionality
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventModal } from '../components/EventModal';
import { EventCard } from '../components/display/EventCard';
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

const mockEventWithCustomBreaks: CalendarEvent = {
  id: 'test-custom-breaks-event',
  title: 'Event with Custom Line Breaks',
  description: `
    Première partie de la description.***Deuxième partie après un saut de ligne.***Troisième partie avec encore un autre saut.
  `,
  start: new Date('2025-09-25T10:00:00'),
  end: new Date('2025-09-25T11:00:00'),
  location: 'Test Location',
  source: 'icloud',
  allDay: false,
  category: { id: 'test', name: 'Test', color: '#007bff', source: 'icloud' },
  color: '#007bff'
};

describe('Custom Line Break Markers', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver as any;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    vi.clearAllMocks();
  });

  describe('TextFormatter processCustomLineBreaks', () => {
    it('should convert *** markers to line breaks', () => {
      const text = 'First line***Second line***Third line';
      const result = textFormatter.processCustomLineBreaks(text, '***');
      
      expect(result).toBe('First line<br><br>Second line<br><br>Third line');
    });

    it('should handle multiple consecutive markers', () => {
      const text = 'Start******Middle***End';
      const result = textFormatter.processCustomLineBreaks(text, '***');
      
      expect(result).toBe('Start<br><br><br><br>Middle<br><br>End');
    });

    it('should handle custom markers other than ***', () => {
      const text = 'First|||Second|||Third';
      const result = textFormatter.processCustomLineBreaks(text, '|||');
      
      expect(result).toBe('First<br><br>Second<br><br>Third');
    });

    it('should handle text without markers', () => {
      const text = 'No markers in this text';
      const result = textFormatter.processCustomLineBreaks(text, '***');
      
      expect(result).toBe('No markers in this text');
    });

    it('should handle empty or null text', () => {
      expect(textFormatter.processCustomLineBreaks('', '***')).toBe('');
      expect(textFormatter.processCustomLineBreaks(null as any, '***')).toBe('');
      expect(textFormatter.processCustomLineBreaks(undefined as any, '***')).toBe('');
    });

    it('should escape special regex characters in markers', () => {
      const text = 'First...Second...Third';
      const result = textFormatter.processCustomLineBreaks(text, '...');
      
      expect(result).toBe('First<br><br>Second<br><br>Third');
    });
  });

  describe('EventModal with Custom Line Breaks', () => {
    it('should display custom line breaks in modal description', () => {
      render(
        <EventModal
          event={mockEventWithCustomBreaks}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should display the content with line breaks processed
      expect(screen.getByText(/Première partie de la description/)).toBeInTheDocument();
      expect(screen.getByText(/Deuxième partie après un saut/)).toBeInTheDocument();
      expect(screen.getByText(/Troisième partie avec encore/)).toBeInTheDocument();
    });

    it('should handle complex content with custom breaks and HTML', () => {
      const complexEvent = {
        ...mockEventWithCustomBreaks,
        description: `
          <p>HTML paragraph with <strong>bold text</strong>.</p>***
          <p>Second paragraph after custom break.</p>***
          Final paragraph.
        `
      };

      render(
        <EventModal
          event={complexEvent}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should process both HTML cleaning and custom breaks
      expect(screen.getByText(/HTML paragraph with bold text/)).toBeInTheDocument();
      expect(screen.getByText(/Second paragraph after custom break/)).toBeInTheDocument();
      expect(screen.getByText(/Final paragraph/)).toBeInTheDocument();
    });
  });

  describe('EventCard with Custom Line Breaks', () => {
    it('should process custom line breaks in card descriptions', () => {
      const cardEvent = {
        ...mockEventWithCustomBreaks,
        description: 'Short description***with custom break'
      };

      render(<EventCard event={cardEvent} />);

      // Should display the description (may be truncated for cards)
      expect(screen.getByText(/Short description/)).toBeInTheDocument();
    });
  });

  describe('Integration with formatDescription', () => {
    it('should process custom breaks in formatDescription', () => {
      const text = 'First part***Second part***Third part';
      const result = textFormatter.formatDescription(text, { maxLength: 100 });
      
      // Should process custom breaks and return formatted content
      expect(result.content).toContain('First part');
      expect(result.content).toContain('Second part');
      expect(result.hasSpecialContent).toBe(false); // No special content like URLs
    });

    it('should handle truncation with custom breaks', () => {
      const longText = 'Very long first part that should be truncated***Second part that might not be visible';
      const result = textFormatter.formatDescription(longText, { maxLength: 50 });
      
      expect(result.isTruncated).toBe(true);
      expect(result.content).toContain('...');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle event descriptions with mixed content', () => {
      const realWorldEvent = {
        ...mockEventWithCustomBreaks,
        description: `
          Séminaire IREC - Recherche Avancée***
          
          Détails de l'événement:
          - Date: 26 septembre 2025
          - Heure: 14h00 - 16h30***
          
          Contact: irec@uclouvain.be***
          
          Important: Inscription obligatoire avant le 25/09/2025.
        `
      };

      render(
        <EventModal
          event={realWorldEvent}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should display all sections with proper line breaks
      expect(screen.getByText(/Séminaire IREC - Recherche Avancée/)).toBeInTheDocument();
      expect(screen.getByText(/Détails de l'événement/)).toBeInTheDocument();
      expect(screen.getByText(/Contact: irec@uclouvain.be/)).toBeInTheDocument();
      expect(screen.getByText(/Important: Inscription obligatoire/)).toBeInTheDocument();
    });

    it('should work with different marker patterns', () => {
      const eventWithDifferentMarkers = {
        ...mockEventWithCustomBreaks,
        description: 'First section|||Second section|||Third section'
      };

      // Test that the system is flexible for different markers
      const processed = textFormatter.processCustomLineBreaks(
        eventWithDifferentMarkers.description, 
        '|||'
      );
      
      expect(processed).toContain('<br><br>');
      expect(processed.split('<br><br>')).toHaveLength(3);
    });
  });
});