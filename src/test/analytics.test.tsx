import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VisitStats } from '../components/VisitStats';
import { trackVisit, getVisitStats } from '../utils/analytics';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        not: vi.fn(() => ({
          not: vi.fn().mockResolvedValue({ data: [{ session_id: 'test1' }, { session_id: 'test2' }] })
        })),
        gte: vi.fn().mockResolvedValue({ count: 10 })
      }))
    }))
  }
}));

// Mock des fonctions analytics
vi.mock('../utils/analytics', () => ({
  trackVisit: vi.fn(),
  getVisitStats: vi.fn()
}));

const mockStats = {
  total_visits: 1234,
  unique_sessions: 567,
  today_visits: 12,
  this_week_visits: 89,
  this_month_visits: 345
};

describe('Analytics System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackVisit function', () => {
    it('should call trackVisit without errors', async () => {
      const mockTrackVisit = vi.mocked(trackVisit);
      mockTrackVisit.mockResolvedValue();

      await trackVisit();
      
      expect(mockTrackVisit).toHaveBeenCalledOnce();
    });

    it('should handle errors gracefully', async () => {
      const mockTrackVisit = vi.mocked(trackVisit);
      mockTrackVisit.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(trackVisit()).rejects.toThrow('Network error');
    });
  });

  describe('VisitStats Component', () => {
    it('should display loading state initially', () => {
      const mockGetVisitStats = vi.mocked(getVisitStats);
      mockGetVisitStats.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<VisitStats />);
      
      expect(screen.getByText('Chargement des stats...')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('should display compact stats when loaded', async () => {
      const mockGetVisitStats = vi.mocked(getVisitStats);
      mockGetVisitStats.mockResolvedValue(mockStats);

      render(<VisitStats />);
      
      await waitFor(() => {
        expect(screen.getByText('👥')).toBeInTheDocument();
        expect(screen.getByText('1 234 visites')).toBeInTheDocument();
        expect(screen.getByText('+12 aujourd\'hui')).toBeInTheDocument();
      });
    });

    it('should display detailed stats when showDetailed is true', async () => {
      const mockGetVisitStats = vi.mocked(getVisitStats);
      mockGetVisitStats.mockResolvedValue(mockStats);

      render(<VisitStats showDetailed={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Statistiques de visite')).toBeInTheDocument();
        expect(screen.getByText('1 234')).toBeInTheDocument();
        expect(screen.getByText('Visites totales')).toBeInTheDocument();
        expect(screen.getByText('567')).toBeInTheDocument();
        expect(screen.getByText('Sessions uniques')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('Aujourd\'hui')).toBeInTheDocument();
      });
    });

    it('should not display anything when stats fail to load', async () => {
      const mockGetVisitStats = vi.mocked(getVisitStats);
      mockGetVisitStats.mockResolvedValue(null);

      const { container } = render(<VisitStats />);
      
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should handle zero visits gracefully', async () => {
      const mockGetVisitStats = vi.mocked(getVisitStats);
      mockGetVisitStats.mockResolvedValue({
        total_visits: 0,
        unique_sessions: 0,
        today_visits: 0,
        this_week_visits: 0,
        this_month_visits: 0
      });

      render(<VisitStats />);
      
      await waitFor(() => {
        expect(screen.getByText('0 visite')).toBeInTheDocument();
        expect(screen.queryByText('+0 aujourd\'hui')).not.toBeInTheDocument();
      });
    });

    it('should apply custom className', async () => {
      const mockGetVisitStats = vi.mocked(getVisitStats);
      mockGetVisitStats.mockResolvedValue(mockStats);

      const { container } = render(<VisitStats className="custom-class" />);
      
      await waitFor(() => {
        expect(container.firstChild).toHaveClass('custom-class');
      });
    });
  });

  describe('Analytics Integration', () => {
    it('should format numbers with locale', async () => {
      const mockGetVisitStats = vi.mocked(getVisitStats);
      mockGetVisitStats.mockResolvedValue({
        total_visits: 12345,
        unique_sessions: 6789,
        today_visits: 0,
        this_week_visits: 123,
        this_month_visits: 1234
      });

      render(<VisitStats showDetailed={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('12 345')).toBeInTheDocument();
        expect(screen.getByText('6 789')).toBeInTheDocument();
      });
    });

    it('should not show today badge when no visits today', async () => {
      const mockGetVisitStats = vi.mocked(getVisitStats);
      mockGetVisitStats.mockResolvedValue({
        ...mockStats,
        today_visits: 0
      });

      render(<VisitStats />);
      
      await waitFor(() => {
        expect(screen.getByText('1 234 visites')).toBeInTheDocument();
        expect(screen.queryByText(/aujourd'hui/)).not.toBeInTheDocument();
      });
    });
  });
});