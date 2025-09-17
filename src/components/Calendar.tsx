import React, { useState, useEffect } from 'react';
import { CalendarEvent, CalendarSource, CalendarView } from '../types';
import { ICalParser } from '../utils/icalParser';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { syncCalendarStatus, cacheEvents, getCachedEvents } from '../lib/supabase';
import { ViewSelector } from './ViewSelector';
import { MonthView } from './views/MonthView';
import { WeekView } from './views/WeekView';
import { AgendaView } from './views/AgendaView';
import { CompactView } from './views/CompactView';

const CALENDAR_SOURCES: CalendarSource[] = [
  {
    name: 'Calendrier de Duve',
    url: 'https://p25-caldav.icloud.com/published/2/MjE3MzIxMzkxMTYyMTczMtrwrElZXGcjHRcJohH3ZTG9v2l4po1v88R9tID706X9RxGohLKxmB8cXu3SUYxqWQyqiN7dN3ZkiPAFAAQE2b8',
    source: 'icloud',
    color: '#ff9999'
  },
  {
    name: 'Calendrier Secteur SSS',
    url: 'https://outlook.office365.com/owa/calendar/7442b8c05d40441795e06a2f0b095720@uclouvain.be/32bcbe6b269b4cf78cd02da934b381c215406410938849709841/calendar.ics',
    source: 'outlook',
    color: '#87ceeb'
  }
];

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Septembre 2025
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 5;
  const [sourceFilter, setSourceFilter] = useState<'all' | 'icloud' | 'outlook'>('all');
  
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

  // Fonction améliorée pour formater la description avec retours à la ligne après chaque phrase
  const formatDescription = (description: string): JSX.Element[] => {
    if (!description) return [];
    
    // Préserver les retours à la ligne HTML avant le nettoyage
    let processedText = description
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div[^>]*>/gi, '');
    
    const cleanText = cleanHtmlContent(processedText);
    
    // Diviser le texte en phrases (après chaque point suivi d'un espace ou fin de ligne)
    const sentences = cleanText
      .split(/\.(?:\s+|$)/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => sentence.endsWith('.') ? sentence : sentence + '.');
    
    // Regrouper les phrases courtes ensemble (moins de 50 caractères)
    const groupedSentences: string[] = [];
    let currentGroup = '';
    
    sentences.forEach((sentence, index) => {
      if (sentence.length < 50 && currentGroup.length < 100) {
        currentGroup += (currentGroup ? ' ' : '') + sentence;
      } else {
        if (currentGroup) {
          groupedSentences.push(currentGroup);
          currentGroup = '';
        }
        groupedSentences.push(sentence);
      }
      
      // Ajouter le dernier groupe s'il existe
      if (index === sentences.length - 1 && currentGroup) {
        groupedSentences.push(currentGroup);
      }
    });
    
    return groupedSentences.map((sentence, index) => {
      // Détecter les informations importantes (contenant des mots-clés)
      const isImportant = /(?:date|heure|lieu|contact|inscription|programme|horaire|adresse|public|catégories)/i.test(sentence);
      
      // Détecter les listes (contenant des puces ou des énumérations)
      if (sentence.includes('*') || sentence.includes('•') || sentence.includes('-') || /^\d+\./.test(sentence.trim())) {
        const listItems = sentence
          .split(/[*•-]|\d+\./)
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
      
      return (
        <div 
          key={index} 
          className={`description-sentence ${isImportant ? 'important-info' : ''}`}
        >
          {sentence}
        </div>
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

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'week':
          return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1);
        case 'month':
        case 'compact':
        default:
          return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
      }
    });
    setCurrentPage(0); // Réinitialiser la pagination
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setCurrentPage(0); // Réinitialiser la pagination
  };

  const getNavigationLabel = (): string => {
    switch (currentView) {
      case 'week':
        return format(currentDate, "'Semaine du' d MMMM yyyy", { locale: fr });
      case 'month':
      case 'compact':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      case 'agenda':
        return 'Vue Agenda';
      default:
        return format(currentDate, 'MMMM yyyy', { locale: fr });
    }
  };

  const getFilteredEvents = (): CalendarEvent[] => {
    if (sourceFilter === 'all') {
      return events;
    }
    return events.filter(event => event.source === sourceFilter);
  };

  const getUpcomingEvents = (): CalendarEvent[] => {
    const now = new Date();
    const filteredEvents = getFilteredEvents();
    return filteredEvents
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

  const renderCurrentView = () => {
    const filteredEvents = getFilteredEvents();
    const commonProps = {
      currentDate,
      events: filteredEvents,
      onEventClick: setSelectedEvent,
      onEventHover: showTooltip,
      onEventLeave: hideTooltip
    };

    switch (currentView) {
      case 'month':
        return <MonthView {...commonProps} />;
      case 'week':
        return <WeekView {...commonProps} />;
      case 'agenda':
        return <AgendaView {...commonProps} />;
      case 'compact':
        return <CompactView {...commonProps} onDayClick={(date) => {
          setCurrentDate(date);
          setCurrentView('month');
        }} />;
      default:
        return <MonthView {...commonProps} />;
    }
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    return (
      <div className="event-details-inline">
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
          <div className="event-details-grid">
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

            <div className="event-detail-row">
              <span className="detail-icon">📅</span>
              <div className="detail-content">
                <strong>Source</strong>
                <span 
                  className="source-tag"
                  style={{ 
                    backgroundColor: selectedEvent.source === 'icloud' ? '#ffe6e6' : '#e6f3ff',
                    color: selectedEvent.source === 'icloud' ? '#cc4444' : '#4488cc',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: `1px solid ${selectedEvent.source === 'icloud' ? '#ffcccc' : '#cce6ff'}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {selectedEvent.source === 'icloud' ? 'Calendrier de Duve' : 'Secteur SSS'}
                </span>
              </div>
            </div>
          </div>

          {selectedEvent.description && (
            <div className="event-description-section">
              <div className="description-header">
                <span className="detail-icon">📝</span>
                <strong>Description</strong>
              </div>
              <div className="description-content">
                {formatDescription(selectedEvent.description)}
              </div>
            </div>
          )}
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
                <p className="event-source">
                  <span 
                    className="source-badge"
                    style={{ 
                      backgroundColor: event.source === 'icloud' ? '#ffe6e6' : '#e6f3ff',
                      color: event.source === 'icloud' ? '#cc4444' : '#4488cc',
                      padding: '4px 10px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      fontWeight: '500',
                      border: `1px solid ${event.source === 'icloud' ? '#ffcccc' : '#cce6ff'}`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {event.source === 'icloud' ? 'Duve' : 'SSS'}
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
    <div className="calendar-container fade-in">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button 
            onClick={() => navigateDate('prev')} 
            className="nav-button"
            aria-label="Mois précédent"
          >
            ← Précédent
          </button>
          <button 
            onClick={goToToday} 
            className="nav-button"
            aria-label="Aller à aujourd'hui"
          >
            Aujourd'hui
          </button>
          <button 
            onClick={() => navigateDate('next')} 
            className="nav-button"
            aria-label="Mois suivant"
          >
            Suivant →
          </button>
        </div>
        
        <h1 className="month-year">
          {getNavigationLabel()}
        </h1>
        
        <div className="header-controls">
          <div className="source-filter">
            <select 
              value={sourceFilter} 
              onChange={(e) => setSourceFilter(e.target.value as 'all' | 'icloud' | 'outlook')}
              className="filter-select"
            >
              <option value="all">Tous les calendriers</option>
              <option value="icloud">Calendrier de Duve</option>
              <option value="outlook">Secteur SSS</option>
            </select>
          </div>
          <ViewSelector 
            currentView={currentView} 
            onViewChange={setCurrentView} 
          />
          <button 
            onClick={loadEvents} 
            className="nav-button"
            aria-label="Actualiser les calendriers"
            title="Actualiser les calendriers"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      <div className="calendar-content scale-in">
        {renderCurrentView()}
      </div>

      {renderEventDetails()}
      
      {/* Afficher les événements à venir seulement pour certaines vues */}
      {(currentView === 'month' || currentView === 'compact') && renderUpcomingEvents()}

      {debugInfo && (
        <div className="debug-section">
          <h4>Informations de debug:</h4>
          <pre>{debugInfo}</pre>
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