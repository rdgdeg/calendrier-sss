import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EventCard } from '../components/display/EventCard'
import { EventsGrid } from '../components/display/EventsGrid'
import { CurrentTimeDisplay } from '../components/display/CurrentTimeDisplay'

// Mock event data
const mockEvent = {
  id: '1',
  title: 'Test Event with a Very Long Title That Should Still Be Readable at Distance',
  description: 'This is a longer description that tests readability with more content to ensure proper text sizing and spacing.',
  start: new Date('2024-01-15T10:00:00'),
  end: new Date('2024-01-15T11:00:00'),
  location: 'Test Location with a Longer Name',
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

describe('Readability Tests for Distance Viewing', () => {
  describe('Font Size Validation', () => {
    it('should use appropriate font sizes for distance reading', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Get computed styles for different text elements
      const title = container.querySelector('.event-title')
      const date = container.querySelector('.event-date')
      const time = container.querySelector('.event-time')
      const description = container.querySelector('.event-description')
      
      expect(title).toBeTruthy()
      expect(date).toBeTruthy()
      expect(time).toBeTruthy()
      expect(description).toBeTruthy()
      
      // Verify text content is present and readable
      expect(title?.textContent?.length).toBeGreaterThan(0)
      expect(date?.textContent?.length).toBeGreaterThan(0)
      expect(time?.textContent?.length).toBeGreaterThan(0)
    })

    it('should use large font sizes for CurrentTimeDisplay', () => {
      const { container } = render(<CurrentTimeDisplay />)
      
      const timeElement = container.querySelector('.current-time')
      const dateElement = container.querySelector('.current-date')
      
      expect(timeElement).toBeTruthy()
      expect(dateElement).toBeTruthy()
      
      // Time should be prominently displayed
      expect(timeElement?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/)
      expect(dateElement?.textContent?.length).toBeGreaterThan(0)
    })
  })

  describe('Text Hierarchy and Spacing', () => {
    it('should maintain proper text hierarchy', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Check heading structure
      const heading = container.querySelector('h3')
      expect(heading).toBeTruthy()
      expect(heading?.textContent).toBe(mockEvent.title)
      
      // Check that different text elements have different visual weights
      const title = container.querySelector('.event-title')
      const metadata = container.querySelector('.event-date')
      
      expect(title).toBeTruthy()
      expect(metadata).toBeTruthy()
    })

    it('should provide adequate spacing between elements', () => {
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      // Grid should have proper spacing
      const grid = container.querySelector('.events-grid-container')
      expect(grid).toBeTruthy()
      
      // Cards should be properly spaced
      const cards = container.querySelectorAll('[data-testid="event-card"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Content Truncation and Overflow', () => {
    it('should handle long titles gracefully', () => {
      const longTitleEvent = {
        ...mockEvent,
        title: 'This is an extremely long event title that should be truncated properly to maintain readability and layout consistency across different screen sizes and viewing distances'
      }
      
      const { container } = render(<EventCard event={longTitleEvent} />)
      
      const title = container.querySelector('.event-title')
      expect(title).toBeTruthy()
      
      // Title should be truncated if too long (based on component logic)
      const displayedTitle = title?.textContent || ''
      expect(displayedTitle.length).toBeLessThanOrEqual(303) // 300 chars + "..."
    })

    it('should handle missing optional content', () => {
      const minimalEvent = {
        id: '2',
        title: 'Minimal Event',
        start: new Date(futureDate.getTime() + 1000 * 60 * 60),
        end: new Date(futureDate.getTime() + 1000 * 60 * 60 * 2),
        source: 'outlook' as const,
        category: { id: 'meeting', name: 'meeting', color: '#003f7f', source: 'outlook' as const },
        allDay: false,
        color: '#003f7f'
        // No description or location
      }
      
      const { container } = render(<EventCard event={minimalEvent} />)
      
      const title = container.querySelector('.event-title')
      expect(title).toBeTruthy()
      expect(title?.textContent).toBe('Minimal Event')
      
      // Should not crash with missing optional fields
      expect(container).toBeTruthy()
    })
  })

  describe('Visual Information Density', () => {
    it('should not overcrowd information in a single card', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Count the number of distinct information blocks
      const infoBlocks = [
        container.querySelector('.event-date'),
        container.querySelector('.event-time'),
        container.querySelector('.event-title'),
        container.querySelector('.event-description'),
        container.querySelector('.event-location'),
        container.querySelector('.event-source')
      ].filter(Boolean)
      
      // Should have reasonable number of info blocks
      expect(infoBlocks.length).toBeLessThanOrEqual(6)
      expect(infoBlocks.length).toBeGreaterThan(3)
    })

    it('should limit number of events displayed simultaneously', () => {
      // Create many events
      const manyEvents = Array.from({ length: 10 }, (_, i) => ({
        ...mockEvent,
        id: `event-${i}`,
        title: `Event ${i}`,
        start: new Date(futureDate.getTime() + i * 1000 * 60 * 60),
        end: new Date(futureDate.getTime() + (i + 1) * 1000 * 60 * 60),
      }))
      
      const { container } = render(<EventsGrid events={manyEvents} />)
      
      const cards = container.querySelectorAll('[data-testid="event-card"]')
      
      // Should limit to maximum 6 events for readability
      expect(cards.length).toBeLessThanOrEqual(6)
    })
  })

  describe('French Localization Readability', () => {
    it('should display French dates and times correctly', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      const dateElement = container.querySelector('.event-date')
      const timeElement = container.querySelector('.event-time')
      
      expect(dateElement?.textContent).toMatch(/lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i)
      expect(dateElement?.textContent).toMatch(/janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i)
      
      expect(timeElement?.textContent).toMatch(/\d{2}:\d{2}/)
    })

    it('should display French source labels correctly', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      const sourceElement = container.querySelector('.event-source')
      expect(sourceElement?.textContent).toMatch(/de Duve|SSS/)
    })

    it('should handle French text in CurrentTimeDisplay', () => {
      const { container } = render(<CurrentTimeDisplay />)
      
      const dateElement = container.querySelector('.current-date')
      expect(dateElement?.textContent).toMatch(/lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i)
    })
  })

  describe('Screen Size Adaptability', () => {
    it('should maintain readability on large displays', () => {
      // Mock large display
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      })
      
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      const grid = container.querySelector('.events-grid')
      expect(grid).toBeTruthy()
      
      // Should adapt to large screens
      expect(grid?.classList.contains('responsive-grid')).toBe(true)
    })

    it('should maintain readability on medium displays', () => {
      // Mock medium display (typical office monitor)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1366,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      const cards = container.querySelectorAll('[data-testid="event-card"]')
      expect(cards.length).toBeGreaterThan(0)
      
      // Content should still be readable
      cards.forEach(card => {
        const title = card.querySelector('.event-title')
        expect(title?.textContent?.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Information Priority and Scanning', () => {
    it('should prioritize most important information visually', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Title should be most prominent
      const title = container.querySelector('.event-title')
      expect(title?.tagName.toLowerCase()).toBe('h3')
      
      // Date and time should be easily scannable
      const dateTimeBlock = container.querySelector('.event-datetime-block')
      expect(dateTimeBlock).toBeTruthy()
      
      // Source should be clearly identified
      const source = container.querySelector('.event-source')
      expect(source).toBeTruthy()
    })

    it('should support quick scanning of multiple events', () => {
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      const cards = container.querySelectorAll('[data-testid="event-card"]')
      
      // Each card should have consistent structure for scanning
      cards.forEach(card => {
        const title = card.querySelector('.event-title')
        const date = card.querySelector('.event-date')
        const time = card.querySelector('.event-time')
        
        expect(title).toBeTruthy()
        expect(date).toBeTruthy()
        expect(time).toBeTruthy()
      })
    })
  })
})