import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventsGrid } from '../EventsGrid'

// Mock events data - using future dates
const futureDate = new Date()
futureDate.setDate(futureDate.getDate() + 1) // Tomorrow

const mockEvents = [
  {
    id: '1',
    title: 'Event 1',
    description: 'Description 1',
    start: new Date(futureDate.getTime() + 1000 * 60 * 60), // Tomorrow + 1 hour
    end: new Date(futureDate.getTime() + 1000 * 60 * 60 * 2), // Tomorrow + 2 hours
    location: 'Location 1',
    source: 'icloud' as const,
    category: { id: 'meeting', name: 'meeting', color: '#003f7f', source: 'icloud' as const },
    allDay: false,
    color: '#003f7f'
  },
  {
    id: '2',
    title: 'Event 2',
    description: 'Description 2',
    start: new Date(futureDate.getTime() + 1000 * 60 * 60 * 3), // Tomorrow + 3 hours
    end: new Date(futureDate.getTime() + 1000 * 60 * 60 * 4), // Tomorrow + 4 hours
    location: 'Location 2',
    source: 'outlook' as const,
    category: { id: 'conference', name: 'conference', color: '#ff6b35', source: 'outlook' as const },
    allDay: false,
    color: '#ff6b35'
  },
  {
    id: '3',
    title: 'Event 3',
    description: 'Description 3',
    start: new Date(futureDate.getTime() + 1000 * 60 * 60 * 5), // Tomorrow + 5 hours
    end: new Date(futureDate.getTime() + 1000 * 60 * 60 * 6), // Tomorrow + 6 hours
    location: 'Location 3',
    source: 'icloud' as const,
    category: { id: 'workshop', name: 'workshop', color: '#28a745', source: 'icloud' as const },
    allDay: false,
    color: '#28a745'
  }
]

describe('EventsGrid Staggered Animations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should apply staggered animation delays to event cards', async () => {
    render(<EventsGrid events={mockEvents} />)
    
    const cards = screen.getAllByTestId('event-card')
    
    // Check that each card has the correct animation delay
    cards.forEach((card, index) => {
      const expectedDelay = `${index * 100}ms`
      expect(card.style.animationDelay).toBe(expectedDelay)
    })
  })

  it('should handle maximum 6 events display', () => {
    const manyEvents = Array.from({ length: 10 }, (_, i) => ({
      ...mockEvents[0],
      id: `event-${i}`,
      title: `Event ${i}`
    }))

    render(<EventsGrid events={manyEvents} />)
    
    const cards = screen.getAllByTestId('event-card')
    expect(cards).toHaveLength(6)
  })

  it('should apply responsive grid layout classes', () => {
    render(<EventsGrid events={mockEvents} />)
    
    const grid = screen.getByTestId('events-grid')
    expect(grid).toHaveClass('events-grid')
    expect(grid).toHaveClass('responsive-grid')
  })

  it('should measure animation performance', async () => {
    const performanceEntries: PerformanceEntry[] = []
    
    // Mock performance observer
    global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(() => {
        // Simulate performance entries for animations
        const entries = mockEvents.map((_, index) => ({
          name: `event-card-animation-${index}`,
          entryType: 'measure',
          startTime: index * 100,
          duration: 600,
        }))
        callback({ getEntries: () => entries })
      }),
      disconnect: vi.fn(),
    }))

    render(<EventsGrid events={mockEvents} />)
    
    await waitFor(() => {
      expect(global.PerformanceObserver).toHaveBeenCalled()
    })
  })

  it('should handle animation timing correctly', async () => {
    render(<EventsGrid events={mockEvents} />)
    
    const cards = screen.getAllByTestId('event-card')
    
    // Fast-forward time to check animation completion
    vi.advanceTimersByTime(1000)
    
    await waitFor(() => {
      cards.forEach(card => {
        expect(card).toHaveClass('animation-complete')
      })
    })
  })

  it('should respect prefers-reduced-motion setting', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(<EventsGrid events={mockEvents} />)
    
    const grid = screen.getByTestId('events-grid')
    expect(grid).toHaveClass('reduced-motion')
  })
})