import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { CalendarEvent } from '../types';

interface SearchBarProps {
  events: CalendarEvent[];
  onSearchResults: (results: CalendarEvent[], query: string) => void;
  onClearSearch: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  events,
  onSearchResults,
  onClearSearch,
  placeholder = "Rechercher dans les événements..."
}) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fonction de recherche intelligente
  const searchEvents = (searchQuery: string): CalendarEvent[] => {
    if (!searchQuery.trim()) {
      return [];
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);

    return events.filter(event => {
      const searchableText = [
        event.title,
        event.description || '',
        event.location || '',
        event.category.name
      ].join(' ').toLowerCase();

      // Recherche par mots-clés (tous les mots doivent être présents)
      const matchesAllWords = queryWords.every(word => 
        searchableText.includes(word)
      );

      // Recherche par phrase exacte
      const matchesExactPhrase = searchableText.includes(normalizedQuery);

      return matchesAllWords || matchesExactPhrase;
    });
  };



  // Effet pour la recherche en temps réel
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        const results = searchEvents(query);
        onSearchResults(results, query);
        
        // Désactiver les suggestions pour éviter de cacher le bouton "Voir les résultats"
      } else {
        onClearSearch();
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [query, events, onSearchResults, onClearSearch, isActive]);

  // Gestion des clics extérieurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setIsActive(true);
    // Désactiver les suggestions pour éviter de cacher le bouton "Voir les résultats"
    // if (suggestions.length > 0) {
    //   setShowSuggestions(true);
    // }
  };



  const handleClear = () => {
    setQuery('');
    onClearSearch();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsActive(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="search-bar-container">
      <div className={`search-bar ${isActive ? 'active' : ''}`}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={handleClear}
              className="search-clear"
              title="Effacer la recherche"
            >
              <X size={18} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions désactivées pour éviter de cacher le bouton "Voir les résultats" */}
      {/* {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="search-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-icon">💡</span>
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};