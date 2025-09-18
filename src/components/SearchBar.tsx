import React, { useState, useEffect, useRef } from 'react';
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  // Générer des suggestions basées sur les événements
  const generateSuggestions = (searchQuery: string): string[] => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    const normalizedQuery = searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    events.forEach(event => {
      // Suggestions basées sur les titres
      if (event.title.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(event.title);
      }

      // Suggestions basées sur les catégories
      if (event.category.name.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(event.category.name);
      }

      // Suggestions basées sur les lieux
      if (event.location && event.location.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(event.location);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  };

  // Effet pour la recherche en temps réel
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        const results = searchEvents(query);
        onSearchResults(results, query);
        
        const newSuggestions = generateSuggestions(query);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0 && isActive);
      } else {
        onClearSearch();
        setSuggestions([]);
        setShowSuggestions(false);
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
        setShowSuggestions(false);
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
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    onClearSearch();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsActive(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="search-bar-container">
      <div className={`search-bar ${isActive ? 'active' : ''}`}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
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
              ✕
            </button>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
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
      )}
    </div>
  );
};