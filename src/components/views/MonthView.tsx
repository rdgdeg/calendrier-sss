import React from 'react';
import { CalendarEvent } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventHover: (event: React.MouseEvent, content: string) => void;
  onEventLeave: () => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onEventHover,
  onEventLeave
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
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={`${event.id}-${event.start.getTime()}-${eventIndex}`}
                      className={`event-item ${event.source}`}
                      style={{ 
                        backgroundColor: event.color, 
                        borderLeftColor: `rgba(255, 255, 255, 0.4)`,
                        boxShadow: `0 1px 3px rgba(0, 0, 0, 0.2)`
                      }}
                      onClick={() => onEventClick(event)}
                      onMouseEnter={(e) => onEventHover(e, event.title)}
                      onMouseLeave={onEventLeave}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="event-item more-events" style={{ background: '#999' }}>
                      +{dayEvents.length - 3} autres
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