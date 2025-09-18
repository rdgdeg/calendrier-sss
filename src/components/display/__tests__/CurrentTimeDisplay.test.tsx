import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CurrentTimeDisplay } from '../CurrentTimeDisplay'

describe('CurrentTimeDisplay Continuous Animations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:30:45'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should update time every second with fade transition', async () => {
    render(<CurrentTimeDisplay />)
    
    const timeDisplay = screen.getByTestId('current-time-display')
    const initialTime = timeDisplay.textContent
    
    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    await waitFor(() => {
      expect(timeDisplay.textContent).not.toBe(initialTime)
    })
  })

  it('should apply fade transition class during updates', async () => {
    render(<CurrentTimeDisplay />)
    
    const timeDisplay = screen.getByTestId('current-time-display')
    
    // Advance time to trigger update
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    await waitFor(() => {
      expect(timeDisplay).toHaveClass('time-updating')
    })
  })

  it('should have pulse animation for continuous engagement', () => {
    render(<CurrentTimeDisplay />)
    
    const timeDisplay = screen.getByTestId('current-time-display')
    expect(timeDisplay).toHaveClass('pulse-animation')
  })

  it('should format time correctly in French locale', () => {
    render(<CurrentTimeDisplay />)
    
    const timeDisplay = screen.getByTestId('current-time-display')
    const timeText = timeDisplay.textContent
    
    // Should contain French day name and proper time format
    expect(timeText).toMatch(/lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i)
    expect(timeText).toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  it('should handle animation performance monitoring', async () => {
    const performanceEntries: PerformanceEntry[] = []
    
    global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(() => {
        const entries = [{
          name: 'time-update-animation',
          entryType: 'measure',
          startTime: 0,
          duration: 300,
        }]
        callback({ getEntries: () => entries })
      }),
      disconnect: vi.fn(),
    }))

    render(<CurrentTimeDisplay />)
    
    await waitFor(() => {
      expect(global.PerformanceObserver).toHaveBeenCalled()
    })
  })

  it('should cleanup timer on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    const { unmount } = render(<CurrentTimeDisplay />)
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should respect reduced motion preferences', () => {
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

    render(<CurrentTimeDisplay />)
    
    const timeDisplay = screen.getByTestId('current-time-display')
    expect(timeDisplay).toHaveClass('reduced-motion')
  })

  it('should maintain accessibility during animations', () => {
    render(<CurrentTimeDisplay />)
    
    const timeDisplay = screen.getByTestId('current-time-display')
    
    expect(timeDisplay).toHaveAttribute('aria-live', 'polite')
    expect(timeDisplay).toHaveAttribute('aria-label')
    expect(timeDisplay.getAttribute('role')).toBe('timer')
  })
})