import { render, screen } from '@testing-library/react';
import { EventModal } from '../components/EventModal';
import { CalendarEvent } from '../types';
import { describe, it, expect } from 'vitest';

describe('EventModal - Remove Image Blocks', () => {
  const mockEvent: CalendarEvent = {
    id: 'test-event-1',
    title: 'Test Event with Images',
    start: new Date('2024-01-15T10:00:00'),
    end: new Date('2024-01-15T11:00:00'),
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
  };

  it('should not display image blocks section', () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Vérifier que la section "Images" n'est pas présente
    expect(screen.queryByText('Images')).not.toBeInTheDocument();
    
    // Vérifier que l'icône d'images n'est pas présente
    expect(screen.queryByText('🖼️')).not.toBeInTheDocument();
  });

  it('should not display EventImagesPreview component', () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Vérifier qu'aucun élément avec la classe d'images n'est présent
    const imagePreviewElements = document.querySelectorAll('.event-images-preview');
    expect(imagePreviewElements).toHaveLength(0);
  });

  it('should still display other sections correctly', () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Vérifier que les autres sections sont toujours présentes
    expect(screen.getByText('Date et heure')).toBeInTheDocument();
    expect(screen.getByText('Lieu')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Ajouter à mon calendrier')).toBeInTheDocument();
  });

  it('should process description content without image blocks', () => {
    render(
      <EventModal
        event={mockEvent}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Vérifier que la description est affichée
    expect(screen.getByText('Description')).toBeInTheDocument();
    
    // Vérifier que le contenu textuel est présent (sans les images)
    expect(screen.getByText(/Ceci est un événement de test/)).toBeInTheDocument();
    expect(screen.getByText(/Plus de contenu après l'image/)).toBeInTheDocument();
    expect(screen.getByText(/Contenu final/)).toBeInTheDocument();
  });

  it('should handle events without images correctly', () => {
    const eventWithoutImages: CalendarEvent = {
      ...mockEvent,
      description: '<p>Simple description without any images.</p>',
      source: 'outlook'
    };

    render(
      <EventModal
        event={eventWithoutImages}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Vérifier qu'aucune section d'images n'est affichée
    expect(screen.queryByText('Images')).not.toBeInTheDocument();
    expect(screen.queryByText('🖼️')).not.toBeInTheDocument();
    
    // Vérifier que la description est toujours affichée
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText(/Simple description without any images/)).toBeInTheDocument();
  });
});