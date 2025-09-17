import React, { useState, useEffect } from 'react';
import { CalendarEvent, CalendarSource } from '../types';
import { ICalParser } from '../utils/icalParser';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { syncCalendarStatus, cacheEvents, getCachedEvents } from '../lib/supabase';

const CALENDAR_SOURCES: CalendarSource[] = [
  {
    name: 'Calendrier iCloud',
    url: 'https://p25-caldav.icloud.com/published/2/MjE3MzIxMzkxMTYyMTczMtrwrElZXGcjHRcJohH3ZTG9v2l4po1v88R9tID706X9RxGohLKxmB8cXu3SUYxqWQyqiN7dN3ZkiPAFAAQE2b8',
    source: 'icloud',
    color: '#ff6b6b'
  },
  {
    name: 'Calendrier Outlook UCLouvain',
    url: 'https://outlook.office365.com/owa/calendar/7442b8c05d40441795e06a2f0b095720@uclouvain.be/32bcbe6b269b4cf78cd02da934b381c215406410938849709841/calendar.ics',
    source: 'outlook',
    color: '#4ecdc4'
  }
];

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Septembre 2025
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 5;
  
  // État pour la tooltip
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    visible: false,
    content: '',
    x: 0,
    y: 0
  });

  // Fonction pour nettoyer et formater le contenu HTML
  const cleanHtmlContent = (htmlString: string): string => {
    if (!htmlString) return '';
    
    return htmlString
      // Supprimer les balises HTML
      .replace(/<[^>]*>/g, '')
      // Décoder les entités HTML courantes
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // Nettoyer les espaces multiples
      .replace(/\s+/g, ' ')
      // Supprimer les espaces en début et fin
      .trim();
  };

  // Fonctions pour gérer la tooltip
  const showTooltip = (event: React.MouseEvent, content: string) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const tooltipWidth = Math.min(300, content.length * 8); // Estimation de la largeur
    
    let x = rect.left + rect.width / 2;
    let y = rect.top - 10;
    
    // Ajuster la position si la tooltip dépasse les bords
    if (x + tooltipWidth / 2 > windowWidth - 20) {
      x = windowWidth - tooltipWidth / 2 - 20;
    }
    if (x - tooltipWidth / 2 < 20) {
      x = tooltipWidth / 2 + 20;
    }
    
    setTooltip({
      visible: true,
      content,
      x,
      y
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Fonction pour formater la description en paragraphes lisibles
  const formatDescription = (description: string): JSX.Element[] => {
    if (!description) return [];
    
    const cleanText = cleanHtmlContent(description);
    
    // Diviser en paragraphes basés sur des patterns courants
    const paragraphs = cleanText
      .split(/(?:\r?\n\s*\r?\n|\s{4,}|—\s*—|___+)/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    return paragraphs.map((paragraph, index) => {
      // Détecter les listes (lignes commençant par *, -, •, ou des numéros)
      if (paragraph.includes('*') || paragraph.includes('•') || paragraph.includes('-')) {
        const listItems = paragraph
          .split(/(?:\r?\n|^)\s*[*•-]\s*/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        if (listItems.length > 1) {
          return (
            <ul key={index} className="description-list">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }
      }
      
      // Détecter les informations importantes (contenant des mots-clés)
      const isImportant = /(?:date|heure|lieu|contact|inscription|programme)/i.test(paragraph);
      
      return (
        <p 
          key={index} 
          className={`description-paragraph ${isImportant ? 'important-info' : ''}`}
        >
          {paragraph}
        </p>
      );
    });
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('');
    
    try {
      console.log('🚀 Starting calendar load...');
      
      // Essayer de charger depuis le cache d'abord
      const cachedEvents = await getCachedEvents();
      if (cachedEvents.length > 0) {
        console.log('📦 Loading from cache:', cachedEvents.length, 'events');
        const convertedEvents: CalendarEvent[] = cachedEvents.map(cached => ({
          id: cached.event_id,
          title: cached.title,
          start: new Date(cached.start_date),
          end: new Date(cached.end_date),
          description: cached.description || '',
          location: cached.location || '',
          source: cached.source as 'icloud' | 'outlook',
          allDay: false,
          category: {
            id: cached.category,
            name: cached.category,
            color: cached.color,
            source: cached.source as 'icloud' | 'outlook'
          },
          color: cached.color
        }));
        setEvents(convertedEvents);
        setDebugInfo(`Cache: ${convertedEvents.length} événements chargés`);
      }

      // Charger les événements frais en arrière-plan
      const allEvents: CalendarEvent[] = [];
      const debugMessages: string[] = [];

      for (const source of CALENDAR_SOURCES) {
        try {
          console.log(`📅 Loading ${source.name}...`);
          debugMessages.push(`Loading ${source.name}...`);
          
          const sourceEvents = await ICalParser.fetchAndParse(source.url, source.source);
          allEvents.push(...sourceEvents);
          
          debugMessages.push(`${source.name}: ${sourceEvents.length} événements trouvés`);
          console.log(`${source.name}: ${sourceEvents.length} événements trouvés`);

          // Synchroniser le statut avec Supabase
          await syncCalendarStatus({
            source_name: source.name,
            source_url: source.url,
            last_sync: new Date().toISOString(),
            events_count: sourceEvents.length,
            status: 'success'
          });

        } catch (sourceError) {
          console.error(`❌ Error loading ${source.name}:`, sourceError);
          debugMessages.push(`${source.name}: Erreur - ${sourceError}`);
          
          // Enregistrer l'erreur dans Supabase
          await syncCalendarStatus({
            source_name: source.name,
            source_url: source.url,
            last_sync: new Date().toISOString(),
            events_count: 0,
            status: 'error',
            error_message: sourceError instanceof Error ? sourceError.message : 'Erreur inconnue'
          });
        }
      }

      if (allEvents.length > 0) {
        setEvents(allEvents);
        
        // Mettre en cache les nouveaux événements
        const eventsToCache = allEvents.map(event => ({
          event_id: event.id,
          title: event.title,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          description: event.description,
          location: event.location,
          source: event.source,
          color: event.color,
          category: event.category.name
        }));
        
        await cacheEvents(eventsToCache);
      }

      debugMessages.push(`Total: ${allEvents.length} événements chargés`);
      setDebugInfo(debugMessages.join('\n'));
      
      console.log('✅ Calendar load complete:', allEvents.length, 'events');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ Calendar load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
    setCurrentPage(0); // Réinitialiser la pagination
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setCurrentPage(0); // Réinitialiser la pagination
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getUpcomingEvents = (): CalendarEvent[] => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  const getPaginatedEvents = (): CalendarEvent[] => {
    const upcomingEvents = getUpcomingEvents();
    const startIndex = currentPage * eventsPerPage;
    return upcomingEvents.slice(startIndex, startIndex + eventsPerPage);
  };

  const getTotalPages = (): number => {
    const upcomingEvents = getUpcomingEvents();
    return Math.ceil(upcomingEvents.length / eventsPerPage);
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Commencer par le lundi de la semaine qui contient le premier jour du mois
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 = lundi
    // Finir par le dimanche de la semaine qui contient le dernier jour du mois
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const renderCalendarGrid = () => {
    const days = generateCalendarDays();

    return (
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
                      onClick={() => setSelectedEvent(event)}
                      onMouseEnter={(e) => showTooltip(e, event.title)}
                      onMouseLeave={hideTooltip}
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
    );
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    return (
      <div className="event-details">
        <div className="event-details-header">
          <h3 className="event-details-title">{selectedEvent.title}</h3>
          <button 
            className="close-details-btn"
            onClick={() => setSelectedEvent(null)}
            title="Fermer"
          >
            ✕
          </button>
        </div>
        
        <div className="event-details-content">
          <div className="event-detail-row">
            <span className="detail-icon">📅</span>
            <div className="detail-content">
              <strong>Date</strong>
              <span>{format(selectedEvent.start, 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>
          </div>

          <div className="event-detail-row">
            <span className="detail-icon">🕒</span>
            <div className="detail-content">
              <strong>Heure</strong>
              <span>{
                selectedEvent.allDay 
                  ? 'Toute la journée'
                  : `${format(selectedEvent.start, 'HH:mm')} - ${format(selectedEvent.end, 'HH:mm')}`
              }</span>
            </div>
          </div>

          {selectedEvent.location && (
            <div className="event-detail-row">
              <span className="detail-icon">📍</span>
              <div className="detail-content">
                <strong>Lieu</strong>
                <span>{selectedEvent.location}</span>
              </div>
            </div>
          )}

          {selectedEvent.description && (
            <div className="event-detail-row description-row">
              <span className="detail-icon">📝</span>
              <div className="detail-content">
                <strong>Description</strong>
                <div className="description-content">
                  {formatDescription(selectedEvent.description)}
                </div>
              </div>
            </div>
          )}

          <div className="event-detail-row">
            <span className="detail-icon">🏷️</span>
            <div className="detail-content">
              <strong>Catégorie</strong>
              <span 
                className="category-tag"
                style={{ 
                  backgroundColor: selectedEvent.color,
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {selectedEvent.category.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUpcomingEvents = () => {
    const paginatedEvents = getPaginatedEvents();
    const totalPages = getTotalPages();

    if (paginatedEvents.length === 0) {
      return (
        <div className="upcoming-events">
          <h2>Prochains événements</h2>
          <p className="no-events">Aucun événement à venir</p>
        </div>
      );
    }

    return (
      <div className="upcoming-events">
        <h2>Prochains événements</h2>
        <div className="events-list">
          {paginatedEvents.map((event, _index) => (
            <div
              key={`${event.id}-${event.start.getTime()}`}
              className={`event-card ${event.source}`}
              style={{ '--event-color': event.color } as React.CSSProperties}
              onClick={() => setSelectedEvent(event)}
              onMouseEnter={(e) => showTooltip(e, event.title)}
              onMouseLeave={hideTooltip}
            >
              <div className="event-card-header">
                <h3 className="event-title">{event.title}</h3>
              </div>
              <div className="event-card-body">
                <p className="event-date">
                  <strong>{format(event.start, 'EEEE d MMMM yyyy', { locale: fr })}</strong>
                </p>
                <p className="event-time">
                  {event.allDay 
                    ? 'Toute la journée'
                    : `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
                  }
                </p>
                {event.location && (
                  <p className="event-location">📍 {event.location}</p>
                )}
                <p className="event-category">
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: event.category.color }}
                  >
                    {event.category.name}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="nav-button"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              ← Précédent
            </button>
            <span className="page-info">
              Page {currentPage + 1} sur {totalPages}
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
    );
  };

  if (loading) {
    return <div className="loading">Chargement des calendriers...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button onClick={loadEvents} className="nav-button">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={() => navigateMonth('prev')} className="nav-button">
            ← Précédent
          </button>
          <button onClick={goToToday} className="nav-button">
            Aujourd'hui
          </button>
          <button onClick={() => navigateMonth('next')} className="nav-button">
            Suivant →
          </button>
        </div>
        <h1 className="month-year">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h1>
        <div>
          <button onClick={loadEvents} className="nav-button">
            🔄 Actualiser
          </button>
        </div>
      </div>

      {renderCalendarGrid()}
      {renderEventDetails()}
      {renderUpcomingEvents()}

      {debugInfo && (
        <div className="debug-section">
          <h4>Informations de debug:</h4>
          <pre>{debugInfo}</pre>
          <p>Nombre de jours générés: {generateCalendarDays().length}</p>
        </div>
      )}

      {/* Tooltip personnalisée */}
      {tooltip.visible && (
        <div
          className="event-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};