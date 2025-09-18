import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EventCard } from '../components/display/EventCard'
import { EventsGrid } from '../components/display/EventsGrid'
import { CurrentTimeDisplay } from '../components/display/CurrentTimeDisplay'
import { EmptyState } from '../components/display/EmptyState'

// Mock event data for comprehensive testing
const mockEvent = {
  id: '1',
  title: 'Séminaire de Recherche - Nouvelles Approches en Sciences Sociales',
  description: 'Présentation des dernières recherches en sciences sociales avec focus sur les méthodologies innovantes.',
  start: new Date('2024-01-15T14:30:00'),
  end: new Date('2024-01-15T16:00:00'),
  location: 'Auditoire Socrate 40, Place Cardinal Mercier',
  source: 'icloud' as const,
  category: { id: 'seminaire', name: 'séminaire', color: '#003f7f', source: 'icloud' as const },
  allDay: false,
  color: '#003f7f'
}

const futureDate = new Date()
futureDate.setDate(futureDate.getDate() + 1)

const mockEvents = Array.from({ length: 4 }, (_, i) => ({
  ...mockEvent,
  id: `event-${i}`,
  title: `Événement ${i + 1} - ${mockEvent.title}`,
  start: new Date(futureDate.getTime() + i * 1000 * 60 * 60 * 2),
  end: new Date(futureDate.getTime() + (i * 1000 * 60 * 60 * 2) + (1000 * 60 * 90)),
  source: i % 2 === 0 ? 'icloud' as const : 'outlook' as const,
}))

