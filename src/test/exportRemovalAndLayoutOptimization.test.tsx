import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Calendar } from '../components/Calendar';
import { SearchResults } from '../components/SearchResults';
import { UpcomingEventsSection } from '../components/UpcomingEventsSection';
import { EventModal } from '../components/EventModal';

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

const mockEvent = {
  id: 'test-1',
  title: 'Test Event',
  start: new Date('2025-11-15T10:00:00'),
  end: new Date('2025-11-15T11:00:00'),
  description: 'Test description',
  location: 'Test Location',
  source: 'icloud' as const,
  color: '#ff6b6b',
  allDay: false,
  category: {
    id: 'test-category',
    name: 'Test Category',
    color: '#ff6b6b',
    source: 'icloud' as const
  }
};

describe('Export Removal and Layout Optimization', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Export Functionality Removal', () => {
    it('should not display export button in main header', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Should not contain export button
      expect(screen.queryByText('📄 Exporter')).not.toBeInTheDocument();
      expect(screen.queryByText('Exporter')).not.toBeInTheDocument();
    });

    it('should not display export buttons in SearchResults', () => {
      render(
        <SearchResults
          searchResults={[mockEvent]}
          searchQuery="test"
          isVisible={true}
          onEventClick={() => {}}
        />
      );
      
      // Should not contain export buttons
      expect(screen.queryByText('📅')).not.toBeInTheDocument();
      expect(screen.queryByText('📆')).not.toBeInTheDocument();
      expect(screen.queryByText('💾')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Ajouter à Google Calendar')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Ajouter à Outlook')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Télécharger fichier ICS')).not.toBeInTheDocument();
    });

    it('should not display export buttons in UpcomingEventsSection', () => {
      render(
        <UpcomingEventsSection
          events={[mockEvent]}
          onEventClick={() => {}}
          eventsPerPage={5}
        />
      );
      
      // Should not contain export buttons
      expect(screen.queryByTitle('Exporter vers Google Calendar')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Exporter vers Outlook')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Télécharger fichier ICS')).not.toBeInTheDocument();
    });

    it('should not display export section in EventModal', () => {
      render(
        <EventModal
          event={mockEvent}
          isOpen={true}
          onClose={() => {}}
        />
      );
      
      // Should not contain export section
      expect(screen.queryByText('Ajouter à mon calendrier')).not.toBeInTheDocument();
      expect(screen.queryByText('Google Calendar')).not.toBeInTheDocument();
      expect(screen.queryByText('Outlook')).not.toBeInTheDocument();
      expect(screen.queryByText('Fichier ICS')).not.toBeInTheDocument();
    });
  });

  describe('Layout Optimization', () => {
    it('should display optimized header layout', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Should have main title
      expect(screen.getByText('📅 Calendrier SSS - UCLouvain')).toBeInTheDocument();
      
      // Should have navigation buttons
      expect(screen.getByText('← Précédent')).toBeInTheDocument();
      expect(screen.getByText('Aujourd\'hui')).toBeInTheDocument();
      expect(screen.getByText('Suivant →')).toBeInTheDocument();
      
      // Should have search functionality
      expect(screen.getByPlaceholderText('Rechercher dans les événements...')).toBeInTheDocument();
      
      // Should have view selector
      expect(screen.getByText('Mois')).toBeInTheDocument();
    });

    it('should display events statistics in optimized layout', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Should show events count
      const statsElements = screen.getAllByText(/événements$/);
      expect(statsElements.length).toBeGreaterThan(0);
    });

    it('should maintain responsive design without export buttons', async () => {
      render(<Calendar />);
      
      // Wait for component to load
      await screen.findByText(/Calendrier SSS/);
      
      // Should have all main functionality without export
      expect(screen.getByText('🔄 Actualiser')).toBeInTheDocument();
      expect(screen.getByText('❓')).toBeInTheDocument();
      expect(screen.getByText('Vue mensuelle')).toBeInTheDocument();
    });
  });

  describe('Simplified User Experience', () => {
    it('should have cleaner SearchResults without export clutter', () => {
      render(
        <SearchResults
          searchResults={[mockEvent]}
          searchQuery="test"
          isVisible={true}
          onEventClick={() => {}}
        />
      );
      
      // Should have main functionality
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('ℹ️ Détails')).toBeInTheDocument();
      
      // Should have updated subtitle
      expect(screen.getByText('Cliquez sur un événement pour voir les détails')).toBeInTheDocument();
    });

    it('should have cleaner UpcomingEventsSection without export buttons', () => {
      render(
        <UpcomingEventsSection
          events={[mockEvent]}
          onEventClick={() => {}}
          eventsPerPage={5}
        />
      );
      
      // Should have main functionality
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('👁️ Détails')).toBeInTheDocument();
    });

    it('should have cleaner EventModal focused on event details', () => {
      render(
        <EventModal
          event={mockEvent}
          isOpen={true}
          onClose={() => {}}
        />
      );
      
      // Should focus on event details
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
      
      // Should have close functionality
      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });
});