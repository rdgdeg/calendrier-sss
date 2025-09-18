import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '../../types';
import { format, isSameDay, startOfDay, addDays, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSourceDisplayName } from '../../utils/sourceUtils';
import { EventDescription } from '../EventDescription';
import { getHighContrastTitleColor } from '../../utils/colorUtils';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventHover: (event: React.MouseEvent, eventData: CalendarEvent) => void;
  onEventLeave: () => void;
  isEventHighlighted?: (eventId: string) => boolean;
  selectedEventId?: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  onEventClick,
  onEventHover,
  onEventLeave,
  isEventHighlighted = () => false,
  selectedEventId
}) => {
  const [dateRange, setDateRange] = useState('all'); // 'all', '7', '30', '60', '90'
  const [showPastEvents, setShowPastEvents] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  const eventsPerPage = 20;
  const selectedEventRef = useRef<HTMLDivElement>(null);

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getFilteredEvents = (): CalendarEvent[] => {
    let filteredEvents = [...events];
    const now = new Date();

    // Filtrer par période si ce n'est pas "all"
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const startDate = showPastEvents ? addDays(now, -days) : startOfDay(now);
      const endDate = addDays(now, days);

      filteredEvents = filteredEvents.filter(event => {
        const eventDate = startOfDay(event.start);
        const afterStart = isAfter(eventDate, startDate) || isSameDay(eventDate, startDate);
        const beforeEnd = isBefore(eventDate, endDate) || isSameDay(eventDate, endDate);
        return afterStart && beforeEnd;
      });
    } else if (!showPastEvents) {
      // Si "all" mais pas d'événements passés
      filteredEvents = filteredEvents.filter(event => {
        return isAfter(event.start, now) || isSameDay(event.start, now);
      });
    }

    return filteredEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
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
  const totalEvents = filteredEvents.length;
  const totalPages = Math.ceil(totalEvents / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  );
  const groupedEvents = groupEventsByDate(paginatedEvents);
  const dateKeys = Object.keys(groupedEvents).sort();

  // Effet pour faire défiler vers l'événement sélectionné
  useEffect(() => {
    if (selectedEventId && selectedEventRef.current) {
      selectedEventRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedEventId]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(0);
  }, [dateRange, showPastEvents, events.length]);

  const isEventToday = (event: CalendarEvent): boolean => {
    return isSameDay(event.start, new Date());
  };

  const isEventPast = (event: CalendarEvent): boolean => {
    return isBefore(event.start, new Date());
  };

  return (
    <div className="agenda-view">
      <div className="agenda-controls">
        <div className="agenda-filters">
          <div className="date-range-controls">
            <label>Période :</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="range-select"
            >
              <option value="all">Tous</option>
              <option value="7">7 jours</option>
              <option value="14">2 semaines</option>
              <option value="30">1 mois</option>
              <option value="60">2 mois</option>
              <option value="90">3 mois</option>
            </select>
          </div>
          
          <div className="past-events-toggle">
            <label>
              <input
                type="checkbox"
                checked={showPastEvents}
                onChange={(e) => setShowPastEvents(e.target.checked)}
              />
              Événements passés
            </label>
          </div>
        </div>

        <div className="agenda-summary">
          <div className="summary-stats">
            <span className="total-events">
              {totalEvents} événement{totalEvents > 1 ? 's' : ''} au total
            </span>
            {totalPages > 1 && (
              <span className="page-info">
                Page {currentPage + 1} sur {totalPages}
              </span>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="agenda-pagination">
              <button
                className="nav-button"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                ← Précédent
              </button>
              <span className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </span>
              <button
                className="nav-button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
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
                  {dayEvents.map((event, index) => {
                    const isExpanded = expandedEvents.has(event.id);
                    const hasDetails = event.description || event.location;
                    const isHighlighted = isEventHighlighted(event.id);
                    const isSelected = selectedEventId === event.id;
                    
                    return (
                      <div
                        key={`${event.id}-${index}`}
                        ref={isSelected ? selectedEventRef : undefined}
                        className={`agenda-event-card ${event.source} ${isEventToday(event) ? 'today' : ''} ${isEventPast(event) ? 'past' : ''} ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
                        style={{
                          borderLeftColor: event.color,
                          borderLeftWidth: isHighlighted || isSelected ? '4px' : '3px'
                        }}
                      >
                        <div 
                          className="agenda-event-header"
                          onMouseEnter={(e) => onEventHover(e, event)}
                          onMouseLeave={onEventLeave}
                          onClick={() => {
                            setSelectedEvent(event);
                            onEventClick(event);
                          }}
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
                          
                          <div className="event-main-info">
                            <h4 className="event-title" style={{ color: getHighContrastTitleColor(event.color) }}>
                              {isHighlighted && <span className="search-indicator">🔍 </span>}
                              {event.title}
                            </h4>
                            <span className="event-source-badge">
                              {getSourceDisplayName(event.source)}
                            </span>
                          </div>
                          
                          <div className="event-actions-header">
                            {hasDetails && (
                              <button
                                className={`expand-button ${isExpanded ? 'expanded' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEventExpansion(event.id);
                                }}
                                aria-label={isExpanded ? 'Réduire les détails' : 'Voir les détails'}
                              >
                                {isExpanded ? '▲' : '▼'}
                              </button>
                            )}
                            <button
                              className="btn-view-modal"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event);
                              }}
                              title="Ouvrir dans une fenêtre"
                            >
                              🔍
                            </button>
                          </div>
                        </div>
                        
                        {hasDetails && isExpanded && (
                          <div className="agenda-event-details">
                            {event.location && (
                              <div className="event-detail-item">
                                <span className="detail-icon">📍</span>
                                <span className="detail-text">{event.location}</span>
                              </div>
                            )}
                            
                            {event.description && (
                              <div className="event-detail-item">
                                <span className="detail-icon">📝</span>
                                <div className="detail-text">
                                  <EventDescription 
                                    description={event.description}
                                    className="event-description-full"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};