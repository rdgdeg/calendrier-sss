import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Calendar } from '../components/Calendar';

// Mock des dépendances
vi.mock('../lib/supabase', () => ({
  syncCalendarStatus: vi.fn(),
  cacheEvents: vi.fn(),
  getCachedEvents: vi.fn().mockResolvedValue([]),
  clearCache: vi.fn()
}));

vi.mock('../utils/icalParser', () => ({
  ICalParser: {
    fetchAndParse: vi.fn().mockResolvedValue([])
  }
}));

describe('Category and Source Bar Removal', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not display the category and source filter bar', async () => {
    render(<Calendar />);
    
    // Wait for component to load
    await screen.findByText(/Calendrier SSS/);
    
    // Should not contain the sources section
    expect(screen.queryByText('📅 Sources :')).not.toBeInTheDocument();
    expect(screen.queryByText('de Duve')).not.toBeInTheDocument();
    expect(screen.queryByText('Secteur SSS')).not.toBeInTheDocument();
    
    // Should not contain the categories section
    expect(screen.queryByText('🏷️ Catégories :')).not.toBeInTheDocument();
    expect(screen.queryByText('Colloques')).not.toBeInTheDocument();
    expect(screen.queryByText('Thèses')).not.toBeInTheDocument();
    expect(screen.queryByText('Séminaires')).not.toBeInTheDocument();
    expect(screen.queryByText('Autres événements')).not.toBeInTheDocument();
  });

  it('should not display the period filter dropdown', async () => {
    render(<Calendar />);
    
    // Wait for component to load
    await screen.findByText(/Calendrier SSS/);
    
    // Should not contain the period filter
    expect(screen.queryByText('Période :')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Toutes')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('À venir')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Semaine')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Mois')).not.toBeInTheDocument();
  });

  it('should not display filter statistics', async () => {
    render(<Calendar />);
    
    // Wait for component to load
    await screen.findByText(/Calendrier SSS/);
    
    // Should not contain filter stats (more specific patterns)
    expect(screen.queryByText(/\d+ événements$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/filtrés$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/trouvés$/)).not.toBeInTheDocument();
  });

  it('should still display the main calendar functionality', async () => {
    render(<Calendar />);
    
    // Wait for component to load
    await screen.findByText(/Calendrier SSS/);
    
    // Should still have main calendar elements
    expect(screen.getByText('📅 Calendrier SSS - UCLouvain')).toBeInTheDocument();
    expect(screen.getByText('Aujourd\'hui')).toBeInTheDocument();
    expect(screen.getByText('← Précédent')).toBeInTheDocument();
    expect(screen.getByText('Suivant →')).toBeInTheDocument();
    
    // Should still have search functionality
    expect(screen.getByPlaceholderText('Rechercher dans les événements...')).toBeInTheDocument();
  });
});