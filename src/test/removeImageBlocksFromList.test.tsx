import { render, screen } from '@testing-library/react';
import { UpcomingEventsSection } from '../components/UpcomingEventsSection';
import { CalendarEvent } from '../types';
import { describe, it, expect } from 'vitest';

describe('UpcomingEventsSection - Remove Image Blocks', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: 'test-event-1',
      title: 'Test Event with Images',
      start: new Date('2025-12-15T10:00:00'),
      end: new Date('2025-12-15T11:00:00'),
      allDay: false,
      description: `
        <p>Ceci est un événement de test avec des images.</p>
        <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..." alt="Test Image 1" />
        <p>Plus de contenu après l'image.</p>
        <img src="https://example.com/image2.jpg" alt="Test Image 2" />
        <p>Contenu final.</p>
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
    },
    {
      id: 'test-event-2',
      title: 'Another Test Event',
      start: new Date('2025-12-16T14:00:00'),
      end: new Date('2025-12-16T15:00:00'),
      allDay: false,
      description: '<p>Simple description without images.</p>',
      location: 'Another Location',
      source: 'outlook',
      category: {
        id: 'test-category-2',
        name: 'Test Category 2',
        color: '#ff6b35',
        source: 'outlook'
      },
      color: '#ff6b35'
    }
  ];

  const mockProps = {
    events: mockEvents,
    onEventClick: () => {},
    onExportToGoogle: () => {},
    onExportToOutlook: () => {},
    onExportToICS: () => {}
  };

  it('should not display EventImagesPreview components in event list', () => {
    render(<UpcomingEventsSection {...mockProps} />);

    // Vérifier qu'aucun élément avec la classe d'images n'est présent
    const imagePreviewElements = document.querySelectorAll('.event-images-preview');
    expect(imagePreviewElements).toHaveLength(0);
  });

  it('should display event content without image blocks', () => {
    render(<UpcomingEventsSection {...mockProps} />);

    // Vérifier que les événements sont affichés
    expect(screen.getByText('Test Event with Images')).toBeInTheDocument();
    expect(screen.getByText('Another Test Event')).toBeInTheDocument();
    
    // Vérifier que les descriptions sont affichées (sans les images)
    expect(screen.getByText(/Ceci est un événement de test/)).toBeInTheDocument();
    expect(screen.getByText(/Simple description without images/)).toBeInTheDocument();
  });

  it('should display other event information correctly', () => {
    render(<UpcomingEventsSection {...mockProps} />);

    // Vérifier que les autres informations sont toujours présentes
    expect(screen.getByText(/Test Location/)).toBeInTheDocument();
    expect(screen.getByText(/Another Location/)).toBeInTheDocument();
    expect(screen.getByText('de Duve')).toBeInTheDocument();
    expect(screen.getByText('SSS')).toBeInTheDocument();
  });

  it('should display action buttons correctly', () => {
    render(<UpcomingEventsSection {...mockProps} />);

    // Vérifier que les boutons d'action sont présents
    const detailButtons = screen.getAllByText('👁️ Détails');
    expect(detailButtons).toHaveLength(2); // Un pour chaque événement
    
    // Vérifier que les boutons d'export sont présents
    const exportButtons = document.querySelectorAll('.btn-export-compact');
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it('should handle events with no description correctly', () => {
    const eventsWithoutDescription: CalendarEvent[] = [
      {
        ...mockEvents[0],
        description: undefined
      }
    ];

    render(
      <UpcomingEventsSection 
        {...mockProps} 
        events={eventsWithoutDescription}
      />
    );

    // Vérifier que l'événement est toujours affiché
    expect(screen.getByText('Test Event with Images')).toBeInTheDocument();
    
    // Vérifier qu'aucune section d'images n'est affichée
    const imagePreviewElements = document.querySelectorAll('.event-images-preview');
    expect(imagePreviewElements).toHaveLength(0);
  });

  it('should display pagination when there are many events', () => {
    const manyEvents = Array.from({ length: 10 }, (_, i) => ({
      ...mockEvents[0],
      id: `event-${i}`,
      title: `Event ${i + 1}`,
      start: new Date(`2025-12-${15 + i}T10:00:00`)
    }));

    render(
      <UpcomingEventsSection 
        {...mockProps} 
        events={manyEvents}
        eventsPerPage={5}
      />
    );

    // Vérifier que la pagination est affichée
    expect(screen.getByText(/Page 1 sur 2/)).toBeInTheDocument();
    expect(screen.getByText('Suivant →')).toBeInTheDocument();
    
    // Vérifier qu'aucune image n'est affichée même avec plusieurs événements
    const imagePreviewElements = document.querySelectorAll('.event-images-preview');
    expect(imagePreviewElements).toHaveLength(0);
  });
});