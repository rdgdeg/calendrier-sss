import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { EventCard } from '../components/display/EventCard';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';

const mockEventWithMarkers: CalendarEvent = {
  id: 'test-invisible-markers',
  title: 'Event with Invisible Markers',
  description: `+++IRSS: journée scientifique+++

___Conférencier___ : Pre Alison Pilnick|||
~~~Important~~~ : Accréditation demandée

* Matinée, 10-h12h
* Après-midi, 14h-16h

===

Inscription : valerie.vanbutsele@uclouvain.be`,
  start: new Date('2025-12-05T10:00:00'),
  end: new Date('2025-12-05T16:00:00'),
  location: 'maisin',
  allDay: false,
  source: 'icloud' as const,
  color: '#ff6b6b',
  category: {
    id: 'secteur-sss',
    name: 'SECTEUR SSS',
    color: '#ff6b6b',
    source: 'icloud' as const
  }
};

describe('Invisible Markers Integration', () => {
  it('should not show custom markers in EventCard preview', () => {
    const { container } = render(<EventCard event={mockEventWithMarkers} />);
    
    const descriptionElement = container.querySelector('.event-description-text');
    const textContent = descriptionElement?.textContent || '';
    
    // Should not contain any custom markers
    expect(textContent).not.toContain('+++');
    expect(textContent).not.toContain('___');
    expect(textContent).not.toContain('~~~');
    expect(textContent).not.toContain('|||');
    expect(textContent).not.toContain('===');
    
    // Should contain the clean text
    expect(textContent).toContain('IRSS: journée scientifique');
    expect(textContent).toContain('Conférencier');
    expect(textContent).toContain('Important');
  });

  it('should show formatted content in EventModal but hide markers', () => {
    const modalProps = {
      event: mockEventWithMarkers,
      isOpen: true,
      onClose: vi.fn(),
    };

    const { container } = render(<EventModal {...modalProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    // Should not contain raw markers in the HTML
    expect(innerHTML).not.toContain('+++IRSS+++');
    expect(innerHTML).not.toContain('___Conférencier___');
    expect(innerHTML).not.toContain('~~~Important~~~');
    
    // Should contain formatted HTML elements
    expect(innerHTML).toContain('<strong class="custom-bold">IRSS: journée scientifique</strong>');
    expect(innerHTML).toContain('<em class="custom-italic">Conférencier</em>');
    expect(innerHTML).toContain('<u class="custom-underline">Important</u>');
    expect(innerHTML).toContain('<hr class="custom-separator">');
  });

  it('should handle mixed content correctly in both views', () => {
    const mixedEvent = {
      ...mockEventWithMarkers,
      description: `+++Title+++ with ___italic___ and ~~~underline~~~ text|||Plus normal text`
    };

    // Test EventCard
    const { container: cardContainer } = render(<EventCard event={mixedEvent} />);
    const cardText = cardContainer.querySelector('.event-description-text')?.textContent || '';
    
    expect(cardText).toBe('Title with italic and underline text Plus normal text');
    expect(cardText).not.toContain('+++');
    expect(cardText).not.toContain('___');
    expect(cardText).not.toContain('~~~');
    expect(cardText).not.toContain('|||');

    // Test EventModal
    const modalProps = {
      event: mixedEvent,
      isOpen: true,
      onClose: vi.fn(),
    };

    const { container: modalContainer } = render(<EventModal {...modalProps} />);
    const modalHTML = modalContainer.querySelector('.event-description-modal')?.innerHTML || '';
    
    expect(modalHTML).toContain('<strong class="custom-bold">Title</strong>');
    expect(modalHTML).toContain('<em class="custom-italic">italic</em>');
    expect(modalHTML).toContain('<u class="custom-underline">underline</u>');
    expect(modalHTML).toContain('<br class="custom-break">');
    
    // Should not contain raw markers
    expect(modalHTML).not.toContain('+++Title+++');
    expect(modalHTML).not.toContain('___italic___');
    expect(modalHTML).not.toContain('~~~underline~~~');
    expect(modalHTML).not.toContain('|||');
  });

  it('should handle events without custom formatting normally', () => {
    const normalEvent = {
      ...mockEventWithMarkers,
      description: 'Normal event description without any special formatting.'
    };

    // Test EventCard
    const { container: cardContainer } = render(<EventCard event={normalEvent} />);
    const cardText = cardContainer.querySelector('.event-description-text')?.textContent || '';
    
    expect(cardText).toBe('Normal event description without any special formatting.');

    // Test EventModal
    const modalProps = {
      event: normalEvent,
      isOpen: true,
      onClose: vi.fn(),
    };

    const { container: modalContainer } = render(<EventModal {...modalProps} />);
    const modalHTML = modalContainer.querySelector('.event-description-modal')?.innerHTML || '';
    
    expect(modalHTML).toContain('Normal event description without any special formatting.');
  });
});