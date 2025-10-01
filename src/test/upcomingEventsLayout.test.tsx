import { render } from '@testing-library/react';
import { UpcomingEventsSection } from '../components/UpcomingEventsSection';
import { CalendarEvent } from '../types';
import { describe, it, expect } from 'vitest';

describe('UpcomingEventsSection - Layout Optimization', () => {
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

  it('should render grid layout with proper CSS classes', () => {
    const events = Array.from({ length: 5 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    const { container } = render(
      <UpcomingEventsSection {...mockProps} events={events} />
    );

    // Vérifier que la grille est présente
    const grid = container.querySelector('.upcoming-events-grid');
    expect(grid).toBeInTheDocument();
    
    // Vérifier que toutes les cartes d'événements sont présentes
    const eventCards = container.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(5);
  });

  it('should handle different numbers of events correctly', () => {
    // Test avec 3 événements
    const threeEvents = Array.from({ length: 3 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    const { container: container3 } = render(
      <UpcomingEventsSection {...mockProps} events={threeEvents} />
    );

    const eventCards3 = container3.querySelectorAll('.upcoming-event-card');
    expect(eventCards3).toHaveLength(3);

    // Test avec 6 événements (devrait déclencher la pagination)
    const sixEvents = Array.from({ length: 6 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    const { container: container6 } = render(
      <UpcomingEventsSection {...mockProps} events={sixEvents} eventsPerPage={5} />
    );

    // Devrait afficher 5 événements sur la première page
    const eventCards6 = container6.querySelectorAll('.upcoming-event-card');
    expect(eventCards6).toHaveLength(5);
    
    // Devrait avoir la pagination
    const pagination = container6.querySelector('.upcoming-events-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should maintain responsive behavior', () => {
    const events = Array.from({ length: 5 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    const { container } = render(
      <UpcomingEventsSection {...mockProps} events={events} />
    );

    const grid = container.querySelector('.upcoming-events-grid');
    expect(grid).toHaveClass('upcoming-events-grid');
    
    // Vérifier que les cartes ont les bonnes classes pour le responsive
    const eventCards = container.querySelectorAll('.upcoming-event-card');
    eventCards.forEach(card => {
      expect(card).toHaveClass('upcoming-event-card');
    });
  });

  it('should display events with proper content structure', () => {
    const events = [
      createMockEvent('test-1', 'Test Event 1', 0),
      createMockEvent('test-2', 'Test Event 2', 1)
    ];

    const { container } = render(
      <UpcomingEventsSection {...mockProps} events={events} />
    );

    // Vérifier la structure de chaque carte
    const eventCards = container.querySelectorAll('.upcoming-event-card');
    
    eventCards.forEach((card, index) => {
      // Vérifier la présence des éléments principaux
      expect(card.querySelector('.upcoming-event-header')).toBeInTheDocument();
      expect(card.querySelector('.upcoming-event-content')).toBeInTheDocument();
      expect(card.querySelector('.upcoming-event-actions')).toBeInTheDocument();
      
      // Vérifier le titre
      const title = card.querySelector('.upcoming-event-title');
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBe(`Test Event ${index + 1}`);
      
      // Vérifier la localisation
      const location = card.querySelector('.upcoming-event-location');
      expect(location).toBeInTheDocument();
      expect(location?.textContent).toContain(`Location test-${index + 1}`);
    });
  });

  it('should handle empty events list gracefully', () => {
    const { container } = render(
      <UpcomingEventsSection {...mockProps} events={[]} />
    );

    // Vérifier l'affichage du message "aucun événement"
    const noEvents = container.querySelector('.no-upcoming-events');
    expect(noEvents).toBeInTheDocument();
    expect(noEvents?.textContent).toContain('Aucun événement à venir');
    
    // Vérifier que la grille n'est pas affichée
    const grid = container.querySelector('.upcoming-events-grid');
    expect(grid).not.toBeInTheDocument();
  });

  it('should optimize layout for exactly 5 events', () => {
    // Test spécifique pour 5 événements (le cas mentionné par l'utilisateur)
    const fiveEvents = Array.from({ length: 5 }, (_, i) => 
      createMockEvent(`event-${i}`, `Event ${i + 1}`, i)
    );

    const { container } = render(
      <UpcomingEventsSection {...mockProps} events={fiveEvents} />
    );

    // Vérifier que tous les 5 événements sont affichés
    const eventCards = container.querySelectorAll('.upcoming-event-card');
    expect(eventCards).toHaveLength(5);
    
    // Vérifier que la grille a la bonne classe
    const grid = container.querySelector('.upcoming-events-grid');
    expect(grid).toHaveClass('upcoming-events-grid');
    
    // Vérifier qu'il n'y a pas de pagination (tous les événements sur une page)
    const pagination = container.querySelector('.upcoming-events-pagination');
    expect(pagination).not.toBeInTheDocument();
  });
});