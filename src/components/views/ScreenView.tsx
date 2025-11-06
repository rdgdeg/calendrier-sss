import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types';
import { format, isToday, isTomorrow, isYesterday, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ScreenViewProps {
  events: CalendarEvent[];
}

export const ScreenView: React.FC<ScreenViewProps> = ({ events }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mettre à jour l'heure toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minute

    return () => clearInterval(timer);
  }, []);

  // Filtrer et trier les 5 prochains événements
  const getUpcomingEvents = (): CalendarEvent[] => {
    const now = new Date();
    
    return events
      .filter(event => event.start >= now || (event.end >= now && event.start <= now))
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  // Formater la date de manière intelligente
  const formatEventDate = (date: Date): string => {
    if (isToday(date)) {
      return "Aujourd'hui";
    } else if (isTomorrow(date)) {
      return "Demain";
    } else if (isYesterday(date)) {
      return "Hier";
    } else {
      // Vérifier si c'est dans la semaine courante
      const today = new Date();
      const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7 && daysDiff > 0) {
        return format(date, 'EEEE', { locale: fr });
      } else {
        return format(date, 'EEEE d MMMM', { locale: fr });
      }
    }
  };

  // Formater l'heure
  const formatEventTime = (event: CalendarEvent): string => {
    if (event.allDay) {
      return "Toute la journée";
    }
    
    const startTime = format(event.start, 'HH:mm');
    const endTime = format(event.end, 'HH:mm');
    
    // Si même jour, afficher juste les heures
    if (isSameDay(event.start, event.end)) {
      return `${startTime} - ${endTime}`;
    } else {
      return `${startTime} - ${format(event.end, 'dd/MM HH:mm')}`;
    }
  };

  // Obtenir le statut de l'événement
  const getEventStatus = (event: CalendarEvent): 'current' | 'upcoming' | 'today' => {
    const now = new Date();
    
    if (event.start <= now && event.end >= now) {
      return 'current';
    } else if (isToday(event.start)) {
      return 'today';
    } else {
      return 'upcoming';
    }
  };

  return (
    <div className="screen-view">
      {/* Header avec horloge */}
      <div className="screen-header">
        <div className="screen-title">
          <h1>📅 Prochains événements SSS</h1>
          <div className="ucl-branding">UCLouvain</div>
        </div>
        <div className="screen-clock">
          <div className="current-time">
            {format(currentTime, 'HH:mm')}
          </div>
          <div className="current-date">
            {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
          </div>
        </div>
      </div>

      {/* Liste des événements */}
      <div className="screen-events">
        {upcomingEvents.length === 0 ? (
          <div className="no-events-screen">
            <div className="no-events-icon">📅</div>
            <div className="no-events-message">
              Aucun événement à venir
            </div>
            <div className="no-events-submessage">
              Consultez le calendrier complet pour plus d'informations
            </div>
          </div>
        ) : (
          upcomingEvents.map((event, index) => {
            const status = getEventStatus(event);
            
            return (
              <div 
                key={`${event.id}-${index}`}
                className={`screen-event ${status}`}
                style={{
                  '--event-color': event.color,
                  '--event-index': index
                } as React.CSSProperties}
              >
                <div className="event-indicator">
                  <div 
                    className="event-dot"
                    style={{ backgroundColor: event.color }}
                  ></div>
                  <div className="event-number">{index + 1}</div>
                </div>
                
                <div className="event-content">
                  <div className="event-datetime">
                    <div className="event-date">
                      {formatEventDate(event.start)}
                    </div>
                    <div className="event-time">
                      {formatEventTime(event)}
                    </div>
                  </div>
                  
                  <div className="event-details">
                    <h2 className="event-title">
                      {status === 'current' && <span className="live-indicator">🔴 EN COURS</span>}
                      {event.title}
                    </h2>
                    
                    {event.location && (
                      <div className="event-location">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="event-source">
                  <div className={`source-badge ${event.source}`}>
                    {event.source === 'icloud' ? '🍎 iCloud' : '📧 Outlook'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer avec informations */}
      <div className="screen-footer">
        <div className="footer-info">
          <span>Mise à jour automatique</span>
          <span>•</span>
          <span>Dernière synchronisation : {format(currentTime, 'HH:mm')}</span>
        </div>
        <div className="footer-branding">
          Calendrier SSS - UCLouvain
        </div>
      </div>
    </div>
  );
};