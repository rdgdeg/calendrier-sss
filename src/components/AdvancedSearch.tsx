import React, { useState } from 'react';
import { CalendarEvent } from '../types';

interface AdvancedSearchProps {
  events: CalendarEvent[];
  onSearchResults: (results: CalendarEvent[], query: string) => void;
  onClearSearch: () => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  events,
  onSearchResults,
  onClearSearch
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    text: '',
    source: 'all' as 'all' | 'icloud' | 'outlook',
    dateFrom: '',
    dateTo: '',
    hasLocation: false,
    hasDescription: false
  });

  const performAdvancedSearch = () => {
    let results = events;

    // Filtre par texte
    if (searchCriteria.text.trim()) {
      const query = searchCriteria.text.toLowerCase();
      results = results.filter(event => 
        event.title.toLowerCase().includes(query) ||
        (event.description || '').toLowerCase().includes(query) ||
        (event.location || '').toLowerCase().includes(query)
      );
    }

    // Filtre par source
    if (searchCriteria.source !== 'all') {
      results = results.filter(event => event.source === searchCriteria.source);
    }

    // Filtre par date
    if (searchCriteria.dateFrom) {
      const fromDate = new Date(searchCriteria.dateFrom);
      results = results.filter(event => event.start >= fromDate);
    }

    if (searchCriteria.dateTo) {
      const toDate = new Date(searchCriteria.dateTo);
      toDate.setHours(23, 59, 59, 999); // Fin de journée
      results = results.filter(event => event.start <= toDate);
    }

    // Filtre par présence de lieu
    if (searchCriteria.hasLocation) {
      results = results.filter(event => event.location && event.location.trim() !== '');
    }

    // Filtre par présence de description
    if (searchCriteria.hasDescription) {
      results = results.filter(event => event.description && event.description.trim() !== '');
    }

    onSearchResults(results, searchCriteria.text || 'Recherche avancée');
  };

  const clearAdvancedSearch = () => {
    setSearchCriteria({
      text: '',
      source: 'all',
      dateFrom: '',
      dateTo: '',
      hasLocation: false,
      hasDescription: false
    });
    onClearSearch();
  };

  const hasActiveFilters = 
    searchCriteria.text.trim() !== '' ||
    searchCriteria.source !== 'all' ||
    searchCriteria.dateFrom !== '' ||
    searchCriteria.dateTo !== '' ||
    searchCriteria.hasLocation ||
    searchCriteria.hasDescription;

  return (
    <div className="advanced-search">
      <div className="search-header">
        <button
          className={`advanced-toggle ${isAdvancedOpen ? 'active' : ''}`}
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          🔍 Recherche avancée
          <span className="toggle-icon">{isAdvancedOpen ? '▲' : '▼'}</span>
        </button>
        
        {hasActiveFilters && (
          <div className="active-filters-indicator">
            <span className="filters-count">{
              [
                searchCriteria.text.trim() !== '',
                searchCriteria.source !== 'all',
                searchCriteria.dateFrom !== '',
                searchCriteria.dateTo !== '',
                searchCriteria.hasLocation,
                searchCriteria.hasDescription
              ].filter(Boolean).length
            } filtres actifs</span>
            <button className="clear-filters" onClick={clearAdvancedSearch}>
              Effacer tout
            </button>
          </div>
        )}
      </div>

      {isAdvancedOpen && (
        <div className="advanced-search-panel">
          <div className="search-grid">
            <div className="search-field">
              <label htmlFor="search-text">Texte à rechercher</label>
              <input
                id="search-text"
                type="text"
                value={searchCriteria.text}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Titre, description, lieu..."
                className="search-input-advanced"
              />
            </div>

            <div className="search-field">
              <label htmlFor="search-source">Source</label>
              <select
                id="search-source"
                value={searchCriteria.source}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, source: e.target.value as any }))}
                className="search-select"
              >
                <option value="all">Toutes les sources</option>
                <option value="icloud">📱 Calendrier de Duve</option>
                <option value="outlook">📧 Calendrier SSS</option>
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="date-from">À partir du</label>
              <input
                id="date-from"
                type="date"
                value={searchCriteria.dateFrom}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="search-input-advanced"
              />
            </div>

            <div className="search-field">
              <label htmlFor="date-to">Jusqu'au</label>
              <input
                id="date-to"
                type="date"
                value={searchCriteria.dateTo}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, dateTo: e.target.value }))}
                className="search-input-advanced"
              />
            </div>

            <div className="search-field checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={searchCriteria.hasLocation}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, hasLocation: e.target.checked }))}
                />
                <span className="checkbox-text">Avec lieu spécifié</span>
              </label>
            </div>

            <div className="search-field checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={searchCriteria.hasDescription}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, hasDescription: e.target.checked }))}
                />
                <span className="checkbox-text">Avec description</span>
              </label>
            </div>
          </div>

          <div className="search-actions">
            <button
              className="btn-search-advanced"
              onClick={performAdvancedSearch}
            >
              🔍 Rechercher
            </button>
            <button
              className="btn-clear-advanced"
              onClick={clearAdvancedSearch}
            >
              🗑️ Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};