import React, { useEffect, useState, memo, useRef } from 'react';
import { CalendarEvent } from '../../types';
import { EmptyState } from './EmptyState';
import { EventCard } from './EventCard';

interface EventsGridProps {
  events: CalendarEvent[];
  maxEvents?: number;
  onEventClick?: (event: CalendarEvent) => void;
}

const EventsGridComponent: React.FC<EventsGridProps> = ({ 
  events, 
  maxEvents = 6,
  onEventClick 
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Check for user's motion preferences and setup performance monitoring
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Setup performance monitoring for animations
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('event-card-animation')) {
            console.log(`Animation ${entry.name} took ${entry.duration}ms`);
          }
        });
      });

      performanceObserverRef.current.observe({ entryTypes: ['measure'] });
    }

    // Set animation completion timer
    const timer = setTimeout(() => {
      setAnimationsComplete(true);
    }, 1000);

    return () => {
      // Cleanup function for performance optimization
      mediaQuery.removeEventListener('change', handleChange);
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
      clearTimeout(timer);
    };
  }, []);

  // Get upcoming events limited by maxEvents, include recent past events if needed
  const getUpcomingEvents = (): CalendarEvent[] => {
    const now = new Date();
    
    // First, get future events
    const futureEvents = events
      .filter(event => event.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    
    // If we have enough future events, return them
    if (futureEvents.length >= maxEvents) {
      return futureEvents.slice(0, maxEvents);
    }
    
    // If not enough future events, add recent past events
    const pastEvents = events
      .filter(event => event.start < now)
      .sort((a, b) => b.start.getTime() - a.start.getTime()) // Most recent first
      .slice(0, maxEvents - futureEvents.length);
    
    // Combine and sort all events by date
    return [...futureEvents, ...pastEvents]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, maxEvents);
  };

  const upcomingEvents = getUpcomingEvents();

  // Determine grid layout class based on number of events
  const getGridLayoutClass = (eventCount: number): string => {
    if (eventCount === 1) return 'events-grid-single';
    if (eventCount === 2) return 'events-grid-dual';
    if (eventCount === 3) return 'events-grid-triple';
    if (eventCount === 4) return 'events-grid-quad';
    if (eventCount === 5) return 'events-grid-five';
    return 'events-grid-full';
  };

  if (upcomingEvents.length === 0) {
    return (
      <div 
        className="events-grid-empty"
        role="status"
        aria-live="polite"
        aria-label="Aucun événement à afficher"
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div 
      className={`events-grid responsive-grid ${prefersReducedMotion ? 'reduced-motion' : ''}`}
      data-testid="events-grid"
    >
      <div 
        className={`events-grid-container ${getGridLayoutClass(upcomingEvents.length)}`}
        role="list"
        aria-label={`${upcomingEvents.length} événement${upcomingEvents.length > 1 ? 's' : ''} à venir`}
      >
        {upcomingEvents.map((event, index) => (
          <div
            key={`${event.id}-${index}`}
            className={`event-card-placeholder event-priority-${Math.min(index + 1, 3)} ${animationsComplete ? 'animation-complete' : ''}`}
            style={{ 
              animationDelay: prefersReducedMotion ? '0ms' : `${index * 100}ms` 
            }}
            onClick={() => onEventClick?.(event)}
            role="listitem"
            tabIndex={onEventClick ? 0 : -1}
            onKeyDown={(e) => {
              if (onEventClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onEventClick(event);
              }
            }}
            aria-label={`Événement: ${event.title}, ${event.start.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}`}
          >
            <EventCard 
              event={event} 
              className={animationsComplete ? 'animation-complete' : ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const EventsGrid = memo(EventsGridComponent, (prevProps, nextProps) => {
  return (
    prevProps.events === nextProps.events &&
    prevProps.maxEvents === nextProps.maxEvents &&
    prevProps.onEventClick === nextProps.onEventClick
  );
});