import { render, screen } from '@testing-library/react';
import { UpcomingEventsSection } from '../components/UpcomingEventsSection';
import { CalendarEvent } from '../types';
import { describe, it, expect } from 'vitest';

describe('UpcomingEventsSection - 6 Events Layout', () => {
  const createMockEvent = (id: string, title: string, dayOffset: number): CalendarEvent => ({
    id,
    title,
    start: new Date(`2025-12-${15 + dayOffset}T10:00:00`),
    end: new Date(`2025-12-${15 + dayOffset}T11:00:00`),
    allDay: false,
    description: `Description for ${title}`,
    location: `Location ${id}`,
    source: 'icloud',
    category: {
      id: `category-${id}`,
      name: `Category ${id}`,
      color: '#3174ad',
      source: 'icloud'
    },
    color: '#3174ad'
  });

  const mockProps = {
    onEventClick: () => {},
    onExportToGoogle: () => {},
    onExportToOutlook: () => {},
    onExportToICS: () => {}
  };

  it('should display exactly 6 events by default', () => {
    // Créer 8 événements pour tester que seuls 6 sont affichés sur la première page
    const events = Array.from({ length: 8 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    render(<UpcomingEventsSection {...mockProps} events={events} />);

    // Vérifier que 6 événements sont affichés
    const eventCards = document.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(6);

    // Vérifier que la pagination est présente (car il y a plus de 6 événements)
    expect(screen.getByText(/Page 1 sur 2/)).toBeInTheDocument();
  });

  it('should display all events when there are exactly 6', () => {
    const events = Array.from({ length: 6 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    render(<UpcomingEventsSection {...mockProps} events={events} />);

    // Vérifier que tous les 6 événements sont affichés
    const eventCards = document.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(6);

    // Vérifier qu'il n'y a pas de pagination (exactement 6 événements)
    const pagination = document.querySelector('.upcoming-events-pagination');
    expect(pagination).not.toBeInTheDocument();

    // Vérifier que tous les titres sont présents
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`Event ${i}`)).toBeInTheDocument();
    }
  });

  it('should display fewer than 6 events when available events are less', () => {
    const events = Array.from({ length: 4 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    render(<UpcomingEventsSection {...mockProps} events={events} />);

    // Vérifier que seulement 4 événements sont affichés
    const eventCards = document.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(4);

    // Vérifier qu'il n'y a pas de pagination
    const pagination = document.querySelector('.upcoming-events-pagination');
    expect(pagination).not.toBeInTheDocument();
  });

  it('should maintain proper grid layout with 6 events', () => {
    const events = Array.from({ length: 6 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    const { container } = render(
      <UpcomingEventsSection {...mockProps} events={events} />
    );

    // Vérifier que la grille a la bonne classe
    const grid = container.querySelector('.upcoming-events-grid');
    expect(grid).toHaveClass('upcoming-events-grid');

    // Vérifier que toutes les cartes ont la bonne structure
    const eventCards = container.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(6);

    eventCards.forEach((card) => {
      expect(card).toHaveClass('upcoming-event-card');
      
      // Vérifier la structure de chaque carte
      expect(card.querySelector('.upcoming-event-header')).toBeInTheDocument();
      expect(card.querySelector('.upcoming-event-content')).toBeInTheDocument();
      expect(card.querySelector('.upcoming-event-actions')).toBeInTheDocument();
    });
  });

  it('should show correct pagination info with more than 6 events', () => {
    const events = Array.from({ length: 10 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    render(<UpcomingEventsSection {...mockProps} events={events} />);

    // Vérifier l'info de pagination
    expect(screen.getByText('10 événements à venir')).toBeInTheDocument();
    expect(screen.getByText(/Page 1 sur 2/)).toBeInTheDocument();

    // Vérifier que 6 événements sont affichés sur la première page
    const eventCards = document.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(6);
  });

  it('should handle custom eventsPerPage parameter', () => {
    const events = Array.from({ length: 10 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    // Test avec eventsPerPage personnalisé (devrait override la valeur par défaut)
    render(
      <UpcomingEventsSection 
        {...mockProps} 
        events={events} 
        eventsPerPage={4}
      />
    );

    // Vérifier que seulement 4 événements sont affichés
    const eventCards = document.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(4);

    // Vérifier la pagination pour 4 par page
    expect(screen.getByText(/Page 1 sur 3/)).toBeInTheDocument();
  });

  it('should display perfect 2x3 grid layout with 6 events', () => {
    const events = Array.from({ length: 6 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    const { container } = render(
      <UpcomingEventsSection {...mockProps} events={events} />
    );

    // Vérifier que la grille est présente
    const grid = container.querySelector('.upcoming-events-grid');
    expect(grid).toBeInTheDocument();

    // Vérifier que tous les 6 événements sont présents
    const eventCards = container.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(6);

    // Vérifier que chaque événement a le bon contenu
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`Event ${i}`)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`Location event-${i-1}`))).toBeInTheDocument();
    }

    // Vérifier qu'il n'y a pas de pagination (layout parfait)
    const pagination = container.querySelector('.upcoming-events-pagination');
    expect(pagination).not.toBeInTheDocument();
  });
});