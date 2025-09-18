import React from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UniversalSidebarProps {
    searchResults: CalendarEvent[];
    upcomingEvents: CalendarEvent[];
    isSearching: boolean;
    searchQuery: string;
    onEventClick: (event: CalendarEvent) => void;
    onExportToGoogle: (event: CalendarEvent) => void;
    onExportToOutlook: (event: CalendarEvent) => void;
    onExportToICS: (event: CalendarEvent) => void;
}

export const UniversalSidebar: React.FC<UniversalSidebarProps> = ({
    searchResults,
    upcomingEvents,
    isSearching,
    searchQuery,
    onEventClick,
    onExportToGoogle,
    onExportToOutlook,
    onExportToICS
}) => {
    const displayEvents = isSearching ? searchResults : upcomingEvents.slice(0, 10);

    const renderEventCard = (event: CalendarEvent, index: number) => (
        <div
            key={`${event.id}-${event.start.getTime()}-${index}`}
            className="sidebar-event-card"
        >
            <div className="sidebar-event-content">
                <div className="sidebar-event-header">
                    <h4 className="sidebar-event-title">
                        {event.title.length > 50 ? `${event.title.substring(0, 47)}...` : event.title}
                    </h4>
                    <div className="sidebar-event-source">
                        <span className={`source-badge ${event.source}`}>
                            {event.source === 'icloud' ? '🏥' : '📧'}
                        </span>
                    </div>
                </div>

                <div className="sidebar-event-datetime">
                    <span className="sidebar-event-date">
                        📅 {format(event.start, 'd MMM yyyy', { locale: fr })}
                    </span>
                    <span className="sidebar-event-time">
                        🕐 {event.allDay
                            ? 'Journée entière'
                            : `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
                        }
                    </span>
                </div>

                {event.location && (
                    <div className="sidebar-event-location">
                        📍 {event.location.length > 30 ? `${event.location.substring(0, 27)}...` : event.location}
                    </div>
                )}

                {event.description && (
                    <div className="sidebar-event-description">
                        {event.description.length > 60
                            ? `${event.description.substring(0, 57)}...`
                            : event.description
                        }
                    </div>
                )}

                <div className="sidebar-event-actions">
                    <button
                        className="btn-sidebar-info"
                        onClick={() => onEventClick(event)}
                        title="Plus d'informations"
                    >
                        ℹ️ Détails
                    </button>
                    <div className="sidebar-export-buttons">
                        <button
                            className="btn-sidebar-export google"
                            onClick={() => onExportToGoogle(event)}
                            title="Ajouter à Google Calendar"
                        >
                            📅
                        </button>
                        <button
                            className="btn-sidebar-export outlook"
                            onClick={() => onExportToOutlook(event)}
                            title="Ajouter à Outlook"
                        >
                            📆
                        </button>
                        <button
                            className="btn-sidebar-export ics"
                            onClick={() => onExportToICS(event)}
                            title="Télécharger fichier ICS"
                        >
                            💾
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="universal-sidebar">
            {/* Section Événements uniquement */}
            <div className="sidebar-section events-section full-height">
                <h3 className="sidebar-section-title">
                    {isSearching ? (
                        <>
                            🔍 Résultats pour "{searchQuery}"
                            <span className="results-count">({searchResults.length})</span>
                        </>
                    ) : (
                        <>
                            📅 Prochains événements
                            <span className="results-count">({Math.min(upcomingEvents.length, 10)})</span>
                        </>
                    )}
                </h3>

                <div className="sidebar-events-list">
                    {displayEvents.length === 0 ? (
                        <div className="no-events-message">
                            {isSearching ? (
                                <>
                                    <div className="no-events-icon">🔍</div>
                                    <p>Aucun résultat pour "{searchQuery}"</p>
                                    <p className="no-events-suggestion">
                                        Essayez avec d'autres mots-clés ou modifiez les filtres
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="no-events-icon">📅</div>
                                    <p>Aucun événement à venir</p>
                                </>
                            )}
                        </div>
                    ) : (
                        displayEvents.map((event, index) => renderEventCard(event, index))
                    )}
                </div>

                {!isSearching && upcomingEvents.length > 10 && (
                    <div className="sidebar-footer">
                        <p className="more-events-info">
                            +{upcomingEvents.length - 10} autres événements à venir
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};