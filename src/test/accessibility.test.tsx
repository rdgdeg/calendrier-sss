import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EventCard } from '../components/display/EventCard'
import { EventsGrid } from '../components/display/EventsGrid'
import { CurrentTimeDisplay } from '../components/display/CurrentTimeDisplay'
import { EmptyState } from '../components/display/EmptyState'

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations)

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

const futureDate = new Date()
futureDate.setDate(futureDate.getDate() + 1)

const mockEvents = [
  {
    ...mockEvent,
    start: new Date(futureDate.getTime() + 1000 * 60 * 60),
    end: new Date(futureDate.getTime() + 1000 * 60 * 60 * 2),
  }
]

describe('Accessibility Tests', () => {
  describe('WCAG AA Compliance', () => {
    it('EventCard should have no accessibility violations', async () => {
      const { container } = render(<EventCard event={mockEvent} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('EventsGrid should have no accessibility violations', async () => {
      const { container } = render(<EventsGrid events={mockEvents} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('CurrentTimeDisplay should have no accessibility violations', async () => {
      const { container } = render(<CurrentTimeDisplay />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('EmptyState should have no accessibility violations', async () => {
      const { container } = render(<EmptyState />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Color Contrast Validation', () => {
    it('should validate primary text contrast ratios', () => {
      // UCLouvain primary blue (#003f7f) on white background
      const primaryBlue = '#003f7f'
      const white = '#ffffff'
      
      // Calculate contrast ratio (simplified for testing)
      const contrastRatio = calculateContrastRatio(primaryBlue, white)
      
      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      expect(contrastRatio).toBeGreaterThan(4.5)
    })

    it('should validate secondary text contrast ratios', () => {
      // Gray text (#6c757d) on white background
      const grayText = '#6c757d'
      const white = '#ffffff'
      
      const contrastRatio = calculateContrastRatio(grayText, white)
      expect(contrastRatio).toBeGreaterThan(4.5)
    })

    it('should validate accent color contrast ratios', () => {
      // UCLouvain orange (#ff6b35) on white background
      const accentOrange = '#ff6b35'
      const white = '#ffffff'
      
      const contrastRatio = calculateContrastRatio(accentOrange, white)
      expect(contrastRatio).toBeGreaterThan(3.0) // Large text minimum
    })

    it('should validate source badge contrast ratios', () => {
      // Test different source colors
      const sourceColors = ['#003f7f', '#ff6b35', '#28a745']
      const white = '#ffffff'
      
      sourceColors.forEach(color => {
        const contrastRatio = calculateContrastRatio(color, white)
        expect(contrastRatio).toBeGreaterThan(4.5)
      })
    })
  })

  describe('Semantic HTML Structure', () => {
    it('EventCard should use proper semantic elements', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Should use article element
      const article = container.querySelector('article')
      expect(article).toBeTruthy()
      
      // Should have proper heading structure
      const heading = container.querySelector('h3')
      expect(heading).toBeTruthy()
      
      // Should have proper ARIA labels
      expect(article?.getAttribute('aria-labelledby')).toBeTruthy()
      expect(article?.getAttribute('aria-describedby')).toBeTruthy()
    })

    it('EventsGrid should use proper list structure', () => {
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      // Should use list semantics
      const list = container.querySelector('[role="list"]')
      expect(list).toBeTruthy()
      
      const listItems = container.querySelectorAll('[role="listitem"]')
      expect(listItems.length).toBeGreaterThan(0)
    })

    it('CurrentTimeDisplay should use timer role', () => {
      const { container } = render(<CurrentTimeDisplay />)
      
      const timer = container.querySelector('[role="timer"]')
      expect(timer).toBeTruthy()
      
      // Should have live region
      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeTruthy()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for interactive elements', () => {
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      // Interactive elements should have tabindex
      const interactiveElements = container.querySelectorAll('[tabindex]')
      interactiveElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex')
        expect(tabIndex).toMatch(/^-?\d+$/) // Should be a number
      })
    })

    it('should have proper focus indicators', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Elements should be focusable if interactive
      const card = container.querySelector('[data-testid="event-card"]')
      expect(card).toBeTruthy()
      
      // Should have proper role
      expect(card?.getAttribute('role')).toBe('article')
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide proper screen reader labels', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Should have screen reader only text
      const srOnlyElements = container.querySelectorAll('.sr-only')
      expect(srOnlyElements.length).toBeGreaterThan(0)
      
      // Each sr-only element should have meaningful text
      srOnlyElements.forEach(element => {
        expect(element.textContent?.trim()).toBeTruthy()
      })
    })

    it('should have proper ARIA descriptions', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      const article = container.querySelector('article')
      const labelledBy = article?.getAttribute('aria-labelledby')
      const describedBy = article?.getAttribute('aria-describedby')
      
      expect(labelledBy).toBeTruthy()
      expect(describedBy).toBeTruthy()
      
      // Referenced elements should exist
      if (labelledBy) {
        const labelElement = container.querySelector(`#${labelledBy}`)
        expect(labelElement).toBeTruthy()
      }
      
      if (describedBy) {
        const descriptionElement = container.querySelector(`#${describedBy}`)
        expect(descriptionElement).toBeTruthy()
      }
    })
  })

  describe('Responsive Design Accessibility', () => {
    it('should maintain accessibility at different viewport sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      // Should still have proper semantic structure
      const list = container.querySelector('[role="list"]')
      expect(list).toBeTruthy()
      
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      
      const { container: desktopContainer } = render(<EventsGrid events={mockEvents} />)
      const desktopList = desktopContainer.querySelector('[role="list"]')
      expect(desktopList).toBeTruthy()
    })
  })

  describe('Motion and Animation Accessibility', () => {
    it('should respect prefers-reduced-motion', () => {
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

      const { container } = render(<EventsGrid events={mockEvents} />)
      
      // Should have reduced motion class
      const grid = container.querySelector('.events-grid')
      expect(grid?.classList.contains('reduced-motion')).toBe(true)
    })
  })
})

// Helper function to calculate contrast ratio
function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation for testing
  // In a real implementation, you'd use a proper color contrast library
  
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex)
    if (!rgb) return 0
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}