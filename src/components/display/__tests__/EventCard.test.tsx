import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventCard } from '../EventCard'

// Mock event data
const mockEvent = {
  id: '1',
  title: 'Test Event',
  description: 'Test Description',
  start: new Date('2024-01-15T10:00:00'),
  end: new Date('2024-01-15T11:00:00'),
  location: 'Test Location',
  source: 'icloud' as const,
  category: { id: 'meeting', name: 'meeting', color: '#003f7f', source: 'icloud' as const },
  allDay: false,
  color: '#003f7f'
}

describe('EventCard Animations and Transitions', () => {
  beforeEach(() => {
    // Mock performance.now for animation timing
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have slideInUp animation class applied', () => {
    render(<EventCard event={mockEvent} />)
    const card = screen.getByTestId('event-card')
    
    expect(card).toHaveClass('slide-in-up')
  })

  it('should apply hover effects on mouse enter', async () => {
    render(<EventCard event={mockEvent} />)
    const card = screen.getByTestId('event-card')
    
    fireEvent.mouseEnter(card)
    
    await waitFor(() => {
      expect(card).toHaveClass('hover-effect')
    })
  })

  it('should remove hover effects on mouse leave', async () => {
    render(<EventCard event={mockEvent} />)
    const card = screen.getByTestId('event-card')
    
    fireEvent.mouseEnter(card)
    fireEvent.mouseLeave(card)
    
    await waitFor(() => {
      expect(card).not.toHaveClass('hover-effect')
    })
  })

  it('should have proper CSS transition properties', () => {
    render(<EventCard event={mockEvent} />)
    const card = screen.getByTestId('event-card')
    
    const computedStyle = window.getComputedStyle(card)
    expect(computedStyle.transitionDuration).toBe('0.3s')
  })

  it('should maintain accessibility during animations', () => {
    render(<EventCard event={mockEvent} />)
    const card = screen.getByTestId('event-card')
    
    // Check that animations respect accessibility
    expect(card.getAttribute('role')).toBe('article')
    expect(card).toHaveAttribute('aria-labelledby')
    expect(card).toHaveAttribute('aria-describedby')
  })

  it('should handle animation performance metrics', async () => {
    const performanceObserver = vi.fn()
    global.PerformanceObserver = vi.fn().mockImplementation(() => ({
      observe: performanceObserver,
      disconnect: vi.fn(),
    }))

    render(<EventCard event={mockEvent} />)
    
    // Simulate animation completion
    await waitFor(() => {
      expect(performanceObserver).toHaveBeenCalled()
    }, { timeout: 1000 })
  })
})