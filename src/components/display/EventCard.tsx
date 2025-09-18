import React, { memo, useState } from 'react';
import { CalendarEvent } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EventIcon } from './EventIcon';

interface EventCardProps {
  event: CalendarEvent;
  className?: string;
}

const EventCardComponent: React.FC<EventCardProps> = ({ event, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatEventDate = (start: Date) => {
    return format(start, 'EEEE d MMMM', { locale: fr });
  };

  const formatEventTime = (start: Date, end: Date, allDay?: boolean) => {
    if (allDay) {
      return 'Toute la journée';
    }
    
    const startTime = format(start, 'HH:mm');
    const endTime = format(end, 'HH:mm');
    return `${startTime} - ${endTime}`;
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'icloud':
        return 'de Duve';
      case 'outlook':
        return 'SSS';
      default:
        return source;
    }
  };

  const truncateTitle = (title: string, maxLength: number = 600): string => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  return (
    <article 
      className={`event-card slide-in-up ${isHovered ? 'hover-effect' : ''} ${className}`}
      role="article"
      aria-labelledby={`event-title-${event.id}`}
      aria-describedby={`event-details-${event.id}`}
      data-testid="event-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="event-card-content">
        {/* Header avec date et heure séparées */}
        <div className="event-card-header">
          <div className="event-datetime-block">
            <div className="event-date">
              <span className="sr-only">Date: </span>
              {formatEventDate(event.start)}
            </div>
            <div className="event-time">
              <span className="sr-only">Heure: </span>
              {formatEventTime(event.start, event.end, event.allDay)}
            </div>
          </div>
          <div className={`event-source event-source-${event.source}`}>
            <span className="sr-only">Source: </span>
            {getSourceLabel(event.source)}
          </div>
        </div>
        
        {/* Titre avec icône */}
        <div className="event-title-section">
          <EventIcon event={event} size={18} />
          <h3 
            id={`event-title-${event.id}`}
            className="event-title"
          >
            {truncateTitle(event.title)}
          </h3>
        </div>
        
        {/* Description */}
        {event.description && (
          <div 
            id={`event-details-${event.id}`}
            className="event-description"
          >
            <span className="sr-only">Description: </span>
            {event.description}
          </div>
        )}

        {/* Lieu si présent */}
        {event.location && (
          <div className="event-location">
            <span className="sr-only">Lieu: </span>
            📍 {event.location}
          </div>
        )}
      </div>
    </article>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const EventCard = memo(EventCardComponent, (prevProps, nextProps) => {
  // Re-render only if event data changes
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.title === nextProps.event.title &&
    prevProps.event.start.getTime() === nextProps.event.start.getTime() &&
    prevProps.event.end.getTime() === nextProps.event.end.getTime() &&
    prevProps.event.location === nextProps.event.location &&
    prevProps.event.description === nextProps.event.description &&
    prevProps.className === nextProps.className
  );
});