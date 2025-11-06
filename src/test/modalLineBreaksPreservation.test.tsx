import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';

const mockEventWithLineBreaks: CalendarEvent = {
  id: 'test-event-linebreaks',
  title: 'Event with Line Breaks',
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
  event: mockEventWithLineBreaks,
  isOpen: true,
  onClose: vi.fn(),
  onExportToGoogle: vi.fn(),
  onExportToOutlook: vi.fn(),
  onExportToICS: vi.fn()
};

describe('Modal Line Breaks Preservation', () => {
  it('should preserve line breaks and bullet points in processed description', () => {
    const { container } = render(<EventModal {...mockModalProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    expect(descriptionElement).toBeInTheDocument();
    
    // Check that HTML contains proper line break elements
    const innerHTML = descriptionElement?.innerHTML || '';
    
    // Should contain <br> tags for line breaks
    expect(innerHTML).toContain('<br>');
    
    // Should contain bullet points
    expect(innerHTML).toContain('•');
    
    // Should contain paragraph tags
    expect(innerHTML).toContain('<p>');
  });

  it('should handle simple text with line breaks', () => {
    const simpleEvent = {
      ...mockEventWithLineBreaks,
      description: `Première ligne
Deuxième ligne

Nouveau paragraphe`
    };

    const { container } = render(<EventModal {...mockModalProps} event={simpleEvent} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    // Should convert line breaks to <br> tags
    expect(innerHTML).toContain('<br>');
    
    // Should create paragraphs for double line breaks
    expect(innerHTML).toContain('<p>');
  });

  it('should handle bullet points correctly', () => {
    const bulletEvent = {
      ...mockEventWithLineBreaks,
      description: `Liste des points:
* Premier point
* Deuxième point
- Troisième point avec tiret
• Quatrième point avec puce`
    };

    const { container } = render(<EventModal {...mockModalProps} event={bulletEvent} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    // Should convert all bullet types to consistent bullets
    expect(innerHTML).toContain('•');
    
    // Should preserve the structure
    expect(innerHTML).toContain('<br>');
  });

  it('should handle numbered lists', () => {
    const numberedEvent = {
      ...mockEventWithLineBreaks,
      description: `Étapes à suivre:
1. Première étape
2. Deuxième étape
3. Troisième étape`
    };

    const { container } = render(<EventModal {...mockModalProps} event={numberedEvent} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    // Should preserve numbered lists
    expect(innerHTML).toContain('1.');
    expect(innerHTML).toContain('2.');
    expect(innerHTML).toContain('3.');
    
    // Should have proper line breaks
    expect(innerHTML).toContain('<br>');
  });
});