import React, { memo, useState } from 'react';
import { CalendarEvent } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EventIcon } from './EventIcon';
import { ResponsiveText, useScreenSize } from './ResponsiveText';
import { textFormatter } from '../../utils/textFormatter';

interface EventCardProps {
  event: CalendarEvent;
  className?: string;
}

const EventCardComponent: React.FC<EventCardProps> = ({ event, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [iconSize, setIconSize] = useState(24);
  const screenSize = useScreenSize();

  // Adjust icon size based on screen size
  React.useEffect(() => {
    const updateIconSize = () => {
      if (window.innerWidth >= 1920) {
        setIconSize(36);
      } else if (window.innerWidth >= 1400) {
        setIconSize(30);
      } else {
        setIconSize(24);
      }
    };

    updateIconSize();
    window.addEventListener('resize', updateIconSize);
    return () => window.removeEventListener('resize', updateIconSize);
  }, []);

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

  // Get max length for title based on screen size
  const getTitleMaxLength = (): number => {
    switch (screenSize) {
      case 'mobile':
        return 60;
      case 'tablet':
        return 80;
      case 'desktop':
        return 120;
      case 'tv':
        return 200;
      default:
        return 120;
    }
  };

  // Format title using TextFormatter
  const formatTitle = (title: string): string => {
    const formattedTitle = textFormatter.formatTitle(title, {
      maxLength: getTitleMaxLength(),
      preserveWords: true,
      showEllipsis: true,
      breakLongWords: false
    });
    return formattedTitle.content as string;
  };

  // Format description for short preview
  const formatDescription = (description: string): string => {
    const maxLength = screenSize === 'mobile' ? 100 : screenSize === 'tablet' ? 150 : 200;
    const formattedDesc = textFormatter.formatDescription(description, {
      maxLength,
      preserveWords: true,
      showEllipsis: true,
      breakLongWords: true
    });
    return formattedDesc.content as string;
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
              <ResponsiveText
                text={formatEventDate(event.start)}
                variant="metadata"
                screenSize={screenSize}
                className="event-date-text"
              />
            </div>
            <div className="event-time">
              <span className="sr-only">Heure: </span>
              <ResponsiveText
                text={formatEventTime(event.start, event.end, event.allDay)}
                variant="metadata"
                screenSize={screenSize}
                className="event-time-text"
              />
            </div>
          </div>
          <div className={`event-source event-source-${event.source}`}>
            <span className="sr-only">Source: </span>
            <ResponsiveText
              text={getSourceLabel(event.source)}
              variant="metadata"
              screenSize={screenSize}
              className="event-source-text"
            />
          </div>
        </div>
        
        {/* Titre avec icône */}
        <div className="event-title-section">
          <EventIcon event={event} size={iconSize} />
          <h3 
            id={`event-title-${event.id}`}
            className="event-title"
          >
            <ResponsiveText
              text={formatTitle(event.title)}
              variant="title"
              screenSize={screenSize}
              className="event-title-text"
            />
          </h3>
        </div>
        
        {/* Description */}
        {event.description && (
          <div 
            id={`event-details-${event.id}`}
            className="event-description"
          >
            <span className="sr-only">Description: </span>
            <ResponsiveText
              text={formatDescription(event.description)}
              variant="description"
              screenSize={screenSize}
              maxLines={screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 3 : 3}
              className="event-description-text"
            />
          </div>
        )}

        {/* Lieu si présent */}
        {event.location && (
          <div className="event-location">
            <span className="sr-only">Lieu: </span>
            <span className="location-icon">📍</span>
            <ResponsiveText
              text={event.location}
              variant="metadata"
              screenSize={screenSize}
              className="event-location-text"
            />
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