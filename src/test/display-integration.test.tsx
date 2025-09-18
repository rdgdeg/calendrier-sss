import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DisplayView } from '../components/views/DisplayView';
import { CalendarEvent } from '../types';

// Mock data for different event scenarios
const createMockEvent = (id: string, title: string, daysFromNow: number = 0): CalendarEvent => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + daysFromNow);
  startDate.setHours(10, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(11, 0, 0, 0);

  return {
    id,
    title,
    start: startDate,
    end: endDate,
    allDay: false,
    description: `Description for ${title}`,
    location: `Location for ${title}`,
    source: 'test-source',
    color: '#007AFF',
    textColor: '#FFFFFF'
  };
};

// Test scenarios with different event counts
const testScenarios = {
  empty: [],
  single: [createMockEvent('1', 'Single Event', 1)],
  dual: [
    createMockEvent('1', 'First Event', 1),
    createMockEvent('2', 'Second Event', 2)
  ],
  quad: [
    createMockEvent('1', 'Event One', 1),
    createMockEvent('2', 'Event Two', 2),
    createMockEvent('3', 'Event Three', 3),
    createMockEvent('4', 'Event Four', 4)
  ],
  full: [
    createMockEvent('1', 'Event One', 1),
    createMockEvent('2', 'Event Two', 2),
    createMockEvent('3', 'Event Three', 3),
    createMockEvent('4', 'Event Four', 4),
    createMockEvent('5', 'Event Five', 5),
    createMockEvent('6', 'Event Six', 6)
  ],
  overflow: [
    createMockEvent('1', 'Event One', 1),
    createMockEvent('2', 'Event Two', 2),
    createMockEvent('3', 'Event Three', 3),
    createMockEvent('4', 'Event Four', 4),
    createMockEvent('5', 'Event Five', 5),
    createMockEvent('6', 'Event Six', 6),
    createMockEvent('7', 'Event Seven', 7),
    createMockEvent('8', 'Event Eight', 8)
  ]
};

