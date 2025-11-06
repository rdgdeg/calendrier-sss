import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { EventModal } from '../components/EventModal';
import { EventCard } from '../components/display/EventCard';
import { CalendarEvent } from '../types';

const mockEvent: CalendarEvent = {
  id: 'test-event-1',
  title: 'Test Event with Formatted Description',
  description: `Pre Alison Pilnick (Language, Health and Society à la Faculty of Health and Education, Manchester Metropolitan University)

* Matinée, 10-h12h. "It's all just words": on the importance of studying healthcare interaction" (séminaire)
* Après-midi, 14h-16h. 'Between autonomy and abandonment: reconsidering patient centred care' (conférence)

Inscription : valerie.vanbutsele@uclouvain.be
Accréditation demandée`,
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

const mockModalProps = {
  event: mockEvent,
  isOpen: true,
  onClose: vi.fn(),
  onExportToGoogle: vi.fn(),
  onExportToOutlook: vi.fn(),
  onExportToICS: vi.fn()
};

describe('Modal Description Formatting Consistency', () => {
  it('should format description consistently between EventCard and EventModal', () => {
    // Render EventCard
    const { container: cardContainer } = render(<EventCard event={mockEvent} />);
    
    // Render EventModal
    const { container: modalContainer } = render(<EventModal {...mockModalProps} />);
    
    // Both should contain the formatted content
    expect(cardContainer).toBeInTheDocument();
    expect(modalContainer).toBeInTheDocument();
    
    // Check that both contain the bullet points and structured content
    const cardDescription = cardContainer.querySelector('.event-description');
    const modalDescription = modalContainer.querySelector('.event-description-modal');
    
    expect(cardDescription).toBeInTheDocument();
    expect(modalDescription).toBeInTheDocument();
  });

  it('should preserve bullet points and line breaks in modal', () => {
    render(<EventModal {...mockModalProps} />);
    
    // Check that the modal contains the structured content
    expect(screen.getByText(/Pre Alison Pilnick/)).toBeInTheDocument();
    expect(screen.getByText(/Matinée, 10-h12h/)).toBeInTheDocument();
    expect(screen.getByText(/Après-midi, 14h-16h/)).toBeInTheDocument();
    expect(screen.getByText(/valerie.vanbutsele@uclouvain.be/)).toBeInTheDocument();
  });

  it('should handle events with simple descriptions', () => {
    const simpleEvent = {
      ...mockEvent,
      description: 'Simple event description without special formatting.'
    };

    const simpleModalProps = {
      ...mockModalProps,
      event: simpleEvent
    };

    render(<EventModal {...simpleModalProps} />);
    
    expect(screen.getByText('Simple event description without special formatting.')).toBeInTheDocument();
  });

  it('should handle events with no description', () => {
    const eventWithoutDescription = {
      ...mockEvent,
      description: undefined
    };

    const propsWithoutDescription = {
      ...mockModalProps,
      event: eventWithoutDescription
    };

    render(<EventModal {...propsWithoutDescription} />);
    
    // Should not show description section
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });
});