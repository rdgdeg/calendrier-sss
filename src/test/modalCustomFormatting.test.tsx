import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';

const mockEventWithCustomFormatting: CalendarEvent = {
  id: 'test-event-custom-formatting',
  title: 'Event with Custom Formatting',
  description: `+++IRSS: journée scientifique avec la Pre Alison Pilnick+++

___Conférencier___ : Pre Alison Pilnick (Language, Health and Society à la Faculty of Health and Education, Manchester Metropolitan University)

~~~Important~~~ : Accréditation demandée|||

* Matinée, 10-h12h. "It's all just words": on the importance of studying healthcare interaction" (séminaire)
* Après-midi, 14h-16h. 'Between autonomy and abandonment: reconsidering patient centred care' (conférence)

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

const mockModalProps = {
  event: mockEventWithCustomFormatting,
  isOpen: true,
  onClose: vi.fn(),
  onExportToGoogle: vi.fn(),
  onExportToOutlook: vi.fn(),
  onExportToICS: vi.fn()
};

describe('Modal Custom Formatting Integration', () => {
  it('should render bold text with +++ markers', () => {
    const { container } = render(<EventModal {...mockModalProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    expect(innerHTML).toContain('<strong class="custom-bold">');
    expect(innerHTML).toContain('IRSS: journée scientifique avec la Pre Alison Pilnick');
  });

  it('should render italic text with ___ markers', () => {
    const { container } = render(<EventModal {...mockModalProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    expect(innerHTML).toContain('<em class="custom-italic">');
    expect(innerHTML).toContain('Conférencier');
  });

  it('should render underlined text with ~~~ markers', () => {
    const { container } = render(<EventModal {...mockModalProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    expect(innerHTML).toContain('<u class="custom-underline">');
    expect(innerHTML).toContain('Important');
  });

  it('should render custom line breaks with ||| markers', () => {
    const { container } = render(<EventModal {...mockModalProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    expect(innerHTML).toContain('<br class="custom-break">');
  });

  it('should render horizontal separators with === markers', () => {
    const { container } = render(<EventModal {...mockModalProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    expect(innerHTML).toContain('<hr class="custom-separator">');
  });

  it('should preserve bullet points alongside custom formatting', () => {
    const { container } = render(<EventModal {...mockModalProps} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    // Should have both custom formatting and bullet points
    expect(innerHTML).toContain('<strong class="custom-bold">');
    expect(innerHTML).toContain('• Matinée');
    expect(innerHTML).toContain('• Après-midi');
  });

  it('should handle mixed formatting correctly', () => {
    const mixedEvent = {
      ...mockEventWithCustomFormatting,
      description: `+++Bold Title+++|||___Italic subtitle___|||~~~Underlined note~~~

Regular text with * bullet point
And another - bullet point

===

Final section`
    };

    const { container } = render(<EventModal {...mockModalProps} event={mixedEvent} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    const innerHTML = descriptionElement?.innerHTML || '';
    
    expect(innerHTML).toContain('<strong class="custom-bold">Bold Title</strong>');
    expect(innerHTML).toContain('<em class="custom-italic">Italic subtitle</em>');
    expect(innerHTML).toContain('<u class="custom-underline">Underlined note</u>');
    expect(innerHTML).toContain('<br class="custom-break">');
    expect(innerHTML).toContain('<hr class="custom-separator">');
    expect(innerHTML).toContain('• bullet point');
  });

  it('should handle events without custom formatting normally', () => {
    const normalEvent = {
      ...mockEventWithCustomFormatting,
      description: `Normal event description without any special formatting.

Just regular text with line breaks.
* A bullet point
* Another bullet point`
    };

    const { container } = render(<EventModal {...mockModalProps} event={normalEvent} />);
    
    const descriptionElement = container.querySelector('.event-description-modal');
    expect(descriptionElement).toBeInTheDocument();
    
    const innerHTML = descriptionElement?.innerHTML || '';
    expect(innerHTML).toContain('• A bullet point');
    expect(innerHTML).toContain('• Another bullet point');
  });
});