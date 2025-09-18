import React, { memo } from 'react';
import { CalendarEvent } from '../../types';
import { Header } from '../display/Header';
import { EventsGrid } from '../display/EventsGrid';

interface DisplayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  daysToShow?: number; // Nombre d'événements à afficher (par défaut 6)
}

const DisplayViewComponent: React.FC<DisplayViewProps> = ({
  events,
  onEventClick,
  daysToShow = 6
}) => {
  return (
    <main 
      className="display-view"
      role="main"
      aria-label="Affichage public des événements UCLouvain"
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      {/* Modern Header with UCLouvain Branding */}
      <Header title="Événements à Venir - Secteur SSS" />
      
      {/* Events Grid with Modern Layout */}
      <section 
        aria-label="Liste des prochains événements"
        role="region"
      >
        <EventsGrid 
          events={events}
          maxEvents={daysToShow}
          onEventClick={onEventClick}
        />
      </section>
    </main>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const DisplayView = memo(DisplayViewComponent, (prevProps, nextProps) => {
  // Re-render only if events array changes or onEventClick changes
  return (
    prevProps.events === nextProps.events &&
    prevProps.onEventClick === nextProps.onEventClick &&
    prevProps.daysToShow === nextProps.daysToShow
  );
});