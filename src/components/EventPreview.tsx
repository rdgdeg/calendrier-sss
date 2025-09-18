import React from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { EventDescription } from './EventDescription';

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
  const truncateDescription = (description: string, maxLength: number): string => {
    if (!description) return '';
    
    // Nettoyer le HTML d'abord
    const cleanText = description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanText.length <= maxLength) return cleanText;
    
    // Trouver le dernier espace avant la limite pour éviter de couper un mot
    const truncated = cleanText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > maxLength * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
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
      
      {event.description && (
        <div className="event-preview-description">
          <EventDescription 
            description={truncateDescription(event.description, maxDescriptionLength)}
            className="event-description-preview"
          />
        </div>
      )}
      

    </div>
  );
};