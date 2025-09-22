import React from 'react';
import { CalendarEvent } from '../../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { darkenColor } from '../../utils/colorUtils';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventHover: (event: React.MouseEvent, eventData: CalendarEvent) => void;
  onEventLeave: () => void;
  isEventHighlighted?: (eventId: string) => boolean;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onEventHover,
  onEventLeave,
  isEventHighlighted = () => false
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

  const days = generateCalendarDays();

  return (
    <div className="month-view">
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, _index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''}`}
              >
                <div className="day-number">
                  {day.getDate()}
                </div>
                <div className="day-events">
                  {dayEvents.slice(0, 2).map((event, eventIndex) => {
                    // Raccourcir drastiquement le titre selon la taille de l'écran
                    const maxLength = window.innerWidth > 1400 ? 20 : window.innerWidth > 1200 ? 15 : 12;
                    const shortTitle = event.title.length > maxLength
                      ? `${event.title.substring(0, maxLength - 3)}...`
                      : event.title;

                    const isHighlighted = isEventHighlighted(event.id);

                    return (
                      <div
                        key={`${event.id}-${event.start.getTime()}-${eventIndex}`}
                        className={`event-item ${event.source} ${isHighlighted ? 'highlighted' : ''}`}
                        style={{
                          backgroundColor: event.color,
                          color: '#ffffff',
                          borderColor: darkenColor(event.color, 0.6),
                          borderWidth: isHighlighted ? '3px' : '2px',
                          borderStyle: 'solid',
                          boxShadow: isHighlighted 
                            ? `0 0 0 2px rgba(0, 61, 122, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)`
                            : `0 2px 6px rgba(0, 0, 0, 0.2)`,
                          transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                          zIndex: isHighlighted ? 10 : 1,
                          fontWeight: '600',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={() => onEventClick(event)}
                        onMouseEnter={(e) => onEventHover(e, event)}
                        onMouseLeave={onEventLeave}
                        title={event.title} // Afficher le titre complet au survol
                      >
                        {isHighlighted && <span className="highlight-indicator">🔍</span>}
                        {shortTitle}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div
                      className="event-item more-events"
                      style={{
                        background: 'linear-gradient(135deg, #6c757d, #495057)',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}
                      title={`${dayEvents.length - 2} autres événements ce jour`}
                    >
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};