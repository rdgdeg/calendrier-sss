import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { extractImagesFromDescription } from '../utils/imageExtractor';

interface UpcomingEventsSectionProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onExportToGoogle: (event: CalendarEvent) => void;
  onExportToOutlook: (event: CalendarEvent) => void;
  onExportToICS: (event: CalendarEvent) => void;

  eventsPerPage?: number;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  onEventClick,
  onExportToGoogle,
  onExportToOutlook,
  onExportToICS,

  eventsPerPage = 6
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer et trier les événements à venir
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => event.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events]);

  // Pagination
  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = upcomingEvents.slice(startIndex, startIndex + eventsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatEventDate = (date: Date) => {
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  const formatEventTime = (start: Date, end: Date, allDay?: boolean) => {
    if (allDay) return 'Toute la journée';
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'icloud': return 'de Duve';
      case 'outlook': return 'SSS';
      default: return source;
    }
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className="upcoming-events-section">
        <div className="upcoming-events-header">
          <h3 className="upcoming-events-title">📅 Prochains événements</h3>
        </div>
        <div className="no-upcoming-events">
          <p>Aucun événement à venir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-events-section">
      <div className="upcoming-events-header">
        <h3 className="upcoming-events-title">📅 Prochains événements</h3>
        <div className="events-pagination-info">
          {upcomingEvents.length} événement{upcomingEvents.length > 1 ? 's' : ''} à venir
        </div>
      </div>

      <div className="upcoming-events-grid">
        {currentEvents.map((event, index) => {
          const processedContent = event.description ? extractImagesFromDescription(event.description) : null;
          
          return (
            <div key={`${event.id}-${index}`} className="upcoming-event-card">
              <div className="upcoming-event-header">
                <div className="upcoming-event-date-time">
                  <div className="upcoming-event-date">
                    {formatEventDate(event.start)}
                  </div>
                  <div className="upcoming-event-time">
                    {formatEventTime(event.start, event.end, event.allDay)}
                  </div>
                </div>
                <div className={`upcoming-event-source upcoming-event-source-${event.source}`}>
                  {getSourceLabel(event.source)}
                </div>
              </div>

              <div className="upcoming-event-content">
                <h4 
                  className="upcoming-event-title"
                  onClick={() => onEventClick(event)}
                  title="Cliquer pour voir les détails"
                >
                  {event.title}
                </h4>
                
                {event.location && (
                  <div className="upcoming-event-location">
                    📍 {event.location}
                  </div>
                )}

                {processedContent && processedContent.cleanDescription && (
                  <div className="upcoming-event-description">
                    {processedContent.cleanDescription.length > 100 
                      ? `${processedContent.cleanDescription.substring(0, 100)}...`
                      : processedContent.cleanDescription
                    }
                  </div>
                )}


              </div>

            <div className="upcoming-event-actions">
              <div className="primary-actions">
                <button
                  onClick={() => onEventClick(event)}
                  className="btn-event-details"
                  title="Voir les détails"
                >
                  👁️ Détails
                </button>
              </div>
              <div className="export-buttons-compact">
                <button
                  onClick={() => onExportToGoogle(event)}
                  className="btn-export-compact google"
                  title="Exporter vers Google Calendar"
                >
                  📅
                </button>
                <button
                  onClick={() => onExportToOutlook(event)}
                  className="btn-export-compact outlook"
                  title="Exporter vers Outlook"
                >
                  📧
                </button>
                <button
                  onClick={() => onExportToICS(event)}
                  className="btn-export-compact ics"
                  title="Télécharger fichier ICS"
                >
                  💾
                </button>
              </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="upcoming-events-pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Précédent
          </button>
          
          <div className="pagination-info">
            Page {currentPage} sur {totalPages}
          </div>
          
          <div className="pagination-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
};