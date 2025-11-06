import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { CalendarEvent } from '../types';

const mockEvents: CalendarEvent[] = [
  {
    id: 'test-1',
    title: 'IRSS: journée scientifique',
    description: 'Description de l\'événement scientifique',
    start: new Date('2025-12-05T10:00:00'),
    end: new Date('2025-12-05T16:00:00'),
    location: 'Auditoire MAISIN',
    allDay: false,
    source: 'icloud' as const,
    color: '#ff6b6b',
    category: {
      id: 'secteur-sss',
      name: 'SECTEUR SSS',
      color: '#ff6b6b',
      source: 'icloud' as const
    }
  },
  {
    id: 'test-2',
    title: 'Séminaire de recherche',
    description: 'Présentation des résultats de recherche',
    start: new Date('2025-12-06T14:00:00'),
    end: new Date('2025-12-06T16:00:00'),
    location: 'Salle de conférence',
    allDay: false,
    source: 'outlook' as const,
    color: '#4ecdc4',
    category: {
      id: 'seminaire',
      name: 'SÉMINAIRE',
      color: '#4ecdc4',
      source: 'outlook' as const
    }
  }
];

describe('Search Error Handling', () => {
  const mockOnSearchResults = vi.fn();
  const mockOnClearSearch = vi.fn();
  const mockOnEventClick = vi.fn();
  const mockOnExportToGoogle = vi.fn();
  const mockOnExportToOutlook = vi.fn();
  const mockOnExportToICS = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render SearchBar without errors', () => {
    render(
      <SearchBar
        events={mockEvents}
        onSearchResults={mockOnSearchResults}
        onClearSearch={mockOnClearSearch}
      />
    );

    expect(screen.getByPlaceholderText('Rechercher dans les événements...')).toBeInTheDocument();
  });

  it('should handle search input without throwing require errors', async () => {
    render(
      <SearchBar
        events={mockEvents}
        onSearchResults={mockOnSearchResults}
        onClearSearch={mockOnClearSearch}
      />
    );

    const searchInput = screen.getByPlaceholderText('Rechercher dans les événements...');
    
    // Taper dans le champ de recherche ne devrait pas causer d'erreur
    fireEvent.change(searchInput, { target: { value: 'IRSS' } });

    await waitFor(() => {
      expect(mockOnSearchResults).toHaveBeenCalled();
    });

    // Vérifier que l'input contient bien la valeur
    expect(searchInput).toHaveValue('IRSS');
  });

  it('should render SearchResults without errors', () => {
    render(
      <SearchResults
        searchResults={mockEvents}
        searchQuery="test"
        isVisible={true}
        onEventClick={mockOnEventClick}
        onExportToGoogle={mockOnExportToGoogle}
        onExportToOutlook={mockOnExportToOutlook}
        onExportToICS={mockOnExportToICS}
      />
    );

    expect(screen.getByText('🔍 Résultats de recherche pour "test"')).toBeInTheDocument();
    expect(screen.getByText('IRSS: journée scientifique')).toBeInTheDocument();
    expect(screen.getByText('Séminaire de recherche')).toBeInTheDocument();
  });

  it('should handle empty search results', () => {
    render(
      <SearchResults
        searchResults={[]}
        searchQuery="nonexistent"
        isVisible={true}
        onEventClick={mockOnEventClick}
        onExportToGoogle={mockOnExportToGoogle}
        onExportToOutlook={mockOnExportToOutlook}
        onExportToICS={mockOnExportToICS}
      />
    );

    expect(screen.getByText('Aucun résultat pour "nonexistent"')).toBeInTheDocument();
  });

  it('should handle events with custom formatting markers in descriptions', () => {
    const eventsWithMarkers: CalendarEvent[] = [
      {
        ...mockEvents[0],
        description: '+++Important+++ : ___Conférencier___ présente ~~~recherche~~~'
      }
    ];

    render(
      <SearchResults
        searchResults={eventsWithMarkers}
        searchQuery="test"
        isVisible={true}
        onEventClick={mockOnEventClick}
        onExportToGoogle={mockOnExportToGoogle}
        onExportToOutlook={mockOnExportToOutlook}
        onExportToICS={mockOnExportToICS}
      />
    );

    // Vérifier que les marqueurs sont bien nettoyés dans l'affichage
    const descriptionElement = screen.getByText(/Important.*Conférencier.*recherche/);
    expect(descriptionElement).toBeInTheDocument();
    
    // Vérifier que les marqueurs ne sont pas visibles
    expect(descriptionElement.textContent).not.toContain('+++');
    expect(descriptionElement.textContent).not.toContain('___');
    expect(descriptionElement.textContent).not.toContain('~~~');
  });

  it('should not crash when searching with special characters', async () => {
    render(
      <SearchBar
        events={mockEvents}
        onSearchResults={mockOnSearchResults}
        onClearSearch={mockOnClearSearch}
      />
    );

    const searchInput = screen.getByPlaceholderText('Rechercher dans les événements...');
    
    // Tester avec des caractères spéciaux
    const specialQueries = ['+++test+++', '___search___', '~~~query~~~', 'test|||more', 'query===end'];
    
    for (const query of specialQueries) {
      fireEvent.change(searchInput, { target: { value: query } });
      
      await waitFor(() => {
        expect(mockOnSearchResults).toHaveBeenCalled();
      });
      
      // Vérifier que l'application ne crash pas
      expect(searchInput).toHaveValue(query);
    }
  });

  it('should clear search properly', () => {
    render(
      <SearchBar
        events={mockEvents}
        onSearchResults={mockOnSearchResults}
        onClearSearch={mockOnClearSearch}
      />
    );

    const searchInput = screen.getByPlaceholderText('Rechercher dans les événements...');
    
    // Taper quelque chose
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toHaveValue('test');
    
    // Cliquer sur le bouton clear
    const clearButton = screen.getByTitle('Effacer la recherche');
    fireEvent.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(mockOnClearSearch).toHaveBeenCalled();
  });
});