describe('Display Integration Tests - Different Event Counts', () => {
  let mockCurrentDate: Date;

  beforeEach(() => {
    mockCurrentDate = new Date('2024-01-15T09:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockCurrentDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Empty State (0 events)', () => {
    it('should display empty state with proper styling', async () => {
      render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.empty} />);
      
      // Check for empty state presence
      const emptyState = screen.getByRole('status');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveAttribute('aria-label', 'Aucun événement à afficher');
      
      // Verify empty state content
      expect(screen.getByText(/aucun événement/i)).toBeInTheDocument();
      
      // Check for proper CSS classes
      expect(emptyState).toHaveClass('events-grid-empty');
    });

    it('should maintain visual consistency in empty state', () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.empty} />);
      
      // Check for proper layout structure
      const displayView = container.querySelector('.display-view');
      expect(displayView).toHaveStyle({ height: '100vh', overflow: 'hidden' });
      
      // Verify header is still present
      expect(screen.getByText('Événements à Venir - Secteur SSS')).toBeInTheDocument();
    });
  });

  describe('Single Event (1 event)', () => {
    it('should display single event with proper layout', async () => {
      render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.single} />);
      
      await waitFor(() => {
        const eventsGrid = screen.getByTestId('events-grid');
        expect(eventsGrid).toBeInTheDocument();
      });

      // Check for single event display
      expect(screen.getByText('Single Event')).toBeInTheDocument();
      
      // Verify grid layout class
      const gridContainer = screen.getByRole('list');
      expect(gridContainer).toHaveClass('events-grid-single');
      
      // Check aria label
      expect(gridContainer).toHaveAttribute('aria-label', '1 événement à venir');
    });

    it('should apply priority styling to single event', async () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.single} />);
      
      await waitFor(() => {
        const eventPlaceholder = container.querySelector('.event-card-placeholder');
        expect(eventPlaceholder).toHaveClass('event-priority-1');
      });
    });
  });

  describe('Dual Events (2 events)', () => {
    it('should display two events with proper layout', async () => {
      render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.dual} />);
      
      await waitFor(() => {
        expect(screen.getByText('First Event')).toBeInTheDocument();
        expect(screen.getByText('Second Event')).toBeInTheDocument();
      });

      // Verify grid layout class
      const gridContainer = screen.getByRole('list');
      expect(gridContainer).toHaveClass('events-grid-dual');
      expect(gridContainer).toHaveAttribute('aria-label', '2 événements à venir');
    });

    it('should apply correct priority classes to dual events', async () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.dual} />);
      
      await waitFor(() => {
        const eventPlaceholders = container.querySelectorAll('.event-card-placeholder');
        expect(eventPlaceholders[0]).toHaveClass('event-priority-1');
        expect(eventPlaceholders[1]).toHaveClass('event-priority-2');
      });
    });
  });

  describe('Quad Events (4 events)', () => {
    it('should display four events with proper layout', async () => {
      render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.quad} />);
      
      await waitFor(() => {
        expect(screen.getByText('Event One')).toBeInTheDocument();
        expect(screen.getByText('Event Two')).toBeInTheDocument();
        expect(screen.getByText('Event Three')).toBeInTheDocument();
        expect(screen.getByText('Event Four')).toBeInTheDocument();
      });

      // Verify grid layout class
      const gridContainer = screen.getByRole('list');
      expect(gridContainer).toHaveClass('events-grid-quad');
      expect(gridContainer).toHaveAttribute('aria-label', '4 événements à venir');
    });
  });

  describe('Full Display (6 events)', () => {
    it('should display maximum six events', async () => {
      render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.full} />);
      
      await waitFor(() => {
        expect(screen.getByText('Event One')).toBeInTheDocument();
        expect(screen.getByText('Event Six')).toBeInTheDocument();
      });

      // Verify all 6 events are displayed
      const gridContainer = screen.getByRole('list');
      expect(gridContainer).toHaveClass('events-grid-full');
      expect(gridContainer).toHaveAttribute('aria-label', '6 événements à venir');
      
      // Check that all events are present
      const eventCards = screen.getAllByRole('listitem');
      expect(eventCards).toHaveLength(6);
    });

    it('should apply priority classes correctly to full display', async () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.full} />);
      
      await waitFor(() => {
        const eventPlaceholders = container.querySelectorAll('.event-card-placeholder');
        expect(eventPlaceholders[0]).toHaveClass('event-priority-1');
        expect(eventPlaceholders[1]).toHaveClass('event-priority-2');
        expect(eventPlaceholders[2]).toHaveClass('event-priority-3');
        expect(eventPlaceholders[3]).toHaveClass('event-priority-3');
        expect(eventPlaceholders[4]).toHaveClass('event-priority-3');
        expect(eventPlaceholders[5]).toHaveClass('event-priority-3');
      });
    });
  });

  describe('Overflow Handling (8+ events)', () => {
    it('should limit display to maximum 6 events', async () => {
      render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.overflow} />);
      
      await waitFor(() => {
        // Should show first 6 events
        expect(screen.getByText('Event One')).toBeInTheDocument();
        expect(screen.getByText('Event Six')).toBeInTheDocument();
        
        // Should not show overflow events
        expect(screen.queryByText('Event Seven')).not.toBeInTheDocument();
        expect(screen.queryByText('Event Eight')).not.toBeInTheDocument();
      });

      // Verify exactly 6 events are displayed
      const eventCards = screen.getAllByRole('listitem');
      expect(eventCards).toHaveLength(6);
    });

    it('should maintain visual consistency with overflow', async () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.overflow} />);
      
      await waitFor(() => {
        // Check that hidden events have display: none
        const allPlaceholders = container.querySelectorAll('.event-card-placeholder');
        expect(allPlaceholders).toHaveLength(6); // Only 6 should be rendered
      });
    });
  });

  describe('Visual Consistency Across States', () => {
    it('should maintain consistent header across all states', () => {
      const scenarios = Object.entries(testScenarios);
      
      scenarios.forEach(([scenarioName, events]) => {
        const { unmount } = render(<DisplayView currentDate={mockCurrentDate} events={events} />);
        
        // Header should always be present
        expect(screen.getByText('Événements à Venir - Secteur SSS')).toBeInTheDocument();
        
        // Main container should have consistent styling
        const main = screen.getByRole('main');
        expect(main).toHaveClass('display-view');
        expect(main).toHaveAttribute('aria-label', 'Affichage public des événements UCLouvain');
        
        unmount();
      });
    });

    it('should maintain consistent grid structure', async () => {
      const nonEmptyScenarios = Object.entries(testScenarios).filter(([name]) => name !== 'empty');
      
      for (const [scenarioName, events] of nonEmptyScenarios) {
        const { unmount, container } = render(<DisplayView currentDate={mockCurrentDate} events={events} />);
        
        await waitFor(() => {
          const eventsGrid = screen.getByTestId('events-grid');
          expect(eventsGrid).toHaveClass('events-grid', 'responsive-grid');
          
          // Check for consistent grid container structure
          const gridContainer = screen.getByRole('list');
          expect(gridContainer).toHaveClass('events-grid-container');
        });
        
        unmount();
      }
    });

    it('should apply consistent animation delays', async () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.full} />);
      
      await waitFor(() => {
        const eventPlaceholders = container.querySelectorAll('.event-card-placeholder');
        
        // Check staggered animation delays
        expect(eventPlaceholders[0]).toHaveStyle({ animationDelay: '0ms' });
        expect(eventPlaceholders[1]).toHaveStyle({ animationDelay: '100ms' });
        expect(eventPlaceholders[2]).toHaveStyle({ animationDelay: '200ms' });
        expect(eventPlaceholders[3]).toHaveStyle({ animationDelay: '300ms' });
        expect(eventPlaceholders[4]).toHaveStyle({ animationDelay: '400ms' });
        expect(eventPlaceholders[5]).toHaveStyle({ animationDelay: '500ms' });
      });
    });
  });

  describe('Accessibility Consistency', () => {
    it('should maintain proper ARIA labels across all states', async () => {
      const scenarios = Object.entries(testScenarios);
      
      for (const [scenarioName, events] of scenarios) {
        const { unmount } = render(<DisplayView currentDate={mockCurrentDate} events={events} />);
        
        // Main container accessibility
        const main = screen.getByRole('main');
        expect(main).toHaveAttribute('aria-label', 'Affichage public des événements UCLouvain');
        
        if (events.length > 0) {
          await waitFor(() => {
            const section = screen.getByRole('region');
            expect(section).toHaveAttribute('aria-label', 'Liste des prochains événements');
            
            const list = screen.getByRole('list');
            const expectedLabel = `${events.length > 6 ? 6 : events.length} événement${events.length > 1 ? 's' : ''} à venir`;
            expect(list).toHaveAttribute('aria-label', expectedLabel);
          });
        } else {
          const emptyState = screen.getByRole('status');
          expect(emptyState).toHaveAttribute('aria-label', 'Aucun événement à afficher');
        }
        
        unmount();
      }
    });

    it('should provide proper keyboard navigation support', async () => {
      const mockOnEventClick = vi.fn();
      const { container } = render(
        <DisplayView 
          currentDate={mockCurrentDate} 
          events={testScenarios.quad} 
          onEventClick={mockOnEventClick}
        />
      );
      
      await waitFor(() => {
        const eventPlaceholders = container.querySelectorAll('.event-card-placeholder');
        
        eventPlaceholders.forEach(placeholder => {
          expect(placeholder).toHaveAttribute('tabIndex', '0');
          expect(placeholder).toHaveAttribute('role', 'listitem');
        });
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should handle rapid event updates efficiently', async () => {
      const { rerender } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.empty} />);
      
      // Simulate rapid updates
      await act(async () => {
        rerender(<DisplayView currentDate={mockCurrentDate} events={testScenarios.single} />);
        rerender(<DisplayView currentDate={mockCurrentDate} events={testScenarios.dual} />);
        rerender(<DisplayView currentDate={mockCurrentDate} events={testScenarios.full} />);
      });
      
      // Should end up with the final state
      await waitFor(() => {
        expect(screen.getByText('Event Six')).toBeInTheDocument();
        const eventCards = screen.getAllByRole('listitem');
        expect(eventCards).toHaveLength(6);
      });
    });

    it('should maintain performance with continuous display', async () => {
      const { container } = render(<DisplayView currentDate={mockCurrentDate} events={testScenarios.full} />);
      
      // Check for performance optimizations
      await waitFor(() => {
        const eventsGrid = container.querySelector('.events-grid');
        expect(eventsGrid).toHaveStyle({ overflow: 'hidden' });
        
        const displayView = container.querySelector('.display-view');
        expect(displayView).toHaveStyle({ height: '100vh', overflow: 'hidden' });
      });
    });
  });
});