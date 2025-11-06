import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Calendar } from '../components/Calendar';
import { Footer } from '../components/Footer';

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

describe('Header Redesign and Footer Updates', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Footer Updates', () => {
    it('should display updated footer text with UCLouvain - Secteur des Sciences de la Santé', () => {
      render(<Footer />);
      
      expect(screen.getByText('UCLouvain - Secteur des Sciences de la Santé')).toBeInTheDocument();
      expect(screen.queryByText('Université catholique de Louvain')).not.toBeInTheDocument();
    });

    it('should display version and last update date', () => {
      render(<Footer />);
      
      expect(screen.getByText(/Version 2\.1\.0/)).toBeInTheDocument();
      expect(screen.getByText(/Dernière mise à jour/)).toBeInTheDocument();
      
      // Check that current date is displayed
      const currentDate = new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      expect(screen.getByText(new RegExp(currentDate))).toBeInTheDocument();
    });
  });

  describe('Header Redesign', () => {
    it('should display redesigned header with proper structure', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Check navigation buttons are present
      expect(screen.getByText('← Précédent')).toBeInTheDocument();
      expect(screen.getByText('Aujourd\'hui')).toBeInTheDocument();
      expect(screen.getByText('Suivant →')).toBeInTheDocument();
      
      // Check month/year display (use getAllByText to handle multiple instances)
      const monthElements = screen.getAllByText(/novembre 2025/i);
      expect(monthElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Vue mensuelle')).toBeInTheDocument();
      
      // Check search functionality
      expect(screen.getByPlaceholderText('Rechercher dans les événements...')).toBeInTheDocument();
      
      // Check events statistics (use getAllByText to handle multiple instances)
      const statsElements = screen.getAllByText(/événements$/);
      expect(statsElements.length).toBeGreaterThan(0);
    });

    it('should display events count in the new stats section', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Should show events count (even if 0)
      const statsElement = screen.getByText(/\d+ événements$/);
      expect(statsElement).toBeInTheDocument();
    });

    it('should maintain responsive design elements', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Check that key elements are present for responsive design
      expect(screen.getByText('← Précédent')).toBeInTheDocument();
      expect(screen.getByText('Suivant →')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher dans les événements...')).toBeInTheDocument();
    });
  });

  describe('Layout Organization', () => {
    it('should have navigation and title on the same row conceptually', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Check that navigation elements and title are both present
      const navigation = screen.getByText('← Précédent');
      const titleElements = screen.getAllByText(/novembre 2025/i);
      const viewSelector = screen.getByText('Mois');
      
      expect(navigation).toBeInTheDocument();
      expect(titleElements.length).toBeGreaterThan(0);
      expect(viewSelector).toBeInTheDocument();
    });

    it('should have search and stats on the same conceptual row', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Check that search and stats are both present
      const searchInput = screen.getByPlaceholderText('Rechercher dans les événements...');
      const statsElements = screen.getAllByText(/événements$/);
      
      expect(searchInput).toBeInTheDocument();
      expect(statsElements.length).toBeGreaterThan(0);
    });
  });
});