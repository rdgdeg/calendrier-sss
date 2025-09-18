import React from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SearchResultsProps {
  searchResults: CalendarEvent[];
  searchQuery: string;
  isVisible: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onExportToGoogle: (event: CalendarEvent) => void;
  onExportToOutlook: (event: CalendarEvent) => void;
  onExportToICS: (event: CalendarEvent) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults,
  searchQuery,
  isVisible,
  onEventClick,
  onExportToGoogle,
  onExportToOutlook,
  onExportToICS
}) => {
  if (!isVisible || !searchQuery.trim()) {
    return null;
  }

  const renderEventCard = (event: CalendarEvent, index: number) => (
    <div
      key={`${event.id}-${event.start.getTime()}-${index}`}
      className="search-result-card"
    >
      <div className="search-result-content">
        <div className="search-result-header">
          <h4 className="search-result-title">
            {event.title}
          </h4>
          <div className="search-result-source">
            <span className={`source-badge ${event.source}`}>
              {event.source === 'icloud' ? '🍎' : '📧'}
              {event.source === 'icloud' ? 'Duve' : 'SSS'}
            </span>
          </div>
        </div>

        <div className="search-result-datetime">
          <span className="search-result-date">
            📅 {format(event.start, 'd MMM yyyy', { locale: fr })}
          </span>
          <span className="search-result-time">
            🕐 {event.allDay
              ? 'Journée entière'
              : `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
            }
          </span>
        </div>

        {event.location && (
          <div className="search-result-location">
            📍 {event.location}
          </div>
        )}

        {event.description && (
          <div className="search-result-description">
            {event.description.length > 120
              ? `${event.description.substring(0, 120)}...`
              : event.description
            }
          </div>
        )}

        <div className="search-result-actions">
          <button
            className="btn-search-info"
            onClick={() => onEventClick(event)}
            title="Plus d'informations"
          >
            ℹ️ Détails
          </button>
          <div className="search-export-buttons">
            <button
              className="btn-search-export google"
              onClick={() => onExportToGoogle(event)}
              title="Ajouter à Google Calendar"
            >
              📅
            </button>
            <button
              className="btn-search-export outlook"
              onClick={() => onExportToOutlook(event)}
              title="Ajouter à Outlook"
            >
              📆
            </button>
            <button
              className="btn-search-export ics"
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
    <div className="search-results-section">
      <div className="search-results-header">
        <h3 className="search-results-title">
          🔍 Résultats de recherche pour "{searchQuery}"
          <span className="search-results-count">({searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''})</span>
        </h3>
        <p className="search-results-subtitle">
          Cliquez sur un événement pour voir les détails ou l'ajouter à votre calendrier
        </p>
      </div>

      <div className="search-results-grid">
        {searchResults.length === 0 ? (
          <div className="no-search-results">
            <div className="no-results-icon">🔍</div>
            <p>Aucun résultat pour "{searchQuery}"</p>
            <p className="no-results-suggestion">
              Essayez avec d'autres mots-clés ou modifiez les filtres
            </p>
          </div>
        ) : (
          searchResults.map((event, index) => renderEventCard(event, index))
        )}
      </div>
    </div>
  );
};