import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X } from 'lucide-react';
import { CalendarEvent } from '../types';

interface DayEventsModalProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const DayEventsModal: React.FC<DayEventsModalProps> = ({
  date,
  events,
  onClose,
  onEventClick
}) => {
  return (
    <div className="day-events-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="day-events-modal-title">
      <div className="day-events-modal" onClick={e => e.stopPropagation()}>
        <div className="day-events-modal-header">
          <h3 id="day-events-modal-title">
            Événements du {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
          <button type="button" className="day-events-modal-close" onClick={onClose} aria-label="Fermer">
            <X size={20} aria-hidden />
          </button>
        </div>
        <ul className="day-events-modal-list">
          {events.map(event => (
            <li key={`${event.id}-${event.start.getTime()}`}>
              <button
                type="button"
                className="day-events-modal-item"
                onClick={() => {
                  onEventClick(event);
                  onClose();
                }}
                style={{ borderLeftColor: event.color }}
              >
                <span className="day-events-modal-time">
                  {event.allDay ? 'Toute la journée' : format(event.start, 'HH:mm')}
                </span>
                <span className="day-events-modal-title">{event.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
