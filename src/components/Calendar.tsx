import React, { useState, useEffect } from 'react';
import { CalendarEvent, CalendarSource, CalendarView } from '../types';
import { ICalParser } from '../utils/icalParser';
import { format, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { syncCalendarStatus, cacheEvents, getCachedEvents, clearCache } from '../lib/supabase';
import { ViewSelector } from './ViewSelector';
import { MonthView } from './views/MonthView';
import { AgendaView } from './views/AgendaView';
import { ScreenView } from './views/ScreenView';

import { EventModal } from './EventModal';
import { Footer } from './Footer';
import { OtherAgendasSection } from './OtherAgendasSection';

import { SearchBar } from './SearchBar';

import { SearchResults } from './SearchResults';
import { UpcomingEventsSection } from './UpcomingEventsSection';

import { useSearch } from '../hooks/useSearch';

import { HelpSystem, FAQSection } from './HelpSystem';

import { ToastNotification, NetworkStatus, RealTimeLoadingIndicator } from './LoadingStates';

import { LoadingScreen } from './LoadingScreen';
import { trackVisit } from '../utils/analytics';
import '../styles/header-redesign.css';
import '../styles/visit-stats.css';

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
  const [currentDate, setCurrentDate] = useState(new Date()); // Mois en cours
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initialisation...');
  
  // États pour les nouvelles fonctionnalités UX
  const [showFAQ, setShowFAQ] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'info', message: '', isVisible: false });
  const [isRealTimeLoading, setIsRealTimeLoading] = useState(false);
  
  // Référence pour gérer le timer de auto-hide des toasts
  const toastTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  
  // Hook de recherche
  const {
    searchState,
    filteredEvents,
    setQuery,
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



  // Fonction pour afficher les notifications
  const showToast = (type: 'success' | 'error' | 'info', message: string, autoHide: boolean = true) => {
    // Nettoyer le timer précédent s'il existe
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    
    setToast({ type, message, isVisible: true });
    
    // Auto-hide après 3 secondes pour les notifications de succès
    if (autoHide && type === 'success') {
      toastTimerRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
        toastTimerRef.current = null;
      }, 3000);
    }
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingMessage('Initialisation...');
    setIsRealTimeLoading(true);
    
    try {
      // Toujours vider le cache lors de l'actualisation (fusion des fonctionnalités)
      setLoadingMessage('Vidage du cache...');
      try {
        await clearCache();
      } catch (error) {
        console.warn('Cache non disponible, continuons sans cache');
      }
      setLoadingProgress(10);
      
      // Toujours essayer de charger depuis le cache d'abord pour un affichage rapide
      setLoadingMessage('Vérification du cache...');
      try {
        const cachedEvents = await getCachedEvents();
        setLoadingProgress(20);
        
        if (cachedEvents.length > 0) {
          const eventsWithColors = cachedEvents.map(cached => ({
            id: cached.event_id,
            title: cached.title,
            start: new Date(cached.start_date),
            end: new Date(cached.end_date),
            description: cached.description || '',
            location: cached.location || '',
            source: cached.source as 'icloud' | 'outlook',
            color: cached.color || '#6c757d',
            allDay: false,
            category: {
              id: `${cached.source}-${cached.category || 'default'}`,
              name: cached.category || 'default',
              color: cached.color || '#6c757d',
              source: cached.source as 'icloud' | 'outlook'
            }
          }));
          
          // Afficher immédiatement les événements en cache
          setEvents(eventsWithColors);
          setLoadingMessage('Événements en cache chargés, actualisation...');
          
          // Continuer le chargement en arrière-plan pour actualiser
          setTimeout(() => {
            setLoading(false);
            setIsRealTimeLoading(false);
          }, 1000);
        }
      } catch (error) {
        console.warn('Cache non disponible, chargement direct des calendriers');
        setLoadingProgress(20);
      }

      // Charger les événements frais en arrière-plan (en parallèle pour plus de rapidité)
      setLoadingMessage('Chargement des calendriers...');
      setLoadingProgress(30);
      
      const sourcePromises = CALENDAR_SOURCES.map(async (source, index) => {
        try {
          setLoadingMessage(`Chargement ${source.name}...`);
          const sourceEvents = await ICalParser.fetchAndParse(source.url, source.source);
          
          // Mettre à jour la progression de manière contrôlée
          const progressPerSource = 40 / CALENDAR_SOURCES.length;
          const targetProgress = 30 + (progressPerSource * (index + 1));
          setLoadingProgress(Math.min(targetProgress, 70));
          
          console.log(`📅 ${source.name}: ${sourceEvents.length} événements chargés`);
          
          // Synchroniser le statut avec Supabase (si disponible)
          try {
            await syncCalendarStatus({
              source_name: source.name,
              source_url: source.url,
              last_sync: new Date().toISOString(),
              events_count: sourceEvents.length,
              status: 'success'
            });
          } catch (error) {
            console.warn('Synchronisation du statut non disponible');
          }
          
          return sourceEvents;
        } catch (sourceError) {
          console.error(`❌ Erreur lors du chargement de ${source.name}:`, sourceError);
          
          // Enregistrer l'erreur dans Supabase (si disponible)
          try {
            await syncCalendarStatus({
              source_name: source.name,
              source_url: source.url,
              last_sync: new Date().toISOString(),
              events_count: 0,
              status: 'error',
              error_message: sourceError instanceof Error ? sourceError.message : 'Erreur inconnue'
            });
          } catch (error) {
            console.warn('Synchronisation du statut d\'erreur non disponible');
          }
          
          // Afficher une notification d'erreur spécifique
          showToast('error', `Erreur de chargement: ${source.name}`);
          
          return [];
        }
      });

      // Attendre tous les calendriers en parallèle
      setLoadingMessage('Traitement des données...');
      setLoadingProgress(70);
      
      const allSourceEvents = await Promise.all(sourcePromises);
      const allEvents: CalendarEvent[] = allSourceEvents.flat();

      console.log(`📊 Total des événements chargés: ${allEvents.length}`);
      
      if (allEvents.length > 0) {
        setLoadingMessage('Application des couleurs...');
        setLoadingProgress(80);
        
        // Utiliser les couleurs par source pour une meilleure visibilité
        const eventsWithSourceColors = allEvents.map(event => {
          const sourceConfig = CALENDAR_SOURCES.find(s => s.source === event.source);
          return {
            ...event,
            color: sourceConfig?.color || (event.source === 'icloud' ? '#ff6b6b' : '#4ecdc4'),
            category: {
              ...event.category,
              id: event.category.id || `${event.source}-${event.category.name}`,
              color: sourceConfig?.color || (event.source === 'icloud' ? '#ff6b6b' : '#4ecdc4'),
              source: event.source
            }
          };
        });
        
        setEvents(eventsWithSourceColors);
        
        setLoadingMessage('Mise en cache...');
        setLoadingProgress(90);
        
        // Mettre en cache les nouveaux événements (si disponible)
        try {
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
        } catch (error) {
          console.warn('Mise en cache non disponible, continuons sans cache');
        }
      }
      
      setLoadingMessage('Terminé !');
      setLoadingProgress(100);
      
      // Notification de succès avec informations
      const totalEvents = allEvents.length;
      if (totalEvents > 0) {
        showToast('success', `${totalEvents} événements chargés avec succès !`);
      } else {
        showToast('error', 'Aucun événement chargé - Vérifiez la console pour plus de détails');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      showToast('error', `Erreur lors du chargement : ${errorMessage}`);
    } finally {
      setLoading(false);
      setIsRealTimeLoading(false);
    }
  };

  useEffect(() => {
    // Toujours forcer le rechargement au démarrage pour avoir les données les plus récentes
    loadEvents();
    
    // Enregistrer la visite (analytics)
    trackVisit().catch(error => {
      console.warn('Analytics non disponible:', error);
    });
    
    // Actualisation automatique toutes les 10 minutes (moins fréquent pour économiser les ressources)
    const autoRefreshInterval = setInterval(() => {
      loadEvents();
    }, 10 * 60 * 1000); // 10 minutes
    
    // Nettoyer l'intervalle et le timer toast au démontage du composant
    return () => {
      clearInterval(autoRefreshInterval);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
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
      case 'screen':
        return 'Vue Écran';
      default:
        return format(currentDate, 'MMMM yyyy', { locale: fr });
    }
  };

  // Fonctions d'export vers les calendriers
  const exportToGoogle = (event: CalendarEvent) => {
    const startDate = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.set('action', 'TEMPLATE');
    googleUrl.searchParams.set('text', event.title);
    googleUrl.searchParams.set('dates', `${startDate}/${endDate}`);
    
    if (event.description) {
      googleUrl.searchParams.set('details', cleanHtmlContent(event.description));
    }
    
    if (event.location) {
      googleUrl.searchParams.set('location', event.location);
    }
    
    window.open(googleUrl.toString(), '_blank');
    showToast('success', 'Événement ouvert dans Google Calendar');
  };

  const exportToOutlook = (event: CalendarEvent) => {
    const startDate = event.start.toISOString();
    const endDate = event.end.toISOString();
    
    const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlookUrl.searchParams.set('subject', event.title);
    outlookUrl.searchParams.set('startdt', startDate);
    outlookUrl.searchParams.set('enddt', endDate);
    
    if (event.description) {
      outlookUrl.searchParams.set('body', cleanHtmlContent(event.description));
    }
    
    if (event.location) {
      outlookUrl.searchParams.set('location', event.location);
    }
    
    window.open(outlookUrl.toString(), '_blank');
    showToast('success', 'Événement ouvert dans Outlook');
  };

  const exportToICS = (event: CalendarEvent) => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const escapeText = (text: string) => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');
    };
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UCLouvain//Calendrier SSS//FR',
      'BEGIN:VEVENT',
      `UID:${event.id}@calendrier-sss.uclouvain.be`,
      `DTSTART:${formatDate(event.start)}`,
      `DTEND:${formatDate(event.end)}`,
      `SUMMARY:${escapeText(event.title)}`,
      event.description ? `DESCRIPTION:${escapeText(cleanHtmlContent(event.description))}` : '',
      event.location ? `LOCATION:${escapeText(event.location)}` : '',
      `CREATED:${formatDate(new Date())}`,
      `LAST-MODIFIED:${formatDate(new Date())}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(line => line !== '').join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showToast('success', 'Fichier ICS téléchargé');
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
      isEventHighlighted,
      onExportToGoogle: exportToGoogle,
      onExportToOutlook: exportToOutlook,
      onExportToICS: exportToICS
    };

    switch (currentView) {
      case 'month':
        return <MonthView {...commonProps} />;
      case 'agenda':
        return <AgendaView {...commonProps} selectedEventId={selectedEvent?.id} />;
      case 'screen':
        return <ScreenView events={filteredEvents} />;
      default:
        return <MonthView {...commonProps} />;
    }
  };

  if (loading && events.length === 0) {
    return (
      <LoadingScreen 
        progress={loadingProgress} 
        message={loadingMessage}
      />
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button onClick={() => loadEvents()} className="nav-button">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="calendar-container fade-in">
      {/* Composants système */}
      
      <NetworkStatus />
      
      <RealTimeLoadingIndicator 
        isLoading={isRealTimeLoading}
        message="Synchronisation en cours..."
      />
      
      <ToastNotification
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Header principal compact */}
      <div className="calendar-main-header-compact">
        <h1 className="calendar-main-title-compact">
          📅 Calendrier SSS - UCLouvain
        </h1>
        <div className="header-actions-group">
          <div className="header-refresh-actions">
            <button 
              onClick={() => loadEvents()} 
              className="nav-button refresh-button compact"
              aria-label="Actualiser les calendriers"
              title="Actualiser les calendriers (vide automatiquement le cache)"
            >
              🔄 Actualiser
            </button>

          </div>
          <div className="header-help-actions">
            <button
              className="faq-btn"
              onClick={() => setShowFAQ(true)}
              title="Questions fréquentes"
            >
              ❓
            </button>
          </div>
        </div>
      </div>



      {/* Header réorganisé avec navigation et titre - Masqué en vue écran */}
      {currentView !== 'screen' && (
        <div className="calendar-header-redesigned">
          {/* Première ligne : Navigation et Titre/Vue */}
          <div className="header-top-row">
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

            <div className="month-year-container-redesigned">
              <h2 className="month-year">
                {getNavigationLabel()}
              </h2>
              {currentView === 'month' && (
                <span className="month-badge">Vue mensuelle</span>
              )}
            </div>

            <div className="header-controls">
              <ViewSelector 
                currentView={currentView} 
                onViewChange={setCurrentView} 
              />
            </div>
          </div>

          {/* Deuxième ligne : Recherche et Statistiques */}
          <div className="header-bottom-row">
            <div className="calendar-search-section-redesigned">
              <SearchBar
                events={events}
                onSearchResults={(_, query) => {
                  setQuery(query);
                }}
                onClearSearch={() => {
                  clearSearch();
                }}
                placeholder="Rechercher dans les événements..."
              />
              
              {/* Bouton pour aller aux résultats ou message si aucun résultat */}
              {searchState.isSearching && (
                <>
                  {searchState.results.length > 0 ? (
                    <button
                      className="scroll-to-results-btn"
                      onClick={() => {
                        searchResultsRef.current?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }}
                      title="Voir les résultats de recherche"
                    >
                      📍 {searchState.results.length} résultat{searchState.results.length !== 1 ? 's' : ''} trouvé{searchState.results.length !== 1 ? 's' : ''} • Voir ↓
                    </button>
                  ) : (
                    <div className="no-results-message-inline">
                      🔍 Aucun résultat pour "{searchState.query}"
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="events-stats-redesigned">
              <span className="stats-total">{filteredEvents.length} événements</span>
              {searchState.isSearching && (
                <span className="stats-found">• {searchState.results.length} trouvés</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header compact pour la vue écran avec sélecteur de vue */}
      {currentView === 'screen' && (
        <div className="screen-view-header">
          <div className="screen-view-controls">
            <ViewSelector 
              currentView={currentView} 
              onViewChange={setCurrentView} 
            />
            <button 
              onClick={() => loadEvents()} 
              className="nav-button refresh-button"
              aria-label="Actualiser les événements"
              title="Actualiser les événements"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>
      )}



      <div className={`calendar-layout-full ${searchState.isSearching ? 'search-active' : ''} ${currentView === 'screen' ? 'screen-mode' : ''}`}>
        <div className="calendar-main-full">
          <div className={`calendar-content ${currentView !== 'screen' ? 'scale-in' : ''}`}>
            {renderCurrentView()}
          </div>
          
          {/* Résultats de recherche sous le calendrier - Masqués en vue écran */}
          {currentView !== 'screen' && (
            <div ref={searchResultsRef}>
              <SearchResults
                searchResults={searchState.results}
                searchQuery={searchState.query}
                isVisible={searchState.isSearching}
                onEventClick={(event) => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Section des événements à venir sous le calendrier - Masquée en vue écran */}
          {currentView !== 'screen' && !searchState.isSearching && (
            <UpcomingEventsSection
              events={filteredEvents}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              eventsPerPage={5}
            />
          )}
        </div>
      </div>



      <EventModal 
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onExportToGoogle={exportToGoogle}
        onExportToOutlook={exportToOutlook}
        onExportToICS={exportToICS}
      />



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

      {/* Autres agendas + Footer et système d'aide - Masqués en vue écran */}
      {currentView !== 'screen' && (
        <>
          <OtherAgendasSection />
          <Footer />
          
          {/* Système d'aide */}
          <HelpSystem />
          
          {/* Modales d'aide */}
          <FAQSection
            isVisible={showFAQ}
            onClose={() => setShowFAQ(false)}
          />
        </>
      )}
    </div>
  );
};