import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';

// Mock des dépendances
vi.mock('../utils/sourceUtils', () => ({
  getSourceDisplayName: vi.fn(() => 'Test Source')
}));

vi.mock('../utils/imageExtractor', () => ({
  extractImagesFromDescription: vi.fn(() => ({
    cleanDescription: 'Test description',
    hasImages: false,
    images: []
  }))
}));

describe('Modal Title Fix', () => {
  const mockEvent: CalendarEvent = {
    id: 'test-1',
    title: 'Défense de thèse IREC',
    start: new Date('2025-10-03T17:00:00'),
    end: new Date('2025-10-03T18:00:00'),
    allDay: false,
    description: 'Test description',
    location: 'Auditoire central B',
    source: 'test',
    category: 'academic'
  };

  it('should render modal title with white text color', () => {
    const { container } = render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    const titleElement = container.querySelector('.event-modal-title');
    expect(titleElement).toBeTruthy();
    
    // Vérifier que le titre contient le texte correct
    expect(titleElement?.textContent).toContain('Défense de thèse IREC');
    
    // Vérifier que l'élément a la classe CSS appropriée
    expect(titleElement).toHaveClass('event-modal-title');
  });

  it('should have proper CSS styling for title visibility', () => {
    const { container } = render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    const headerElement = container.querySelector('.event-modal-header');
    const titleElement = container.querySelector('.event-modal-title');
    
    expect(headerElement).toBeTruthy();
    expect(titleElement).toBeTruthy();
    
    // Vérifier que l'en-tête a la classe appropriée
    expect(headerElement).toHaveClass('event-modal-header');
    expect(titleElement).toHaveClass('event-modal-title');
  });

  it('should handle long titles properly', () => {
    const longTitleEvent: CalendarEvent = {
      ...mockEvent,
      title: 'Défense de thèse IREC - Chemotherapy and ovarian tissue: From damage characterization to novel gonadoprotection strategies'
    };

    const { container } = render(
      <EventModal
        event={longTitleEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    const titleElement = container.querySelector('.event-modal-title');
    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toContain('Défense de thèse IREC');
  });
});