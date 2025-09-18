import { useState, useMemo } from 'react';
import { CalendarEvent, EventType } from '../types';
import { detectEventType } from '../utils/eventCategories';

export interface SearchFilters {
  source: 'all' | 'icloud' | 'outlook';
  category: EventType;
  dateRange: 'all' | 'upcoming' | 'thisWeek' | 'thisMonth';
}

export interface SearchState {
  query: string;
  results: CalendarEvent[];
  filters: SearchFilters;
  isSearching: boolean;
  highlightedEvents: Set<string>;
}

export const useSearch = (events: CalendarEvent[]) => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    filters: {
      source: 'all',
      category: 'all',
      dateRange: 'all'
    },
    isSearching: false,
    highlightedEvents: new Set()
  });

  // Fonction de filtrage avancé
  const applyFilters = (events: CalendarEvent[], filters: SearchFilters): CalendarEvent[] => {
    let filtered = [...events];

    // Filtre par source
    if (filters.source !== 'all') {
      filtered = filtered.filter(event => event.source === filters.source);
    }

    // Filtre par catégorie
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => {
        const eventType = detectEventType(event.title, event.description);
        return eventType === filters.category;
      });
    }

    // Filtre par date
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    switch (filters.dateRange) {
      case 'upcoming':
        filtered = filtered.filter(event => event.start >= now);
        break;
      case 'thisWeek':
        filtered = filtered.filter(event => 
          event.start >= startOfWeek && event.start <= endOfWeek
        );
        break;
      case 'thisMonth':
        filtered = filtered.filter(event => 
          event.start >= startOfMonth && event.start <= endOfMonth
        );
        break;
      default:
        // 'all' - pas de filtre de date
        break;
    }

    return filtered;
  };

  // Recherche avec filtres appliqués
  const filteredEvents = useMemo(() => {
    return applyFilters(events, searchState.filters);
  }, [events, searchState.filters]);

  // Fonction de recherche
  const performSearch = (query: string): CalendarEvent[] => {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);

    return filteredEvents.filter(event => {
      const searchableText = [
        event.title,
        event.description || '',
        event.location || '',
        event.category.name
      ].join(' ').toLowerCase();

      // Recherche par mots-clés
      const matchesAllWords = queryWords.every(word => 
        searchableText.includes(word)
      );

      // Recherche par phrase exacte
      const matchesExactPhrase = searchableText.includes(normalizedQuery);

      // Recherche floue (tolérance aux fautes de frappe)
      const matchesFuzzy = queryWords.some(word => {
        if (word.length < 3) return false;
        return searchableText.includes(word.substring(0, word.length - 1));
      });

      return matchesAllWords || matchesExactPhrase || matchesFuzzy;
    });
  };

  // Actions
  const setQuery = (query: string) => {
    const results = performSearch(query);
    const highlightedEvents = new Set(results.map(event => event.id));
    
    setSearchState(prev => ({
      ...prev,
      query,
      results,
      isSearching: query.trim().length > 0,
      highlightedEvents
    }));
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...searchState.filters, ...newFilters };
    const results = searchState.query ? performSearch(searchState.query) : [];
    const highlightedEvents = new Set(results.map(event => event.id));

    setSearchState(prev => ({
      ...prev,
      filters: updatedFilters,
      results,
      highlightedEvents
    }));
  };

  const clearSearch = () => {
    setSearchState(prev => ({
      ...prev,
      query: '',
      results: [],
      isSearching: false,
      highlightedEvents: new Set()
    }));
  };

  const isEventHighlighted = (eventId: string): boolean => {
    return searchState.highlightedEvents.has(eventId);
  };

  // Statistiques de recherche
  const searchStats = useMemo(() => {
    const totalEvents = events.length;
    const filteredCount = filteredEvents.length;
    const resultsCount = searchState.results.length;

    return {
      totalEvents,
      filteredCount,
      resultsCount,
      hasActiveFilters: searchState.filters.source !== 'all' || 
                       searchState.filters.category !== 'all' || 
                       searchState.filters.dateRange !== 'all'
    };
  }, [events.length, filteredEvents.length, searchState.results.length, searchState.filters]);

  return {
    searchState,
    filteredEvents,
    searchStats,
    setQuery,
    updateFilters,
    clearSearch,
    isEventHighlighted,
    performSearch
  };
};