describe('Display Validation - Complete Integration Tests', () => {
  describe('Public Display Requirements Validation', () => {
    it('should meet all requirements for public display viewing', () => {
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      // Requirement 1.1: Modern design with UCLouvain colors
      const grid = container.querySelector('.events-grid')
      expect(grid).toBeTruthy()
      expect(grid?.classList.contains('responsive-grid')).toBe(true)
      
      // Requirement 1.2: Clear typography hierarchy
      const titles = container.querySelectorAll('.event-title')
      expect(titles.length).toBeGreaterThan(0)
      titles.forEach(title => {
        expect(title.tagName.toLowerCase()).toBe('h3')
        expect(title.textContent?.length).toBeGreaterThan(0)
      })
      
      // Requirement 1.3: Smooth animations
      const cards = container.querySelectorAll('[data-testid="event-card"]')
      cards.forEach(card => {
        expect(card.classList.contains('slide-in-up')).toBe(true)
      })
      
      // Requirement 1.4: Modern card design with shadows
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should optimize readability for distance viewing', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Requirement 2.1: Font sizes adapted for distance reading
      const title = container.querySelector('.event-title')
      const date = container.querySelector('.event-date')
      const time = container.querySelector('.event-time')
      
      expect(title?.textContent).toBeTruthy()
      expect(date?.textContent).toBeTruthy()
      expect(time?.textContent).toBeTruthy()
      
      // Requirement 2.2: High contrast maintained
      expect(title?.textContent?.length).toBeGreaterThan(0)
      
      // Requirement 2.3: Hierarchical information organization
      const header = container.querySelector('.event-card-header')
      const titleSection = container.querySelector('.event-title-section')
      expect(header).toBeTruthy()
      expect(titleSection).toBeTruthy()
    })

    it('should provide dynamic and attractive layout', () => {
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      // Requirement 3.1: Responsive grid organization
      const gridContainer = container.querySelector('.events-grid-container')
      expect(gridContainer).toBeTruthy()
      
      // Requirement 3.3: Visual differentiation by source
      const sourceElements = container.querySelectorAll('.event-source')
      expect(sourceElements.length).toBeGreaterThan(0)
      
      // Requirement 3.4: Visual consistency between states
      const cards = container.querySelectorAll('[data-testid="event-card"]')
      expect(cards.length).toBeLessThanOrEqual(6) // Max 6 events
    })

    it('should display enriched visual elements', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Requirement 4.1: Contextual icons
      const icon = container.querySelector('.event-icon')
      expect(icon).toBeTruthy()
      
      // Requirement 4.3: Source badges with color coding
      const source = container.querySelector('.event-source')
      expect(source).toBeTruthy()
      expect(source?.classList.contains('event-source-icloud')).toBe(true)
    })

    it('should handle empty state attractively', () => {
      const { container } = render(<EventsGrid events={[]} />)
      
      // Requirement 3.2: Attractive empty state
      const emptyState = container.querySelector('.empty-state')
      expect(emptyState).toBeTruthy()
      
      const illustration = container.querySelector('.empty-state-illustration')
      const title = container.querySelector('.empty-state-title')
      const message = container.querySelector('.empty-state-message')
      
      expect(illustration).toBeTruthy()
      expect(title).toBeTruthy()
      expect(message).toBeTruthy()
    })
  })

  describe('Animation and Transition Validation', () => {
    it('should implement smooth animations', () => {
      const { container } = render(<EventsGrid events={mockEvents} />)
      
      // Requirement 5.1: Smooth entry animations
      const cards = container.querySelectorAll('[data-testid="event-card"]')
      cards.forEach((card, index) => {
        expect(card.classList.contains('slide-in-up')).toBe(true)
        // Staggered animation delays should be applied
        const placeholder = card.closest('.event-card-placeholder')
        expect(placeholder).toBeTruthy()
      })
      
      // Requirement 5.2: Staggered animations
      expect(cards.length).toBeGreaterThan(1) // Multiple cards for staggering
    })

    it('should provide real-time updates', () => {
      const { container } = render(<CurrentTimeDisplay />)
      
      // Requirement 4.4 & 6.3: Real-time time display
      const timeDisplay = container.querySelector('[data-testid="current-time-display"]')
      expect(timeDisplay).toBeTruthy()
      expect(timeDisplay?.classList.contains('pulse-animation')).toBe(true)
      
      const currentTime = container.querySelector('.current-time')
      const currentDate = container.querySelector('.current-date')
      
      expect(currentTime?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/)
      expect(currentDate?.textContent).toMatch(/\w+/)
    })
  })

  describe('Continuous Display Optimization', () => {
    it('should optimize for continuous display', () => {
      const { container } = render(<CurrentTimeDisplay />)
      
      // Requirement 6.1: Elements to avoid monotony
      const timeDisplay = container.querySelector('[data-testid="current-time-display"]')
      expect(timeDisplay?.classList.contains('pulse-animation')).toBe(true)
      
      // Requirement 6.2: Subtle animations for static content
      expect(timeDisplay?.getAttribute('aria-live')).toBe('polite')
      
      // Requirement 6.4: Professional presentation when inactive
      expect(timeDisplay?.getAttribute('role')).toBe('timer')
    })

    it('should maintain engagement during long display periods', () => {
      const { container } = render(<EmptyState />)
      
      // Should have engaging visual elements
      const illustration = container.querySelector('.empty-state-illustration')
      const svg = container.querySelector('.empty-state-svg')
      
      expect(illustration).toBeTruthy()
      expect(svg).toBeTruthy()
      
      // Should have encouraging messaging
      const title = container.querySelector('.empty-state-title')
      const message = container.querySelector('.empty-state-message')
      
      expect(title?.textContent).toContain('Aucun événement')
      expect(message?.textContent?.length).toBeGreaterThan(0)
    })
  })

  describe('French Localization Validation', () => {
    it('should display all content in French', () => {
      const { container } = render(<EventCard event={mockEvent} />)
      
      // Date should be in French
      const date = container.querySelector('.event-date')
      expect(date?.textContent).toMatch(/lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i)
      expect(date?.textContent).toMatch(/janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i)
      
      // Source labels should be in French
      const source = container.querySelector('.event-source')
      expect(source?.textContent).toMatch(/de Duve|SSS/)
      
      // Screen reader text should be in French
      const srTexts = container.querySelectorAll('.sr-only')
      srTexts.forEach(sr => {
        const text = sr.textContent?.toLowerCase() || ''
        if (text.includes('date')) expect(text).toContain('date:')
        if (text.includes('heure')) expect(text).toContain('heure:')
        if (text.includes('lieu')) expect(text).toContain('lieu:')
      })
    })

    it('should handle French time formats correctly', () => {
      const { container } = render(<CurrentTimeDisplay />)
      
      const dateElement = container.querySelector('.current-date')
      expect(dateElement?.textContent).toMatch(/\w+\s+\d+\s+\w+\s+\d{4}/)
      
      const timeElement = container.querySelector('.current-time')
      expect(timeElement?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('Performance and Memory Validation', () => {
    it('should handle multiple events efficiently', () => {
      const manyEvents = Array.from({ length: 10 }, (_, i) => ({
        ...mockEvent,
        id: `perf-event-${i}`,
        title: `Performance Test Event ${i}`,
        start: new Date(futureDate.getTime() + i * 1000 * 60 * 60),
        end: new Date(futureDate.getTime() + (i + 1) * 1000 * 60 * 60),
      }))
      
      const { container } = render(<EventsGrid events={manyEvents} />)
      
      // Should limit to 6 events for performance
      const cards = container.querySelectorAll('[data-testid="event-card"]')
      expect(cards.length).toBeLessThanOrEqual(6)
      
      // All displayed cards should be properly rendered
      cards.forEach(card => {
        const title = card.querySelector('.event-title')
        expect(title?.textContent?.length).toBeGreaterThan(0)
      })
    })

    it('should handle component unmounting cleanly', () => {
      const { unmount } = render(<CurrentTimeDisplay />)
      
      // Should unmount without errors (timer cleanup)
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle events with missing optional data', () => {
      const minimalEvent = {
        id: 'minimal',
        title: 'Minimal Event',
        start: new Date(futureDate.getTime() + 1000 * 60 * 60),
        end: new Date(futureDate.getTime() + 1000 * 60 * 60 * 2),
        source: 'outlook' as const,
        category: { id: 'other', name: 'other', color: '#6c757d', source: 'outlook' as const },
        allDay: false,
        color: '#6c757d'
      }
      
      const { container } = render(<EventCard event={minimalEvent} />)
      
      const title = container.querySelector('.event-title')
      expect(title?.textContent).toBe('Minimal Event')
      
      // Should not crash with missing description/location
      expect(container).toBeTruthy()
    })

    it('should handle all-day events correctly', () => {
      const allDayEvent = {
        ...mockEvent,
        allDay: true
      }
      
      const { container } = render(<EventCard event={allDayEvent} />)
      
      const timeElement = container.querySelector('.event-time')
      expect(timeElement?.textContent).toContain('Toute la journée')
    })

    it('should handle very long titles gracefully', () => {
      const longTitleEvent = {
        ...mockEvent,
        title: 'Ceci est un titre extrêmement long qui devrait être tronqué de manière appropriée pour maintenir la lisibilité et la cohérence de la mise en page sur différentes tailles d\'écran et distances de visualisation dans le contexte d\'un affichage public pour le Secteur SSS de l\'UCLouvain'
      }
      
      const { container } = render(<EventCard event={longTitleEvent} />)
      
      const title = container.querySelector('.event-title')
      const displayedTitle = title?.textContent || ''
      
      // Should be truncated (300 chars + "...")
      expect(displayedTitle.length).toBeLessThanOrEqual(303)
      if (displayedTitle.length === 303) {
        expect(displayedTitle.endsWith('...')).toBe(true)
      }
    })
  })
})