import React from 'react';
import { CalendarEvent } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSourceDisplayName, getSourceIcon } from '../../utils/sourceUtils';

interface CompactViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventHover: (event: React.MouseEvent, content: string) => void;
  onEventLeave: () => void;
  onDayClick?: (date: Date) => void;
}

export const CompactView: React.FC<CompactViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onEventHover,
  onEventLeave,
  onDayClick
}) => {
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const getEventCountBySource = (dayEvents: CalendarEvent[]) => {
    return dayEvents.reduce((acc, event) => {
      acc[event.source] = (acc[event.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const days = generateCalendarDays();

  return (
    <div className="compact-view">
      <div className="compact-header">
        <h3 className="compact-title">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h3>
      </div>
      
      <div className="compact-calendar">
        <div className="compact-weekdays">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div key={index} className="compact-weekday">{day}</div>
          ))}
        </div>
        
        <div className="compact-days">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const eventCounts = getEventCountBySource(dayEvents);
            
            return (
              <div
                key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                className={`compact-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                onClick={() => onDayClick?.(day)}
              >
                <div className="compact-day-number">
                  {day.getDate()}
                </div>
                
                {dayEvents.length > 0 && (
                  <div className="compact-events-indicator">
                    {dayEvents.length <= 3 ? (
                      // Afficher les points colorés pour chaque événement
                      <div className="event-dots">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <div
                            key={`${event.id}-${eventIndex}`}
                            className="event-dot"
                            style={{ backgroundColor: event.color }}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              onEventHover(e, event.title);
                            }}
                            onMouseLeave={onEventLeave}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      // Afficher un compteur pour les jours avec beaucoup d'événements
                      <div className="events-count">
                        <span className="count-number">{dayEvents.length}</span>
                      </div>
                    )}
                    
                    {/* Indicateurs par source */}
                    <div className="source-indicators">
                      {Object.entries(eventCounts).map(([source, count]) => (
                        <div
                          key={source}
                          className={`source-indicator ${source}`}
                          title={`${count} événement${count > 1 ? 's' : ''} ${getSourceDisplayName(source as 'icloud' | 'outlook')}`}
                        >
                          {getSourceIcon(source as 'icloud' | 'outlook')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Légende */}
      <div className="compact-legend">
        <div className="legend-item">
          <div className="legend-dot today-indicator"></div>
          <span>Aujourd'hui</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot has-events-indicator"></div>
          <span>Jour avec événements</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">{getSourceIcon('icloud')}</span>
          <span>{getSourceDisplayName('icloud')}</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">{getSourceIcon('outlook')}</span>
          <span>{getSourceDisplayName('outlook')}</span>
        </div>
      </div>
    </div>
  );
};