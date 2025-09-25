import React, { useMemo } from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { EventDescription } from './EventDescription';
import { extractImagesFromDescription } from '../utils/imageExtractor';

interface EventPreviewProps {
  event: CalendarEvent;
  maxDescriptionLength?: number;
  showTime?: boolean;
  showLocation?: boolean;
  className?: string;
}

export const EventPreview: React.FC<EventPreviewProps> = ({
  event,
  maxDescriptionLength = 150,
  showTime = true,
  showLocation = true,
  className = ''
}) => {
  const processedContent = useMemo(() => {
    if (!event.description) {
      return null;
    }

    return extractImagesFromDescription(event.description);
  }, [event.description]);

  const descriptionToRender = processedContent?.cleanDescription ?? event.description ?? '';
  const hasDescription = descriptionToRender.trim().length > 0;

  const truncateDescription = (description: string, maxLength: number): string => {
    if (!description) return '';

    const normalized = description.trim();

    if (normalized.length <= maxLength) {
      return normalized;
    }

    const truncated = normalized.substring(0, maxLength);
    const lastBreak = Math.max(truncated.lastIndexOf('\n'), truncated.lastIndexOf(' '));

    if (lastBreak > maxLength * 0.6) {
      return `${truncated.substring(0, lastBreak).trim()}...`;
    }

    return `${truncated.trim()}...`;
  };

  return (
    <div className={`event-preview ${className}`}>
      <div className="event-preview-header">
        <h4 className="event-preview-title">{event.title}</h4>
        {showTime && (
          <div className="event-preview-time">
            {event.allDay 
              ? 'Toute la journée'
              : `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
            }
          </div>
        )}
      </div>
      
      {showLocation && event.location && (
        <div className="event-preview-location">
          <span className="location-icon">📍</span>
          {event.location}
        </div>
      )}
      
      {hasDescription && (
        <div className="event-preview-description">
          <EventDescription
            description={truncateDescription(descriptionToRender, maxDescriptionLength)}
            className="event-description-preview"
          />
        </div>
      )}
      

    </div>
  );
};