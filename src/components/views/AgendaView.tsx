import React, { useState } from 'react';
import { CalendarEvent } from '../../types';
import { format, isSameDay, startOfDay, addDays, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSourceDisplayName } from '../../utils/sourceUtils';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventHover: (event: React.MouseEvent, content: string) => void;
  onEventLeave: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  onEventClick,
  onEventHover,
  onEventLeave
}) => {
  const [dateRange, setDateRange] = useState(30); // Nombre de jours à afficher
  const [showPastEvents, setShowPastEvents] = useState(false);

  const getFilteredEvents = (): CalendarEvent[] => {
    const now = new Date();
    const startDate = showPastEvents ? addDays(now, -dateRange) : startOfDay(now);
    const endDate = addDays(now, dateRange);

    return events
      .filter(event => {
        const eventDate = startOfDay(event.start);
        return isAfter(eventDate, startDate) || isSameDay(eventDate, startDate);
      })
      .filter(event => {
        const eventDate = startOfDay(event.start);
        return isBefore(eventDate, endDate) || isSameDay(eventDate, endDate);
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const groupEventsByDate = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
    return events.reduce((groups, event) => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {} as Record<string, CalendarEvent[]>);
  };

  const filteredEvents = getFilteredEvents();
  const groupedEvents = groupEventsByDate(filteredEvents);
  const dateKeys = Object.keys(groupedEvents).sort();

  const isEventToday = (event: CalendarEvent): boolean => {
    return isSameDay(event.start, new Date());
  };

  const isEventPast = (event: CalendarEvent): boolean => {
    return isBefore(event.start, new Date());
  };

  return (
    <div className="agenda-view">
      <div className="agenda-controls">
        <div className="date-range-controls">
          <label>Période d'affichage :</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="range-select"
          >
            <option value={7}>7 jours</option>
            <option value={14}>2 semaines</option>
            <option value={30}>1 mois</option>
            <option value={60}>2 mois</option>
            <option value={90}>3 mois</option>
          </select>
        </div>
        
        <div className="past-events-toggle">
          <label>
            <input
              type="checkbox"
              checked={showPastEvents}
              onChange={(e) => setShowPastEvents(e.target.checked)}
            />
            Inclure les événements passés
          </label>
        </div>
      </div>

      <div className="agenda-summary">
        <p>{filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}</p>
      </div>

      <div className="agenda-list">
        {dateKeys.length === 0 ? (
          <div className="no-events">
            <p>Aucun événement trouvé pour cette période</p>
          </div>
        ) : (
          dateKeys.map(dateKey => {
            const dayEvents = groupedEvents[dateKey];
            const eventDate = new Date(dateKey);
            
            return (
              <div key={dateKey} className="agenda-day-group">
                <div className="agenda-date-header">
                  <h3 className="date-title">
                    {format(eventDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </h3>
                  <span className="events-count">
                    {dayEvents.length} événement{dayEvents.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="agenda-events">
                  {dayEvents.map((event, index) => (
                    <div
                      key={`${event.id}-${index}`}
                      className={`agenda-event ${event.source} ${isEventToday(event) ? 'today' : ''} ${isEventPast(event) ? 'past' : ''}`}
                      onClick={() => onEventClick(event)}
                      onMouseEnter={(e) => onEventHover(e, event.title)}
                      onMouseLeave={onEventLeave}
                    >
                      <div className="event-time-indicator">
                        <div 
                          className="time-dot"
                          style={{ backgroundColor: event.color }}
                        ></div>
                        <div className="event-time">
                          {event.allDay 
                            ? 'Toute la journée'
                            : `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
                          }
                        </div>
                      </div>
                      
                      <div className="event-content">
                        <h4 className="event-title">{event.title}</h4>
                        
                        {event.location && (
                          <p className="event-location">
                            <span className="location-icon">📍</span>
                            {event.location}
                          </p>
                        )}
                        
                        <div className="event-meta">
                          <span 
                            className="event-category"
                            style={{ 
                              backgroundColor: event.color,
                              color: 'white'
                            }}
                          >
                            {event.category.name}
                          </span>
                          <span className="event-source">{getSourceDisplayName(event.source)}</span>
                        </div>
                        
                        {event.description && (
                          <p className="event-description">
                            {event.description.length > 100 
                              ? `${event.description.substring(0, 100)}...`
                              : event.description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};