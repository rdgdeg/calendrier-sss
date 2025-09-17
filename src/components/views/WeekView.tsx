import React from 'react';
import { CalendarEvent } from '../../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onEventHover: (event: React.MouseEvent, content: string) => void;
    onEventLeave: () => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
    currentDate,
    events,
    onEventClick,
    onEventHover,
    onEventLeave
}) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const hours = Array.from({ length: 24 }, (_, i) => i);



    const getEventPosition = (event: CalendarEvent): { top: number; height: number } => {
        const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
        const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
        const duration = endMinutes - startMinutes;

        return {
            top: (startMinutes / 60) * 60, // 60px par heure
            height: Math.max((duration / 60) * 60, 40) // Minimum 40px pour une meilleure lisibilité
        };
    };

    return (
        <div className="week-view">
            <div className="week-header">
                <div className="time-column-header">Heure</div>
                {weekDays.map(day => (
                    <div key={day.toISOString()} className={`day-header ${isToday(day) ? 'today' : ''}`}>
                        <div className="day-name">{format(day, 'EEE', { locale: fr })}</div>
                        <div className="day-number">{format(day, 'd')}</div>
                    </div>
                ))}
            </div>

            <div className="week-grid">
                <div className="time-column">
                    {hours.map(hour => (
                        <div key={hour} className="time-slot">
                            <span className="time-label">{hour.toString().padStart(2, '0')}:00</span>
                        </div>
                    ))}
                </div>

                {weekDays.map(day => (
                    <div key={day.toISOString()} className="day-column">
                        <div className="day-events-container">
                            {events
                                .filter(event => isSameDay(event.start, day))
                                .map((event, index) => {
                                    const position = getEventPosition(event);
                                    const dayEvents = events.filter(e => isSameDay(e.start, day));
                                    const overlappingEvents = dayEvents.filter(e =>
                                        e.start < event.end && e.end > event.start
                                    );
                                    const eventIndex = overlappingEvents.indexOf(event);
                                    const totalOverlapping = overlappingEvents.length;

                                    const width = totalOverlapping > 1 ? `${100 / totalOverlapping}%` : 'calc(100% - 4px)';
                                    const left = totalOverlapping > 1 ? `${(eventIndex * 100) / totalOverlapping}%` : '2px';

                                    return (
                                        <div
                                            key={`${event.id}-${index}`}
                                            className={`week-event ${event.source}`}
                                            style={{
                                                backgroundColor: event.color,
                                                top: `${position.top}px`,
                                                height: `${position.height}px`,
                                                left: left,
                                                width: width,
                                                position: 'absolute',
                                                zIndex: 10 + index
                                            }}
                                            onClick={() => onEventClick(event)}
                                            onMouseEnter={(e) => onEventHover(e, event.title)}
                                            onMouseLeave={onEventLeave}
                                            title={`${event.title} - ${format(event.start, 'HH:mm')} à ${format(event.end, 'HH:mm')}`}
                                        >
                                            <div className="event-time">
                                                {format(event.start, 'HH:mm')}
                                            </div>
                                            <div className="event-title">{event.title}</div>
                                        </div>
                                    );
                                })}
                        </div>

                        {hours.map(hour => (
                            <div key={hour} className="hour-slot">
                                <div className="hour-line"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};