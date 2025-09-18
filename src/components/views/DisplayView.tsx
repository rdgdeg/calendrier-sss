import React from 'react';
import { CalendarEvent } from '../../types';
import { format, isToday, isTomorrow, isYesterday, startOfDay, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getHighContrastBackgroundColor, getOptimalTextColor, darkenColor } from '../../utils/colorUtils';

interface DisplayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  daysToShow?: number; // Nombre de jours à afficher (par défaut 5)
}

export const DisplayView: React.FC<DisplayViewProps> = ({
  currentDate,
  events,
  onEventClick,
  daysToShow = 5
}) => {
  // Obtenir les 5 prochains événements
  const getUpcomingEvents = (): CalendarEvent[] => {
    const now = new Date();
    return events
      .filter(event => event.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, daysToShow); // Utiliser daysToShow comme nombre d'événements
  };

  // Grouper les événements par date
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

  // Formater la date de manière lisible
  const formatDateHeader = (date: Date): string => {
    if (isToday(date)) {
      return `Aujourd'hui - ${format(date, 'EEEE d MMMM yyyy', { locale: fr })}`;
    } else if (isTomorrow(date)) {
      return `Demain - ${format(date, 'EEEE d MMMM yyyy', { locale: fr })}`;
    } else if (isYesterday(date)) {
      return `Hier - ${format(date, 'EEEE d MMMM yyyy', { locale: fr })}`;
    } else {
      return format(date, 'EEEE d MMMM yyyy', { locale: fr });
    }
  };

  // Formater l'heure
  const formatEventTime = (event: CalendarEvent): string => {
    if (event.allDay) {
      return 'Toute la journée';
    }
    
    const startTime = format(event.start, 'HH:mm');
    const endTime = format(event.end, 'HH:mm');
    
    return `${startTime} - ${endTime}`;
  };

  // Raccourcir le titre si nécessaire
  const formatTitle = (title: string, maxLength: number = 80): string => {
    if (title.length <= maxLength) return title;
    return `${title.substring(0, maxLength - 3)}...`;
  };

  // Raccourcir le lieu si nécessaire
  const formatLocation = (location: string, maxLength: number = 40): string => {
    if (!location) return '';
    if (location.length <= maxLength) return location;
    return `${location.substring(0, maxLength - 3)}...`;
  };

  const upcomingEvents = getUpcomingEvents();
  const groupedEvents = groupEventsByDate(upcomingEvents);
  const dateKeys = Object.keys(groupedEvents).sort();

  return (
    <div className="display-view">
      <div className="display-header-compact">
        <h2 className="display-title-compact">
          📅 Prochains Événements - Secteur SSS UCLouvain
        </h2>
        <div className="display-period-compact">
          {upcomingEvents.length > 0 ? (
            `${upcomingEvents.length} événement${upcomingEvents.length > 1 ? 's' : ''} à venir`
          ) : (
            'Aucun événement à venir'
          )}
        </div>
      </div>

      <div className="display-content-compact">
        {upcomingEvents.length === 0 ? (
          <div className="display-no-events-compact">
            <div className="no-events-icon-compact">📭</div>
            <h3>Aucun événement à venir</h3>
            <p>Consultez le calendrier complet pour voir tous les événements.</p>
          </div>
        ) : (
          <div className="display-events-grid">
            {upcomingEvents.map((event, index) => {
              const isCurrentDay = isToday(event.start);

              return (
                <div
                  key={`${event.id}-${index}`}
                  className={`display-event-card ${event.source} ${isCurrentDay ? 'current-day' : ''}`}
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="display-event-date-badge">
                    <div className="event-day">
                      {format(event.start, 'd')}
                    </div>
                    <div className="event-month">
                      {format(event.start, 'MMM', { locale: fr })}
                    </div>
                  </div>

                  <div className="display-event-content">
                    <div className="display-event-time-compact">
                      🕐 {formatEventTime(event)}
                    </div>
                    
                    <div className="display-event-title-compact">
                      {formatTitle(event.title, 60)}
                    </div>
                    
                    {event.location && (
                      <div className="display-event-location-compact">
                        📍 {formatLocation(event.location, 30)}
                      </div>
                    )}

                    <div className="display-event-source-compact">
                      <span className={`source-badge-compact ${event.source}`}>
                        {event.source === 'icloud' ? '🏢 Duve' : '🎓 SSS'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="display-footer-compact">
        <div className="display-footer-content-compact">
          <div className="display-footer-logo-compact">
            <span className="ucl-logo-compact">🎓</span>
            <span className="ucl-text-compact">UCLouvain - Secteur des Sciences de la Santé</span>
          </div>
          <div className="display-footer-time-compact">
            Mis à jour le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
          </div>
        </div>
      </div>
    </div>
  );
};