import React, { useState, useEffect } from 'react';
import { CalendarEvent, CalendarSource, CalendarView } from '../types';
import { ICalParser } from '../utils/icalParser';
import { format, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { syncCalendarStatus, cacheEvents, getCachedEvents, clearCache } from '../lib/supabase';
import { ViewSelector } from './ViewSelector';
import { MonthView } from './views/MonthView';
import { AgendaView } from './views/AgendaView';
import { DisplayView } from './views/DisplayView';
import { EventModal } from './EventModal';
import { Footer } from './Footer';
import { EventLegend } from './EventLegend';
import { SearchBar } from './SearchBar';
import { UniversalSidebar } from './UniversalSidebar';
import { SearchResults } from './SearchResults';
import { useSearch } from '../hooks/useSearch';
import { detectEventType, EVENT_TYPES } from '../utils/eventCategories';
import { EventType } from '../types';

const CALENDAR_SOURCES: CalendarSource[] = [
  {
    name: 'Calendrier de Duve',
    url: 'https://p25-caldav.icloud.com/published/2/MjE3MzIxMzkxMTYyMTczMtrwrElZXGcjHRcJohH3ZTG9v2l4po1v88R9tID706X9RxGohLKxmB8cXu3SUYxqWQyqiN7dN3ZkiPAFAAQE2b8',
    source: 'icloud',
    color: '#ff6b6b'  // Rouge clair plus visible
  },
  {
    name: 'Calendrier Secteur SSS',
    url: 'https://outlook.office365.com/owa/calendar/7442b8c05d40441795e06a2f0b095720@uclouvain.be/32bcbe6b269b4cf78cd02da934b381c215406410938849709841/calendar.ics',
    source: 'outlook',
    color: '#003d7a'  // Bleu UCLouvain plus visible
  }
];

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Septembre 2025
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Hook de recherche
  const {
    searchState,
    filteredEvents,
    searchStats,
    setQuery,
    updateFilters,
    clearSearch,
    isEventHighlighted
  } = useSearch(events);
  
  // Référence pour scroller vers les résultats
  const searchResultsRef = React.useRef<HTMLDivElement>(null);
  
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
  const showTooltip = (event: React.MouseEvent, eventData: CalendarEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const windowWidth = window.innerWidth;
    
    // Créer un contenu enrichi pour la tooltip
    let tooltipContent = eventData.title;
    if (eventData.location) {
      tooltipContent += `\n📍 ${eventData.location}`;
    }
    if (eventData.description && eventData.description.length > 0) {
      const shortDescription = eventData.description.length > 100 
        ? `${cleanHtmlContent(eventData.description).substring(0, 100)}...`
        : cleanHtmlContent(eventData.description);
      tooltipContent += `\n📝 ${shortDescription}`;
    }
    
    const tooltipWidth = Math.min(350, tooltipContent.length * 6);
    
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
      content: tooltipContent,
      x,
      y
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };



  const loadEvents = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setDebugInfo('');
    
    try {
      console.log('🚀 Starting calendar load...');
      
      // Si on force le rechargement, vider le cache d'abord
      if (forceRefresh) {
        console.log('🗑️ Clearing cache for fresh reload...');
        await clearCache();
      }
      
      // Essayer de charger depuis le cache d'abord (seulement si pas de force refresh)
      if (!forceRefresh) {
        const cachedEvents = await getCachedEvents();
        if (cachedEvents.length > 0) {
          console.log('📦 Loading from cache:', cachedEvents.length, 'events');
          const convertedEvents: CalendarEvent[] = cachedEvents.map(cached => {
            const sourceConfig = CALENDAR_SOURCES.find(s => s.source === cached.source);
            const sourceColor = sourceConfig?.color || (cached.source === 'icloud' ? '#ff6b6b' : '#003d7a');
            
            return {
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
                color: sourceColor,
                source: cached.source as 'icloud' | 'outlook'
              },
              color: sourceColor
            };
          });
          setEvents(convertedEvents);
          setDebugInfo(`Cache: ${convertedEvents.length} événements chargés`);
        }
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
        // Utiliser les couleurs par source pour une meilleure visibilité
        const eventsWithSourceColors = allEvents.map(event => {
          const sourceConfig = CALENDAR_SOURCES.find(s => s.source === event.source);
          return {
            ...event,
            color: sourceConfig?.color || (event.source === 'icloud' ? '#ff6b6b' : '#4ecdc4'),
            category: {
              ...event.category,
              color: sourceConfig?.color || (event.source === 'icloud' ? '#ff6b6b' : '#4ecdc4')
            }
          };
        });
        
        setEvents(eventsWithSourceColors);
        
        // Mettre en cache les nouveaux événements
        const eventsToCache = eventsWithSourceColors.map(event => ({
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
        case 'month':
        default:
          return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
      }
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getNavigationLabel = (): string => {
    switch (currentView) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      case 'agenda':
        return 'Vue Agenda';
      case 'display':
        return 'Vue Affichage Public';
      default:
        return format(currentDate, 'MMMM yyyy', { locale: fr });
    }
  };

  const getUpcomingEvents = (): CalendarEvent[] => {
    const now = new Date();
    return filteredEvents
      .filter(event => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  // Fonctions d'export vers les calendriers
  const exportToGoogleCalendar = (event: CalendarEvent) => {
    const startDate = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.set('action', 'TEMPLATE');
    googleUrl.searchParams.set('text', event.title);
    googleUrl.searchParams.set('dates', `${startDate}/${endDate}`);
    googleUrl.searchParams.set('details', event.description || '');
    googleUrl.searchParams.set('location', event.location || '');
    
    window.open(googleUrl.toString(), '_blank');
  };

  const exportToOutlookCalendar = (event: CalendarEvent) => {
    const startDate = event.start.toISOString();
    const endDate = event.end.toISOString();
    
    const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlookUrl.searchParams.set('subject', event.title);
    outlookUrl.searchParams.set('startdt', startDate);
    outlookUrl.searchParams.set('enddt', endDate);
    outlookUrl.searchParams.set('body', event.description || '');
    outlookUrl.searchParams.set('location', event.location || '');
    
    window.open(outlookUrl.toString(), '_blank');
  };

  const exportToICS = (event: CalendarEvent) => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UCLouvain//Calendar//FR',
      'BEGIN:VEVENT',
      `UID:${event.id}@uclouvain.be`,
      `DTSTART:${formatDate(event.start)}`,
      `DTEND:${formatDate(event.end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location || ''}`,
      `DTSTAMP:${formatDate(new Date())}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderCurrentView = () => {
    const handleEventClick = (event: CalendarEvent) => {
      setSelectedEvent(event);
      setIsModalOpen(true);
    };

    const commonProps = {
      currentDate,
      events: filteredEvents,
      onEventClick: handleEventClick,
      onEventHover: showTooltip,
      onEventLeave: hideTooltip,
      isEventHighlighted
    };

    switch (currentView) {
      case 'month':
        return <MonthView {...commonProps} />;
      case 'agenda':
        return <AgendaView {...commonProps} selectedEventId={selectedEvent?.id} />;
      case 'display':
        return <DisplayView {...commonProps} daysToShow={5} />;
      default:
        return <MonthView {...commonProps} />;
    }
  };

  if (loading) {
    return <div className="loading">Chargement des calendriers...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button onClick={() => loadEvents(true)} className="nav-button">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="calendar-container fade-in">
      {/* Header principal avec titre UCLouvain */}
      {currentView !== 'display' && (
        <div className="calendar-main-header">
          <h1 className="calendar-main-title">
            Calendrier des Événements
          </h1>
          <p className="calendar-main-subtitle">
            Secteur des Sciences de la Santé - UCLouvain
          </p>
          <div className="display-mode-toggle">
            <button
              onClick={() => setCurrentView('display')}
              className="display-mode-button"
              title="Basculer vers la vue d'affichage public"
            >
              📺 Vue Affichage Public
            </button>
          </div>
        </div>
      )}

      {/* Header spécial pour la vue d'affichage */}
      {currentView === 'display' && (
        <div className="display-mode-header">
          <button
            onClick={() => setCurrentView('month')}
            className="back-to-calendar-button"
            title="Retour au calendrier"
          >
            ← Retour au calendrier
          </button>
          <div className="display-mode-title">
            <span className="live-indicator">🔴 LIVE</span>
            <span>Vue Affichage Public</span>
          </div>
        </div>
      )}

      {/* Header de navigation avec recherche */}
      {currentView !== 'display' && (
        <div className="calendar-header">
        <div className="calendar-nav">
          <button 
            onClick={() => navigateDate('prev')} 
            className="nav-button"
            aria-label="Période précédente"
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
            aria-label="Période suivante"
          >
            Suivant →
          </button>
        </div>

        <div className="calendar-search-section">
          <SearchBar
            events={events}
            onSearchResults={(results, query) => {
              setQuery(query);
              // Scroller vers les résultats après un court délai
              if (query.trim() && searchResultsRef.current) {
                setTimeout(() => {
                  searchResultsRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }, 100);
              }
            }}
            onClearSearch={() => {
              clearSearch();
              // Remonter vers le calendrier quand on efface la recherche
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            placeholder="Rechercher dans les événements..."
          />
        </div>
        
        <h2 className="month-year">
          {getNavigationLabel()}
        </h2>
        
        <div className="header-controls">
          <ViewSelector 
            currentView={currentView} 
            onViewChange={setCurrentView} 
          />
          <button 
            onClick={() => loadEvents(true)} 
            className="nav-button"
            aria-label="Actualiser les calendriers"
            title="Actualiser les calendriers (rechargement complet)"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>
      )}

      {/* Section des filtres sous le header */}
      {currentView !== 'display' && (
        <div className="calendar-filters-section">
          <div className="filters-container-inline">
            <div className="filters-row">
              <div className="filter-group-compact">
                <label className="filter-label-compact">Source :</label>
                <select 
                  value={searchState.filters.source} 
                  onChange={(e) => updateFilters({ source: e.target.value as any })}
                  className="filter-select-compact"
                >
                  <option value="all">Tous</option>
                  <option value="icloud">🍎 Duve</option>
                  <option value="outlook">📧 SSS</option>
                </select>
              </div>

              <div className="filter-group-compact">
                <label className="filter-label-compact">Catégorie :</label>
                <select 
                  value={searchState.filters.category} 
                  onChange={(e) => updateFilters({ category: e.target.value as any })}
                  className="filter-select-compact"
                >
                  {EVENT_TYPES.map(eventType => (
                    <option key={eventType.type} value={eventType.type}>
                      {eventType.icon} {eventType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group-compact">
                <label className="filter-label-compact">Période :</label>
                <select 
                  value={searchState.filters.dateRange} 
                  onChange={(e) => updateFilters({ dateRange: e.target.value as any })}
                  className="filter-select-compact"
                >
                  <option value="all">Toutes</option>
                  <option value="upcoming">À venir</option>
                  <option value="thisWeek">Semaine</option>
                  <option value="thisMonth">Mois</option>
                </select>
              </div>

              <div className="filter-stats-compact">
                <span className="stats-total">{searchStats.totalEvents} événements</span>
                {searchStats.hasActiveFilters && (
                  <span className="stats-filtered">• {searchStats.filteredCount} filtrés</span>
                )}
                {searchState.isSearching && (
                  <span className="stats-found">• {searchStats.resultsCount} trouvés</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`calendar-layout ${currentView === 'display' ? 'display-mode' : ''} ${searchState.isSearching ? 'search-active' : ''}`}>
        <div className="calendar-main">
          <div className="calendar-content scale-in">
            {renderCurrentView()}
          </div>
          
          {/* Résultats de recherche sous le calendrier */}
          {currentView !== 'display' && (
            <div ref={searchResultsRef}>
              <SearchResults
                searchResults={searchState.results}
                searchQuery={searchState.query}
                isVisible={searchState.isSearching}
                onEventClick={(event) => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
                onExportToGoogle={exportToGoogleCalendar}
                onExportToOutlook={exportToOutlookCalendar}
                onExportToICS={exportToICS}
              />
            </div>
          )}
        </div>
        
        {currentView !== 'display' && !searchState.isSearching && (
          <div className="calendar-sidebar">
            <UniversalSidebar
              searchResults={[]} // Plus de résultats dans le sidebar
              upcomingEvents={getUpcomingEvents()}
              isSearching={false} // Toujours afficher les événements à venir
              searchQuery=""
              onEventClick={(event) => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              onExportToGoogle={exportToGoogleCalendar}
              onExportToOutlook={exportToOutlookCalendar}
              onExportToICS={exportToICS}
            />
          </div>
        )}
      </div>

      {/* Légende des événements sous le calendrier */}
      <div className="calendar-legend-section">
        <EventLegend />
      </div>

      <EventModal 
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onExportToGoogle={exportToGoogleCalendar}
        onExportToOutlook={exportToOutlookCalendar}
        onExportToICS={exportToICS}
      />

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

      <Footer />
    </div>
  );
};